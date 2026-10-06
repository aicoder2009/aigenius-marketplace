# Vault Drop

Give Claude Code a password without pasting it into the chat.

When a task needs a secret (an API token, a database password), Claude calls `request_secret`. A box opens above your prompt with a password field. You type the value, press Enter, and it goes straight into your macOS Keychain. Claude only receives a shell snippet that reads the secret inline when a command needs it. The value itself never enters the conversation.

## What you get

- **Secure input box above the prompt.** Shows what you type; the eye button (or Tab) masks it. Enter saves, ctrl+u clears, Cancel declines.
- **Keychain storage.** Each secret is a login Keychain item `claude-secret:<name>` under the account `claude-code`. The value is written through stdin, never on a command line.
- **Reveal card in chat.** The "saved" message draws as a card with the value masked and a 👁 button to reveal it. The value is drawn from the plugin's memory, not from anything the model reads.
- **Output redaction.** If a secret's value (4+ characters) shows up in any tool output or message, it is replaced with `[REDACTED:<name>]` before it is stored or sent to the model.
- **`forget_secret`** deletes a secret from the Keychain.

## Tools

| Tool | What it does |
| --- | --- |
| `mcp__vault-drop__request_secret` | `{ name, reason, overwrite? }`: shows the input box; reuses a stored secret unless `overwrite` is true |
| `mcp__vault-drop__forget_secret` | `{ name }`: deletes the Keychain item |

## Using a secret

Claude reads it inline, for example:

```bash
SECRET="$(security find-generic-password -a claude-code -s claude-secret:npm_token -w)" npm publish --//registry.npmjs.org/:_authToken="$SECRET"
```

In auto mode, allow these reads with a permission rule in `~/.claude/settings.json`:

```json
{ "permissions": { "allow": ["Bash(security find-generic-password -a claude-code:*)"] } }
```

## Requirements and limits

- macOS (uses the `security` CLI and the login Keychain).
- Claude Code with function-hook plugins (2.1.286 or later); the input box needs the desktop app or the terminal.
- Hiding the value from the model is not the same as hiding it from what Claude does with it: Claude can still run commands that use the secret, so only use it with tasks you trust.
- Redaction skips values shorter than 4 characters, to avoid blanking out ordinary text.

## License

MIT
