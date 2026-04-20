// PlantRenderer - Detailed procedural drawing for 10 plant types across 5 growth stages
// Pure draw functions. No state, no logic.
// Each draw call assumes ctx is already translated to the plant's screen position.
// stage: 0=seed, 1=sprout, 2=young, 3=mature, 4=bloom
// progress: 0-1 interpolation within current stage
// scale: size multiplier from Camera (depth-based)
// time: Game.time for animations
// colorIndex: 0-9, selects which of 10 color variants to use

const PlantRenderer = {
  // Main dispatch: draws the correct plant at the correct stage
  draw(ctx, typeIndex, stage, progress, scale, time, colorIndex) {
    const s = 360 * scale; // base size unit — 3x bigger than before (was 120)
    ctx.save();

    // Shadow at base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * scale, s * 0.4, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    const ci = (colorIndex != null ? colorIndex : 0) % 10;
    const drawFn = this._types[typeIndex % this._types.length];
    if (drawFn) drawFn(ctx, stage, progress, s, time, ci);

    ctx.restore();
  },

  // Helper: draw a curved stem
  _stem(ctx, x1, y1, cx, cy, x2, y2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  },

  // Helper: draw a leaf (pointed oval)
  _leaf(ctx, x, y, w, h, angle, color, veinColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(-w * 0.3, -h, 0, -h * 0.2);
    ctx.quadraticCurveTo(w * 0.3, -h, w, 0);
    ctx.quadraticCurveTo(w * 0.3, h, 0, h * 0.2);
    ctx.quadraticCurveTo(-w * 0.3, h, -w, 0);
    ctx.fill();
    if (veinColor) {
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = Math.max(0.5, w * 0.05);
      ctx.beginPath();
      ctx.moveTo(-w * 0.8, 0);
      ctx.lineTo(w * 0.8, 0);
      ctx.stroke();
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const vx = i * w * 0.25;
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx + w * 0.15, i > 0 ? -h * 0.3 : h * 0.3);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  // Helper: draw a petal (teardrop)
  _petal(ctx, x, y, length, width, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(width * 1.2, -length * 0.35, width * 0.3, -length);
    ctx.quadraticCurveTo(0, -length * 1.05, -width * 0.3, -length);
    ctx.quadraticCurveTo(-width * 1.2, -length * 0.35, 0, 0);
    ctx.fill();
    ctx.restore();
  },

  // Helper: rounded petal (for roses, more cupped shape)
  _rosePetal(ctx, x, y, length, width, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(width * 1.4, -length * 0.2, width * 1.0, -length * 0.8, 0, -length);
    ctx.bezierCurveTo(-width * 1.0, -length * 0.8, -width * 1.4, -length * 0.2, 0, 0);
    ctx.fill();
    ctx.restore();
  },

  _lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); },

  // Common seed drawing
  _drawSeed(ctx, s, p, seedColor) {
    const mH = PlantRenderer._lerp(3, 8, p) * s / 120;
    ctx.fillStyle = '#5a4020';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.12, mH, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = seedColor || '#3a2510';
    ctx.beginPath();
    ctx.ellipse(0, -mH * 0.4, s * 0.025, s * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  // Common sprout drawing
  _drawSprout(ctx, s, p, stemColor) {
    const h = PlantRenderer._lerp(0.08, 0.22, p) * s;
    PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.018, stemColor || '#3d7520');
    if (p > 0.3) {
      const ls = PlantRenderer._lerp(0, s * 0.06, (p - 0.3) / 0.7);
      PlantRenderer._leaf(ctx, -s * 0.025, -h * 0.6, ls, ls * 0.4, -0.6, '#4a8a2e', '#2d5518');
      PlantRenderer._leaf(ctx, s * 0.025, -h * 0.55, ls, ls * 0.4, 0.6, '#4a8a2e', '#2d5518');
    }
  },

  _types: [
    // =====================================================
    // === 0: ROSE ===
    // Multi-layered cupped petals, classic rose shape
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { outer: '#cc1133', mid: '#ee2244', inner: '#880022', highlight: '#ff8899', dark: '#660011' },
        { outer: '#ff6699', mid: '#ff88bb', inner: '#cc4477', highlight: '#ffccdd', dark: '#993355' },
        { outer: '#f5f0e8', mid: '#ffffff', inner: '#e0d8cc', highlight: '#ffffff', dark: '#c8beb0' },
        { outer: '#ffcc22', mid: '#ffdd55', inner: '#ddaa00', highlight: '#ffee88', dark: '#bb8800' },
        { outer: '#ff6644', mid: '#ff8866', inner: '#dd4422', highlight: '#ffaa88', dark: '#bb3311' },
        { outer: '#990022', mid: '#bb0033', inner: '#660011', highlight: '#dd4466', dark: '#440008' },
        { outer: '#ff88bb', mid: '#ffaadd', inner: '#dd6699', highlight: '#ffddee', dark: '#bb4477' },
        { outer: '#ffaa44', mid: '#ffcc66', inner: '#dd8822', highlight: '#ffddaa', dark: '#bb6600' },
        { outer: '#dd55aa', mid: '#ff77cc', inner: '#bb3388', highlight: '#ffbbee', dark: '#993366' },
        { outer: '#eeddff', mid: '#ffffff', inner: '#ccbbdd', highlight: '#ffffff', dark: '#aa99bb' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 1.0) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#3a2510');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#3d7520');
      } else if (stage === 2) {
        const h = PlantRenderer._lerp(0.22, 0.38, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.5, 0, -h, s * 0.025, '#2d6018');
        const leafY = [-h * 0.25, -h * 0.45, -h * 0.65, -h * 0.8];
        const leafSide = [-1, 1, -1, 1];
        leafY.forEach(function(ly, i) {
          var ls = s * 0.06;
          var lx = leafSide[i] * s * 0.04;
          PlantRenderer._leaf(ctx, lx, ly, ls, ls * 0.35, leafSide[i] * -0.5, '#3a7a22', '#1e5510');
        });
        ctx.strokeStyle = '#2a5510';
        ctx.lineWidth = Math.max(1, s * 0.005);
        [[-s * 0.01, -h * 0.3], [s * 0.01, -h * 0.5]].forEach(function(t) {
          ctx.beginPath();
          ctx.moveTo(t[0], t[1]);
          ctx.lineTo(t[0] + s * 0.015, t[1] - s * 0.01);
          ctx.stroke();
        });
      } else if (stage === 3) {
        var h = s * 0.42;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.85, s * 0.028, '#2d6018');
        [[-s * 0.05, -h * 0.2, -0.5], [s * 0.04, -h * 0.35, 0.4], [-s * 0.03, -h * 0.55, -0.3]].forEach(function(d) {
          PlantRenderer._leaf(ctx, d[0], d[1], s * 0.065, s * 0.025, d[2], '#3a7a22', '#1e5510');
        });
        var budH = PlantRenderer._lerp(s * 0.02, s * 0.06, p);
        var budY = -h;
        ctx.fillStyle = '#3a7a22';
        for (var i = 0; i < 5; i++) {
          var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.save();
          ctx.translate(0, budY);
          ctx.rotate(a);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(budH * 0.3, -budH * 0.7);
          ctx.lineTo(-budH * 0.3, -budH * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = c.outer;
        ctx.beginPath();
        ctx.ellipse(0, budY - budH * 0.3, budH * 0.35, budH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var h = s * 0.48;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.75, s * 0.03, '#2d6018');
        [[-s * 0.06, -h * 0.15, -0.5], [s * 0.05, -h * 0.3, 0.45], [-s * 0.04, -h * 0.5, -0.35]].forEach(function(d) {
          PlantRenderer._leaf(ctx, d[0], d[1], s * 0.07, s * 0.025, d[2], '#3a7a22', '#1e5510');
        });
        var cx = 0, cy = -h;
        var roseR = s * 0.16;
        for (var i = 0; i < 10; i++) {
          var a = (i / 10) * Math.PI * 2 + time * 0.03;
          var grad = ctx.createLinearGradient(
            cx + Math.cos(a) * roseR * 0.1, cy + Math.sin(a) * roseR * 0.1,
            cx + Math.cos(a) * roseR, cy + Math.sin(a) * roseR
          );
          grad.addColorStop(0, c.inner);
          grad.addColorStop(0.4, c.outer);
          grad.addColorStop(1, c.highlight);
          PlantRenderer._rosePetal(ctx, cx, cy, roseR * 1.1, roseR * 0.48, a, grad);
        }
        for (var i = 0; i < 7; i++) {
          var a = (i / 7) * Math.PI * 2 + 0.3 + time * 0.03;
          PlantRenderer._rosePetal(ctx, cx, cy, roseR * 0.75, roseR * 0.38, a, c.mid);
        }
        for (var i = 0; i < 5; i++) {
          var a = (i / 5) * Math.PI * 2 + 0.6 + time * 0.03;
          PlantRenderer._rosePetal(ctx, cx, cy, roseR * 0.5, roseR * 0.3, a, c.inner);
        }
        for (var i = 0; i < 3; i++) {
          var a = (i / 3) * Math.PI * 2 + 1.0 + time * 0.03;
          PlantRenderer._rosePetal(ctx, cx, cy, roseR * 0.3, roseR * 0.2, a, c.dark);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(cx - roseR * 0.25, cy - roseR * 0.2, roseR * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // =====================================================
    // === 1: TULIP ===
    // Classic cup-shaped tulips in a small cluster
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { main: '#dd1133', light: '#ff4455', dark: '#990022' },
        { main: '#ffcc00', light: '#ffee44', dark: '#ddaa00' },
        { main: '#ff66aa', light: '#ff99cc', dark: '#cc3377' },
        { main: '#7733bb', light: '#9955dd', dark: '#551199' },
        { main: '#ff6622', light: '#ff8844', dark: '#dd4400' },
        { main: '#f0e8e0', light: '#ffffff', dark: '#d0c8b8' },
        { main: '#ff3366', light: '#ff6688', dark: '#cc1144' },
        { main: '#ee8844', light: '#ffaa66', dark: '#cc6622' },
        { main: '#44aacc', light: '#66ccee', dark: '#228899' },
        { main: '#aabb44', light: '#ccdd66', dark: '#889922' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.8) * 0.015;
      ctx.rotate(sway);

      if (stage === 0) {
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.12, s * 0.035, 0, Math.PI, 0);
        ctx.fill();
        var bc = Math.floor(PlantRenderer._lerp(1, 3, p));
        for (var i = 0; i < bc; i++) {
          var dx = (i - 1) * s * 0.035;
          ctx.fillStyle = '#8a6a30';
          ctx.beginPath();
          ctx.ellipse(dx, -s * 0.01, s * 0.018, s * 0.025, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        var count = Math.floor(PlantRenderer._lerp(2, 4, p));
        for (var i = 0; i < count; i++) {
          var dx = (i - (count - 1) / 2) * s * 0.04;
          var h = PlantRenderer._lerp(0.04, 0.12, p) * s;
          var lean = (i - (count - 1) / 2) * 0.03;
          PlantRenderer._stem(ctx, dx, 0, dx + lean * s * 0.1, -h * 0.5, dx + lean * s * 0.15, -h, s * 0.015, '#44882a');
        }
      } else if (stage === 2) {
        var tulipData = [
          { dx: -s * 0.05, lean: -0.02 },
          { dx: s * 0.0, lean: 0.005 },
          { dx: s * 0.05, lean: 0.02 },
        ];
        var h = PlantRenderer._lerp(0.15, 0.3, p) * s;
        tulipData.forEach(function(td) {
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + td.lean * s * 0.3, -h * 0.5, td.dx + td.lean * s * 0.5, -h, s * 0.018, '#3a7a22');
          if (p > 0.3) {
            PlantRenderer._leaf(ctx, td.dx, -h * 0.15, s * 0.04, s * 0.012, -0.3 + td.lean * 5, '#44882a', null);
          }
        });
      } else if (stage === 3) {
        var tulipData = [
          { dx: -s * 0.06, lean: -0.025 },
          { dx: -s * 0.01, lean: 0.005 },
          { dx: s * 0.04, lean: 0.02 },
          { dx: s * 0.07, lean: 0.03 },
        ];
        var h = s * 0.36;
        tulipData.forEach(function(td, i) {
          var stemSway = Math.sin(time * 0.9 + i * 0.7) * 0.008;
          var topX = td.dx + (td.lean + stemSway) * s * 0.5;
          var topY = -h + i * s * 0.01;
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + (td.lean + stemSway) * s * 0.3, topY * 0.5, topX, topY, s * 0.018, '#2d6818');
          PlantRenderer._leaf(ctx, td.dx, -h * 0.1, s * 0.04, s * 0.012, td.lean * 6, '#3a8825', null);
          var budH = PlantRenderer._lerp(s * 0.015, s * 0.04, p);
          ctx.fillStyle = c.main;
          ctx.beginPath();
          ctx.ellipse(topX, topY - budH * 0.4, budH * 0.35, budH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#3a8825';
          ctx.beginPath();
          ctx.ellipse(topX, topY + budH * 0.15, budH * 0.3, budH * 0.25, 0, 0, Math.PI);
          ctx.fill();
        });
      } else {
        var tulipData = [
          { dx: -s * 0.07, lean: -0.028, hOff: 0 },
          { dx: -s * 0.015, lean: 0.005, hOff: -0.015 },
          { dx: s * 0.04, lean: 0.02, hOff: 0.008 },
          { dx: s * 0.08, lean: 0.032, hOff: -0.008 },
        ];
        var h = s * 0.42;
        tulipData.forEach(function(td, i) {
          var stemSway = Math.sin(time * 0.7 + i * 0.9) * 0.01;
          var topX = td.dx + (td.lean + stemSway) * s * 0.55;
          var topY = -h + td.hOff * s;
          PlantRenderer._stem(ctx, td.dx, 0, td.dx + (td.lean + stemSway) * s * 0.3, topY * 0.5, topX, topY + s * 0.025, s * 0.018, '#2d6818');
          PlantRenderer._leaf(ctx, td.dx, -h * 0.08, s * 0.05, s * 0.013, -0.2 + td.lean * 5, '#3a8825', null);
          var petalLen = s * 0.065;
          var petalW = s * 0.03;
          for (var j = 0; j < 3; j++) {
            var a = (j / 3) * Math.PI * 2 - Math.PI * 0.5;
            var grad = ctx.createLinearGradient(topX, topY, topX + Math.cos(a) * petalLen, topY + Math.sin(a) * petalLen);
            grad.addColorStop(0, c.dark);
            grad.addColorStop(0.3, c.main);
            grad.addColorStop(1, c.light);
            PlantRenderer._petal(ctx, topX, topY, petalLen * 1.1, petalW * 1.15, a, grad);
          }
          for (var j = 0; j < 3; j++) {
            var a = (j / 3) * Math.PI * 2 - Math.PI * 0.5 + Math.PI / 3;
            PlantRenderer._petal(ctx, topX, topY, petalLen * 0.95, petalW, a, c.main);
          }
          ctx.fillStyle = '#44aa22';
          ctx.beginPath();
          ctx.arc(topX, topY, s * 0.008, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffee44';
          for (var j = 0; j < 3; j++) {
            var a = (j / 3) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(topX + Math.cos(a) * s * 0.006, topY + Math.sin(a) * s * 0.006, s * 0.004, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    },

    // =====================================================
    // === 2: LILY ===
    // Elegant trumpet-shaped flowers with recurved petals and spotted throats
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { petal: '#ffffff', inner: '#ffe8cc', spots: '#884422', stamen: '#ff8800' },
        { petal: '#ff8866', inner: '#ffaa88', spots: '#aa3311', stamen: '#ffcc44' },
        { petal: '#ffccaa', inner: '#ffddcc', spots: '#996633', stamen: '#ff9944' },
        { petal: '#ff55aa', inner: '#ff88cc', spots: '#aa2266', stamen: '#ffdd44' },
        { petal: '#eedd44', inner: '#ffee88', spots: '#998822', stamen: '#ff8800' },
        { petal: '#dd88cc', inner: '#eeaadd', spots: '#884466', stamen: '#ffcc66' },
        { petal: '#ffaa88', inner: '#ffccaa', spots: '#885533', stamen: '#ffdd44' },
        { petal: '#cc99ff', inner: '#ddbbff', spots: '#6644aa', stamen: '#ffcc44' },
        { petal: '#88ddaa', inner: '#aaeebb', spots: '#448855', stamen: '#ffee44' },
        { petal: '#ff6666', inner: '#ff9988', spots: '#993322', stamen: '#ffcc44' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.7) * 0.018;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#8a6a30');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#3a7a22');
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.2, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.003, -h * 0.5, 0, -h, s * 0.022, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.04, -h * 0.2, s * 0.07, s * 0.018, -0.3, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.03, -h * 0.4, s * 0.06, s * 0.015, 0.35, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, -s * 0.03, -h * 0.6, s * 0.055, s * 0.014, -0.25, '#44992e', null);
      } else if (stage === 3) {
        var h = s * 0.42;
        PlantRenderer._stem(ctx, 0, 0, s * 0.003, -h * 0.4, 0, -h * 0.85, s * 0.025, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.15, s * 0.07, s * 0.018, -0.3, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.3, s * 0.06, s * 0.015, 0.35, '#3a8828', null);
        // Elongated buds
        var budH = PlantRenderer._lerp(s * 0.03, s * 0.07, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.ellipse(0, -h, budH * 0.25, budH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.petal;
        ctx.globalAlpha = p * 0.5;
        ctx.beginPath();
        ctx.ellipse(0, -h - budH * 0.3, budH * 0.18, budH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // BLOOM: Trumpet lily with recurved petals
        var h = s * 0.48;
        PlantRenderer._stem(ctx, 0, 0, s * 0.003, -h * 0.4, 0, -h * 0.72, s * 0.028, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.12, s * 0.08, s * 0.02, -0.3, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.28, s * 0.07, s * 0.018, 0.35, '#3a8828', null);

        var fx = 0, fy = -h;
        var petalLen = s * 0.14;
        var petalW = s * 0.04;

        // 6 recurved petals (3 outer slightly longer, 3 inner)
        for (var i = 0; i < 3; i++) {
          var a = (i / 3) * Math.PI * 2 - Math.PI * 0.5 + time * 0.02;
          var grad = ctx.createLinearGradient(fx, fy, fx + Math.cos(a) * petalLen, fy + Math.sin(a) * petalLen);
          grad.addColorStop(0, c.inner);
          grad.addColorStop(0.5, c.petal);
          grad.addColorStop(1, c.petal);
          PlantRenderer._petal(ctx, fx, fy, petalLen * 1.15, petalW * 1.1, a, grad);
        }
        for (var i = 0; i < 3; i++) {
          var a = (i / 3) * Math.PI * 2 - Math.PI * 0.5 + Math.PI / 3 + time * 0.02;
          PlantRenderer._petal(ctx, fx, fy, petalLen, petalW, a, c.petal);
        }
        // Spots near center
        ctx.fillStyle = c.spots;
        for (var i = 0; i < 8; i++) {
          var a = (i / 8) * Math.PI * 2;
          var r = petalLen * 0.25;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * r, fy + Math.sin(a) * r, s * 0.005, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Long stamens
        ctx.strokeStyle = '#55aa33';
        ctx.lineWidth = s * 0.005;
        for (var i = 0; i < 6; i++) {
          var a = (i / 6) * Math.PI * 2;
          var stLen = petalLen * 0.6;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + Math.cos(a) * stLen, fy + Math.sin(a) * stLen);
          ctx.stroke();
          // Anther tip
          ctx.fillStyle = c.stamen;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * stLen, fy + Math.sin(a) * stLen, s * 0.007, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#55aa33';
        ctx.beginPath();
        ctx.arc(fx, fy, s * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // =====================================================
    // === 3: ORCHID ===
    // Exotic orchid with labellum (lip) and lateral petals on arching stem
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { petal: '#cc44cc', lip: '#ff66dd', spots: '#881188', center: '#ffee44' },
        { petal: '#ffffff', lip: '#ffccee', spots: '#cc88aa', center: '#ffee44' },
        { petal: '#ff88dd', lip: '#ffaaee', spots: '#aa4488', center: '#ffdd44' },
        { petal: '#8855cc', lip: '#aa77ee', spots: '#553399', center: '#ffee44' },
        { petal: '#ffaa55', lip: '#ffcc88', spots: '#aa6622', center: '#ffee44' },
        { petal: '#44bbaa', lip: '#66ddcc', spots: '#228877', center: '#ffee44' },
        { petal: '#ff66aa', lip: '#ff99cc', spots: '#cc3377', center: '#ffdd44' },
        { petal: '#ddaaff', lip: '#eeccff', spots: '#9966cc', center: '#ffee44' },
        { petal: '#ff4466', lip: '#ff7799', spots: '#cc1144', center: '#ffee44' },
        { petal: '#88ccff', lip: '#aaddff', spots: '#4488cc', center: '#ffee44' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.6) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#5a4a30');
      } else if (stage === 1) {
        // Thick fleshy leaves from base
        var h = PlantRenderer._lerp(0.06, 0.15, p) * s;
        var count = Math.floor(PlantRenderer._lerp(1, 3, p));
        for (var i = 0; i < count; i++) {
          var angle = (i - (count - 1) / 2) * 0.4;
          PlantRenderer._leaf(ctx, 0, 0, s * 0.08, s * 0.025, angle - Math.PI / 2, '#3a8828', '#1e5510');
        }
      } else if (stage === 2) {
        // Thick leaves + arching stem beginning
        var h = PlantRenderer._lerp(0.15, 0.3, p) * s;
        PlantRenderer._leaf(ctx, -s * 0.02, 0, s * 0.1, s * 0.03, -1.2, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.02, 0, s * 0.1, s * 0.03, -1.9, '#3a8828', '#1e5510');
        // Arching stem
        PlantRenderer._stem(ctx, 0, 0, s * 0.04, -h * 0.6, s * 0.06, -h, s * 0.015, '#5a8a40');
      } else if (stage === 3) {
        var h = s * 0.4;
        PlantRenderer._leaf(ctx, -s * 0.02, 0, s * 0.1, s * 0.03, -1.2, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.02, 0, s * 0.1, s * 0.03, -1.9, '#3a8828', '#1e5510');
        PlantRenderer._stem(ctx, 0, 0, s * 0.05, -h * 0.5, s * 0.07, -h * 0.85, s * 0.015, '#5a8a40');
        // Small buds along stem
        var budCount = Math.floor(PlantRenderer._lerp(1, 3, p));
        for (var i = 0; i < budCount; i++) {
          var t = 0.6 + i * 0.15;
          var bx = s * 0.07 * t;
          var by = -h * 0.85 * t;
          ctx.fillStyle = c.petal;
          ctx.beginPath();
          ctx.ellipse(bx, by, s * 0.012, s * 0.018, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // BLOOM: 2-3 orchid flowers on arching stem
        var h = s * 0.48;
        PlantRenderer._leaf(ctx, -s * 0.03, 0, s * 0.11, s * 0.032, -1.2, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.03, 0, s * 0.11, s * 0.032, -1.9, '#3a8828', null);
        // Arching stem
        PlantRenderer._stem(ctx, 0, 0, s * 0.06, -h * 0.5, s * 0.08, -h * 0.8, s * 0.018, '#5a8a40');

        // Draw 2 orchid blooms
        var blooms = [
          { bx: s * 0.06, by: -h * 0.65 },
          { bx: s * 0.08, by: -h * 0.85 },
        ];
        blooms.forEach(function(bl) {
          var bx = bl.bx, by = bl.by;
          var petalLen = s * 0.06;
          var petalW = s * 0.025;
          // 3 sepals (outer, narrow)
          for (var i = 0; i < 3; i++) {
            var a = (i / 3) * Math.PI * 2 - Math.PI * 0.5;
            PlantRenderer._petal(ctx, bx, by, petalLen * 1.1, petalW * 0.7, a, c.petal);
          }
          // 2 lateral petals (wider)
          for (var i = 0; i < 2; i++) {
            var a = (i === 0 ? -0.8 : 0.8) - Math.PI * 0.5;
            PlantRenderer._petal(ctx, bx, by, petalLen * 0.9, petalW * 1.2, a, c.petal);
          }
          // Labellum (lip) — bottom, wider and ruffled
          ctx.save();
          ctx.translate(bx, by);
          ctx.fillStyle = c.lip;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(petalW * 1.5, petalLen * 0.2, petalW * 1.8, petalLen * 0.6, 0, petalLen * 0.9);
          ctx.bezierCurveTo(-petalW * 1.8, petalLen * 0.6, -petalW * 1.5, petalLen * 0.2, 0, 0);
          ctx.fill();
          // Spots on lip
          ctx.fillStyle = c.spots;
          ctx.globalAlpha = 0.5;
          for (var i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc((i - 1.5) * petalW * 0.4, petalLen * 0.3, s * 0.004, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.restore();
          // Column (center)
          ctx.fillStyle = c.center;
          ctx.beginPath();
          ctx.arc(bx, by, s * 0.008, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // =====================================================
    // === 4: DAFFODIL ===
    // Star petals with trumpet corona in center
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { petal: '#ffdd00', corona: '#ffaa00', coronaEdge: '#ff8800' },
        { petal: '#ffffff', corona: '#ffdd44', coronaEdge: '#ffcc00' },
        { petal: '#ffaa22', corona: '#ff7700', coronaEdge: '#ee5500' },
        { petal: '#ffee88', corona: '#ffcc44', coronaEdge: '#ffaa00' },
        { petal: '#ff8844', corona: '#ff6622', coronaEdge: '#ee4400' },
        { petal: '#eeff44', corona: '#ccdd22', coronaEdge: '#aacc00' },
        { petal: '#ffcc55', corona: '#ffaa33', coronaEdge: '#ff8811' },
        { petal: '#ddff88', corona: '#bbee44', coronaEdge: '#99cc22' },
        { petal: '#ffbb66', corona: '#ff9944', coronaEdge: '#ff7722' },
        { petal: '#ffffaa', corona: '#ffee66', coronaEdge: '#ffdd44' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.9) * 0.015;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#8a6a30');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#44882a');
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.18, 0.32, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.02, '#44882a');
        PlantRenderer._leaf(ctx, -s * 0.01, -h * 0.1, s * 0.08, s * 0.012, -0.15, '#44992e', null);
        PlantRenderer._leaf(ctx, s * 0.01, -h * 0.15, s * 0.07, s * 0.011, 0.15, '#44992e', null);
      } else if (stage === 3) {
        var h = s * 0.4;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, s * 0.005, -h * 0.85, s * 0.022, '#44882a');
        PlantRenderer._leaf(ctx, -s * 0.01, -h * 0.08, s * 0.08, s * 0.012, -0.15, '#44992e', null);
        PlantRenderer._leaf(ctx, s * 0.01, -h * 0.15, s * 0.07, s * 0.011, 0.15, '#44992e', null);
        // Nodding bud
        var budY = -h;
        var budH = PlantRenderer._lerp(s * 0.02, s * 0.05, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.ellipse(0, budY, budH * 0.3, budH * 0.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.petal;
        ctx.globalAlpha = p * 0.6;
        ctx.beginPath();
        ctx.ellipse(0, budY - budH * 0.2, budH * 0.2, budH * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // BLOOM: 6 star-shaped petals + central trumpet
        var h = s * 0.46;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, s * 0.005, -h * 0.72, s * 0.025, '#44882a');
        PlantRenderer._leaf(ctx, -s * 0.01, -h * 0.06, s * 0.09, s * 0.013, -0.15, '#44992e', null);
        PlantRenderer._leaf(ctx, s * 0.01, -h * 0.12, s * 0.08, s * 0.012, 0.15, '#44992e', null);

        var fx = 0, fy = -h;
        var petalLen = s * 0.1;
        var petalW = s * 0.028;

        // 6 pointed petals
        for (var i = 0; i < 6; i++) {
          var a = (i / 6) * Math.PI * 2 - Math.PI * 0.5 + time * 0.02;
          PlantRenderer._petal(ctx, fx, fy, petalLen, petalW, a, c.petal);
        }
        // Trumpet corona (circle with ruffled edge)
        var coronaR = s * 0.04;
        ctx.strokeStyle = c.coronaEdge;
        ctx.lineWidth = s * 0.008;
        ctx.beginPath();
        ctx.arc(fx, fy, coronaR, 0, Math.PI * 2);
        ctx.stroke();
        var cGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, coronaR);
        cGrad.addColorStop(0, c.coronaEdge);
        cGrad.addColorStop(0.5, c.corona);
        cGrad.addColorStop(1, c.corona);
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, coronaR, 0, Math.PI * 2);
        ctx.fill();
        // Ruffled edge effect
        ctx.strokeStyle = c.coronaEdge;
        ctx.lineWidth = s * 0.004;
        for (var i = 0; i < 12; i++) {
          var a = (i / 12) * Math.PI * 2;
          var r1 = coronaR * 0.9;
          var r2 = coronaR * 1.08;
          ctx.beginPath();
          ctx.moveTo(fx + Math.cos(a) * r1, fy + Math.sin(a) * r1);
          ctx.lineTo(fx + Math.cos(a) * r2, fy + Math.sin(a) * r2);
          ctx.stroke();
        }
        // Stamen
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(fx, fy, s * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // =====================================================
    // === 5: DAHLIA ===
    // Dense ball of many layered petals radiating from center
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { outer: '#dd2255', mid: '#ee4477', inner: '#ff6699', highlight: '#ffaacc' },
        { outer: '#ff8844', mid: '#ffaa66', inner: '#ffcc88', highlight: '#ffddaa' },
        { outer: '#ffcc22', mid: '#ffdd44', inner: '#ffee66', highlight: '#ffff88' },
        { outer: '#cc44aa', mid: '#dd66cc', inner: '#ee88dd', highlight: '#ffaaee' },
        { outer: '#ff4466', mid: '#ff6688', inner: '#ff88aa', highlight: '#ffaacc' },
        { outer: '#ee6688', mid: '#ff88aa', inner: '#ffaacc', highlight: '#ffccdd' },
        { outer: '#aa3388', mid: '#cc55aa', inner: '#dd77cc', highlight: '#ee99dd' },
        { outer: '#ff6622', mid: '#ff8844', inner: '#ffaa66', highlight: '#ffcc88' },
        { outer: '#dd66cc', mid: '#ee88dd', inner: '#ffaaee', highlight: '#ffccff' },
        { outer: '#ffaadd', mid: '#ffccee', inner: '#ffddff', highlight: '#ffffff' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.7) * 0.018;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#5a3a20');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#3a7a22');
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.2, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.5, 0, -h, s * 0.025, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.2, s * 0.07, s * 0.025, -0.5, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.35, s * 0.065, s * 0.022, 0.4, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, -s * 0.03, -h * 0.55, s * 0.05, s * 0.018, -0.3, '#44992e', null);
      } else if (stage === 3) {
        var h = s * 0.42;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.85, s * 0.028, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.15, s * 0.07, s * 0.025, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.3, s * 0.065, s * 0.022, 0.4, '#3a8828', null);
        // Round bud forming
        var budR = PlantRenderer._lerp(s * 0.02, s * 0.07, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.outer;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // BLOOM: Dense ball of many petals
        var h = s * 0.48;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.75, s * 0.03, '#3a7a22');
        PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.12, s * 0.08, s * 0.025, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.05, -h * 0.28, s * 0.07, s * 0.022, 0.4, '#3a8828', null);

        var cx = 0, cy = -h;
        var dahliaR = s * 0.15;

        // Outer ring: 14 petals
        for (var i = 0; i < 14; i++) {
          var a = (i / 14) * Math.PI * 2 + time * 0.02;
          PlantRenderer._petal(ctx, cx, cy, dahliaR * 1.0, dahliaR * 0.15, a, c.outer);
        }
        // Middle ring: 12 petals
        for (var i = 0; i < 12; i++) {
          var a = (i / 12) * Math.PI * 2 + 0.15 + time * 0.02;
          PlantRenderer._petal(ctx, cx, cy, dahliaR * 0.75, dahliaR * 0.14, a, c.mid);
        }
        // Inner ring: 10 petals
        for (var i = 0; i < 10; i++) {
          var a = (i / 10) * Math.PI * 2 + 0.3 + time * 0.02;
          PlantRenderer._petal(ctx, cx, cy, dahliaR * 0.5, dahliaR * 0.13, a, c.inner);
        }
        // Center ring: 7 tiny petals
        for (var i = 0; i < 7; i++) {
          var a = (i / 7) * Math.PI * 2 + 0.5 + time * 0.02;
          PlantRenderer._petal(ctx, cx, cy, dahliaR * 0.3, dahliaR * 0.1, a, c.highlight);
        }
        // Tight center
        ctx.fillStyle = c.inner;
        ctx.beginPath();
        ctx.arc(cx, cy, dahliaR * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // =====================================================
    // === 6: HYDRANGEA ===
    // Big round cluster of many tiny 4-petal florets
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { main: '#6688cc', light: '#88aaee', dark: '#4466aa' },
        { main: '#cc6699', light: '#ee88bb', dark: '#aa4477' },
        { main: '#88bbdd', light: '#aaddff', dark: '#6699bb' },
        { main: '#aa88cc', light: '#ccaaee', dark: '#8866aa' },
        { main: '#ddaacc', light: '#ffccee', dark: '#bb88aa' },
        { main: '#5599bb', light: '#77bbdd', dark: '#337799' },
        { main: '#7766aa', light: '#9988cc', dark: '#554488' },
        { main: '#99ccdd', light: '#bbeeff', dark: '#77aabb' },
        { main: '#bb88bb', light: '#ddaadd', dark: '#996699' },
        { main: '#aaddee', light: '#ccffff', dark: '#88bbcc' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.5) * 0.012;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#3a2a18');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#3a7a22');
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.18, 0.3, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.5, 0, -h, s * 0.025, '#4a6a30');
        // Broad opposite leaves
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.25, s * 0.08, s * 0.04, -0.5, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.05, -h * 0.25, s * 0.08, s * 0.04, 0.5, '#3a8828', '#1e5510');
        if (p > 0.5) {
          PlantRenderer._leaf(ctx, -s * 0.04, -h * 0.5, s * 0.06, s * 0.03, -0.4, '#44992e', null);
          PlantRenderer._leaf(ctx, s * 0.04, -h * 0.5, s * 0.06, s * 0.03, 0.4, '#44992e', null);
        }
      } else if (stage === 3) {
        var h = s * 0.38;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.75, s * 0.028, '#4a6a30');
        PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.2, s * 0.09, s * 0.04, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.06, -h * 0.2, s * 0.09, s * 0.04, 0.5, '#3a8828', null);
        // Cluster bud forming
        var budR = PlantRenderer._lerp(s * 0.04, s * 0.1, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.arc(0, -h, budR, 0, Math.PI * 2);
        ctx.fill();
        // Tiny color hints
        ctx.fillStyle = c.main;
        ctx.globalAlpha = p * 0.5;
        for (var i = 0; i < 5; i++) {
          var a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * budR * 0.5, -h + Math.sin(a) * budR * 0.4, budR * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        // BLOOM: Big mophead cluster of 4-petal florets
        var h = s * 0.44;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.7, s * 0.03, '#4a6a30');
        PlantRenderer._leaf(ctx, -s * 0.07, -h * 0.15, s * 0.1, s * 0.045, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.07, -h * 0.15, s * 0.1, s * 0.045, 0.5, '#3a8828', null);

        var cx = 0, cy = -h;
        var clusterR = s * 0.16;

        // Fill cluster area with tiny 4-petal florets
        for (var ring = 0; ring < 4; ring++) {
          var ringR = clusterR * (0.15 + ring * 0.28);
          var count = ring === 0 ? 3 : ring * 6;
          for (var i = 0; i < count; i++) {
            var a = (i / count) * Math.PI * 2 + ring * 0.3 + time * 0.015;
            var fx = cx + Math.cos(a) * ringR;
            var fy = cy + Math.sin(a) * ringR * 0.85; // slightly squished vertically
            var fSize = s * 0.018;
            // Determine shade
            var shade = (i + ring) % 3 === 0 ? c.light : (i + ring) % 3 === 1 ? c.main : c.dark;
            // 4 tiny petals
            for (var j = 0; j < 4; j++) {
              var pa = (j / 4) * Math.PI * 2;
              ctx.fillStyle = shade;
              ctx.beginPath();
              ctx.ellipse(fx + Math.cos(pa) * fSize * 0.5, fy + Math.sin(pa) * fSize * 0.5, fSize * 0.5, fSize * 0.3, pa, 0, Math.PI * 2);
              ctx.fill();
            }
            // Tiny center
            ctx.fillStyle = '#eeff88';
            ctx.beginPath();
            ctx.arc(fx, fy, fSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    },

    // =====================================================
    // === 7: PEONY ===
    // Lush, ruffled, densely layered bloom (like rose but more open and ruffled)
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { outer: '#ff88aa', mid: '#ffaacc', inner: '#ffccdd', dark: '#dd6688' },
        { outer: '#ffccdd', mid: '#ffddee', inner: '#ffffff', dark: '#eeaacc' },
        { outer: '#ff5577', mid: '#ff7799', inner: '#ff99bb', dark: '#dd3355' },
        { outer: '#ee99bb', mid: '#ffbbdd', inner: '#ffddee', dark: '#cc7799' },
        { outer: '#ffaacc', mid: '#ffccee', inner: '#ffddff', dark: '#ee88aa' },
        { outer: '#dd6688', mid: '#ee88aa', inner: '#ffaacc', dark: '#cc4466' },
        { outer: '#ff77aa', mid: '#ff99cc', inner: '#ffbbdd', dark: '#ee5588' },
        { outer: '#ffddee', mid: '#ffeeff', inner: '#ffffff', dark: '#eeccdd' },
        { outer: '#cc5588', mid: '#dd77aa', inner: '#ee99cc', dark: '#aa3366' },
        { outer: '#ffbbcc', mid: '#ffddee', inner: '#ffffff', dark: '#ee99aa' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.6) * 0.02;
      ctx.rotate(sway);

      if (stage === 0) {
        PlantRenderer._drawSeed(ctx, s, p, '#5a3a20');
      } else if (stage === 1) {
        PlantRenderer._drawSprout(ctx, s, p, '#3a7a22');
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.2, 0.35, p) * s;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.5, 0, -h, s * 0.025, '#3a6a22');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.2, s * 0.08, s * 0.03, -0.5, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.35, s * 0.07, s * 0.025, 0.45, '#3a8828', '#1e5510');
        PlantRenderer._leaf(ctx, -s * 0.03, -h * 0.55, s * 0.06, s * 0.02, -0.3, '#44992e', null);
      } else if (stage === 3) {
        var h = s * 0.42;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.85, s * 0.028, '#3a6a22');
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.15, s * 0.08, s * 0.03, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.04, -h * 0.3, s * 0.07, s * 0.025, 0.45, '#3a8828', null);
        // Round tight bud
        var budR = PlantRenderer._lerp(s * 0.03, s * 0.08, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.9, Math.PI * 0.2, Math.PI * 0.8);
        ctx.fill();
        ctx.fillStyle = c.outer;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.arc(0, -h, budR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // BLOOM: Lush ruffled peony
        var h = s * 0.48;
        PlantRenderer._stem(ctx, 0, 0, s * 0.005, -h * 0.4, 0, -h * 0.73, s * 0.03, '#3a6a22');
        PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.1, s * 0.09, s * 0.03, -0.5, '#3a8828', null);
        PlantRenderer._leaf(ctx, s * 0.05, -h * 0.25, s * 0.08, s * 0.025, 0.45, '#3a8828', null);

        var cx = 0, cy = -h;
        var peonyR = s * 0.17;

        // Outer ruffled petals: 12 wide petals
        for (var i = 0; i < 12; i++) {
          var a = (i / 12) * Math.PI * 2 + time * 0.02;
          PlantRenderer._rosePetal(ctx, cx, cy, peonyR * 1.05, peonyR * 0.45, a, c.outer);
        }
        // Middle: 10 petals
        for (var i = 0; i < 10; i++) {
          var a = (i / 10) * Math.PI * 2 + 0.2 + time * 0.02;
          PlantRenderer._rosePetal(ctx, cx, cy, peonyR * 0.78, peonyR * 0.4, a, c.mid);
        }
        // Inner: 8 petals
        for (var i = 0; i < 8; i++) {
          var a = (i / 8) * Math.PI * 2 + 0.4 + time * 0.02;
          PlantRenderer._rosePetal(ctx, cx, cy, peonyR * 0.55, peonyR * 0.35, a, c.inner);
        }
        // Center tuft: 5 tiny petals
        for (var i = 0; i < 5; i++) {
          var a = (i / 5) * Math.PI * 2 + 0.7 + time * 0.02;
          PlantRenderer._rosePetal(ctx, cx, cy, peonyR * 0.3, peonyR * 0.2, a, c.inner);
        }
        // Golden stamen center
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(cx, cy, peonyR * 0.06, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(cx - peonyR * 0.2, cy - peonyR * 0.15, peonyR * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // =====================================================
    // === 8: DAISY ===
    // Cheerful daisies with many thin petals and bright center
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { petal: '#ffffff', petalShade: '#e8e8ee', center: '#ffdd00', centerDark: '#ddaa00' },
        { petal: '#ffaacc', petalShade: '#ff88aa', center: '#ffdd00', centerDark: '#ddaa00' },
        { petal: '#ccaaee', petalShade: '#aa88cc', center: '#ffee44', centerDark: '#ddcc00' },
        { petal: '#fff8aa', petalShade: '#eeee88', center: '#ffaa00', centerDark: '#dd8800' },
        { petal: '#aaddff', petalShade: '#88bbee', center: '#ffee00', centerDark: '#ddcc00' },
        { petal: '#ffddcc', petalShade: '#ffccaa', center: '#ffdd00', centerDark: '#ddaa00' },
        { petal: '#ddffaa', petalShade: '#ccee88', center: '#ffcc00', centerDark: '#ddaa00' },
        { petal: '#ffccee', petalShade: '#ffaabb', center: '#ffee44', centerDark: '#ddcc00' },
        { petal: '#bbddff', petalShade: '#99bbee', center: '#ffdd00', centerDark: '#ddaa00' },
        { petal: '#ffffcc', petalShade: '#eeeeaa', center: '#ffaa00', centerDark: '#dd8800' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.9) * 0.015;
      ctx.rotate(sway);

      if (stage === 0) {
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.1, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
        var count = Math.floor(PlantRenderer._lerp(1, 3, p));
        for (var i = 0; i < count; i++) {
          var dx = (i - 1) * s * 0.025;
          ctx.fillStyle = '#aaa888';
          ctx.beginPath();
          ctx.arc(dx, -s * 0.008, s * 0.006, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 1) {
        var count = Math.floor(PlantRenderer._lerp(2, 4, p));
        for (var i = 0; i < count; i++) {
          var dx = (i - (count - 1) / 2) * s * 0.04;
          var h = PlantRenderer._lerp(0.03, 0.1, p) * s;
          PlantRenderer._stem(ctx, dx, 0, dx, -h * 0.5, dx, -h, s * 0.012, '#55aa35');
          if (p > 0.5) {
            PlantRenderer._leaf(ctx, dx - s * 0.01, -h * 0.5, s * 0.015, s * 0.006, -0.4, '#55aa35', null);
            PlantRenderer._leaf(ctx, dx + s * 0.01, -h * 0.45, s * 0.015, s * 0.006, 0.4, '#55aa35', null);
          }
        }
      } else if (stage === 2) {
        var daisyData = [
          { dx: -s * 0.05, lean: -0.015 },
          { dx: 0, lean: 0.005 },
          { dx: s * 0.05, lean: 0.018 },
        ];
        var h = PlantRenderer._lerp(0.12, 0.25, p) * s;
        daisyData.forEach(function(dd, i) {
          var stemSway = Math.sin(time * 1.0 + i * 0.9) * 0.008;
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, -h * 0.5, dd.dx + (dd.lean + stemSway) * s * 0.3, -h, s * 0.012, '#55aa35');
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.2, s * 0.025, s * 0.008, -0.3, '#55aa35', null);
        });
      } else if (stage === 3) {
        var daisyData = [
          { dx: -s * 0.06, lean: -0.018 },
          { dx: -s * 0.01, lean: 0.005 },
          { dx: s * 0.04, lean: 0.015 },
          { dx: s * 0.07, lean: 0.028 },
        ];
        var h = s * 0.3;
        daisyData.forEach(function(dd, i) {
          var stemSway = Math.sin(time * 0.8 + i * 0.8) * 0.008;
          var topX = dd.dx + (dd.lean + stemSway) * s * 0.4;
          var topY = -h + i * s * 0.008;
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, topY * 0.5, topX, topY, s * 0.012, '#44993a');
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.15, s * 0.03, s * 0.009, dd.lean * 6, '#44993a', null);
          var budR = PlantRenderer._lerp(s * 0.006, s * 0.015, p);
          ctx.fillStyle = '#55aa44';
          ctx.beginPath();
          ctx.arc(topX, topY, budR, 0, Math.PI * 2);
          ctx.fill();
          if (p > 0.5) {
            ctx.fillStyle = c.petal;
            ctx.beginPath();
            ctx.arc(topX, topY - budR * 0.6, budR * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else {
        // BLOOM: Classic daisies with many thin petals
        var daisyData = [
          { dx: -s * 0.07, lean: -0.02, hOff: 0 },
          { dx: -s * 0.015, lean: 0.005, hOff: -0.012 },
          { dx: s * 0.04, lean: 0.016, hOff: 0.006 },
          { dx: s * 0.08, lean: 0.03, hOff: -0.006 },
        ];
        var h = s * 0.35;
        daisyData.forEach(function(dd, i) {
          var stemSway = Math.sin(time * 0.7 + i * 0.7) * 0.01;
          var topX = dd.dx + (dd.lean + stemSway) * s * 0.45;
          var topY = -h + dd.hOff * s;
          PlantRenderer._stem(ctx, dd.dx, 0, dd.dx + (dd.lean + stemSway) * s * 0.2, topY * 0.5, topX, topY + s * 0.015, s * 0.012, '#44993a');
          PlantRenderer._leaf(ctx, dd.dx, -h * 0.12, s * 0.032, s * 0.01, -0.25 + dd.lean * 5, '#44993a', null);
          var petalLen = s * 0.042;
          var petalW = s * 0.01;
          for (var j = 0; j < 16; j++) {
            var a = (j / 16) * Math.PI * 2 + time * 0.03;
            var shade = j % 2 === 0 ? c.petal : c.petalShade;
            PlantRenderer._petal(ctx, topX, topY, petalLen, petalW, a, shade);
          }
          for (var j = 0; j < 10; j++) {
            var a = (j / 10) * Math.PI * 2 + 0.2 + time * 0.03;
            PlantRenderer._petal(ctx, topX, topY, petalLen * 0.7, petalW * 0.8, a, c.petal);
          }
          var cGrad = ctx.createRadialGradient(topX, topY, 0, topX, topY, s * 0.018);
          cGrad.addColorStop(0, c.center);
          cGrad.addColorStop(0.7, c.center);
          cGrad.addColorStop(1, c.centerDark);
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(topX, topY, s * 0.018, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.beginPath();
          ctx.arc(topX - s * 0.005, topY - s * 0.005, s * 0.007, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // =====================================================
    // === 9: SUNFLOWER ===
    // Classic tall sunflower with big golden petals and brown center
    // =====================================================
    function(ctx, stage, p, s, time, ci) {
      const palette = [
        { petal: '#ffcc00', petalTip: '#ffee44', center: '#4a2800', centerRing: '#6a3808' },
        { petal: '#ff9922', petalTip: '#ffbb44', center: '#3a1800', centerRing: '#5a2808' },
        { petal: '#fff44f', petalTip: '#ffff88', center: '#5a3010', centerRing: '#7a4818' },
        { petal: '#cc3300', petalTip: '#ee5522', center: '#2a1000', centerRing: '#4a2008' },
        { petal: '#fff8e0', petalTip: '#ffffff', center: '#5a4020', centerRing: '#7a5830' },
        { petal: '#ff7733', petalTip: '#ffaa55', center: '#3a1a08', centerRing: '#5a2a18' },
        { petal: '#ffdd44', petalTip: '#ffee88', center: '#4a2808', centerRing: '#6a4018' },
        { petal: '#eeaa00', petalTip: '#ffcc44', center: '#3a2000', centerRing: '#5a3810' },
        { petal: '#ffbb22', petalTip: '#ffdd66', center: '#4a2400', centerRing: '#6a3410' },
        { petal: '#ddcc00', petalTip: '#eedd44', center: '#4a3010', centerRing: '#6a4820' },
      ];
      const c = palette[ci];
      const sway = Math.sin(time * 0.6 + 1) * 0.015;
      ctx.rotate(sway);

      if (stage === 0) {
        ctx.fillStyle = '#5a4020';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.1, s * 0.03, 0, Math.PI, 0);
        ctx.fill();
        var seedH = PlantRenderer._lerp(0.01, 0.04, p) * s;
        ctx.fillStyle = '#3a3a2a';
        ctx.beginPath();
        ctx.ellipse(0, -seedH, s * 0.02, seedH * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 1) {
        var h = PlantRenderer._lerp(0.08, 0.2, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.022, '#4a8a28');
        if (p > 0.2) {
          var ls = PlantRenderer._lerp(0, s * 0.07, (p - 0.2) / 0.8);
          ctx.fillStyle = '#55aa35';
          ctx.beginPath();
          ctx.ellipse(-s * 0.035, -h * 0.8, ls, ls * 0.55, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(s * 0.035, -h * 0.75, ls, ls * 0.55, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage === 2) {
        var h = PlantRenderer._lerp(0.22, 0.42, p) * s;
        PlantRenderer._stem(ctx, 0, 0, 0, -h * 0.5, 0, -h, s * 0.028, '#3d7a20');
        var ls = s * 0.09;
        PlantRenderer._leaf(ctx, -s * 0.06, -h * 0.25, ls, ls * 0.5, -0.6, '#3d8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.05, -h * 0.4, ls, ls * 0.5, 0.5, '#3d8828', '#1e5510');
        if (p > 0.5) {
          PlantRenderer._leaf(ctx, -s * 0.04, -h * 0.6, ls * 0.8, ls * 0.4, -0.4, '#44992e', '#1e5510');
        }
      } else if (stage === 3) {
        var h = s * 0.52;
        PlantRenderer._stem(ctx, 0, 0, s * 0.003, -h * 0.5, s * 0.008, -h, s * 0.035, '#3d7a20');
        PlantRenderer._leaf(ctx, -s * 0.07, -h * 0.2, s * 0.1, s * 0.04, -0.6, '#3d8828', '#1e5510');
        PlantRenderer._leaf(ctx, s * 0.06, -h * 0.35, s * 0.09, s * 0.035, 0.5, '#3d8828', '#1e5510');
        var discR = PlantRenderer._lerp(s * 0.03, s * 0.1, p);
        ctx.fillStyle = '#4a8825';
        ctx.beginPath();
        ctx.arc(s * 0.008, -h - discR * 0.2, discR, 0, Math.PI * 2);
        ctx.fill();
        if (p > 0.5) {
          ctx.strokeStyle = c.petal;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s * 0.008, -h - discR * 0.2, discR + 3, Math.PI * 0.6, Math.PI * 1.8);
          ctx.stroke();
        }
      } else {
        // BLOOM: Big classic sunflower
        var h = s * 0.56;
        PlantRenderer._stem(ctx, 0, 0, s * 0.003, -h * 0.5, s * 0.01, -h, s * 0.04, '#3d7a20');
        PlantRenderer._leaf(ctx, -s * 0.08, -h * 0.18, s * 0.1, s * 0.04, -0.6, '#3d8828', null);
        PlantRenderer._leaf(ctx, s * 0.06, -h * 0.32, s * 0.09, s * 0.035, 0.5, '#3d8828', null);
        PlantRenderer._leaf(ctx, -s * 0.05, -h * 0.48, s * 0.07, s * 0.03, -0.4, '#44992e', null);

        var headX = s * 0.01;
        var headY = -h;
        var headR = s * 0.17;
        var nod = Math.sin(time * 0.4) * 0.04;
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(nod);

        for (var i = 0; i < 20; i++) {
          var a = (i / 20) * Math.PI * 2 + 0.08;
          var grad = ctx.createLinearGradient(0, 0, Math.cos(a) * headR * 1.3, Math.sin(a) * headR * 1.3);
          grad.addColorStop(0, c.petal);
          grad.addColorStop(1, c.petalTip);
          PlantRenderer._petal(ctx, 0, 0, headR * 1.2, headR * 0.2, a, grad);
        }
        for (var i = 0; i < 18; i++) {
          var a = (i / 18) * Math.PI * 2;
          var grad = ctx.createLinearGradient(0, 0, Math.cos(a) * headR, Math.sin(a) * headR);
          grad.addColorStop(0, c.petal);
          grad.addColorStop(0.7, c.petalTip);
          PlantRenderer._petal(ctx, 0, 0, headR * 1.05, headR * 0.25, a, grad);
        }
        var cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, headR * 0.52);
        cGrad.addColorStop(0, c.center);
        cGrad.addColorStop(0.7, c.centerRing);
        cGrad.addColorStop(1, c.center);
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(0, 0, headR * 0.52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.centerRing;
        for (var i = 0; i < 55; i++) {
          var a = i * 2.39996;
          var r = Math.sqrt(i) * headR * 0.065;
          var dotR = 1.0 + i * 0.02;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,200,80,0.12)';
        ctx.beginPath();
        ctx.arc(-headR * 0.1, -headR * 0.1, headR * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    },
  ],
};
