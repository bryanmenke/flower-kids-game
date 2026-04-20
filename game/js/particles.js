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
      color: '#ff88bb',
      gravity: -5,
      alpha: 0.4,
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
