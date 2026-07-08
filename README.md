# Vortex Gallery 🚀🌌

Welcome to **Vortex Gallery**—an immersive, 3D horizontal scrolling virtual showcase designed to present web projects in a high-fidelity creative museum track.

Instead of browsing standard directories, visitors scroll through floating glassmorphic panels. As they move, the background environment and particle systems dynamically morph to match the brand of the selected project (e.g., falling rain for a weather app, glowing neon scanlines for arcade games).

---

## ✨ Advanced Features

- 🏎️ **Immersive Horizontal Scrollway**: Smooth horizontal navigation that translates vertical scroll wheel inputs and handles mouse-drag panning, accompanied by a bottom glowing progress indicator.
- 🎭 **Dynamic Background Morphing**: The background colors, gradients, and overlay particle systems adapt smoothly:
  - **AuraWeather**: Blue-green gradients with rain drops.
  - **Rock Paper Scissors**: Red neon grids with pixel grids.
  - **Hotel Landing**: Golden elegant floating sparkles.
  - **Paradigm Shift**: Futuristic scanning laser lines.
- 🎛️ **Web Audio API Synth Engine**: Procedurally synthesizes matching background hums and satisfying interface sound effects (clicks, hovers) without downloading external audio files.
- 🔎 **Cinematic Zoom Expansion**: Clicking a project triggers a zoom-in animation that expands the preview to full-viewport size.
- 💻 **Live Sandbox & Editor**: Split-screen view inside the preview overlay allows viewing the folder directory structure and editing files live in a text editor to hot-reload changes on the fly!
- 💬 **Full-Stack Guestbook Drawer**: Sign in and leave messages. Persists comments to a local database when running the backend, or falls back to browser `localStorage` in static environments (making it **GitHub Pages friendly**).

---

## 🚀 Showcased Projects (Overhauled UIs)

1. ☀️ **AuraWeather**: A premium Apple Weather-style frosted glass widget featuring detailed metrics and search.
2. ✊ **Rock-Paper-Scissors**: An 80s cyberpunk retro-arcade cabinet emulator displaying scores and live play outcomes.
3. 🏨 **My Hotels**: A luxury hotel room catalog and reservation landing page showcasing dark gold hues and serif typography.
4. 🧭 **Paradigm Shift**: A minimal sci-fi grid framework showcase exploring vector lines and status blocks.

---

## 🛠️ Installation & Run Guide

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nandinigoyaldev/100-projects.git
   cd 100-projects
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   - For frontend only:
     ```bash
     npm run dev
     ```
   - For backend & database guestbook support:
     ```bash
     npm run server
     ```

4. **Build for production**:
   ```bash
   npm run build
   ```
