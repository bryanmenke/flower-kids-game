// Decorations - 5 decoration types, placement on ground, detailed procedural rendering
// Depends on: Camera, Game

const DecorationDefs = {
  bridge: {
    name: 'Tiny Bridge',
    draw(ctx, s, time) {
      // Arched wooden plank bridge
      const w = s * 0.6;
      const h = s * 0.25;
      // Arch shape
      ctx.strokeStyle = '#8b6b3a';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(0, -h, w / 2, 0);
      ctx.stroke();
      // Planks
      ctx.fillStyle = '#a07040';
      const plankCount = 7;
      for (let i = 0; i < plankCount; i++) {
        const t = i / (plankCount - 1);
        const px = -w / 2 + t * w;
        const py = -Math.sin(t * Math.PI) * h;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-Math.cos(t * Math.PI) * 0.3);
        ctx.fillRect(-s * 0.03, -s * 0.015, s * 0.06, s * 0.03);
        ctx.restore();
      }
      // Railings (left and right posts)
      ctx.strokeStyle = '#7a5a2a';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + s * 0.03, 0);
      ctx.lineTo(-w / 2 + s * 0.03, -h * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - s * 0.03, 0);
      ctx.lineTo(w / 2 - s * 0.03, -h * 0.6);
      ctx.stroke();
      // Railing rope
      ctx.strokeStyle = '#9a7a4a';
      ctx.lineWidth = s * 0.012;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + s * 0.03, -h * 0.5);
      ctx.quadraticCurveTo(0, -h * 1.1, w / 2 - s * 0.03, -h * 0.5);
      ctx.stroke();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  lantern: {
    name: 'Glow Lantern',
    draw(ctx, s, time) {
      // Post
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(-s * 0.02, -s * 0.35, s * 0.04, s * 0.35);
      // Lantern body
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // Glass panels
      ctx.fillStyle = '#ffee88';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Top cap
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.43);
      ctx.lineTo(0, -s * 0.48);
      ctx.lineTo(s * 0.05, -s * 0.43);
      ctx.closePath();
      ctx.fill();
      // Light glow on ground
      const pulse = 0.7 + Math.sin(time * 2) * 0.3;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.3 * pulse);
      grad.addColorStop(0, 'rgba(255, 200, 80, 0.15)');
      grad.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Light glow around lantern
      const lGrad = ctx.createRadialGradient(0, -s * 0.38, 0, 0, -s * 0.38, s * 0.15 * pulse);
      lGrad.addColorStop(0, 'rgba(255, 220, 100, 0.3)');
      lGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.38, s * 0.15 * pulse, 0, Math.PI * 2);
      ctx.fill();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  pond: {
    name: 'Crystal Pond',
    draw(ctx, s, time) {
      // Water surface oval
      const w = s * 0.5;
      const h = s * 0.2;
      // Darker edge
      ctx.fillStyle = '#3388bb';
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner water
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8);
      grad.addColorStop(0, '#66bbee');
      grad.addColorStop(0.6, '#4499cc');
      grad.addColorStop(1, '#3377aa');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.9, h * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      // Reflection highlights
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#aaddff';
      ctx.beginPath();
      ctx.ellipse(-w * 0.2, -h * 0.2, w * 0.15, h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Ripple rings
      const ripplePhase = (time * 0.8) % 1;
      ctx.save();
      ctx.globalAlpha = 0.2 * (1 - ripplePhase);
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.ellipse(w * 0.1, h * 0.1, w * 0.2 * ripplePhase + w * 0.05, h * 0.15 * ripplePhase + h * 0.04, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Second ripple offset
      const rp2 = ((time * 0.8) + 0.5) % 1;
      ctx.save();
      ctx.globalAlpha = 0.15 * (1 - rp2);
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.ellipse(-w * 0.15, -h * 0.05, w * 0.15 * rp2 + w * 0.03, h * 0.12 * rp2 + h * 0.03, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  arch: {
    name: 'Rainbow Arch',
    draw(ctx, s, time) {
      // Stone pillars
      ctx.fillStyle = '#888888';
      ctx.fillRect(-s * 0.25, -s * 0.35, s * 0.06, s * 0.35);
      ctx.fillRect(s * 0.19, -s * 0.35, s * 0.06, s * 0.35);
      // Stone blocks texture
      ctx.strokeStyle = '#777777';
      ctx.lineWidth = s * 0.005;
      for (let row = 0; row < 4; row++) {
        const y = -s * 0.08 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, y);
        ctx.lineTo(-s * 0.19, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.19, y);
        ctx.lineTo(s * 0.25, y);
        ctx.stroke();
      }
      // Stone arch top
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(0, -s * 0.35, s * 0.25, Math.PI, 0);
      ctx.lineTo(s * 0.19, -s * 0.35);
      ctx.arc(0, -s * 0.35, s * 0.19, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();
      // Rainbow band above arch
      const rainbow = ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#8844cc'];
      const bandWidth = s * 0.015;
      for (let i = 0; i < rainbow.length; i++) {
        const r = s * 0.28 + i * bandWidth;
        ctx.strokeStyle = rainbow[i];
        ctx.lineWidth = bandWidth;
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, r, Math.PI, 0);
        ctx.stroke();
      }
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },

  tower: {
    name: 'Castle Tower',
    draw(ctx, s, time) {
      // Tower body (stone)
      ctx.fillStyle = '#999999';
      ctx.fillRect(-s * 0.08, -s * 0.5, s * 0.16, s * 0.5);
      // Stone block lines
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = s * 0.005;
      for (let row = 0; row < 6; row++) {
        const y = -s * 0.08 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.08, y);
        ctx.lineTo(s * 0.08, y);
        ctx.stroke();
        // Offset vertical lines per row
        const offset = (row % 2) * s * 0.04;
        ctx.beginPath();
        ctx.moveTo(-s * 0.04 + offset, y);
        ctx.lineTo(-s * 0.04 + offset, y - s * 0.08);
        ctx.stroke();
      }
      // Battlements
      ctx.fillStyle = '#aaaaaa';
      for (let i = 0; i < 3; i++) {
        const bx = -s * 0.08 + i * s * 0.06;
        ctx.fillRect(bx, -s * 0.55, s * 0.04, s * 0.05);
      }
      // Window with glow
      const glowPulse = 0.6 + Math.sin(time * 1.5) * 0.4;
      const wGrad = ctx.createRadialGradient(0, -s * 0.32, 0, 0, -s * 0.32, s * 0.06);
      wGrad.addColorStop(0, `rgba(255, 220, 100, ${0.4 * glowPulse})`);
      wGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.32, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // Window frame
      ctx.fillStyle = '#ffdd66';
      ctx.fillRect(-s * 0.02, -s * 0.35, s * 0.04, s * 0.05);
      ctx.beginPath();
      ctx.arc(0, -s * 0.35, s * 0.02, Math.PI, 0);
      ctx.fill();
      // Flag on top
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55);
      ctx.lineTo(0, -s * 0.7);
      ctx.stroke();
      // Flag cloth
      const wave = Math.sin(time * 3) * s * 0.01;
      ctx.fillStyle = '#cc3344';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(s * 0.08, -s * 0.67 + wave);
      ctx.lineTo(s * 0.07, -s * 0.63 + wave);
      ctx.lineTo(0, -s * 0.65);
      ctx.closePath();
      ctx.fill();
    },
    icon(ctx, x, y, size) {
      ctx.save();
      ctx.translate(x, y);
      this.draw(ctx, size, 0);
      ctx.restore();
    },
  },
};

const DecorationIds = ['bridge', 'lantern', 'pond', 'arch', 'tower'];

const Decorations = {
  placed: [],  // { id, angle, depth }

  placeDecoration(decoId, angle, depth) {
    this.placed.push({ id: decoId, angle, depth });
  },

  // Get draw list for depth-sorting in main.js
  getSortedDrawList() {
    const list = [];
    for (const deco of this.placed) {
      const pos = Camera.worldToScreen(deco.angle, deco.depth);
      if (!pos.visible) continue;
      list.push({ deco, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single decoration at screen position
  drawDecoration(ctx, deco, x, y, scale) {
    const def = DecorationDefs[deco.id];
    if (!def) return;
    ctx.save();
    ctx.translate(x, y);
    const s = 120 * scale;
    def.draw(ctx, s, Game.time);
    ctx.restore();
  },
};
