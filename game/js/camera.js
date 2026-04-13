// Camera - Viewport math, world-to-screen projection, screen-to-world conversion
// The planet is enormous. We see only the top arc as a curved horizon.
// All surface objects use (angle, depth) coordinates.
// angle: 0-2PI position around the planet
// depth: 0-1 distance from horizon (0=horizon, 1=near viewer/bottom of screen)

const Camera = {
  // Viewport
  width: 0,
  height: 0,
  horizonY: 0,        // Y position of horizon line on screen (about 65% down)
  groundBottom: 0,     // Y position of bottom of visible ground (screen bottom - tray)

  // Rotation
  rotation: 0,         // current camera angle in radians
  rotationVelocity: 0, // angular velocity for momentum
  friction: 0.92,      // rotation friction per frame

  // Visible arc
  visibleArc: Math.PI * 0.6, // ~108 degrees visible at once

  // Planet geometry
  planetRadius: 0,     // computed from screen size — very large

  init(width, height) {
    this.width = width;
    this.height = height;
    this.horizonY = height * 0.65;
    this.groundBottom = height - 110; // above tray
    this.planetRadius = width * 2.5;  // enormous planet
  },

  resize(width, height) {
    this.init(width, height);
  },

  update(dt) {
    this.rotation += this.rotationVelocity * dt;
    this.rotationVelocity *= this.friction;
    // Wrap rotation to 0-2PI
    this.rotation = ((this.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },

  spin(velocityX) {
    this.rotationVelocity += velocityX * 0.003;
  },

  // Convert world coordinates (angle, depth) to screen coordinates
  // Returns { x, y, scale, visible }
  worldToScreen(angle, depth) {
    // Relative angle from camera center
    let relAngle = angle - this.rotation;
    // Normalize to -PI..PI
    while (relAngle > Math.PI) relAngle -= Math.PI * 2;
    while (relAngle < -Math.PI) relAngle += Math.PI * 2;

    const halfArc = this.visibleArc / 2;
    // Check visibility (with small buffer for objects partially off-screen)
    const visible = Math.abs(relAngle) < halfArc + 0.1;

    // X position: map relative angle to screen width
    const x = this.width / 2 + (relAngle / halfArc) * (this.width / 2);

    // Y position: depth 0 = horizon, depth 1 = bottom of ground area
    // Objects near horizon are further away (smaller), near bottom are closer (larger)
    // Use a slight curve so depth feels natural
    const depthCurve = depth * depth * 0.3 + depth * 0.7; // slight ease-in
    const y = this.horizonY + depthCurve * (this.groundBottom - this.horizonY);

    // Scale: objects at horizon are small, objects near viewer are full size
    // Also foreshorten at edges of visible arc
    const depthScale = 0.3 + depth * 0.7; // 0.3 at horizon, 1.0 at near
    const edgeFactor = 1 - Math.pow(Math.abs(relAngle) / halfArc, 2) * 0.15;
    const scale = depthScale * edgeFactor;

    return { x, y, scale, visible };
  },

  // Convert screen tap to world coordinates
  // Returns { angle, depth } or null if above horizon
  screenToWorld(screenX, screenY) {
    if (screenY < this.horizonY) return null;
    if (screenY > this.groundBottom) return null;

    // Depth from Y position (invert the worldToScreen Y mapping)
    const rawDepth = (screenY - this.horizonY) / (this.groundBottom - this.horizonY);
    // Invert the depth curve: depthCurve = d*d*0.3 + d*0.7
    // Solve: rawDepth = d^2 * 0.3 + d * 0.7 => 0.3d^2 + 0.7d - rawDepth = 0
    const a = 0.3, b = 0.7, c = -rawDepth;
    const discriminant = b * b - 4 * a * c;
    const depth = (-b + Math.sqrt(discriminant)) / (2 * a);

    // Angle from X position
    const halfArc = this.visibleArc / 2;
    const relAngle = ((screenX - this.width / 2) / (this.width / 2)) * halfArc;
    let angle = this.rotation + relAngle;
    // Normalize to 0-2PI
    angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    return { angle, depth: Math.max(0.05, Math.min(0.95, depth)) };
  },

  // Check if a screen point is on the ground
  isOnGround(screenX, screenY) {
    return screenY >= this.horizonY && screenY <= this.groundBottom;
  },

  // Check if a screen point is in the sky
  isInSky(screenX, screenY) {
    return screenY < this.horizonY;
  },
};
