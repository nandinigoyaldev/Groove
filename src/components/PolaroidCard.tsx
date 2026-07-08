import React, { useRef, useState } from 'react';
import type { Project } from '../types';
import * as Icons from 'lucide-react';
import { synthAudio } from '../lib/audio';

interface PolaroidCardProps {
  project: Project;
  onOpen: () => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ project, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 6;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 6;

    setTransform(`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const getHandwrittenTitle = (id: string) => {
    switch (id) {
      case 'aura-weather': return "Miller's Clouds ☁️";
      case 'rock-paper-scissors': return "Neon Arcade ✊";
      case 'hotel-landing': return "Alpina Postcard 🏨";
      case 'paradigm-shift': return "Abstract Grid 🧭";
      default: return project.title;
    }
  };

  const getThemeGradient = (id: string) => {
    switch (id) {
      case 'aura-weather': return 'linear-gradient(135deg, #a7f3d0 0%, #047857 100%)';
      case 'rock-paper-scissors': return 'linear-gradient(135deg, #fecdd3 0%, #be123c 100%)';
      case 'hotel-landing': return 'linear-gradient(135deg, #fde68a 0%, #b45309 100%)';
      case 'paradigm-shift': return 'linear-gradient(135deg, #bae6fd 0%, #0369a1 100%)';
      default: return 'linear-gradient(135deg, #e2e8f0 0%, #475569 100%)';
    }
  };

  const getProjectIcon = (id: string) => {
    switch (id) {
      case 'aura-weather': return <Icons.CloudSun size={36} color="white" />;
      case 'rock-paper-scissors': return <Icons.Gamepad2 size={36} color="white" />;
      case 'hotel-landing': return <Icons.Hotel size={36} color="white" />;
      case 'paradigm-shift': return <Icons.Compass size={36} color="white" />;
      default: return <Icons.HelpCircle size={36} color="white" />;
    }
  };

  return (
    <div
      ref={cardRef}
      className="polaroid-card"
      style={{
        transform,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => synthAudio.playHover()}
    >
      {/* Decorative Tape */}
      <div className="polaroid-tape" />

      {/* Picture Frame */}
      <div
        className="polaroid-photo"
        style={{
          background: getThemeGradient(project.id),
        }}
      >
        <div className="photo-glow" />
        <div className="photo-icon">{getProjectIcon(project.id)}</div>
      </div>

      {/* Polaroid Caption */}
      <div className="polaroid-caption">
        <h3 className="caption-title">{getHandwrittenTitle(project.id)}</h3>
        <p className="caption-desc">{project.description}</p>
        
        <div className="caption-tech">
          {project.tech.map((t, idx) => (
            <span key={idx} className="tech-sticker">#{t.toLowerCase().replace(' ', '')}</span>
          ))}
        </div>

        <button className="polaroid-btn" onClick={onOpen}>
          <Icons.ExternalLink size={13} /> View Log
        </button>
      </div>
    </div>
  );
};
