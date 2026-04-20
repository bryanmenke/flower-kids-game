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
      size: 15 + Math.random() * 8,
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
      if (dx * dx + dy * dy < 120 * 120) { // 120px radius for easy catching
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
        const r = 12 * (1 - i / d.trail.length);
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
      const dropR = 45;
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
