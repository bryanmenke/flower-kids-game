// Particles - Sparkles, bloom bursts, trails, ambient glow

const Particles = {
  items: [],

  // Emit particles at a position
  emit(x, y, options = {}) {
    const count = options.count || 10;
    const color = options.color || '#ffffcc';
    const speed = options.speed || 50;
    const life = options.life || 1;
    const size = options.size || 3;
    const gravity = options.gravity || 0;
    const spread = options.spread || Math.PI * 2;
    const angle = options.angle || 0;

    for (let i = 0; i < count; i++) {
      const dir = angle + (Math.random() - 0.5) * spread;
      const spd = speed * (0.5 + Math.random() * 0.5);
      this.items.push({
        x,
        y,
        vx: Math.cos(dir) * spd,
        vy: Math.sin(dir) * spd,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random() * 0.5),
        color,
        gravity,
        alpha: 1,
      });
    }
  },

  // Bloom burst effect
  emitBloom(x, y, colors) {
    // Main burst
    const burstColors = colors || ['#ffffcc', '#ffddaa', '#ffaacc'];
    for (let i = 0; i < 20; i++) {
      const color = burstColors[Math.floor(Math.random() * burstColors.length)];
      this.emit(x, y, {
        count: 1,
        color,
        speed: 80 + Math.random() * 60,
        life: 0.8 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        gravity: 20,
      });
    }
    // Star shapes
    for (let i = 0; i < 5; i++) {
      const dir = (i / 5) * Math.PI * 2;
      this.items.push({
        x,
        y,
        vx: Math.cos(dir) * 40,
        vy: Math.sin(dir) * 40,
        life: 1,
        maxLife: 1,
        size: 5,
        color: '#ffffee',
        gravity: 0,
        alpha: 1,
        isStar: true,
      });
    }
  },

  // Ambient sparkle near a position (for bloomed plants)
  emitAmbient(x, y, color) {
    if (Math.random() > 0.02) return; // rare, called per frame
    this.emit(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, {
      count: 1,
      color: color || '#ffffcc',
      speed: 10,
      life: 1.5,
      size: 1.5,
      gravity: -5,
      angle: -Math.PI / 2,
      spread: 0.5,
    });
  },

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.items.splice(i, 1);
      }
    }
  },

  draw(ctx) {
    for (const p of this.items) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.isStar) {
        // Draw tiny star shape
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(Game.time * 3);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
          const ia = a + Math.PI / 4;
          ctx.lineTo(Math.cos(ia) * p.size * 0.4, Math.sin(ia) * p.size * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Glowing circle
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
