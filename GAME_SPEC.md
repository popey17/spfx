# Follow the Path — Game Specification

## Overview

**Follow the Path** is a SharePoint Framework (SPFx) web part that combines a vertical endless-runner arcade game with workplace scenario questions. Players guide a **Wreckoon** spaceship through scrolling obstacles, collect coins, and answer multiple-choice questions about responsible engineering and security practices.

The game is designed as **Game 1** in a larger quest platform. Progress, coins, and XP sync to SharePoint lists and contribute to cross-game player profiles.

---

## Core Concept

| Element | Description |
|--------|-------------|
| Genre | Vertical endless runner + educational quiz |
| Player character | Wreckoon spaceship (fixed horizontal position, moves up/down) |
| World | Side-scrolling space background; obstacles and collectibles enter from the right |
| Learning goal | Reinforce correct decisions in DevOps, security, change management, and process compliance scenarios |
| Platform | SharePoint Online (client-side web part) |

---

## Game Modes

### Campaign Mode (default)

Available to all registered players. Used for first-time play and ongoing progress.

- Each session **always starts at Level 1 (Easy)** with 3 lives and base game speed.
- Players progress through **3 levels** in a single session: Easy → Medium → Hard.
- Each level contains **4 scenario questions** (12 total across the campaign).
- Correct answers are tracked permanently in **earned question slots**. XP is only awarded the first time a question is answered correctly.
- Completing all 4 questions in a level triggers a **level complete** screen and advances to the next level.
- After all 12 questions are earned, **Free Mode** unlocks.

### Free Mode (replay)

Unlocked when the player has correctly answered all 12 campaign questions (or when `FTPFreeMode` is set in SharePoint).

- Welcome screen shows a **difficulty picker**: Easy, Intermediate, Advanced.
- Difficulty affects scroll speed multiplier only (1×, 1.35×, 1.75×).
- Questions replay at the chosen difficulty level.
- **No XP is earned** in free mode sessions.
- Coins and high score still count.
- After completing a level in free mode, the player returns to the main menu.

---

## How to Play

### Controls

| Input | Action |
|-------|--------|
| ↑ / ↓ arrow keys | Move spaceship up / down |
| W / S keys | Move spaceship up / down (alternate) |
| P | Pause / resume |
| Esc | Resume from pause (or cancel confirm dialog) |
| Enter / Space | Confirm focused menu button or selected answer |
| Arrow keys / Tab | Navigate menu buttons and answer choices |
| Click / tap | Interact with buttons, pause, and on-screen touch controls |
| On-screen ↑↓ buttons | Touch controls (auto-enabled on mobile/touch devices) |

### Objective

1. **Survive** — avoid obstacles. You start with **3 lives**.
2. **Collect coins** — each coin adds **1** to your score.
3. **Answer questions** — a question appears automatically every **15 seconds** while unanswered questions remain in the current level.
4. **Complete levels** — answer all 4 questions in a level to advance.
5. **Maximize score** — coins collected during a run contribute to your high score and persistent coin total.

### Movement & World

- The spaceship stays at a fixed X position on the left; the world scrolls toward the player.
- Playable area is the full canvas height minus the top HUD bar.
- The ship has a subtle idle float animation.
- Base scroll speed increases as questions are answered (see Difficulty Scaling).

---

## Gameplay Mechanics

### Lives & Collisions

| Parameter | Value |
|-----------|-------|
| Starting lives | 3 |
| Lives restored | Full 3 lives when advancing to the next level |
| Collision hitbox | 72% of rendered sprite size (tighter than visual) |
| Ghost mode after hit | 3 seconds of invulnerability (ship pulses semi-transparent) |

**On obstacle collision:**

1. Explosion visual and sound play.
2. If **Power Shield** is active → shield is consumed, no life lost, correct-answer sound plays.
3. Otherwise → lose 1 life, enter ghost mode.
4. At 0 lives → game over; progress is saved.

During ghost mode, obstacle collisions are ignored (unless cheat god mode is active).

### Collectibles

#### Coins

- Spawn at random Y positions every **500–1200 ms**.
- Worth **1 point** each.
- Collected on proximity collision.
- Persist to the player's **TotalCoin** balance in SharePoint when progress is saved.

#### Power Shield (pickup)

- Spawns every **10–20 seconds** (random interval) at a non-overlapping position.
- Displayed as a shield icon scrolling with the world.
- On collection: grants one **Power Shield** charge.
- Active shield is shown as an aura around the ship.
- Absorbs exactly **one** obstacle hit, then is consumed.

### Obstacles

