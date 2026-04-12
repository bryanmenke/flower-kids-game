// Plants - Types, placement, growth, bloom rendering

const PlantTypes = [
  {
    id: 'glowFlower',
    name: 'Glow Flower',
    color: '#ff69b4',       // pink
    glowColor: 'rgba(255, 105, 180, 0.4)',
    bloomColors: ['#ff69b4', '#ff99cc', '#ffccdd'],
    icon: (ctx, x, y, size) => {
      // Simple flower icon for tray
      ctx.fillStyle = '#ff69b4';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * size * 0.3, y + Math.sin(a) * size * 0.3, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'crystalMushroom',
    name: 'Crystal Mushroom',
    color: '#88ddff',       // cyan
    glowColor: 'rgba(136, 221, 255, 0.4)',
    bloomColors: ['#88ddff', '#aaeeff', '#ccf4ff'],
    icon: (ctx, x, y, size) => {
      // Mushroom cap
      ctx.fillStyle = '#88ddff';
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.1, size * 0.35, size * 0.25, 0, Math.PI, 0);
      ctx.fill();
      // Stem
      ctx.fillStyle = '#ddeeff';
      ctx.fillRect(x - size * 0.08, y - size * 0.1, size * 0.16, size * 0.35);
    },
  },
  {
    id: 'sparkleTree',
    name: 'Sparkle Tree',
    color: '#88ee88',       // green
    glowColor: 'rgba(136, 238, 136, 0.4)',
    bloomColors: ['#88ee88', '#aaffaa', '#eeffcc'],
    icon: (ctx, x, y, size) => {
      // Triangle tree
      ctx.fillStyle = '#88ee88';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.4);
      ctx.lineTo(x + size * 0.3, y + size * 0.15);
      ctx.lineTo(x - size * 0.3, y + size * 0.15);
      ctx.closePath();
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(x - size * 0.06, y + size * 0.15, size * 0.12, size * 0.2);
    },
  },
  {
    id: 'starBush',
    name: 'Star Bush',
    color: '#ffdd44',       // gold
    glowColor: 'rgba(255, 221, 68, 0.4)',
    bloomColors: ['#ffdd44', '#ffee88', '#ffffcc'],
    icon: (ctx, x, y, size) => {
      // Star shape
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        ctx.lineTo(x + Math.cos(outerAngle) * size * 0.35, y + Math.sin(outerAngle) * size * 0.35);
        ctx.lineTo(x + Math.cos(innerAngle) * size * 0.15, y + Math.sin(innerAngle) * size * 0.15);
      }
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: 'rainbowVine',
    name: 'Rainbow Vine',
    color: '#cc77ff',       // purple
    glowColor: 'rgba(204, 119, 255, 0.4)',
    bloomColors: ['#ff6666', '#ffaa44', '#ffdd44', '#88ee88', '#66bbff', '#cc77ff'],
    icon: (ctx, x, y, size) => {
      // Swirly vine
      ctx.strokeStyle = '#cc77ff';
      ctx.lineWidth = size * 0.08;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const vx = x + Math.sin(t * Math.PI * 3) * size * 0.25;
        const vy = y + size * 0.35 - t * size * 0.7;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.stroke();
      // Little flower on top
      ctx.fillStyle = '#ff88cc';
      ctx.beginPath();
      ctx.arc(x + Math.sin(Math.PI * 3) * size * 0.25, y - size * 0.35, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  // --- Rare seed plants (unlocked via gift star rewards) ---
  {
    id: 'rainbowTree',
    name: 'Rainbow Tree',
    color: '#ff6666',
    glowColor: 'rgba(255, 150, 100, 0.5)',
    bloomColors: ['#ff6666', '#ffaa44', '#ffdd44', '#88ee88', '#66bbff', '#cc77ff'],
    seedId: 'rainbowTree', // matches RewardPool item id
    icon: (ctx, x, y, size) => {
      // Rainbow trunk
      ctx.fillStyle = '#cc8844';
      ctx.fillRect(x - size * 0.07, y + size * 0.05, size * 0.14, size * 0.35);
      // Rainbow layered canopy
      const colors = ['#ff6666', '#ffaa44', '#ffdd44', '#88ee88', '#66bbff', '#cc77ff'];
      for (let i = colors.length - 1; i >= 0; i--) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        const r = size * (0.38 - i * 0.03);
        const yOff = y - size * 0.15 - i * size * 0.04;
        ctx.arc(x, yOff, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'fireworkFlower',
    name: 'Firework Flower',
    color: '#ffaa44',
    glowColor: 'rgba(255, 170, 68, 0.5)',
    bloomColors: ['#ff4444', '#ff8833', '#ffaa44', '#ffdd66', '#ffffff'],
    seedId: 'fireworkFlower', // matches RewardPool item id
    icon: (ctx, x, y, size) => {
      // Stem
      ctx.strokeStyle = '#66aa44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.35);
      ctx.lineTo(x, y - size * 0.05);
      ctx.stroke();
      // Firework burst petals
      const burstColors = ['#ff4444', '#ff8833', '#ffaa44', '#ffdd66', '#ff4444', '#ff8833', '#ffaa44', '#ffdd66'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = burstColors[i];
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * size * 0.08, y - size * 0.15 + Math.sin(a) * size * 0.08);
        ctx.lineTo(x + Math.cos(a) * size * 0.3, y - size * 0.15 + Math.sin(a) * size * 0.3);
        ctx.stroke();
      }
      // Center
      ctx.fillStyle = '#ffdd66';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.15, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];

const Plants = {
  items: [],   // all placed plants: { typeIndex, angle, state: 'sprout'|'bloomed', bloomTime }
  selectedType: -1,  // index into PlantTypes, -1 = none selected

  addPlant(typeIndex, surfaceAngle) {
    const plant = {
      typeIndex,
      angle: surfaceAngle,
      state: 'sprout',
      bloomTime: 0,
      wobble: Math.random() * Math.PI * 2, // random wobble offset
    };
    this.items.push(plant);
    return plant;
  },

  bloomPlant(plant) {
    plant.state = 'bloomed';
    plant.bloomTime = Game.time;
  },

  // Draw all plants on the planet surface
  draw(ctx) {
    // Sort by depth so back-of-planet plants draw first
    const sorted = [...this.items].map(p => {
      const pos = Planet.surfacePoint(p.angle);
      return { plant: p, pos };
    }).sort((a, b) => a.pos.depth - b.pos.depth);

    for (const { plant, pos } of sorted) {
      if (!pos.visible) continue;
      const type = PlantTypes[plant.typeIndex];
      const size = Planet.radius * 0.15 * pos.scale;

      ctx.save();
      ctx.translate(pos.x, pos.y);

      if (plant.state === 'sprout') {
        this.drawSprout(ctx, type, size, plant);
      } else {
        this.drawBloomed(ctx, type, size, plant);
      }

      ctx.restore();
    }
  },

  drawSprout(ctx, type, size, plant) {
    // Pulsing sprout
    const pulse = 1 + Math.sin(Game.time * 3 + plant.wobble) * 0.1;
    const s = size * pulse;

    // Stem
    ctx.strokeStyle = '#66aa44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 0.8);
    ctx.stroke();

    // Tiny leaf
    ctx.fillStyle = type.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.8, s * 0.3, s * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Glow pulse
    ctx.fillStyle = type.glowColor;
    ctx.beginPath();
    ctx.arc(0, -s * 0.4, s * 0.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBloomed(ctx, type, size, plant) {
    const age = Game.time - plant.bloomTime;
    const growScale = Math.min(1, age * 3); // grow in over 0.33s
    const s = size * 1.5 * growScale;
    const wobble = Math.sin(Game.time * 1.5 + plant.wobble) * 0.05;

    ctx.rotate(wobble);

    // Glow
    const glowGrad = ctx.createRadialGradient(0, -s * 0.3, 0, 0, -s * 0.3, s * 1.2);
    glowGrad.addColorStop(0, type.glowColor);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Use the icon draw function scaled for the planet
    type.icon(ctx, 0, -s * 0.3, s);
  },

  // Draw placement hints when a plant type is selected
  drawPlacementHints(ctx) {
    if (this.selectedType < 0) return;

    const hintCount = 8;
    for (let i = 0; i < hintCount; i++) {
      const angle = (i / hintCount) * Math.PI * 2;
      const pos = Planet.surfacePoint(angle);
      if (!pos.visible) continue;

      const pulse = 0.5 + Math.sin(Game.time * 2 + i) * 0.3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, Planet.radius * 0.06 * pos.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${pulse * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 200, ${pulse * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  },

  // Find plant near a screen position
  findPlantAt(screenX, screenY) {
    for (const plant of this.items) {
      const pos = Planet.surfacePoint(plant.angle);
      if (!pos.visible) continue;
      const dx = screenX - pos.x;
      const dy = screenY - pos.y;
      const hitSize = Planet.radius * 0.15 * pos.scale;
      if (dx * dx + dy * dy < hitSize * hitSize * 4) {
        return plant;
      }
    }
    return null;
  },
};
