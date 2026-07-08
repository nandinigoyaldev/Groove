import { useState, useEffect } from 'react';
import type { Project } from './types';
import { GalleryScroll } from './components/GalleryScroll';
import { ParticleSystem } from './components/ParticleSystem';
import { CodeInspector } from './components/CodeInspector';
import { GuestbookDrawer } from './components/GuestbookDrawer';
import { synthAudio } from './lib/audio';
import * as Icons from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: 'aura-weather',
    title: 'AuraWeather',
    description: 'A beautiful real-time weather application showing global forecast details.',
    longDescription: 'Get real-time, accurate weather updates for any city worldwide including temperature, humidity, wind speed & more. Styled with dynamic components.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Weather API'],
    themeColor: '#10b981',
    gradient: 'radial-gradient(circle at 50% 50%, #062f21 0%, #031410 100%)',
    particleType: 'rain',
    url: '/projects/aura-weather/index.html',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    description: 'Play rock, paper, scissors against the computer with scoreboard tracking.',
    longDescription: 'A classic game built with beautiful buttons, sound logic, randomized computer choices, and active visual state indicators.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Local Storage'],
    themeColor: '#ef4444',
    gradient: 'radial-gradient(circle at 50% 50%, #2a080c 0%, #0d0204 100%)',
    particleType: 'grid',
    url: '/projects/rock-paper-scissors/game.html',
  },
  {
    id: 'hotel-landing',
    title: 'My Hotels Landing',
    description: 'An elegant mountainside luxury hotel showcase and landing page template.',
    longDescription: 'Escape to mountain heights. High-fidelity layouts, smooth responsive scrolling pages, and aesthetic room booking showcase design.',
    tech: ['HTML', 'SASS', 'JavaScript', 'Google Fonts'],
    themeColor: '#f59e0b',
    gradient: 'radial-gradient(circle at 50% 50%, #2d1a04 0%, #0f0801 100%)',
    particleType: 'sparkles',
    url: '/projects/hotel-landing/index.html',
  },
  {
    id: 'paradigm-shift',
    title: 'Paradigm Shift',
    description: 'A futuristic interactive layout shifting standard perspectives.',
    longDescription: 'Modern web layout template inspired by innovative shifts. Integrates sleek variables and dynamic parallax design components.',
    tech: ['HTML', 'SASS', 'JavaScript', 'Responsive Grid'],
    themeColor: '#3b82f6',
    gradient: 'radial-gradient(circle at 50% 50%, #0a192f 0%, #020813 100%)',
    particleType: 'lasers',
    url: '/projects/paradigm-shift/index.html',
  },
];

export default function App() {
  const [activeProject, setActiveProject] = useState<Project>(PROJECTS[0]);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Set initial audio state and watch active project changes
  useEffect(() => {
    synthAudio.setAmbiance(activeProject.particleType);
  }, [activeProject]);

  const handleActiveProjectChange = (proj: Project) => {
    if (activeProject.id !== proj.id) {
      synthAudio.playHover();
      setActiveProject(proj);
    }
  };

  const handleOpenProject = (proj: Project) => {
    synthAudio.playClick();
    setOpenProject(proj);
    setSandboxCode(null); // Reset custom sandbox code
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    synthAudio.toggleMute(newState);
    if (!newState) {
      synthAudio.setAmbiance(activeProject.particleType);
    }
  };

  const handleRunCode = (code: string) => {
    setSandboxCode(code);
  };

  // Tracking horizontal scroll way progress
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.gallery-scroll-container');
      if (!container) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      
      const percentage = (container.scrollLeft / maxScroll) * 100;
      setScrollProgress(percentage);
    };

    const container = document.querySelector('.gallery-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="gallery-app"
      style={{
        background: activeProject.gradient,
      }}
    >
      {/* Dynamic Background Particle System */}
      <ParticleSystem
        type={activeProject.particleType}
        color={activeProject.themeColor}
      />

      {/* Navigation Header */}
      <nav className="gallery-nav">
        <h1 className="nav-brand">
          <Icons.RotateCw size={24} /> Vortex Gallery
        </h1>
        <div className="nav-links">
          <button className="nav-btn" onClick={toggleMute}>
            {isMuted ? <Icons.VolumeX size={16} /> : <Icons.Volume2 size={16} />}
            {isMuted ? 'Muted' : 'Sound Synth'}
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              synthAudio.playClick();
              setIsGuestbookOpen(true);
            }}
          >
            <Icons.BookOpen size={16} /> Guestbook
          </button>
        </div>
      </nav>

      {/* Showcase Scrollway */}
      <GalleryScroll
        projects={PROJECTS}
        onActiveProjectChange={handleActiveProjectChange}
        onOpenProject={handleOpenProject}
      />

      {/* Scroll indicator */}
      <div className="scroll-indicator-container">
        <div
          className="scroll-indicator-bar"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: activeProject.themeColor,
            boxShadow: `0 0 8px ${activeProject.themeColor}`,
          }}
        />
      </div>

      {/* Fullscreen sandboxed app preview frame */}
      {openProject && (
        <div className="fullscreen-app-overlay">
          <div className="overlay-navbar">
            <span className="overlay-title">{openProject.title} (Live Sandbox)</span>
            <div className="overlay-controls">
              <button
                className={`overlay-btn ${showCode ? 'active' : ''}`}
                onClick={() => {
                  synthAudio.playClick();
                  setShowCode(!showCode);
                }}
              >
                <Icons.Code size={16} /> Edit Sandbox Code
              </button>
              <button
                className="overlay-btn overlay-close"
                onClick={() => {
                  synthAudio.playClick();
                  setOpenProject(null);
                  setShowCode(false);
                }}
              >
                <Icons.X size={16} /> Close
              </button>
            </div>
          </div>
          <div className="overlay-body">
            <iframe
              title={openProject.title}
              src={sandboxCode ? undefined : openProject.url}
              srcDoc={sandboxCode || undefined}
              className="overlay-iframe"
              sandbox="allow-scripts allow-same-origin"
            />
            {showCode && (
              <CodeInspector
                projectId={openProject.id}
                onRunCode={handleRunCode}
              />
            )}
          </div>
        </div>
      )}

      {/* Guestbook Drawer */}
      <GuestbookDrawer
        isOpen={isGuestbookOpen}
        onClose={() => {
          synthAudio.playClick();
          setIsGuestbookOpen(false);
        }}
      />
    </div>
  );
}
