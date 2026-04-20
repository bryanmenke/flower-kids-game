# Starlight Garden v2 — Visual Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Rewrite Starlight Garden's entire visual layer — planet becomes a zoomed-in earth-like horizon, plants get detailed procedural rendering with 5 growth stages, animals expand to 6 types, music becomes a synthesized music box lullaby, gift stars become color-coded.

**Architecture:** Full visual rewrite replacing all rendering code. New camera system (camera.js) provides single-source-of-truth world-to-screen projection. Plant and animal rendering split into dedicated renderer files. Depth-sorted render pipeline in main.js draws all surface objects back-to-front. Input system (input.js) kept unchanged. Game state machine kept (title/transition/playing). All audio still synthesized via Web Audio API with GameAudio global.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas 2D, Web Audio API, localStorage. Zero dependencies.

**Spec:** `docs/superpowers/specs/2026-04-12-starlight-garden-v2-rewrite.md`

**CRITICAL RULES:**
- The audio global is `GameAudio`, NEVER `Audio` (shadows browser native)
- All input handlers must guard on `Game.state !== 'playing'`
- `autoSave()` must be called after: planting, watering, placing decoration, opening gift star
- `Storage.save()` must be called in `UI.equipAccessory()`
- No text in gameplay (parent reset confirm() is the only exception)
- Touch targets 60px+ minimum

---

## Parallelization Strategy

Tasks are grouped into layers. Within each layer, tasks can run in parallel.

**Layer 1 (Foundation — no dependencies):**
- Task 1: index.html + styles.css
- Task 2: camera.js
- Task 3: input.js (keep as-is, just verify)
- Task 4: audio.js (music box + all SFX)

**Layer 2 (Rendering — depends on camera.js):**
- Task 5: starfield.js
- Task 6: planet-surface.js
- Task 7: plant-renderer.js
- Task 8: animal-renderer.js
- Task 9: particles.js

**Layer 3 (Game Logic — depends on camera + renderers):**
- Task 10: plants.js
- Task 11: animals.js
- Task 12: decorations.js
- Task 13: shooting-stars.js
- Task 14: rewards.js

**Layer 4 (Integration — depends on everything above):**
- Task 15: storage.js
- Task 16: ui.js
- Task 17: main.js

---

### Task 1: index.html + styles.css

**Files:**
- Rewrite: `game/index.html`
- Rewrite: `game/css/styles.css`

- [ ] **Step 1: Rewrite index.html with new script load order**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Starlight Garden</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <div id="ui-overlay"></div>
  <script src="js/audio.js"></script>
  <script src="js/input.js"></script>
  <script src="js/camera.js"></script>
  <script src="js/starfield.js"></script>
  <script src="js/planet-surface.js"></script>
  <script src="js/plant-renderer.js"></script>
  <script src="js/plants.js"></script>
  <script src="js/animal-renderer.js"></script>
  <script src="js/animals.js"></script>
  <script src="js/particles.js"></script>
  <script src="js/shooting-stars.js"></script>
  <script src="js/rewards.js"></script>
  <script src="js/decorations.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Rewrite styles.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #050510;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

#gameCanvas {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

#ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#ui-overlay > * {
  pointer-events: auto;
}

/* Garden Tray — sits at bottom, earthy gradient */
.tray {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: linear-gradient(to top, rgba(30, 20, 10, 0.95), rgba(30, 20, 10, 0.6), transparent);
}

.tray-item {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.tray-item:active {
  transform: scale(0.92);
}

.tray-item.selected {
  border-color: rgba(180, 255, 150, 0.8);
  background: rgba(180, 255, 150, 0.12);
  transform: scale(1.08);
  box-shadow: 0 0 18px rgba(180, 255, 150, 0.25);
}

.tray-item canvas {
  width: 60px;
  height: 60px;
  pointer-events: none;
}

#accessory-tray {
  background: linear-gradient(to top, rgba(40, 20, 50, 0.95), rgba(30, 15, 40, 0.6), transparent);
}

/* Scrollable tray for many items */
.tray {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  justify-content: flex-start;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```

- [ ] **Step 3: Commit**

```bash
git add game/index.html game/css/styles.css
git commit -m "feat(v2): rewrite index.html and styles.css for v2 visual overhaul"
```

---

### Task 2: camera.js — Viewport & Projection System

**Files:**
- Create: `game/js/camera.js`

This is the foundation — every other system depends on Camera for positioning.

- [ ] **Step 1: Create camera.js**

```javascript
// Camera - Viewport math, world-to-screen projection, screen-to-world conversion
// The planet is enormous. We see only the top arc as a curved horizon.
// All surface objects use (angle, depth) coordinates.
// angle: 0-2PI position around the planet
// depth: 0-1 distance from horizon (0=horizon, 1=near viewer/bottom of screen)

const Camera = {
  // Viewport
  width: 0,
  height: 0,
  horizonY: 0,        // Y position of horizon line on screen (about 65% down)
  groundBottom: 0,     // Y position of bottom of visible ground (screen bottom - tray)

  // Rotation
  rotation: 0,         // current camera angle in radians
  rotationVelocity: 0, // angular velocity for momentum
  friction: 0.92,      // rotation friction per frame

  // Visible arc
  visibleArc: Math.PI * 0.6, // ~108 degrees visible at once

  // Planet geometry
  planetRadius: 0,     // computed from screen size — very large

  init(width, height) {
    this.width = width;
    this.height = height;
    this.horizonY = height * 0.65;
    this.groundBottom = height - 110; // above tray
    this.planetRadius = width * 2.5;  // enormous planet
  },

  resize(width, height) {
    this.init(width, height);
  },

  update(dt) {
    this.rotation += this.rotationVelocity * dt;
    this.rotationVelocity *= this.friction;
    // Wrap rotation to 0-2PI
    this.rotation = ((this.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },

  spin(velocityX) {
    this.rotationVelocity += velocityX * 0.003;
  },

  // Convert world coordinates (angle, depth) to screen coordinates
  // Returns { x, y, scale, visible }
  worldToScreen(angle, depth) {
    // Relative angle from camera center
    let relAngle = angle - this.rotation;
    // Normalize to -PI..PI
    while (relAngle > Math.PI) relAngle -= Math.PI * 2;
    while (relAngle < -Math.PI) relAngle += Math.PI * 2;

    const halfArc = this.visibleArc / 2;
    // Check visibility (with small buffer for objects partially off-screen)
    const visible = Math.abs(relAngle) < halfArc + 0.1;

    // X position: map relative angle to screen width
    const x = this.width / 2 + (relAngle / halfArc) * (this.width / 2);

    // Y position: depth 0 = horizon, depth 1 = bottom of ground area
    // Objects near horizon are further away (smaller), near bottom are closer (larger)
    // Use a slight curve so depth feels natural
    const depthCurve = depth * depth * 0.3 + depth * 0.7; // slight ease-in
    const y = this.horizonY + depthCurve * (this.groundBottom - this.horizonY);

    // Scale: objects at horizon are small, objects near viewer are full size
    // Also foreshorten at edges of visible arc
    const depthScale = 0.3 + depth * 0.7; // 0.3 at horizon, 1.0 at near
    const edgeFactor = 1 - Math.pow(Math.abs(relAngle) / halfArc, 2) * 0.15;
    const scale = depthScale * edgeFactor;

    return { x, y, scale, visible };
  },

  // Convert screen tap to world coordinates
  // Returns { angle, depth } or null if above horizon
  screenToWorld(screenX, screenY) {
    if (screenY < this.horizonY) return null;
    if (screenY > this.groundBottom) return null;

    // Depth from Y position (invert the worldToScreen Y mapping)
    const rawDepth = (screenY - this.horizonY) / (this.groundBottom - this.horizonY);
    // Invert the depth curve: depthCurve = d*d*0.3 + d*0.7
    // Solve: rawDepth = d^2 * 0.3 + d * 0.7 => 0.3d^2 + 0.7d - rawDepth = 0
    const a = 0.3, b = 0.7, c = -rawDepth;
    const discriminant = b * b - 4 * a * c;
    const depth = (-b + Math.sqrt(discriminant)) / (2 * a);

    // Angle from X position
    const halfArc = this.visibleArc / 2;
    const relAngle = ((screenX - this.width / 2) / (this.width / 2)) * halfArc;
    let angle = this.rotation + relAngle;
    // Normalize to 0-2PI
    angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    return { angle, depth: Math.max(0.05, Math.min(0.95, depth)) };
  },

  // Check if a screen point is on the ground
  isOnGround(screenX, screenY) {
    return screenY >= this.horizonY && screenY <= this.groundBottom;
  },

  // Check if a screen point is in the sky
  isInSky(screenX, screenY) {
    return screenY < this.horizonY;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/camera.js
git commit -m "feat(v2): add camera system with world-to-screen projection"
```

---

### Task 3: input.js — Keep Unchanged

**Files:**
- Keep: `game/js/input.js` (no changes needed)

The input system is viewport-agnostic. It provides raw screen coordinates and gesture detection. The main.js integration layer maps these to game actions using Camera.screenToWorld().

- [ ] **Step 1: Verify input.js exists and is unchanged**

Check that `game/js/input.js` exists with the unified touch/mouse handler. No modifications needed.

---

### Task 4: audio.js — Music Box Lullaby + All SFX

**Files:**
- Rewrite: `game/js/audio.js`

Complete rewrite. Music box ambient replaces drone. All SFX retained/updated. 7 bloom chords (one per plant type). 6 animal arrival sounds. 6x3 animal tap sounds. New owl/deer/bear sounds added.

- [ ] **Step 1: Rewrite audio.js**

```javascript
// GameAudio - Web Audio API synthesizer: music box lullaby + all game SFX
// IMPORTANT: This object is named GameAudio, NOT Audio (would shadow browser native)

const GameAudio = {
  ctx: null,
  masterGain: null,
  musicGain: null,
  sfxGain: null,
  initialized: false,
  musicNodes: [],
  musicTimer: null,
  _shimmerOsc: null,
  _shimmerGain: null,
  _shimmerLfo: null,

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.25;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);

    this.initialized = true;
    this.startMusicBox();
  },

  ensure() {
    if (!this.initialized) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  // --- Music Box Lullaby ---

  // Pentatonic melody in C major: C4=262, D4=294, E4=330, G4=392, A4=440
  // C5=523, D5=587, E5=659, G5=784, A5=880
  _pentatonic: [262, 294, 330, 392, 440, 523, 587, 659, 784, 880],

  // Base melody pattern (indices into _pentatonic)
  // 16 notes per loop at 65 BPM = ~14.8 seconds per loop
  _melodyBase: [
    0, 2, 4, 5,   // C4 E4 G4 A4 (ascending)
    5, 4, 2, 1,   // A4 G4 E4 D4 (descending)
    5, 7, 4, 6,   // A4 E5 G4 D5 (variation with octave jumps)
    4, 2, 1, 0    // G4 E4 D4 C4 (resolve)
  ],

  // Chord pads: C major and A minor triads (low octave)
  _padChords: [
    [131, 165, 196], // C3 E3 G3 (C major) — bars 1-4
    [131, 165, 196], // C major — bars 5-8
    [110, 131, 165], // A2 C3 E3 (A minor) — bars 9-12
    [131, 165, 196], // C major — bars 13-16
  ],

  _musicBoxNote(freq, startTime, duration) {
    const ctx = this.ctx;
    // Fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    gain1.gain.setValueAtTime(0.35, startTime);
    gain1.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc1.connect(gain1);
    gain1.connect(this.musicGain);
    osc1.start(startTime);
    osc1.stop(startTime + duration + 0.05);

    // Metallic overtone at 3x frequency
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 3;
    gain2.gain.setValueAtTime(0.08, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5);
    osc2.connect(gain2);
    gain2.connect(this.musicGain);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.5 + 0.05);
  },

  _scheduleMelodyLoop() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.1;
    const bpm = 65;
    const beatDuration = 60 / bpm;
    const noteDuration = beatDuration * 0.9;

    // Generate melody with slight variation
    const melody = this._melodyBase.slice();
    // Randomly shift 2-3 notes to neighbors
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * melody.length);
      const shift = Math.random() < 0.5 ? -1 : 1;
      melody[idx] = Math.max(0, Math.min(this._pentatonic.length - 1, melody[idx] + shift));
    }
    // Occasionally jump a note up an octave
    if (Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * melody.length);
      if (melody[idx] + 5 < this._pentatonic.length) melody[idx] += 5;
    }

    // Schedule melody notes
    for (let i = 0; i < melody.length; i++) {
      const freq = this._pentatonic[melody[i]];
      const isLastNote = i === melody.length - 1;
      const dur = isLastNote ? noteDuration * 2 : noteDuration;
      this._musicBoxNote(freq, now + i * beatDuration, dur);
    }

    // Schedule pad chords (one per 4 beats)
    for (let c = 0; c < 4; c++) {
      const chord = this._padChords[c];
      const chordStart = now + c * 4 * beatDuration;
      const chordDur = 4 * beatDuration;
      for (const freq of chord) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, chordStart);
        gain.gain.linearRampToValueAtTime(0.06, chordStart + chordDur * 0.5);
        gain.gain.linearRampToValueAtTime(0.001, chordStart + chordDur);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(chordStart);
        osc.stop(chordStart + chordDur + 0.1);
      }
    }

    // Schedule next loop
    const loopDuration = melody.length * beatDuration;
    this.musicTimer = setTimeout(() => this._scheduleMelodyLoop(), (loopDuration - 0.5) * 1000);
  },

  startMusicBox() {
    this._scheduleMelodyLoop();
    this._startBreathingLFO();
  },

  _startBreathingLFO() {
    // Master volume breathes with slow LFO (~0.05 Hz, +/-10% gain)
    if (!this.initialized) return;
    const ctx = this.ctx;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // 0.05 Hz = 20 second cycle
    lfoGain.gain.value = 0.05;  // +/- 10% of master (0.5 * 0.1 = 0.05)
    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);
    lfo.start();
    this._breathingLFO = lfo;
  },

  stopMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  },

  // Brief brightness boost on player action
  actionBrightness() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.35, now);
    this.musicGain.gain.linearRampToValueAtTime(0.25, now + 2);
  },

  // --- SFX ---

  playPlantPop() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // Earthy "pop" - deeper than before
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
    this.actionBrightness();
  },

  playStarCatch() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  },

  startDragShimmer() {
    this.ensure();
    if (this._shimmerOsc) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 1200;
    gain.gain.value = 0.08;
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    lfo.start();
    this._shimmerOsc = osc;
    this._shimmerGain = gain;
    this._shimmerLfo = lfo;
  },

  stopDragShimmer() {
    if (this._shimmerOsc) {
      this._shimmerGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      this._shimmerOsc.stop(this.ctx.currentTime + 0.35);
      this._shimmerLfo.stop(this.ctx.currentTime + 0.35);
      this._shimmerOsc = null;
      this._shimmerGain = null;
      this._shimmerLfo = null;
    }
  },

  // Bloom sound — unique chord per plant type (7 types)
  playBloom(plantType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chords = [
      [262, 330, 392],           // 0: Rose Bush — C major
      [294, 370, 440],           // 1: Sunflower — D major
      [330, 415, 494],           // 2: Willow Tree — E major
      [349, 440, 523],           // 3: Mushroom — F major
      [392, 494, 587],           // 4: Lavender — G major
      [262, 330, 392, 523],      // 5: Rainbow Tree — C major spread (4 notes)
      [220, 294, 370, 440],      // 6: Firework Flower — warm D spread (4 notes)
    ];
    const freqs = chords[plantType % chords.length];

    // Main chord
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.6);
    });

    // Sparkle overtones
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freqs[0] * 2 + Math.random() * 400;
      const t = now + 0.3 + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    }
    this.actionBrightness();
  },

  // Water splash sound (new — plays when watering advances a non-bloom stage)
  playWaterSplash() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // White noise burst filtered to sound like water
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.25);
  },

  // Growth sound (small chime for non-bloom stage advances)
  playGrowth() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  },

  playGiftStarAppear() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    [0, 0.12].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1319;
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  },

  playGiftStarOpen() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880, 1109, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.07;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    });
    this.actionBrightness();
  },

  // Animal arrival — melodic flourish per type
  playAnimalArrive(animalType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const melodies = [
      [659, 784, 880, 1047],     // 0: Fox — bright ascending
      [784, 659, 784, 988],      // 1: Bunny — bouncy
      [880, 784, 880, 1175],     // 2: Kitten — playful
      [523, 440, 523, 659],      // 3: Owl — low wise
      [1047, 1175, 1319, 1568],  // 4: Deer — crystalline high
      [330, 294, 330, 392],      // 5: Bear — warm low
    ];
    const notes = melodies[animalType % melodies.length];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.15;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.3);
    });
    this.actionBrightness();
  },

  // Animal tap sounds — 3 per animal type, cycle 1->2->3->1...
  playAnimalTap(animalType, soundIndex) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const sounds = [
      // 0: Fox — yip, bark, howl
      [
        () => { this._playTone('sine', 880, 0.15, 0.3); },
        () => { this._playTone('square', 440, 0.1, 0.25); this._playTone('square', 460, 0.1, 0.25); },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.5);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.65);
        },
      ],
      // 1: Bunny — squeak, boing, chirp
      [
        () => { this._playTone('sine', 1200, 0.08, 0.25); },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.35);
        },
        () => { this._playTone('sine', 1047, 0.06, 0.2); this._playTone('sine', 1319, 0.06, 0.2); },
      ],
      // 2: Kitten — mew, purr, trill
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.35);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 180;
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          lfo.frequency.value = 25; lfoGain.gain.value = 30;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); lfo.start(now);
          osc.stop(now + 0.65); lfo.stop(now + 0.65);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          for (let j = 0; j < 6; j++) {
            osc.frequency.setValueAtTime(j % 2 === 0 ? 800 : 1000, now + j * 0.05);
          }
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.4);
        },
      ],
      // 3: Owl — soft hoot, double hoot, low call
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.3);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.45);
        },
        () => {
          [0, 0.2].forEach(d => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 320;
            gain.gain.setValueAtTime(0.2, now + d);
            gain.gain.exponentialRampToValueAtTime(0.001, now + d + 0.18);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(now + d); osc.stop(now + d + 0.22);
          });
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.linearRampToValueAtTime(200, now + 0.6);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.75);
        },
      ],
      // 4: Deer — crystal chime, bell cascade, wind chime
      [
        () => {
          [1319, 1568, 1760].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = f;
            gain.gain.setValueAtTime(0.15, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.5);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(now + i * 0.04); osc.stop(now + i * 0.04 + 0.55);
          });
        },
        () => {
          [1760, 1568, 1319, 1175].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = f;
            const t = now + i * 0.08;
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(t); osc.stop(t + 0.45);
          });
        },
        () => {
          for (let i = 0; i < 5; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 1200 + Math.random() * 800;
            const t = now + i * 0.06;
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(t); osc.stop(t + 0.55);
          }
        },
      ],
      // 5: Bear — low rumble, snuffle, happy grumble
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 120;
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          lfo.frequency.value = 15; lfoGain.gain.value = 20;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); lfo.start(now);
          osc.stop(now + 0.55); lfo.stop(now + 0.55);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = 400;
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.25);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(180, now + 0.2);
          osc.frequency.linearRampToValueAtTime(140, now + 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.55);
        },
      ],
    ];

    const animalSounds = sounds[animalType % sounds.length];
    animalSounds[soundIndex % 3]();
  },

  playAccessoryPlace() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this._playTone('square', 1500, 0.02, 0.15);
    setTimeout(() => {
      this._playTone('sine', 2000, 0.05, 0.2);
      this._playTone('sine', 2400, 0.05, 0.18);
    }, 30);
  },

  playDecorationPlace() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // Warm thud + sparkle for placing a decoration
    this._playTone('sine', 200, 0.1, 0.08);
    this._playTone('sine', 400, 0.05, 0.06);
    setTimeout(() => {
      this._playTone('sine', 800, 0.03, 0.15);
      this._playTone('sine', 1200, 0.03, 0.12);
    }, 80);
  },

  playSpinWhoosh(speed) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 100 + Math.abs(speed) * 2;
    filter.type = 'lowpass';
    filter.frequency.value = 300 + Math.abs(speed) * 5;
    gain.gain.setValueAtTime(Math.min(0.08, Math.abs(speed) * 0.0008), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.45);
  },

  _playTone(type, freq, duration, fadeOut) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (fadeOut || duration));
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + (fadeOut || duration) + 0.05);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/audio.js
git commit -m "feat(v2): rewrite audio with music box lullaby and 6 animal sound sets"
```

---

### Task 5: starfield.js — Star Background

**Files:**
- Create: `game/js/starfield.js`

- [ ] **Step 1: Create starfield.js**

```javascript
// Starfield - Multi-layer star background with parallax and nebula wisps

