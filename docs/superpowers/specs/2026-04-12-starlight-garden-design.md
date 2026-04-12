# Starlight Garden - Design Specification

## Overview

Starlight Garden is a touchscreen game for a 4.5-year-old girl. The player builds a magical garden on a floating planet in space by planting glowing plants, watering them with shooting stars, attracting baby space animals, and decorating everything with earned rewards. The target moment is "Dad, look what I made!"

## Core Design Principles

- **No reading:** 100% visual and audio communication. Zero text in gameplay.
- **No fail state:** Everything the player does makes the planet more beautiful. There is no way to lose.
- **Touch-first:** Designed for iPad/tablet touchscreen. Big tap targets (60px+, preferably 80px+).
- **Pure delight:** Every interaction produces visual sparkles, particles, and synthesized sounds.
- **Persistence:** The garden auto-saves after every action. Progress is never lost.

## Target Platform

- Touchscreen tablet (iPad primary)
- Touch events as primary input, mouse fallback for desktop testing
- Vanilla HTML/CSS/JS, zero dependencies
- Architecture wrapping-friendly for eventual Capacitor conversion to native iOS/Android

## Gameplay Loop

### 1. Title Screen
- Visual-only title screen with glowing garden planet and twinkling stars
- Tap anywhere to begin
- Zoom transition animation into the planet

### 2. Planting
- Bottom tray shows 5 plant types as colorful icons (80px+ tap targets)
- Tap a plant icon to select it, then tap the planet surface to plant a sprout
- Plants appear as small sprouts at the tapped location on the planet surface
- All plants rotate with the planet

### 3. Watering with Shooting Stars
- Shooting stars periodically cross the sky
- Tap a shooting star to catch it (turns into a glowing water droplet)
- Drag the water droplet onto a sprout to bloom it
- Each bloom produces a unique sound chord and particle burst based on plant type

### 4. Animals
- Baby space animals arrive after blooming milestones:
  - Star Fox: after 3 blooms
  - Moon Bunny: after 6 blooms
  - Comet Kitten: after 10 blooms
- Animals float in from the edge of the screen and settle near the planet
- Each animal has a 3-tap interaction cycle (sound 1 -> sound 2 -> sound 3 -> repeat)
- Tapping an animal with accessories unlocked opens an accessory tray

### 5. Rewards
- Every 2-3 blooms, a gift star appears
- Tapping a gift star opens it to reveal a reward:
  - Planet decorations (crystal cluster, glowing mushroom, star flower, moon arch, rainbow bridge)
  - Animal accessories (tiny crown, star bow, moon scarf, comet collar, sparkle wings, galaxy hat)
  - Rare seeds (rainbow tree, firework flower)
- Items are never lost. Players can always swap and rearrange.

### 6. Decorations
- Earned decorations appear in the garden tray
- Tap a decoration to select it, then tap the planet to place it
- Decorations render on the planet surface and rotate with it
- Animal accessories are equipped via a dedicated accessory tray that appears when tapping an animal

### 7. Planet Interaction
- Drag/swipe the planet to spin it
- Momentum-based rotation with friction
- All placed items (plants, decorations, animals) rotate with the planet

## Plant Types

| # | Name | Color | Bloom Colors |
|---|------|-------|-------------|
| 1 | Starbloom | #ff69b4 (pink) | Pink/white sparkles |
| 2 | Moonpetal | #9b59b6 (purple) | Purple/silver sparkles |
| 3 | Sunwhisper | #f39c12 (gold) | Gold/yellow sparkles |
| 4 | Cosmolily | #3498db (blue) | Blue/cyan sparkles |
| 5 | Nebula Fern | #2ecc71 (green) | Green/teal sparkles |

## Animal Types

| Animal | Bloom Threshold | Sound Theme |
|--------|----------------|-------------|
| Star Fox | 3 blooms | Playful yips (rising tones) |
| Moon Bunny | 6 blooms | Soft chirps (bell-like) |
| Comet Kitten | 10 blooms | Tiny mews (warm, sliding tones) |

