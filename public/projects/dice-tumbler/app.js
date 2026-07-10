// Crank Mechanical Dice Tumbler Controller

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. Web Audio Synthesizer (Zero-Media-Dependency Audio Engine)
  // ==========================================================================
  const audio = {
    ctx: null,
    enabled: localStorage.getItem("crank.sound") !== "off",

    init() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    playClick() {
      if (!this.enabled) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    },

    playWinding() {
      if (!this.enabled) return;
      this.init();
      // Multi-clicks for crank lever winding
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const time = now + i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(200 - i * 30, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.04);
      }
    },

    playRattle() {
      if (!this.enabled) return;
      this.init();
      const now = this.ctx.currentTime;
      // Synthesize rolling wooden shaker noise
      for (let i = 0; i < 8; i++) {
        const time = now + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        // randomize frequency slightly for organic block sounds
        osc.frequency.setValueAtTime(100 + Math.random() * 80, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
      }
    },

    playThud() {
      if (!this.enabled) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  };

  // ==========================================================================
  // 2. Core State
  // ==========================================================================
  const state = {
    pool: {}, // Format: { "d6": 2, "d20": 1 }
    customDecks: JSON.parse(localStorage.getItem("crank.customDecks")) || [
      { name: "Coin Flip", labels: ["Heads", "Tails"] },
      { name: "Lunch Pick", labels: ["Pizza", "Salad", "Tacos", "Burgers", "Sushi", "Pasta"] },
      { name: "Yes No Maybe", labels: ["Definitely Yes", "Absolutely No", "Ask Later", "Try Again"] }
    ],
    selectedCustomDeck: null,
    isRolling: false,
    ledger: JSON.parse(localStorage.getItem("crank.ledger")) || [],
    counts: JSON.parse(localStorage.getItem("crank.counts")) || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  };

  // 3D rotations corresponding to D6 face landing on top
  const faceRotations = {
    1: { x: 0,   y: 0 },
    2: { x: -90, y: 0 },
    3: { x: 0,   y: -90 },
    4: { x: 0,   y: 90 },
    5: { x: 90,  y: 0 },
    6: { x: 0,   y: 180 }
  };

  // DOM Elements mapping
  const elements = {
    soundToggleBtn: document.getElementById("sound-toggle-btn"),
    viewport: document.getElementById("roll-arena-viewport"),
    arenaIntro: document.getElementById("arena-intro"),
    clearPoolBtn: document.getElementById("clear-pool-btn"),
    poolViewer: document.getElementById("pool-viewer-content"),
    crankHousing: document.getElementById("crank-housing"),
    crankArm: document.getElementById("crank-shaft"), // Crank pivot
    diceSkinSelect: document.getElementById("dice-skin-select"),
    customDiceSelect: document.getElementById("custom-dice-select"),
    deleteDeckBtn: document.getElementById("delete-deck-btn"),
    customDieForm: document.getElementById("custom-die-form"),
    newDieName: document.getElementById("new-die-name"),
    labelsContainer: document.getElementById("labels-inputs-container"),
    addLabelRowBtn: document.getElementById("add-label-row-btn"),
    creatorErrorMsg: document.getElementById("creator-error-msg"),
    resetAnalyticsBtn: document.getElementById("reset-analytics-btn"),
    chartWrapper: document.getElementById("distribution-chart-wrapper"),
    clearLedgerBtn: document.getElementById("clear-ledger-btn"),
    ledgerRows: document.getElementById("ledger-rows"),
    metricTotal: document.getElementById("metric-total"),
    metricAverage: document.getElementById("metric-average"),
    metricHighest: document.getElementById("metric-highest"),
    metricLowest: document.getElementById("metric-lowest"),
    particleLayer: document.getElementById("arena-particle-layer")
  };

  // ==========================================================================
  // 3. Tab Navigation Controller
  // ==========================================================================
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {
      audio.playClick();
      const tabId = button.getAttribute("data-tab");
      
      // Toggle tabs
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      
      // Toggle panes
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      document.getElementById(`tab-${tabId}`).classList.add("active");
    });
  });

  // ==========================================================================
  // 4. Sound Engine UI Toggle
  // ==========================================================================
  elements.soundToggleBtn.addEventListener("click", () => {
    audio.enabled = !audio.enabled;
    localStorage.setItem("crank.sound", audio.enabled ? "on" : "off");
    elements.soundToggleBtn.querySelector(".btn-icon").textContent = audio.enabled ? "🔊" : "🔇";
    audio.playClick();
  });
  // Initial state check
  elements.soundToggleBtn.querySelector(".btn-icon").textContent = audio.enabled ? "🔊" : "🔇";

  // ==========================================================================
  // 5. Dice Tray Manager
  // ==========================================================================
  document.querySelectorAll(".slot-btn").forEach(button => {
    button.addEventListener("click", () => {
      audio.playClick();
      const dieType = button.getAttribute("data-die");
      addDieToPool(dieType);
    });
  });

  elements.clearPoolBtn.addEventListener("click", () => {
    audio.playClick();
    clearPool();
  });

  function addDieToPool(type) {
    if (state.isRolling) return;
    
    // Clear custom deck if loaded (cannot mix standard dice and custom text decks)
    if (state.selectedCustomDeck) {
      state.selectedCustomDeck = null;
      elements.customDiceSelect.value = "";
      elements.deleteDeckBtn.disabled = true;
    }

    // Count currently loaded dice (max 10)
    const currentTotal = Object.values(state.pool).reduce((a, b) => a + b, 0);
    if (currentTotal >= 10) {
      audio.playClick();
      return; // Cap limit
    }

    state.pool[type] = (state.pool[type] || 0) + 1;
    updatePoolUI();
  }

  function clearPool() {
    state.pool = {};
    state.selectedCustomDeck = null;
    elements.customDiceSelect.value = "";
    elements.deleteDeckBtn.disabled = true;
    updatePoolUI();
  }

  function updatePoolUI() {
    const viewer = elements.poolViewer;
    viewer.innerHTML = "";
    const types = Object.keys(state.pool);

    if (state.selectedCustomDeck) {
      viewer.innerHTML = `
        <div class="pool-die-tag">
          <span>DECK: ${state.selectedCustomDeck.name.toUpperCase()}</span>
          <span class="remove-die-btn">&times;</span>
        </div>
      `;
      viewer.querySelector(".remove-die-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        clearPool();
      });
      elements.clearPoolBtn.disabled = false;
      return;
    }

    if (types.length === 0) {
      viewer.innerHTML = `<span class="pool-empty-msg">Shaker is empty. Click slots on right panel to add dice.</span>`;
      elements.clearPoolBtn.disabled = true;
      return;
    }

    elements.clearPoolBtn.disabled = false;

    types.forEach(type => {
      const count = state.pool[type];
      for (let i = 0; i < count; i++) {
        const tag = document.createElement("span");
        tag.className = "pool-die-tag";
        tag.innerHTML = `
          <span>${type.toUpperCase()}</span>
          <span class="remove-die-btn">&times;</span>
        `;
        tag.querySelector(".remove-die-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          audio.playClick();
          state.pool[type] -= 1;
          if (state.pool[type] <= 0) {
            delete state.pool[type];
          }
          updatePoolUI();
        });
        viewer.appendChild(tag);
      }
    });
  }

  // ==========================================================================
  // 6. Custom Dice Decks Manager
  // ==========================================================================
  function populateDecksSelect() {
    const select = elements.customDiceSelect;
    select.innerHTML = '<option value="">-- No custom deck loaded --</option>';
    state.customDecks.forEach(deck => {
      const opt = document.createElement("option");
      opt.value = deck.name;
      opt.textContent = deck.name;
      select.appendChild(opt);
    });

    if (state.selectedCustomDeck) {
      select.value = state.selectedCustomDeck.name;
      elements.deleteDeckBtn.disabled = false;
    } else {
      elements.deleteDeckBtn.disabled = true;
    }
  }

  elements.customDiceSelect.addEventListener("change", (e) => {
    audio.playClick();
    const val = e.target.value;
    if (!val) {
      state.selectedCustomDeck = null;
      elements.deleteDeckBtn.disabled = true;
      updatePoolUI();
      return;
    }

    const deck = state.customDecks.find(d => d.name === val);
    if (deck) {
      state.selectedCustomDeck = deck;
      state.pool = {}; // Clear standard pool
      elements.deleteDeckBtn.disabled = false;
      updatePoolUI();
    }
  });

  elements.deleteDeckBtn.addEventListener("click", () => {
    if (!state.selectedCustomDeck) return;
    const name = state.selectedCustomDeck.name;
    if (confirm(`Do you wish to delete the custom deck "${name}"?`)) {
      audio.playClick();
      state.customDecks = state.customDecks.filter(d => d.name !== name);
      localStorage.setItem("crank.customDecks", JSON.stringify(state.customDecks));
      state.selectedCustomDeck = null;
      populateDecksSelect();
      updatePoolUI();
    }
  });

  // Dynamic input row adder in Creator
  let optionIndexCount = 2;
  elements.addLabelRowBtn.addEventListener("click", () => {
    audio.playClick();
    const list = elements.labelsContainer;
    const currentRows = list.querySelectorAll(".label-input-row").length;
    if (currentRows >= 6) return;

    optionIndexCount += 1;
    let roman = "III";
    if (optionIndexCount === 4) roman = "IV";
    else if (optionIndexCount === 5) roman = "V";
    else if (optionIndexCount === 6) roman = "VI";

    const row = document.createElement("div");
    row.className = "label-input-row";
    row.innerHTML = `
      <span class="label-index">${roman}</span>
      <input type="text" class="brass-input face-label-input" placeholder="e.g. Option ${optionIndexCount}" required maxlength="15">
    `;
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  });

  // Save/submit custom die deck
  elements.customDieForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = elements.newDieName.value.trim();
    const inputs = elements.labelsContainer.querySelectorAll(".face-label-input");
    const labels = [];
    
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) labels.push(val);
    });

    const errorSpan = elements.creatorErrorMsg;

    if (!name) {
      errorSpan.textContent = "Identifier is required.";
      errorSpan.style.display = "inline";
      return;
    }

    if (labels.length < 2) {
      errorSpan.textContent = "Provide at least 2 option faces.";
      errorSpan.style.display = "inline";
      return;
    }

    // Check duplicate
    if (state.customDecks.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      errorSpan.textContent = "A deck with this name already exists.";
      errorSpan.style.display = "inline";
      return;
    }

    audio.playClick();
    errorSpan.style.display = "none";
    
    // Save to state
    const newDeck = { name, labels };
    state.customDecks.push(newDeck);
    localStorage.setItem("crank.customDecks", JSON.stringify(state.customDecks));

    // Reset Form
    elements.newDieName.value = "";
    elements.labelsContainer.innerHTML = `
      <div class="label-input-row">
        <span class="label-index">I</span>
        <input type="text" class="brass-input face-label-input" placeholder="e.g. Pizza" required maxlength="15">
      </div>
      <div class="label-input-row">
        <span class="label-index">II</span>
        <input type="text" class="brass-input face-label-input" placeholder="e.g. Salad" required maxlength="15">
      </div>
    `;
    optionIndexCount = 2;

    // Load newly created deck
    state.selectedCustomDeck = newDeck;
    state.pool = {};
    populateDecksSelect();
    updatePoolUI();
    
    // Switch to tab custom decks select
    alert(`Deck "${name}" successfully compiled and loaded into your Shaker!`);
  });

  // ==========================================================================
  // 7. Mechanical Crank Roll Lever Mechanism
  // ==========================================================================
  elements.crankHousing.addEventListener("click", () => {
    if (state.isRolling) return;

    // Verify if we have any active dice
    const hasPool = Object.keys(state.pool).length > 0;
    const hasCustom = !!state.selectedCustomDeck;

    if (!hasPool && !hasCustom) {
      // Shaker cup is empty
      audio.playClick();
      elements.viewport.innerHTML = `
        <div class="felt-grid-overlay"></div>
        <div class="shaker-intro text-neon-pink">
          <span class="shaker-icon" style="font-size:2.5rem;">⚠️</span>
          <h3 style="color:#f87171">Shaker is Empty</h3>
          <p>Please load dice slots or custom decks before cranking the lever.</p>
        </div>
      `;
      return;
    }

    triggerCrankPull();
  });

  function triggerCrankPull() {
    state.isRolling = true;
    audio.playWinding();
    
    // Animate physical lever pulling down
    const lever = document.getElementById("crank-shaft");
    lever.classList.remove("releasing");
    lever.classList.add("pulling");

    setTimeout(() => {
      // Release lever - spring back
      lever.classList.remove("pulling");
      lever.classList.add("releasing");

      // Shake the felt container chamber
      elements.viewport.innerHTML = '<div class="felt-grid-overlay"></div>';
      elements.viewport.classList.add("is-shaking");
      audio.playRattle();

      setTimeout(() => {
        elements.viewport.classList.remove("is-shaking");
        executeDiceRelease();
      }, 550);

    }, 350);
  }

  // Generate values and render physical representations
  function executeDiceRelease() {
    audio.playThud();
    
    const isCustom = !!state.selectedCustomDeck;
    const itemsToRoll = []; // Array of { type: 'd6' | 'd4'..., val: number, label: string|null }
    
    if (isCustom) {
      // Roll exactly 1 D6 which lands on custom labels
      const deck = state.selectedCustomDeck;
      const count = deck.labels.length;
      const val = Math.floor(Math.random() * 6) + 1; // Land 1-6 standard face
      const textVal = deck.labels[(val - 1) % count];
      itemsToRoll.push({
        type: "d6",
        val: val,
        label: textVal,
        customDeckName: deck.name
      });
    } else {
      // Roll normal polyhedrals
      Object.keys(state.pool).forEach(type => {
        const count = state.pool[type];
        const sides = parseInt(type.substring(1));
        for (let i = 0; i < count; i++) {
          const val = Math.floor(Math.random() * sides) + 1;
          itemsToRoll.push({
            type: type,
            val: val,
            label: null
          });
        }
      });
    }

    // Hide intro
    elements.arenaIntro.style.display = "none";
    
    // Clear viewport and keep overlay grid
    elements.viewport.innerHTML = `
      <div class="felt-grid-overlay"></div>
      <div class="sparkle-layer" id="arena-particle-layer" aria-hidden="true"></div>
    `;
    
    const diceObjects = [];
    
    // Instantiate DOM structures
    itemsToRoll.forEach(item => {
      if (item.type === "d6") {
        // Render 3D D6 Cube
        const scene = document.createElement("div");
        scene.className = "dice-3d-scene";

        const die = document.createElement("div");
        const skin = elements.diceSkinSelect.value;
        die.className = `die-3d skin-${skin}`;
        
        // Build 6 faces
        for (let f = 1; f <= 6; f++) {
          const face = document.createElement("div");
          face.className = `face face-${f}`;
          
          if (item.label) {
            // Write custom label on faces
            // Wrap text values around faces
            const deck = state.selectedCustomDeck;
            const textVal = deck.labels[(f - 1) % deck.labels.length];
            face.innerHTML = `<span class="custom-face-text">${textVal}</span>`;
          } else {
            // Build standard dots
            face.innerHTML = getPipsHTML(f);
          }
          die.appendChild(face);
        }
        scene.appendChild(die);
        elements.viewport.appendChild(scene);
        
        diceObjects.push({ element: die, val: item.val, is3d: true });
      } else {
        // Render 2D Flat Geometric representation (with clip-path class fixed!)
        const flatDie = document.createElement("div");
        flatDie.className = `poly-die-flat rolled ${item.type.toLowerCase()}`;
        
        if (item.type === "d20" && item.val === 20) {
          flatDie.classList.add("d20-crit");
        }
        
        // CSS clip-path shapes
        let shapeClass = "poly-shape ";
        // FIXED BUG: changed die-icon-d4 references to shape-d4 to apply CSS clip-path polygon
        if (item.type === "d4") shapeClass += "shape-d4";
        else if (item.type === "d8") shapeClass += "shape-d8";
        else if (item.type === "d10") shapeClass += "shape-d10";
        else if (item.type === "d12") shapeClass += "shape-d12";
        else if (item.type === "d20") shapeClass += "shape-d20";
        else shapeClass += "shape-d100";

        flatDie.innerHTML = `
          <div class="${shapeClass}"></div>
          <span class="poly-value">${item.val}</span>
          <span class="poly-name">${item.type}</span>
        `;
        
        elements.viewport.appendChild(flatDie);
        diceObjects.push({ element: flatDie, val: item.val, is3d: false });
      }
    });

    // Animate 3D spins
    requestAnimationFrame(() => {
      diceObjects.forEach(obj => {
        if (obj.is3d) {
          const rotation = faceRotations[obj.val] || { x: 0, y: 0 };
          const spinsX = (3 + Math.floor(Math.random() * 2)) * 360;
          const spinsY = (3 + Math.floor(Math.random() * 2)) * 360;
          
          const rx = rotation.x + spinsX;
          const ry = rotation.y + spinsY;
          const rz = Math.floor(Math.random() * 180) - 90; // slight tilt rotation
          
          obj.element.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        }
      });
    });

    // Sparkle splash animations
    setTimeout(() => {
      triggerLandingSparks();
      
      // Calculate results metrics
      const values = itemsToRoll.map(i => i.val);
      const total = isCustom ? 0 : values.reduce((a, b) => a + b, 0);
      const average = isCustom ? 0 : total / values.length;
      const highest = isCustom ? 0 : Math.max(...values);
      const lowest = isCustom ? 0 : Math.min(...values);

      // Display metrics
      if (isCustom) {
        const resultLabel = itemsToRoll[0].label;
        elements.metricTotal.textContent = "DECK";
        elements.metricAverage.textContent = resultLabel.toUpperCase();
        elements.metricHighest.textContent = "I/I";
        elements.metricLowest.textContent = "I/I";
      } else {
        elements.metricTotal.textContent = total;
        elements.metricAverage.textContent = average.toFixed(1);
        elements.metricHighest.textContent = highest;
        elements.metricLowest.textContent = lowest;
      }

      // Log to probability distribution D6 counts (only standard D6 rolls counted)
      itemsToRoll.forEach(item => {
        if (item.type === "d6" && !item.label) {
          state.counts[item.val] = (state.counts[item.val] || 0) + 1;
        }
      });
      localStorage.setItem("crank.counts", JSON.stringify(state.counts));

      // Append to Ledger book
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const deckName = isCustom ? `Custom: ${state.selectedCustomDeck.name}` : itemsToRoll.map(i => i.type.toUpperCase()).join("+");
      const outcomesStr = isCustom ? itemsToRoll[0].label : values.join(" • ");
      const sumStr = isCustom ? "--" : total;

      state.ledger.unshift({
        time: timeStr,
        deck: deckName,
        outcomes: outcomesStr,
        sum: sumStr
      });
      // Cap ledger size
      if (state.ledger.length > 20) state.ledger.pop();
      localStorage.setItem("crank.ledger", JSON.stringify(state.ledger));

      // Update tables and probability charts
      updateLedgerUI();
      updateStatsChart();

      state.isRolling = false;
    }, 1250);
  }

  function getPipsHTML(val) {
    let pips = "";
    for (let i = 0; i < val; i++) {
      pips += `<div class="pip"></div>`;
    }
    return `<div class="pip-grid">${pips}</div>`;
  }

  function triggerLandingSparks() {
    const layer = document.getElementById("arena-particle-layer");
    if (!layer) return;
    layer.innerHTML = "";

    const colors = ["#d97706", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "sparkle-particle";
      
      const dx = (Math.random() - 0.5) * 120 + "px";
      const dy = (Math.random() - 0.5) * 120 + "px";
      const c = colors[Math.floor(Math.random() * colors.length)];
      
      p.style.left = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
      p.style.top = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
      p.style.setProperty("--dx", dx);
      p.style.setProperty("--dy", dy);
      p.style.background = c;
      p.style.boxShadow = `0 0 6px ${c}`;

      layer.appendChild(p);
    }
  }

  // ==========================================================================
  // 8. Statistics & ledger Table drawer
  // ==========================================================================
  function updateLedgerUI() {
    const tbody = elements.ledgerRows;
    tbody.innerHTML = "";

    if (state.ledger.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="parchment-empty">Ledger is empty. Pull the Crank to record entries.</td>
        </tr>
      `;
      return;
    }

    state.ledger.forEach(entry => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.time}</td>
        <td style="color:#78350f">${entry.deck}</td>
        <td style="font-weight:700">${entry.outcomes}</td>
        <td style="color:#b45309; font-weight:700">${entry.sum}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  elements.clearLedgerBtn.addEventListener("click", () => {
    audio.playClick();
    state.ledger = [];
    localStorage.removeItem("crank.ledger");
    updateLedgerUI();
  });

  function updateStatsChart() {
    const wrapper = elements.chartWrapper;
    wrapper.innerHTML = "";

    const totals = Object.values(state.counts).reduce((a, b) => a + b, 0);
    if (totals === 0) {
      wrapper.innerHTML = `<span class="empty-msg">No standard D6 results logged in this session yet.</span>`;
      return;
    }

    // Geometry
    const w = 310;
    const h = 130;
    const padding = { top: 15, right: 10, bottom: 20, left: 20 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const colW = chartW / 6;
    const barW = Math.min(colW * 0.75, 22);

    const maxVal = Math.max(...Object.values(state.counts), 1);
    
    let bars = "";
    let axes = "";
    let labels = "";

    // Gridlines
    const lines = 3;
    for (let i = 0; i <= lines; i++) {
      const y = padding.top + (chartH / lines) * i;
      const gridNum = Math.round(maxVal - (maxVal / lines) * i);
      axes += `
        <line x1="${padding.left}" y1="${y}" x2="${w - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="2,2" />
        <text x="${padding.left - 5}" y="${y + 3}" fill="#6b7280" font-size="8" text-anchor="end" font-family="Fira Code">${gridNum}</text>
      `;
    }

    // Render bars
    for (let face = 1; face <= 6; face++) {
      const count = state.counts[face] || 0;
      const pct = count / maxVal;
      const barH = chartH * pct;

      const xc = padding.left + (colW * (face - 1)) + (colW / 2);
      const xb = xc - (barW / 2);
      const yb = padding.top + chartH - barH;

      bars += `
        <g style="cursor: help;">
          <title>Face ${face}: rolled ${count} times</title>
          <rect 
            x="${xb}" 
            y="${yb}" 
            width="${barW}" 
            height="${Math.max(barH, 1.5)}" 
            rx="3" 
            fill="url(#brassGrad)" 
            style="transition: height 0.4s ease, y 0.4s ease;"
          />
          <text 
            x="${xc}" 
            y="${yb - 4}" 
            fill="${count > 0 ? '#f59e0b' : '#6b7280'}" 
            font-size="8" 
            font-weight="700" 
            text-anchor="middle" 
            font-family="Fira Code"
          >${count}</text>
        </g>
      `;

      labels += `
        <text x="${xc}" y="${h - padding.bottom + 14}" fill="#e2e8f0" font-size="9" font-weight="700" text-anchor="middle" font-family="Outfit">${face}</text>
      `;
    }

    const svg = `
      <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#fbbf24" />
          </linearGradient>
        </defs>
        ${axes}
        ${bars}
        ${labels}
        <line x1="${padding.left}" y1="${h - padding.bottom}" x2="${w - padding.right}" y2="${h - padding.bottom}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      </svg>
    `;

    wrapper.innerHTML = svg;
  }

  elements.resetAnalyticsBtn.addEventListener("click", () => {
    audio.playClick();
    state.counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    localStorage.setItem("crank.counts", JSON.stringify(state.counts));
    updateStatsChart();
  });

  // ==========================================================================
  // 9. Initial Load & Setup
  // ==========================================================================
  clearPool();
  populateDecksSelect();
  updateLedgerUI();
  updateStatsChart();
});