const Starfield = {
  farStars: [],
  nearStars: [],
  nebulae: [],

  init(width, height) {
    this.farStars = [];
    this.nearStars = [];
    this.nebulae = [];

    // Far stars — tiny, slow twinkle
    for (let i = 0; i < 120; i++) {
      this.farStars.push({
        x: Math.random() * width * 1.2,
        y: Math.random() * Camera.horizonY,
        baseX: Math.random() * width * 1.2,
        radius: Math.random() * 1.0 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 1.5 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: 0.02,
      });
    }

    // Near stars — slightly larger, faster twinkle, more parallax
    for (let i = 0; i < 40; i++) {
      this.nearStars.push({
        x: Math.random() * width * 1.4,
        baseX: Math.random() * width * 1.4,
        y: Math.random() * Camera.horizonY,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 3 + 1.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: 0.06,
        color: Math.random() < 0.3 ? '#aaccff' : (Math.random() < 0.5 ? '#ffffdd' : '#ffffff'),
      });
    }

    // Nebula wisps — large faint color blobs that drift
    const nebulaColors = [
      'rgba(80, 60, 140, 0.03)',
      'rgba(60, 100, 140, 0.025)',
      'rgba(100, 50, 80, 0.02)',
    ];
    for (let i = 0; i < 3; i++) {
      this.nebulae.push({
        x: Math.random() * width,
        y: Math.random() * Camera.horizonY * 0.8,
        radius: 80 + Math.random() * 120,
        color: nebulaColors[i],
        driftSpeed: (Math.random() - 0.5) * 3,
        parallaxFactor: 0.01,
      });
    }
  },

  draw(ctx) {
    const time = Game.time;
    const w = Camera.width;
    const horizonY = Camera.horizonY;
    const rotation = Camera.rotation;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 20);
    skyGrad.addColorStop(0, '#050510');
    skyGrad.addColorStop(0.6, '#0a0a25');
    skyGrad.addColorStop(1, '#101835');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY + 20);

    // Nebula wisps
    for (const neb of this.nebulae) {
      const px = neb.x + neb.driftSpeed * time - rotation * neb.parallaxFactor * w;
      const wrappedX = ((px % (w * 1.5)) + w * 1.5) % (w * 1.5) - w * 0.25;
      const grad = ctx.createRadialGradient(wrappedX, neb.y, 0, wrappedX, neb.y, neb.radius);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(wrappedX, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Far stars
    for (const star of this.farStars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.alpha * (0.5 + 0.5 * twinkle);
      const px = star.baseX - rotation * star.parallaxFactor * w;
      const wrappedX = ((px % (w * 1.2)) + w * 1.2) % (w * 1.2) - w * 0.1;
      if (wrappedX < -5 || wrappedX > w + 5 || star.y > horizonY) continue;
      ctx.beginPath();
      ctx.arc(wrappedX, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 245, ${alpha})`;
      ctx.fill();
    }

    // Near stars
    for (const star of this.nearStars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.alpha * (0.5 + 0.5 * twinkle);
      const px = star.baseX - rotation * star.parallaxFactor * w;
      const wrappedX = ((px % (w * 1.4)) + w * 1.4) % (w * 1.4) - w * 0.2;
      if (wrappedX < -5 || wrappedX > w + 5 || star.y > horizonY) continue;
      ctx.beginPath();
      ctx.arc(wrappedX, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color ? star.color.replace(')', `, ${alpha})`) .replace('rgb', 'rgba') : `rgba(255, 255, 245, ${alpha})`;
      // Simple approach: just use white with alpha
      ctx.fillStyle = `rgba(255, 255, 250, ${alpha})`;
      ctx.fill();

      // Slight glow for brighter near stars
      if (star.radius > 1.5 && alpha > 0.5) {
        ctx.beginPath();
        ctx.arc(wrappedX, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.1})`;
        ctx.fill();
      }
    }
  },

  resize() {
    // Regenerate stars for new dimensions
    this.init(Camera.width, Camera.height);
  },

  update(dt) {
    // Starfield is purely time-driven via Game.time in draw(), no per-frame update needed
    // This method exists for API consistency with the game loop
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/starfield.js
git commit -m "feat(v2): add multi-layer starfield with parallax and nebula wisps"
```

---

### Task 6: planet-surface.js — Ground Rendering

**Files:**
- Create: `game/js/planet-surface.js`

- [ ] **Step 1: Create planet-surface.js**

```javascript
// PlanetSurface - Renders the earth-like ground below the horizon
// Layered gradients: grass at horizon, transitioning to soil at bottom
// Procedural bumps along horizon line for organic feel

const PlanetSurface = {
  // Pre-generated horizon bumps (seeded per session for consistency)
  horizonBumps: [],
  grassBlades: [],
  terrainPatches: [],

  init(width, height) {
    this.generateHorizonBumps(width);
    this.generateGrassBlades(width);
    this.generateTerrainPatches(width, height);
  },

  generateHorizonBumps(width) {
    // Generate smooth bumps using multiple sine waves
    this.horizonBumps = [];
    const count = Math.ceil(width / 2) + 1;
    for (let i = 0; i < count; i++) {
      const x = (i / count) * Math.PI * 8;
      const bump = Math.sin(x * 0.7) * 6 +
                   Math.sin(x * 1.3 + 1.5) * 4 +
                   Math.sin(x * 2.7 + 3.0) * 2;
      this.horizonBumps.push(bump);
    }
  },

  generateGrassBlades(width) {
    // Individual grass blades along the horizon for texture
    this.grassBlades = [];
    for (let i = 0; i < width * 0.5; i++) {
      this.grassBlades.push({
        xOffset: Math.random() * width * 3, // wraps with rotation
        height: 4 + Math.random() * 10,
        lean: (Math.random() - 0.5) * 0.4,
        shade: 0.7 + Math.random() * 0.3, // brightness variation
        width: 1 + Math.random() * 1.5,
      });
    }
  },

  generateTerrainPatches(width, height) {
    // Random darker/lighter patches for ground variation
    this.terrainPatches = [];
    for (let i = 0; i < 30; i++) {
      this.terrainPatches.push({
        xOffset: Math.random() * Math.PI * 2, // angle-based so they scroll
        depth: 0.1 + Math.random() * 0.8,
        radius: 20 + Math.random() * 50,
        darkness: (Math.random() - 0.5) * 0.08, // positive = darker, negative = lighter
      });
    }
  },

  getHorizonY(screenX) {
    // Get the horizon Y position with bumps applied
    const totalWidth = Camera.width;
    const bumpIndex = ((screenX / totalWidth) * (this.horizonBumps.length - 1));
    const i = Math.floor(bumpIndex);
    const frac = bumpIndex - i;
    const i0 = Math.max(0, Math.min(this.horizonBumps.length - 1, i));
    const i1 = Math.max(0, Math.min(this.horizonBumps.length - 1, i + 1));
    const bump = this.horizonBumps[i0] * (1 - frac) + this.horizonBumps[i1] * frac;
    return Camera.horizonY + bump;
  },

  draw(ctx) {
    const w = Camera.width;
    const h = Camera.height;
    const horizonY = Camera.horizonY;
    const groundBottom = Camera.groundBottom + 110; // extend past tray to screen bottom
    const rotation = Camera.rotation;

    // --- Atmospheric haze at horizon ---
    const hazeGrad = ctx.createLinearGradient(0, horizonY - 25, 0, horizonY + 15);
    hazeGrad.addColorStop(0, 'rgba(150, 180, 220, 0)');
    hazeGrad.addColorStop(0.5, 'rgba(150, 180, 220, 0.08)');
    hazeGrad.addColorStop(1, 'rgba(150, 180, 220, 0)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, horizonY - 25, w, 40);

    // --- Main ground fill ---
    // Draw horizon line with bumps
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 2) {
      const hy = this.getHorizonY(x);
      ctx.lineTo(x, hy);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.clip();

    // Ground gradient: green at top, brown-green middle, dark soil bottom
    const groundGrad = ctx.createLinearGradient(0, horizonY - 10, 0, groundBottom);
    groundGrad.addColorStop(0, '#3d6b2e');    // rich green at horizon
    groundGrad.addColorStop(0.15, '#4a7a35');  // slightly lighter green
    groundGrad.addColorStop(0.4, '#3d5a28');   // darker green
    groundGrad.addColorStop(0.7, '#33421e');   // brown-green
    groundGrad.addColorStop(1.0, '#1a2010');   // dark soil
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY - 15, w, groundBottom - horizonY + 15);

    // --- Terrain patches (scroll with rotation) ---
    for (const patch of this.terrainPatches) {
      const worldAngle = patch.xOffset;
      const relAngle = worldAngle - rotation;
      const halfArc = Camera.visibleArc / 2;
      let normAngle = relAngle;
      while (normAngle > Math.PI) normAngle -= Math.PI * 2;
      while (normAngle < -Math.PI) normAngle += Math.PI * 2;
      if (Math.abs(normAngle) > halfArc + 0.3) continue;

      const screenX = w / 2 + (normAngle / halfArc) * (w / 2);
      const pos = Camera.worldToScreen(worldAngle, patch.depth);
      const r = patch.radius * pos.scale;

      ctx.beginPath();
      ctx.arc(screenX, pos.y, r, 0, Math.PI * 2);
      if (patch.darkness > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(patch.darkness)})`;
      } else {
        ctx.fillStyle = `rgba(100, 140, 60, ${Math.abs(patch.darkness)})`;
      }
      ctx.fill();
    }

    // --- Soil texture (subtle stippling) ---
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * w;
      const sy = horizonY + Math.random() * (groundBottom - horizonY);
      const sr = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() < 0.5 ? '#000000' : '#556633';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // --- Grass blades along horizon ---
    const halfArc = Camera.visibleArc / 2;
    ctx.save();
    for (const blade of this.grassBlades) {
      const worldX = blade.xOffset;
      const relAngle = worldX - rotation;
      let normAngle = relAngle % (Math.PI * 2);
      if (normAngle > Math.PI) normAngle -= Math.PI * 2;
      if (normAngle < -Math.PI) normAngle += Math.PI * 2;
      if (Math.abs(normAngle) > halfArc + 0.05) continue;

      const screenX = w / 2 + (normAngle / halfArc) * (w / 2);
      const baseY = this.getHorizonY(screenX);
      const sway = Math.sin(Game.time * 1.5 + worldX * 3) * blade.lean * 3;

      ctx.strokeStyle = `rgba(${Math.floor(80 * blade.shade)}, ${Math.floor(140 * blade.shade)}, ${Math.floor(50 * blade.shade)}, 0.7)`;
      ctx.lineWidth = blade.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(screenX, baseY);
      ctx.quadraticCurveTo(
        screenX + sway * blade.height * 0.5,
        baseY - blade.height * 0.6,
        screenX + sway * blade.height,
        baseY - blade.height
      );
      ctx.stroke();
    }
    ctx.restore();
  },

  resize() {
    // Regenerate terrain features for new dimensions
    this.init(Camera.width, Camera.height);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/planet-surface.js
git commit -m "feat(v2): add realistic ground surface with horizon bumps, grass, terrain patches"
```

---

### Task 7: plant-renderer.js — 7 Plant Types x 5 Growth Stages

**Files:**
- Create: `game/js/plant-renderer.js`

This is the largest single file. Pure draw functions, no state. Each plant type has a draw function that takes `(ctx, stage, progress, scale, time)` where ctx is pre-translated to plant position. `stage` is 0-4, `progress` is 0-1 within current stage for interpolation.

- [ ] **Step 1: Create plant-renderer.js**

```javascript
// PlantRenderer - Detailed procedural drawing for 7 plant types across 5 growth stages
// Pure draw functions. No state, no logic.
// Each draw call assumes ctx is already translated to the plant's screen position.
// stage: 0=seed, 1=sprout, 2=young, 3=mature, 4=bloom
// progress: 0-1 interpolation within current stage
// scale: size multiplier from Camera (depth-based)
// time: Game.time for animations

const PlantRenderer = {
  // Main dispatch: draws the correct plant at the correct stage
  draw(ctx, typeIndex, stage, progress, scale, time) {
    const s = 40 * scale; // base size unit
    ctx.save();

    // Shadow at base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, s * 0.5, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, stage, progress, s, time);

    ctx.restore();
  },

  // Helper: draw a curved stem using quadratic bezier
  _stem(ctx, x1, y1, cx, cy, x2, y2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  },

  // Helper: draw a leaf shape (ellipse at angle)
  _leaf(ctx, x, y, w, h, angle, color, veinColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Leaf body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vein
    if (veinColor) {
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.8, 0);
      ctx.lineTo(w * 0.8, 0);
      ctx.stroke();
    }
    ctx.restore();
  },

  // Helper: draw a petal (teardrop arc)
  _petal(ctx, x, y, length, width, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(width, -length * 0.4, 0, -length);
    ctx.quadraticCurveTo(-width, -length * 0.4, 0, 0);
    ctx.fill();
    ctx.restore();
  },

  // Interpolation helper
  _lerp(a, b, t) { return a + (b - a) * t; },

  _types: [
    // === 0: Rose Bush ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.2) * 0.03;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed: soil mound with dark seed
        const moundH = PlantRenderer._lerp(2, 4, p) * s / 40;
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.2, moundH, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.ellipse(0, -moundH * 0.5, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Sprout: thin stem, two tiny leaves
        const h = PlantRenderer._lerp(0.15, 0.4, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.04, '#4a8030');
        if (p > 0.3) {
          const leafSize = PlantRenderer._lerp(0, 0.12, (p - 0.3) / 0.7) * s;
          PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.7, leafSize, leafSize * 0.5, -0.5, '#5a9940', '#3a6620');
          PlantRenderer._leaf(ctx, s * 0.06, -h * 0.65, leafSize, leafSize * 0.5, 0.5, '#5a9940', '#3a6620');
        }
      } else if (stage === 2) {
        // Young: thicker stem, branches, 3-4 serrated leaves
        const h = PlantRenderer._lerp(0.4, 0.6, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.5, 0, -h, s * 0.06, '#3d7025');
        // Branches
        PlantRenderer._stem(ctx, 0, -h * 0.5, -s * 0.15, -h * 0.65, -s * 0.2, -h * 0.55, s * 0.035, '#3d7025');
        PlantRenderer._stem(ctx, 0, -h * 0.65, s * 0.12, -h * 0.8, s * 0.18, -h * 0.7, s * 0.035, '#3d7025');
        // Leaves
        const ls = s * 0.14;
        PlantRenderer._leaf(ctx, -s * 0.2, -h * 0.55, ls, ls * 0.45, -0.6, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.18, -h * 0.7, ls, ls * 0.45, 0.4, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.85, ls * 0.9, ls * 0.4, -0.2, '#55993a', '#2d5518');
        if (p > 0.5) PlantRenderer._leaf(ctx, s * 0.08, -h * 0.4, ls * 0.8, ls * 0.4, 0.7, '#55993a', '#2d5518');
      } else if (stage === 3) {
        // Mature: fuller bush, tight green buds at tips
        const h = s * 0.7;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#3a6822');
        // Multiple branches
        const branches = [
          { x: -s * 0.25, y: -h * 0.65, angle: -0.6 },
          { x: s * 0.22, y: -h * 0.7, angle: 0.5 },
          { x: 0, y: -h, angle: 0 },
          { x: -s * 0.12, y: -h * 0.9, angle: -0.3 },
          { x: s * 0.1, y: -h * 0.85, angle: 0.3 },
        ];
        branches.forEach(br => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, br.x * 0.5, (br.y + -h * 0.4) * 0.5, br.x, br.y, s * 0.04, '#3a6822');
          PlantRenderer._leaf(ctx, br.x, br.y + s * 0.05, s * 0.12, s * 0.05, br.angle, '#4a8832', '#2d5518');
        });
        // Green buds at branch tips
        const budSize = PlantRenderer._lerp(0.02, 0.06, p) * s;
        branches.forEach(br => {
          ctx.fillStyle = '#6aaa44';
          ctx.beginPath();
          ctx.arc(br.x, br.y - s * 0.02, budSize, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Bloom: full roses with layered petals
        const h = s * 0.75;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#3a6822');
        const rosePositions = [
          { x: 0, y: -h, size: 1.0 },
          { x: -s * 0.22, y: -h * 0.7, size: 0.85 },
          { x: s * 0.2, y: -h * 0.75, size: 0.9 },
        ];
        // Branches to roses
        rosePositions.forEach(rp => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, rp.x * 0.5, (rp.y + -h * 0.4) * 0.5, rp.x, rp.y + s * 0.08, s * 0.04, '#3a6822');
          PlantRenderer._leaf(ctx, rp.x + s * 0.08, rp.y + s * 0.1, s * 0.1, s * 0.04, 0.5, '#4a8832', null);
        });
        // Draw roses
        rosePositions.forEach(rp => {
          const rs = s * 0.12 * rp.size;
          const petalCount = 8;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 + time * 0.1;
            const shade = i % 2 === 0 ? '#cc3355' : '#dd4466';
            PlantRenderer._petal(ctx, rp.x, rp.y, rs, rs * 0.45, angle, shade);
          }
          // Inner petals (smaller, darker)
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + 0.3 + time * 0.1;
            PlantRenderer._petal(ctx, rp.x, rp.y, rs * 0.6, rs * 0.3, angle, '#aa2244');
          }
          // Center
          ctx.fillStyle = '#ffcc44';
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rs * 0.15, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // === 1: Sunflower ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 0.8 + 1) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed: soil crack with striped seed
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        const seedH = PlantRenderer._lerp(0.03, 0.06, p) * s;
        ctx.fillStyle = '#3a3a2a';
        ctx.beginPath();
        ctx.ellipse(0, -seedH, s * 0.035, seedH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stripe on seed
        ctx.strokeStyle = '#5a5a4a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -seedH * 2);
        ctx.stroke();
      } else if (stage === 1) {
        // Sprout: thick stem, cotyledon pair
        const h = PlantRenderer._lerp(0.15, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#5a8a30');
        if (p > 0.2) {
          const ls = PlantRenderer._lerp(0, 0.15, (p - 0.2) / 0.8) * s;
          // Round cotyledons
          ctx.fillStyle = '#6a9a40';
          ctx.beginPath();
          ctx.ellipse(-s * 0.08, -h * 0.8, ls, ls * 0.6, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(s * 0.08, -h * 0.75, ls, ls * 0.6, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        // Young: tall stem, broad leaves
        const h = PlantRenderer._lerp(0.4, 0.75, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.06, '#4a7a28');
        // Broad leaves
        const ls = s * 0.18;
        PlantRenderer._leaf(ctx, -s * 0.12, -h * 0.35, ls, ls * 0.55, -0.7, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.1, -h * 0.5, ls, ls * 0.55, 0.6, '#4a8832', '#2d5518');
        if (p > 0.4) {
          PlantRenderer._leaf(ctx, -s * 0.08, -h * 0.65, ls * 0.85, ls * 0.45, -0.5, '#55993a', '#2d5518');
        }
      } else if (stage === 3) {
        // Mature: very tall, large green disc forming at top
        const h = s * 0.9;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.07, '#4a7a28');
        // Leaves
        PlantRenderer._leaf(ctx, -s * 0.14, -h * 0.3, s * 0.2, s * 0.08, -0.7, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.12, -h * 0.5, s * 0.18, s * 0.07, 0.6, '#4a8832', '#2d5518');
        // Green disc (developing flower head)
        const discSize = PlantRenderer._lerp(0.08, 0.18, p) * s;
        ctx.fillStyle = '#5a8830';
        ctx.beginPath();
        ctx.arc(s * 0.03, -h - discSize * 0.3, discSize, 0, Math.PI * 2);
        ctx.fill();
        // Hint of yellow at edge
        if (p > 0.5) {
          ctx.strokeStyle = '#ccaa20';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(s * 0.03, -h - discSize * 0.3, discSize + 1, Math.PI * 0.8, Math.PI * 1.8);
          ctx.stroke();
        }
      } else {
        // Bloom: classic sunflower
        const h = s * 0.95;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.08, '#4a7a28');
        PlantRenderer._leaf(ctx, -s * 0.16, -h * 0.3, s * 0.2, s * 0.08, -0.7, '#4a8832', null);
        PlantRenderer._leaf(ctx, s * 0.13, -h * 0.5, s * 0.18, s * 0.07, 0.6, '#4a8832', null);

        const headX = s * 0.03;
        const headY = -h;
        const headR = s * 0.22;
        // Slight head nod
        const nod = Math.sin(time * 0.5) * 0.05;
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(nod);

        // Petals
        const petalCount = 16;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2;
          const shade = i % 2 === 0 ? '#e8b800' : '#d4a600';
          PlantRenderer._petal(ctx, 0, 0, headR * 1.1, headR * 0.25, angle, shade);
        }
        // Dark center with spiral pattern
        ctx.fillStyle = '#3a2810';
        ctx.beginPath();
        ctx.arc(0, 0, headR * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Fibonacci dots on center
        ctx.fillStyle = '#5a4020';
        for (let i = 0; i < 20; i++) {
          const a = i * 2.4; // golden angle
          const r = Math.sqrt(i) * headR * 0.11;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    },

    // === 2: Willow Tree ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Seed: acorn on soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#8a6a30';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.04, s * 0.04, s * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cap
        ctx.fillStyle = '#6a5020';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.07, s * 0.045, s * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Sprout: thin sapling
        const h = PlantRenderer._lerp(0.15, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.03, '#7a9a5a');
        if (p > 0.4) {
          PlantRenderer._leaf(ctx, s * 0.03, -h * 0.9, s * 0.06, s * 0.03, 0.3, '#8aaa6a', null);
          PlantRenderer._leaf(ctx, -s * 0.03, -h * 0.8, s * 0.06, s * 0.03, -0.3, '#8aaa6a', null);
        }
      } else if (stage === 2) {
        // Young: slender trunk, first drooping branches
        const h = PlantRenderer._lerp(0.4, 0.7, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#8a7a5a');
        // First drooping branches
        const branchLen = s * 0.25;
        ctx.strokeStyle = '#7a9a5a';
        ctx.lineWidth = s * 0.02;
        ctx.lineCap = 'round';
        [-0.4, 0.3].forEach(offset => {
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.7);
          ctx.quadraticCurveTo(offset * s, -h * 0.5, offset * s * 1.2, -h * 0.3);
          ctx.stroke();
        });
      } else if (stage === 3) {
        // Mature: taller trunk, weeping canopy forming
        const h = s * 0.85;
        // Trunk
        ctx.fillStyle = '#7a6a4a';
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, 0);
        ctx.lineTo(-s * 0.03, -h * 0.9);
        ctx.lineTo(s * 0.03, -h * 0.9);
        ctx.lineTo(s * 0.04, 0);
        ctx.fill();
        // Weeping branches
        const branchCount = 6;
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI - Math.PI * 0.5;
          const bx = Math.cos(angle) * s * 0.3;
          const by = -h * 0.9 + Math.sin(angle) * s * 0.1;
          const droopY = by + s * 0.4 + Math.sin(time + i) * s * 0.02;
          ctx.strokeStyle = '#6a8a4a';
          ctx.lineWidth = s * 0.015;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.85);
          ctx.quadraticCurveTo(bx * 0.7, by, bx, droopY);
          ctx.stroke();
        }
      } else {
        // Bloom: full weeping willow
        const h = s;
        // Trunk with bark texture
        ctx.fillStyle = '#6a5a3a';
        ctx.beginPath();
        ctx.moveTo(-s * 0.05, 0);
        ctx.quadraticCurveTo(-s * 0.04, -h * 0.5, -s * 0.03, -h * 0.85);
        ctx.lineTo(s * 0.03, -h * 0.85);
        ctx.quadraticCurveTo(s * 0.04, -h * 0.5, s * 0.05, 0);
        ctx.fill();
        // Bark lines
        ctx.strokeStyle = '#5a4a2a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const bx = (i - 1.5) * s * 0.02;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx, -h * 0.8);
          ctx.stroke();
        }
        // Cascading branches with leaf shapes
        const branchCount = 10;
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI * 1.2 - Math.PI * 0.6;
          const bx = Math.cos(angle) * s * 0.4;
          const droopLen = s * 0.45 + Math.sin(i * 2.3) * s * 0.1;
          const sway = Math.sin(time * 0.8 + i * 0.7) * s * 0.03;
          const endX = bx + sway;
          const endY = -h * 0.85 + droopLen;

          ctx.strokeStyle = `rgba(90, 130, 60, ${0.5 + Math.sin(i) * 0.2})`;
          ctx.lineWidth = s * 0.012;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.85);
          ctx.bezierCurveTo(bx * 0.5, -h * 0.85 + droopLen * 0.2, bx * 0.8, -h * 0.85 + droopLen * 0.6, endX, endY);
          ctx.stroke();

          // Tiny leaves along branch
          for (let j = 0; j < 5; j++) {
            const t = (j + 1) / 6;
            const lx = bx * t + sway * t;
            const ly = -h * 0.85 + droopLen * t * t;
            ctx.fillStyle = '#7aaa50';
            ctx.beginPath();
            ctx.ellipse(lx, ly, s * 0.02, s * 0.01, angle, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 3: Mushroom Cluster ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Spore dots on soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        const count = Math.floor(PlantRenderer._lerp(1, 4, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - 1.5) * s * 0.04;
          ctx.fillStyle = '#ddddcc';
          ctx.beginPath();
          ctx.arc(dx, -s * 0.01, s * 0.01, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        // Tiny white pins
        const count = 3;
        const heights = [0.12, 0.08, 0.1];
        for (let i = 0; i < count; i++) {
          const dx = (i - 1) * s * 0.08;
          const h = PlantRenderer._lerp(0.02, heights[i], p) * s;
          ctx.strokeStyle = '#eeeedd';
          ctx.lineWidth = s * 0.02;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.lineTo(dx, -h);
          ctx.stroke();
          // Tiny round top
          ctx.fillStyle = '#eeeedd';
          ctx.beginPath();
          ctx.arc(dx, -h, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        // Caps forming
        const shrooms = [
          { x: 0, h: 0.25, capW: 0.1, capH: 0.06 },
          { x: -s * 0.1, h: 0.18, capW: 0.07, capH: 0.04 },
          { x: s * 0.08, h: 0.2, capW: 0.08, capH: 0.05 },
          { x: s * 0.15, h: 0.12, capW: 0.05, capH: 0.03 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Stem
          ctx.fillStyle = '#ddd8cc';
          ctx.fillRect(sh.x - s * 0.015, -mh, s * 0.03, mh);
          // Cap
          ctx.fillStyle = '#c8a878';
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, 0);
          ctx.fill();
        });
      } else if (stage === 3) {
        // Full caps with gills
        const shrooms = [
          { x: 0, h: 0.35, capW: 0.14, capH: 0.08 },
          { x: -s * 0.12, h: 0.25, capW: 0.1, capH: 0.06 },
          { x: s * 0.1, h: 0.28, capW: 0.11, capH: 0.07 },
          { x: s * 0.18, h: 0.18, capW: 0.07, capH: 0.04 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Stem
          ctx.fillStyle = '#e0dbd0';
          ctx.beginPath();
          ctx.moveTo(sh.x - s * 0.02, 0);
          ctx.lineTo(sh.x - s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.02, 0);
          ctx.fill();
          // Cap with gradient
          const capGrad = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s);
          capGrad.addColorStop(0, '#d4a870');
          capGrad.addColorStop(0.7, '#c09060');
          capGrad.addColorStop(1, '#a87850');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s * 0.3, 0, 0, Math.PI);
          ctx.fill();
          // Gill lines
          ctx.strokeStyle = 'rgba(180, 150, 120, 0.4)';
          ctx.lineWidth = 0.5;
          for (let g = 0; g < 5; g++) {
            const gx = sh.x + (g - 2) * sh.capW * s * 0.3;
            ctx.beginPath();
            ctx.moveTo(gx, -mh);
            ctx.lineTo(gx, -mh + sh.capH * s * 0.3);
            ctx.stroke();
          }
        });
      } else {
        // Bloom: bioluminescent glow
        const shrooms = [
          { x: 0, h: 0.38, capW: 0.15, capH: 0.09 },
          { x: -s * 0.13, h: 0.28, capW: 0.11, capH: 0.07 },
          { x: s * 0.11, h: 0.32, capW: 0.12, capH: 0.08 },
          { x: s * 0.2, h: 0.2, capW: 0.08, capH: 0.05 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Glow aura
          const glow = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s * 2);
          const pulse = 0.15 + Math.sin(time * 2 + sh.x) * 0.05;
          glow.addColorStop(0, `rgba(100, 200, 180, ${pulse})`);
          glow.addColorStop(1, 'rgba(100, 200, 180, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sh.x, -mh, sh.capW * s * 2, 0, Math.PI * 2);
          ctx.fill();
          // Stem
          ctx.fillStyle = '#e8e4da';
          ctx.beginPath();
          ctx.moveTo(sh.x - s * 0.02, 0);
          ctx.lineTo(sh.x - s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.02, 0);
          ctx.fill();
          // Glowing cap
          const capGrad = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s);
          capGrad.addColorStop(0, '#80ddc0');
          capGrad.addColorStop(0.5, '#60c0a0');
          capGrad.addColorStop(1, '#40a080');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s * 0.3, 0, 0, Math.PI);
          ctx.fill();
        });
      }
    },

    // === 4: Lavender ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.0) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed in soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Thin grass-like shoots
        const count = Math.floor(PlantRenderer._lerp(2, 4, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - count / 2 + 0.5) * s * 0.04;
          const h = PlantRenderer._lerp(0.08, 0.2, p) * s;
          const lean = (i - count / 2 + 0.5) * 0.1;
          ctx.strokeStyle = '#7a9a60';
          ctx.lineWidth = s * 0.015;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + lean * s * 0.1, -h * 0.5, dx + lean * s * 0.15, -h);
          ctx.stroke();
        }
      } else if (stage === 2) {
        // Multiple stems with narrow leaves
        const stems = 5;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.35;
          const lean = (i - stems / 2 + 0.5) * 0.06;
          const stemSway = Math.sin(time * 1.2 + i * 0.5) * 0.02;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, dx + (lean + stemSway) * s * 0.4, -h);
          ctx.stroke();
          // Small narrow leaves
          if (p > 0.3) {
            const lx = dx + lean * s * 0.2;
            const ly = -h * 0.4;
            PlantRenderer._leaf(ctx, lx - s * 0.02, ly, s * 0.04, s * 0.01, -0.3 + lean, '#8aaa70', null);
            PlantRenderer._leaf(ctx, lx + s * 0.02, ly - s * 0.08, s * 0.04, s * 0.01, 0.3 + lean, '#8aaa70', null);
          }
        }
      } else if (stage === 3) {
        // Purple bud clusters forming at tips
        const stems = 6;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.5;
          const lean = (i - stems / 2 + 0.5) * 0.05;
          const stemSway = Math.sin(time + i * 0.6) * 0.02;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, endX, endY);
          ctx.stroke();
          // Purple buds
          const budCount = Math.floor(PlantRenderer._lerp(2, 5, p));
          for (let b = 0; b < budCount; b++) {
            const bt = 0.6 + b * 0.08;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            ctx.fillStyle = '#8866aa';
            ctx.beginPath();
            ctx.arc(bx, by, s * 0.018, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Bloom: full purple flower spikes
        const stems = 6;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.07;
          const h = s * 0.6;
          const lean = (i - stems / 2 + 0.5) * 0.04;
          const stemSway = Math.sin(time * 0.8 + i * 0.7) * 0.025;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.25, -h * 0.5, endX, endY);
          ctx.stroke();
          // Narrow leaves
          const lx = dx + lean * s * 0.15;
          PlantRenderer._leaf(ctx, lx, -h * 0.2, s * 0.05, s * 0.012, -0.2 + lean, '#7a9a60', null);
          // Purple flower spike
          for (let b = 0; b < 8; b++) {
            const bt = 0.45 + b * 0.07;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            const flowerSize = s * 0.022;
            ctx.fillStyle = b % 2 === 0 ? '#9966cc' : '#7744aa';
            ctx.beginPath();
            ctx.arc(bx - flowerSize * 0.5, by, flowerSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bx + flowerSize * 0.5, by, flowerSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 5: Rainbow Tree (rare) ===
    function(ctx, stage, p, s, time) {
      const rainbow = ['#ff4444', '#ff8833', '#ffdd44', '#44cc44', '#4488ff', '#8844cc'];

      if (stage === 0) {
        // Iridescent seed
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        const colorIdx = Math.floor(time * 2) % rainbow.length;
        ctx.fillStyle = rainbow[colorIdx];
        ctx.globalAlpha = 0.5 + pulse * 0.3;
        ctx.beginPath();
        ctx.arc(0, -s * 0.03, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
      } else if (stage === 1) {
        // Crystalline sprout with color bands
        const h = PlantRenderer._lerp(0.1, 0.3, p) * s;
        const bandH = h / rainbow.length;
        for (let i = 0; i < rainbow.length; i++) {
          ctx.strokeStyle = rainbow[i];
          ctx.lineWidth = s * 0.04;
          ctx.beginPath();
          ctx.moveTo(0, -i * bandH);
          ctx.lineTo(0, -(i + 1) * bandH);
          ctx.stroke();
        }
      } else if (stage === 2) {
        // Trunk with shifting colors
        const h = PlantRenderer._lerp(0.3, 0.55, p) * s;
        // Color-shifting trunk
        for (let y = 0; y < h; y += 2) {
          const colorIdx = Math.floor((y / h) * rainbow.length + time * 0.5) % rainbow.length;
          ctx.strokeStyle = rainbow[colorIdx];
          ctx.lineWidth = s * 0.05 * (1 - y / h * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, -y);
          ctx.lineTo(0, -y - 2);
          ctx.stroke();
        }
        // First leaf hints
        if (p > 0.5) {
          ctx.fillStyle = rainbow[0];
          ctx.beginPath();
          ctx.arc(-s * 0.08, -h, s * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rainbow[3];
          ctx.beginPath();
          ctx.arc(s * 0.07, -h * 0.9, s * 0.035, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 3) {
        // Canopy with spectral leaves forming
        const h = s * 0.7;
        // Trunk
        ctx.fillStyle = '#886644';
        ctx.fillRect(-s * 0.04, 0, s * 0.08, -h * 0.6);
        // Forming canopy
        const canopyR = PlantRenderer._lerp(0.1, 0.25, p) * s;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.3;
          const lx = Math.cos(angle) * canopyR * 0.6;
          const ly = -h + Math.sin(angle) * canopyR * 0.4;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(lx, ly, canopyR * 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        // Bloom: full rainbow canopy with light rays
        const h = s * 0.85;
        // Trunk
        ctx.fillStyle = '#886644';
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, 0);
        ctx.lineTo(-s * 0.03, -h * 0.55);
        ctx.lineTo(s * 0.03, -h * 0.55);
        ctx.lineTo(s * 0.04, 0);
        ctx.fill();
        // Light rays
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 0.2;
          const rayLen = s * 0.5;
          ctx.strokeStyle = rainbow[i % rainbow.length];
          ctx.lineWidth = s * 0.04;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.7);
          ctx.lineTo(Math.cos(angle) * rayLen, -h * 0.7 + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();
        // Rainbow canopy
        const canopyR = s * 0.3;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.15;
          const cx = Math.cos(angle) * canopyR * 0.5;
          const cy = -h * 0.75 + Math.sin(angle) * canopyR * 0.35;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canopyR * 0.5);
          grad.addColorStop(0, color);
          grad.addColorStop(1, color.slice(0, -2) + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, canopyR * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Shimmer
        if (Math.sin(time * 4) > 0.8) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(Math.sin(time * 5) * s * 0.15, -h * 0.7 + Math.cos(time * 4) * s * 0.1, s * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },

    // === 6: Firework Flower (rare) ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Glowing ember seed
        const glow = ctx.createRadialGradient(0, -s * 0.02, 0, 0, -s * 0.02, s * 0.08);
        const pulse = 0.3 + Math.sin(time * 4) * 0.1;
        glow.addColorStop(0, `rgba(255, 150, 50, ${pulse})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6622';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Bright orange-red shoot
        const h = PlantRenderer._lerp(0.1, 0.25, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.04, '#cc4422');
        // Heat shimmer
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (stage === 2) {
        // Spiky stems, red-tipped leaves
        const h = PlantRenderer._lerp(0.25, 0.45, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#993320');
        // Spiky angular leaves
        const leafPositions = [
          { x: -s * 0.1, y: -h * 0.4, a: -0.8 },
          { x: s * 0.08, y: -h * 0.55, a: 0.7 },
          { x: -s * 0.06, y: -h * 0.7, a: -0.5 },
        ];
        leafPositions.forEach(lp => {
          // Angular leaf
          ctx.save();
          ctx.translate(lp.x, lp.y);
          ctx.rotate(lp.a);
          ctx.fillStyle = '#4a7728';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(s * 0.08, -s * 0.02);
          ctx.lineTo(s * 0.1, s * 0.01);
          ctx.closePath();
          ctx.fill();
          // Red tip
          ctx.fillStyle = '#cc3322';
          ctx.beginPath();
          ctx.arc(s * 0.09, 0, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (stage === 3) {
        // Tight bud cluster, pulsing glow
        const h = s * 0.55;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.85, s * 0.05, '#993320');
        // Leaves
        PlantRenderer._leaf(ctx, -s * 0.1, -h * 0.35, s * 0.08, s * 0.03, -0.7, '#4a7728', null);
        PlantRenderer._leaf(ctx, s * 0.08, -h * 0.5, s * 0.07, s * 0.025, 0.6, '#4a7728', null);
        // Pulsing bud cluster
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        const budR = PlantRenderer._lerp(0.05, 0.1, p) * s;
        const budGlow = ctx.createRadialGradient(0, -h, 0, 0, -h, budR * 2);
        budGlow.addColorStop(0, `rgba(255, 120, 40, ${0.3 * pulse})`);
        budGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = budGlow;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 2, 0, Math.PI * 2);
        ctx.fill();
        // Buds
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.fillStyle = '#dd5522';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * budR * 0.5, -h + Math.sin(a) * budR * 0.5, budR * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ff8844';
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bloom: explosive starburst
        const h = s * 0.6;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.8, s * 0.06, '#993320');
        PlantRenderer._leaf(ctx, -s * 0.1, -h * 0.3, s * 0.08, s * 0.03, -0.7, '#4a7728', null);

        const cx = 0;
        const cy = -h;
        const burstR = s * 0.3;
        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR * 1.5);
        const glowPulse = 0.2 + Math.sin(time * 2) * 0.05;
        glow.addColorStop(0, `rgba(255, 180, 80, ${glowPulse})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Radiating petal lines
        const colors = ['#ff3322', '#ff6633', '#ffaa44', '#ffdd66', '#ffffff'];
        const rayCount = 12;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + Math.sin(time) * 0.1;
          const colorIdx = Math.floor((i / rayCount) * colors.length);
          const len = burstR * (0.8 + Math.sin(time * 3 + i * 1.5) * 0.15);
          ctx.strokeStyle = colors[colorIdx % colors.length];
          ctx.lineWidth = s * 0.03;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * burstR * 0.15, cy + Math.sin(angle) * burstR * 0.15);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
          // Tip dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#ffcc44';
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  ],

  // Tray icon drawing (used by UI to show plant types in the selection tray)
  drawIcon(ctx, typeIndex, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    const s = size;
    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, 4, 1, s * 0.9, 0); // Draw bloom stage for icon
    ctx.restore();
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/plant-renderer.js
git commit -m "feat(v2): add detailed procedural plant renderer with 7 types x 5 growth stages"
```

---

### Task 8: animal-renderer.js — 6 Animal Types with Idle Animations

**Files:**
- Create: `game/js/animal-renderer.js`

Pure draw functions for 6 animals with fur texture, expressive eyes, and idle animations. Each animal's draw function takes `(ctx, scale, time, idleTimer, accessoryId)`.

- [ ] **Step 1: Create animal-renderer.js**

```javascript
// AnimalRenderer - Detailed procedural drawing for 6 animal types
// Pure draw functions. No state, no logic.
// ctx is pre-translated to animal's screen position.
// Each draw function handles idle animation internally via time/idleTimer.

const AnimalRenderer = {
  draw(ctx, typeIndex, scale, time, idleTimer, accessoryId) {
    const s = 35 * scale; // base size unit
    ctx.save();
    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, s, time, idleTimer);
    // Draw accessory on top
    if (accessoryId) {
      this.drawAccessory(ctx, typeIndex, accessoryId, s, time);
    }
    ctx.restore();
  },

  // Helper: draw eyes with highlight
  _eyes(ctx, leftX, rightX, y, size, blinkPhase) {
    const blink = Math.sin(blinkPhase) > 0.97 ? 0.2 : 1;
    // Left eye
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(leftX, y, size * 0.5, size * 0.5 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(rightX, y, size * 0.5, size * 0.5 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    if (blink > 0.5) {
      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(leftX + size * 0.15, y - size * 0.15, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightX + size * 0.15, y - size * 0.15, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // Helper: fur texture strokes
  _fur(ctx, x, y, radius, color, count) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.7 + Math.random() * 0.3);
      const len = radius * 0.15;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      ctx.lineTo(x + Math.cos(angle) * (r + len), y + Math.sin(angle) * (r + len));
      ctx.stroke();
    }
  },

  _types: [
    // === 0: Star Fox ===
    function(ctx, s, time, idleTimer) {
      const tailSway = Math.sin(time * 2.5) * 0.4;
      const earPerk = Math.sin(time * 1.5) > 0.7 ? s * 0.03 : 0;

      // Tail
      ctx.save();
      ctx.translate(s * 0.2, -s * 0.2);
      ctx.rotate(tailSway);
      ctx.fillStyle = '#e08830';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.3, -s * 0.1, s * 0.35, -s * 0.3);
      ctx.quadraticCurveTo(s * 0.25, -s * 0.15, s * 0.05, -s * 0.05);
      ctx.fill();
      // White tail tip
      ctx.fillStyle = '#fff8ee';
      ctx.beginPath();
      ctx.arc(s * 0.33, -s * 0.28, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Body
      ctx.fillStyle = '#e08830';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.22, s * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly
      ctx.fillStyle = '#fff0dd';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.1, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#e08830';
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // Muzzle
      ctx.fillStyle = '#fff0dd';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.32, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(0, -s * 0.34, s * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#e08830';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.47);
      ctx.lineTo(-s * 0.15, -s * 0.58 - earPerk);
      ctx.lineTo(-s * 0.04, -s * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.47);
      ctx.lineTo(s * 0.15, -s * 0.58 - earPerk);
      ctx.lineTo(s * 0.04, -s * 0.5);
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#ffccaa';
      ctx.beginPath();
      ctx.moveTo(-s * 0.09, -s * 0.48);
      ctx.lineTo(-s * 0.13, -s * 0.55 - earPerk);
      ctx.lineTo(-s * 0.05, -s * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.09, -s * 0.48);
      ctx.lineTo(s * 0.13, -s * 0.55 - earPerk);
      ctx.lineTo(s * 0.05, -s * 0.5);
      ctx.fill();

      // Eyes
      AnimalRenderer._eyes(ctx, -s * 0.06, s * 0.06, -s * 0.4, s * 0.04, time * 2.5);

      // Legs
      ctx.fillStyle = '#c07020';
      ctx.fillRect(-s * 0.15, -s * 0.05, s * 0.06, s * 0.06);
      ctx.fillRect(s * 0.09, -s * 0.05, s * 0.06, s * 0.06);
    },

    // === 1: Moon Bunny ===
    function(ctx, s, time, idleTimer) {
      const noseTwitch = Math.sin(time * 6) * s * 0.005;
      const hop = Math.sin(time * 1.2) > 0.9 ? Math.sin(time * 8) * s * 0.03 : 0;

      ctx.translate(0, -hop);

      // Body
      ctx.fillStyle = '#e8e0d8';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, s * 0.18, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail puff
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.16, -s * 0.08, s * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#e8e0d8';
      ctx.beginPath();
      ctx.arc(0, -s * 0.32, s * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Ears (long!)
      ctx.fillStyle = '#e0d8d0';
      ctx.beginPath();
      ctx.ellipse(-s * 0.05, -s * 0.55, s * 0.04, s * 0.15, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.05, -s * 0.55, s * 0.04, s * 0.15, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#ffcccc';
      ctx.beginPath();
      ctx.ellipse(-s * 0.05, -s * 0.55, s * 0.025, s * 0.1, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.05, -s * 0.55, s * 0.025, s * 0.1, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      AnimalRenderer._eyes(ctx, -s * 0.05, s * 0.05, -s * 0.34, s * 0.035, time * 3);

      // Nose
      ctx.fillStyle = '#ffaaaa';
      ctx.beginPath();
      ctx.arc(noseTwitch, -s * 0.28, s * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Feet
      ctx.fillStyle = '#d8d0c8';
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, 0, s * 0.05, s * 0.025, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.1, 0, s * 0.05, s * 0.025, 0.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // === 2: Comet Kitten ===
    function(ctx, s, time, idleTimer) {
      const isLicking = Math.sin(time * 0.3) > 0.8;
      const pawLift = isLicking ? Math.abs(Math.sin(time * 4)) * s * 0.08 : 0;

      // Tail (curled up)
      ctx.strokeStyle = '#666688';
      ctx.lineWidth = s * 0.04;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.1);
      const tailCurl = Math.sin(time * 1.5) * 0.3;
      ctx.quadraticCurveTo(s * 0.3, -s * 0.2, s * 0.25, -s * 0.35 + tailCurl * s * 0.1);
      ctx.stroke();

      // Body
      ctx.fillStyle = '#8888aa';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, s * 0.2, s * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly
      ctx.fillStyle = '#ccccdd';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.08, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#8888aa';
      ctx.beginPath();
      ctx.arc(0, -s * 0.3, s * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Ears (pointy)
      ctx.fillStyle = '#8888aa';
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.38);
      ctx.lineTo(-s * 0.12, -s * 0.52);
      ctx.lineTo(-s * 0.02, -s * 0.42);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.08, -s * 0.38);
      ctx.lineTo(s * 0.12, -s * 0.52);
      ctx.lineTo(s * 0.02, -s * 0.42);
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#ffcccc';
      ctx.beginPath();
      ctx.moveTo(-s * 0.07, -s * 0.39);
      ctx.lineTo(-s * 0.1, -s * 0.48);
      ctx.lineTo(-s * 0.03, -s * 0.42);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.07, -s * 0.39);
      ctx.lineTo(s * 0.1, -s * 0.48);
      ctx.lineTo(s * 0.03, -s * 0.42);
      ctx.fill();

      // Eyes
      AnimalRenderer._eyes(ctx, -s * 0.05, s * 0.05, -s * 0.32, s * 0.035, time * 2);

      // Nose + mouth
      ctx.fillStyle = '#ffaaaa';
      ctx.beginPath();
      ctx.arc(0, -s * 0.27, s * 0.015, 0, Math.PI * 2);
      ctx.fill();
      // Whiskers
      ctx.strokeStyle = 'rgba(200,200,220,0.5)';
      ctx.lineWidth = 0.5;
      [-1, 1].forEach(side => {
        for (let w = 0; w < 2; w++) {
          ctx.beginPath();
          ctx.moveTo(side * s * 0.04, -s * 0.27 + w * s * 0.02);
          ctx.lineTo(side * s * 0.15, -s * 0.28 + w * s * 0.03);
          ctx.stroke();
        }
      });

      // Front paws
      ctx.fillStyle = '#7777aa';
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, -s * 0.01 - pawLift, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.1, -s * 0.01, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    },

    // === 3: Nebula Owl ===
    function(ctx, s, time, idleTimer) {
      const headTilt = Math.sin(time * 0.7) * 0.15;
      const wingRuffle = Math.sin(time * 0.4) > 0.85 ? Math.sin(time * 6) * s * 0.03 : 0;

      // Body (round, fluffy)
      ctx.fillStyle = '#6a5a4a';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.2, s * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly disc
      ctx.fillStyle = '#c8b898';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.1, s * 0.12, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly pattern (V shapes)
      ctx.strokeStyle = '#a89878';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 4; i++) {
        const by = -s * 0.18 + i * s * 0.05;
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, by);
        ctx.lineTo(0, by + s * 0.03);
        ctx.lineTo(s * 0.04, by);
        ctx.stroke();
      }

      // Wings
      ctx.fillStyle = '#5a4a3a';
      // Left wing
      ctx.beginPath();
      ctx.ellipse(-s * 0.2 - wingRuffle, -s * 0.15, s * 0.08, s * 0.15, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.ellipse(s * 0.2 + wingRuffle, -s * 0.15, s * 0.08, s * 0.15, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.save();
      ctx.translate(0, -s * 0.38);
      ctx.rotate(headTilt);
      ctx.fillStyle = '#6a5a4a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      // Facial disc
      ctx.fillStyle = '#d8c8a8';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.01, s * 0.11, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      // Big round eyes
      ctx.fillStyle = '#ffaa22';
      ctx.beginPath();
      ctx.arc(-s * 0.05, -s * 0.01, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.05, -s * 0.01, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(-s * 0.05, -s * 0.01, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.05, -s * 0.01, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-s * 0.04, -s * 0.02, s * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.06, -s * 0.02, s * 0.01, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#aa8844';
      ctx.beginPath();
      ctx.moveTo(0, s * 0.02);
      ctx.lineTo(-s * 0.02, s * 0.06);
      ctx.lineTo(s * 0.02, s * 0.06);
      ctx.fill();
      // Ear tufts
      ctx.fillStyle = '#5a4a3a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.08);
      ctx.lineTo(-s * 0.12, -s * 0.18);
      ctx.lineTo(-s * 0.04, -s * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.08, -s * 0.08);
      ctx.lineTo(s * 0.12, -s * 0.18);
      ctx.lineTo(s * 0.04, -s * 0.1);
      ctx.fill();
      ctx.restore();

      // Feet
      ctx.fillStyle = '#aa8844';
      ctx.fillRect(-s * 0.08, -s * 0.01, s * 0.04, s * 0.03);
      ctx.fillRect(s * 0.04, -s * 0.01, s * 0.04, s * 0.03);
    },

    // === 4: Galaxy Deer ===
    function(ctx, s, time, idleTimer) {
      const earFlick = Math.sin(time * 2) > 0.85 ? Math.sin(time * 8) * 0.2 : 0;
      const headBow = Math.sin(time * 0.4) > 0.9 ? Math.sin(time * 2) * s * 0.04 : 0;

      // Body (elegant, longer)
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.2, s * 0.25, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly
      ctx.fillStyle = '#e8d8c0';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.15, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs (slender)
      ctx.fillStyle = '#b09068';
      const legs = [-s * 0.15, -s * 0.07, s * 0.07, s * 0.15];
      legs.forEach(lx => {
        ctx.fillRect(lx - s * 0.015, -s * 0.08, s * 0.03, s * 0.1);
        // Hoof
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(lx - s * 0.018, s * 0.01, s * 0.036, s * 0.02);
        ctx.fillStyle = '#b09068';
      });

      // Neck
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.3);
      ctx.quadraticCurveTo(0, -s * 0.45, 0, -s * 0.55 + headBow);
      ctx.quadraticCurveTo(s * 0.02, -s * 0.45, s * 0.05, -s * 0.3);
      ctx.fill();

      // Head
      ctx.save();
      ctx.translate(0, -s * 0.58 + headBow);
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.08, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Muzzle
      ctx.fillStyle = '#e0d0b8';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.04, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath();
      ctx.arc(0, s * 0.03, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      AnimalRenderer._eyes(ctx, -s * 0.04, s * 0.04, -s * 0.01, s * 0.025, time * 2);
      // Ears
      ctx.save();
      ctx.rotate(earFlick);
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.ellipse(-s * 0.07, -s * 0.06, s * 0.02, s * 0.05, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.07, -s * 0.06, s * 0.02, s * 0.05, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Small antlers (sparkly)
      ctx.strokeStyle = '#e8d8c0';
      ctx.lineWidth = s * 0.015;
      ctx.lineCap = 'round';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * s * 0.04, -s * 0.06);
        ctx.lineTo(side * s * 0.07, -s * 0.14);
        ctx.lineTo(side * s * 0.1, -s * 0.12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(side * s * 0.06, -s * 0.1);
        ctx.lineTo(side * s * 0.04, -s * 0.14);
        ctx.stroke();
      });
      ctx.restore();

      // Tail
      ctx.fillStyle = '#e8d8c0';
      ctx.beginPath();
      ctx.ellipse(s * 0.22, -s * 0.28, s * 0.03, s * 0.025, 0.3, 0, Math.PI * 2);
      ctx.fill();
    },

    // === 5: Aurora Bear Cub ===
    function(ctx, s, time, idleTimer) {
      const isYawning = Math.sin(time * 0.2) > 0.9;
      const yawnOpen = isYawning ? Math.abs(Math.sin(time * 3)) * s * 0.04 : 0;
      const bellyScratch = Math.sin(time * 0.5) > 0.85;
      const scratchOffset = bellyScratch ? Math.sin(time * 8) * s * 0.02 : 0;

      // Body (round, chubby)
      ctx.fillStyle = '#8b6b4a';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.18, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, s * 0.13, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#7a5b3a';
      ctx.beginPath();
      ctx.ellipse(-s * 0.14, 0, s * 0.06, s * 0.04, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.14, 0, s * 0.06, s * 0.04, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.fillStyle = '#8b6b4a';
      // Left arm (scratching if active)
      ctx.beginPath();
      ctx.ellipse(-s * 0.2, -s * 0.2 + scratchOffset, s * 0.05, s * 0.08, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.ellipse(s * 0.2, -s * 0.2, s * 0.05, s * 0.08, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#8b6b4a';
      ctx.beginPath();
      ctx.arc(0, -s * 0.42, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // Muzzle
      ctx.fillStyle = '#c8a878';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.36, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.38, s * 0.025, s * 0.018, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mouth / yawn
      if (yawnOpen > 0) {
        ctx.fillStyle = '#cc6666';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.33, s * 0.03, yawnOpen, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Round ears
      ctx.fillStyle = '#8b6b4a';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.53, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.1, -s * 0.53, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#a88868';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.53, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.1, -s * 0.53, s * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      AnimalRenderer._eyes(ctx, -s * 0.055, s * 0.055, -s * 0.44, s * 0.03, time * 1.5);
    },
  ],

  // Accessory drawing - relative to animal's coordinate space
  drawAccessory(ctx, animalType, accId, s, time) {
    const accFns = {
      crown: (ctx, s) => {
        const y = -s * 0.55;
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.moveTo(-s * 0.06, y);
        ctx.lineTo(-s * 0.08, y - s * 0.08);
        ctx.lineTo(-s * 0.03, y - s * 0.05);
        ctx.lineTo(0, y - s * 0.1);
        ctx.lineTo(s * 0.03, y - s * 0.05);
        ctx.lineTo(s * 0.08, y - s * 0.08);
        ctx.lineTo(s * 0.06, y);
        ctx.closePath();
        ctx.fill();
        // Gems
        ctx.fillStyle = '#ff4466';
        ctx.beginPath(); ctx.arc(0, y - s * 0.07, s * 0.012, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#44bbff';
        ctx.beginPath(); ctx.arc(-s * 0.04, y - s * 0.04, s * 0.008, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.04, y - s * 0.04, s * 0.008, 0, Math.PI * 2); ctx.fill();
      },
      bow: (ctx, s) => {
        const y = -s * 0.52;
        ctx.fillStyle = '#ff66aa';
        // Left loop
        ctx.beginPath();
        ctx.ellipse(-s * 0.05, y, s * 0.04, s * 0.025, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right loop
        ctx.beginPath();
        ctx.ellipse(s * 0.05, y, s * 0.04, s * 0.025, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Center knot
        ctx.fillStyle = '#dd4488';
        ctx.beginPath(); ctx.arc(0, y, s * 0.015, 0, Math.PI * 2); ctx.fill();
      },
      sunglasses: (ctx, s) => {
        const y = -s * 0.4;
        ctx.fillStyle = '#2a2a4a';
        // Left lens (star shape simplified as circle)
        ctx.beginPath(); ctx.arc(-s * 0.06, y, s * 0.035, 0, Math.PI * 2); ctx.fill();
        // Right lens
        ctx.beginPath(); ctx.arc(s * 0.06, y, s * 0.035, 0, Math.PI * 2); ctx.fill();
        // Bridge
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = s * 0.015;
        ctx.beginPath();
        ctx.moveTo(-s * 0.03, y);
        ctx.lineTo(s * 0.03, y);
        ctx.stroke();
        // Reflection
        ctx.fillStyle = 'rgba(100,200,255,0.3)';
        ctx.beginPath(); ctx.arc(-s * 0.05, y - s * 0.01, s * 0.015, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.07, y - s * 0.01, s * 0.015, 0, Math.PI * 2); ctx.fill();
      },
      wreath: (ctx, s) => {
        const y = -s * 0.52;
        const r = s * 0.08;
        const flowerColors = ['#ff6666', '#ffaa44', '#ff66cc', '#66bbff', '#88dd66'];
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          ctx.fillStyle = flowerColors[i % flowerColors.length];
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, y + Math.sin(a) * r * 0.4, s * 0.018, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      wings: (ctx, s) => {
        const y = -s * 0.25;
        ctx.globalAlpha = 0.4;
        const wingFlap = Math.sin(time * 3) * 0.15;
        [-1, 1].forEach(side => {
          ctx.save();
          ctx.translate(side * s * 0.2, y);
          ctx.rotate(side * (0.3 + wingFlap));
          const grad = ctx.createLinearGradient(0, -s * 0.15, side * s * 0.15, s * 0.05);
          grad.addColorStop(0, '#aaddff');
          grad.addColorStop(0.5, '#ddaaff');
          grad.addColorStop(1, '#ffaadd');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(side * s * 0.08, 0, s * 0.12, s * 0.06, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Vein lines
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(side * s * 0.15, -s * 0.02);
          ctx.stroke();
          ctx.restore();
        });
        ctx.globalAlpha = 1;
      },
      cape: (ctx, s) => {
        const y = -s * 0.32;
        const wave = Math.sin(time * 2) * s * 0.02;
        const grad = ctx.createLinearGradient(0, y, 0, y + s * 0.3);
        grad.addColorStop(0, '#8833cc');
        grad.addColorStop(1, '#6622aa');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, y);
        ctx.quadraticCurveTo(-s * 0.15 + wave, y + s * 0.15, -s * 0.12, y + s * 0.28);
        ctx.lineTo(s * 0.12, y + s * 0.28);
        ctx.quadraticCurveTo(s * 0.15 - wave, y + s * 0.15, s * 0.12, y);
        ctx.closePath();
        ctx.fill();
      },
      scarf: (ctx, s) => {
        const y = -s * 0.32;
        const colors = ['#cc4444', '#44cc44'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = colors[i % 2];
          const w = s * 0.14;
          const h = s * 0.03;
          ctx.fillRect(-w / 2, y + i * h, w, h);
        }
        // Dangling end
        const dangle = Math.sin(time * 1.5) * s * 0.01;
        ctx.fillStyle = '#cc4444';
        ctx.fillRect(s * 0.05, y + s * 0.04, s * 0.03, s * 0.08 + dangle);
      },
      collar: (ctx, s) => {
        const y = -s * 0.3;
        ctx.strokeStyle = '#cc3333';
        ctx.lineWidth = s * 0.025;
        ctx.beginPath();
        ctx.arc(0, y, s * 0.08, 0.3, Math.PI - 0.3);
        ctx.stroke();
        // Bell
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(0, y + s * 0.05, s * 0.02, 0, Math.PI * 2);
        ctx.fill();
      },
      tophat: (ctx, s) => {
        const y = -s * 0.55;
        ctx.fillStyle = '#2a2a2a';
        // Brim
        ctx.beginPath();
        ctx.ellipse(0, y, s * 0.09, s * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cylinder
        ctx.fillRect(-s * 0.05, y - s * 0.1, s * 0.1, s * 0.1);
        // Top
        ctx.beginPath();
        ctx.ellipse(0, y - s * 0.1, s * 0.05, s * 0.015, 0, 0, Math.PI * 2);
        ctx.fill();
        // Band
        ctx.fillStyle = '#cc3344';
        ctx.fillRect(-s * 0.05, y - s * 0.04, s * 0.1, s * 0.02);
      },
      butterfly: (ctx, s) => {
        const y = -s * 0.48;
        const x = s * 0.1;
        const wingOpen = 0.3 + Math.sin(time * 2) * 0.15;
        ctx.save();
        ctx.translate(x, y);
        // Wings
        ctx.fillStyle = '#ff88cc';
        ctx.beginPath();
        ctx.ellipse(-s * 0.02, 0, s * 0.03, s * 0.02, -wingOpen, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.02, 0, s * 0.03, s * 0.02, wingOpen, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(-s * 0.003, -s * 0.015, s * 0.006, s * 0.03);
        ctx.restore();
      },
      backpack: (ctx, s) => {
        const y = -s * 0.25;
        const x = s * 0.18;
        ctx.fillStyle = '#448844';
        ctx.fillRect(x - s * 0.04, y - s * 0.06, s * 0.08, s * 0.1);
        // Flap
        ctx.fillStyle = '#336633';
        ctx.fillRect(x - s * 0.04, y - s * 0.06, s * 0.08, s * 0.03);
        // Strap
        ctx.strokeStyle = '#336633';
        ctx.lineWidth = s * 0.01;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.04, y - s * 0.05);
        ctx.lineTo(x - s * 0.08, y - s * 0.02);
        ctx.stroke();
      },
      halo: (ctx, s) => {
        const y = -s * 0.62;
        const bob = Math.sin(time * 2) * s * 0.01;
        ctx.strokeStyle = '#ffdd44';
        ctx.lineWidth = s * 0.02;
        ctx.beginPath();
        ctx.ellipse(0, y + bob, s * 0.08, s * 0.025, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Glow
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.ellipse(0, y + bob, s * 0.1, s * 0.035, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      },
    };

    if (accFns[accId]) {
      accFns[accId](ctx, s);
    }
  },

  // Tray icon for animals (used by UI if needed)
  drawIcon(ctx, typeIndex, x, y, size) {
    ctx.save();
    ctx.translate(x, y + size * 0.3);
    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, size * 0.8, 0, 0);
    ctx.restore();
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/animal-renderer.js
git commit -m "feat(v2): add detailed animal renderer with 6 types, idle animations, 12 accessories"
```

---

### Task 9: particles.js — Particle System

**Files:**
- Rewrite: `game/js/particles.js`

Adapted for the new camera/viewport system. Particles use screen coordinates directly (they are visual effects, not world-positioned). Adds spore particles for mushroom bloom and spark particles for firework bloom.

- [ ] **Step 1: Rewrite particles.js**

```javascript
// Particles - Visual particle effects (sparkles, splashes, spores, sparks)
// Particles live in screen coordinates — they are ephemeral visual effects, not world objects.

const Particles = {
  items: [],

  // Emit a burst of particles at screen position (x, y)
  // options: { count, color, colors[], speed, life, size, gravity, spread, angle }
  emit(x, y, options = {}) {
    const count = options.count || 8;
    const speed = options.speed || 80;
    const life = options.life || 0.8;
    const size = options.size || 3;
    const gravity = options.gravity || 0;
    const spread = options.spread || Math.PI * 2;
    const baseAngle = options.angle || 0;
    const colors = options.colors || [options.color || '#ffffff'];

    for (let i = 0; i < count; i++) {
      const a = baseAngle - spread / 2 + Math.random() * spread;
      const spd = speed * (0.4 + Math.random() * 0.6);
      this.items.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity,
        alpha: 1,
        isStar: false,
      });
    }
  },

  // Bloom burst — large colorful explosion for plant bloom events
  emitBloom(x, y, colors) {
    // Main burst
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 20,
        alpha: 1,
        isStar: false,
      });
    }
    // Star sparkles
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        size: 4 + Math.random() * 3,
        color: '#ffffff',
        gravity: 10,
        alpha: 1,
        isStar: true,
      });
    }
  },

  // Ambient sparkle near bloomed plants — called per frame, low chance to emit
  emitAmbient(x, y, color) {
    if (Math.random() > 0.02) return;
    this.items.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y - Math.random() * 40,
      vx: (Math.random() - 0.5) * 10,
      vy: -10 - Math.random() * 15,
      life: 0.8 + Math.random() * 0.5,
      maxLife: 1.3,
      size: 1.5 + Math.random() * 2,
      color,
      gravity: -5,
      alpha: 1,
      isStar: Math.random() < 0.3,
    });
  },

  // Water splash — emitted when a water droplet hits a plant
  emitSplash(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 50 + Math.random() * 80;
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 2 + Math.random() * 2,
        color: Math.random() < 0.5 ? '#88ccff' : '#aaddff',
        gravity: 120,
        alpha: 1,
        isStar: false,
      });
    }
  },

  // Spore particles — float upward slowly from mushroom blooms
  emitSpores(x, y) {
    for (let i = 0; i < 8; i++) {
      this.items.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - Math.random() * 10,
        vx: (Math.random() - 0.5) * 8,
        vy: -15 - Math.random() * 20,
        life: 1.5 + Math.random() * 1.0,
        maxLife: 2.5,
        size: 1 + Math.random() * 1.5,
        color: Math.random() < 0.5 ? '#aaffaa' : '#ccffcc',
        gravity: -3,
        alpha: 0.7,
        isStar: false,
      });
    }
  },

  // Spark particles — burst from firework flower bloom
  emitSparks(x, y) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;
      const colors = ['#ff4422', '#ff8844', '#ffcc22', '#ffffff'];
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.5,
        maxLife: 0.8,
        size: 1.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 40,
        alpha: 1,
        isStar: true,
      });
    }
  },

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.vx *= 0.98;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.items.splice(i, 1);
      }
    }
  },

  draw(ctx) {
    const time = Game.time;
    for (const p of this.items) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.isStar) {
        // Star-shaped particle
        ctx.translate(p.x, p.y);
        ctx.rotate(time * 3 + p.x);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const r = p.size;
          const ri = p.size * 0.4;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          const a2 = a + Math.PI / 5;
          ctx.lineTo(Math.cos(a2) * ri, Math.sin(a2) * ri);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Glowing circle particle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/particles.js
git commit -m "feat(v2): rewrite particle system with splash, spore, and spark effects"
```

---

### Task 10: plants.js — Plant Data & Growth State Machine

**Files:**
- Rewrite: `game/js/plants.js`

Manages plant array, growth stages (0-4), growth animation, placement, hit testing, and drawing via PlantRenderer. Each plant stores `{ typeIndex, angle, depth, growthStage, growthProgress, growthAnimating, plantedTime }`.

- [ ] **Step 1: Rewrite plants.js**

```javascript
// Plants - Plant data, growth state machine, placement, hit testing
// Depends on: Camera, PlantRenderer, Game

const PlantTypes = [
  { id: 'roseBush',       name: 'Rose Bush',        bloomColors: ['#cc3355', '#ff6688', '#ee4466', '#ffaacc', '#ffffff'] },
  { id: 'sunflower',      name: 'Sunflower',        bloomColors: ['#ffcc22', '#ffdd44', '#eeaa00', '#ffee66', '#ffffff'] },
  { id: 'willowTree',     name: 'Willow Tree',      bloomColors: ['#88cc88', '#66aa66', '#aaddaa', '#bbeeaa', '#ffffff'] },
  { id: 'mushroomCluster', name: 'Mushroom Cluster', bloomColors: ['#aaffaa', '#ccffcc', '#88ee88', '#ddfedd', '#ffffff'] },
  { id: 'lavender',       name: 'Lavender',         bloomColors: ['#9966cc', '#bb88dd', '#7744aa', '#ddbbff', '#ffffff'] },
  // Rare types — unlocked via seed rewards
  { id: 'rainbowTree',    name: 'Rainbow Tree',     bloomColors: ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#8844cc'], seedId: 'seed_rainbowTree' },
  { id: 'fireworkFlower',  name: 'Firework Flower', bloomColors: ['#ff4422', '#ff8844', '#ffcc22', '#ffffff', '#ffee88'], seedId: 'seed_fireworkFlower' },
];

const Plants = {
  items: [],       // { typeIndex, angle, depth, growthStage, growthProgress, growthAnimating, plantedTime }
  selectedType: -1, // index into PlantTypes, -1 = none

  addPlant(typeIndex, angle, depth) {
    const plant = {
      typeIndex,
      angle,
      depth,
      growthStage: 0,       // 0=seed, 1=sprout, 2=young, 3=mature, 4=bloom
      growthProgress: 1.0,  // start fully "arrived" in seed stage
      growthAnimating: false,
      plantedTime: Game.time,
    };
    this.items.push(plant);
    return plant;
  },

  // Water a plant: advance growth stage, trigger grow animation
  // Returns true if watered, false if already fully bloomed
  waterPlant(plant) {
    if (plant.growthStage >= 4) return false;
    plant.growthStage++;
    plant.growthProgress = 0;
    plant.growthAnimating = true;
    return true;
  },

  // Check if a plant is fully bloomed
  isBloomed(plant) {
    return plant.growthStage >= 4;
  },

  // Count total blooms
  bloomCount() {
    let count = 0;
    for (const p of this.items) {
      if (p.growthStage >= 4) count++;
    }
    return count;
  },

  update(dt) {
    // Animate growth transitions
    for (const plant of this.items) {
      if (plant.growthAnimating) {
        plant.growthProgress += dt * 2.0; // 0.5s to fully animate
        if (plant.growthProgress >= 1.0) {
          plant.growthProgress = 1.0;
          plant.growthAnimating = false;
        }
      }
    }
  },

  // Hit-test: find plant near screen coordinates
  // Returns plant or null. Checks all plants, returns closest to tap.
  findPlantAt(screenX, screenY) {
    let closest = null;
    let closestDist = Infinity;
    for (const plant of this.items) {
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      if (!pos.visible) continue;
      const hitRadius = 35 * pos.scale;
      const dx = screenX - pos.x;
      const dy = screenY - (pos.y - hitRadius * 0.5); // center hitbox on plant body
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius && dist < closestDist) {
        closest = plant;
        closestDist = dist;
      }
    }
    return closest;
  },

  // Draw all plants, sorted by depth (furthest first)
  // Returns array of { plant, x, y, scale } for depth-sorting in main.js render pipeline
  getSortedDrawList() {
    const list = [];
    for (const plant of this.items) {
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      if (!pos.visible) continue;
      list.push({ plant, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single plant at screen position
  drawPlant(ctx, plant, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    PlantRenderer.draw(ctx, plant.typeIndex, plant.growthStage, plant.growthProgress, scale, Game.time);
    ctx.restore();
  },

  // Draw placement hints when a type is selected
  drawPlacementHints(ctx) {
    if (this.selectedType < 0) return;
    const time = Game.time;
    // Show 8 pulsing circles on the ground surface
    for (let i = 0; i < 8; i++) {
      const angle = Camera.rotation + (i / 8 - 0.5) * Camera.visibleArc * 0.7;
      const depth = 0.3 + (i % 3) * 0.2;
      const pos = Camera.worldToScreen(angle, depth);
      if (!pos.visible) continue;
      const pulse = 0.7 + Math.sin(time * 3 + i) * 0.3;
      const radius = 15 * pos.scale * pulse;
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(time * 2 + i * 0.7) * 0.1;
      ctx.fillStyle = '#aaffaa';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/plants.js
git commit -m "feat(v2): rewrite plants with 5-stage growth state machine and camera integration"
```

---

### Task 11: animals.js — 6 Animal Types, Arrival & Tap Handling

**Files:**
- Rewrite: `game/js/animals.js`

Manages animal array, bloom-count-based arrival, walk-in animation, 3-tap sound cycle, accessory state. Each animal: `{ typeIndex, angle, depth, tapCount, accessory, arrivalTime, settled, idleTimer, targetAngle, targetDepth }`.

- [ ] **Step 1: Rewrite animals.js**

```javascript
// Animals - Animal data, arrival logic, tap handling, 3-tap sound cycle
// Depends on: Camera, AnimalRenderer, Plants, Particles, GameAudio, Game

const AnimalTypes = [
  { id: 'starFox',      name: 'Star Fox',        bloomThreshold: 3,  color: '#ff8844' },
  { id: 'moonBunny',    name: 'Moon Bunny',       bloomThreshold: 5,  color: '#ddddff' },
  { id: 'cometKitten',  name: 'Comet Kitten',     bloomThreshold: 8,  color: '#ffbb88' },
  { id: 'nebulaOwl',    name: 'Nebula Owl',       bloomThreshold: 12, color: '#886644' },
  { id: 'galaxyDeer',   name: 'Galaxy Deer',      bloomThreshold: 17, color: '#cc9966' },
  { id: 'auroraBear',   name: 'Aurora Bear Cub',  bloomThreshold: 23, color: '#8877aa' },
];

const Animals = {
  items: [],       // Array of animal objects
  nextTypeIndex: 0, // which animal type spawns next
  lastCheckBloomCount: 0, // bloom count at last spawn check

  update(dt) {
    // Check if we should spawn a new animal
    const totalBlooms = Plants.bloomCount();
    if (this.nextTypeIndex < AnimalTypes.length) {
      const nextType = AnimalTypes[this.nextTypeIndex];
      if (totalBlooms >= nextType.bloomThreshold && totalBlooms > this.lastCheckBloomCount) {
        this.spawnAnimal(this.nextTypeIndex);
        this.lastCheckBloomCount = totalBlooms;
        this.nextTypeIndex++;
      }
    }

    // Update each animal
    for (const animal of this.items) {
      // Walk-in animation: move toward target position
      if (!animal.settled) {
        const elapsed = Game.time - animal.arrivalTime;
        const walkDuration = 1.5;
        if (elapsed >= walkDuration) {
          animal.settled = true;
          animal.angle = animal.targetAngle;
          animal.depth = animal.targetDepth;
        } else {
          const t = elapsed / walkDuration;
          const ease = t * (2 - t); // ease-out
          // Walk in from off-screen (start angle is offset from target)
          animal.angle = animal.startAngle + (animal.targetAngle - animal.startAngle) * ease;
          animal.depth = animal.startDepth + (animal.targetDepth - animal.startDepth) * ease;
        }
      }
      // Update idle timer
      animal.idleTimer += dt;
    }
  },

  spawnAnimal(typeIndex) {
    // Find a bloomed plant to spawn near
    const bloomedPlants = Plants.items.filter(p => p.growthStage >= 4);
    let targetAngle, targetDepth;
    if (bloomedPlants.length > 0) {
      const plant = bloomedPlants[Math.floor(Math.random() * bloomedPlants.length)];
      targetAngle = plant.angle + (Math.random() - 0.5) * 0.15;
      targetDepth = Math.min(0.95, plant.depth + 0.05 + Math.random() * 0.1);
    } else {
      targetAngle = Camera.rotation + (Math.random() - 0.5) * Camera.visibleArc * 0.5;
      targetDepth = 0.3 + Math.random() * 0.4;
    }

    // Start from off-screen (far left or right)
    const side = Math.random() < 0.5 ? -1 : 1;
    const startAngle = targetAngle + side * Camera.visibleArc * 0.7;
    const startDepth = targetDepth;

    const animal = {
      typeIndex,
      angle: startAngle,
      depth: startDepth,
      targetAngle,
      targetDepth,
      startAngle,
      startDepth,
      tapCount: 0,
      accessory: null,
      arrivalTime: Game.time,
      settled: false,
      idleTimer: Math.random() * 10, // randomize idle phase
    };

    this.items.push(animal);
    GameAudio.playAnimalArrive(typeIndex);
  },

  // Handle tap on animal — returns animal if hit, null if miss
  handleTap(screenX, screenY) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const animal = this.items[i];
      const pos = Camera.worldToScreen(animal.angle, animal.depth);
      if (!pos.visible) continue;
      const hitRadius = 30 * pos.scale;
      const dx = screenX - pos.x;
      const dy = screenY - (pos.y - hitRadius * 0.3);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius) {
        // Cycle through 3 tap sounds: 0, 1, 2, 0, 1, 2, ...
        const soundIndex = animal.tapCount % 3;
        GameAudio.playAnimalTap(animal.typeIndex, soundIndex);
        animal.tapCount++;
        animal.idleTimer = 0; // reset idle to trigger fresh animation

        // Emit particles
        Particles.emit(pos.x, pos.y - hitRadius * 0.5, {
          count: 6,
          colors: [AnimalTypes[animal.typeIndex].color, '#ffffff', '#ffddaa'],
          speed: 40,
          life: 0.5,
          size: 3,
          gravity: 15,
          spread: Math.PI,
          angle: -Math.PI / 2,
        });
        return animal;
      }
    }
    return null;
  },

  // Get draw list for depth-sorting in main.js
  getSortedDrawList() {
    const list = [];
    for (const animal of this.items) {
      const pos = Camera.worldToScreen(animal.angle, animal.depth);
      if (!pos.visible) continue;
      list.push({ animal, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single animal at screen position
  drawAnimal(ctx, animal, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    AnimalRenderer.draw(ctx, animal.typeIndex, scale, Game.time, animal.idleTimer, animal.accessory);
    ctx.restore();
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/animals.js
git commit -m "feat(v2): rewrite animals with 6 types, bloom-threshold arrival, walk-in animation"
```

---

### Task 12: decorations.js — 5 Decoration Types with Detailed Rendering

**Files:**
- Rewrite: `game/js/decorations.js`

5 decoration types placed on the ground surface. Each rendered procedurally with details matching the spec: bridge (wooden planks, railing), lantern (post + glow), pond (oval water, ripples), arch (stone + rainbow), tower (stone blocks, flag, window glow). Decorations are positioned in world coordinates (angle, depth) and depth-sorted with plants and animals.

Note: In v2, accessory rendering is handled by AnimalRenderer.drawAccessory() called from within AnimalRenderer.draw(). Decorations no longer draws accessories.

- [ ] **Step 1: Rewrite decorations.js**

```javascript
// Decorations - 5 decoration types, placement on ground, detailed procedural rendering
// Depends on: Camera, Game

const DecorationDefs = {
  bridge: {
    name: 'Tiny Bridge',
    draw(ctx, s, time) {
      // Arched wooden plank bridge
      const w = s * 0.6;
      const h = s * 0.25;
      // Arch shape
      ctx.strokeStyle = '#8b6b3a';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(0, -h, w / 2, 0);
      ctx.stroke();
      // Planks
      ctx.fillStyle = '#a07040';
      const plankCount = 7;
      for (let i = 0; i < plankCount; i++) {
        const t = i / (plankCount - 1);
        const px = -w / 2 + t * w;
        const py = -Math.sin(t * Math.PI) * h;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-Math.cos(t * Math.PI) * 0.3);
        ctx.fillRect(-s * 0.03, -s * 0.015, s * 0.06, s * 0.03);
        ctx.restore();
      }
      // Railings (left and right posts)
      ctx.strokeStyle = '#7a5a2a';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + s * 0.03, 0);
      ctx.lineTo(-w / 2 + s * 0.03, -h * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - s * 0.03, 0);
      ctx.lineTo(w / 2 - s * 0.03, -h * 0.6);
      ctx.stroke();
      // Railing rope
      ctx.strokeStyle = '#9a7a4a';
      ctx.lineWidth = s * 0.012;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + s * 0.03, -h * 0.5);
      ctx.quadraticCurveTo(0, -h * 1.1, w / 2 - s * 0.03, -h * 0.5);
      ctx.stroke();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  lantern: {
    name: 'Glow Lantern',
    draw(ctx, s, time) {
      // Post
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(-s * 0.02, -s * 0.35, s * 0.04, s * 0.35);
      // Lantern body
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // Glass panels
      ctx.fillStyle = '#ffee88';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Top cap
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.43);
      ctx.lineTo(0, -s * 0.48);
      ctx.lineTo(s * 0.05, -s * 0.43);
      ctx.closePath();
      ctx.fill();
      // Light glow on ground
      const pulse = 0.7 + Math.sin(time * 2) * 0.3;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.3 * pulse);
      grad.addColorStop(0, 'rgba(255, 200, 80, 0.15)');
      grad.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Light glow around lantern
      const lGrad = ctx.createRadialGradient(0, -s * 0.38, 0, 0, -s * 0.38, s * 0.15 * pulse);
      lGrad.addColorStop(0, 'rgba(255, 220, 100, 0.3)');
      lGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.15 * pulse, 0, Math.PI * 2);
      ctx.fill();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  pond: {
    name: 'Crystal Pond',
    draw(ctx, s, time) {
      // Water surface oval
      const w = s * 0.5;
      const h = s * 0.2;
      // Darker edge
      ctx.fillStyle = '#3388bb';
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner water
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8);
      grad.addColorStop(0, '#66bbee');
      grad.addColorStop(0.6, '#4499cc');
      grad.addColorStop(1, '#3377aa');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.9, h * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      // Reflection highlights
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#aaddff';
      ctx.beginPath();
      ctx.ellipse(-w * 0.2, -h * 0.2, w * 0.15, h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Ripple rings
      const ripplePhase = (time * 0.8) % 1;
      ctx.save();
      ctx.globalAlpha = 0.2 * (1 - ripplePhase);
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.ellipse(w * 0.1, h * 0.1, w * 0.2 * ripplePhase + w * 0.05, h * 0.15 * ripplePhase + h * 0.04, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Second ripple offset
      const rp2 = ((time * 0.8) + 0.5) % 1;
      ctx.save();
      ctx.globalAlpha = 0.15 * (1 - rp2);
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.ellipse(-w * 0.15, -h * 0.05, w * 0.15 * rp2 + w * 0.03, h * 0.12 * rp2 + h * 0.03, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  arch: {
    name: 'Rainbow Arch',
    draw(ctx, s, time) {
      // Stone pillars
      ctx.fillStyle = '#888888';
      ctx.fillRect(-s * 0.25, -s * 0.35, s * 0.06, s * 0.35);
      ctx.fillRect(s * 0.19, -s * 0.35, s * 0.06, s * 0.35);
      // Stone blocks texture
      ctx.strokeStyle = '#777777';
      ctx.lineWidth = s * 0.005;
      for (let row = 0; row < 4; row++) {
        const y = -s * 0.08 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, y);
        ctx.lineTo(-s * 0.19, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.19, y);
        ctx.lineTo(s * 0.25, y);
        ctx.stroke();
      }
      // Stone arch top
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(0, -s * 0.35, s * 0.25, Math.PI, 0);
      ctx.lineTo(s * 0.19, -s * 0.35);
      ctx.arc(0, -s * 0.35, s * 0.19, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();
      // Rainbow band above arch
      const rainbow = ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#8844cc'];
      const bandWidth = s * 0.015;
      for (let i = 0; i < rainbow.length; i++) {
        const r = s * 0.28 + i * bandWidth;
        ctx.strokeStyle = rainbow[i];
        ctx.lineWidth = bandWidth;
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, r, Math.PI, 0);
        ctx.stroke();
      }
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  tower: {
    name: 'Castle Tower',
    draw(ctx, s, time) {
      // Tower body (stone)
      ctx.fillStyle = '#999999';
      ctx.fillRect(-s * 0.08, -s * 0.5, s * 0.16, s * 0.5);
      // Stone block lines
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = s * 0.005;
      for (let row = 0; row < 6; row++) {
        const y = -s * 0.08 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.08, y);
        ctx.lineTo(s * 0.08, y);
        ctx.stroke();
        // Offset vertical lines per row
        const offset = (row % 2) * s * 0.04;
        ctx.beginPath();
        ctx.moveTo(-s * 0.04 + offset, y);
        ctx.lineTo(-s * 0.04 + offset, y - s * 0.08);
        ctx.stroke();
      }
      // Battlements
      ctx.fillStyle = '#aaaaaa';
      for (let i = 0; i < 3; i++) {
        const bx = -s * 0.08 + i * s * 0.06;
        ctx.fillRect(bx, -s * 0.55, s * 0.04, s * 0.05);
      }
      // Window with glow
      const glowPulse = 0.6 + Math.sin(time * 1.5) * 0.4;
      const wGrad = ctx.createRadialGradient(0, -s * 0.32, 0, 0, -s * 0.32, s * 0.06);
      wGrad.addColorStop(0, `rgba(255, 220, 100, ${0.4 * glowPulse})`);
      wGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.32, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // Window frame
      ctx.fillStyle = '#ffdd66';
      ctx.fillRect(-s * 0.02, -s * 0.35, s * 0.04, s * 0.05);
      ctx.beginPath();
      ctx.arc(0, -s * 0.35, s * 0.02, Math.PI, 0);
      ctx.fill();
      // Flag on top
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55);
      ctx.lineTo(0, -s * 0.7);
      ctx.stroke();
      // Flag cloth
      const wave = Math.sin(time * 3) * s * 0.01;
      ctx.fillStyle = '#cc3344';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(s * 0.08, -s * 0.67 + wave);
      ctx.lineTo(s * 0.07, -s * 0.63 + wave);
      ctx.lineTo(0, -s * 0.65);
      ctx.closePath();
      ctx.fill();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },
};

const DecorationIds = ['bridge', 'lantern', 'pond', 'arch', 'tower'];

const Decorations = {
  placed: [],  // { id, angle, depth }

  placeDecoration(decoId, angle, depth) {
    this.placed.push({ id: decoId, angle, depth });
  },

  // Get draw list for depth-sorting in main.js
  getSortedDrawList() {
    const list = [];
    for (const deco of this.placed) {
      const pos = Camera.worldToScreen(deco.angle, deco.depth);
      if (!pos.visible) continue;
      list.push({ deco, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single decoration at screen position
  drawDecoration(ctx, deco, x, y, scale) {
    const def = DecorationDefs[deco.id];
    if (!def) return;
    ctx.save();
    ctx.translate(x, y);
    const s = 40 * scale;
    def.draw(ctx, s, Game.time);
    ctx.restore();
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/decorations.js
git commit -m "feat(v2): rewrite decorations with 5 detailed procedural types"
```

---

### Task 13: shooting-stars.js — Faster Spawns, Realistic Water Droplet

**Files:**
- Rewrite: `game/js/shooting-stars.js`

Shooting stars fly across the sky (above horizon). Spawn rate: every 3-4 seconds. Catchable by tap/drag. Transforms into teardrop water droplet with trailing mini-droplets. Droplet is dragged onto plants to water them (advance growth stage).

- [ ] **Step 1: Rewrite shooting-stars.js**

```javascript
// ShootingStars - Star flight above horizon, water droplet mechanic, watering plants
// Depends on: Camera, Game, Plants, Particles

const ShootingStars = {
  items: [],          // Active shooting stars in the sky
  spawnTimer: 2,      // seconds until next spawn
  spawnInterval: 3,   // base interval (randomized 3-4s)
  droplet: null,      // { x, y, trail: [{x,y}] } — the water droplet being dragged
  isDraggingDroplet: false,

  update(dt) {
    // Spawn timer
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnStar();
      this.spawnTimer = this.spawnInterval + Math.random() * 1.0;
    }

    // Move stars
    for (let i = this.items.length - 1; i >= 0; i--) {
      const star = this.items[i];
      star.x += star.vx * dt;
      star.y += star.vy * dt;
      star.age += dt;

      // Update trail
      star.trail.unshift({ x: star.x, y: star.y });
      if (star.trail.length > 12) star.trail.pop();

      // Remove if off screen or below horizon or too old
      if (star.x < -50 || star.x > Camera.width + 50 ||
          star.y < -50 || star.y > Camera.horizonY + 30 ||
          star.age > 5) {
        this.items.splice(i, 1);
      }
    }

    // Update droplet trail
    if (this.droplet) {
      this.droplet.trail.unshift({ x: this.droplet.x, y: this.droplet.y });
      if (this.droplet.trail.length > 8) this.droplet.trail.pop();
    }
  },

  spawnStar() {
    const w = Camera.width;
    const horizonY = Camera.horizonY;

    // Stars enter from top or sides, move diagonally
    const side = Math.random();
    let x, y, vx, vy;
    if (side < 0.4) {
      // From left
      x = -10;
      y = Math.random() * horizonY * 0.6;
      vx = 120 + Math.random() * 100;
      vy = 30 + Math.random() * 50;
    } else if (side < 0.8) {
      // From right
      x = w + 10;
      y = Math.random() * horizonY * 0.6;
      vx = -(120 + Math.random() * 100);
      vy = 30 + Math.random() * 50;
    } else {
      // From top
      x = Math.random() * w;
      y = -10;
      vx = (Math.random() - 0.5) * 80;
      vy = 80 + Math.random() * 80;
    }

    // Star color: white, pale blue, or pale gold
    const colors = ['#ffffff', '#ccddff', '#ffffcc'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.items.push({
      x, y, vx, vy,
      size: 3 + Math.random() * 2,
      age: 0,
      color,
      trail: [{ x, y }],
    });
  },

  // Hit test a screen position against stars — returns index or -1
  hitTest(x, y) {
    for (let i = 0; i < this.items.length; i++) {
      const star = this.items[i];
      const dx = x - star.x;
      const dy = y - star.y;
      if (dx * dx + dy * dy < 45 * 45) { // 45px radius for easy catching
        return i;
      }
    }
    return -1;
  },

  // Catch a star: remove it, create water droplet
  catchStar(index) {
    const star = this.items[index];
    this.droplet = { x: star.x, y: star.y, trail: [] };
    this.isDraggingDroplet = true;
    this.items.splice(index, 1);
    GameAudio.playStarCatch();
    GameAudio.startDragShimmer();
  },

  // Move the droplet to a new position
  moveDroplet(x, y) {
    if (this.droplet) {
      this.droplet.x = x;
      this.droplet.y = y;
    }
  },

  // Release the droplet — check if it hits a plant that can be watered
  // Returns { plant } if watered, null otherwise
  releaseDroplet(x, y) {
    if (!this.droplet) return null;
    this.isDraggingDroplet = false;
    GameAudio.stopDragShimmer();

    // Check if we're near an unwatereed plant
    const plant = Plants.findPlantAt(x, y);
    const result = plant && plant.growthStage < 4 ? { plant } : null;

    if (result) {
      // Splash effect at plant position
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      Particles.emitSplash(pos.x, pos.y);
      GameAudio.playWaterSplash();
    }

    this.droplet = null;
    return result;
  },

  draw(ctx) {
    // Draw shooting stars
    for (const star of this.items) {
      // Trail
      ctx.save();
      for (let i = 1; i < star.trail.length; i++) {
        const t = star.trail[i];
        const alpha = 1 - i / star.trail.length;
        const width = star.size * (1 - i / star.trail.length) * 0.8;
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = star.color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(star.trail[i - 1].x, star.trail[i - 1].y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      ctx.restore();

      // Core glow
      ctx.save();
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      glow.addColorStop(0, star.color);
      glow.addColorStop(0.3, star.color);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw water droplet
    if (this.droplet) {
      const d = this.droplet;

      // Mini-droplet trail
      for (let i = 1; i < d.trail.length; i++) {
        const t = d.trail[i];
        const alpha = 0.4 * (1 - i / d.trail.length);
        const r = 3 * (1 - i / d.trail.length);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#88ccff';
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Main droplet — teardrop shape
      ctx.save();
      ctx.translate(d.x, d.y);

      // Teardrop: rounded bottom, pointed top
      const dropR = 10;
      ctx.fillStyle = '#66bbff';
      ctx.beginPath();
      ctx.moveTo(0, -dropR * 1.6);          // pointed top
      ctx.quadraticCurveTo(-dropR, -dropR * 0.3, -dropR, dropR * 0.3);
      ctx.arc(0, dropR * 0.3, dropR, Math.PI, 0);
      ctx.quadraticCurveTo(dropR, -dropR * 0.3, 0, -dropR * 1.6);
      ctx.fill();

      // White refraction highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-dropR * 0.25, -dropR * 0.1, dropR * 0.2, dropR * 0.35, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Subtle blue tint glow
      const dGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, dropR * 2);
      dGlow.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
      dGlow.addColorStop(1, 'rgba(100, 180, 255, 0)');
      ctx.fillStyle = dGlow;
      ctx.beginPath();
      ctx.arc(0, 0, dropR * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/shooting-stars.js
git commit -m "feat(v2): rewrite shooting stars with faster spawns and teardrop water droplet"
```

---

### Task 14: rewards.js — Colored Gift Stars, 19-Item Reward Pool

**Files:**
- Rewrite: `game/js/rewards.js`

Gift stars are color-coded: magenta (decoration), cyan (accessory), gold+rainbow (seed). 50% larger than v1. Pulsing glow aura, sparkling trail. 19-item reward pool (5 decorations + 12 accessories + 2 seeds). Spawns every 2-3 blooms. No duplicates until pool exhausted.

- [ ] **Step 1: Rewrite rewards.js**

```javascript
// Rewards - Colored gift stars, 19-item reward pool, unlock tracking
// Depends on: Camera, Game, Particles, GameAudio

const RewardPool = {
  items: [
    // Decorations (5) — magenta gift star
    { id: 'deco_bridge',   type: 'decoration', itemId: 'bridge',   color: '#ff44aa' },
    { id: 'deco_lantern',  type: 'decoration', itemId: 'lantern',  color: '#ff44aa' },
    { id: 'deco_pond',     type: 'decoration', itemId: 'pond',     color: '#ff44aa' },
    { id: 'deco_arch',     type: 'decoration', itemId: 'arch',     color: '#ff44aa' },
    { id: 'deco_tower',    type: 'decoration', itemId: 'tower',    color: '#ff44aa' },
    // Accessories (12) — cyan gift star
    { id: 'acc_crown',       type: 'accessory', itemId: 'crown',       color: '#44ddff' },
    { id: 'acc_bow',         type: 'accessory', itemId: 'bow',         color: '#44ddff' },
    { id: 'acc_sunglasses',  type: 'accessory', itemId: 'sunglasses',  color: '#44ddff' },
    { id: 'acc_wreath',      type: 'accessory', itemId: 'wreath',      color: '#44ddff' },
    { id: 'acc_wings',       type: 'accessory', itemId: 'wings',       color: '#44ddff' },
    { id: 'acc_cape',        type: 'accessory', itemId: 'cape',        color: '#44ddff' },
    { id: 'acc_scarf',       type: 'accessory', itemId: 'scarf',       color: '#44ddff' },
    { id: 'acc_collar',      type: 'accessory', itemId: 'collar',      color: '#44ddff' },
    { id: 'acc_tophat',      type: 'accessory', itemId: 'tophat',      color: '#44ddff' },
    { id: 'acc_butterfly',   type: 'accessory', itemId: 'butterfly',   color: '#44ddff' },
    { id: 'acc_backpack',    type: 'accessory', itemId: 'backpack',    color: '#44ddff' },
    { id: 'acc_halo',        type: 'accessory', itemId: 'halo',        color: '#44ddff' },
    // Rare seeds (2) — gold with rainbow shimmer
    { id: 'seed_rainbowTree',    type: 'seed', itemId: 'rainbowTree',    color: '#ffdd44' },
    { id: 'seed_fireworkFlower',  type: 'seed', itemId: 'fireworkFlower', color: '#ffdd44' },
  ],
};

const Rewards = {
  unlocked: [],           // Array of reward id strings
  giftStars: [],          // Active on-screen gift stars
  bloomsSinceLastGift: 0, // Counter since last gift spawn
  bloomsForGift: 2,       // Threshold (2, randomized to 2-3)

  // Called when a plant reaches bloom (stage 4)
  onBloom() {
    this.bloomsSinceLastGift++;
    const threshold = this.bloomsForGift + (Math.random() < 0.5 ? 1 : 0);
    if (this.bloomsSinceLastGift >= threshold) {
      this.spawnGiftStar();
      this.bloomsSinceLastGift = 0;
    }
  },

  spawnGiftStar() {
    // Pick reward first so we know the color
    const reward = this._pickReward();
    if (!reward) return; // all rewards unlocked

    // Determine color based on reward type
    let starColor, glowColor;
    if (reward.type === 'decoration') {
      starColor = '#ff44aa';
      glowColor = 'rgba(255, 68, 170, 0.3)';
    } else if (reward.type === 'accessory') {
      starColor = '#44ddff';
      glowColor = 'rgba(68, 221, 255, 0.3)';
    } else {
      // seed — gold
      starColor = '#ffdd44';
      glowColor = 'rgba(255, 221, 68, 0.3)';
    }

    const x = Camera.width * 0.2 + Math.random() * Camera.width * 0.6;
    const targetY = Camera.horizonY * 0.3 + Math.random() * Camera.horizonY * 0.4;

    this.giftStars.push({
      x,
      y: -40,          // start above screen
      targetY,
      size: 25,         // 50% larger than v1
      age: 0,
      opened: false,
      openAnim: 0,
      reward,
      starColor,
      glowColor,
      sparkleTimer: 0,
    });

    GameAudio.playGiftStarAppear();
  },

  _pickReward() {
    // Pick random unrepeated reward
    const available = RewardPool.items.filter(r => !this.unlocked.includes(r.id));
    if (available.length === 0) {
      // All unlocked — allow repeats (wrap around)
      return RewardPool.items[Math.floor(Math.random() * RewardPool.items.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  },

  update(dt) {
    for (let i = this.giftStars.length - 1; i >= 0; i--) {
      const star = this.giftStars[i];
      star.age += dt;
      star.sparkleTimer += dt;

      if (!star.opened) {
        // Float down to target position
        if (star.y < star.targetY) {
          star.y += 40 * dt;
          if (star.y > star.targetY) star.y = star.targetY;
        }
      } else {
        // Open animation
        star.openAnim += dt;
        if (star.openAnim > 2.0) {
          this.giftStars.splice(i, 1);
        }
      }
    }
  },

  draw(ctx) {
    const time = Game.time;
    for (const star of this.giftStars) {
      if (!star.opened) {
        this._drawGiftStar(ctx, star, time);
      } else {
        this._drawOpenedStar(ctx, star, time);
      }
    }
  },

  _drawGiftStar(ctx, star, time) {
    const x = star.x;
    const y = star.y;
    const s = star.size;
    const pulse = 1 + Math.sin(time * 3) * 0.15;

    // Pulsing glow aura
    ctx.save();
    const glowR = s * 2.5 * pulse;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    glow.addColorStop(0, star.glowColor);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sparkling trail particles (1-2 per frame)
    if (star.sparkleTimer > 0.05) {
      star.sparkleTimer = 0;
      Particles.emit(x + (Math.random() - 0.5) * s, y + (Math.random() - 0.5) * s, {
        count: 1,
        color: star.starColor,
        speed: 15,
        life: 0.5,
        size: 2,
        gravity: 10,
      });
    }

    // 5-pointed star shape with rounded points
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 1.5) * 0.15); // gentle wobble

    // Star body
    ctx.fillStyle = star.starColor;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const r = s * pulse;
      const ri = s * 0.45 * pulse;
      const outerX = Math.cos(a) * r;
      const outerY = Math.sin(a) * r;
      const a2 = a + Math.PI / 5;
      const innerX = Math.cos(a2) * ri;
      const innerY = Math.sin(a2) * ri;
      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    // White highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-s * 0.15, -s * 0.15, s * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Rainbow shimmer for seed rewards
    if (star.reward && star.reward.type === 'seed') {
      const hue = (time * 60) % 360;
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.lineWidth = s * 0.15;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const r = s * pulse * 1.1;
        const ri = s * 0.5 * pulse;
        const outerX = Math.cos(a) * r;
        const outerY = Math.sin(a) * r;
        const a2 = a + Math.PI / 5;
        const innerX = Math.cos(a2) * ri;
        const innerY = Math.sin(a2) * ri;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  },

  _drawOpenedStar(ctx, star, time) {
    const progress = star.openAnim / 2.0; // 0 to 1 over 2 seconds
    const x = star.x;
    const y = star.y;
    const s = star.size;

    // Expanding, fading circle
    ctx.save();
    const expandR = s * (1 + progress * 3);
    ctx.globalAlpha = 1 - progress;

    // Glow circle
    const grad = ctx.createRadialGradient(x, y, 0, x, y, expandR);
    grad.addColorStop(0, star.starColor);
    grad.addColorStop(0.5, star.glowColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, expandR, 0, Math.PI * 2);
    ctx.fill();

    // Reward type icon in center (simple shapes)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.max(0, 1 - progress * 1.5);
    if (star.reward.type === 'decoration') {
      // Star shape icon
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5);
        const a2 = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a2) * s * 0.2, y + Math.sin(a2) * s * 0.2);
      }
      ctx.closePath();
      ctx.fill();
    } else if (star.reward.type === 'accessory') {
      // Diamond shape icon
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x + s * 0.35, y);
      ctx.lineTo(x, y + s * 0.5);
      ctx.lineTo(x - s * 0.35, y);
      ctx.closePath();
      ctx.fill();
    } else {
      // Seed: circle with glow
      ctx.beginPath();
      ctx.arc(x, y, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // Hit test gift stars — returns true if one was opened
  handleTap(x, y) {
    for (const star of this.giftStars) {
      if (star.opened) continue;
      const dx = x - star.x;
      const dy = y - star.y;
      if (dx * dx + dy * dy < 50 * 50) {
        this.openGiftStar(star);
        return true;
      }
    }
    return false;
  },

  openGiftStar(star) {
    star.opened = true;
    star.openAnim = 0;

    // Unlock reward
    if (!this.unlocked.includes(star.reward.id)) {
      this.unlocked.push(star.reward.id);
    }

    // Effects
    GameAudio.playGiftStarOpen();
    Particles.emitBloom(star.x, star.y, [star.starColor, '#ffffff', '#ffeecc']);
  },

  // Check if a reward is unlocked
  isUnlocked(rewardId) {
    return this.unlocked.includes(rewardId);
  },

  // Get unlocked rewards by type
  getUnlockedByType(type) {
    return RewardPool.items.filter(r => r.type === type && this.unlocked.includes(r.id));
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/rewards.js
git commit -m "feat(v2): rewrite rewards with colored gift stars and 19-item pool"
```

---

### Task 15: storage.js — v2 Save Format, v1 Discard

**Files:**
- Rewrite: `game/js/storage.js`

v2 save format stores plants with growthStage, animals with typeIndex/accessory, decorations with angle/depth, camera rotation, rewards state, bloom count, and next animal index. If a v1 save is detected, discard it.

- [ ] **Step 1: Rewrite storage.js**

```javascript
// Storage - v2 save/load with localStorage
// Depends on: Plants, Animals, Decorations, Rewards, Camera

const Storage = {
  SAVE_KEY: 'starlight-garden-save',

  save() {
    const data = {
      version: 2,
      plants: Plants.items.map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        depth: p.depth,
        growthStage: p.growthStage,
      })),
      animals: Animals.items.filter(a => a.settled).map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        depth: a.depth,
        tapCount: a.tapCount,
        accessory: a.accessory,
      })),
      decorations: Decorations.placed.map(d => ({
        id: d.id,
        angle: d.angle,
        depth: d.depth,
      })),
      rewards: {
        unlocked: Rewards.unlocked.slice(),
        bloomsSinceLastGift: Rewards.bloomsSinceLastGift,
      },
      camera: {
        rotation: Camera.rotation,
      },
      bloomCount: Plants.bloomCount(),
      nextAnimalIndex: Animals.nextTypeIndex,
      lastCheckBloomCount: Animals.lastCheckBloomCount,
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage full or unavailable — silently fail
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      // Discard v1 saves
      if (!data.version || data.version < 2) {
        this.clearSave();
        return false;
      }

      // Restore plants
      Plants.items = (data.plants || []).map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        depth: p.depth,
        growthStage: p.growthStage,
        growthProgress: 1.0, // fully settled on load
        growthAnimating: false,
        plantedTime: 0,
      }));

      // Restore animals
      Animals.items = (data.animals || []).map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        depth: a.depth,
        targetAngle: a.angle,
        targetDepth: a.depth,
        startAngle: a.angle,
        startDepth: a.depth,
        tapCount: a.tapCount || 0,
        accessory: a.accessory || null,
        arrivalTime: 0,
        settled: true,
        idleTimer: Math.random() * 10,
      }));
      Animals.nextTypeIndex = data.nextAnimalIndex || 0;
      Animals.lastCheckBloomCount = data.lastCheckBloomCount || 0;

      // Restore decorations
      Decorations.placed = (data.decorations || []).map(d => ({
        id: d.id,
        angle: d.angle,
        depth: d.depth,
      }));

      // Restore rewards
      if (data.rewards) {
        Rewards.unlocked = data.rewards.unlocked || [];
        Rewards.bloomsSinceLastGift = data.rewards.bloomsSinceLastGift || 0;
      }

      // Restore camera
      if (data.camera) {
        Camera.rotation = data.camera.rotation || 0;
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  hasSave() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.version >= 2;
    } catch (e) {
      return false;
    }
  },

  clearSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (e) {
      // silently fail
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/storage.js
git commit -m "feat(v2): rewrite storage with v2 save format and v1 discard"
```

---

### Task 16: ui.js — Garden Tray (7 Plants), Accessory Tray (12 Items), Parent Reset

**Files:**
- Rewrite: `game/js/ui.js`

Garden tray at bottom with 7 plant slots (rare seeds gated behind reward unlock). Scrollable when items overflow. Unlocked decorations appear in tray too. Accessory tray shows when an animal is tapped (12 possible accessories, only unlocked ones visible). Parent reset: invisible button in top-right, 2s long-press triggers confirm dialog.

- [ ] **Step 1: Rewrite ui.js**

```javascript
// UI - Garden tray, accessory tray, parent reset button
// Depends on: Plants, PlantTypes, Rewards, RewardPool, DecorationDefs, DecorationIds,
//             AnimalRenderer, GameAudio, Storage

const UI = {
  trayElement: null,
  accessoryTrayElement: null,
  currentTray: 'garden',    // 'garden' | 'accessory'
  selectedAnimal: null,     // animal object for accessory equip
  selectedDecoration: null, // decoration id string for placement

  init() {
    this.createGardenTray();
    this.createAccessoryTray();
    this.createResetButton();
  },

  createGardenTray() {
    const overlay = document.getElementById('ui-overlay');
    const tray = document.createElement('div');
    tray.id = 'garden-tray';
    tray.className = 'tray';
    overlay.appendChild(tray);
    this.trayElement = tray;
    this.refreshGardenTray();
  },

  refreshGardenTray() {
    const tray = this.trayElement;
    tray.innerHTML = '';

    // Plant type buttons
    for (let i = 0; i < PlantTypes.length; i++) {
      const pType = PlantTypes[i];
      // Skip rare types that aren't unlocked
      if (pType.seedId && !Rewards.isUnlocked(pType.seedId)) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (Plants.selectedType === i) btn.classList.add('selected');

      // Draw plant icon on a mini canvas
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 90);
      // Draw bloom stage (stage 4) as icon
      PlantRenderer.draw(mCtx, i, 4, 1.0, 1.2, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        GameAudio.ensure();
        this.selectPlantType(i);
      });

      tray.appendChild(btn);
    }

    // Unlocked decoration buttons
    const unlockedDecos = Rewards.getUnlockedByType('decoration');
    for (const reward of unlockedDecos) {
      const decoId = reward.itemId;
      const def = DecorationDefs[decoId];
      if (!def) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (this.selectedDecoration === decoId) btn.classList.add('selected');

      // Draw decoration icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 80);
      def.draw(mCtx, 60, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        GameAudio.ensure();
        this.selectDecoration(decoId);
      });

      tray.appendChild(btn);
    }
  },

  selectPlantType(index) {
    if (Plants.selectedType === index) {
      Plants.selectedType = -1; // deselect
    } else {
      Plants.selectedType = index;
      this.selectedDecoration = null;
    }
    this.refreshGardenTray();
  },

  selectDecoration(decoId) {
    if (this.selectedDecoration === decoId) {
      this.selectedDecoration = null; // deselect
    } else {
      this.selectedDecoration = decoId;
      Plants.selectedType = -1;
    }
    this.refreshGardenTray();
  },

  createAccessoryTray() {
    const overlay = document.getElementById('ui-overlay');
    const tray = document.createElement('div');
    tray.id = 'accessory-tray';
    tray.className = 'tray';
    tray.style.display = 'none';
    overlay.appendChild(tray);
    this.accessoryTrayElement = tray;
  },

  showAccessoryTray(animal) {
    this.selectedAnimal = animal;
    this.currentTray = 'accessory';
    this.trayElement.style.display = 'none';
    this.accessoryTrayElement.style.display = '';
    this.accessoryTrayElement.innerHTML = '';

    // "Remove accessory" button if animal has one
    if (animal.accessory) {
      const removeBtn = document.createElement('div');
      removeBtn.className = 'tray-item';
      removeBtn.style.borderColor = 'rgba(255, 100, 100, 0.5)';
      // X icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.strokeStyle = '#ff6666';
      mCtx.lineWidth = 6;
      mCtx.lineCap = 'round';
      mCtx.beginPath();
      mCtx.moveTo(40, 40);
      mCtx.lineTo(80, 80);
      mCtx.moveTo(80, 40);
      mCtx.lineTo(40, 80);
      mCtx.stroke();
      removeBtn.appendChild(miniCanvas);

      removeBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.equipAccessory(null);
      });
      this.accessoryTrayElement.appendChild(removeBtn);
    }

    // Unlocked accessories
    const unlockedAcc = Rewards.getUnlockedByType('accessory');
    const accessoryIds = ['crown', 'bow', 'sunglasses', 'wreath', 'wings', 'cape',
                          'scarf', 'collar', 'tophat', 'butterfly', 'backpack', 'halo'];

    for (const accId of accessoryIds) {
      // Check if unlocked
      const isUnlocked = unlockedAcc.some(r => r.itemId === accId);
      if (!isUnlocked) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (animal.accessory === accId) btn.classList.add('selected');

      // Draw accessory icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 60);
      // Draw the accessory at a reasonable icon size
      AnimalRenderer.drawAccessory(mCtx, animal.typeIndex, accId, 80, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.equipAccessory(accId);
      });

      this.accessoryTrayElement.appendChild(btn);
    }

    // Close button (tap outside or back button)
    const closeBtn = document.createElement('div');
    closeBtn.className = 'tray-item';
    closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 120;
    miniCanvas.height = 120;
    const mCtx = miniCanvas.getContext('2d');
    mCtx.fillStyle = '#aaaaaa';
    mCtx.font = '48px sans-serif';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText('\u2190', 60, 60); // left arrow ←
    closeBtn.appendChild(miniCanvas);

    closeBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.hideAccessoryTray();
    });
    this.accessoryTrayElement.appendChild(closeBtn);
  },

  hideAccessoryTray() {
    this.selectedAnimal = null;
    this.currentTray = 'garden';
    this.accessoryTrayElement.style.display = 'none';
    this.trayElement.style.display = '';
  },

  equipAccessory(accId) {
    if (!this.selectedAnimal) return;
    if (this.selectedAnimal.accessory === accId) {
      // Toggle off
      this.selectedAnimal.accessory = null;
    } else {
      this.selectedAnimal.accessory = accId;
    }
    GameAudio.playAccessoryPlace();
    Storage.save();
    // Refresh the accessory tray to update selection state
    this.showAccessoryTray(this.selectedAnimal);
  },

  showGardenTray() {
    this.trayElement.style.display = '';
  },

  hideGardenTray() {
    this.trayElement.style.display = 'none';
  },

  createResetButton() {
    const overlay = document.getElementById('ui-overlay');
    const btn = document.createElement('div');
    btn.id = 'reset-btn';
    btn.style.cssText = 'position:absolute;top:8px;right:8px;width:40px;height:40px;opacity:0;z-index:100;';

    let pressTimer = null;
    btn.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => {
        if (confirm('Reset garden? All progress will be lost.')) {
          Storage.clearSave();
          window.location.reload();
        }
      }, 2000);
    });
    btn.addEventListener('pointerup', () => clearTimeout(pressTimer));
    btn.addEventListener('pointercancel', () => clearTimeout(pressTimer));
    btn.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    overlay.appendChild(btn);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add game/js/ui.js
git commit -m "feat(v2): rewrite UI with 7-plant garden tray, 12 accessory tray, parent reset"
```

---

### Task 17: main.js — Game Loop, State Machine, Depth-Sorted Render Pipeline

**Files:**
- Rewrite: `game/js/main.js`

The orchestrator. Canvas setup, resize handling, Game state object, title screen, transition animation, playing state with depth-sorted render pipeline, all input wiring, autoSave. Delete `game/js/planet.js` (replaced by camera.js + planet-surface.js).

- [ ] **Step 1: Delete planet.js**

```bash
rm game/js/planet.js
```

- [ ] **Step 2: Rewrite main.js**

```javascript
// main.js - Game loop, state machine, depth-sorted render pipeline, input wiring
// This is the last file loaded. All modules are available as globals.
// Depends on: ALL modules

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const Game = {
  width: 0,
  height: 0,
  time: 0,
  deltaTime: 0,
  lastTime: 0,
  state: 'title',          // 'title' | 'transition' | 'playing'
  transitionTimer: 0,
  transitionDuration: 1.5,  // seconds for title->playing zoom
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  Game.width = window.innerWidth;
  Game.height = window.innerHeight;
  Camera.resize(Game.width, Game.height);
  Starfield.resize();
  PlanetSurface.resize();
}

function autoSave() {
  Storage.save();
}

// --- Title Screen ---
function drawTitleScreen(ctx) {
  const w = Game.width;
  const h = Game.height;
  const time = Game.time;

  // Space background
  Starfield.draw(ctx);

  // Curved horizon at bottom third
  const horizonY = h * 0.65;
  ctx.save();

  // Ground preview
  const grad = ctx.createLinearGradient(0, horizonY, 0, h);
  grad.addColorStop(0, '#3a6b2a');
  grad.addColorStop(0.3, '#2d5520');
  grad.addColorStop(0.7, '#4a3a25');
  grad.addColorStop(1, '#2a1e14');
  ctx.fillStyle = grad;
  ctx.beginPath();
  // Slightly wavy horizon
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 20) {
    const bump = Math.sin(x * 0.02 + 1) * 8 + Math.sin(x * 0.05 + 3) * 4;
    ctx.lineTo(x, horizonY + bump);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Silhouette plants along horizon
  ctx.fillStyle = 'rgba(20, 40, 15, 0.6)';
  for (let i = 0; i < 8; i++) {
    const px = w * 0.1 + i * w * 0.1;
    const py = horizonY + Math.sin(px * 0.02 + 1) * 8;
    ctx.save();
    ctx.translate(px, py);
    // Simple plant silhouette
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -15 - i * 3);
    ctx.lineTo(5, -15 - i * 3);
    ctx.closePath();
    ctx.fill();
    // Leaves
    ctx.beginPath();
    ctx.ellipse(-8, -10 - i * 2, 6, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -12 - i * 2, 6, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // Pulsing "tap to play" star in center
  const pulse = 0.85 + Math.sin(time * 2.5) * 0.15;
  const starSize = 35 * pulse;
  const cx = w / 2;
  const cy = h * 0.4;

  // Star glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starSize * 3);
  glow.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
  glow.addColorStop(1, 'rgba(255, 255, 200, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, starSize * 3, 0, Math.PI * 2);
  ctx.fill();

  // Star shape
  ctx.fillStyle = '#ffeeaa';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const r = starSize;
    const ri = starSize * 0.4;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a2) * ri, cy + Math.sin(a2) * ri);
  }
  ctx.closePath();
  ctx.fill();

  // White core
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(cx, cy, starSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// --- Transition: zoom from title to playing ---
function drawTransition(ctx) {
  const progress = Game.transitionTimer / Game.transitionDuration;
  const ease = progress * (2 - progress); // ease-out

  // Blend from title horizon position to playing horizon
  const titleHorizonY = Game.height * 0.65;
  const playHorizonY = Camera.horizonY;
  const currentHorizon = titleHorizonY + (playHorizonY - titleHorizonY) * ease;

  // Draw starfield (fades/shifts as camera descends)
  Starfield.draw(ctx);

  // Ground expands upward
  const grad = ctx.createLinearGradient(0, currentHorizon, 0, Game.height);
  grad.addColorStop(0, '#3a6b2a');
  grad.addColorStop(0.3, '#2d5520');
  grad.addColorStop(0.7, '#4a3a25');
  grad.addColorStop(1, '#2a1e14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, currentHorizon, Game.width, Game.height - currentHorizon);

  // Fade to white at end of transition
  if (progress > 0.7) {
    ctx.save();
    ctx.globalAlpha = (progress - 0.7) / 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, Game.width, Game.height);
    ctx.restore();
  }
}

// --- Playing State Render Pipeline ---
function drawPlaying(ctx) {
  // 1. Clear
  ctx.clearRect(0, 0, Game.width, Game.height);

  // 2. Sky background (starfield above horizon)
  Starfield.draw(ctx);

  // 3. Ground below horizon
  PlanetSurface.draw(ctx);

  // 4. Collect all surface objects for depth sorting
  const surfaceObjects = [];

  // Plants
  const plantList = Plants.getSortedDrawList();
  for (const item of plantList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.plant.depth,
      type: 'plant',
      data: item,
    });
  }

  // Animals
  const animalList = Animals.getSortedDrawList();
  for (const item of animalList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.animal.depth,
      type: 'animal',
      data: item,
    });
  }

  // Decorations
  const decoList = Decorations.getSortedDrawList();
  for (const item of decoList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.deco.depth,
      type: 'decoration',
      data: item,
    });
  }

  // 5. Sort by depth (furthest first = smallest depth = near horizon)
  surfaceObjects.sort((a, b) => a.depth - b.depth);

  // 6. Draw each object back-to-front
  for (const obj of surfaceObjects) {
    switch (obj.type) {
      case 'plant':
        Plants.drawPlant(ctx, obj.data.plant, obj.data.x, obj.data.y, obj.data.scale);
        break;
      case 'animal':
        Animals.drawAnimal(ctx, obj.data.animal, obj.data.x, obj.data.y, obj.data.scale);
        break;
      case 'decoration':
        Decorations.drawDecoration(ctx, obj.data.deco, obj.data.x, obj.data.y, obj.data.scale);
        break;
    }
  }

  // Plant placement hints (on top of ground objects)
  Plants.drawPlacementHints(ctx);

  // 7. Shooting stars & water droplet (in sky, on top of everything below)
  ShootingStars.draw(ctx);

  // 8. Gift stars
  Rewards.draw(ctx);

  // 9. Particles on top of everything
  Particles.draw(ctx);

  // Ambient sparkle for bloomed plants
  for (const item of plantList) {
    if (item.plant.growthStage >= 4) {
      const colors = PlantTypes[item.plant.typeIndex].bloomColors;
      Particles.emitAmbient(item.x, item.y, colors[0]);
    }
  }
}

// --- Game Loop ---
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (Game.lastTime === 0) Game.lastTime = timestamp;
  const rawDt = (timestamp - Game.lastTime) / 1000;
  Game.deltaTime = Math.min(rawDt, 0.1); // cap at 100ms
  Game.lastTime = timestamp;
  Game.time += Game.deltaTime;

  const dt = Game.deltaTime;

  ctx.clearRect(0, 0, Game.width, Game.height);

  if (Game.state === 'title') {
    Starfield.update(dt);
    drawTitleScreen(ctx);
  } else if (Game.state === 'transition') {
    Game.transitionTimer += dt;
    Starfield.update(dt);
    drawTransition(ctx);
    if (Game.transitionTimer >= Game.transitionDuration) {
      Game.state = 'playing';
    }
  } else if (Game.state === 'playing') {
    // Update all systems
    Camera.update(dt);
    Starfield.update(dt);
    ShootingStars.update(dt);
    Plants.update(dt);
    Animals.update(dt);
    Rewards.update(dt);
    Particles.update(dt);

    // Draw
    drawPlaying(ctx);
  }
}

// --- Input Wiring ---
function initInput() {
  // TAP
  Input.onTap = (x, y) => {
    GameAudio.ensure();

    if (Game.state === 'title') {
      Game.state = 'transition';
      Game.transitionTimer = 0;
      GameAudio.init();
      return;
    }

    if (Game.state !== 'playing') return;

    // Priority 1: Gift stars
    if (Rewards.handleTap(x, y)) {
      autoSave();
      UI.refreshGardenTray();
      return;
    }

    // Priority 2: Animals (show accessory tray)
    const animal = Animals.handleTap(x, y);
    if (animal) {
      UI.showAccessoryTray(animal);
      return;
    }

    // Priority 3: Place decoration
    if (UI.selectedDecoration && Camera.isOnGround(x, y)) {
      const world = Camera.screenToWorld(x, y);
      if (world) {
        Decorations.placeDecoration(UI.selectedDecoration, world.angle, world.depth);
        GameAudio.playDecorationPlace();
        UI.selectedDecoration = null;
        UI.refreshGardenTray();
        autoSave();
      }
      return;
    }

    // Priority 4: Plant seed
    if (Plants.selectedType >= 0 && Camera.isOnGround(x, y)) {
      const world = Camera.screenToWorld(x, y);
      if (world) {
        Plants.addPlant(Plants.selectedType, world.angle, world.depth);
        GameAudio.playPlantPop();
        autoSave();
      }
      return;
    }

    // Priority 5: Tap on sky shooting star
    if (Camera.isInSky(x, y)) {
      const starIdx = ShootingStars.hitTest(x, y);
      if (starIdx >= 0) {
        ShootingStars.catchStar(starIdx);
      }
    }
  };

  // DRAG START
  Input.onDragStart = (x, y) => {
    if (Game.state !== 'playing') return;

    // Try to catch a shooting star
    const starIdx = ShootingStars.hitTest(x, y);
    if (starIdx >= 0) {
      ShootingStars.catchStar(starIdx);
    }
  };

  // DRAG MOVE
  Input.onDragMove = (x, y, dx, dy) => {
    if (Game.state !== 'playing') return;

    if (ShootingStars.isDraggingDroplet) {
      ShootingStars.moveDroplet(x, y);
    } else {
      // Rotate camera
      Camera.spin(-dx);
    }
  };

  // DRAG END
  Input.onDragEnd = (x, y) => {
    if (Game.state !== 'playing') return;

    if (ShootingStars.isDraggingDroplet) {
      const result = ShootingStars.releaseDroplet(x, y);
      if (result && result.plant) {
        const watered = Plants.waterPlant(result.plant);
        if (watered) {
          // Check if plant just bloomed (reached stage 4)
          if (result.plant.growthStage >= 4) {
            // Bloom effects
            const pos = Camera.worldToScreen(result.plant.angle, result.plant.depth);
            const bloomColors = PlantTypes[result.plant.typeIndex].bloomColors;
            Particles.emitBloom(pos.x, pos.y, bloomColors);
            GameAudio.playBloom(result.plant.typeIndex);

            // Special effects for mushroom spores
            if (result.plant.typeIndex === 3) {
              Particles.emitSpores(pos.x, pos.y);
            }
            // Special effects for firework flower sparks
            if (result.plant.typeIndex === 6) {
              Particles.emitSparks(pos.x, pos.y);
            }

            Rewards.onBloom();
            UI.refreshGardenTray();
          } else {
            // Growth sound (not bloom)
            GameAudio.playGrowth();
          }
          autoSave();
        }
      }
    }
  };

  // SWIPE
  Input.onSwipe = (dx, dy) => {
    if (Game.state !== 'playing') return;
    Camera.spin(-dx * 2);
    GameAudio.playSpinWhoosh(Math.abs(dx));
  };
}

// --- Init ---
function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize systems
  Starfield.init(Game.width, Game.height);
  PlanetSurface.init(Game.width, Game.height);
  Input.init(canvas);
  initInput();

  // Load save
  if (Storage.hasSave()) {
    Storage.load();
  }

  UI.init();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

init();
```

- [ ] **Step 3: Commit**

```bash
rm game/js/planet.js
git add -A game/
git commit -m "feat(v2): rewrite main.js with depth-sorted render pipeline and full input wiring"
```

---
