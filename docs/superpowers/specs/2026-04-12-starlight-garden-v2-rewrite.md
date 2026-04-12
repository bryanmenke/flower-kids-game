# Starlight Garden v2 — Visual Rewrite Design Specification

## Overview

Full visual rewrite of Starlight Garden. The cartoon-style floating sphere becomes a realistic earth-like garden planet viewed from the surface. Plants gain detailed procedural rendering with 5 growth stages. Animals expand from 3 to 6 types. Background music changes from an ambient drone to a synthesized music box lullaby. Gift stars become color-coded by reward type.

Core gameplay loop is unchanged: plant, water with shooting stars, bloom, attract animals, earn rewards, decorate.

## Constraints (Unchanged)

- Vanilla HTML/CSS/JS, zero dependencies
- All audio synthesized via Web Audio API, no audio files
- No text in gameplay, no fail state
- Touch-first, 60px+ tap targets
- localStorage persistence with auto-save
- `GameAudio` naming (not `Audio`)

---

## 1. Viewport & Camera

### Camera Model

The planet is enormous. Its center is far below the bottom of the screen. The player sees only the top arc of the sphere as a **curved horizon line at roughly 65% down the screen**. Above the horizon: space with stars. Below the horizon: earth-like ground surface.

### camera.js — Single Source of Truth

All systems position objects by calling `Camera.worldToScreen(angle, depth)`:

- **angle**: 0–2PI, position around the planet (horizontal)
- **depth**: 0–1, distance from horizon (0 = at horizon, 1 = closest to viewer / bottom of screen)
- **Returns**: `{ x, y, scale, visible }` — screen coordinates, size multiplier, and whether on-screen

`Camera.rotation` is the current viewing angle. Swiping left/right changes this value. Momentum and friction apply.

### Visible Arc

At any time, roughly 90–120 degrees of the planet surface is visible. Objects outside this arc are culled (not drawn). Objects near the edges foreshorten slightly (scale reduces).

### Planting Surface

The entire visible ground area is plantable. Tapping anywhere below the horizon places a plant. `Camera.screenToWorld(x, y)` converts a tap position back to `{ angle, depth }`.

---

## 2. Planet Surface Rendering

### planet-surface.js

The ground below the horizon is rendered as layered gradients:

1. **Sky-ground boundary**: A slightly irregular horizon line with organic bumps (procedural noise), not a perfectly smooth arc
2. **Grass layer**: Rich green gradient at the top edge, with individual grass blade shapes along the horizon line for texture
3. **Mid-ground**: Darker green transitioning to brown-green
4. **Near-ground (bottom)**: Rich dark soil tones at screen bottom

Subtle details:
- Small random darker/lighter patches for terrain variation
- Faint texture pattern (stippling or noise) for soil grain
- The horizon line has a very subtle atmospheric haze (slight blue-white fade)

### starfield.js (Extracted from main.js)

Star background above the horizon. Multiple layers:
- **Far stars**: Tiny dots, slow twinkle, slight parallax on rotation
- **Near stars**: Slightly larger, faster twinkle, more parallax
- Occasional slow-moving nebula wisps (large, very faint colored gradients that drift)

---

## 3. Plants — 7 Types, 5 Growth Stages

### Growth State Machine

Each plant has a `growthStage` (0–4) and a `growthProgress` (0–1 within current stage for smooth interpolation):

| Stage | Name | Trigger |
|-------|------|---------|
| 0 | Seed | Planted by player |
| 1 | Sprout | 1st watering |
| 2 | Young | 2nd watering |
| 3 | Mature | 3rd watering |
| 4 | Bloom | 4th watering (final) |

Watering advances the stage. A grow animation interpolates `growthProgress` from 0 to 1 over ~0.5s when a stage advances. Only stage 4 (bloom) triggers bloom rewards (animal checks, gift star chance).

### plants.js — Data & Logic

Manages plant array, selected type, growth state transitions. Each plant: `{ typeIndex, angle, depth, growthStage, growthProgress, plantedTime }`.

`Plants.waterPlant(plant)` — advances growth stage, triggers grow animation. If reaching stage 4, calls `Rewards.onBloom()`.

### plant-renderer.js — Pure Draw Functions

Contains `PlantRenderer.draw(ctx, typeIndex, stage, progress, x, y, scale)` plus per-type draw functions. No state, no logic. Each type has 5 stage-drawing functions that interpolate between stages using `progress`.

