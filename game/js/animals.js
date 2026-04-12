// Animals - Baby space creatures that inhabit the garden

const AnimalTypes = [
  {
    id: 'starFox',
    name: 'Star Fox',
    typeIndex: 0,
    color: '#ff9944',
    glowColor: 'rgba(255, 153, 68, 0.5)',
    animations: ['wag', 'spin', 'sparkle'],
    draw(ctx, x, y, size, animState) {
      // Body
      ctx.fillStyle = '#ff9944';
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.35, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head (big)
      ctx.fillStyle = '#ffaa55';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Ears (pointy)
      ctx.fillStyle = '#ff9944';
      ctx.beginPath();
      ctx.moveTo(x - size * 0.2, y - size * 0.5);
      ctx.lineTo(x - size * 0.3, y - size * 0.75);
      ctx.lineTo(x - size * 0.05, y - size * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.2, y - size * 0.5);
      ctx.lineTo(x + size * 0.3, y - size * 0.75);
      ctx.lineTo(x + size * 0.05, y - size * 0.5);
      ctx.fill();

      // Eyes (huge)
      ctx.fillStyle = '#332211';
      ctx.beginPath();
      ctx.arc(x - size * 0.1, y - size * 0.35, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.1, y - size * 0.35, size * 0.07, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - size * 0.08, y - size * 0.37, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.12, y - size * 0.37, size * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Glowing tail
      const tailWag = animState === 'wag' ? Math.sin(Game.time * 15) * 0.4 : Math.sin(Game.time * 2) * 0.15;
      ctx.save();
      ctx.translate(x + size * 0.3, y);
      ctx.rotate(tailWag);
      const tailGrad = ctx.createRadialGradient(size * 0.2, 0, 0, size * 0.2, 0, size * 0.25);
      tailGrad.addColorStop(0, '#ffcc44');
      tailGrad.addColorStop(1, 'rgba(255, 153, 68, 0)');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.ellipse(size * 0.2, -size * 0.05, size * 0.25, size * 0.12, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffbb44';
      ctx.beginPath();
      ctx.ellipse(size * 0.15, -size * 0.05, size * 0.18, size * 0.08, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 'moonBunny',
    name: 'Moon Bunny',
    typeIndex: 1,
    color: '#ddbbff',
    glowColor: 'rgba(221, 187, 255, 0.5)',
    animations: ['hop', 'wiggle', 'sparkle'],
    draw(ctx, x, y, size, animState) {
      const hopOffset = animState === 'hop' ? Math.abs(Math.sin(Game.time * 12)) * -size * 0.3 : 0;
      const drawY = y + hopOffset;

      // Body
      ctx.fillStyle = '#ddbbff';
      ctx.beginPath();
      ctx.ellipse(x, drawY, size * 0.3, size * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#eeccff';
      ctx.beginPath();
      ctx.arc(x, drawY - size * 0.25, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Long ears with sparkle tips
      const earWiggle = animState === 'wiggle' ? Math.sin(Game.time * 10) * 0.2 : 0;
      ctx.fillStyle = '#ddbbff';
      ctx.save();
      ctx.translate(x - size * 0.1, drawY - size * 0.45);
      ctx.rotate(-0.15 + earWiggle);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.3, size * 0.08, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle ear tip
      ctx.fillStyle = 'rgba(255, 220, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(0, -size * 0.55, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ddbbff';
      ctx.save();
      ctx.translate(x + size * 0.1, drawY - size * 0.45);
      ctx.rotate(0.15 - earWiggle);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.3, size * 0.08, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 220, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(0, -size * 0.55, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Eyes
      ctx.fillStyle = '#332244';
      ctx.beginPath();
      ctx.arc(x - size * 0.08, drawY - size * 0.28, size * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.08, drawY - size * 0.28, size * 0.055, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - size * 0.065, drawY - size * 0.295, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.095, drawY - size * 0.295, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'cometKitten',
    name: 'Comet Kitten',
    typeIndex: 2,
    color: '#88ccff',
    glowColor: 'rgba(136, 204, 255, 0.5)',
    animations: ['purr', 'spin', 'sparkle'],
    draw(ctx, x, y, size, animState) {
      const spinAngle = animState === 'spin' ? Game.time * 10 : 0;

      ctx.save();
      ctx.translate(x, y);
      if (animState === 'spin') ctx.rotate(spinAngle);

      // Light trail
      if (animState !== 'spin') {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(136, 204, 255, ${0.15 - i * 0.03})`;
          ctx.beginPath();
          ctx.arc(size * 0.15 * (i + 1), size * 0.05 * i, size * (0.15 - i * 0.02), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Body
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.3, size * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#99ddff';
      ctx.beginPath();
      ctx.arc(0, -size * 0.22, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Pointy ears
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.38);
      ctx.lineTo(-size * 0.22, -size * 0.55);
      ctx.lineTo(-size * 0.05, -size * 0.38);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.15, -size * 0.38);
      ctx.lineTo(size * 0.22, -size * 0.55);
      ctx.lineTo(size * 0.05, -size * 0.38);
      ctx.fill();

      // Eyes
      const purr = animState === 'purr';
      ctx.fillStyle = '#223355';
      if (purr) {
        // Happy closed eyes
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#223355';
        ctx.beginPath();
        ctx.arc(-size * 0.08, -size * 0.25, size * 0.04, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(size * 0.08, -size * 0.25, size * 0.04, 0, Math.PI);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-size * 0.08, -size * 0.25, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.08, -size * 0.25, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-size * 0.065, -size * 0.265, size * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.095, -size * 0.265, size * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
  },
];

const Animals = {
  items: [],       // { typeIndex, angle, tapCount, animState, animTimer, accessory }
  bloomsNeeded: 2, // first animal arrives after 2 blooms
  lastAnimalAt: 0, // bloom count when last animal arrived

  update(dt) {
    // Check if a new animal should arrive
    const bloomCount = Plants.items.filter(p => p.state === 'bloomed').length;
    if (bloomCount >= this.bloomsNeeded && bloomCount > this.lastAnimalAt) {
      this.spawnAnimal(bloomCount);
      this.lastAnimalAt = bloomCount;
      this.bloomsNeeded = bloomCount + 2; // next animal after 2 more blooms
    }

    // Update animation timers
    for (const animal of this.items) {
      if (animal.animTimer > 0) {
        animal.animTimer -= dt;
        if (animal.animTimer <= 0) {
          animal.animState = null;
        }
      }
    }
  },

  spawnAnimal(bloomCount) {
    // Pick a random animal type
    const typeIndex = this.items.length % AnimalTypes.length;
    // Pick a bloomed plant to settle near
    const bloomedPlants = Plants.items.filter(p => p.state === 'bloomed');
    const targetPlant = bloomedPlants[Math.floor(Math.random() * bloomedPlants.length)];
    if (!targetPlant) return;

    const animal = {
      typeIndex,
      angle: targetPlant.angle + (Math.random() - 0.5) * 0.3,
      tapCount: 0,
      animState: null,
      animTimer: 0,
      accessory: null,
      arrivalTime: Game.time,
      settled: false,
      floatY: -100, // starts above screen, floats down
    };

    this.items.push(animal);
    GameAudio.playAnimalArrive(typeIndex);
  },

  draw(ctx) {
    for (const animal of this.items) {
      const pos = Planet.surfacePoint(animal.angle);
      if (!pos.visible) continue;

      const type = AnimalTypes[animal.typeIndex];
      const size = Planet.radius * 0.2 * pos.scale;

      // Float-in animation
      const age = Game.time - animal.arrivalTime;
      let drawY = pos.y - size * 0.3;
      if (age < 1.5) {
        // Float down from above
        const t = age / 1.5;
        const ease = 1 - Math.pow(1 - t, 3); // ease out cubic
        drawY = pos.y - size * 0.3 - (1 - ease) * 150;

        // Gentle wobble while floating
        const wobbleX = Math.sin(age * 4) * 10 * (1 - ease);
        pos.x += wobbleX;
      } else {
        // Settled - gentle idle bounce
        drawY += Math.sin(Game.time * 2 + animal.angle) * 3;
      }

      ctx.save();

      // Glow beneath animal
      const glowGrad = ctx.createRadialGradient(pos.x, drawY + size * 0.2, 0, pos.x, drawY + size * 0.2, size * 0.8);
      glowGrad.addColorStop(0, type.glowColor);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(pos.x, drawY + size * 0.2, size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Draw the animal
      type.draw(ctx, pos.x, drawY, size, animal.animState);

      // Sparkle animation (shared across all types)
      if (animal.animState === 'sparkle') {
        Particles.emit(pos.x + (Math.random() - 0.5) * size, drawY + (Math.random() - 0.5) * size, {
          count: 1, color: type.color, speed: 20, life: 0.5, size: 3,
        });
      }

      ctx.restore();
    }
  },

  // Handle tap on an animal
  handleTap(x, y) {
    for (const animal of this.items) {
      const pos = Planet.surfacePoint(animal.angle);
      if (!pos.visible) continue;
      const size = Planet.radius * 0.2 * pos.scale;
      const drawY = pos.y - size * 0.3;
      const dx = x - pos.x;
      const dy = y - drawY;
      // Generous hit area
      if (dx * dx + dy * dy < size * size) {
        // Trigger 3-sound cycle
        const soundIndex = animal.tapCount % 3;
        GameAudio.playAnimalTap(animal.typeIndex, soundIndex);

        // Trigger matching animation
        const type = AnimalTypes[animal.typeIndex];
        animal.animState = type.animations[soundIndex];
        animal.animTimer = 0.8;
        animal.tapCount++;

        // Particles on tap
        Particles.emit(pos.x, drawY, {
          count: 5, color: type.color, speed: 30, life: 0.4, size: 2,
        });

        return animal;
      }
    }
    return null;
  },
};