- Five obstacle sprite variants, randomly chosen.
- Normal spawn interval: **800–1800 ms**.
- **Wrong answer penalty**: after an incorrect answer, obstacles spawn faster (**500–1000 ms**) until the next correct answer clears the penalty.
- Obstacles are removed on collision (whether or not the player is hurt).

### Questions

| Parameter | Value |
|-----------|-------|
| Trigger interval | Every 15 seconds during active play |
| Questions per level | 4 |
| Total campaign questions | 12 (3 levels × 4) |
| Answer format | 2 multiple-choice options |
| Selection | Random among unanswered questions in the current level |
| Feedback duration | 600 ms (green = correct, red = wrong) |
| Post-answer flow | 3-second countdown, then resume play |

**Correct answer:**

- Marks the question as answered for the current level.
- Awards the question slot in campaign mode (if not previously earned).
- Clears obstacle spawn penalty.
- Increases game speed (see below).
- If all 4 level questions are answered → level complete screen.

**Wrong answer:**

- Does not mark the question as answered (it can appear again).
- Increases obstacle spawn rate (penalty).
- Increases game speed.
- Alarm sound plays.

Question content covers workplace scenarios (configuration changes, access control, CI/CD, security scans, production incidents, process compliance). Questions load from the **Game1Questions** SharePoint list; built-in defaults in `gameConfig.ts` are used if the list is missing or invalid.

### Difficulty Scaling (in-run)

| Trigger | Effect |
|---------|--------|
| Each answered question (correct or wrong) | Speed +0.25×, capped at 2× |
| Campaign start | 1× |
| Free mode Easy | 1× |
| Free mode Intermediate | 1.35× |
| Free mode Advanced | 1.75× |

Speed affects scroll rate, entity movement, and spawn timing.

### Game States

```
waiting → levelIntro → playing ⇄ paused
                    ↓
              question → countdown → playing
                    ↓
            levelComplete → (next level | main menu)
                    ↓
               gameover → main menu
```

| State | Description |
|-------|-------------|
| `waiting` | Main menu (welcome screen) |
| `levelIntro` | 2.5 s level name + control hints |
| `playing` | Active gameplay |
| `paused` | Pause overlay (Resume / Main Menu) |
| `question` | Scenario question popup |
| `countdown` | 3-2-1 overlay before resuming |
| `levelComplete` | Congratulations + rewards |
| `gameover` | Score summary + retry / menu |

### Pause & Main Menu

- **P** or pause button → pause gameplay and music.
- Resume returns via 3-second countdown.
- Main Menu shows a confirmation dialog; leaving saves progress.
- Progress also saves on game over and level transitions.

---

## Progression & Rewards

### Levels

| Level | Display Name | Questions | Level XP (first completion) |
|-------|--------------|-----------|----------------------------|
| 1 | Easy | 4 | 100 XP |
| 2 | Medium | 4 | 150 XP |
| 3 | Hard | 4 | 200 XP |

**Maximum campaign XP from this game: 450 XP** (100 + 150 + 200).

XP is granted **once per level** when all 4 questions in that level are first completed correctly across all sessions—not per individual question.

### Earned Question Slots

- 12 boolean slots (one per question, ordered by level then sort order).
- Persisted as JSON in `FollowThePath_EarnedQuestions` (Game1Data list).
- Determines campaign progress level and which questions have already granted credit.
- Merged with server state on save (OR logic—progress is never lost).

### Coins & High Score

| Metric | Storage | Notes |
|--------|---------|-------|
| Session score | In-memory | Coins collected during current run |
| High score | `FollowThePath_HighScore` | Best single-run score |
| Total coins | `TotalCoin` on Users list | Cumulative across all games |

Coins are saved incrementally during a session (delta since last save).

### Free Mode Unlock

Automatic when all 12 earned question slots are `true`, or when `FTPFreeMode` is set on the player's Game1Data row.

---

## Player Account & Registration

### Access Flow

1. Web part loads player session from SharePoint (**Users** + **Game1Data** lists).
2. Email resolved from: `?email=` URL param → signed-in SharePoint user → debug `?user=` override.
3. If the user is not registered → redirect to **Register.aspx** with email preserved.
4. `?noredirect` skips registration redirect (local dev / workbench).
5. Questions load from **Game1Questions** list (falls back to built-in defaults).

### SharePoint Data Model

**Users list** (profile + cross-game totals):

- Title, Email, LOBT, Market
- TotalCoin, TotalXP (calculated/read-only), MiniQuestXP, MasteryQuestXP
- Game1Level1XP, Game1Level2XP, Game1Level3XP
- Game2Level1XP, Game2Level2XP, Game2Level3XP

