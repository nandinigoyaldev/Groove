// Crank Mechanical Dice Tumbler Controller (D6 & Custom text dice)

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. Web Audio Synthesizer (Tactile audio effects)
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

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    },

    playWinding() {
      if (!this.enabled) return;
      this.init();
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const time = now + i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220 - i * 30, time);
        gain.gain.setValueAtTime(0.08, time);
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
      // Synthesize wooden shaker noise
      for (let i = 0; i < 8; i++) {
        const time = now + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120 + Math.random() * 60, time);
        gain.gain.setValueAtTime(0.12, time);
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
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    }
  };

  // ==========================================================================
  // 2. Core State
  // ==========================================================================
  const state = {
    diceCount: parseInt(localStorage.getItem("crank.diceCount")) || 2,
    customDecks: JSON.parse(localStorage.getItem("crank.customDecks")) || [
      { name: "Coin Flip", labels: ["Heads", "Tails"] },
      { name: "Lunch Pick", labels: ["Pizza", "Salad", "Tacos", "Burgers", "Sushi", "Pasta"] },
      { name: "Yes No Maybe", labels: ["Definitely Yes", "Absolutely No", "Ask Later", "Try Again"] }
    ],
    selectedCustomDeck: null,
    isRolling: false,
    ledger: JSON.parse(localStorage.getItem("crank.ledger")) || []
  };

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
    crankArm: document.getElementById("crank-shaft"),
    diceSkinSelect: document.getElementById("dice-skin-select"),
    customDiceSelect: document.getElementById("custom-dice-select"),
    deleteDeckBtn: document.getElementById("delete-deck-btn"),
    toggleCreatorBtn: document.getElementById("toggle-creator-btn"),
    customDieForm: document.getElementById("custom-die-form"),
    newDieName: document.getElementById("new-die-name"),
    labelsContainer: document.getElementById("labels-inputs-container"),
    addLabelRowBtn: document.getElementById("add-label-row-btn"),
    creatorErrorMsg: document.getElementById("creator-error-msg"),
    clearLedgerBtn: document.getElementById("clear-ledger-btn"),
    ledgerRows: document.getElementById("ledger-rows"),
    metricTotal: document.getElementById("metric-total"),
    metricAverage: document.getElementById("metric-average"),
    metricHighest: document.getElementById("metric-highest"),
    metricLowest: document.getElementById("metric-lowest"),
    particleLayer: document.getElementById("arena-particle-layer"),
    diceCountValue: document.getElementById("dice-count-value"),
    dieMinusBtn: document.getElementById("die-minus-btn"),
    diePlusBtn: document.getElementById("die-plus-btn")
  };

  // ==========================================================================
  // 3. UI Stepper Controls (Standard Dice count selector)
  // ==========================================================================
  elements.dieMinusBtn.addEventListener("click", () => {
    audio.playClick();
    if (state.diceCount > 1) {
      state.diceCount -= 1;
      localStorage.setItem("crank.diceCount", state.diceCount);
      updateDiceCountUI();
    }
  });

  elements.diePlusBtn.addEventListener("click", () => {
    audio.playClick();
    if (state.diceCount < 6) {
      state.diceCount += 1;
      localStorage.setItem("crank.diceCount", state.diceCount);
      updateDiceCountUI();
    }
  });

  function updateDiceCountUI() {
    elements.diceCountValue.textContent = state.diceCount;
    // Auto-switch away from custom decks when adjusting count
    if (state.selectedCustomDeck) {
      state.selectedCustomDeck = null;
      elements.customDiceSelect.value = "";
      elements.deleteDeckBtn.disabled = true;
    }
    updatePoolUI();
  }

  // ==========================================================================
  // 4. Sound & Clear Pool
  // ==========================================================================
  elements.soundToggleBtn.addEventListener("click", () => {
    audio.enabled = !audio.enabled;
    localStorage.setItem("crank.sound", audio.enabled ? "on" : "off");
    elements.soundToggleBtn.querySelector(".btn-icon").textContent = audio.enabled ? "🔊" : "🔇";
    audio.playClick();
  });
  elements.soundToggleBtn.querySelector(".btn-icon").textContent = audio.enabled ? "🔊" : "🔇";

  elements.clearPoolBtn.addEventListener("click", () => {
    audio.playClick();
    clearPool();
  });

  function clearPool() {
    state.selectedCustomDeck = null;
    elements.customDiceSelect.value = "";
    elements.deleteDeckBtn.disabled = true;
    updatePoolUI();
  }

  function updatePoolUI() {
    const viewer = elements.poolViewer;
    viewer.innerHTML = "";

    if (state.selectedCustomDeck) {
      viewer.innerHTML = `
        <div class="pool-die-tag">
          <span>DECISION: ${state.selectedCustomDeck.name.toUpperCase()}</span>
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

    // Standard dice loading
    for (let i = 0; i < state.diceCount; i++) {
      const tag = document.createElement("span");
      tag.className = "pool-die-tag";
      tag.innerHTML = `<span>D6 DICE</span>`;
      viewer.appendChild(tag);
    }
    elements.clearPoolBtn.disabled = true; // No custom deck to clear
  }

  // ==========================================================================
  // 5. Custom Decks Dropdown Picker
  // ==========================================================================
  function populateDecksSelect() {
    const select = elements.customDiceSelect;
    select.innerHTML = '<option value="">-- Standard D6 Dice --</option>';
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

  // Toggle Compile form drawer
  elements.toggleCreatorBtn.addEventListener("click", () => {
    audio.playClick();
    const form = elements.customDieForm;
    if (form.style.display === "none") {
      form.style.display = "flex";
      elements.toggleCreatorBtn.textContent = "Close Compiler";
    } else {
      form.style.display = "none";
      elements.toggleCreatorBtn.textContent = "Compile New Die";
    }
  });

  // Creator add input fields
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
      <input type="text" class="brass-input face-label-input" placeholder="e.g. Option ${optionIndexCount}" required maxlength="12">
    `;
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  });

  // Submit creator form
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
      errorSpan.textContent = "Name is required.";
      errorSpan.style.display = "inline";
      return;
    }

    if (labels.length < 2) {
      errorSpan.textContent = "Provide at least 2 option faces.";
      errorSpan.style.display = "inline";
      return;
    }

    // Check duplicate name
    if (state.customDecks.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      errorSpan.textContent = "Name already exists.";
      errorSpan.style.display = "inline";
      return;
    }

    audio.playClick();
    errorSpan.style.display = "none";
    
    const newDeck = { name, labels };
    state.customDecks.push(newDeck);
    localStorage.setItem("crank.customDecks", JSON.stringify(state.customDecks));

    // Reset Form
    elements.newDieName.value = "";
    elements.labelsContainer.innerHTML = `
      <div class="label-input-row">
        <span class="label-index">I</span>
        <input type="text" class="brass-input face-label-input" placeholder="e.g. Yes" required maxlength="12">
      </div>
      <div class="label-input-row">
        <span class="label-index">II</span>
        <input type="text" class="brass-input face-label-input" placeholder="e.g. No" required maxlength="12">
      </div>
    `;
    optionIndexCount = 2;

    // Load new deck
    state.selectedCustomDeck = newDeck;
    populateDecksSelect();
    updatePoolUI();
    
    // Collapse form
    elements.customDieForm.style.display = "none";
    elements.toggleCreatorBtn.textContent = "Compile New Die";
    
    alert(`Deck "${name}" compiled and loaded! Pull the Crank handle to roll it.`);
  });

  // ==========================================================================
  // 6. Crank Pull Lever Shaker
  // ==========================================================================
  elements.crankHousing.addEventListener("click", () => {
    if (state.isRolling) return;
    triggerCrankPull();
  });

  function triggerCrankPull() {
    state.isRolling = true;
    audio.playWinding();
    
    // Physical arm rotation down
    const lever = document.getElementById("crank-shaft");
    lever.classList.remove("releasing");
    lever.classList.add("pulling");

    setTimeout(() => {
      // Spring back lever arm
      lever.classList.remove("pulling");
      lever.classList.add("releasing");

      // Shaking green felt chamber
      elements.viewport.innerHTML = '<div class="felt-grid-overlay"></div>';
      elements.viewport.classList.add("is-shaking");
      audio.playRattle();

      setTimeout(() => {
        elements.viewport.classList.remove("is-shaking");
        executeDiceRelease();
      }, 550);

    }, 350);
  }

  // Release 3D cubes into viewport
  function executeDiceRelease() {
    audio.playThud();
    
    const isCustom = !!state.selectedCustomDeck;
    const itemsToRoll = [];
    
    if (isCustom) {
      // Roll exactly 1 D6 which prints custom text labels
      const deck = state.selectedCustomDeck;
      const count = deck.labels.length;
      const val = Math.floor(Math.random() * 6) + 1; // standard face rotation index
      const textVal = deck.labels[(val - 1) % count];
      itemsToRoll.push({
        val: val,
        label: textVal
      });
    } else {
      // Roll standard D6 count
      for (let i = 0; i < state.diceCount; i++) {
        const val = Math.floor(Math.random() * 6) + 1;
        itemsToRoll.push({
          val: val,
          label: null
        });
      }
    }

    // Hide intro instructions
    elements.arenaIntro.style.display = "none";
    
    // Reset felt board viewport
    elements.viewport.innerHTML = `
      <div class="felt-grid-overlay"></div>
      <div class="sparkle-layer" id="arena-particle-layer" aria-hidden="true"></div>
    `;
    
    const diceObjects = [];
    const skin = elements.diceSkinSelect.value;
    
    itemsToRoll.forEach(item => {
      const scene = document.createElement("div");
      scene.className = "dice-3d-scene";

      const die = document.createElement("div");
      die.className = `die-3d skin-${skin}`;
      
      // Build 6 faces
      for (let f = 1; f <= 6; f++) {
        const face = document.createElement("div");
        face.className = `face face-${f}`;
        
        if (item.label) {
          const deck = state.selectedCustomDeck;
          const textVal = deck.labels[(f - 1) % deck.labels.length];
          face.innerHTML = `<span class="custom-face-text">${textVal}</span>`;
        } else {
          face.innerHTML = getPipsHTML(f);
        }
        die.appendChild(face);
      }
      
      scene.appendChild(die);
      elements.viewport.appendChild(scene);
      diceObjects.push({ element: die, val: item.val });
    });

    // Run 3D spin alignments
    requestAnimationFrame(() => {
      diceObjects.forEach(obj => {
        const rotation = faceRotations[obj.val] || { x: 0, y: 0 };
        const spinsX = (3 + Math.floor(Math.random() * 2)) * 360;
        const spinsY = (3 + Math.floor(Math.random() * 2)) * 360;
        
        const rx = rotation.x + spinsX;
        const ry = rotation.y + spinsY;
        const rz = Math.floor(Math.random() * 180) - 90; // minor organic offsets
        
        obj.element.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      });
    });

    // Particle splash sparks
    setTimeout(() => {
      triggerLandingSparks();
      
      const values = itemsToRoll.map(i => i.val);
      const total = isCustom ? 0 : values.reduce((a, b) => a + b, 0);
      const average = isCustom ? 0 : total / values.length;
      const highest = isCustom ? 0 : Math.max(...values);
      const lowest = isCustom ? 0 : Math.min(...values);

      // Render LED readouts
      if (isCustom) {
        const resLabel = itemsToRoll[0].label;
        elements.metricTotal.textContent = "DECIDE";
        elements.metricAverage.textContent = resLabel.toUpperCase();
        elements.metricHighest.textContent = "I/I";
        elements.metricLowest.textContent = "I/I";
      } else {
        elements.metricTotal.textContent = total;
        elements.metricAverage.textContent = average.toFixed(1);
        elements.metricHighest.textContent = highest;
        elements.metricLowest.textContent = lowest;
      }

      // Add entry to ledger
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const typeLabel = isCustom ? `Custom: ${state.selectedCustomDeck.name}` : `${itemsToRoll.length}x D6 (${skin.toUpperCase()})`;
      const outcomesStr = isCustom ? itemsToRoll[0].label : values.join(" • ");
      const sumStr = isCustom ? "--" : total;

      state.ledger.unshift({
        time: timeStr,
        type: typeLabel,
        outcomes: outcomesStr,
        sum: sumStr
      });
      
      if (state.ledger.length > 20) state.ledger.pop();
      localStorage.setItem("crank.ledger", JSON.stringify(state.ledger));

      updateLedgerUI();
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

    const colors = ["#b45309", "#d97706", "#f59e0b", "#451a03", "#78350f"];
    const count = 15;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "sparkle-particle";
      
      const dx = (Math.random() - 0.5) * 110 + "px";
      const dy = (Math.random() - 0.5) * 110 + "px";
      const c = colors[Math.floor(Math.random() * colors.length)];
      
      p.style.left = `calc(50% + ${(Math.random() - 0.5) * 50}px)`;
      p.style.top = `calc(50% + ${(Math.random() - 0.5) * 50}px)`;
      p.style.setProperty("--dx", dx);
      p.style.setProperty("--dy", dy);
      p.style.background = c;
      p.style.boxShadow = `0 0 5px ${c}`;

      layer.appendChild(p);
    }
  }

  // ==========================================================================
  // 7. Ledger Table Populator
  // ==========================================================================
  function updateLedgerUI() {
    const tbody = elements.ledgerRows;
    tbody.innerHTML = "";

    if (state.ledger.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="parchment-empty">Ledger empty. Pull the Crank to record entries.</td>
        </tr>
      `;
      return;
    }

    state.ledger.forEach(entry => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.time}</td>
        <td style="color:#78350f; font-weight:500;">${entry.type}</td>
        <td style="font-weight:700; color:#451a03;">${entry.outcomes}</td>
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

  // ==========================================================================
  // 8. Initial Load
  // ==========================================================================
  updateDiceCountUI();
  populateDecksSelect();
  updateLedgerUI();
});
