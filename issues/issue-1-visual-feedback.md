# [Feature] Pattern A: Enhanced Visual Feedback for Pomodoro Timer

## Summary

Improve the Pomodoro timer's visual experience with animated, color-coded feedback that keeps the user aware of how much focus time remains — without them needing to read the clock.

---

## Motivation

The current timer only shows a numeric countdown. Users lose focus awareness between glances. Rich visual cues (a shrinking ring, a warming color palette, ambient animation) communicate urgency at a glance and make the focus session feel more intentional.

---

## Proposed Features

### 1. Circular Progress Bar Animation
- Replace (or supplement) the static countdown display with an SVG `<circle>` stroke-dashoffset animation
- The ring smoothly decreases from full (100 %) to empty (0 %) over the session duration
- Animation is driven by CSS or `requestAnimationFrame` so it stays smooth even when the tab is backgrounded

**Acceptance criteria:**
- [ ] Progress ring is visible and centered around the timer digits
- [ ] Ring decreases proportionally to `remainingTime / totalTime`
- [ ] Animation is smooth (no visible jumps between ticks)
- [ ] Ring resets instantly when a new session starts

---

### 2. Color Transition (Blue → Yellow → Red)
- The ring and/or background tint transitions through a defined color ramp as time passes:

| Phase | Time Remaining | Color |
|---|---|---|
| Start | 100 – 60 % | Blue `#3b82f6` |
| Mid | 60 – 30 % | Yellow `#f59e0b` |
| End | 30 – 0 % | Red `#ef4444` |

- Transition is a smooth CSS linear-gradient or HSL interpolation — no hard cuts

**Acceptance criteria:**
- [ ] Color changes continuously, not only at phase boundaries
- [ ] Works in both light and dark themes
- [ ] Color logic is encapsulated in a single utility function (`getTimerColor(elapsed, total)`)

---

### 3. Background Ambient Effects
- During an active focus session, show subtle animated particles or a ripple pulse originating from the timer circle
- Effect pauses automatically when the timer is paused, stops on reset
- Effect intensity is low enough not to distract (opacity ≤ 0.15 at rest, ≤ 0.30 during final 20 %)

**Acceptance criteria:**
- [ ] Effect is CSS/Canvas-based (no heavy library required)
- [ ] Effect is disabled when `prefers-reduced-motion: reduce` is set
- [ ] Effect does not run during break sessions

---

## Technical Notes

- SVG ring: `strokeDasharray = circumference`, `strokeDashoffset = circumference * (1 - progress)`
- Color interpolation: `lerpColor(startHex, endHex, t)` where `t` = `elapsed / total`
- Particle system: lightweight Canvas 2D, ~20 particles max, pooled for GC efficiency

---

## Labels
`enhancement`, `ui/ux`, `frontend`

## Estimated Effort
Medium (2–3 days)
