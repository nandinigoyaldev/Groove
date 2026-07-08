import { useState, useEffect } from 'react';
import type { Project } from './types';
import { GalleryScroll } from './components/GalleryScroll';
import { CafeWidgets } from './components/CafeWidgets';
import { CodeInspector } from './components/CodeInspector';
import { GuestbookDiary } from './components/GuestbookDiary';
import { PolaroidCamera } from './components/PolaroidCamera';
import { synthAudio } from './lib/audio';
import * as Icons from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: 'aura-weather',
    title: 'AuraWeather',
    description: 'A beautiful real-time weather application showing global forecast details.',
    longDescription: 'Get real-time, accurate weather updates for any city worldwide including temperature, humidity, wind speed & more. Styled with dynamic components.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Weather API'],
    themeColor: '#047857',
    gradient: '#faf9f5', // Cozy off-white base
    particleType: 'rain',
    url: '/projects/aura-weather/index.html',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    description: 'Play rock, paper, scissors against the computer with scoreboard tracking.',
    longDescription: 'A classic game built with beautiful buttons, sound logic, randomized computer choices, and active visual state indicators.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Local Storage'],
    themeColor: '#be123c',
    gradient: '#fcf6f6', // Cozy soft rose base
    particleType: 'grid',
    url: '/projects/rock-paper-scissors/game.html',
  },
  {
    id: 'hotel-landing',
    title: 'My Hotels Landing',
    description: 'An elegant mountainside luxury hotel showcase and landing page template.',
    longDescription: 'Escape to mountain heights. High-fidelity layouts, smooth responsive scrolling pages, and aesthetic room booking showcase design.',
    tech: ['HTML', 'SASS', 'JavaScript', 'Google Fonts'],
    themeColor: '#b45309',
    gradient: '#fdfaf2', // Cozy warm wheat base
    particleType: 'sparkles',
    url: '/projects/hotel-landing/index.html',
  },
  {
    id: 'paradigm-shift',
    title: 'Paradigm Shift',
    description: 'A futuristic interactive layout shifting standard perspectives.',
    longDescription: 'Modern web layout template inspired by innovative shifts. Integrates sleek variables and dynamic parallax design components.',
    tech: ['HTML', 'SASS', 'JavaScript', 'Responsive Grid'],
    themeColor: '#0369a1',
    gradient: '#f5fafd', // Cozy soft slate blue base
    particleType: 'lasers',
    url: '/projects/paradigm-shift/index.html',
  },
];

export default function App() {
  const [activeProject, setActiveProject] = useState<Project>(PROJECTS[0]);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleActiveProjectChange = (proj: Project) => {
    if (activeProject.id !== proj.id) {
      synthAudio.playHover();
      setActiveProject(proj);
    }
  };

  const handleOpenProject = (proj: Project) => {
    synthAudio.playClick();
    setOpenProject(proj);
    setSandboxCode(null);
  };

  const handleRunCode = (code: string) => {
    setSandboxCode(code);
  };

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
      className="gallery-app cozy-theme"
      style={{
        backgroundColor: activeProject.gradient,
      }}
    >
      {/* Dynamic Background Board Overlay */}
      <div className="board-overlay-grid" />

      {/* Cozy Header Nav */}
      <nav className="gallery-nav">
        <h1 className="nav-brand">
          <Icons.Coffee size={24} color="#b45309" /> Cozy Café Showcase
        </h1>
        <div className="nav-links">
          <button
            className="nav-btn"
            onClick={() => {
              synthAudio.playClick();
              setIsDiaryOpen(true);
            }}
          >
            <Icons.BookOpen size={16} /> Guestbook Diary
          </button>
        </div>
      </nav>

      {/* Main Board Scrollway */}
      <GalleryScroll
        projects={PROJECTS}
        onActiveProjectChange={handleActiveProjectChange}
        onOpenProject={handleOpenProject}
      />

      {/* Steaming Coffee & Lofi Radio Widget Dock & Snapshot Camera */}
      <CafeWidgets />
      <PolaroidCamera activeProject={activeProject} />

      {/* Scroll progress dial/line */}
      <div className="scroll-indicator-container">
        <div
          className="scroll-indicator-bar"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: activeProject.themeColor,
            boxShadow: `0 0 8px ${activeProject.themeColor}55`,
          }}
        />
      </div>

      {/* Cinema Overlay */}
      {openProject && (
        <div className="fullscreen-app-overlay cozy-layout">
          <div className="overlay-navbar">
            <span className="overlay-title">
              <Icons.Compass size={18} /> {openProject.title} (Live Sandbox)
            </span>
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

      {/* Guestbook Diary */}
      <GuestbookDiary
        isOpen={isDiaryOpen}
        onClose={() => {
          synthAudio.playClick();
          setIsDiaryOpen(false);
        }}
      />
    </div>
  );
}
