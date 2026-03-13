# [Feature] Pattern C: Gamification Elements for Pomodoro Timer

## Summary

Add an experience point (XP) system, achievement badges, and weekly/monthly statistics graphs to reward consistent focus habits and encourage daily engagement with the timer.

---

## Motivation

Habit formation is hard. A gamification layer gives users concrete feedback on their progress, creates milestone moments worth celebrating, and surfaces trends (like "I do my best work on Tuesday mornings") that help users improve their routines.

---

## Proposed Features

### 1. Experience Point (XP) & Level System
- Each completed Pomodoro session earns XP based on session length:

| Duration | XP Earned |
|---|---|
| 15 min | 10 XP |
| 25 min | 20 XP |
| 35 min | 30 XP |
| 45 min | 45 XP |

- XP accumulates to unlock levels. Level thresholds follow a linear curve:  
  `xpRequiredForLevel(n) = 100 * n`
- A level-up animation plays when a threshold is crossed (confetti burst, ~1.5 s)
- Current level and XP bar are shown in the header

**Acceptance criteria:**
- [ ] XP is awarded only when a session is completed (not skipped/reset)
- [ ] XP and level are persisted in `localStorage`
- [ ] Level-up animation respects `prefers-reduced-motion`
- [ ] XP bar visually fills toward the next level threshold

---

### 2. Achievement Badges
A set of unlockable badges displayed in a dedicated "Achievements" panel:

| Badge | Trigger |
|---|---|
| 🍅 First Focus | Complete your first Pomodoro |
| 🔥 On a Roll | Complete 3 Pomodoros in a single day |
| 📅 Consistent | Complete at least 1 Pomodoro on 3 consecutive days |
| 🏆 Weekly Hero | Complete 10 Pomodoros in a single week |
| 🌙 Night Owl | Complete a session between 22:00 – 04:00 |
| ⚡ Speed Run | Use the 15-minute timer 5 times |
| 🗓️ Monthly Master | Complete 40 Pomodoros in a calendar month |

**Acceptance criteria:**
- [ ] Unlocked badges show full color; locked badges are greyscale with a lock icon
- [ ] A toast notification appears when a badge is unlocked for the first time
- [ ] Badge unlock state persists in `localStorage`
- [ ] Achievement panel is accessible via a trophy icon button in the header

---

### 3. Weekly / Monthly Statistics
A statistics panel with interactive charts showing focus trends:

**Weekly view:**
- Bar chart: Pomodoros completed per day (last 7 days)
- Streak counter: current consecutive active days
- Best day: day of the week with the most completions (last 4 weeks)

**Monthly view:**
- Heatmap calendar (GitHub contribution-style): one cell per day, darker = more sessions
- Total XP earned this month
- Total focused minutes this month

**Acceptance criteria:**
- [ ] Charts are rendered with a lightweight library (e.g. Chart.js < 65 kB) or pure SVG
- [ ] Data is derived from a session history array stored in `localStorage`
- [ ] Statistics panel is responsive (works at 320 px viewport width)
- [ ] "Clear history" button with a confirmation dialog is available in the panel

---

## Technical Notes

- Session history schema:
  ```json
  { "completedAt": "2026-03-13T09:00:00Z", "duration": 25, "xpEarned": 20 }
  ```
- Badge evaluation: run `checkAchievements(history)` after every session completion
- XP store: `{ level: 3, xp: 240, totalXp: 540 }`
- Heatmap: CSS Grid with `background-color` intensity mapped to `Math.log(count + 1)`

---

## Labels
`enhancement`, `gamification`, `data`, `frontend`

## Estimated Effort
Large (4–5 days)
