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

Started as a port of the `token-weather` example mod from Anthropic's Claude Code playground. I added the emoji forecast and the one-click handoff.
