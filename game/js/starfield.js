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
