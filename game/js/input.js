// Input - Unified touch/mouse handler

const Input = {
  // Current state
  isDown: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  startTime: 0,
  lastMoveX: 0,
  lastMoveY: 0,
  velocityX: 0,
  velocityY: 0,

  // Callbacks
  onTap: null,       // (x, y) - quick press and release
  onDragStart: null,  // (x, y) - finger down
  onDragMove: null,   // (x, y, dx, dy) - finger moving
  onDragEnd: null,    // (x, y, velocityX, velocityY) - finger up
  onSwipe: null,      // (velocityX, velocityY) - fast horizontal swipe

  TAP_THRESHOLD: 15,       // max pixels moved to count as tap
  TAP_TIME_THRESHOLD: 300, // max ms to count as tap
  SWIPE_VELOCITY: 200,     // min px/s to count as swipe

  init() {
    // Touch events
    canvas.addEventListener('touchstart', (e) => this.handleStart(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.handleMove(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });
    canvas.addEventListener('touchcancel', (e) => this.handleEnd(e), { passive: false });

    // Mouse fallback
    canvas.addEventListener('mousedown', (e) => this.handleStart(e.clientX, e.clientY, e));
    canvas.addEventListener('mousemove', (e) => { if (this.isDown) this.handleMove(e.clientX, e.clientY, e); });
    canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    canvas.addEventListener('mouseleave', (e) => { if (this.isDown) this.handleEnd(e); });
  },

  handleStart(x, y, e) {
    e.preventDefault();
    this.isDown = true;
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    this.lastMoveX = x;
    this.lastMoveY = y;
    this.startTime = performance.now();
    this.velocityX = 0;
    this.velocityY = 0;

    if (this.onDragStart) this.onDragStart(x, y);
  },

  handleMove(x, y, e) {
    e.preventDefault();
    const dx = x - this.lastMoveX;
    const dy = y - this.lastMoveY;

    // Track velocity (smoothed)
    this.velocityX = this.velocityX * 0.5 + dx * 20;
    this.velocityY = this.velocityY * 0.5 + dy * 20;

    this.currentX = x;
    this.currentY = y;
    this.lastMoveX = x;
    this.lastMoveY = y;

    if (this.onDragMove) this.onDragMove(x, y, dx, dy);
  },

  handleEnd(e) {
    e.preventDefault();
    if (!this.isDown) return;
    this.isDown = false;

    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = performance.now() - this.startTime;

    // Determine gesture type
    if (dist < this.TAP_THRESHOLD && elapsed < this.TAP_TIME_THRESHOLD) {
      // Tap
      if (this.onTap) this.onTap(this.startX, this.startY);
    } else if (Math.abs(this.velocityX) > this.SWIPE_VELOCITY) {
      // Swipe
      if (this.onSwipe) this.onSwipe(this.velocityX, this.velocityY);
    }

    if (this.onDragEnd) this.onDragEnd(this.currentX, this.currentY, this.velocityX, this.velocityY);
  },
};
