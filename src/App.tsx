import { useState } from 'react';
import type { Project } from './types';
import { CameraViewfinder } from './components/CameraViewfinder';
import { CodeInspector } from './components/CodeInspector';
import { FilmGuestbook } from './components/FilmGuestbook';
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
  const [isFilmOpen, setIsFilmOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

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

  return (
    <div
      className="gallery-app aperture-theme"
      style={{
        background: activeProject.gradient,
      }}
    >
      {/* Background Grid Overlay */}
      <div className="board-overlay-grid" />

      {/* Navigation Header */}
      <nav className="gallery-nav">
        <h1 className="nav-brand">
          <Icons.Camera size={24} color="#3b82f6" /> Aperture Showcase
        </h1>
        <div className="nav-links">
          <button
            className="nav-btn"
            onClick={() => {
              synthAudio.playClick();
              setIsFilmOpen(true);
            }}
          >
            <Icons.Film size={16} /> Guest Film Roll
          </button>
        </div>
      </nav>

      {/* Camera Viewfinder System */}
      <main className="camera-viewfinder-main">
        <CameraViewfinder
          projects={PROJECTS}
          activeProject={activeProject}
          onActiveProjectChange={handleActiveProjectChange}
          onOpenProject={handleOpenProject}
        />
      </main>

      {/* Fullscreen sandboxed app preview frame */}
      {openProject && (
        <div className="fullscreen-app-overlay">
          <div className="overlay-navbar">
            <span className="overlay-title">
              <Icons.Eye size={16} /> Viewfinder Live // {openProject.title}
            </span>
            <div className="overlay-controls">
              <button
                className={`overlay-btn ${showCode ? 'active' : ''}`}
                onClick={() => {
                  synthAudio.playClick();
                  setShowCode(!showCode);
                }}
              >
                <Icons.Code size={16} /> Darkroom Editor
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

      {/* Film Guestbook */}
      <FilmGuestbook
        isOpen={isFilmOpen}
        onClose={() => {
          synthAudio.playClick();
          setIsFilmOpen(false);
        }}
      />
    </div>
  );
}
