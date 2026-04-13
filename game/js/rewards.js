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
      size: 50,         // 3x scale
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
      if (dx * dx + dy * dy < 90 * 90) {
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
