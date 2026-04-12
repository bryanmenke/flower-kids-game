// Storage - localStorage save/load for garden persistence

const Storage = {
  SAVE_KEY: 'starlight-garden-save',

  save() {
    const data = {
      version: 1,
      plants: Plants.items.map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        state: p.state,
      })),
      animals: Animals.items.map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        tapCount: a.tapCount,
        accessory: a.accessory,
      })),
      decorations: Decorations.placed.map(d => ({
        id: d.id,
        angle: d.angle,
      })),
      rewards: {
        unlocked: Rewards.unlocked.slice(),
        bloomsSinceLastGift: Rewards.bloomsSinceLastGift,
      },
      animalsState: {
        bloomsNeeded: Animals.bloomsNeeded,
        lastAnimalAt: Animals.lastAnimalAt,
      },
      planetRotation: Planet.rotation,
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data || data.version !== 1) return false;

      // Restore plants
      Plants.items = data.plants.map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        state: p.state,
        bloomTime: p.state === 'bloomed' ? 0 : 0,
        wobble: Math.random() * Math.PI * 2,
      }));

      // Restore animals
      Animals.items = data.animals.map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        tapCount: a.tapCount || 0,
        accessory: a.accessory || null,
        animState: null,
        animTimer: 0,
        arrivalTime: -10,
        settled: true,
        floatY: 0,
      }));

      // Restore decorations
      Decorations.placed = data.decorations.map(d => ({
        id: d.id,
        angle: d.angle,
      }));

      // Restore rewards
      Rewards.unlocked = data.rewards.unlocked || [];
      Rewards.bloomsSinceLastGift = data.rewards.bloomsSinceLastGift || 0;

      // Restore animal spawn state
      Animals.bloomsNeeded = data.animalsState.bloomsNeeded || 2;
      Animals.lastAnimalAt = data.animalsState.lastAnimalAt || 0;

      // Restore planet rotation
      Planet.rotation = data.planetRotation || 0;

      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  },

  hasSave() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  },

  clearSave() {
    localStorage.removeItem(this.SAVE_KEY);
  },
};
