# Personal Preferences

## Commands
- Don't run dev server commands (e.g., `npm run dev`) — assume it's already running.
- Don't run build commands unless specifically told to.
- Focus on checking commands like `npm run typecheck`, `npm run lint`, `npm run test:run`, etc.

## Package Managers
- Default to npm. My projects use npm (package-lock.json) — don't introduce pnpm, bun, or yarn.

## Tech Stack Preferences
When uncertain, prefer: Next.js, React, TypeScript, Tailwind, shadcn/Radix, Clerk, Zod, PostHog, AWS (Amplify/DynamoDB), Vitest.

## Code Style
- Always strive for concise, simple solutions.
- If a problem can be solved in a simpler way, propose it.

## General preferences
- If asked to do too much work at once, stop and state that clearly.
- Ask before big changes: large refactors, multi-file rewrites, deleting code, or changing architecture — propose first, then proceed on approval.

## Picking the right models for workflows and subagents

Rankings, higher = better. Cost is what I pay (higher = cheaper). Intelligence is how hard a problem you can hand the model unsupervised. Taste covers UI/UX, code quality, API design, and copy.

| model     | cost | intelligence | taste |
|-----------|------|--------------|-------|
| haiku-4.5 | 9    | 4            | 4     |
| sonnet-5  | 6    | 6            | 7     |
| opus-4.8  | 4    | 8            | 8     |
| fable-5   | 2    | 9            | 9     |

How to apply:
- These are defaults, not limits. If a cheaper model's output doesn't meet the bar, rerun the work with a smarter model without asking. Judge the output, not the price tag.
- Cost is a tie-breaker only; when axes conflict for anything that ships, intelligence > taste > cost.
- Bulk/mechanical work (clear-spec implementation, renames, migrations, big searches): haiku-4.5 or sonnet-5.
- Anything user-facing (UI, copy, API design) needs taste ≥ 7.
- Reviews of plans/implementations: fable-5 or opus-4.8 as an independent perspective.
- Mechanics: set the model via the Agent/Workflow `model` parameter (e.g. `{model: 'haiku'}` on subagents).
# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.
