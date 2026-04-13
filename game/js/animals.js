// Animals - Animal data, arrival logic, tap handling, 3-tap sound cycle
// Depends on: Camera, AnimalRenderer, Plants, Particles, GameAudio, Game

const AnimalTypes = [
  { id: 'starFox',      name: 'Star Fox',        bloomThreshold: 3,  color: '#ff8844' },
  { id: 'moonBunny',    name: 'Moon Bunny',       bloomThreshold: 5,  color: '#ddddff' },
  { id: 'cometKitten',  name: 'Comet Kitten',     bloomThreshold: 8,  color: '#ffbb88' },
  { id: 'nebulaOwl',    name: 'Nebula Owl',       bloomThreshold: 12, color: '#886644' },
  { id: 'galaxyDeer',   name: 'Galaxy Deer',      bloomThreshold: 17, color: '#cc9966' },
  { id: 'auroraBear',   name: 'Aurora Bear Cub',  bloomThreshold: 23, color: '#8877aa' },
];

const Animals = {
  items: [],       // Array of animal objects
  nextTypeIndex: 0, // which animal type spawns next
  lastCheckBloomCount: 0, // bloom count at last spawn check

  update(dt) {
    // Check if we should spawn a new animal
    const totalBlooms = Plants.bloomCount();
    if (this.nextTypeIndex < AnimalTypes.length) {
      const nextType = AnimalTypes[this.nextTypeIndex];
      if (totalBlooms >= nextType.bloomThreshold && totalBlooms > this.lastCheckBloomCount) {
        this.spawnAnimal(this.nextTypeIndex);
        this.lastCheckBloomCount = totalBlooms;
        this.nextTypeIndex++;
      }
    }

    // Update each animal
    for (const animal of this.items) {
      // Walk-in animation: move toward target position
      if (!animal.settled) {
        const elapsed = Game.time - animal.arrivalTime;
        const walkDuration = 1.5;
        if (elapsed >= walkDuration) {
          animal.settled = true;
          animal.angle = animal.targetAngle;
          animal.depth = animal.targetDepth;
        } else {
          const t = elapsed / walkDuration;
          const ease = t * (2 - t); // ease-out
          // Walk in from off-screen (start angle is offset from target)
          animal.angle = animal.startAngle + (animal.targetAngle - animal.startAngle) * ease;
          animal.depth = animal.startDepth + (animal.targetDepth - animal.startDepth) * ease;
        }
      }
      // Update idle timer
      animal.idleTimer += dt;
    }
  },

  spawnAnimal(typeIndex) {
    // Find a bloomed plant to spawn near
    const bloomedPlants = Plants.items.filter(p => p.growthStage >= 4);
    let targetAngle, targetDepth;
    if (bloomedPlants.length > 0) {
      const plant = bloomedPlants[Math.floor(Math.random() * bloomedPlants.length)];
      targetAngle = plant.angle + (Math.random() - 0.5) * 0.15;
      targetDepth = Math.min(0.95, plant.depth + 0.05 + Math.random() * 0.1);
    } else {
      targetAngle = Camera.rotation + (Math.random() - 0.5) * Camera.visibleArc * 0.5;
      targetDepth = 0.3 + Math.random() * 0.4;
    }

    // Start from off-screen (far left or right)
    const side = Math.random() < 0.5 ? -1 : 1;
    const startAngle = targetAngle + side * Camera.visibleArc * 0.7;
    const startDepth = targetDepth;

    const animal = {
      typeIndex,
      angle: startAngle,
      depth: startDepth,
      targetAngle,
      targetDepth,
      startAngle,
      startDepth,
      tapCount: 0,
      accessory: null,
      arrivalTime: Game.time,
      settled: false,
      idleTimer: Math.random() * 10, // randomize idle phase
    };

    this.items.push(animal);
    GameAudio.playAnimalArrive(typeIndex);
  },

  // Handle tap on animal — returns animal if hit, null if miss
  handleTap(screenX, screenY) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const animal = this.items[i];
      const pos = Camera.worldToScreen(animal.angle, animal.depth);
      if (!pos.visible) continue;
      const hitRadius = 30 * pos.scale;
      const dx = screenX - pos.x;
      const dy = screenY - (pos.y - hitRadius * 0.3);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius) {
        // Cycle through 3 tap sounds: 0, 1, 2, 0, 1, 2, ...
        const soundIndex = animal.tapCount % 3;
        GameAudio.playAnimalTap(animal.typeIndex, soundIndex);
        animal.tapCount++;
        animal.idleTimer = 0; // reset idle to trigger fresh animation

        // Emit particles
        Particles.emit(pos.x, pos.y - hitRadius * 0.5, {
          count: 6,
          colors: [AnimalTypes[animal.typeIndex].color, '#ffffff', '#ffddaa'],
          speed: 40,
          life: 0.5,
          size: 3,
          gravity: 15,
          spread: Math.PI,
          angle: -Math.PI / 2,
        });
        return animal;
      }
    }
    return null;
  },

  // Get draw list for depth-sorting in main.js
  getSortedDrawList() {
    const list = [];
    for (const animal of this.items) {
      const pos = Camera.worldToScreen(animal.angle, animal.depth);
      if (!pos.visible) continue;
      list.push({ animal, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single animal at screen position
  drawAnimal(ctx, animal, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    AnimalRenderer.draw(ctx, animal.typeIndex, scale, Game.time, animal.idleTimer, animal.accessory);
    ctx.restore();
  },
};
