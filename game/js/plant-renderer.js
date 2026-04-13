// PlantRenderer - Detailed procedural drawing for 7 plant types across 5 growth stages
// Pure draw functions. No state, no logic.
// Each draw call assumes ctx is already translated to the plant's screen position.
// stage: 0=seed, 1=sprout, 2=young, 3=mature, 4=bloom
// progress: 0-1 interpolation within current stage
// scale: size multiplier from Camera (depth-based)
// time: Game.time for animations

const PlantRenderer = {
  // Main dispatch: draws the correct plant at the correct stage
  draw(ctx, typeIndex, stage, progress, scale, time) {
    const s = 40 * scale; // base size unit
    ctx.save();

    // Shadow at base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, s * 0.5, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, stage, progress, s, time);

    ctx.restore();
  },

  // Helper: draw a curved stem using quadratic bezier
  _stem(ctx, x1, y1, cx, cy, x2, y2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  },

  // Helper: draw a leaf shape (ellipse at angle)
  _leaf(ctx, x, y, w, h, angle, color, veinColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Leaf body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vein
    if (veinColor) {
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.8, 0);
      ctx.lineTo(w * 0.8, 0);
      ctx.stroke();
    }
    ctx.restore();
  },

  // Helper: draw a petal (teardrop arc)
  _petal(ctx, x, y, length, width, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(width, -length * 0.4, 0, -length);
    ctx.quadraticCurveTo(-width, -length * 0.4, 0, 0);
    ctx.fill();
    ctx.restore();
  },

  // Interpolation helper
  _lerp(a, b, t) { return a + (b - a) * t; },

  _types: [
    // === 0: Rose Bush ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.2) * 0.03;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed: soil mound with dark seed
        const moundH = PlantRenderer._lerp(2, 4, p) * s / 40;
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.2, moundH, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.ellipse(0, -moundH * 0.5, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Sprout: thin stem, two tiny leaves
        const h = PlantRenderer._lerp(0.15, 0.4, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.04, '#4a8030');
        if (p > 0.3) {
          const leafSize = PlantRenderer._lerp(0, 0.12, (p - 0.3) / 0.7) * s;
          PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.7, leafSize, leafSize * 0.5, -0.5, '#5a9940', '#3a6620');
          PlantRenderer._leaf(ctx, s * 0.06, -h * 0.65, leafSize, leafSize * 0.5, 0.5, '#5a9940', '#3a6620');
        }
      } else if (stage === 2) {
        // Young: thicker stem, branches, 3-4 serrated leaves
        const h = PlantRenderer._lerp(0.4, 0.6, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.5, 0, -h, s * 0.06, '#3d7025');
        // Branches
        PlantRenderer._stem(ctx, 0, -h * 0.5, -s * 0.15, -h * 0.65, -s * 0.2, -h * 0.55, s * 0.035, '#3d7025');
        PlantRenderer._stem(ctx, 0, -h * 0.65, s * 0.12, -h * 0.8, s * 0.18, -h * 0.7, s * 0.035, '#3d7025');
        // Leaves
        const ls = s * 0.14;
        PlantRenderer._leaf(ctx, -s * 0.2, -h * 0.55, ls, ls * 0.45, -0.6, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.18, -h * 0.7, ls, ls * 0.45, 0.4, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.85, ls * 0.9, ls * 0.4, -0.2, '#55993a', '#2d5518');
        if (p > 0.5) PlantRenderer._leaf(ctx, s * 0.08, -h * 0.4, ls * 0.8, ls * 0.4, 0.7, '#55993a', '#2d5518');
      } else if (stage === 3) {
        // Mature: fuller bush, tight green buds at tips
        const h = s * 0.7;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#3a6822');
        // Multiple branches
        const branches = [
          { x: -s * 0.25, y: -h * 0.65, angle: -0.6 },
          { x: s * 0.22, y: -h * 0.7, angle: 0.5 },
          { x: 0, y: -h, angle: 0 },
          { x: -s * 0.12, y: -h * 0.9, angle: -0.3 },
          { x: s * 0.1, y: -h * 0.85, angle: 0.3 },
        ];
        branches.forEach(br => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, br.x * 0.5, (br.y + -h * 0.4) * 0.5, br.x, br.y, s * 0.04, '#3a6822');
          PlantRenderer._leaf(ctx, br.x, br.y + s * 0.05, s * 0.12, s * 0.05, br.angle, '#4a8832', '#2d5518');
        });
        // Green buds at branch tips
        const budSize = PlantRenderer._lerp(0.02, 0.06, p) * s;
        branches.forEach(br => {
          ctx.fillStyle = '#6aaa44';
          ctx.beginPath();
          ctx.arc(br.x, br.y - s * 0.02, budSize, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Bloom: full roses with layered petals
        const h = s * 0.75;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#3a6822');
        const rosePositions = [
          { x: 0, y: -h, size: 1.0 },
          { x: -s * 0.22, y: -h * 0.7, size: 0.85 },
          { x: s * 0.2, y: -h * 0.75, size: 0.9 },
        ];
        // Branches to roses
        rosePositions.forEach(rp => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, rp.x * 0.5, (rp.y + -h * 0.4) * 0.5, rp.x, rp.y + s * 0.08, s * 0.04, '#3a6822');
          PlantRenderer._leaf(ctx, rp.x + s * 0.08, rp.y + s * 0.1, s * 0.1, s * 0.04, 0.5, '#4a8832', null);
        });
        // Draw roses
        rosePositions.forEach(rp => {
          const rs = s * 0.12 * rp.size;
          const petalCount = 8;
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 + time * 0.1;
            const shade = i % 2 === 0 ? '#cc3355' : '#dd4466';
            PlantRenderer._petal(ctx, rp.x, rp.y, rs, rs * 0.45, angle, shade);
          }
          // Inner petals (smaller, darker)
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + 0.3 + time * 0.1;
            PlantRenderer._petal(ctx, rp.x, rp.y, rs * 0.6, rs * 0.3, angle, '#aa2244');
          }
          // Center
          ctx.fillStyle = '#ffcc44';
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rs * 0.15, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // === 1: Sunflower ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 0.8 + 1) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed: soil crack with striped seed
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        const seedH = PlantRenderer._lerp(0.03, 0.06, p) * s;
        ctx.fillStyle = '#3a3a2a';
        ctx.beginPath();
        ctx.ellipse(0, -seedH, s * 0.035, seedH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stripe on seed
        ctx.strokeStyle = '#5a5a4a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -seedH * 2);
        ctx.stroke();
      } else if (stage === 1) {
        // Sprout: thick stem, cotyledon pair
        const h = PlantRenderer._lerp(0.15, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#5a8a30');
        if (p > 0.2) {
          const ls = PlantRenderer._lerp(0, 0.15, (p - 0.2) / 0.8) * s;
          // Round cotyledons
          ctx.fillStyle = '#6a9a40';
          ctx.beginPath();
          ctx.ellipse(-s * 0.08, -h * 0.8, ls, ls * 0.6, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(s * 0.08, -h * 0.75, ls, ls * 0.6, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        // Young: tall stem, broad leaves
        const h = PlantRenderer._lerp(0.4, 0.75, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.06, '#4a7a28');
        // Broad leaves
        const ls = s * 0.18;
        PlantRenderer._leaf(ctx, -s * 0.12, -h * 0.35, ls, ls * 0.55, -0.7, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.1, -h * 0.5, ls, ls * 0.55, 0.6, '#4a8832', '#2d5518');
        if (p > 0.4) {
          PlantRenderer._leaf(ctx, -s * 0.08, -h * 0.65, ls * 0.85, ls * 0.45, -0.5, '#55993a', '#2d5518');
        }
      } else if (stage === 3) {
        // Mature: very tall, large green disc forming at top
        const h = s * 0.9;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.07, '#4a7a28');
        // Leaves
        PlantRenderer._leaf(ctx, -s * 0.14, -h * 0.3, s * 0.2, s * 0.08, -0.7, '#4a8832', '#2d5518');
        PlantRenderer._leaf(ctx, s * 0.12, -h * 0.5, s * 0.18, s * 0.07, 0.6, '#4a8832', '#2d5518');
        // Green disc (developing flower head)
        const discSize = PlantRenderer._lerp(0.08, 0.18, p) * s;
        ctx.fillStyle = '#5a8830';
        ctx.beginPath();
        ctx.arc(s * 0.03, -h - discSize * 0.3, discSize, 0, Math.PI * 2);
        ctx.fill();
        // Hint of yellow at edge
        if (p > 0.5) {
          ctx.strokeStyle = '#ccaa20';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(s * 0.03, -h - discSize * 0.3, discSize + 1, Math.PI * 0.8, Math.PI * 1.8);
          ctx.stroke();
        }
      } else {
        // Bloom: classic sunflower
        const h = s * 0.95;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.08, '#4a7a28');
        PlantRenderer._leaf(ctx, -s * 0.16, -h * 0.3, s * 0.2, s * 0.08, -0.7, '#4a8832', null);
        PlantRenderer._leaf(ctx, s * 0.13, -h * 0.5, s * 0.18, s * 0.07, 0.6, '#4a8832', null);

        const headX = s * 0.03;
        const headY = -h;
        const headR = s * 0.22;
        // Slight head nod
        const nod = Math.sin(time * 0.5) * 0.05;
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(nod);

        // Petals
        const petalCount = 16;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2;
          const shade = i % 2 === 0 ? '#e8b800' : '#d4a600';
          PlantRenderer._petal(ctx, 0, 0, headR * 1.1, headR * 0.25, angle, shade);
        }
        // Dark center with spiral pattern
        ctx.fillStyle = '#3a2810';
        ctx.beginPath();
        ctx.arc(0, 0, headR * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Fibonacci dots on center
        ctx.fillStyle = '#5a4020';
        for (let i = 0; i < 20; i++) {
          const a = i * 2.4; // golden angle
          const r = Math.sqrt(i) * headR * 0.11;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    },

    // === 2: Willow Tree ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Seed: acorn on soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#8a6a30';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.04, s * 0.04, s * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cap
        ctx.fillStyle = '#6a5020';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.07, s * 0.045, s * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Sprout: thin sapling
        const h = PlantRenderer._lerp(0.15, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.03, '#7a9a5a');
        if (p > 0.4) {
          PlantRenderer._leaf(ctx, s * 0.03, -h * 0.9, s * 0.06, s * 0.03, 0.3, '#8aaa6a', null);
          PlantRenderer._leaf(ctx, -s * 0.03, -h * 0.8, s * 0.06, s * 0.03, -0.3, '#8aaa6a', null);
        }
      } else if (stage === 2) {
        // Young: slender trunk, first drooping branches
        const h = PlantRenderer._lerp(0.4, 0.7, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#8a7a5a');
        // First drooping branches
        const branchLen = s * 0.25;
        ctx.strokeStyle = '#7a9a5a';
        ctx.lineWidth = s * 0.02;
        ctx.lineCap = 'round';
        [-0.4, 0.3].forEach(offset => {
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.7);
          ctx.quadraticCurveTo(offset * s, -h * 0.5, offset * s * 1.2, -h * 0.3);
          ctx.stroke();
        });
      } else if (stage === 3) {
        // Mature: taller trunk, weeping canopy forming
        const h = s * 0.85;
        // Trunk
        ctx.fillStyle = '#7a6a4a';
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, 0);
        ctx.lineTo(-s * 0.03, -h * 0.9);
        ctx.lineTo(s * 0.03, -h * 0.9);
        ctx.lineTo(s * 0.04, 0);
        ctx.fill();
        // Weeping branches
        const branchCount = 6;
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI - Math.PI * 0.5;
          const bx = Math.cos(angle) * s * 0.3;
          const by = -h * 0.9 + Math.sin(angle) * s * 0.1;
          const droopY = by + s * 0.4 + Math.sin(time + i) * s * 0.02;
          ctx.strokeStyle = '#6a8a4a';
          ctx.lineWidth = s * 0.015;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.85);
          ctx.quadraticCurveTo(bx * 0.7, by, bx, droopY);
          ctx.stroke();
        }
      } else {
        // Bloom: full weeping willow
        const h = s;
        // Trunk with bark texture
        ctx.fillStyle = '#6a5a3a';
        ctx.beginPath();
        ctx.moveTo(-s * 0.05, 0);
        ctx.quadraticCurveTo(-s * 0.04, -h * 0.5, -s * 0.03, -h * 0.85);
        ctx.lineTo(s * 0.03, -h * 0.85);
        ctx.quadraticCurveTo(s * 0.04, -h * 0.5, s * 0.05, 0);
        ctx.fill();
        // Bark lines
        ctx.strokeStyle = '#5a4a2a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const bx = (i - 1.5) * s * 0.02;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx, -h * 0.8);
          ctx.stroke();
        }
        // Cascading branches with leaf shapes
        const branchCount = 10;
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI * 1.2 - Math.PI * 0.6;
          const bx = Math.cos(angle) * s * 0.4;
          const droopLen = s * 0.45 + Math.sin(i * 2.3) * s * 0.1;
          const sway = Math.sin(time * 0.8 + i * 0.7) * s * 0.03;
          const endX = bx + sway;
          const endY = -h * 0.85 + droopLen;

          ctx.strokeStyle = `rgba(90, 130, 60, ${0.5 + Math.sin(i) * 0.2})`;
          ctx.lineWidth = s * 0.012;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.85);
          ctx.bezierCurveTo(bx * 0.5, -h * 0.85 + droopLen * 0.2, bx * 0.8, -h * 0.85 + droopLen * 0.6, endX, endY);
          ctx.stroke();

          // Tiny leaves along branch
          for (let j = 0; j < 5; j++) {
            const t = (j + 1) / 6;
            const lx = bx * t + sway * t;
            const ly = -h * 0.85 + droopLen * t * t;
            ctx.fillStyle = '#7aaa50';
            ctx.beginPath();
            ctx.ellipse(lx, ly, s * 0.02, s * 0.01, angle, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 3: Mushroom Cluster ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Spore dots on soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        const count = Math.floor(PlantRenderer._lerp(1, 4, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - 1.5) * s * 0.04;
          ctx.fillStyle = '#ddddcc';
          ctx.beginPath();
          ctx.arc(dx, -s * 0.01, s * 0.01, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        // Tiny white pins
        const count = 3;
        const heights = [0.12, 0.08, 0.1];
        for (let i = 0; i < count; i++) {
          const dx = (i - 1) * s * 0.08;
          const h = PlantRenderer._lerp(0.02, heights[i], p) * s;
          ctx.strokeStyle = '#eeeedd';
          ctx.lineWidth = s * 0.02;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.lineTo(dx, -h);
          ctx.stroke();
          // Tiny round top
          ctx.fillStyle = '#eeeedd';
          ctx.beginPath();
          ctx.arc(dx, -h, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        // Caps forming
        const shrooms = [
          { x: 0, h: 0.25, capW: 0.1, capH: 0.06 },
          { x: -s * 0.1, h: 0.18, capW: 0.07, capH: 0.04 },
          { x: s * 0.08, h: 0.2, capW: 0.08, capH: 0.05 },
          { x: s * 0.15, h: 0.12, capW: 0.05, capH: 0.03 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Stem
          ctx.fillStyle = '#ddd8cc';
          ctx.fillRect(sh.x - s * 0.015, -mh, s * 0.03, mh);
          // Cap
          ctx.fillStyle = '#c8a878';
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, 0);
          ctx.fill();
        });
      } else if (stage === 3) {
        // Full caps with gills
        const shrooms = [
          { x: 0, h: 0.35, capW: 0.14, capH: 0.08 },
          { x: -s * 0.12, h: 0.25, capW: 0.1, capH: 0.06 },
          { x: s * 0.1, h: 0.28, capW: 0.11, capH: 0.07 },
          { x: s * 0.18, h: 0.18, capW: 0.07, capH: 0.04 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Stem
          ctx.fillStyle = '#e0dbd0';
          ctx.beginPath();
          ctx.moveTo(sh.x - s * 0.02, 0);
          ctx.lineTo(sh.x - s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.02, 0);
          ctx.fill();
          // Cap with gradient
          const capGrad = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s);
          capGrad.addColorStop(0, '#d4a870');
          capGrad.addColorStop(0.7, '#c09060');
          capGrad.addColorStop(1, '#a87850');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s * 0.3, 0, 0, Math.PI);
          ctx.fill();
          // Gill lines
          ctx.strokeStyle = 'rgba(180, 150, 120, 0.4)';
          ctx.lineWidth = 0.5;
          for (let g = 0; g < 5; g++) {
            const gx = sh.x + (g - 2) * sh.capW * s * 0.3;
            ctx.beginPath();
            ctx.moveTo(gx, -mh);
            ctx.lineTo(gx, -mh + sh.capH * s * 0.3);
            ctx.stroke();
          }
        });
      } else {
        // Bloom: bioluminescent glow
        const shrooms = [
          { x: 0, h: 0.38, capW: 0.15, capH: 0.09 },
          { x: -s * 0.13, h: 0.28, capW: 0.11, capH: 0.07 },
          { x: s * 0.11, h: 0.32, capW: 0.12, capH: 0.08 },
          { x: s * 0.2, h: 0.2, capW: 0.08, capH: 0.05 },
        ];
        shrooms.forEach(sh => {
          const mh = sh.h * s;
          // Glow aura
          const glow = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s * 2);
          const pulse = 0.15 + Math.sin(time * 2 + sh.x) * 0.05;
          glow.addColorStop(0, `rgba(100, 200, 180, ${pulse})`);
          glow.addColorStop(1, 'rgba(100, 200, 180, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sh.x, -mh, sh.capW * s * 2, 0, Math.PI * 2);
          ctx.fill();
          // Stem
          ctx.fillStyle = '#e8e4da';
          ctx.beginPath();
          ctx.moveTo(sh.x - s * 0.02, 0);
          ctx.lineTo(sh.x - s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.015, -mh + sh.capH * s * 0.5);
          ctx.lineTo(sh.x + s * 0.02, 0);
          ctx.fill();
          // Glowing cap
          const capGrad = ctx.createRadialGradient(sh.x, -mh, 0, sh.x, -mh, sh.capW * s);
          capGrad.addColorStop(0, '#80ddc0');
          capGrad.addColorStop(0.5, '#60c0a0');
          capGrad.addColorStop(1, '#40a080');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(sh.x, -mh, sh.capW * s, sh.capH * s * 0.3, 0, 0, Math.PI);
          ctx.fill();
        });
      }
    },

    // === 4: Lavender ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.0) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed in soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Thin grass-like shoots
        const count = Math.floor(PlantRenderer._lerp(2, 4, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - count / 2 + 0.5) * s * 0.04;
          const h = PlantRenderer._lerp(0.08, 0.2, p) * s;
          const lean = (i - count / 2 + 0.5) * 0.1;
          ctx.strokeStyle = '#7a9a60';
          ctx.lineWidth = s * 0.015;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + lean * s * 0.1, -h * 0.5, dx + lean * s * 0.15, -h);
          ctx.stroke();
        }
      } else if (stage === 2) {
        // Multiple stems with narrow leaves
        const stems = 5;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.35;
          const lean = (i - stems / 2 + 0.5) * 0.06;
          const stemSway = Math.sin(time * 1.2 + i * 0.5) * 0.02;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, dx + (lean + stemSway) * s * 0.4, -h);
          ctx.stroke();
          // Small narrow leaves
          if (p > 0.3) {
            const lx = dx + lean * s * 0.2;
            const ly = -h * 0.4;
            PlantRenderer._leaf(ctx, lx - s * 0.02, ly, s * 0.04, s * 0.01, -0.3 + lean, '#8aaa70', null);
            PlantRenderer._leaf(ctx, lx + s * 0.02, ly - s * 0.08, s * 0.04, s * 0.01, 0.3 + lean, '#8aaa70', null);
          }
        }
      } else if (stage === 3) {
        // Purple bud clusters forming at tips
        const stems = 6;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.5;
          const lean = (i - stems / 2 + 0.5) * 0.05;
          const stemSway = Math.sin(time + i * 0.6) * 0.02;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, endX, endY);
          ctx.stroke();
          // Purple buds
          const budCount = Math.floor(PlantRenderer._lerp(2, 5, p));
          for (let b = 0; b < budCount; b++) {
            const bt = 0.6 + b * 0.08;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            ctx.fillStyle = '#8866aa';
            ctx.beginPath();
            ctx.arc(bx, by, s * 0.018, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Bloom: full purple flower spikes
        const stems = 6;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.07;
          const h = s * 0.6;
          const lean = (i - stems / 2 + 0.5) * 0.04;
          const stemSway = Math.sin(time * 0.8 + i * 0.7) * 0.025;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.25, -h * 0.5, endX, endY);
          ctx.stroke();
          // Narrow leaves
          const lx = dx + lean * s * 0.15;
          PlantRenderer._leaf(ctx, lx, -h * 0.2, s * 0.05, s * 0.012, -0.2 + lean, '#7a9a60', null);
          // Purple flower spike
          for (let b = 0; b < 8; b++) {
            const bt = 0.45 + b * 0.07;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            const flowerSize = s * 0.022;
            ctx.fillStyle = b % 2 === 0 ? '#9966cc' : '#7744aa';
            ctx.beginPath();
            ctx.arc(bx - flowerSize * 0.5, by, flowerSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bx + flowerSize * 0.5, by, flowerSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 5: Rainbow Tree (rare) ===
    function(ctx, stage, p, s, time) {
      const rainbow = ['#ff4444', '#ff8833', '#ffdd44', '#44cc44', '#4488ff', '#8844cc'];

      if (stage === 0) {
        // Iridescent seed
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        const colorIdx = Math.floor(time * 2) % rainbow.length;
        ctx.fillStyle = rainbow[colorIdx];
        ctx.globalAlpha = 0.5 + pulse * 0.3;
        ctx.beginPath();
        ctx.arc(0, -s * 0.03, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
      } else if (stage === 1) {
        // Crystalline sprout with color bands
        const h = PlantRenderer._lerp(0.1, 0.3, p) * s;
        const bandH = h / rainbow.length;
        for (let i = 0; i < rainbow.length; i++) {
          ctx.strokeStyle = rainbow[i];
          ctx.lineWidth = s * 0.04;
          ctx.beginPath();
          ctx.moveTo(0, -i * bandH);
          ctx.lineTo(0, -(i + 1) * bandH);
          ctx.stroke();
        }
      } else if (stage === 2) {
        // Trunk with shifting colors
        const h = PlantRenderer._lerp(0.3, 0.55, p) * s;
        // Color-shifting trunk
        for (let y = 0; y < h; y += 2) {
          const colorIdx = Math.floor((y / h) * rainbow.length + time * 0.5) % rainbow.length;
          ctx.strokeStyle = rainbow[colorIdx];
          ctx.lineWidth = s * 0.05 * (1 - y / h * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, -y);
          ctx.lineTo(0, -y - 2);
          ctx.stroke();
        }
        // First leaf hints
        if (p > 0.5) {
          ctx.fillStyle = rainbow[0];
          ctx.beginPath();
          ctx.arc(-s * 0.08, -h, s * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rainbow[3];
          ctx.beginPath();
          ctx.arc(s * 0.07, -h * 0.9, s * 0.035, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 3) {
        // Canopy with spectral leaves forming
        const h = s * 0.7;
        // Trunk
        ctx.fillStyle = '#886644';
        ctx.fillRect(-s * 0.04, 0, s * 0.08, -h * 0.6);
        // Forming canopy
        const canopyR = PlantRenderer._lerp(0.1, 0.25, p) * s;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.3;
          const lx = Math.cos(angle) * canopyR * 0.6;
          const ly = -h + Math.sin(angle) * canopyR * 0.4;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(lx, ly, canopyR * 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        // Bloom: full rainbow canopy with light rays
        const h = s * 0.85;
        // Trunk
        ctx.fillStyle = '#886644';
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, 0);
        ctx.lineTo(-s * 0.03, -h * 0.55);
        ctx.lineTo(s * 0.03, -h * 0.55);
        ctx.lineTo(s * 0.04, 0);
        ctx.fill();
        // Light rays
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 0.2;
          const rayLen = s * 0.5;
          ctx.strokeStyle = rainbow[i % rainbow.length];
          ctx.lineWidth = s * 0.04;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.7);
          ctx.lineTo(Math.cos(angle) * rayLen, -h * 0.7 + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();
        // Rainbow canopy
        const canopyR = s * 0.3;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.15;
          const cx = Math.cos(angle) * canopyR * 0.5;
          const cy = -h * 0.75 + Math.sin(angle) * canopyR * 0.35;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canopyR * 0.5);
          grad.addColorStop(0, color);
          grad.addColorStop(1, color.slice(0, -2) + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, canopyR * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Shimmer
        if (Math.sin(time * 4) > 0.8) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(Math.sin(time * 5) * s * 0.15, -h * 0.7 + Math.cos(time * 4) * s * 0.1, s * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },

    // === 6: Firework Flower (rare) ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Glowing ember seed
        const glow = ctx.createRadialGradient(0, -s * 0.02, 0, 0, -s * 0.02, s * 0.08);
        const pulse = 0.3 + Math.sin(time * 4) * 0.1;
        glow.addColorStop(0, `rgba(255, 150, 50, ${pulse})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6622';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Bright orange-red shoot
        const h = PlantRenderer._lerp(0.1, 0.25, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.04, '#cc4422');
        // Heat shimmer
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (stage === 2) {
        // Spiky stems, red-tipped leaves
        const h = PlantRenderer._lerp(0.25, 0.45, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#993320');
        // Spiky angular leaves
        const leafPositions = [
          { x: -s * 0.1, y: -h * 0.4, a: -0.8 },
          { x: s * 0.08, y: -h * 0.55, a: 0.7 },
          { x: -s * 0.06, y: -h * 0.7, a: -0.5 },
        ];
        leafPositions.forEach(lp => {
          // Angular leaf
          ctx.save();
          ctx.translate(lp.x, lp.y);
          ctx.rotate(lp.a);
          ctx.fillStyle = '#4a7728';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(s * 0.08, -s * 0.02);
          ctx.lineTo(s * 0.1, s * 0.01);
          ctx.closePath();
          ctx.fill();
          // Red tip
          ctx.fillStyle = '#cc3322';
          ctx.beginPath();
          ctx.arc(s * 0.09, 0, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (stage === 3) {
        // Tight bud cluster, pulsing glow
        const h = s * 0.55;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.85, s * 0.05, '#993320');
        // Leaves
        PlantRenderer._leaf(ctx, -s * 0.1, -h * 0.35, s * 0.08, s * 0.03, -0.7, '#4a7728', null);
        PlantRenderer._leaf(ctx, s * 0.08, -h * 0.5, s * 0.07, s * 0.025, 0.6, '#4a7728', null);
        // Pulsing bud cluster
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        const budR = PlantRenderer._lerp(0.05, 0.1, p) * s;
        const budGlow = ctx.createRadialGradient(0, -h, 0, 0, -h, budR * 2);
        budGlow.addColorStop(0, `rgba(255, 120, 40, ${0.3 * pulse})`);
        budGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = budGlow;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 2, 0, Math.PI * 2);
        ctx.fill();
        // Buds
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.fillStyle = '#dd5522';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * budR * 0.5, -h + Math.sin(a) * budR * 0.5, budR * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ff8844';
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bloom: explosive starburst
        const h = s * 0.6;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.8, s * 0.06, '#993320');
        PlantRenderer._leaf(ctx, -s * 0.1, -h * 0.3, s * 0.08, s * 0.03, -0.7, '#4a7728', null);

        const cx = 0;
        const cy = -h;
        const burstR = s * 0.3;
        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR * 1.5);
        const glowPulse = 0.2 + Math.sin(time * 2) * 0.05;
        glow.addColorStop(0, `rgba(255, 180, 80, ${glowPulse})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Radiating petal lines
        const colors = ['#ff3322', '#ff6633', '#ffaa44', '#ffdd66', '#ffffff'];
        const rayCount = 12;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + Math.sin(time) * 0.1;
          const colorIdx = Math.floor((i / rayCount) * colors.length);
          const len = burstR * (0.8 + Math.sin(time * 3 + i * 1.5) * 0.15);
          ctx.strokeStyle = colors[colorIdx % colors.length];
          ctx.lineWidth = s * 0.03;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * burstR * 0.15, cy + Math.sin(angle) * burstR * 0.15);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
          // Tip dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#ffcc44';
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  ],

  // Tray icon drawing (used by UI to show plant types in the selection tray)
  drawIcon(ctx, typeIndex, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    const s = size;
    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, 4, 1, s * 0.9, 0); // Draw bloom stage for icon
    ctx.restore();
  },
};
