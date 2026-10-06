// Copyright 2026 Anthropic PBC
// Copyright 2026 Karthick Arun (modifications)
// SPDX-License-Identifier: Apache-2.0
//
// Token Weather: a live forecast of the context window, above the prompt.
// Port of anthropics/claude-code-playground mods/token-weather, with emoji icons.
import type { EngineInterface as Engine, Register } from 'claude-code'

const HISTORY = 12
const BARS = '▁▂▃▄▅▆▇█'

// Forecast bands, by percent of the window used.
const FORECAST = [
  { upTo: 25, icon: '☀️', word: 'Clear', color: 'warning' },
  { upTo: 50, icon: '☁️', word: 'Cloudy', color: 'cyan' },
  { upTo: 75, icon: '🌧️', word: 'Showers', color: 'blue' },
  { upTo: 90, icon: '⛈️', word: 'Storm', color: 'magenta' },
  { upTo: Infinity, icon: '🌪️', word: 'Compact soon', color: 'red' },
] as const

const RECOMMEND_AT = 50

const HANDOFF_REQUEST =
  'Write a handoff for a fresh instance of yourself that will continue this conversation with an empty context. ' +
  'It will know nothing except what you write, so carry over every fact, name, number, preference and constraint the user stated, verbatim where it matters. ' +
  'Include: the goal, what is done, what is in progress, key decisions and why, relevant file paths and commands, ' +
  'open questions, and the exact next steps. Skip CLAUDE.md instructions and memories: they reload on their own. ' +
  'Be self-contained and concise. Reply with only the handoff, no preamble.'

type Reading = { tokens: number; window: number; percent: number }

// Oldest first.
let readings: Reading[] = []

// idle -> writing (waiting for the handoff reply) -> idle once cleared and resumed.
let phase: 'idle' | 'writing' = 'idle'
let hasRecommended = false

async function startHandoff($: Engine) {
  if (phase !== 'idle') return
  phase = 'writing'
  $.ui.invalidate('ui.render')
  try {
    await $.prompt.submit({ text: HANDOFF_REQUEST, asUser: true })
  } catch {
    phase = 'idle'
    $.ui.invalidate('ui.render')
  }
}

async function finishHandoff($: Engine) {
  const messages = await $.session.messages()
  const handoff = Array.isArray(messages)
    ? messages.filter(m => m.role === 'assistant' && m.text).at(-1)?.text
    : undefined
  if (!handoff) {
    phase = 'idle'
    $.ui.toast('Handoff failed: no reply to carry over')
    $.ui.invalidate('ui.render')
    return
  }
  // Leave the turn.complete hook before clearing, so /clear isn't run inside a turn it waits on.
  $.clock.after(0, async () => {
    try {
      await $.command.run({ command: 'clear' })
      await registerCommand($)
      readings = []
      hasRecommended = false
      await $.prompt.submit({
        text: `Handoff from the previous context. Continue from here:\n\n${handoff}`,
        asUser: true,
      })
    } catch {
      $.ui.toast('Handoff: /clear failed')
    } finally {
      phase = 'idle'
      $.ui.invalidate('ui.render')
    }
  })
}

// /handoff runs the same flow as the band's button.
async function registerCommand($: Engine) {
  await $.command.register({ name: 'handoff', description: 'Hand off to a fresh context: write a handoff, /clear, paste it, continue' })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    readings = []
    await registerCommand($)
    await takeReading($)
    return result
  })

  on('command.run', { command: 'handoff' }, $ => {
    if (phase !== 'idle') return { text: 'A handoff is already in progress.' }
    // Not awaited: the prompt queues behind this command and runs once the session is idle.
    void startHandoff($)
    return { text: 'Writing a handoff, then clearing context…' }
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!e.agentId) {
      if (phase === 'writing') await finishHandoff($)
      else await takeReading($)
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    const now = readings.at(-1)
    if (e.props.hasSurvey || !now) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const f = forecastFor(now.percent)
    const trend = trendWord()
    const recommend = now.percent >= RECOMMEND_AT
    const wide = (e.props.bodyColumns ?? 80) >= 60

    return (
      <Box flexDirection="row" paddingX={1}>
        <Text color={f.color} bold>{`${f.icon} ${f.word}`}</Text>
        <Text>{`  ${now.percent}% of context`}</Text>
        <Text dimColor>{`  ${short(now.tokens)} / ${short(now.window)}`}</Text>
        {wide && <Text dimColor>{'   last turns '}</Text>}
        {wide && <Text color={f.color}>{chart()}</Text>}
        {wide && trend && <Text dimColor>{`  ${trend}`}</Text>}
        <Text>{'  '}</Text>
        {phase === 'writing' ? (
          <Text dimColor>writing handoff…</Text>
        ) : e.props.isWorking ? null : (
          <Button key="handoff" hotkey="h" label={recommend ? '⇄ Handoff (recommended)' : '⇄ Handoff'} onPress={() => startHandoff($)} />
        )}
      </Box>
    )
  })
}

async function takeReading($: Engine) {
  try {
    const { context } = await $.session.usage()
    if (!context?.window) return
    const tokens = context.tokens ?? 0
    const percent = Math.round(context.percent ?? (tokens / context.window) * 100)
    // The session.start reading is 0 before any response; drop it once real readings arrive.
    readings = readings.filter(r => r.tokens > 0)
    readings.push({ tokens, window: context.window, percent })
    readings = readings.slice(-HISTORY)
    if (percent >= RECOMMEND_AT && !hasRecommended) {
      hasRecommended = true
      $.ui.toast(`Context is ${percent}% full: consider a handoff (press the Handoff button)`)
    }
    $.ui.invalidate('ui.render')
  } catch {
    // No reading this turn; the band keeps the last one.
  }
}

function forecastFor(percent: number) {
  return FORECAST.find(b => percent < b.upTo) ?? FORECAST[4]
}

// Bars scale to the busiest reading shown, so growth shows at any fill level.
function chart() {
  const top = Math.max(...readings.map(r => r.tokens), 1)
  return readings
    .map(r => BARS[Math.min(BARS.length - 1, Math.floor((r.tokens / top) * (BARS.length - 1)))])
    .join('')
}

function trendWord() {
  if (readings.length < 2) return ''
  const delta = (readings.at(-1)?.tokens ?? 0) - (readings.at(-2)?.tokens ?? 0)
  if (delta > 0) return `▲ +${short(delta)} last turn`
  if (delta < 0) return `▼ ${short(-delta)} last turn`
  return 'steady'
}

function short(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`
  return String(n)
}