**Game1Data list** (Follow the Path progress):

- Email (links to Users)
- FollowThePath_HighScore
- FollowThePath_Level (current progress level, text)
- FollowThePath_LevelXp (total XP earned from this game)
- FollowThePath_EarnedQuestions (JSON array of 12 booleans)
- FTPFreeMode (boolean)

**Game1Questions list**:

- Level (1–3), SortOrder (1–4), Scenario, Prompt, Option1, Option2, CorrectIndex (0 or 1)

---

## UI & HUD

### Heads-Up Display (during play)

- **Lives left** — heart icons (filled = remaining, outline = lost)
- **Level** — e.g. `LEVEL 1: EASY`
- **Score** — coin icon + numeric count
- **Pause button** — top-right

### Menus

- **Welcome** — title, description, best score, Start button; free mode adds difficulty picker
- **Question** — shield branding, scenario text, prompt, two answer buttons
- **Level complete** — star, congratulations, coins earned this level, XP earned, Proceed / Play Again
- **Game over** — final score, best score, Try Again / Main Menu
- **Pause** — Resume, Main Menu (with confirmation)

### Audio

| Track | When |
|-------|------|
| Menu music | Welcome screen |
| Game music (rotates) | During play |
| Coin | Coin collected |
| Correct | Correct answer or shield absorbed hit |
| Alarm | Wrong answer |
| Crush | Obstacle hit (life lost) |
| Game over | All lives lost |

Music volume: 35%. SFX volume: 70%. Audio requires user interaction to unlock (browser policy).

---

## Question Content Summary

All 12 questions are workplace compliance / DevOps scenarios. Topics by level:

**Level 1 — Easy:** proactive monitoring, password sharing, excess access removal, alert investigation.

**Level 2 — Medium:** change request scope, CI/CD vs manual deploy, vulnerability remediation, release traceability.

**Level 3 — Hard:** cross-team incident response, hidden safeguards, process bypass culture, urgent access escalation.

Each question presents a scenario paragraph and the prompt **"WHAT DO YOU DO?"** or **"WHAT SHOULD YOU DO?"** with two answer choices.

---

## Technical Notes

- **Canvas resolution:** 1920×1080 design space, scaled to container.
- **Framework:** SPFx 1.20, TypeScript, HTML Canvas 2D.
- **Main game class:** `EndlessRunnerGame`
- **Configuration:** `gameConfig.ts` (tuning constants, default questions, UI layout).
- **Progress services:** `SharePointPlayerProgressService` (production), `InMemoryPlayerProgressService` (workbench fallback).

### Debug / QA Flags (`gameConfig.ts`)

| Flag | Purpose |
|------|---------|
| `DEBUG_SKIP_USER_CHECK` | Skip registration, use in-memory progress |
| `DEBUG_FORCE_FREE_MODE` | Force free mode on welcome screen |
| `DEBUG_ALLOW_URL_USER_OVERRIDE` | Allow `?user=email` for testing |
| `DEBUG_SPAWN_SHIELD_FIRST` | Spawn shield immediately |
| `DEBUG_AUTO_COLLECT_SHIELDS` | Auto-grant shields |
| `DEBUG_SHOW_LEVEL_COMPLETE_AT_START` | Show level complete screen on start |

### Hidden Cheat Codes (entered while paused)

| Code | Effect |
|------|--------|
| `iamagod` | Invincibility (obstacles explode, no damage) |
| `iamrich` | Coin magnet |
| `turbo` | 4× speed multiplier |
| `pizzaparty` | Coins appear as pizza; confetti on resume |
| `ihavesinned` | Clear all active cheats |

---

## Win & Loss Conditions

| Outcome | Condition | Result |
|---------|-----------|--------|
| **Level complete** | Answer all 4 questions in current level | Rewards screen → next level or main menu |
| **Campaign complete** | Finish level 3 in campaign | Free mode unlocks → main menu |
| **Game over** | Lives reach 0 | Save progress → game over screen |
| **Free play session end** | Complete a level in free mode | Return to main menu |

There is no traditional "ending" in free mode—players can replay indefinitely at chosen difficulty.

---

## Summary Game Loop

```
Register (if needed) → Welcome Menu → Start
    → Level Intro → Play (dodge, collect, survive)
        → Question every 15s → Answer → Countdown → Play
        → (optional) Collect Power Shield
    → Level Complete (coins + XP) → Next Level
    → Repeat until Level 3 done or lives lost
    → Save to SharePoint → Menu or Game Over
    → (when all 12 questions earned) Free Mode unlocked
```
