import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  type: 'rain' | 'sparkles' | 'grid' | 'lasers';
  color: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ type, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle Classes
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const particleCount = type === 'rain' ? 80 : type === 'sparkles' ? 60 : 40;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 4 + 1,
          speedY: type === 'rain' ? Math.random() * 5 + 4 : type === 'sparkles' ? -(Math.random() * 1.5 + 0.5) : 0,
          speedX: type === 'rain' ? (Math.random() * 0.5 - 0.25) : (Math.random() * 1 - 0.5),
          opacity: Math.random() * 0.5 + 0.2,
          color: color,
        });
      }
    };

    initParticles();

    // Laser properties
    let laserY = 0;
    let laserSpeed = 2;

    const drawGrid = () => {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      
      const gridSpacing = 40;
      const time = Date.now() * 0.02;
      const offset = time % gridSpacing;

      // Draw vertical perspective grid
      const centerX = width / 2;
      for (let x = -gridSpacing * 20; x < gridSpacing * 20; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(centerX + x, height);
        ctx.lineTo(centerX + x * 0.1, height * 0.4);
        ctx.stroke();
      }

      // Draw horizontal lines moving down
      for (let y = height * 0.4; y < height; y += gridSpacing) {
        const ratio = (y - height * 0.4) / (height * 0.4);
        const adjustedY = y + (offset * ratio);
        ctx.beginPath();
        ctx.moveTo(0, adjustedY);
        ctx.lineTo(width, adjustedY);
        ctx.stroke();
      }
    };

    const drawLasers = () => {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;

      ctx.beginPath();
      ctx.moveTo(0, laserY);
      ctx.lineTo(width, laserY);
      ctx.stroke();

      ctx.shadowBlur = 0; // reset shadow
    };

    const drawParticles = () => {
      if (!ctx) return;
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    const updateParticles = () => {
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset particles out of bounds
        if (type === 'rain' && p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        } else if (type === 'sparkles' && p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });
    };

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (type === 'grid') {
        drawGrid();
      } else if (type === 'lasers') {
        drawLasers();
        laserY += laserSpeed;
        if (laserY > height || laserY < 0) {
          laserSpeed = -laserSpeed;
        }
      } else {
        drawParticles();
        updateParticles();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'opacity 1s ease',
      }}
    />
  );
};
