// Decorations - Planet decorations and animal accessories

const DecorationDefs = {
  bridge: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#c8a87c';
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.5, size * 0.15, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#a08060';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = '#b09070';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.4, y);
      ctx.lineTo(x - size * 0.35, y - size * 0.2);
      ctx.moveTo(x + size * 0.4, y);
      ctx.lineTo(x + size * 0.35, y - size * 0.2);
      ctx.stroke();
    },
  },
  lantern: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#887766';
      ctx.fillRect(x - 1.5, y - size * 0.4, 3, size * 0.4);
      ctx.fillStyle = '#ffdd66';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.5, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(x, y - size * 0.5, 0, x, y - size * 0.5, size * 0.5);
      glow.addColorStop(0, 'rgba(255, 221, 102, 0.4)');
      glow.addColorStop(1, 'rgba(255, 221, 102, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.5, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  pond: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x - size * 0.1, y - size * 0.05, size * 0.15, size * 0.06, -0.3, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  arch: {
    draw(ctx, x, y, size) {
      ctx.lineWidth = 3;
      const colors = ['#ff6666', '#ffaa44', '#ffdd44', '#88ee88', '#66bbff', '#cc77ff'];
      colors.forEach((color, i) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size * (0.35 - i * 0.03), Math.PI, 0);
        ctx.stroke();
      });
    },
  },
  tower: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#ccaadd';
      ctx.fillRect(x - size * 0.12, y - size * 0.5, size * 0.24, size * 0.5);
      ctx.fillStyle = '#aa88cc';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.7);
      ctx.lineTo(x + size * 0.18, y - size * 0.5);
      ctx.lineTo(x - size * 0.18, y - size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffee88';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.35, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    },
  },
};

const AccessoryDefs = {
  crown: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.moveTo(x - size * 0.2, y);
      ctx.lineTo(x - size * 0.15, y - size * 0.15);
      ctx.lineTo(x - size * 0.05, y - size * 0.05);
      ctx.lineTo(x, y - size * 0.2);
      ctx.lineTo(x + size * 0.05, y - size * 0.05);
      ctx.lineTo(x + size * 0.15, y - size * 0.15);
      ctx.lineTo(x + size * 0.2, y);
      ctx.closePath();
      ctx.fill();
    },
    offset: { x: 0, y: -0.65 },
  },
  bow: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#ff66aa';
      ctx.beginPath();
      ctx.ellipse(x - size * 0.1, y, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + size * 0.1, y, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4488';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
    },
    offset: { x: 0.2, y: -0.5 },
  },
  sunglasses: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#44ddff';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(x - size * 0.09, y, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + size * 0.09, y, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#44ddff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.01, y);
      ctx.lineTo(x + size * 0.01, y);
      ctx.stroke();
    },
    offset: { x: 0, y: -0.35 },
  },
  cape: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = '#cc44ff';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.15, y - size * 0.1);
      ctx.lineTo(x + size * 0.15, y - size * 0.1);
      ctx.lineTo(x + size * 0.25, y + size * 0.3);
      ctx.lineTo(x - size * 0.25, y + size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    },
    offset: { x: 0, y: -0.1 },
  },
  wings: {
    draw(ctx, x, y, size) {
      ctx.fillStyle = 'rgba(170, 221, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x - size * 0.25, y, size * 0.2, size * 0.12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + size * 0.25, y, size * 0.2, size * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    },
    offset: { x: 0, y: -0.1 },
  },
  necklace: {
    draw(ctx, x, y, size) {
      ctx.strokeStyle = '#ff88cc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.05, size * 0.12, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#ff88cc';
      ctx.beginPath();
      ctx.arc(x, y + size * 0.07, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    },
    offset: { x: 0, y: -0.15 },
  },
};

const Decorations = {
  placed: [], // { id, angle } - decorations placed on planet

  placeDecoration(decoId, angle) {
    this.placed.push({ id: decoId, angle });
  },

  draw(ctx) {
    for (const deco of this.placed) {
      const pos = Planet.surfacePoint(deco.angle);
      if (!pos.visible) continue;
      const size = Planet.radius * 0.15 * pos.scale;
      const def = DecorationDefs[deco.id];
      if (def) {
        ctx.save();
        def.draw(ctx, pos.x, pos.y, size);
        ctx.restore();
      }
    }
  },

  // Draw accessories on animals
  drawAccessories(ctx) {
    for (const animal of Animals.items) {
      if (!animal.accessory) continue;
      const pos = Planet.surfacePoint(animal.angle);
      if (!pos.visible) continue;
      const size = Planet.radius * 0.2 * pos.scale;
      const def = AccessoryDefs[animal.accessory];
      if (!def) continue;

      const drawY = pos.y - size * 0.3;
      const accX = pos.x + (def.offset.x * size);
      const accY = drawY + (def.offset.y * size);

      ctx.save();
      def.draw(ctx, accX, accY, size);
      ctx.restore();
    }
  },
};
