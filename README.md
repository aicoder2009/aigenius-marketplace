# aigenius-marketplace

My personal [Claude Code](https://claude.com/claude-code) marketplace: the mods and skills I've built, a mod I remixed, and the config I run every day.

```
/plugin marketplace add aicoder2009/aigenius-marketplace
```

Then install any plugin:

```
/plugin install token-weather@aigenius-marketplace
```

## Plugins

| Plugin | Type | What it does |
| --- | --- | --- |
| [**token-weather**](plugins/token-weather) | Mod (UI band) | A live emoji forecast of your context window above the prompt (☀️ → 🌪️), with a one-click `/handoff` that moves you to a fresh context without losing the thread. |
| [**vault-drop**](plugins/vault-drop) | Mod (MCP tool + UI) | Claude asks for a secret through a masked field. The value goes straight into the macOS Keychain and is redacted from all output, so it never reaches the model. |
| [**lmk**](plugins/lmk) | Skill | `/lmk` (short for "let me know") gives a status report on any project: where you left off, the decision you were in the middle of, and where it's headed. Then it waits for you. |
| [**saas-landing-page**](plugins/saas-landing-page) | Skill | Designs, builds, and audits SaaS landing pages that convert without looking AI-generated. |

**Mods** are Claude Code function-hook plugins (TypeScript/TSX) that draw UI and hook into events. **Skills** are instruction packs Claude loads when the task matches.

### Why I built them

- **token-weather**: I kept hitting compaction mid-task. A glanceable forecast plus a clean handoff fixed that. It's my remix of the [`token-weather` mod](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/token-weather) by Anthropic's Claude Code DevRel team: I added the emoji forecast and the handoff flow.
- **vault-drop**: Pasting API tokens into chat felt wrong. Now secrets go to the Keychain and Claude only gets a shell snippet that reads them.
- **lmk**: I juggle several projects. `/lmk` rebuilds my context in under a minute.
- **saas-landing-page**: Every AI-built landing page looks the same. This skill encodes how to make one that doesn't.

## My config

[`config/CLAUDE.md`](config/CLAUDE.md) holds my global `~/.claude/CLAUDE.md`: command rules, stack defaults, code style, and a model-picker table that ranks models by cost, intelligence, and taste so Claude picks the right subagent model for each job.

## Also in my stack

Third-party plugins and skills I use daily. Install them from their upstream sources:

| What | Source | Install |
| --- | --- | --- |
| Caveman: token-compressed output, plus the `investigate-first` / `lean-build` / `surgical-patch` / `safe-refactor` / `verify-and-stop` workflow skills | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | `npx skills add JuliusBrussee/caveman` |
| Clerk auth skills | [clerk/skills](https://github.com/clerk/skills) | `npx skills add clerk/skills` |
| Remotion best practices | [remotion-dev/skills](https://github.com/remotion-dev/skills) | `npx skills add remotion-dev/skills` |
| Todoist CLI skill | [Doist/todoist-cli](https://github.com/Doist/todoist-cli) | `npm i -g @doist/todoist-cli` |
| graphify: turn any folder into a knowledge graph | [graphify](https://github.com/Graphify-Labs/graphify) | `uv tool install graphifyy` |
| Vercel plugin | [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | `/plugin install vercel@claude-plugins-official` |
| Paper design plugin | [paper-design/agent-plugins](https://github.com/paper-design/agent-plugins) | `/plugin marketplace add paper-design/agent-plugins` |

## Repo layout

```
.claude-plugin/marketplace.json   # marketplace catalog
plugins/
  token-weather/                  # mod: .claude-plugin/plugin.json + hooks/
  vault-drop/                     # mod: hooks/, types/, evals/
  lmk/skills/lmk/                 # skill: SKILL.md + digest.sh
  saas-landing-page/skills/...    # skill: SKILL.md
config/CLAUDE.md                  # my global Claude Code instructions
```

## Developing

Mods need Claude Code 2.1.286 or later, with function-hook plugins. To try a plugin from a clone:

```
claude --plugin-dir ./plugins/token-weather
```

Claude Code writes each mod's editor types into `.claude-plugin/types/` the first time the mod loads (gitignored). After that, `tsc -p plugins/<mod>` type-checks it and `claude plugin validate plugins/<mod>` checks it the way the engine will.

## License

[MIT](LICENSE) © Karthick Arun, except `token-weather`, which is Apache-2.0 (see its [NOTICE](plugins/token-weather/NOTICE)).