**Common techniques across all plants:**
- Stems: quadratic/bezier curves, width varies along length
- Leaves: overlapping ellipses with gradient fills, vein lines
- Petals: layered arcs/ellipses with radial gradients for depth
- Shadows: dark ellipse at base, 20% opacity
- Sway: subtle sine-based oscillation on stems/leaves in idle

### 7 Plant Types

#### 1. Rose Bush
- **Seed**: Small soil mound, dark seed visible
- **Sprout**: Single thin green stem, two tiny rounded leaves
- **Young**: Stem thickens, branches, serrated leaf shapes appear (3-4 leaves)
- **Mature**: Fuller bush shape, tight green buds at branch tips
- **Bloom**: Rich red/pink roses with layered petal spirals (3-4 open roses), gentle sway

#### 2. Sunflower
- **Seed**: Soil crack, striped seed poking up
- **Sprout**: Thick single stem, pair of round seed-leaves (cotyledons)
- **Young**: Tall stem, 2-3 broad rough-edged leaves
- **Mature**: Large green disc at top, tilting upward, small yellow petal hints at edge
- **Bloom**: Classic sunflower — golden petal ring, dark fibonacci-spiral center, slight head nod animation

#### 3. Willow Tree
- **Seed**: Small acorn-like seed on soil
- **Sprout**: Thin sapling, 2 tiny leaves
- **Young**: Slender pale trunk, first few drooping branch lines
- **Mature**: Taller trunk, weeping canopy forming with flowing lines
- **Bloom**: Full weeping willow — cascading branch curves with tiny leaf shapes, gentle wind sway

#### 4. Mushroom Cluster
- **Seed**: Tiny spore dots on soil surface
- **Sprout**: 2-3 tiny white pins pushing up
- **Young**: Pins developing caps, varied heights (3-4 mushrooms)
- **Mature**: Full rounded caps with gill lines underneath, largest cap dominant
- **Bloom**: Bioluminescent glow — caps emit soft light (radial gradient), faint spore particles drift up

#### 5. Lavender
- **Seed**: Tiny seed in tilled-looking soil
- **Sprout**: Thin grass-like green shoots (3-4)
- **Young**: Multiple stems, narrow grey-green leaves along stems
- **Mature**: Purple bud clusters forming at stem tips, stacking upward
- **Bloom**: Full purple flower spikes (5-6 stems), tiny individual flowers visible, gentle sway in unison

#### 6. Rainbow Tree (rare — unlocked via seed reward)
- **Seed**: Iridescent pearl-like seed, subtle color shift
- **Sprout**: Crystalline shoot, refracts light (drawn as stem with color bands)
- **Young**: Trunk with color-shifting bark (gradient cycles through spectrum)
- **Mature**: Canopy forming with leaves in spectral gradient (red→violet)
- **Bloom**: Full rainbow canopy, subtle light rays emanate outward, leaves shimmer

#### 7. Firework Flower (rare — unlocked via seed reward)
- **Seed**: Glowing ember on soil, orange-red
- **Sprout**: Bright orange-red shoot, slight heat shimmer
- **Young**: Spiky angular stems, red-tipped leaves
- **Mature**: Tight cluster of pointed buds at center, pulsing warm glow
- **Bloom**: Explosive starburst — radiating petal lines with gradient (red→orange→gold→white at tips), tiny spark particles

---

## 4. Animals — 6 Types

### Bloom Thresholds

| # | Animal | Arrives At | Sound Theme |
|---|--------|-----------|-------------|
| 1 | Star Fox | 3 blooms | Playful yips (rising tones) |
| 2 | Moon Bunny | 5 blooms | Soft chirps (bell-like) |
| 3 | Comet Kitten | 8 blooms | Tiny mews (warm, sliding) |
| 4 | Nebula Owl | 12 blooms | Soft hoots (hollow, round) |
| 5 | Galaxy Deer | 17 blooms | Chime bells (crystalline) |
| 6 | Aurora Bear Cub | 23 blooms | Low rumble purrs (warm bass) |

### animals.js — Data & Logic

Manages animal array, arrival checks, tap handling, 3-tap sound cycle. Each animal: `{ typeIndex, angle, depth, tapCount, accessory, arrivalTime, settled, idleTimer }`.

Animals arrive by walking in from off-screen and settling at a position on the surface.

### animal-renderer.js — Pure Draw Functions

