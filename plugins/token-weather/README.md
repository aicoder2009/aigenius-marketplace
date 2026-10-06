# Token Weather

A live forecast of your context window, drawn as a band above the prompt.

```
☀️ Clear  18% of context  36k / 200k   last turns ▁▂▂▃▃▄   ⇄ Handoff
```

| Fill | Forecast |
| --- | --- |
| < 25% | ☀️ Clear |
| < 50% | ☁️ Cloudy |
| < 75% | 🌧️ Showers |
| < 90% | ⛈️ Storm |
| ≥ 90% | 🌪️ Compact soon |

The sparkline (on wide terminals) shows the last 12 turns. Past 50% it recommends a handoff.

## `/handoff`

Run `/handoff` (or press the **⇄ Handoff** button in the band, hotkey `h`) and Claude writes a self-contained handoff note. The mod then runs `/clear`, pastes the note into the fresh context, and carries on. You keep the thread without dragging a full context window along.

## Credits

- **Original mod:** [`token-weather`](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/token-weather) by the Claude Code DevRel team at Anthropic, from the [Claude Code playground](https://github.com/anthropics/claude-code-playground). It came up with the forecast band, the fill reading and the turn chart.
- **Remix:** [Karthick Arun](https://github.com/aicoder2009). I rewrote it in TypeScript, switched to emoji forecast icons, and added `/handoff` with the one-click **⇄ Handoff** button.

## License

[Apache License 2.0](LICENSE), the same license as the original. See [NOTICE](NOTICE) for attribution and a list of changes. (The rest of this marketplace is MIT.)
