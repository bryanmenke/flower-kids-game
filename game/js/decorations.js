// Decorations - 10 decoration types, placement on ground, detailed procedural rendering
// Depends on: Camera, Game

const DecorationDefs = {
  fairy_house: {
    name: 'Fairy House',
    draw(ctx, s, time) {
      // Mushroom stump base
      ctx.fillStyle = '#8b6b3a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, 0);
      ctx.lineTo(-s * 0.08, -s * 0.18);
      ctx.lineTo(s * 0.08, -s * 0.18);
      ctx.lineTo(s * 0.1, 0);
      ctx.closePath();
      ctx.fill();
      // Door
      ctx.fillStyle = '#5a3a18';
      ctx.beginPath();
      ctx.arc(0, -s * 0.02, s * 0.035, Math.PI, 0);
      ctx.lineTo(s * 0.035, 0);
      ctx.lineTo(-s * 0.035, 0);
      ctx.closePath();
      ctx.fill();
      // Mushroom cap (big red/pink dome)
      var capGrad = ctx.createRadialGradient(0, -s * 0.28, s * 0.02, 0, -s * 0.22, s * 0.2);
      capGrad.addColorStop(0, '#ff6688');
      capGrad.addColorStop(0.6, '#ee3355');
      capGrad.addColorStop(1, '#cc2244');
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.18, s * 0.18, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      // White spots on cap
      ctx.fillStyle = '#ffffff';
      [[-s * 0.08, -s * 0.28, s * 0.025], [s * 0.05, -s * 0.3, s * 0.02], [s * 0.1, -s * 0.22, s * 0.018], [-s * 0.12, -s * 0.22, s * 0.015]].forEach(function(sp) {
        ctx.beginPath();
        ctx.arc(sp[0], sp[1], sp[2], 0, Math.PI * 2);
        ctx.fill();
      });
      // Glowing window
      var pulse = 0.6 + Math.sin(time * 2) * 0.4;
      var wGrad = ctx.createRadialGradient(0, -s * 0.22, 0, 0, -s * 0.22, s * 0.06 * pulse);
      wGrad.addColorStop(0, 'rgba(255, 230, 120, 0.6)');
      wGrad.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.arc(0, -s * 0.22, s * 0.06 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffdd66';
      ctx.beginPath();
      ctx.arc(0, -s * 0.22, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // Tiny chimney
      ctx.fillStyle = '#aa7744';
      ctx.fillRect(s * 0.04, -s * 0.38, s * 0.025, s * 0.06);
    },
  },

  rainbow_arch: {
    name: 'Rainbow Arch',
    draw(ctx, s, time) {
      // Rainbow bands — thick arcs
      var rainbow = ['#ff4444', '#ff8844', '#ffcc44', '#44dd44', '#4488ff', '#8844dd', '#cc44aa'];
      var bandWidth = s * 0.022;
      for (var i = 0; i < rainbow.length; i++) {
        var r = s * 0.2 + i * bandWidth;
        ctx.strokeStyle = rainbow[i];
        ctx.lineWidth = bandWidth + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, 0);
        ctx.stroke();
      }
      // Sparkle at top
      var sparkleAlpha = 0.3 + Math.sin(time * 3) * 0.2;
      ctx.fillStyle = 'rgba(255,255,255,' + sparkleAlpha + ')';
      ctx.beginPath();
      ctx.arc(0, -s * 0.2 - rainbow.length * bandWidth * 0.5, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // Cloud puffs at base
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.5;
      [[-s * 0.22, -s * 0.02, s * 0.05], [-s * 0.18, -s * 0.04, s * 0.04], [s * 0.22, -s * 0.02, s * 0.05], [s * 0.18, -s * 0.04, s * 0.04]].forEach(function(cl) {
        ctx.beginPath();
        ctx.arc(cl[0], cl[1], cl[2], 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
  },

  crystal_pond: {
    name: 'Crystal Pond',
    draw(ctx, s, time) {
      var w = s * 0.5;
      var h = s * 0.2;
      // Water edge
      ctx.fillStyle = '#3388bb';
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner water
      var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8);
      grad.addColorStop(0, '#88ddff');
      grad.addColorStop(0.6, '#55aadd');
      grad.addColorStop(1, '#3388bb');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.9, h * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lily pad
      ctx.fillStyle = '#44aa44';
      ctx.beginPath();
      ctx.arc(w * 0.2, -h * 0.1, s * 0.04, 0.2, Math.PI * 2 - 0.2);
      ctx.lineTo(w * 0.2, -h * 0.1);
      ctx.fill();
      // Tiny pink flower on lily pad
      ctx.fillStyle = '#ff88aa';
      for (var i = 0; i < 5; i++) {
        var a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(w * 0.2 + Math.cos(a) * s * 0.012, -h * 0.1 + Math.sin(a) * s * 0.012, s * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffee44';
      ctx.beginPath();
      ctx.arc(w * 0.2, -h * 0.1, s * 0.005, 0, Math.PI * 2);
      ctx.fill();
      // Reflections
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#aaddff';
      ctx.beginPath();
      ctx.ellipse(-w * 0.25, -h * 0.2, w * 0.12, h * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Ripple
      var rp = (time * 0.7) % 1;
      ctx.save();
      ctx.globalAlpha = 0.2 * (1 - rp);
      ctx.strokeStyle = '#aaddff';
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.ellipse(-w * 0.1, h * 0.05, w * 0.15 * rp + w * 0.03, h * 0.1 * rp + h * 0.03, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
  },

  unicorn_statue: {
    name: 'Unicorn Statue',
    draw(ctx, s, time) {
      // Body
      ctx.fillStyle = '#f0e8f4';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.strokeStyle = '#e8ddf0';
      ctx.lineWidth = s * 0.025;
      ctx.lineCap = 'round';
      [[-s * 0.06, -s * 0.06], [-s * 0.02, -s * 0.05], [s * 0.03, -s * 0.05], [s * 0.07, -s * 0.06]].forEach(function(l) {
        ctx.beginPath();
        ctx.moveTo(l[0], l[1]);
        ctx.lineTo(l[0], 0);
        ctx.stroke();
      });
      // Hooves
      ctx.fillStyle = '#ccbbdd';
      [[-s * 0.06, 0], [-s * 0.02, 0], [s * 0.03, 0], [s * 0.07, 0]].forEach(function(h) {
        ctx.beginPath();
        ctx.arc(h[0], h[1], s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      });
      // Neck + head
      ctx.fillStyle = '#f0e8f4';
      ctx.beginPath();
      ctx.moveTo(-s * 0.06, -s * 0.16);
      ctx.quadraticCurveTo(-s * 0.1, -s * 0.28, -s * 0.08, -s * 0.32);
      ctx.quadraticCurveTo(-s * 0.04, -s * 0.36, -s * 0.02, -s * 0.32);
      ctx.quadraticCurveTo(0, -s * 0.28, -s * 0.02, -s * 0.16);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.ellipse(-s * 0.09, -s * 0.33, s * 0.04, s * 0.03, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Eye
      ctx.fillStyle = '#6644aa';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.34, s * 0.008, 0, Math.PI * 2);
      ctx.fill();
      // Horn (golden spiral)
      var hue = (time * 40) % 360;
      ctx.strokeStyle = 'hsl(' + hue + ', 80%, 70%)';
      ctx.lineWidth = s * 0.012;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.36);
      ctx.lineTo(-s * 0.06, -s * 0.46);
      ctx.stroke();
      // Horn sparkle
      var sp = 0.4 + Math.sin(time * 4) * 0.4;
      ctx.fillStyle = 'rgba(255,255,200,' + sp + ')';
      ctx.beginPath();
      ctx.arc(-s * 0.06, -s * 0.47, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // Rainbow mane
      var maneColors = ['#ff6688', '#ffaa44', '#ffee44', '#66dd88', '#6688ff', '#aa66dd'];
      for (var i = 0; i < maneColors.length; i++) {
        ctx.strokeStyle = maneColors[i];
        ctx.lineWidth = s * 0.012;
        ctx.beginPath();
        var mx = -s * 0.04 + i * s * 0.008;
        var wave = Math.sin(time * 2 + i * 0.5) * s * 0.01;
        ctx.moveTo(-s * 0.06 + i * s * 0.005, -s * 0.32);
        ctx.quadraticCurveTo(mx + wave, -s * 0.24, mx + wave * 0.5, -s * 0.16);
        ctx.stroke();
      }
      // Rainbow tail
      for (var i = 0; i < maneColors.length; i++) {
        ctx.strokeStyle = maneColors[i];
        ctx.lineWidth = s * 0.01;
        ctx.beginPath();
        var wave = Math.sin(time * 1.5 + i * 0.4) * s * 0.015;
        ctx.moveTo(s * 0.1, -s * 0.14);
        ctx.quadraticCurveTo(s * 0.15 + wave, -s * 0.08 + i * s * 0.01, s * 0.18 + wave, -s * 0.04 + i * s * 0.015);
        ctx.stroke();
      }
    },
  },

  princess_tower: {
    name: 'Princess Tower',
    draw(ctx, s, time) {
      // Pink tower body
      ctx.fillStyle = '#ee99bb';
      ctx.beginPath();
      ctx.moveTo(-s * 0.07, 0);
      ctx.lineTo(-s * 0.06, -s * 0.45);
      ctx.lineTo(s * 0.06, -s * 0.45);
      ctx.lineTo(s * 0.07, 0);
      ctx.closePath();
      ctx.fill();
      // Stone lines
      ctx.strokeStyle = '#dd88aa';
      ctx.lineWidth = s * 0.004;
      for (var row = 0; row < 5; row++) {
        var y = -s * 0.08 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.07, y);
        ctx.lineTo(s * 0.07, y);
        ctx.stroke();
      }
      // Battlements
      ctx.fillStyle = '#ffaacc';
      for (var i = 0; i < 3; i++) {
        var bx = -s * 0.06 + i * s * 0.05;
        ctx.fillRect(bx, -s * 0.5, s * 0.035, s * 0.05);
      }
      // Heart window
      var hx = 0, hy = -s * 0.28;
      var hw = s * 0.035;
      ctx.fillStyle = '#ffdd88';
      ctx.beginPath();
      ctx.moveTo(hx, hy + hw * 0.9);
      ctx.bezierCurveTo(hx - hw * 1.2, hy - hw * 0.2, hx - hw * 0.4, hy - hw * 1.2, hx, hy - hw * 0.5);
      ctx.bezierCurveTo(hx + hw * 0.4, hy - hw * 1.2, hx + hw * 1.2, hy - hw * 0.2, hx, hy + hw * 0.9);
      ctx.fill();
      // Window glow
      var pulse = 0.5 + Math.sin(time * 1.8) * 0.3;
      var glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, s * 0.06 * pulse);
      glow.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
      glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, s * 0.06 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Conical roof
      ctx.fillStyle = '#bb66dd';
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.5);
      ctx.lineTo(0, -s * 0.68);
      ctx.lineTo(s * 0.08, -s * 0.5);
      ctx.closePath();
      ctx.fill();
      // Flag pole + flag
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.68);
      ctx.lineTo(0, -s * 0.78);
      ctx.stroke();
      var wave = Math.sin(time * 3) * s * 0.008;
      ctx.fillStyle = '#ff88cc';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.78);
      ctx.lineTo(s * 0.06, -s * 0.75 + wave);
      ctx.lineTo(s * 0.05, -s * 0.72 + wave);
      ctx.lineTo(0, -s * 0.74);
      ctx.closePath();
      ctx.fill();
    },
  },

  magic_wand: {
    name: 'Magic Wand',
    draw(ctx, s, time) {
      // Wand stick (stuck in ground at angle)
      ctx.save();
      ctx.rotate(-0.15);
      ctx.strokeStyle = '#ddbbee';
      ctx.lineWidth = s * 0.02;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -s * 0.45);
      ctx.stroke();
      // Spiral ribbon on wand
      ctx.strokeStyle = '#ff88dd';
      ctx.lineWidth = s * 0.008;
      for (var i = 0; i < 8; i++) {
        var y1 = -s * 0.05 - i * s * 0.05;
        var y2 = y1 - s * 0.025;
        ctx.beginPath();
        ctx.moveTo(-s * 0.015, y1);
        ctx.quadraticCurveTo(s * 0.02, (y1 + y2) / 2, -s * 0.015, y2);
        ctx.stroke();
      }
      // Star at top
      var starY = -s * 0.48;
      var starR = s * 0.06;
      var pulse = 1 + Math.sin(time * 3) * 0.15;
      // Star glow
      var glow = ctx.createRadialGradient(0, starY, 0, 0, starY, starR * 2.5 * pulse);
      glow.addColorStop(0, 'rgba(255, 200, 255, 0.4)');
      glow.addColorStop(1, 'rgba(255, 150, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, starY, starR * 2.5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Star shape
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        var r = starR * pulse;
        var ri = starR * 0.4 * pulse;
        ctx.lineTo(Math.cos(a) * r, starY + Math.sin(a) * r);
        var a2 = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a2) * ri, starY + Math.sin(a2) * ri);
      }
      ctx.closePath();
      ctx.fill();
      // White center
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(0, starY, starR * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Sparkle particles around star
      for (var i = 0; i < 4; i++) {
        var phase = time * 2.5 + i * 1.7;
        if (Math.sin(phase) > 0.5) {
          ctx.fillStyle = 'rgba(255,255,200,0.6)';
          var sx = Math.sin(phase * 1.3) * s * 0.08;
          var sy = -s * 0.48 + Math.cos(phase * 0.9) * s * 0.06;
          ctx.beginPath();
          ctx.arc(sx, sy, s * 0.008, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },

  butterfly_garden: {
    name: 'Butterfly Garden',
    draw(ctx, s, time) {
      // Small flowers at base
      var flowerColors = ['#ff88aa', '#ffaa44', '#88ddff', '#bb88ff'];
      for (var i = 0; i < 4; i++) {
        var fx = (i - 1.5) * s * 0.08;
        var fy = -s * 0.01;
        // Tiny stem
        ctx.strokeStyle = '#44aa44';
        ctx.lineWidth = s * 0.006;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx, fy - s * 0.06);
        ctx.stroke();
        // Tiny flower head
        ctx.fillStyle = flowerColors[i];
        for (var j = 0; j < 5; j++) {
          var a = (j / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * s * 0.012, fy - s * 0.06 + Math.sin(a) * s * 0.012, s * 0.008, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffee44';
        ctx.beginPath();
        ctx.arc(fx, fy - s * 0.06, s * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
      // Butterflies
      var bflies = [
        { x: -s * 0.08, y: -s * 0.2, c1: '#ff66aa', c2: '#ffaacc', phase: 0 },
        { x: s * 0.06, y: -s * 0.25, c1: '#66aaff', c2: '#aaddff', phase: 1.5 },
        { x: s * 0.0, y: -s * 0.32, c1: '#ffaa44', c2: '#ffdd88', phase: 3.0 },
        { x: -s * 0.05, y: -s * 0.15, c1: '#bb66ff', c2: '#ddaaff', phase: 4.5 },
      ];
      bflies.forEach(function(bf) {
        var bx = bf.x + Math.sin(time * 0.8 + bf.phase) * s * 0.04;
        var by = bf.y + Math.cos(time * 0.6 + bf.phase) * s * 0.03;
        var wingFlap = Math.sin(time * 6 + bf.phase) * 0.4;
        ctx.save();
        ctx.translate(bx, by);
        // Wings
        ctx.fillStyle = bf.c1;
        ctx.save();
        ctx.scale(1, Math.cos(wingFlap));
        // Left wing
        ctx.beginPath();
        ctx.ellipse(-s * 0.018, 0, s * 0.02, s * 0.015, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.ellipse(s * 0.018, 0, s * 0.02, s * 0.015, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Inner wing marks
        ctx.fillStyle = bf.c2;
        ctx.beginPath();
        ctx.ellipse(-s * 0.016, 0, s * 0.01, s * 0.008, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.016, 0, s * 0.01, s * 0.008, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Body
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.004, s * 0.012, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },
  },

  treasure_chest: {
    name: 'Treasure Chest',
    draw(ctx, s, time) {
      // Chest base
      ctx.fillStyle = '#8b5a2a';
      ctx.fillRect(-s * 0.12, -s * 0.1, s * 0.24, s * 0.1);
      // Metal bands
      ctx.fillStyle = '#ccaa44';
      ctx.fillRect(-s * 0.13, -s * 0.1, s * 0.26, s * 0.015);
      ctx.fillRect(-s * 0.13, -s * 0.04, s * 0.26, s * 0.012);
      // Open lid (tilted back)
      ctx.save();
      ctx.translate(0, -s * 0.1);
      ctx.rotate(-0.6);
      ctx.fillStyle = '#9b6a3a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, 0);
      ctx.lineTo(-s * 0.12, -s * 0.07);
      ctx.quadraticCurveTo(0, -s * 0.1, s * 0.12, -s * 0.07);
      ctx.lineTo(s * 0.12, 0);
      ctx.closePath();
      ctx.fill();
      // Lid metal band
      ctx.fillStyle = '#ccaa44';
      ctx.fillRect(-s * 0.12, -s * 0.015, s * 0.24, s * 0.015);
      ctx.restore();
      // Gems spilling out
      var gems = [
        { x: -s * 0.06, y: -s * 0.12, color: '#ff4466', r: s * 0.02 },
        { x: s * 0.02, y: -s * 0.14, color: '#44ddff', r: s * 0.018 },
        { x: s * 0.08, y: -s * 0.11, color: '#44ee44', r: s * 0.015 },
        { x: -s * 0.02, y: -s * 0.16, color: '#ffdd44', r: s * 0.02 },
        { x: s * 0.05, y: -s * 0.13, color: '#dd66ff', r: s * 0.016 },
        { x: -s * 0.1, y: -s * 0.08, color: '#ff8844', r: s * 0.014 },
        { x: s * 0.12, y: -s * 0.06, color: '#ff66aa', r: s * 0.013 },
      ];
      gems.forEach(function(g) {
        // Diamond shape
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y - g.r);
        ctx.lineTo(g.x + g.r * 0.7, g.y);
        ctx.lineTo(g.x, g.y + g.r * 0.6);
        ctx.lineTo(g.x - g.r * 0.7, g.y);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(g.x - g.r * 0.15, g.y - g.r * 0.2, g.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });
      // Gold coins
      ctx.fillStyle = '#ffcc22';
      [[-s * 0.04, -s * 0.05], [s * 0.06, -s * 0.04], [0, -s * 0.03]].forEach(function(c) {
        ctx.beginPath();
        ctx.ellipse(c[0], c[1], s * 0.018, s * 0.012, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // Sparkle
      var sp = Math.sin(time * 3);
      if (sp > 0.5) {
        ctx.fillStyle = 'rgba(255,255,200,0.7)';
        ctx.beginPath();
        ctx.arc(s * 0.03, -s * 0.15, s * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },

  flower_swing: {
    name: 'Flower Swing',
    draw(ctx, s, time) {
      // Arch/frame
      ctx.strokeStyle = '#6a8a40';
      ctx.lineWidth = s * 0.02;
      ctx.lineCap = 'round';
      // Left post
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, 0);
      ctx.lineTo(-s * 0.12, -s * 0.5);
      ctx.stroke();
      // Right post
      ctx.beginPath();
      ctx.moveTo(s * 0.15, 0);
      ctx.lineTo(s * 0.12, -s * 0.5);
      ctx.stroke();
      // Top vine bar
      ctx.strokeStyle = '#5a7a30';
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.moveTo(-s * 0.13, -s * 0.5);
      ctx.quadraticCurveTo(0, -s * 0.55, s * 0.13, -s * 0.5);
      ctx.stroke();
      // Vine leaves on bar
      var leafPositions = [-0.3, -0.1, 0.1, 0.3];
      leafPositions.forEach(function(t) {
        var lx = t * s * 0.35;
        var ly = -s * 0.52 - Math.abs(t) * s * 0.03;
        ctx.fillStyle = '#55aa35';
        ctx.beginPath();
        ctx.ellipse(lx, ly, s * 0.02, s * 0.01, t * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      // Swing ropes
      var swingAngle = Math.sin(time * 1.2) * 0.12;
      ctx.save();
      ctx.translate(0, -s * 0.5);
      ctx.rotate(swingAngle);
      ctx.strokeStyle = '#8a7a50';
      ctx.lineWidth = s * 0.008;
      // Left rope
      ctx.beginPath();
      ctx.moveTo(-s * 0.06, 0);
      ctx.lineTo(-s * 0.06, s * 0.28);
      ctx.stroke();
      // Right rope
      ctx.beginPath();
      ctx.moveTo(s * 0.06, 0);
      ctx.lineTo(s * 0.06, s * 0.28);
      ctx.stroke();
      // Seat (wooden plank)
      ctx.fillStyle = '#aa8855';
      ctx.fillRect(-s * 0.08, s * 0.27, s * 0.16, s * 0.025);
      // Flower garland on seat
      var garlandColors = ['#ff88aa', '#ffaa55', '#88ddff', '#ffee44', '#bb88ff'];
      for (var i = 0; i < garlandColors.length; i++) {
        var gx = -s * 0.06 + i * s * 0.03;
        ctx.fillStyle = garlandColors[i];
        ctx.beginPath();
        ctx.arc(gx, s * 0.265, s * 0.01, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  },

  wishing_well: {
    name: 'Wishing Well',
    draw(ctx, s, time) {
      // Stone base (cylinder)
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.12, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#777777';
      ctx.fillRect(-s * 0.12, -s * 0.15, s * 0.24, s * 0.15);
      // Top rim
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.13, s * 0.055, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone texture lines
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = s * 0.004;
      for (var row = 0; row < 3; row++) {
        var y = -s * 0.04 * row;
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, y);
        ctx.lineTo(s * 0.12, y);
        ctx.stroke();
      }
      // Inner dark water
      ctx.fillStyle = '#224466';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.1, s * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      // Glowing blue water
      var pulse = 0.5 + Math.sin(time * 1.5) * 0.3;
      var wGrad = ctx.createRadialGradient(0, -s * 0.15, 0, 0, -s * 0.15, s * 0.08);
      wGrad.addColorStop(0, 'rgba(100, 200, 255, ' + (0.6 * pulse) + ')');
      wGrad.addColorStop(1, 'rgba(50, 100, 200, 0.1)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.09, s * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
      // Roof posts
      ctx.strokeStyle = '#6a5a4a';
      ctx.lineWidth = s * 0.015;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.15);
      ctx.lineTo(-s * 0.1, -s * 0.42);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.15);
      ctx.lineTo(s * 0.1, -s * 0.42);
      ctx.stroke();
      // Peaked roof
      ctx.fillStyle = '#aa7744';
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.42);
      ctx.lineTo(0, -s * 0.55);
      ctx.lineTo(s * 0.14, -s * 0.42);
      ctx.closePath();
      ctx.fill();
      // Roof ridge
      ctx.strokeStyle = '#8a5a2a';
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.42);
      ctx.lineTo(0, -s * 0.55);
      ctx.lineTo(s * 0.14, -s * 0.42);
      ctx.stroke();
      // Hanging bucket rope
      ctx.strokeStyle = '#8a7a5a';
      ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.42);
      ctx.lineTo(0, -s * 0.22);
      ctx.stroke();
      // Tiny bucket
      ctx.fillStyle = '#7a6a4a';
      ctx.fillRect(-s * 0.02, -s * 0.25, s * 0.04, s * 0.03);
      // Water glow rising up
      var glowY = -s * 0.15 - Math.abs(Math.sin(time * 0.8)) * s * 0.08;
      ctx.fillStyle = 'rgba(100, 200, 255, ' + (0.2 * pulse) + ')';
      ctx.beginPath();
      ctx.arc(0, glowY, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    },
  },
};

const DecorationIds = ['fairy_house', 'rainbow_arch', 'crystal_pond', 'unicorn_statue', 'princess_tower', 'magic_wand', 'butterfly_garden', 'treasure_chest', 'flower_swing', 'wishing_well'];

const Decorations = {
  placed: [],  // { id, angle, depth }

  placeDecoration(decoId, angle, depth) {
    this.placed.push({ id: decoId, angle, depth });
  },

  removeDecoration(deco) {
    var idx = this.placed.indexOf(deco);
    if (idx >= 0) this.placed.splice(idx, 1);
  },

  // Hit-test: find placed decoration near screen coordinates
  findDecorationAt(screenX, screenY) {
    var closest = null;
    var closestDist = Infinity;
    for (var i = 0; i < this.placed.length; i++) {
      var deco = this.placed[i];
      var pos = Camera.worldToScreen(deco.angle, deco.depth);
      if (!pos.visible) continue;
      var hitRadius = 200 * pos.scale;
      var dx = screenX - pos.x;
      var dy = screenY - (pos.y - hitRadius * 0.3);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius && dist < closestDist) {
        closest = deco;
        closestDist = dist;
      }
    }
    return closest;
  },

  // Get draw list for depth-sorting in main.js
  getSortedDrawList() {
    var list = [];
    for (var i = 0; i < this.placed.length; i++) {
      var deco = this.placed[i];
      var pos = Camera.worldToScreen(deco.angle, deco.depth);
      if (!pos.visible) continue;
      list.push({ deco: deco, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single decoration at screen position
  drawDecoration(ctx, deco, x, y, scale) {
    var def = DecorationDefs[deco.id];
    if (!def) return;
    ctx.save();
    ctx.translate(x, y);
    var s = 360 * scale;
    def.draw(ctx, s, Game.time);
    ctx.restore();
  },
};
