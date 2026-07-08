import { useState } from 'react';
import type { Project } from './types';
import { PinterestGrid } from './components/PinterestGrid';
import { CodeInspector } from './components/CodeInspector';
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
    gradient: '#faf9f5', // Warm cream background
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
    gradient: '#faf9f5',
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
    gradient: '#faf9f5',
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
    gradient: '#faf9f5',
    particleType: 'lasers',
    url: '/projects/paradigm-shift/index.html',
  },
];

export default function App() {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  const handleOpenProject = (proj: Project) => {
    synthAudio.playClick();
    setOpenProject(proj);
    setSandboxCode(null);
  };

  const handleRunCode = (code: string) => {
    setSandboxCode(code);
  };

  return (
    <div className="gallery-app pinetab-theme">
      {/* Background Grid Overlay */}
      <div className="board-overlay-grid" />

      {/* Navigation Header */}
      <nav className="gallery-nav">
        <div className="nav-left">
          <h1 className="nav-brand">
            <Icons.Heart size={20} color="#e11d48" fill="#e11d48" /> Pinetab
          </h1>
          <span className="nav-tagline">Visual Board</span>
        </div>
        <div className="nav-right">
          <span className="nav-credit">Curated by @nandini</span>
        </div>
      </nav>

      {/* Pinterest Masonry Grid */}
      <main className="pinetab-main">
        <PinterestGrid
          projects={PROJECTS}
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
                <Icons.Code size={16} /> Editor Sandbox
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
    </div>
  );
}
