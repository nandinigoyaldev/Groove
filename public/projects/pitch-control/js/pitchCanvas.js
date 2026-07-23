/**
 * Pitch Canvas Visualizer Engine for Pitch (Groove LP // 06)
 * Full-screen responsive HTML5 Canvas stadium, ball trajectories, bounce impact flares, and Wagon Wheel maps.
 */

class PitchCanvasVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = 750;
    this.height = this.canvas.height = 420;

    this.ballAnim = null;
    this.wagonWheelShots = [];
    this.boundaryFlash = null;
    this.stumpsHitAnim = false;

    this.render();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || 750;
      this.canvas.height = parent.clientHeight || 420;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
    this.render();
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawStadiumBackground();
    this.drawOutfield();
    this.drawPitch();
    this.drawCreaseAndStumps();
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
      this.width / 2, this.height / 2, 40,
      this.width / 2, this.height / 2, this.width / 1.1
    );
    grad.addColorStop(0, "#0a1611");
    grad.addColorStop(0.6, "#060e0a");
    grad.addColorStop(1, "#030705");

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const lights = [
      { x: 80, y: 50, col: "rgba(16, 185, 129, 0.4)" },
      { x: this.width - 80, y: 50, col: "rgba(245, 158, 11, 0.4)" },
      { x: 80, y: this.height - 50, col: "rgba(245, 158, 11, 0.3)" },
      { x: this.width - 80, y: this.height - 50, col: "rgba(16, 185, 129, 0.4)" }
    ];

    lights.forEach((l) => {
      const glow = this.ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, 90);
      glow.addColorStop(0, l.col);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(l.x, l.y, 90, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawOutfield() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.min(this.width * 0.44, 380);
    const ry = Math.min(this.height * 0.42, 180);

    const grassGrad = this.ctx.createRadialGradient(cx, cy, 30, cx, cy, rx);
    grassGrad.addColorStop(0, "#059669");
    grassGrad.addColorStop(0.7, "#044e3a");
    grassGrad.addColorStop(1, "#022c22");

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = grassGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#f59e0b";
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = "#f59e0b";
    this.ctx.shadowBlur = 18;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawPitch() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const pw = 52;
    const ph = Math.min(this.height * 0.55, 220);

    const pitchGrad = this.ctx.createLinearGradient(cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2);
    pitchGrad.addColorStop(0, "#b45309");
    pitchGrad.addColorStop(0.5, "#92400e");
    pitchGrad.addColorStop(1, "#78350f");

    this.ctx.save();
    this.ctx.fillStyle = pitchGrad;
    this.ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);

    this.ctx.strokeStyle = "rgba(250, 249, 245, 0.4)";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);
    this.ctx.restore();
  }

  drawCreaseAndStumps() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const pw = 52;
    const ph = Math.min(this.height * 0.55, 220);

    const topY = cy - ph / 2 + 18;
    const botY = cy + ph / 2 - 18;

    this.ctx.save();
    this.ctx.strokeStyle = "#faf9f5";
    this.ctx.shadowColor = "#faf9f5";
    this.ctx.shadowBlur = 6;
    this.ctx.lineWidth = 2.5;

    this.ctx.beginPath();
    this.ctx.moveTo(cx - pw / 2 + 4, topY);
    this.ctx.lineTo(cx + pw / 2 - 4, topY);
    this.ctx.moveTo(cx - pw / 2 + 4, botY);
    this.ctx.lineTo(cx + pw / 2 - 4, botY);
    this.ctx.stroke();
    this.ctx.restore();

    this.drawStumpSet(cx, topY - 5, false);
    this.drawStumpSet(cx, botY + 5, this.stumpsHitAnim);
  }

  drawStumpSet(x, y, isHit) {
    this.ctx.save();
    this.ctx.fillStyle = isHit ? "#ef4444" : "#fbbf24";
    if (isHit) {
      this.ctx.shadowColor = "#ef4444";
      this.ctx.shadowBlur = 14;
    }
    const gap = 5.5;

    for (let i = -1; i <= 1; i++) {
      const sx = x + (i * gap);
      this.ctx.fillRect(sx - 1.5, y - 7, 3, 11);
    }
    this.ctx.fillRect(x - gap - 2, y - 8, (gap * 2) + 4, 2);
    this.ctx.restore();
  }

  drawWagonWheel() {
    const cx = this.width / 2;
    const cy = this.height / 2 + Math.min(this.height * 0.27, 100);

    this.wagonWheelShots.forEach((shot) => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(shot.x, shot.y);

      if (shot.runs === 6) {
        this.ctx.strokeStyle = "#f59e0b"; // Gold 6
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = "#f59e0b";
        this.ctx.shadowBlur = 12;
      } else if (shot.runs === 4) {
        this.ctx.strokeStyle = "#10b981"; // Emerald 4
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = "#10b981";
        this.ctx.shadowBlur = 10;
      } else {
        this.ctx.strokeStyle = "rgba(250, 249, 245, 0.4)";
        this.ctx.lineWidth = 1;
      }

      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(shot.x, shot.y, shot.runs === 6 ? 5 : 4, 0, Math.PI * 2);
      this.ctx.fillStyle = shot.runs === 6 ? "#f59e0b" : (shot.runs === 4 ? "#10b981" : "#ffffff");
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  triggerDeliveryAnimation(delivery, outcome, onComplete) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const ph = Math.min(this.height * 0.55, 220);
    const startY = cy - ph / 2 + 18;
    const pitchY = cy + (delivery.pitchY || 0.6) * 35;
    const batterY = cy + ph / 2 - 18;

    let progress = 0;
    this.stumpsHitAnim = outcome.isWicket;

    const animate = () => {
      progress += 0.045;
      this.ballAnim = { progress, startY, pitchY, batterY, delivery, outcome };

      this.render();

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.ballAnim = null;

        if (outcome.runs > 0) {
          const angles = {
            loft: -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
            drive: -Math.PI / 2 + (Math.random() < 0.5 ? -0.8 : 0.8),
            pull: Math.PI / 4,
            sweep: Math.PI * 0.75,
            defend: Math.PI / 2
          };
          const angle = angles[delivery.shotChoice] || (-Math.PI / 2 + (Math.random() - 0.5));
          const dist = outcome.runs === 6 ? this.height * 0.4 : (outcome.runs === 4 ? this.height * 0.36 : this.height * 0.18);
          const shotX = cx + Math.cos(angle) * dist;
          const shotY = batterY + Math.sin(angle) * dist;

          this.wagonWheelShots.push({ x: shotX, y: shotY, runs: outcome.runs });
        }

        if (outcome.runs === 6 || outcome.runs === 4) {
          this.triggerBoundaryFlash(outcome.runs === 6 ? "#f59e0b" : "#10b981");
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
    this.ctx.fillStyle = "#ef4444";
    this.ctx.shadowColor = "#f87171";
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(cx, currY, 6.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    if (Math.abs(progress - 0.5) < 0.05) {
      this.ctx.save();
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.shadowColor = "#ffffff";
      this.ctx.shadowBlur = 15;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(cx, pitchY, 15, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  triggerBoundaryFlash(color) {
    let alpha = 0.85;
    const flashAnim = () => {
      alpha -= 0.045;
      this.boundaryFlash = { color, alpha };
      this.render();
      if (alpha > 0) {
        requestAnimationFrame(flashAnim);
      } else {
        this.boundaryFlash = null;
        this.render();
      }
    };
    requestAnimationFrame(flashAnim);
  }

  drawBoundaryFlash() {
    if (!this.boundaryFlash) return;
    this.ctx.save();
    this.ctx.fillStyle = this.boundaryFlash.color;
    this.ctx.globalAlpha = this.boundaryFlash.alpha * 0.45;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  clearWagonWheel() {
    this.wagonWheelShots = [];
    this.render();
  }
}

window.PitchCanvasVisualizer = PitchCanvasVisualizer;
