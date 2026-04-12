// Planet - A cozy floating world

const Planet = {
  x: 0,
  y: 0,
  radius: 0,
  rotation: 0,        // current rotation angle in radians
  targetRotation: 0,  // for smooth interpolation
  rotationVelocity: 0,
  glowRadius: 0,

  init() {
    this.resize();
  },

  resize() {
    this.x = Game.width / 2;
    this.y = Game.height * 0.4;
    this.radius = Math.min(Game.width, Game.height) * 0.25;
    this.glowRadius = this.radius * 1.3;
  },

  update(dt) {
    // Apply rotation velocity with friction
    this.rotation += this.rotationVelocity * dt;
    this.rotationVelocity *= 0.95; // friction

    // Normalize rotation to 0..2PI
    this.rotation = this.rotation % (Math.PI * 2);
    if (this.rotation < 0) this.rotation += Math.PI * 2;
  },

  draw(ctx) {
    ctx.save();

    // Outer glow
    const glowGrad = ctx.createRadialGradient(
      this.x, this.y, this.radius * 0.9,
      this.x, this.y, this.glowRadius
    );
    glowGrad.addColorStop(0, 'rgba(100, 200, 150, 0.3)');
    glowGrad.addColorStop(1, 'rgba(100, 200, 150, 0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Planet body - main sphere
    const bodyGrad = ctx.createRadialGradient(
      this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
      this.x, this.y, this.radius
    );
    bodyGrad.addColorStop(0, '#7ec87e');  // light green highlight
    bodyGrad.addColorStop(0.5, '#4a8c4a'); // mid green
    bodyGrad.addColorStop(0.8, '#3a6b3a'); // darker green
    bodyGrad.addColorStop(1, '#2a4a2a');   // edge shadow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Surface detail - brown earth patches (rotate with planet)
    this.drawSurfaceDetails(ctx);

    // Top highlight for 3D feel
    const highlightGrad = ctx.createRadialGradient(
      this.x - this.radius * 0.2, this.y - this.radius * 0.2, 0,
      this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.6
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = highlightGrad;
    ctx.fill();

    ctx.restore();
  },

  drawSurfaceDetails(ctx) {
    // Draw small earth/brown patches that rotate with the planet
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.clip();

    const patchCount = 5;
    for (let i = 0; i < patchCount; i++) {
      const angle = this.rotation + (i * Math.PI * 2 / patchCount);
      const px = this.x + Math.cos(angle) * this.radius * 0.5;
      const py = this.y + Math.sin(angle) * this.radius * 0.3;
      const patchRadius = this.radius * (0.1 + Math.random() * 0.05);

      ctx.beginPath();
      ctx.ellipse(px, py, patchRadius * 1.5, patchRadius, angle, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(101, 78, 50, 0.3)';
      ctx.fill();
    }

    ctx.restore();
  },

  // Convert a surface angle to x,y screen coordinates
  surfacePoint(angle) {
    const adjustedAngle = angle + this.rotation;
    const x = this.x + Math.cos(adjustedAngle) * this.radius * 0.85;
    const y = this.y + Math.sin(adjustedAngle) * this.radius * 0.85;

    const normalizedAngle = ((adjustedAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const visible = normalizedAngle > Math.PI * 0.5 && normalizedAngle < Math.PI * 1.5
      ? false : true;

    const depth = Math.cos(adjustedAngle);
    const scale = 0.6 + 0.4 * Math.abs(depth);

    return { x, y, visible, scale, depth };
  },

  hitTest(screenX, screenY) {
    const dx = screenX - this.x;
    const dy = screenY - this.y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  },

  screenToSurfaceAngle(screenX, screenY) {
    const dx = screenX - this.x;
    const dy = screenY - this.y;
    return Math.atan2(dy, dx) - this.rotation;
  },

  spin(velocityX) {
    this.rotationVelocity = velocityX * 0.003;
  },
};
