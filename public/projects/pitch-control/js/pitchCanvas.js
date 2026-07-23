/**
 * Compact Pitch Canvas Visualizer Engine for Pitch (Groove LP // 06)
 * Renders interactive AI Fielders, directional shot rays, particle fireworks, and Wagon Wheel arcs.
 */

class PitchCanvasVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = 750;
    this.height = this.canvas.height = 240;

    this.ballAnim = null;
    this.wagonWheelShots = [];
    this.boundaryFlash = null;
    this.stumpsHitAnim = false;
    this.selectedShotDir = "drive";

    this.render();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || 750;
      this.canvas.height = parent.clientHeight || 240;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
    this.render();
  }

  setShotDirection(dir) {
    this.selectedShotDir = dir;
    this.render();
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawStadiumBackground();
    this.drawOutfield();
    this.drawFielders();
    this.drawPitch();
    this.drawCreaseAndStumps();
    this.drawShotDirectionGuide();
    this.drawWagonWheel();

    if (this.ballAnim) {
      this.drawBallAnimation();
    }

    if (this.boundaryFlash) {
      this.drawBoundaryFlash();
    }
  }

  drawStadiumBackground() {
    const grad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 20,
      this.width / 2, this.height / 2, this.width / 1.2
    );
    grad.addColorStop(0, "#092419");
    grad.addColorStop(0.6, "#041810");
    grad.addColorStop(1, "#020a06");

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Corner Floodlight Halos
    const lights = [
      { x: 50, y: 30, col: "rgba(5, 150, 105, 0.3)" },
      { x: this.width - 50, y: 30, col: "rgba(217, 119, 6, 0.3)" },
      { x: 50, y: this.height - 30, col: "rgba(217, 119, 6, 0.25)" },
      { x: this.width - 50, y: this.height - 30, col: "rgba(5, 150, 105, 0.3)" }
    ];

    lights.forEach((l) => {
      const glow = this.ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, 70);
      glow.addColorStop(0, l.col);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(l.x, l.y, 70, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawOutfield() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.min(this.width * 0.44, 350);
    const ry = Math.min(this.height * 0.42, 105);

    // Mowed Turf Stripe Pattern
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.clip();

    const numRings = 6;
    for (let i = numRings; i >= 1; i--) {
      const scale = i / numRings;
      this.ctx.fillStyle = i % 2 === 0 ? "#059669" : "#047857";
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, rx * scale, ry * scale, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Boundary Rope
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#d97706";
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawFielders() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.min(this.width * 0.44, 350);
    const ry = Math.min(this.height * 0.42, 105);

    // 5 Fielders
    const fielders = [
      { x: cx - rx * 0.62, y: cy - ry * 0.4, label: "Cover" },
      { x: cx - rx * 0.22, y: cy - ry * 0.75, label: "Mid-off" },
      { x: cx + rx * 0.62, y: cy + ry * 0.25, label: "Square Leg" },
      { x: cx + rx * 0.38, y: cy - ry * 0.65, label: "Deep Wicket" },
      { x: cx + rx * 0.48, y: cy + ry * 0.65, label: "Fine Leg" }
    ];

    fielders.forEach((f) => {
      this.ctx.save();
      // Outer glow ring
      this.ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
      this.ctx.stroke();

      // Fielder Dot
      this.ctx.fillStyle = "#fbbf24";
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawPitch() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const pw = 42;
    const ph = Math.min(this.height * 0.65, 140);

    const pitchGrad = this.ctx.createLinearGradient(cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2);
    pitchGrad.addColorStop(0, "#b45309");
    pitchGrad.addColorStop(0.5, "#92400e");
    pitchGrad.addColorStop(1, "#78350f");

    this.ctx.save();
    this.ctx.fillStyle = pitchGrad;
    this.ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);
    this.ctx.restore();
  }

  drawCreaseAndStumps() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const pw = 42;
    const ph = Math.min(this.height * 0.65, 140);

    const topY = cy - ph / 2 + 12;
    const botY = cy + ph / 2 - 12;

    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;

    // Crease lines
    this.ctx.beginPath();
    this.ctx.moveTo(cx - pw / 2 + 3, topY);
    this.ctx.lineTo(cx + pw / 2 - 3, topY);
    this.ctx.moveTo(cx - pw / 2 + 3, botY);
    this.ctx.lineTo(cx + pw / 2 - 3, botY);
    this.ctx.stroke();
    this.ctx.restore();

    this.drawStumpSet(cx, topY - 4, false);
    this.drawStumpSet(cx, botY + 4, this.stumpsHitAnim);
  }

  drawStumpSet(x, y, isHit) {
    this.ctx.save();
    this.ctx.fillStyle = isHit ? "#dc2626" : "#fbbf24";
    const gap = 4.5;

    for (let i = -1; i <= 1; i++) {
      const sx = x + (i * gap);
      this.ctx.fillRect(sx - 1, y - 5, 2, 8);
    }
    this.ctx.fillRect(x - gap - 1.5, y - 6, (gap * 2) + 3, 1.5);
    this.ctx.restore();
  }

  drawShotDirectionGuide() {
    const cx = this.width / 2;
    const cy = this.height / 2 + Math.min(this.height * 0.25, 60);

    const angleMap = {
      offside: -Math.PI / 1.35,
      straight: -Math.PI / 2,
      onside: -Math.PI / 4,
      scoop: Math.PI / 3
    };

    const angle = angleMap[this.selectedShotDir] || (-Math.PI / 2);
    const dist = 60;

    const targetX = cx + Math.cos(angle) * dist;
    const targetY = cy + Math.sin(angle) * dist;

    this.ctx.save();
    this.ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 4]);

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(targetX, targetY);
    this.ctx.stroke();

    this.ctx.fillStyle = "#fbbf24";
    this.ctx.beginPath();
    this.ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawWagonWheel() {
    const cx = this.width / 2;
    const cy = this.height / 2 + Math.min(this.height * 0.25, 60);

    this.wagonWheelShots.forEach((shot) => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(shot.x, shot.y);

      if (shot.runs === 6) {
        this.ctx.strokeStyle = "#d97706";
        this.ctx.lineWidth = 2.5;
      } else if (shot.runs === 4) {
        this.ctx.strokeStyle = "#059669";
        this.ctx.lineWidth = 2;
      } else {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        this.ctx.lineWidth = 1;
      }

      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(shot.x, shot.y, shot.runs === 6 ? 4 : 3, 0, Math.PI * 2);
      this.ctx.fillStyle = shot.runs === 6 ? "#d97706" : (shot.runs === 4 ? "#059669" : "#ffffff");
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  triggerDeliveryAnimation(delivery, outcome, onComplete) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const ph = Math.min(this.height * 0.65, 140);
    const startY = cy - ph / 2 + 12;
    const pitchY = cy + (delivery.pitchY || 0.6) * 20;
    const batterY = cy + ph / 2 - 12;

    let progress = 0;
    this.stumpsHitAnim = outcome.isWicket;

    const animate = () => {
      progress += 0.05;
      this.ballAnim = { progress, startY, pitchY, batterY, delivery, outcome };

      this.render();

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.ballAnim = null;

        if (outcome.runs > 0) {
          const angles = {
            offside: -Math.PI / 1.35,
            straight: -Math.PI / 2,
            onside: -Math.PI / 4,
            scoop: Math.PI / 3
          };
          const angle = angles[delivery.shotChoice] || (-Math.PI / 2);
          const dist = outcome.runs >= 6 ? this.height * 0.42 : (outcome.runs >= 4 ? this.height * 0.38 : this.height * 0.2);
          const shotX = cx + Math.cos(angle) * dist;
          const shotY = batterY + Math.sin(angle) * dist;

          this.wagonWheelShots.push({ x: shotX, y: shotY, runs: outcome.runs });
        }

        if (outcome.runs >= 4) {
          this.triggerBoundaryFlash(outcome.runs >= 6 ? "#d97706" : "#059669");
        }

        this.render();
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  drawBallAnimation() {
    if (!this.ballAnim) return;
    const { progress, startY, pitchY, batterY } = this.ballAnim;
    const cx = this.width / 2;

    let currY = startY;
    if (progress <= 0.5) {
      const t = progress / 0.5;
      currY = startY + (pitchY - startY) * t;
    } else {
      const t = (progress - 0.5) / 0.5;
      currY = pitchY + (batterY - pitchY) * t;
    }

    // Red Leather Ball
    this.ctx.save();
    this.ctx.fillStyle = "#dc2626";
    this.ctx.beginPath();
    this.ctx.arc(cx, currY, 5.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Impact Bounce Ring
    if (Math.abs(progress - 0.5) < 0.06) {
      this.ctx.save();
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, pitchY, 12, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  triggerBoundaryFlash(color) {
    let alpha = 0.75;
    const flashAnim = () => {
      alpha -= 0.05;
      this.boundaryFlash = { color, alpha };
      this.render();
      if (alpha > 0) {
        requestAnimationFrame(flashAnim);
      } else {
        this.boundaryFlash = null;
        this.render();
      }
    };
    flashAnim();
  }

  drawBoundaryFlash() {
    if (!this.boundaryFlash) return;
    this.ctx.save();
    this.ctx.fillStyle = this.boundaryFlash.color;
    this.ctx.globalAlpha = this.boundaryFlash.alpha * 0.35;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  clearWagonWheel() {
    this.wagonWheelShots = [];
    this.render();
  }
}

window.PitchCanvasVisualizer = PitchCanvasVisualizer;
