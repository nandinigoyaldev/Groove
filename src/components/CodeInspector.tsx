import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Play } from 'lucide-react';
import { synthAudio } from '../lib/audio';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

const fileSystemData: Record<string, FileNode> = {
  'aura-weather': {
    name: 'aura-weather',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AuraWeather | Real-Time Global Weather</title>
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 90vh;
      margin: 0;
    }
    .weather-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      width: 320px;
    }
    h1 { font-size: 64px; margin: 10px 0; font-weight: 300; }
    h2 { font-size: 24px; font-weight: 500; color: #10b981; }
    p { color: #9ca3af; margin: 5px 0; }
    .btn {
      background: #10b981;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 12px;
      margin-top: 20px;
      cursor: pointer;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="weather-card">
    <div style="font-size: 50px;">🌧️</div>
    <h2>Rainy Forecast</h2>
    <p>New York City</p>
    <h1>18°C</h1>
    <p>Humidity: 84% | Wind: 12 km/h</p>
    <button class="btn" onclick="alert('Searching for forecast updates...')">Refresh Weather</button>
  </div>
</body>
</html>`,
      },
    ],
  },
  'rock-paper-scissors': {
    name: 'rock-paper-scissors',
    type: 'folder',
    children: [
      {
        name: 'game.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Earth | Cozy Tape Deck Showdown</title>
  <style>
    body { background: #08080f; color: #ef4444; font-family: sans-serif; text-align: center; }
    .btn { background: transparent; border: 2px solid #ef4444; color: #ef4444; padding: 10px 20px; }
  </style>
</head>
<body>
  <h1>EARTH CASSETTE DECK</h1>
  <button class="btn" onclick="play('rock')">✊ ROCK</button>
  <button class="btn" onclick="play('paper')">✋ PAPER</button>
  <button class="btn" onclick="play('scissors')">✌️ SCISSORS</button>
  <script>
    function play(choice) {
      alert("Exposed Choice: " + choice.toUpperCase());
    }
  </script>
</body>
</html>`,
      },
    ],
  },
  'hotel-landing': {
    name: 'hotel-landing',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Hotel Grand Horizon</title>
  <style>
    body { background: #0b0c10; color: #c5a880; font-family: serif; text-align: center; padding: 30px; }
    .card { border: 1px solid #c5a880; border-radius: 8px; padding: 40px; background: #08080c; }
    input { background: #020204; border: 1px solid #c5a880; color: white; padding: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>HOTEL RECEPTION DESK</h2>
    <input type="text" placeholder="Guest Name">
    <button onclick="alert('Access Key Card Generated!')">CHECK IN</button>
  </div>
</body>
</html>`,
      },
    ],
  },
  'paradigm-shift': {
    name: 'paradigm-shift',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Wave | Step Sequencer</title>
  <style>
    body { background: #0b0c10; color: #3b82f6; font-family: monospace; padding: 40px; }
    .grid { display: flex; gap: 8px; margin-top: 20px; }
    .pad { width: 30px; height: 30px; background: #1e2026; border: 1px solid #2d313c; }
  </style>
</head>
<body>
  <h1>WAVE // ANALOG STEP SEQUENCER</h1>
  <button onclick="alert('Beat loop started!')">START</button>
  <button onclick="alert('Stopped')">STOP</button>
  <div class="grid">
    <div class="pad"></div><div class="pad"></div><div class="pad"></div><div class="pad"></div>
  </div>
</body>
</html>`,
      },
    ],
  },
  'dice-tumbler': {
    name: 'dice-tumbler',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Crank | Mechanical Dice Tumbler</title>
  <style>
    body {
      background: #faf9f5;
      color: #451a03;
      font-family: 'Outfit', sans-serif;
      text-align: center;
      padding: 20px;
    }
    .cabinet {
      border: 8px solid #451a03;
      background: #8c3e15;
      padding: 25px;
      border-radius: 12px;
      max-width: 360px;
      margin: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .felt-lining {
      background: #064e3b;
      height: 160px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
      box-shadow: inset 0 6px 12px rgba(0,0,0,0.5);
      border: 2px solid #b45309;
    }
    .result-txt {
      font-size: 24px;
      font-weight: 800;
      color: #fbbf24;
      text-shadow: 0 0 8px rgba(251,191,36,0.4);
    }
    .crank-btn {
      background: linear-gradient(180deg, #d97706, #b45309);
      border: 1px solid #b45309;
      color: #ffffff;
      padding: 10px 24px;
      font-weight: 800;
      cursor: pointer;
      border-radius: 4px;
      text-transform: uppercase;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }
    .crank-btn:hover {
      background: linear-gradient(180deg, #f59e0b, #d97706);
    }
    .crank-btn:active {
      transform: translateY(1px);
    }
  </style>
</head>
<body>
  <div class="cabinet">
    <h3 style="color:#ffffff; letter-spacing:1px; margin:0;">CRANK MODEL T-800</h3>
    <div class="felt-lining">
      <div class="result-txt" id="display">🎲 READY TO SHAKE</div>
    </div>
    <button class="crank-btn" onclick="crankLever()">Crank Lever</button>
  </div>

  <script>
    function crankLever() {
      const display = document.getElementById("display");
      display.style.opacity = 0.5;
      display.textContent = "SHAKING...";
      setTimeout(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        display.textContent = "🎲 ROLLED: " + val;
        display.style.opacity = 1;
      }, 500);
    }
  </script>
</body>
</html>`,
      },
    ],
  },
  'pitch-control': {
    name: 'pitch-control',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Pitch | Vintage Analog Stadium Console</title>
  <style>
    body {
      background: #09120e;
      color: #faf9f5;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    }
    .stadium-deck {
      border: 6px solid #78350f;
      background: #121f18;
      padding: 20px;
      border-radius: 12px;
      max-width: 400px;
      margin: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .scorebug {
      background: #040907;
      border: 2px solid #b45309;
      color: #f59e0b;
      padding: 12px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 800;
      margin: 15px 0;
    }
    .hit-btn {
      background: linear-gradient(180deg, #059669, #047857);
      border: 1px solid #10b981;
      color: white;
      padding: 10px 24px;
      font-weight: 800;
      cursor: pointer;
      border-radius: 6px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="stadium-deck">
    <h3 style="color:#10b981; margin:0;">🏏 PITCH CONSOLE LP // 06</h3>
    <div class="scorebug" id="scoreDisplay">TARGET: 24 | SCORE: 0/0</div>
    <button class="hit-btn" onclick="strikeShot()">🏏 STRIKE SHOT</button>
  </div>

  <script>
    let runs = 0;
    function strikeShot() {
      const hit = Math.random() < 0.7 ? (Math.random() < 0.4 ? 6 : 4) : 0;
      runs += hit;
      document.getElementById("scoreDisplay").textContent = "TARGET: 24 | SCORE: " + runs + "/0 " + (hit > 0 ? " (+" + hit + " RUNS!)" : " (DOT)");
    }
  </script>
</body>
</html>`,
      },
    ],
  },
};

