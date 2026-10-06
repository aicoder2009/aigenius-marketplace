# lmk — "let me know where we're at"

Type `/lmk` (or ask "where were we?") and Claude hands you a short status report for the current project:

- **Where we left off**: last work, branch, uncommitted changes, open PRs
- **What you were deciding**: open questions and the options on the table
- **Where it's headed**: goals and next milestones
- **Questions for you**: 2–4 specific questions to unblock the next move

Then it stops and waits for you to reply. It won't start any work until you do.

It reads your past Claude Code sessions for the project (via `digest.sh`), git state, open PRs, project notes, and memory. `/lmk <topic>` narrows the recap to one topic.

**Requires:** `jq`; `gh` is optional, for PRs.