Detailed procedural animal drawing. Each animal has:
- **Body shapes**: Layered ellipses with gradient fills for fur/volume
- **Fur texture**: Short stroke lines in body color variations
- **Eyes**: Expressive — large, round, with highlights (two white dots)
- **Idle animations**: Per-animal (see table below), driven by `idleTimer`
- **Accessory rendering**: Each accessory drawn relative to animal anchor points (head top, neck, back, etc.)

| Animal | Idle Animations |
|--------|----------------|
| Star Fox | Tail swish side-to-side, ear perk up/down |
| Moon Bunny | Nose twitch (small oval oscillation), occasional hop |
| Comet Kitten | Paw lick (paw to face), stretch (extend body) |
| Nebula Owl | Head tilt left/right, wing ruffle (brief spread) |
| Galaxy Deer | Ear flick, gentle head bow down/up |
| Aurora Bear Cub | Big yawn (mouth open), belly scratch (paw on belly) |

---

## 5. Accessories — 12 Types

| # | ID | Name | Anchor Point | Visual Description |
|---|----|------|-------------|-------------------|
| 1 | crown | Tiny Crown | Head top | Gold base, colored gem points |
| 2 | bow | Sparkle Bow | Head top | Pink ribbon loops with sparkle dots |
| 3 | sunglasses | Star Sunglasses | Eyes | Star-shaped frames, reflective gradient lenses |
| 4 | wreath | Flower Wreath | Head top | Ring of small multi-colored flowers |
| 5 | wings | Fairy Wings | Back | Translucent iridescent wing pair, subtle vein lines |
| 6 | cape | Cape | Neck/back | Flowing purple gradient, slight wave animation |
| 7 | scarf | Scarf | Neck | Striped knit texture, draped ends |
| 8 | collar | Bell Collar | Neck | Band with small circle (bell) at center |
| 9 | tophat | Top Hat | Head top | Black cylinder with band, slight tilt |
| 10 | butterfly | Butterfly Clip | Ear/head side | Small butterfly shape, wings open/close slowly |
| 11 | backpack | Backpack | Back | Tiny pack with flap and strap lines |
| 12 | halo | Halo | Above head | Golden ring, floats and bobs slightly above head |

---

## 6. Decorations — 5 Types (Unchanged Concepts, Updated Rendering)

| # | ID | Name | Description |
|---|----|------|------------|
| 1 | bridge | Tiny Bridge | Wooden plank bridge with railing, arched |
| 2 | lantern | Glow Lantern | Post with glowing warm light, light pool on ground |
| 3 | pond | Crystal Pond | Oval water surface with reflection highlights, ripple animation |
| 4 | arch | Rainbow Arch | Stone arch with rainbow gradient band above |
| 5 | tower | Castle Tower | Small stone tower with flag on top, window glow |

Decorations are placed on the ground surface (angle + depth), depth-sorted with plants and animals.

---

## 7. Shooting Stars & Watering

### shooting-stars.js

**Spawn rate**: One star every 3-4 seconds (faster than v1 since plants need 4 waterings).

**Visual**: Bright core with elongated tail, color varies (white, pale blue, pale gold). Streak across the sky area above the horizon.

**Water droplet**: When caught, transforms into a realistic teardrop shape — rounded bottom, pointed top, with a white refraction highlight and slight blue tint. As you drag, a trail of smaller droplets follows behind.

**Watering**: Drag droplet onto any plant that isn't fully bloomed (stage < 4). On contact: splash particle effect, plant advances one growth stage with smooth grow animation.

---

## 8. Rewards & Gift Stars

### Gift Star Colors (New)

