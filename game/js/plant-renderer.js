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
    const s = 120 * scale; // base size unit — 3x bigger than before
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
        const moundH = PlantRenderer._lerp(2, 5, p) * s / 40;
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
        // Young: thicker stem, branches, serrated leaves
        const h = PlantRenderer._lerp(0.4, 0.6, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.5, 0, -h, s * 0.06, '#2d6018');
        // Branches
        PlantRenderer._stem(ctx, 0, -h * 0.5, -s * 0.15, -h * 0.65, -s * 0.22, -h * 0.55, s * 0.04, '#2d6018');
        PlantRenderer._stem(ctx, 0, -h * 0.65, s * 0.12, -h * 0.8, s * 0.2, -h * 0.7, s * 0.04, '#2d6018');
        // Serrated leaves — richer green
        const ls = s * 0.14;
        PlantRenderer._leaf(ctx, -s * 0.22, -h * 0.55, ls, ls * 0.45, -0.6, '#3a8825', '#1d5510');
        PlantRenderer._leaf(ctx, s * 0.2, -h * 0.7, ls, ls * 0.45, 0.4, '#3a8825', '#1d5510');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.85, ls * 0.9, ls * 0.4, -0.2, '#44992e', '#1d5510');
        if (p > 0.5) PlantRenderer._leaf(ctx, s * 0.08, -h * 0.4, ls * 0.8, ls * 0.4, 0.7, '#44992e', '#1d5510');
        // Thorns (little lines on stems)
        ctx.strokeStyle = '#2a5510';
        ctx.lineWidth = 1;
        [[-s * 0.03, -h * 0.35], [s * 0.02, -h * 0.55], [-s * 0.01, -h * 0.7]].forEach(([tx, ty]) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - s * 0.02, ty - s * 0.02);
          ctx.stroke();
        });
      } else if (stage === 3) {
        // Mature: full bush with tight green/pink buds
        const h = s * 0.7;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#2d6018');
        const branches = [
          { x: -s * 0.28, y: -h * 0.65, angle: -0.6 },
          { x: s * 0.25, y: -h * 0.7, angle: 0.5 },
          { x: 0, y: -h, angle: 0 },
          { x: -s * 0.14, y: -h * 0.9, angle: -0.3 },
          { x: s * 0.12, y: -h * 0.85, angle: 0.3 },
        ];
        branches.forEach(br => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, br.x * 0.5, (br.y + -h * 0.4) * 0.5, br.x, br.y, s * 0.04, '#2d6018');
          // Serrated leaves
          PlantRenderer._leaf(ctx, br.x + s * 0.04, br.y + s * 0.06, s * 0.13, s * 0.05, br.angle, '#3a8825', '#1d5510');
          PlantRenderer._leaf(ctx, br.x - s * 0.04, br.y + s * 0.08, s * 0.1, s * 0.04, br.angle - 0.3, '#44992e', '#1d5510');
        });
        // Pink-green buds forming
        const budSize = PlantRenderer._lerp(0.025, 0.06, p) * s;
        branches.forEach((br, i) => {
          const budColor = i % 2 === 0 ? '#cc4466' : '#55aa33';
          ctx.fillStyle = budColor;
          ctx.beginPath();
          ctx.arc(br.x, br.y - s * 0.02, budSize, 0, Math.PI * 2);
          ctx.fill();
          // Sepal
          ctx.fillStyle = '#3a8825';
          ctx.beginPath();
          ctx.arc(br.x, br.y, budSize * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Bloom: spectacular multi-layered roses
        const h = s * 0.75;
        PlantRenderer._stem(ctx, 0, 0, s * 0.02, -h * 0.4, 0, -h * 0.8, s * 0.07, '#2d6018');
        const rosePositions = [
          { x: 0, y: -h, size: 1.0 },
          { x: -s * 0.24, y: -h * 0.72, size: 0.88 },
          { x: s * 0.22, y: -h * 0.78, size: 0.92 },
        ];
        // Branches and leaves
        rosePositions.forEach(rp => {
          PlantRenderer._stem(ctx, 0, -h * 0.4, rp.x * 0.5, (rp.y + -h * 0.4) * 0.5, rp.x, rp.y + s * 0.1, s * 0.045, '#2d6018');
          PlantRenderer._leaf(ctx, rp.x + s * 0.1, rp.y + s * 0.12, s * 0.11, s * 0.045, 0.5, '#3a8825', '#1d5510');
          PlantRenderer._leaf(ctx, rp.x - s * 0.08, rp.y + s * 0.1, s * 0.09, s * 0.04, -0.4, '#44992e', '#1d5510');
        });
        // Draw 3 big roses with 12+ petals each, gradient shading
        const roseColors = [
          { outer: '#dd2255', mid: '#ee3366', inner: '#aa1133', highlight: '#ffaacc' },
          { outer: '#ee5588', mid: '#ff6699', inner: '#cc3366', highlight: '#ffccdd' },
          { outer: '#cc1144', mid: '#dd2255', inner: '#990033', highlight: '#ff88aa' },
        ];
        rosePositions.forEach((rp, ri) => {
          const rs = s * 0.14 * rp.size;
          const colors = roseColors[ri];
          // Outer ring: 12 petals
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 0.08;
            const grad = ctx.createLinearGradient(
              rp.x + Math.cos(angle) * rs * 0.2, rp.y + Math.sin(angle) * rs * 0.2,
              rp.x + Math.cos(angle) * rs, rp.y + Math.sin(angle) * rs
            );
            grad.addColorStop(0, colors.inner);
            grad.addColorStop(0.5, colors.outer);
            grad.addColorStop(1, colors.highlight);
            PlantRenderer._petal(ctx, rp.x, rp.y, rs * 1.05, rs * 0.42, angle, grad);
          }
          // Middle ring: 8 petals, slightly smaller
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.25 + time * 0.08;
            PlantRenderer._petal(ctx, rp.x, rp.y, rs * 0.75, rs * 0.35, angle, colors.mid);
          }
          // Inner ring: 5 petals, darker
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + 0.5 + time * 0.08;
            PlantRenderer._petal(ctx, rp.x, rp.y, rs * 0.5, rs * 0.28, angle, colors.inner);
          }
          // Bright center with white highlight
          ctx.fillStyle = '#ffdd44';
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rs * 0.14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.beginPath();
          ctx.arc(rp.x - rs * 0.04, rp.y - rs * 0.04, rs * 0.07, 0, Math.PI * 2);
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
        const seedH = PlantRenderer._lerp(0.03, 0.07, p) * s;
        ctx.fillStyle = '#3a3a2a';
        ctx.beginPath();
        ctx.ellipse(0, -seedH, s * 0.04, seedH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stripe on seed
        ctx.strokeStyle = '#6a6a5a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -seedH * 2);
        ctx.stroke();
      } else if (stage === 1) {
        // Sprout: thick stem, round cotyledons
        const h = PlantRenderer._lerp(0.15, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.05, '#4a8a28');
        if (p > 0.2) {
          const ls = PlantRenderer._lerp(0, 0.16, (p - 0.2) / 0.8) * s;
          ctx.fillStyle = '#55aa35';
          ctx.beginPath();
          ctx.ellipse(-s * 0.08, -h * 0.8, ls, ls * 0.65, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(s * 0.08, -h * 0.75, ls, ls * 0.65, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        // Young: tall stem, broad heart-shaped leaves
        const h = PlantRenderer._lerp(0.4, 0.75, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.065, '#3d7a20');
        // Broad heart-shaped leaves
        const ls = s * 0.2;
        PlantRenderer._leaf(ctx, -s * 0.14, -h * 0.35, ls, ls * 0.6, -0.7, '#3d8828', '#1d5510');
        PlantRenderer._leaf(ctx, s * 0.12, -h * 0.5, ls, ls * 0.6, 0.6, '#3d8828', '#1d5510');
        if (p > 0.4) {
          PlantRenderer._leaf(ctx, -s * 0.09, -h * 0.65, ls * 0.85, ls * 0.5, -0.5, '#44992e', '#1d5510');
        }
      } else if (stage === 3) {
        // Mature: very tall, large green disc forming
        const h = s * 0.9;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.08, '#3d7a20');
        PlantRenderer._leaf(ctx, -s * 0.16, -h * 0.3, s * 0.22, s * 0.09, -0.7, '#3d8828', '#1d5510');
        PlantRenderer._leaf(ctx, s * 0.14, -h * 0.5, s * 0.2, s * 0.08, 0.6, '#3d8828', '#1d5510');
        PlantRenderer._leaf(ctx, -s * 0.1, -h * 0.65, s * 0.16, s * 0.07, -0.4, '#44992e', null);
        // Green disc developing
        const discSize = PlantRenderer._lerp(0.08, 0.2, p) * s;
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.arc(s * 0.03, -h - discSize * 0.3, discSize, 0, Math.PI * 2);
        ctx.fill();
        // Yellow peeking out
        if (p > 0.4) {
          ctx.strokeStyle = '#ddaa00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s * 0.03, -h - discSize * 0.3, discSize + 2, Math.PI * 0.7, Math.PI * 1.9);
          ctx.stroke();
        }
      } else {
        // Bloom: big bright classic sunflower
        const h = s * 0.95;
        PlantRenderer._stem(ctx, 0, 0, s * 0.01, -h * 0.5, s * 0.03, -h, s * 0.09, '#3d7a20');
        PlantRenderer._leaf(ctx, -s * 0.18, -h * 0.25, s * 0.22, s * 0.09, -0.7, '#3d8828', null);
        PlantRenderer._leaf(ctx, s * 0.15, -h * 0.45, s * 0.2, s * 0.08, 0.6, '#3d8828', null);
        PlantRenderer._leaf(ctx, -s * 0.12, -h * 0.6, s * 0.16, s * 0.07, -0.4, '#44992e', null);

        const headX = s * 0.03;
        const headY = -h;
        const headR = s * 0.26;
        // Gentle head nod
        const nod = Math.sin(time * 0.5) * 0.06;
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(nod);

        // Outer petals — 22 bright golden yellow
        for (let i = 0; i < 22; i++) {
          const angle = (i / 22) * Math.PI * 2;
          const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * headR * 1.2, Math.sin(angle) * headR * 1.2);
          grad.addColorStop(0, '#ffaa00');
          grad.addColorStop(0.4, '#ffcc00');
          grad.addColorStop(1, '#ffee44');
          PlantRenderer._petal(ctx, 0, 0, headR * 1.15, headR * 0.24, angle, grad);
        }
        // Inner petal hints
        for (let i = 0; i < 11; i++) {
          const angle = (i / 11) * Math.PI * 2 + 0.15;
          PlantRenderer._petal(ctx, 0, 0, headR * 0.7, headR * 0.15, angle, '#eebb00');
        }
        // Dark brown center disc
        const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, headR * 0.55);
        centerGrad.addColorStop(0, '#4a2800');
        centerGrad.addColorStop(0.6, '#3a1e08');
        centerGrad.addColorStop(1, '#5a3818');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, headR * 0.55, 0, Math.PI * 2);
        ctx.fill();
        // Fibonacci spiral dots
        ctx.fillStyle = '#6a4820';
        for (let i = 0; i < 40; i++) {
          const a = i * 2.39996; // golden angle
          const r = Math.sqrt(i) * headR * 0.08;
          const dotR = 1.0 + i * 0.03;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        // Bright highlight on center
        ctx.fillStyle = 'rgba(255,200,80,0.15)';
        ctx.beginPath();
        ctx.arc(-headR * 0.1, -headR * 0.1, headR * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    },

    // === 2: Tulip Cluster ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.0) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seed: bulbs in soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.2, s * 0.05, 0, Math.PI, 0);
        ctx.fill();
        // Bulbs
        const bulbCount = Math.floor(PlantRenderer._lerp(1, 3, p));
        for (let i = 0; i < bulbCount; i++) {
          const dx = (i - 1) * s * 0.06;
          ctx.fillStyle = '#8a6a30';
          ctx.beginPath();
          ctx.ellipse(dx, -s * 0.02, s * 0.03, s * 0.04, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        // Sprout: green shoots poking up
        const count = Math.floor(PlantRenderer._lerp(2, 5, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - (count - 1) / 2) * s * 0.06;
          const h = PlantRenderer._lerp(0.05, 0.18, p) * s;
          const lean = (i - (count - 1) / 2) * 0.04;
          PlantRenderer._stem(ctx, dx, 0, dx + lean * s * 0.1, -h * 0.5, dx + lean * s * 0.15, -h, s * 0.03, '#44882a');
          // Tiny pointed leaf at tip
          if (p > 0.5) {
            ctx.fillStyle = '#55aa35';
            ctx.save();
            ctx.translate(dx + lean * s * 0.15, -h);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-s * 0.015, s * 0.03);
            ctx.lineTo(s * 0.015, s * 0.03);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      } else if (stage === 2) {
        // Young: taller stems with broad pointed leaves
        const tulipData = [
          { dx: -s * 0.1, lean: -0.03 },
          { dx: -s * 0.03, lean: -0.01 },
          { dx: s * 0.04, lean: 0.01 },
          { dx: s * 0.11, lean: 0.03 },
        ];
        const h = PlantRenderer._lerp(0.25, 0.45, p) * s;
        tulipData.forEach((td, i) => {
          const stemSway = Math.sin(time * 1.1 + i * 0.8) * 0.01;
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + (td.lean + stemSway) * s * 0.3, -h * 0.5, td.dx + (td.lean + stemSway) * s * 0.5, -h, s * 0.03, '#3a7a22');
          // Broad pointed leaves at base
          if (p > 0.3) {
            PlantRenderer._leaf(ctx, td.dx - s * 0.02, -h * 0.15, s * 0.07, s * 0.02, -0.3, '#44882a', null);
            PlantRenderer._leaf(ctx, td.dx + s * 0.02, -h * 0.2, s * 0.06, s * 0.018, 0.3, '#44882a', null);
          }
        });
      } else if (stage === 3) {
        // Mature: full stems with closed buds
        const tulipColors = ['#ff2244', '#ffdd00', '#ff69b4', '#9933cc', '#ff6600'];
        const tulipData = [
          { dx: -s * 0.12, lean: -0.03 },
          { dx: -s * 0.04, lean: -0.01 },
          { dx: s * 0.05, lean: 0.015 },
          { dx: s * 0.13, lean: 0.035 },
          { dx: s * 0.0, lean: 0.005 },
        ];
        const h = s * 0.55;
        tulipData.forEach((td, i) => {
          const stemSway = Math.sin(time * 0.9 + i * 0.7) * 0.015;
          const topX = td.dx + (td.lean + stemSway) * s * 0.5;
          const topY = -h + i * s * 0.02;
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + (td.lean + stemSway) * s * 0.3, topY * 0.5, topX, topY, s * 0.035, '#2d6818');
          // Leaves
          PlantRenderer._leaf(ctx, td.dx, -h * 0.12, s * 0.08, s * 0.022, -0.2 + td.lean * 3, '#3a8825', null);
          // Closed bud — oval shape
          const budH = PlantRenderer._lerp(0.03, 0.06, p) * s;
          ctx.fillStyle = tulipColors[i % tulipColors.length];
          ctx.beginPath();
          ctx.ellipse(topX, topY - budH * 0.5, budH * 0.4, budH, 0, 0, Math.PI * 2);
          ctx.fill();
          // Green sepal wrapping
          ctx.fillStyle = '#3a8825';
          ctx.beginPath();
          ctx.ellipse(topX, topY + budH * 0.2, budH * 0.35, budH * 0.3, 0, 0, Math.PI);
          ctx.fill();
        });
      } else {
        // Bloom: spectacular open tulips in bright colors
        const tulipColors = ['#ff2244', '#ffdd00', '#ff69b4', '#9933cc', '#ff6600'];
        const tulipHighlights = ['#ff6677', '#ffee66', '#ff99cc', '#bb66dd', '#ff9944'];
        const tulipData = [
          { dx: -s * 0.13, lean: -0.035, hOff: 0 },
          { dx: -s * 0.04, lean: -0.01, hOff: -0.02 },
          { dx: s * 0.05, lean: 0.015, hOff: 0.01 },
          { dx: s * 0.14, lean: 0.04, hOff: -0.01 },
          { dx: s * 0.01, lean: 0.005, hOff: -0.03 },
        ];
        const h = s * 0.65;
        tulipData.forEach((td, i) => {
          const stemSway = Math.sin(time * 0.8 + i * 0.9) * 0.018;
          const topX = td.dx + (td.lean + stemSway) * s * 0.55;
          const topY = -h + td.hOff * s;
          // Stem
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + (td.lean + stemSway) * s * 0.3, topY * 0.5, topX, topY + s * 0.04, s * 0.035, '#2d6818');
          // Broad leaves at base
          PlantRenderer._leaf(ctx, td.dx - s * 0.01, -h * 0.1, s * 0.09, s * 0.022, -0.25 + td.lean * 3, '#3a8825', null);
          PlantRenderer._leaf(ctx, td.dx + s * 0.02, -h * 0.18, s * 0.07, s * 0.018, 0.2 + td.lean * 3, '#44992e', null);
          // Open tulip cup — 6 petals
          const color = tulipColors[i % tulipColors.length];
          const highlight = tulipHighlights[i % tulipHighlights.length];
          const petalLen = s * 0.09;
          const petalW = s * 0.035;
          for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2 - Math.PI * 0.5;
            // Outer (slightly flared)
            const flareFactor = j < 3 ? 1.0 : 0.85;
            const grad = ctx.createLinearGradient(topX, topY, topX + Math.cos(angle) * petalLen, topY + Math.sin(angle) * petalLen);
            grad.addColorStop(0, color);
            grad.addColorStop(1, highlight);
            PlantRenderer._petal(ctx, topX, topY, petalLen * flareFactor, petalW, angle, grad);
          }
          // Inner glow center
          ctx.fillStyle = '#44aa22';
          ctx.beginPath();
          ctx.arc(topX, topY, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
          // Yellow stamen dots
          ctx.fillStyle = '#ffdd44';
          for (let j = 0; j < 3; j++) {
            const a = (j / 3) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(topX + Math.cos(a) * s * 0.01, topY + Math.sin(a) * s * 0.01, s * 0.006, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    },

    // === 3: Daisy Patch ===
    function(ctx, stage, p, s, time) {
      const sway = Math.sin(time * 1.1) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        // Seeds on soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.18, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
        const count = Math.floor(PlantRenderer._lerp(1, 4, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - 1.5) * s * 0.04;
          ctx.fillStyle = '#aaa888';
          ctx.beginPath();
          ctx.arc(dx, -s * 0.01, s * 0.012, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        // Tiny sprouts
        const count = Math.floor(PlantRenderer._lerp(2, 5, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - (count - 1) / 2) * s * 0.07;
          const h = PlantRenderer._lerp(0.05, 0.15, p) * s;
          PlantRenderer._stem(ctx, dx, 0, dx, -h * 0.5, dx, -h, s * 0.02, '#55aa35');
          if (p > 0.5) {
            const ls = s * 0.025;
            PlantRenderer._leaf(ctx, dx - s * 0.02, -h * 0.5, ls, ls * 0.5, -0.4, '#55aa35', null);
            PlantRenderer._leaf(ctx, dx + s * 0.02, -h * 0.45, ls, ls * 0.5, 0.4, '#55aa35', null);
          }
        }
      } else if (stage === 2) {
        // Young: thin stems with small leaves, starting to branch
        const daisyData = [
          { dx: -s * 0.1, lean: -0.02 },
          { dx: -s * 0.02, lean: 0.01 },
          { dx: s * 0.06, lean: 0.015 },
          { dx: s * 0.12, lean: 0.03 },
        ];
        const h = PlantRenderer._lerp(0.2, 0.38, p) * s;
        daisyData.forEach((dd, i) => {
          const stemSway = Math.sin(time * 1.2 + i * 0.9) * 0.01;
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, -h * 0.5, dd.dx + (dd.lean + stemSway) * s * 0.3, -h, s * 0.02, '#55aa35');
          // Small leaves
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.25, s * 0.04, s * 0.015, -0.3, '#55aa35', null);
        });
      } else if (stage === 3) {
        // Mature: buds forming at tips
        const daisyData = [
          { dx: -s * 0.12, lean: -0.025 },
          { dx: -s * 0.03, lean: 0.008 },
          { dx: s * 0.05, lean: 0.015 },
          { dx: s * 0.13, lean: 0.035 },
          { dx: s * 0.0, lean: -0.005 },
        ];
        const h = s * 0.45;
        daisyData.forEach((dd, i) => {
          const stemSway = Math.sin(time * 1.0 + i * 0.8) * 0.012;
          const topX = dd.dx + (dd.lean + stemSway) * s * 0.4;
          const topY = -h + i * s * 0.015;
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, topY * 0.5, topX, topY, s * 0.022, '#44993a');
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.2, s * 0.05, s * 0.018, -0.3 + dd.lean * 5, '#44993a', null);
          // Green bud with hint of white
          const budR = PlantRenderer._lerp(0.015, 0.03, p) * s;
          ctx.fillStyle = '#55aa44';
          ctx.beginPath();
          ctx.arc(topX, topY, budR, 0, Math.PI * 2);
          ctx.fill();
          if (p > 0.6) {
            ctx.fillStyle = '#eeeeee';
            ctx.beginPath();
            ctx.arc(topX, topY - budR * 0.5, budR * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else {
        // Bloom: cheerful white daisies with bright yellow centers
        const daisyData = [
          { dx: -s * 0.13, lean: -0.03, hOff: 0 },
          { dx: -s * 0.04, lean: 0.01, hOff: -0.02 },
          { dx: s * 0.06, lean: 0.018, hOff: 0.01 },
          { dx: s * 0.14, lean: 0.04, hOff: -0.01 },
          { dx: s * 0.01, lean: -0.005, hOff: -0.03 },
        ];
        const h = s * 0.5;
        daisyData.forEach((dd, i) => {
          const stemSway = Math.sin(time * 0.9 + i * 0.7) * 0.015;
          const topX = dd.dx + (dd.lean + stemSway) * s * 0.45;
          const topY = -h + dd.hOff * s;
          // Thin green stem
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, topY * 0.5, topX, topY + s * 0.03, s * 0.022, '#44993a');
          // Small leaves
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.15, s * 0.055, s * 0.018, -0.25 + dd.lean * 4, '#44993a', null);
          // Daisy flower: 14 white petals + yellow center
          const petalLen = s * 0.055;
          const petalW = s * 0.016;
          for (let j = 0; j < 14; j++) {
            const angle = (j / 14) * Math.PI * 2 + time * 0.05;
            const shade = j % 2 === 0 ? '#ffffff' : '#f0f0f0';
            PlantRenderer._petal(ctx, topX, topY, petalLen, petalW, angle, shade);
          }
          // Bright sunny yellow center
          const centerGrad = ctx.createRadialGradient(topX, topY, 0, topX, topY, s * 0.025);
          centerGrad.addColorStop(0, '#ffee00');
          centerGrad.addColorStop(0.7, '#ffcc00');
          centerGrad.addColorStop(1, '#eeaa00');
          ctx.fillStyle = centerGrad;
          ctx.beginPath();
          ctx.arc(topX, topY, s * 0.025, 0, Math.PI * 2);
          ctx.fill();
          // Tiny highlight
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(topX - s * 0.008, topY - s * 0.008, s * 0.01, 0, Math.PI * 2);
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
        ctx.arc(0, -s * 0.02, s * 0.018, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Thin grass-like shoots
        const count = Math.floor(PlantRenderer._lerp(2, 5, p));
        for (let i = 0; i < count; i++) {
          const dx = (i - count / 2 + 0.5) * s * 0.04;
          const h = PlantRenderer._lerp(0.08, 0.22, p) * s;
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
        // Multiple stems with narrow silvery-green leaves
        const stems = 6;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.38;
          const lean = (i - stems / 2 + 0.5) * 0.05;
          const stemSway = Math.sin(time * 1.2 + i * 0.5) * 0.02;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, dx + (lean + stemSway) * s * 0.4, -h);
          ctx.stroke();
          // Silvery-green narrow leaves
          if (p > 0.3) {
            const lx = dx + lean * s * 0.2;
            const ly = -h * 0.35;
            PlantRenderer._leaf(ctx, lx - s * 0.02, ly, s * 0.045, s * 0.01, -0.3 + lean, '#8aaa78', null);
            PlantRenderer._leaf(ctx, lx + s * 0.02, ly - s * 0.08, s * 0.045, s * 0.01, 0.3 + lean, '#8aaa78', null);
          }
        }
      } else if (stage === 3) {
        // Vivid purple bud clusters forming at tips
        const stems = 7;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.06;
          const h = s * 0.52;
          const lean = (i - stems / 2 + 0.5) * 0.045;
          const stemSway = Math.sin(time + i * 0.6) * 0.022;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.02;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.3, -h * 0.5, endX, endY);
          ctx.stroke();
          // Silvery leaves
          PlantRenderer._leaf(ctx, dx + lean * s * 0.1, -h * 0.2, s * 0.05, s * 0.012, lean * 2, '#8aaa78', null);
          // Purple buds — more vivid
          const budCount = Math.floor(PlantRenderer._lerp(3, 7, p));
          for (let b = 0; b < budCount; b++) {
            const bt = 0.55 + b * 0.065;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            ctx.fillStyle = b % 2 === 0 ? '#8833cc' : '#7722bb';
            ctx.beginPath();
            ctx.arc(bx, by, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Bloom: vivid purple flower spikes — spectacular!
        const stems = 8;
        for (let i = 0; i < stems; i++) {
          const dx = (i - stems / 2 + 0.5) * s * 0.065;
          const h = s * 0.62;
          const lean = (i - stems / 2 + 0.5) * 0.04;
          const stemSway = Math.sin(time * 0.8 + i * 0.7) * 0.025;
          const endX = dx + (lean + stemSway) * s * 0.5;
          const endY = -h;
          ctx.strokeStyle = '#6a8a50';
          ctx.lineWidth = s * 0.022;
          ctx.beginPath();
          ctx.moveTo(dx, 0);
          ctx.quadraticCurveTo(dx + (lean + stemSway) * s * 0.25, -h * 0.5, endX, endY);
          ctx.stroke();
          // Silvery-green narrow leaves
          const lx = dx + lean * s * 0.15;
          PlantRenderer._leaf(ctx, lx, -h * 0.18, s * 0.055, s * 0.013, -0.2 + lean, '#8aaa78', null);
          // Dense vivid purple flower spike — more flowers per stem
          for (let b = 0; b < 12; b++) {
            const bt = 0.4 + b * 0.05;
            const bx = dx + (lean + stemSway) * s * 0.5 * bt;
            const by = -h * bt;
            const flowerSize = s * 0.024;
            // Two-tone vivid purple
            const shade1 = b % 3 === 0 ? '#aa44ee' : b % 3 === 1 ? '#8822dd' : '#9933dd';
            const shade2 = b % 3 === 0 ? '#bb55ff' : b % 3 === 1 ? '#9933ee' : '#aa44ee';
            ctx.fillStyle = shade1;
            ctx.beginPath();
            ctx.arc(bx - flowerSize * 0.5, by, flowerSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = shade2;
            ctx.beginPath();
            ctx.arc(bx + flowerSize * 0.5, by, flowerSize * 0.85, 0, Math.PI * 2);
            ctx.fill();
            // Tiny bright center dot
            ctx.fillStyle = '#eeddff';
            ctx.beginPath();
            ctx.arc(bx, by, flowerSize * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 5: Rainbow Tree (rare) ===
    function(ctx, stage, p, s, time) {
      const rainbow = ['#ff2222', '#ff7722', '#ffdd22', '#22cc44', '#2288ff', '#8833dd'];

      if (stage === 0) {
        // Iridescent seed
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        const colorIdx = Math.floor(time * 2) % rainbow.length;
        ctx.fillStyle = rainbow[colorIdx];
        ctx.globalAlpha = 0.5 + pulse * 0.4;
        ctx.beginPath();
        ctx.arc(0, -s * 0.04, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Shimmer ring
        ctx.strokeStyle = rainbow[(colorIdx + 3) % rainbow.length];
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, -s * 0.04, s * 0.07, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Soil
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.04, 0, Math.PI, 0);
        ctx.fill();
      } else if (stage === 1) {
        // Crystalline sprout with color bands
        const h = PlantRenderer._lerp(0.12, 0.32, p) * s;
        const bandH = h / rainbow.length;
        for (let i = 0; i < rainbow.length; i++) {
          ctx.strokeStyle = rainbow[i];
          ctx.lineWidth = s * 0.05;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, -i * bandH);
          ctx.lineTo(0, -(i + 1) * bandH);
          ctx.stroke();
        }
        // Tiny sparkle at top
        if (p > 0.5) {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = Math.sin(time * 5) * 0.3 + 0.5;
          ctx.beginPath();
          ctx.arc(0, -h, s * 0.015, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else if (stage === 2) {
        // Trunk with shifting rainbow colors
        const h = PlantRenderer._lerp(0.3, 0.55, p) * s;
        for (let y = 0; y < h; y += 2) {
          const colorIdx = Math.floor((y / h) * rainbow.length + time * 0.5) % rainbow.length;
          ctx.strokeStyle = rainbow[colorIdx];
          ctx.lineWidth = s * 0.06 * (1 - y / h * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, -y);
          ctx.lineTo(0, -y - 2);
          ctx.stroke();
        }
        // Colorful leaf orbs
        if (p > 0.4) {
          rainbow.slice(0, 3).forEach((color, i) => {
            const angle = (i / 3) * Math.PI - Math.PI * 0.5;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * s * 0.1, -h + Math.sin(angle) * s * 0.05, s * 0.045, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      } else if (stage === 3) {
        // Canopy with spectral leaves forming
        const h = s * 0.72;
        // Trunk with shimmer
        ctx.fillStyle = '#886644';
        ctx.fillRect(-s * 0.045, 0, s * 0.09, -h * 0.6);
        // Color bands on trunk
        for (let i = 0; i < rainbow.length; i++) {
          const y = -h * 0.6 * (i / rainbow.length);
          ctx.fillStyle = rainbow[i];
          ctx.globalAlpha = 0.15;
          ctx.fillRect(-s * 0.045, y, s * 0.09, -h * 0.6 / rainbow.length);
        }
        ctx.globalAlpha = 1;
        // Forming canopy — bigger orbs
        const canopyR = PlantRenderer._lerp(0.12, 0.28, p) * s;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.3;
          const lx = Math.cos(angle) * canopyR * 0.65;
          const ly = -h + Math.sin(angle) * canopyR * 0.45;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.arc(lx, ly, canopyR * 0.42, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        // Bloom: spectacular full rainbow canopy with dramatic light rays
        const h = s * 0.88;
        // Trunk
        ctx.fillStyle = '#886644';
        ctx.beginPath();
        ctx.moveTo(-s * 0.05, 0);
        ctx.lineTo(-s * 0.035, -h * 0.55);
        ctx.lineTo(s * 0.035, -h * 0.55);
        ctx.lineTo(s * 0.05, 0);
        ctx.fill();
        // Color shimmer on trunk
        for (let i = 0; i < rainbow.length; i++) {
          const y = -h * 0.55 * (i / rainbow.length);
          ctx.fillStyle = rainbow[i];
          ctx.globalAlpha = 0.12;
          ctx.fillRect(-s * 0.05, y, s * 0.1, -h * 0.55 / rainbow.length);
        }
        ctx.globalAlpha = 1;

        // Light rays — bigger and more dramatic
        ctx.save();
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.2;
          const rayLen = s * 0.6;
          ctx.strokeStyle = rainbow[i % rainbow.length];
          ctx.lineWidth = s * 0.05;
          ctx.globalAlpha = 0.1 + Math.sin(time * 2 + i) * 0.04;
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.72);
          ctx.lineTo(Math.cos(angle) * rayLen, -h * 0.72 + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();

        // Rainbow canopy — bigger, more vivid
        const canopyR = s * 0.35;
        rainbow.forEach((color, i) => {
          const angle = (i / rainbow.length) * Math.PI * 2 + time * 0.15;
          const cx = Math.cos(angle) * canopyR * 0.55;
          const cy = -h * 0.75 + Math.sin(angle) * canopyR * 0.4;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canopyR * 0.55);
          grad.addColorStop(0, color);
          grad.addColorStop(0.7, color + 'aa');
          grad.addColorStop(1, color + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, canopyR * 0.55, 0, Math.PI * 2);
          ctx.fill();
        });

        // Sparkle particles
        for (let i = 0; i < 6; i++) {
          const phase = time * 3 + i * 1.7;
          if (Math.sin(phase) > 0.6) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            const sx = Math.sin(phase * 1.3) * canopyR * 0.5;
            const sy = -h * 0.75 + Math.cos(phase * 0.9) * canopyR * 0.3;
            ctx.beginPath();
            ctx.arc(sx, sy, s * 0.018, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // === 6: Firework Flower (rare) ===
    function(ctx, stage, p, s, time) {
      if (stage === 0) {
        // Glowing ember seed — bigger
        const glow = ctx.createRadialGradient(0, -s * 0.02, 0, 0, -s * 0.02, s * 0.1);
        const pulse = 0.35 + Math.sin(time * 4) * 0.12;
        glow.addColorStop(0, `rgba(255, 150, 50, ${pulse})`);
        glow.addColorStop(0.5, `rgba(255, 100, 30, ${pulse * 0.5})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6622';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.035, 0, Math.PI * 2);
        ctx.fill();
        // Hot spark
        ctx.fillStyle = '#ffee88';
        ctx.beginPath();
        ctx.arc(0, -s * 0.02, s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        // Bright orange-red shoot
        const h = PlantRenderer._lerp(0.1, 0.28, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.045, '#cc3311');
        // Heat shimmer
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Tip glow
        ctx.fillStyle = '#ff6622';
        ctx.beginPath();
        ctx.arc(0, -h, s * 0.02, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 2) {
        // Spiky stems, red-tipped leaves
        const h = PlantRenderer._lerp(0.25, 0.48, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.055, '#993320');
        const leafPositions = [
          { x: -s * 0.1, y: -h * 0.4, a: -0.8 },
          { x: s * 0.08, y: -h * 0.55, a: 0.7 },
          { x: -s * 0.06, y: -h * 0.7, a: -0.5 },
        ];
        leafPositions.forEach(lp => {
          ctx.save();
          ctx.translate(lp.x, lp.y);
          ctx.rotate(lp.a);
          ctx.fillStyle = '#4a7728';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(s * 0.09, -s * 0.02);
          ctx.lineTo(s * 0.11, s * 0.01);
          ctx.closePath();
          ctx.fill();
          // Bright red tip
          ctx.fillStyle = '#ee2211';
          ctx.beginPath();
          ctx.arc(s * 0.1, 0, s * 0.018, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (stage === 3) {
        // Tight bud cluster, pulsing glow — more dramatic
        const h = s * 0.58;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.85, s * 0.06, '#993320');
        PlantRenderer._leaf(ctx, -s * 0.12, -h * 0.35, s * 0.09, s * 0.035, -0.7, '#4a7728', null);
        PlantRenderer._leaf(ctx, s * 0.09, -h * 0.5, s * 0.08, s * 0.03, 0.6, '#4a7728', null);
        // Pulsing bud cluster
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        const budR = PlantRenderer._lerp(0.06, 0.12, p) * s;
        // Double-layer glow
        const budGlow = ctx.createRadialGradient(0, -h, 0, 0, -h, budR * 2.5);
        budGlow.addColorStop(0, `rgba(255, 120, 40, ${0.35 * pulse})`);
        budGlow.addColorStop(0.5, `rgba(255, 80, 20, ${0.15 * pulse})`);
        budGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = budGlow;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Buds
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.fillStyle = i % 2 === 0 ? '#ee4422' : '#ff6633';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * budR * 0.5, -h + Math.sin(a) * budR * 0.5, budR * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bloom: massive explosive starburst — spectacular!
        const h = s * 0.62;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h * 0.8, s * 0.065, '#993320');
        PlantRenderer._leaf(ctx, -s * 0.12, -h * 0.3, s * 0.09, s * 0.035, -0.7, '#4a7728', null);
        PlantRenderer._leaf(ctx, s * 0.1, -h * 0.5, s * 0.08, s * 0.03, 0.5, '#4a7728', null);

        const cx = 0;
        const cy = -h;
        const burstR = s * 0.38;

        // Big outer glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR * 1.8);
        const glowPulse = 0.22 + Math.sin(time * 2) * 0.06;
        glow.addColorStop(0, `rgba(255, 200, 100, ${glowPulse})`);
        glow.addColorStop(0.4, `rgba(255, 140, 50, ${glowPulse * 0.5})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Radiating petal lines — 16 rays, vivid colors
        const colors = ['#ff1111', '#ff4422', '#ff7733', '#ffaa44', '#ffdd66', '#ffffff'];
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + Math.sin(time) * 0.12;
          const colorIdx = Math.floor((i / rayCount) * colors.length);
          const len = burstR * (0.85 + Math.sin(time * 3 + i * 1.5) * 0.18);
          // Ray gradient
          const rayGrad = ctx.createLinearGradient(
            cx + Math.cos(angle) * burstR * 0.15, cy + Math.sin(angle) * burstR * 0.15,
            cx + Math.cos(angle) * len, cy + Math.sin(angle) * len
          );
          rayGrad.addColorStop(0, '#ffcc44');
          rayGrad.addColorStop(0.5, colors[colorIdx % colors.length]);
          rayGrad.addColorStop(1, '#ffffff');
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = s * 0.035;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * burstR * 0.15, cy + Math.sin(angle) * burstR * 0.15);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
          // Bright tip dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len, s * 0.02, 0, Math.PI * 2);
          ctx.fill();
          // Tiny secondary sparkle
          if (i % 2 === 0) {
            const sparkAngle = angle + 0.15;
            const sparkLen = len * 0.7;
            ctx.fillStyle = colors[(colorIdx + 1) % colors.length];
            ctx.beginPath();
            ctx.arc(cx + Math.cos(sparkAngle) * sparkLen, cy + Math.sin(sparkAngle) * sparkLen, s * 0.012, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Bright golden center
        const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR * 0.2);
        centerGrad.addColorStop(0, '#ffffff');
        centerGrad.addColorStop(0.3, '#ffee44');
        centerGrad.addColorStop(1, '#ffaa22');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, burstR * 0.2, 0, Math.PI * 2);
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
