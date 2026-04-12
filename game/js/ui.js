// UI - Garden tray, accessory tray, overlays

const UI = {
  trayElement: null,
  trayItems: [],
  currentTray: 'garden', // 'garden' | 'accessory'

  init() {
    this.createGardenTray();
  },

  createGardenTray() {
    const overlay = document.getElementById('ui-overlay');

    // Tray container
    this.trayElement = document.createElement('div');
    this.trayElement.id = 'garden-tray';
    this.trayElement.className = 'tray';
    overlay.appendChild(this.trayElement);

    // Plant buttons
    PlantTypes.forEach((type, index) => {
      const btn = document.createElement('div');
      btn.className = 'tray-item';
      btn.dataset.index = index;

      // Draw icon onto a small canvas
      const iconCanvas = document.createElement('canvas');
      const iconSize = 70;
      iconCanvas.width = iconSize;
      iconCanvas.height = iconSize;
      const iconCtx = iconCanvas.getContext('2d');
      type.icon(iconCtx, iconSize / 2, iconSize / 2, iconSize * 0.45);
      btn.appendChild(iconCanvas);

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectPlantType(index);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectPlantType(index);
      });

      this.trayElement.appendChild(btn);
      this.trayItems.push(btn);
    });
  },

  selectPlantType(index) {
    GameAudio.ensure();
    // Toggle selection
    if (Plants.selectedType === index) {
      Plants.selectedType = -1;
    } else {
      Plants.selectedType = index;
    }

    // Update visual selection
    this.trayItems.forEach((btn, i) => {
      btn.classList.toggle('selected', i === Plants.selectedType);
    });
  },

  // Show/hide trays
  showGardenTray() {
    if (this.trayElement) this.trayElement.style.display = 'flex';
    this.currentTray = 'garden';
  },

  hideGardenTray() {
    if (this.trayElement) this.trayElement.style.display = 'none';
  },
};