## Audio

All sounds synthesized via Web Audio API (no audio files):

- **Ambient:** Soft background drone with gentle modulation
- **Plant pop:** Quick percussive pop when planting a sprout
- **Star catch:** Bright chime when catching a shooting star
- **Bloom chords:** 5 unique chord progressions, one per plant type
- **Animal sounds:** 3 sounds per animal (9 total), cycling on tap
- **Gift star:** Ascending sparkle sound on appear, fanfare on open
- **Accessory place:** Satisfying click/sparkle
- **Spin whoosh:** Velocity-dependent whoosh on planet spin
- **Drag shimmer:** Continuous shimmer while dragging water droplet

The audio system object is named `GameAudio` (not `Audio`) to avoid shadowing the browser's native Audio constructor.

## State Machine

```
title -> transition -> playing
```

- **title:** Title screen displayed. Only input: tap to start.
- **transition:** Zoom animation playing. All input blocked.
- **playing:** Full gameplay. All interactions enabled.

All input handlers have state guards (`if (Game.state !== 'playing') return`).

## Persistence (localStorage)

Auto-save triggers after every state-changing action:
1. Planting a sprout
2. Blooming a plant
3. Placing a decoration
4. Opening a gift star (unlocking a reward)
5. Equipping an accessory

Saved data includes:
- All plants (type, angle, state)
- All animals (type, angle, accessories)
- All placed decorations (type, angle)
- Unlocked rewards list
- Bloom count
- Planet rotation angle
- Game state

## Reward Pool (13 items)

### Decorations (5)
1. Crystal Cluster - sparkly crystal formation
2. Glow Mushroom - bioluminescent mushroom
3. Star Flower - star-shaped ground flower
4. Moon Arch - crescent moon archway
5. Rainbow Bridge - small rainbow arc

### Accessories (6)
1. Tiny Crown - sits on top of animal head
2. Star Bow - decorative bow
3. Moon Scarf - draped scarf
4. Comet Collar - collar around neck
5. Sparkle Wings - small wings on back
6. Galaxy Hat - hat on head

### Rare Seeds (2)
1. Rainbow Tree - special plantable type
2. Firework Flower - special plantable type

Rare seeds are defined as PlantTypes entries (indices 5, 6) with a `seedId` property matching the RewardPool item ID. The garden tray filters these out until the seed is unlocked via a gift star. When unlocked, `refreshGardenTray()` rebuilds the tray to include the new plantable type. Each rare plant has a unique 4-note bloom chord.

## File Structure

```
game/
  index.html          - Entry point
  css/
    styles.css        - Fullscreen styles, touch handling, UI trays
  js/
    audio.js          - GameAudio synthesizer
    input.js          - Unified touch/mouse input system
    planet.js         - Planet rendering and coordinate system
    plants.js         - Plant types, placement, sprout/bloom states
    particles.js      - Particle effects system
    shooting-stars.js - Star spawning, catching, water droplet mechanic
    animals.js        - Animal types, spawning, tap interactions
    rewards.js        - Gift star drops, reward pool, unlock tracking
    decorations.js    - Planet decorations and animal accessories
    storage.js        - localStorage save/load
    ui.js             - Garden tray, accessory tray, parent reset
    main.js           - Game loop, state machine, input wiring
```

## Parent Features

- **Reset button:** Nearly invisible button, requires 2-second long press to activate. Shows a confirm dialog (the only text in the entire game, acceptable since it's parent-only).

## Technical Notes

- Canvas-based rendering at 60fps via requestAnimationFrame
- Starfield background with parallax twinkling
- Planet has deterministic surface patches for visual texture
- All surface items use angle-based coordinates that rotate with the planet
- Touch targets sized for small fingers (80px+ for tray items)
- No external dependencies, CDNs, or build tools
