// Rewards - Gift star drops, reward pool, unlock tracking

const RewardPool = {
  // All possible rewards
  items: [
    // Planet decorations
    { id: 'bridge', type: 'decoration', name: 'Tiny Bridge', color: '#c8a87c' },
    { id: 'lantern', type: 'decoration', name: 'Glow Lantern', color: '#ffdd66' },
    { id: 'pond', type: 'decoration', name: 'Crystal Pond', color: '#66ccff' },
    { id: 'arch', type: 'decoration', name: 'Rainbow Arch', color: '#ff88aa' },
    { id: 'tower', type: 'decoration', name: 'Castle Tower', color: '#ccaadd' },
    // Animal accessories
    { id: 'crown', type: 'accessory', name: 'Crown', color: '#ffdd44' },
    { id: 'bow', type: 'accessory', name: 'Sparkly Bow', color: '#ff66aa' },
    { id: 'sunglasses', type: 'accessory', name: 'Star Sunglasses', color: '#44ddff' },
    { id: 'cape', type: 'accessory', name: 'Cape', color: '#cc44ff' },
    { id: 'wings', type: 'accessory', name: 'Fairy Wings', color: '#aaddff' },
    { id: 'necklace', type: 'accessory', name: 'Flower Necklace', color: '#ff88cc' },
    // Rare plant seeds
    { id: 'rainbowTree', type: 'seed', name: 'Rainbow Tree', color: '#ff6666' },
    { id: 'fireworkFlower', type: 'seed', name: 'Firework Flower', color: '#ffaa44' },
  ],
};

const Rewards = {
  unlocked: [],       // array of reward ids that have been unlocked
  giftStars: [],      // active gift stars on screen
  bloomsSinceLastGift: 0,
  blooms_for_gift: 2, // every 2-3 blooms spawn a gift

  // Called when a plant blooms
  onBloom() {
    this.bloomsSinceLastGift++;
    const threshold = this.blooms_for_gift + Math.floor(Math.random() * 2); // 2 or 3
    if (this.bloomsSinceLastGift >= threshold) {
      this.spawnGiftStar();
      this.bloomsSinceLastGift = 0;
    }
  },

  spawnGiftStar() {
    // Spawn near the top of the screen, floating down gently
    const star = {
      x: Game.width * 0.2 + Math.random() * Game.width * 0.6,
      y: -30,
      targetY: Game.height * 0.15 + Math.random() * Game.height * 0.2,
      size: 18,
      age: 0,
      opened: false,
      openAnim: 0,
      reward: null,
    };
    this.giftStars.push(star);
    GameAudio.playGiftStarAppear();
  },

  update(dt) {
    for (let i = this.giftStars.length - 1; i >= 0; i--) {
      const star = this.giftStars[i];
      star.age += dt;

      if (!star.opened) {
        // Float down to target position
        if (star.y < star.targetY) {
          star.y += (star.targetY - star.y) * 2 * dt;
        }
      } else {
        // Open animation
        star.openAnim += dt;
        if (star.openAnim > 2) {
          this.giftStars.splice(i, 1);
        }
      }
    }
  },

  draw(ctx) {
    for (const star of this.giftStars) {
      if (star.opened) {
        this.drawOpenedStar(ctx, star);
      } else {
        this.drawGiftStar(ctx, star);
      }
    }
  },

  drawGiftStar(ctx, star) {
    const bounce = Math.sin(star.age * 3) * 5;
    const spin = star.age * 2;
    const x = star.x;
    const y = star.y + bounce;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);

    // Outer glow
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, star.size * 2.5);
    glow.addColorStop(0, 'rgba(255, 230, 100, 0.6)');
    glow.addColorStop(0.5, 'rgba(255, 200, 50, 0.2)');
    glow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, star.size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Star shape
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      ctx.lineTo(Math.cos(outerAngle) * star.size, Math.sin(outerAngle) * star.size);
      ctx.lineTo(Math.cos(innerAngle) * star.size * 0.45, Math.sin(innerAngle) * star.size * 0.45);
    }
    ctx.closePath();
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#fff8cc';
    ctx.beginPath();
    ctx.arc(0, 0, star.size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Sparkle particles
    if (Math.random() < 0.15) {
      Particles.emit(x + (Math.random() - 0.5) * star.size * 2, y + (Math.random() - 0.5) * star.size * 2, {
        count: 1, color: '#ffee88', speed: 15, life: 0.6, size: 2,
      });
    }
  },

  drawOpenedStar(ctx, star) {
    if (!star.reward) return;
    const t = star.openAnim;
    const alpha = Math.max(0, 1 - (t - 1));

    ctx.save();
    ctx.globalAlpha = alpha;

    // Show reward icon
    const reward = star.reward;
    const size = 30 + t * 10;

    // Glow circle
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 1.5);
    glow.addColorStop(0, reward.color + 'cc');
    glow.addColorStop(1, reward.color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Reward circle
    ctx.fillStyle = reward.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Simple icon indicator based on type
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { decoration: '+', accessory: '*', seed: '~' };
    ctx.fillText(icons[reward.type] || '?', star.x, star.y);

    ctx.restore();
  },

  // Handle tap on a gift star
  handleTap(x, y) {
    for (let i = 0; i < this.giftStars.length; i++) {
      const star = this.giftStars[i];
      if (star.opened) continue;
      const dx = x - star.x;
      const dy = y - star.y;
      if (dx * dx + dy * dy < 50 * 50) { // generous hit area
        this.openGiftStar(star);
        return true;
      }
    }
    return false;
  },

  openGiftStar(star) {
    // Pick a reward - no duplicates until pool is exhausted
    const available = RewardPool.items.filter(r => !this.unlocked.includes(r.id));
    let reward;
    if (available.length > 0) {
      reward = available[Math.floor(Math.random() * available.length)];
    } else {
      // All unlocked - pick random
      reward = RewardPool.items[Math.floor(Math.random() * RewardPool.items.length)];
    }

    star.opened = true;
    star.openAnim = 0;
    star.reward = reward;

    if (!this.unlocked.includes(reward.id)) {
      this.unlocked.push(reward.id);
    }

    GameAudio.playGiftStarOpen();
    Particles.emitBloom(star.x, star.y, [reward.color, '#ffffcc', '#ffffff']);
  },

  // Check if a specific reward is unlocked
  isUnlocked(rewardId) {
    return this.unlocked.includes(rewardId);
  },

  // Get all unlocked rewards of a type
  getUnlockedByType(type) {
    return RewardPool.items.filter(r => r.type === type && this.unlocked.includes(r.id));
  },
};
