import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { SecretRequest } from '../types'

// Secrets live in the macOS login Keychain under this account, one item per name.
const ACCOUNT = 'claude-code'
const SERVICE = (name: string) => `claude-secret:${name}`
const NAME = /^[A-Za-z0-9_.-]{1,64}$/
const NAMES_KEY = 'names'

const PENDING = { plugin: 'vault-drop', key: 'pending' } as const
const pending = atom(PENDING, null as SecretRequest | null)
const REVEALED = { plugin: 'vault-drop', key: 'revealed' } as const
const revealed = atom(REVEALED, [] as string[])
const SAVED = /^I saved the secret "([A-Za-z0-9_.-]{1,64})"\./

const usage = (name: string) =>
  `Stored in the macOS Keychain as "${SERVICE(name)}". You never see the value. ` +
  `Read it inline where it is needed, never echo, log or write it to a file, e.g.\n` +
  `  SECRET="$(security find-generic-password -a ${ACCOUNT} -s ${SERVICE(name)} -w)" some-command --password "$SECRET"\n` +
  `Any tool output containing the value is redacted before you read it.`

async function names($: { store: { get: (key: string) => Promise<unknown> } }) {
  return ((await $.store.get(NAMES_KEY)) as string[] | undefined) ?? []
}

export const register: Register = on => {
  // value -> name, for redaction. Rebuilt from the Keychain on every (re)load.
  const secrets = new Map<string, string>()
  // name -> value, only for the reveal button in the chat card; never sent to the model.
  const values = new Map<string, string>()

  const scrub = (v: unknown): unknown => {
    if (typeof v === 'string') {
      let out = v
      for (const [value, name] of secrets) out = out.split(value).join(`[REDACTED:${name}]`)
      return out
    }
    if (Array.isArray(v)) return v.map(scrub)
    if (v && typeof v === 'object')
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, scrub(x)]))
    return v
  }

  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'request_secret',
      description:
        'Ask the user for a password, API key or other secret through a masked field in the Claude Code UI. ' +
        'The value is saved to the macOS Keychain and is NEVER returned to you. This returns at once; ' +
        'end your turn and wait. When the user saves, you get a message with a shell snippet that reads ' +
        'the secret inline. Use this instead of asking the user to paste secrets in chat. ' +
        'Reuses an existing secret of the same name unless overwrite is true.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short id, e.g. github_token (letters, digits, _ . -)' },
          reason: { type: 'string', description: 'Shown to the user: what the secret is for' },
          overwrite: { type: 'boolean', description: 'Ask again even if already stored' },
        },
        required: ['name', 'reason'],
      },
    })
    await $.tool.register({
      name: 'forget_secret',
      description: 'Delete a secret previously stored with request_secret from the Keychain.',
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
    })

    for (const name of await names($)) {
      const got = await $.process.run(['security', 'find-generic-password', '-a', ACCOUNT, '-s', SERVICE(name), '-w'])
      const value = got.stdout.replace(/\n$/, '')
      if (got.exitCode !== 0 || !value) continue
      values.set(name, value)
      if (value.length >= 4) secrets.set(value, name)
    }

    return next(e)
  })

  on('tool.call', { tool: 'mcp__vault-drop__request_secret' }, async ($, e) => {
    const { name, reason, overwrite } = e as unknown as { name: string; reason: string; overwrite?: boolean }
    if (!NAME.test(name)) return { deny: 'name must be 1-64 of letters, digits, _ . -' }
    if ((await names($)).includes(name) && !overwrite) return { result: usage(name) }

    await $.state.set(PENDING, { name, reason })
    $.ui.status(`🔒 waiting for "${name}"`)

    return {
      result:
        `A secure input box is showing above the prompt, asking the user for "${name}". End your turn now and wait: ` +
        `a message arrives when they save or cancel. Do not ask them to paste it in chat.`,
    }
  })

  on('tool.call', { tool: 'mcp__vault-drop__forget_secret' }, async ($, e) => {
    const { name } = e as unknown as { name: string }
    if (!NAME.test(name)) return { deny: 'invalid name' }
    await $.process.run(['security', 'delete-generic-password', '-a', ACCOUNT, '-s', SERVICE(name)])
    await $.store.set(NAMES_KEY, (await names($)).filter(n => n !== name))
    for (const [value, n] of secrets) if (n === name) secrets.delete(value)
    values.delete(name)

    return { result: `Deleted "${name}".` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const req = await read($, pending)
    if (!req || (e.surface !== 'desktop' && e.surface !== 'terminal')) return next(e)
    const { Box, Text, Button, Client } = $.ui.resolve(e)

    const cancel = async () => {
      await $.state.set(PENDING, null)
      $.ui.status(undefined)
      await $.prompt.submit({ text: `I cancelled the secure input for "${req.name}".` })
    }

    return (
      <Box flexDirection="column" borderStyle="round" paddingX={2} paddingY={1} gap={1} width="100%">
        <Box justifyContent="space-between" alignItems="center">
          <Text bold>🔒 Claude needs "{req.name}"</Text>
          <Button key="cancel" label="Cancel" role="dismiss" onPress={cancel} />
        </Box>
        <Text dimColor>{req.reason}</Text>
        <Client key={`field-${req.name}`} module="./masked-field.tsx" props={{ name: req.name }} />
        <Text dimColor>Click the field to type · 🙈 or Tab hides it · ctrl+u clears · goes straight to your macOS Keychain, Claude never sees it</Text>
      </Box>
    )
  })

  on('ui.message', { component: 'AbovePrompt' }, async ($, e) => {
    const data = e.data as { type?: string; name?: string; value?: string }
    const req = await read($, pending)
    if (data.type !== 'submit' || !req || data.name !== req.name || typeof data.value !== 'string' || !data.value) return {}
    const { name } = req
    const value = data.value

    // Value goes in via stdin (twice: enter + retype), never on argv.
    const saved = await $.process.run(
      ['security', 'add-generic-password', '-U', '-a', ACCOUNT, '-s', SERVICE(name), '-l', `Claude Code: ${name}`, '-w'],
      { stdin: `${value}\n${value}\n` },
    )
    if (saved.exitCode !== 0) {
      $.ui.toast(`Keychain refused to store "${name}" (exit ${saved.exitCode})`)
      return {}
    }

    values.set(name, value)
    if (value.length >= 4) secrets.set(value, name)
    await update($, revealed, list => list.filter(n => n !== name))
    const known = await names($)
    if (!known.includes(name)) await $.store.set(NAMES_KEY, [...known, name])
    await $.state.set(PENDING, null)
    $.ui.status(undefined)
    $.ui.toast(`🔒 "${name}" saved to Keychain`)
    await $.prompt.submit({ text: `I saved the secret "${name}". ${usage(name)}` })

    return {}
  })

  // The "I saved the secret" row draws as a card: masked value, eye to reveal.
  // The value comes from this module, never from the message the model reads.
  on('ui.render', { component: 'UserMessage', props: { origin: { kind: 'plugin' } } }, async ($, e, next) => {
    const name = SAVED.exec(e.props.text)?.[1]
    if (!name || e.props.isExpanded || (e.surface !== 'desktop' && e.surface !== 'terminal')) return next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    const value = values.get(name)
    const isShown = value !== undefined && (await read($, revealed)).includes(name)
    const toggle = () =>
      update($, revealed, list => (list.includes(name) ? list.filter(n => n !== name) : [...list, name]))

    return (
      <Box flexDirection="column" borderStyle="round" paddingX={2} paddingY={1} gap={1}>
        <Text bold>🔒 Saved "{name}" to your Keychain</Text>
        {value === undefined ? (
          <Text dimColor>No longer stored.</Text>
        ) : (
          <Box gap={2} alignItems="center">
            <Text>{isShown ? value : '•'.repeat(Math.min([...value].length, 32))}</Text>
            <Button key={`eye-${name}`} label={isShown ? '🙈 Hide' : '👁 Click to reveal'} plain onPress={toggle} />
          </Box>
        )}
        <Text dimColor>Claude only got a reference to it, never the value.</Text>
      </Box>
    )
  })

  // Last line of defence: no stored row (tool output, prompt, anything) carries a secret's value.
  on('session.append', ($, e, next) => {
    if (secrets.size === 0) return next(e)
    const before = JSON.stringify(e.message.content)
    const content = scrub(e.message.content) as typeof e.message.content

    return JSON.stringify(content) === before ? next(e) : next({ ...e, message: { ...e.message, content } })
  })
}
