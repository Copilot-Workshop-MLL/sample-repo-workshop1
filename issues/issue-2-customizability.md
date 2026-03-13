# [Feature] Pattern B: Improved Customizability for Pomodoro Timer

## Summary

Give users control over session duration, UI theme, and sound preferences so the timer adapts to individual work styles rather than enforcing a one-size-fits-all workflow.

---

## Motivation

The classic 25-minute Pomodoro interval doesn't work for everyone. Developers doing deep-focus work often prefer 45-minute blocks; students may prefer 15-minute bursts. Similarly, sound notifications and dark/light themes are basic expectations for any productivity tool used daily.

---

## Proposed Features

### 1. Flexible Time Settings
- Replace the fixed 25-minute session with a selector allowing: **15 / 25 / 35 / 45 minutes**
- Short-break and long-break durations adjust proportionally (default short = 20 % of session, long break = 40 %)
- A custom input (number field) lets users type any value from 1–90 minutes

**Acceptance criteria:**
- [ ] Preset buttons (15 / 25 / 35 / 45) are shown in the settings panel
- [ ] Custom input validates range 1–90 and shows an inline error otherwise
- [ ] Selected duration persists in `localStorage` across page reloads
- [ ] Changing duration while a session is running prompts a confirmation dialog before applying

---

### 2. Theme Switching (Light / Dark / Focus)
Three modes selectable via a toggle control in the header:

| Mode | Description |
|---|---|
| **Light** | Standard white background, high contrast |
| **Dark** | Dark gray / charcoal background, reduced eye strain |
| **Focus** | Minimal — only the timer circle and a muted background, all other UI hidden |

**Acceptance criteria:**
- [ ] Theme is applied via a `data-theme` attribute on `<body>` and CSS custom properties
- [ ] Focus mode hides navigation, settings panel, and statistics section
- [ ] Theme preference is persisted in `localStorage`
- [ ] System `prefers-color-scheme` is used as the default on first visit

---

### 3. Sound Settings
- **Toggle for each event type independently:**
  - Session start sound
  - Session end / break start sound
  - Tick sound (plays every minute or every 10 seconds — user's choice)
- All sounds are short, royalty-free audio clips bundled with the app (no CDN dependency)
- Master volume slider (0–100)

**Acceptance criteria:**
- [ ] Each toggle is independently controllable
- [ ] Volume slider applies to all sounds proportionally
- [ ] Sound settings persist in `localStorage`
- [ ] Sounds are pre-loaded (`<audio preload="auto">`) to avoid start-up delay

---

## Technical Notes

- Settings panel: slide-in drawer (CSS `transform: translateX`) — no dialog/modal
- Theme: CSS custom properties (`--bg`, `--text`, `--accent`) with three `:root[data-theme="..."]` blocks
- Audio: HTML5 `<audio>` elements, controlled via `play()` / `pause()` with volume property
- Storage key schema: `pomodoro.settings.duration`, `pomodoro.settings.theme`, `pomodoro.settings.sounds`

---

## Labels
`enhancement`, `settings`, `accessibility`, `frontend`

## Estimated Effort
Medium (2–3 days)
