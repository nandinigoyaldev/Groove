import React, { useRef, useState } from 'react';
import type { Project } from '../types';
import * as Icons from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    // Calculate rotation degree based on cursor position (-10 to 10 deg)
    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 10;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 10;

    setTransform(`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const getProjectIcon = (id: string) => {
    switch (id) {
      case 'aura-weather': return <Icons.CloudSun size={32} color="#10b981" />;
      case 'rock-paper-scissors': return <Icons.Gamepad2 size={32} color="#ef4444" />;
      case 'hotel-landing': return <Icons.Hotel size={32} color="#f59e0b" />;
      case 'paradigm-shift': return <Icons.Compass size={32} color="#3b82f6" />;
      default: return <Icons.HelpCircle size={32} />;
    }
  };

  return (
    <div
      ref={cardRef}
      className="gallery-card glass"
      style={{
        transform,
        transition: 'transform 0.15s ease-out, border-color 0.3s ease',
        borderColor: `rgba(255, 255, 255, 0.1)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-badge" style={{ backgroundColor: project.themeColor }}>
        {project.id === 'rock-paper-scissors' ? 'Playable Game' : 'Web Showcase'}
      </div>
      <div className="card-icon-container">
        {getProjectIcon(project.id)}
      </div>
      <h2 className="card-title" style={{ textShadow: `0 0 10px ${project.themeColor}33` }}>
        {project.title}
      </h2>
      <p className="card-desc">{project.description}</p>
      
      <div className="card-tech-list">
        {project.tech.map((t, idx) => (
          <span key={idx} className="tech-tag">{t}</span>
        ))}
      </div>

      <button
        onClick={onOpen}
        className="card-btn"
        style={{
          background: `linear-gradient(135deg, ${project.themeColor} 0%, ${project.themeColor}88 100%)`,
          boxShadow: `0 4px 15px ${project.themeColor}33`,
        }}
      >
        <Icons.Maximize2 size={16} /> Open Project
      </button>
    </div>
  );
};
