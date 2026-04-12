// ShootingStars - Spawning, catching, and water droplet dragging

const ShootingStars = {
  items: [],
  spawnTimer: 0,
  spawnInterval: 3, // seconds between spawns

  // Water droplet state
  droplet: null, // { x, y } when holding a droplet, null otherwise
  isDraggingDroplet: false,

  update(dt) {
    // Spawn new stars
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnStar();
      this.spawnTimer = this.spawnInterval + Math.random() * 2;
    }

    // Move stars
    for (let i = this.items.length - 1; i >= 0; i--) {
      const star = this.items[i];
      star.x += star.vx * dt;
      star.y += star.vy * dt;
      star.age += dt;
      star.twinkle = Math.sin(star.age * 5) * 0.3 + 0.7;

      // Remove if off screen
      if (star.x < -50 || star.x > Game.width + 50 || star.y > Game.height + 50) {
        this.items.splice(i, 1);
      }
    }
  },

  spawnStar() {
    // Spawn from top or sides
    const side = Math.random();
    let x, y, vx, vy;
    if (side < 0.5) {
      // From top
      x = Math.random() * Game.width;
      y = -20;
      vx = (Math.random() - 0.5) * 30;
      vy = 15 + Math.random() * 20;
    } else if (side < 0.75) {
      // From left
      x = -20;
      y = Math.random() * Game.height * 0.4;
      vx = 20 + Math.random() * 15;
      vy = 10 + Math.random() * 10;
    } else {
      // From right
      x = Game.width + 20;
      y = Math.random() * Game.height * 0.4;
      vx = -(20 + Math.random() * 15);
      vy = 10 + Math.random() * 10;
    }

    this.items.push({
      x, y, vx, vy,
      size: 3 + Math.random() * 3,
      age: 0,
      twinkle: 1,
      trail: [],
    });
  },

  draw(ctx) {
    // Draw shooting stars
    for (const star of this.items) {
      // Trail
      ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
      ctx.lineWidth = 1.5;
      if (star.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(star.trail[0].x, star.trail[0].y);
        for (let i = 1; i < star.trail.length; i++) {
          ctx.lineTo(star.trail[i].x, star.trail[i].y);
        }
        ctx.stroke();
      }
      // Update trail
      star.trail.push({ x: star.x, y: star.y });
      if (star.trail.length > 8) star.trail.shift();

      // Star glow
      const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      grad.addColorStop(0, `rgba(255, 255, 200, ${star.twinkle})`);
      grad.addColorStop(0.5, `rgba(255, 255, 200, ${star.twinkle * 0.3})`);
      grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(255, 255, 240, ${star.twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw water droplet
    if (this.droplet) {
      const d = this.droplet;
      // Glow
      const dGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 20);
      dGrad.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
      dGrad.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
      dGrad.addColorStop(1, 'rgba(100, 200, 255, 0)');
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Droplet shape
      ctx.fillStyle = 'rgba(150, 220, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle trail
      Particles.emit(d.x + (Math.random() - 0.5) * 10, d.y + (Math.random() - 0.5) * 10, {
        count: 1, color: '#aaddff', speed: 5, life: 0.3, size: 2,
      });
    }
  },

  // Check if a tap hits a shooting star
  hitTest(x, y) {
    for (let i = 0; i < this.items.length; i++) {
      const star = this.items[i];
      const dx = x - star.x;
      const dy = y - star.y;
      // Generous hit area (40px radius) for little fingers
      if (dx * dx + dy * dy < 40 * 40) {
        return i;
      }
    }
    return -1;
  },

  // Catch a star and create a droplet
  catchStar(index) {
    const star = this.items[index];
    this.droplet = { x: star.x, y: star.y };
    this.items.splice(index, 1);
    this.isDraggingDroplet = true;
  },

  // Move the droplet to follow finger
  moveDroplet(x, y) {
    if (this.droplet) {
      this.droplet.x = x;
      this.droplet.y = y;
    }
  },

  // Release the droplet - returns true if it was dropped on a sprout
  releaseDroplet(x, y) {
    if (!this.droplet) return false;
    this.droplet = null;
    this.isDraggingDroplet = false;

    // Check if dropped on an unwatered sprout
    const plant = Plants.findPlantAt(x, y);
    if (plant && plant.state === 'sprout') {
      return plant;
    }
    return null;
  },
};
