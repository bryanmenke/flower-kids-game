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