| Reward Type | Star Color | Glow Color |
|------------|-----------|-----------|
| Decoration | **Magenta** (#ff44aa) | Pink-magenta pulse |
| Accessory | **Cyan** (#44ddff) | Blue-cyan pulse |
| Rare Seed | **Gold with rainbow shimmer** (#ffdd44 + spectral cycle) | Golden with color-shifting edge |

### Gift Star Rendering

- **50% larger** than v1
- Pulsing glow aura that expands/contracts (sine-driven radius)
- Sparkling trail as it floats down (emit 1-2 tiny sparkle particles per frame)
- 5-pointed star shape with rounded points
- Color-coded by reward type (determined at spawn based on what reward will drop)

### Reward Pool (19 items total)

- 5 decorations (Section 6)
- 12 accessories (Section 5)
- 2 rare seeds (Rainbow Tree, Firework Flower)

Gift stars still appear every 2-3 blooms. No duplicates until pool exhausted.

---

## 9. Background Music — Music Box Lullaby

### Replace `startAmbient()` entirely

**Instrument voice**: Sharp-attack, quick-decay sine tone + quiet partial at 3x frequency for metallic music-box timbre. Each note: ~50ms attack, ~200ms decay, ~400ms release.

**Melody**: Pentatonic in C major (C, D, E, G, A). 65 BPM. 16-bar loop (~16 seconds).

| Bars | Pattern |
|------|---------|
| 1-4 | Ascending: C4-E4-G4-A4 with quarter notes |
| 5-8 | Descending: A4-G4-E4-D4 with longer half notes |
| 9-12 | Variation: Some notes octave up (C5, E5), slight syncopation |
| 13-16 | Resolve: G4-E4-D4-C4, final note held with longer release |

**Accompaniment**: Very soft sustained pad (low sine, ~0.05 gain) alternating between C major triad (C3-E3-G3) and A minor triad (A2-C3-E3), changing every 4 bars.

**Dynamics**: Master volume breathes with slow LFO (~0.05 Hz, +/-10% gain). Player actions briefly boost brightness (pad volume +20% for 2 seconds, smooth envelope).

**Loop variation**: On each repeat, 2-3 notes are randomly shifted to neighboring pentatonic tones, and 1-2 notes may jump an octave. This prevents the loop from feeling repetitive.

---

## 10. Storage — v2 Format

### Save Format

```javascript
{
  version: 2,
  plants: [{ typeIndex, angle, depth, growthStage }],
  animals: [{ typeIndex, angle, depth, tapCount, accessory }],
  decorations: [{ id, angle, depth }],
  rewards: { unlocked: [], bloomsSinceLastGift: 0 },
  camera: { rotation: 0 },
  bloomCount: 0
}
```

### Migration

If a v1 save is detected, discard it and start fresh. No migration.

---

## 11. File Structure

```
game/
  index.html
  css/
    styles.css
  js/
    camera.js             - Viewport, world-to-screen projection, screen-to-world
    starfield.js          - Star layers, twinkle, nebula wisps
    planet-surface.js     - Ground rendering below horizon
    plant-renderer.js     - 7 plant types x 5 stages draw functions
    plants.js             - Plant data, growth state machine, placement
    animal-renderer.js    - 6 animal types draw functions with idle animations
    animals.js            - Animal data, arrival, tap handling
    decorations.js        - 5 decoration types, placement, rendering
    particles.js          - Particle system (sparkles, splashes, spores)
    shooting-stars.js     - Star flight, water droplet, watering mechanic
    rewards.js            - Colored gift stars, reward pool (19 items), unlock tracking
    storage.js            - v2 save/load, v1 discard
    ui.js                 - Garden tray (7 plants, gated rares), accessory tray (12 items)
    audio.js              - Music box lullaby, all SFX, bloom chords for 7 types
    input.js              - Touch/mouse input (unchanged)
    main.js               - Game loop, state machine, depth-sorted render pipeline
```

**Script load order in index.html:**
```
audio.js, input.js, camera.js, starfield.js, planet-surface.js,
plant-renderer.js, plants.js, animal-renderer.js, animals.js,
particles.js, shooting-stars.js, rewards.js, decorations.js,
storage.js, ui.js, main.js
```

---

## 12. Render Pipeline (main.js)

Each frame in playing state:

1. Clear canvas
2. `Starfield.draw(ctx)` — sky background
3. `PlanetSurface.draw(ctx)` — ground below horizon
4. Collect all surface objects into one array: plants, animals, decorations
5. Sort by depth (furthest first = smallest y = near horizon)
6. Draw each object back-to-front using appropriate renderer
7. `ShootingStars.draw(ctx)` — stars and droplet in sky
8. `Rewards.draw(ctx)` — gift stars floating down
9. `Particles.draw(ctx)` — all particles on top

---

## 13. Title Screen

Redesigned to match new aesthetic:
- Space background with starfield
- Curved horizon of the garden planet visible at bottom
- A few silhouetted plants along the horizon
- Soft music box playing
- Tap anywhere to start (zoom-in transition to playing view — camera descends from wide shot to surface-level over ~1.5s)

---

## 14. Auto-Save Trigger Points

`autoSave()` is called after every state-changing player action:

1. Planting a seed (new plant placed)
2. Watering a plant (growth stage advances)
3. Placing a decoration
4. Opening a gift star (reward unlocked)
5. Equipping/removing an accessory (`Storage.save()` directly)