interface CodeInspectorProps {
  projectId: string;
  onRunCode: (code: string) => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ projectId, onRunCode }) => {
  const projectRoot = fileSystemData[projectId] || { name: 'empty', type: 'folder', children: [] };
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    [projectId]: true,
  });

  // Select initial file
  useEffect(() => {
    const defaultFile = projectRoot.children?.[0] || null;
    setSelectedFile(defaultFile);
    if (defaultFile && defaultFile.content) {
      setEditContent(defaultFile.content);
    }
  }, [projectId]);

  const toggleFolder = (path: string) => {
    synthAudio.playClick();
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleFileSelect = (file: FileNode) => {
    synthAudio.playClick();
    setSelectedFile(file);
    if (file.content) {
      setEditContent(file.content);
    }
  };

  const handleRun = () => {
    synthAudio.playClick();
    if (selectedFile) {
      // Save changes back locally to node so switching files retains edit
      selectedFile.content = editContent;
    }
    onRunCode(editContent);
  };

  const renderNode = (node: FileNode, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[currentPath];

    if (isFolder) {
      return (
        <div key={currentPath} className="file-node">
          <div
            className="file-item"
            onClick={() => toggleFolder(currentPath)}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} color="#c084fc" />
            <span>{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div style={{ paddingLeft: '8px' }}>
              {node.children.map((child) => renderNode(child, currentPath))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={currentPath}
        className={`file-item file-node ${selectedFile?.name === node.name ? 'selected' : ''}`}
        onClick={() => handleFileSelect(node)}
      >
        <span style={{ width: '14px' }} />
        <File size={14} color="#60a5fa" />
        <span>{node.name}</span>
      </div>
    );
  };

  return (
    <div className="code-inspector glass">
      <div className="inspector-sidebar">
        {renderNode(projectRoot)}
      </div>
      <div className="inspector-content">
        {selectedFile ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="inspector-header">
              <span>Editing: {selectedFile.name} (Live Sandbox)</span>
              <button className="sandbox-run-btn" onClick={handleRun}>
                <Play size={12} /> Run Code
              </button>
            </div>
            <textarea
              className="inspector-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="inspector-empty">
            Select a file to inspect and edit code.
          </div>
        )}
      </div>
    </div>
  );
};
