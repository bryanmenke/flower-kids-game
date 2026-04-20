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
