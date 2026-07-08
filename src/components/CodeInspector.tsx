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
  <style>
    body {
      background: #08080f;
      color: #ff007f;
      font-family: sans-serif;
      text-align: center;
      padding-top: 50px;
    }
    .btn {
      background: transparent;
      border: 2px solid #ff007f;
      color: #ff007f;
      padding: 15px 30px;
      margin: 10px;
      border-radius: 10px;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(255,0,127,0.2);
    }
    .btn:hover {
      background: #ff007f;
      color: #000;
      box-shadow: 0 0 20px #ff007f;
    }
    #result {
      font-size: 28px;
      margin-top: 30px;
      font-weight: bold;
      color: #00ffff;
    }
  </style>
</head>
<body>
  <h1>CYBERPUNK SHOWDOWN</h1>
  <button class="btn" onclick="play('rock')">✊ Rock</button>
  <button class="btn" onclick="play('paper')">✋ Paper</button>
  <button class="btn" onclick="play('scissors')">✌️ Scissors</button>
  <div id="result">Choose your move weapon!</div>

  <script>
    function play(userChoice) {
      const choices = ['rock', 'paper', 'scissors'];
      const comp = choices[Math.floor(Math.random() * 3)];
      let res = '';
      if (userChoice === comp) res = "IT'S A TIE VORTEX";
      else if (
        (userChoice === 'rock' && comp === 'scissors') ||
        (userChoice === 'paper' && comp === 'rock') ||
        (userChoice === 'scissors' && comp === 'paper')
      ) {
        res = "YOU SHATTERED THE COMPUTER!";
      } else {
        res = "COMPUTER HACKED YOUR SYSTEM!";
      }
      document.getElementById('result').innerText = 'User: ' + userChoice.toUpperCase() + ' vs Comp: ' + comp.toUpperCase() + ' \\n ' + res;
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
  <style>
    body {
      background: #0f0801;
      color: #f59e0b;
      font-family: serif;
      text-align: center;
      padding: 40px;
    }
    .hero {
      border: 1px solid rgba(245, 158, 11, 0.2);
      padding: 60px;
      background: rgba(245, 158, 11, 0.02);
      border-radius: 8px;
    }
    h1 { font-size: 48px; letter-spacing: 2px; }
    p { font-size: 18px; color: #d97706; }
    .nav-btn {
      background: #f59e0b;
      color: #000;
      padding: 10px 30px;
      border: none;
      cursor: pointer;
      font-weight: bold;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>VALENTINO LUXURY SUITES</h1>
    <p>Escape to high mountain luxury and serene heights.</p>
    <button class="nav-btn" onclick="alert('Booking Suite Request Received!')">Reserve A Suite</button>
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
  <style>
    body {
      background: #020813;
      color: #3b82f6;
      font-family: monospace;
      padding: 50px;
    }
    .grid {
      border-left: 4px solid #3b82f6;
      padding-left: 20px;
    }
    h1 { font-size: 40px; }
    .btn {
      background: #3b82f6;
      border: none;
      color: black;
      padding: 12px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="grid">
    <h1>PARADIGM SHIFT TEMPLATE</h1>
    <p>Exploring new dimensions in responsive grids.</p>
    <button class="btn" onclick="alert('Paradigm shift initialized!')">Launch Concept</button>
  </div>
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
