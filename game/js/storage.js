// Storage - v2 save/load with localStorage
// Depends on: Plants, Animals, Decorations, Rewards, Camera

const Storage = {
  SAVE_KEY: 'starlight-garden-save',

  save() {
    const data = {
      version: 2,
      plants: Plants.items.map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        depth: p.depth,
        growthStage: p.growthStage,
        colorIndex: p.colorIndex,
      })),
      animals: Animals.items.filter(a => a.settled).map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        depth: a.depth,
        tapCount: a.tapCount,
        accessory: a.accessory,
      })),
      decorations: Decorations.placed.map(d => ({
        id: d.id,
        angle: d.angle,
        depth: d.depth,
      })),
      rewards: {
        unlocked: Rewards.unlocked.slice(),
        bloomsSinceLastGift: Rewards.bloomsSinceLastGift,
      },
      camera: {
        rotation: Camera.rotation,
      },
      bloomCount: Plants.bloomCount(),
      nextAnimalIndex: Animals.nextTypeIndex,
      lastCheckBloomCount: Animals.lastCheckBloomCount,
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage full or unavailable — silently fail
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      // Discard v1 saves
      if (!data.version || data.version < 2) {
        this.clearSave();
        return false;
      }

      // Restore plants
      Plants.items = (data.plants || []).map(p => ({
        typeIndex: p.typeIndex,
        angle: p.angle,
        depth: p.depth,
        growthStage: p.growthStage,
        growthProgress: 1.0, // fully settled on load
        growthAnimating: false,
        plantedTime: 0,
        colorIndex: p.colorIndex != null ? p.colorIndex : Math.floor(Math.random() * 10),
      }));

      // Restore animals
      Animals.items = (data.animals || []).map(a => ({
        typeIndex: a.typeIndex,
        angle: a.angle,
        depth: a.depth,
        targetAngle: a.angle,
        targetDepth: a.depth,
        startAngle: a.angle,
        startDepth: a.depth,
        tapCount: a.tapCount || 0,
        accessory: a.accessory || null,
        arrivalTime: 0,
        settled: true,
        idleTimer: Math.random() * 10,
      }));
      Animals.nextTypeIndex = data.nextAnimalIndex || 0;
      Animals.lastCheckBloomCount = data.lastCheckBloomCount || 0;

      // Restore decorations
      Decorations.placed = (data.decorations || []).map(d => ({
        id: d.id,
        angle: d.angle,
        depth: d.depth,
      }));

      // Restore rewards
      if (data.rewards) {
        Rewards.unlocked = data.rewards.unlocked || [];
        Rewards.bloomsSinceLastGift = data.rewards.bloomsSinceLastGift || 0;
      }

      // Restore camera
      if (data.camera) {
        Camera.rotation = data.camera.rotation || 0;
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  hasSave() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.version >= 2;
    } catch (e) {
      return false;
    }
  },

  clearSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (e) {
      // silently fail
    }
  },
};
