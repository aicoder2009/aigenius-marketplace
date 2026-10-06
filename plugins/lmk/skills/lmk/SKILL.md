---
name: lmk
description: Catch the user up on a project — where we left off, what they were in the middle of deciding, and where it's headed — then hand them a written status report with open questions and wait for their reply. Use when the user types /lmk, or asks "where were we", "where did we leave off", "catch me up", "what was I doing on this".
---

# /lmk — "let me know where we're at"

Goal: in under a minute of reading, the user knows (1) where we left off, (2) what open decision they were mid-way through, (3) where the project is headed. Deliver it as a report and stop — no interview tool, no jumping into work.

If args are given (e.g. `/lmk auth refactor`), focus the recap on that topic.

## 1. Gather context (silently, in parallel)

Don't narrate each step. Run these together and skip any that don't apply:

- **Past sessions** (richest source): `bash <this skill's base directory>/digest.sh "$PWD" 3` (needs `jq`) — prints the last 3 Claude Code sessions for this project: user prompts + Claude's replies, most recent last. The tail of the newest session is "where we left off". Look for questions Claude asked that never got an answer, options presented, "Not done:" lists, and "do you want me to…" offers.
- **Git**: `git status -sb`, `git log --oneline -15`, `git branch --sort=-committerdate | head -5`, `git stash list`, and `git diff --stat` (plus unpushed: `git log @{u}..  --oneline 2>/dev/null`). Uncommitted work = mid-task.
- **Open PRs** (if `gh` works): `gh pr list --author @me --limit 5`.
- **Project notes**: CLAUDE.md, README, and any of TODO*, ROADMAP*, PLAN*, NOTES*, docs/plans/, `.claude/plans/` — skim only for goals and next steps.
- **Memory**: the project's memory dir `~/.claude/projects/<slug>/memory/` (MEMORY.md + relevant files) for goals and earlier decisions.
- **Code TODOs** in recently changed files only: `git diff --name-only HEAD~5 | xargs grep -n "TODO\|FIXME" 2>/dev/null | head`.

If nothing turns up (no git, no sessions), say so in one line and ask what the project is about in the report's questions section.

## 2. Write the report — then STOP

Deliver a written status report as plain text. Do **not** call AskUserQuestion, do **not** start any work, and do **not** jump to a next step. End your turn after the report and let the user read it and reply.

Write it like a short briefing a teammate would hand you: complete sentences, a little narrative, scannable headings. Use this shape:

```
# <Project name> — status report
_As of <today>. Last activity: <relative + absolute, e.g. "2 days ago, Oct 3">._

## Where we left off
<A short paragraph on the last thing done and why, then the concrete state: branch, uncommitted work, unpushed commits, open PRs. Cite commits/files/PRs briefly.>

## What you were in the middle of deciding
<For each open decision: the question, the options that were on the table, the tradeoffs, and which way you or Claude were leaning. If none: "Nothing was left hanging.">

## Where it's headed
<The goal and next milestones, from notes, plans, memory, or the session trail.>

## Loose ends
<Only if any: unpushed commits, failing checks, stashes, half-done items. Omit otherwise.>

## Questions for you
<2–4 numbered, project-specific questions that would unblock the next move — the open decisions first (with your recommendation), then what to tackle next. Never generic like "What would you like to do?".>
```

Rules:
- Ground every claim in what you found. Don't invent goals — if direction is unclear, say so and make it one of the questions.
- If the trail is old (>2 weeks), flag that things may have moved on.

## 3. After the user replies

Only once the user answers:
- Confirm the plan in one or two lines, then do it.
- Follow the user's normal rules: ask before big refactors/multi-file rewrites, don't run dev servers or builds, don't push or merge without a clear yes.
- If a decision was made, offer to save it to project memory so the next `/lmk` picks it up.
