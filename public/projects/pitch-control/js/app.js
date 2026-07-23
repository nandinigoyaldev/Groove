/**
 * Application Controller for Pitch (Groove LP // 06)
 * Integrates Full-Screen UI, Control Deck, Sweeper Needle, Audio, Shop & Leaderboard.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Check API health
  await window.apiClient.checkServerHealth();

  // Load user profile
  let currentUser = await window.apiClient.getOrCreateUser("Player1");

  // Pitch Canvas Visualizer
  const pitchVisualizer = new window.PitchCanvasVisualizer("pitchCanvas");
  window.addEventListener("resize", () => pitchVisualizer.resize());
  pitchVisualizer.resize();

  // App State
  let selectedShot = "drive";
  let sweeperPos = 0;
  let sweeperDirection = 1;
  let sweeperSpeed = 1.3;
  let activeShopCategory = "bats";

  // DOM Elements
  const elements = {
    navLinks: document.querySelectorAll(".nav-link"),
    viewSections: document.querySelectorAll(".view-section"),

    // Profile Header
    headerUsername: document.getElementById("headerUsername"),
    headerTitle: document.getElementById("headerTitle"),
    headerXP: document.getElementById("headerXP"),
    headerCoins: document.getElementById("headerCoins"),
    audioBtn: document.getElementById("audioToggleBtn"),

    // Scorebug
    playerScore: document.getElementById("playerScore"),
    wicketsLost: document.getElementById("wicketsLost"),
    oversVal: document.getElementById("oversVal"),
    targetScoreVal: document.getElementById("targetScoreVal"),
    runsNeededVal: document.getElementById("runsNeededVal"),
    ballsLeftVal: document.getElementById("ballsLeftVal"),
    rrrVal: document.getElementById("rrrVal"),

    // Commentary
    commentaryText: document.getElementById("commentaryText"),
    commentaryDetail: document.getElementById("commentaryDetail"),

    // Control Deck & Sweeper
    shotBtns: document.querySelectorAll(".shot-btn"),
    sweeperNeedle: document.getElementById("sweeperNeedle"),
    hitShotBtn: document.getElementById("hitShotBtn"),

    // Action Pills
    btnToggleModes: document.getElementById("btnToggleModes"),
    btnResetMatch: document.getElementById("btnResetMatch"),
    btnShowWagonWheel: document.getElementById("btnShowWagonWheel"),

    // Modes Drawer
    modesDrawer: document.getElementById("modesDrawer"),
    modesDrawerClose: document.getElementById("modesDrawerClose"),
    modeItems: document.querySelectorAll(".mode-item"),

    // Shop
    shopTabs: document.querySelectorAll(".shop-tab"),
    shopGridContainer: document.getElementById("shopGridContainer"),

    // Stats & Leaderboard
    statsLevelVal: document.getElementById("statsLevelVal"),
    statsXpProgress: document.getElementById("statsXpProgress"),
    statsXpText: document.getElementById("statsXpText"),
    statsMatchesVal: document.getElementById("statsMatchesVal"),
    statsWinRateVal: document.getElementById("statsWinRateVal"),
    statsTotalRunsVal: document.getElementById("statsTotalRunsVal"),
    statsSixesVal: document.getElementById("statsSixesVal"),
    leaderboardBody: document.getElementById("leaderboardBody"),

    // Toast & Modal
    toastContainer: document.getElementById("toastContainer"),
    modalBackdrop: document.getElementById("modalBackdrop"),
    modalIcon: document.getElementById("modalIcon"),
    modalTitle: document.getElementById("modalTitle"),
    modalText: document.getElementById("modalText"),
    modalCloseBtn: document.getElementById("modalCloseBtn")
  };

  // Toast Helper
  window.showToast = (msg) => {
    if (!elements.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = msg;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // Modal Helper
  function showModal(icon, title, htmlContent) {
    if (!elements.modalBackdrop) return;
    elements.modalIcon.textContent = icon;
    elements.modalTitle.textContent = title;
    elements.modalText.innerHTML = htmlContent;
    elements.modalBackdrop.classList.add("open");
  }

  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener("click", () => {
      elements.modalBackdrop.classList.remove("open");
    });
  }

  // --- NAVIGATION LINK HANDLERS ---
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const action = link.dataset.action;
      const targetView = link.dataset.view;

      if (action === "toggle-modes") {
        openModesDrawer();
        return;
      }

      if (targetView) {
        elements.navLinks.forEach((l) => l.classList.remove("active"));
        elements.viewSections.forEach((s) => s.classList.remove("active"));

        link.classList.add("active");
        const sec = document.getElementById(`view-${targetView}`);
        if (sec) sec.classList.add("active");

        window.soundEngine.play("click");

        if (targetView === "arena") pitchVisualizer.resize();
        if (targetView === "shop") renderShop();
        if (targetView === "stats") renderStats();
        if (targetView === "leaderboard") renderLeaderboard();
      }
    });
  });

  // --- MODES DRAWER CONTROLS ---
  function openModesDrawer() {
    if (elements.modesDrawer) elements.modesDrawer.classList.add("open");
    window.soundEngine.play("click");
  }

  function closeModesDrawer() {
    if (elements.modesDrawer) elements.modesDrawer.classList.remove("open");
  }

  if (elements.btnToggleModes) elements.btnToggleModes.addEventListener("click", openModesDrawer);
  if (elements.modesDrawerClose) elements.modesDrawerClose.addEventListener("click", closeModesDrawer);

  elements.modeItems.forEach((item) => {
    item.addEventListener("click", async () => {
      elements.modeItems.forEach((m) => m.classList.remove("active"));
      item.classList.add("active");
      const mode = item.dataset.mode;
      closeModesDrawer();
      window.soundEngine.play("click");
      await startNewMatchSession(mode);
    });
  });

  // --- AUDIO TOGGLE ---
  if (elements.audioBtn) {
    elements.audioBtn.addEventListener("click", () => {
      const enabled = window.soundEngine.toggle();
      elements.audioBtn.textContent = enabled ? "🔊" : "🔇";
      showToast(enabled ? "Sound FX Enabled" : "Sound Muted");
    });
  }

  // --- TIMING SWEEPER NEEDLE ANIMATION ---
  function animateSweeper() {
    sweeperPos += sweeperSpeed * sweeperDirection;
    if (sweeperPos >= 96) {
      sweeperPos = 96;
      sweeperDirection = -1;
    } else if (sweeperPos <= 2) {
      sweeperPos = 2;
      sweeperDirection = 1;
    }

    if (elements.sweeperNeedle) {
      elements.sweeperNeedle.style.left = `${sweeperPos}%`;
    }

    requestAnimationFrame(animateSweeper);
  }
  animateSweeper();

  // --- SHOT SELECTOR BUTTONS ---
  elements.shotBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.shotBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedShot = btn.dataset.shot;
      window.soundEngine.play("click");
    });
  });

  // --- START NEW MATCH SESSION ---
  async function startNewMatchSession(mode = "classic") {
    pitchVisualizer.clearWagonWheel();
    const res = await window.gameEngine.startNewMatch(currentUser.username, mode);
    if (res) {
      updateScorebugUI(res.matchConfig);
      showToast(`Started ${mode.toUpperCase()} Match! Target: ${res.matchConfig.targetScore}`);
    }
  }

  // --- HIT SHOT BUTTON CLICK ---
  if (elements.hitShotBtn) {
    elements.hitShotBtn.addEventListener("click", async () => {
      if (window.gameEngine.isDelivering) return;

      const timingIndex = sweeperPos / 100;
      const res = await window.gameEngine.playBall(currentUser.username, selectedShot, timingIndex);

      if (res) {
        pitchVisualizer.triggerDeliveryAnimation(res.delivery, res.outcome, () => {
          updateScorebugUI(res.matchState);
          updateCommentaryUI();

          if (res.user) {
            currentUser = res.user;
            updateHeaderProfileUI(currentUser);
          }

          if (res.matchState.isMatchOver) {
            handleMatchEnd(res.matchState);
          }
        });
      }
    });
  }

  if (elements.btnResetMatch) {
    elements.btnResetMatch.addEventListener("click", () => {
      startNewMatchSession(window.gameEngine.gameMode);
    });
  }

  if (elements.btnShowWagonWheel) {
    elements.btnShowWagonWheel.addEventListener("click", () => {
      const shots = pitchVisualizer.wagonWheelShots;
      let html = `<div style="font-size:0.9rem;">
        <p style="margin-bottom:0.5rem; color:var(--text-muted);">Shot distribution map across boundary zones:</p>
        <p>🎯 <strong>Total Shots Played:</strong> ${shots.length}</p>
        <p>🚀 <strong>Sixes Hit:</strong> ${shots.filter((s) => s.runs === 6).length}</p>
        <p>⚡ <strong>Fours Hit:</strong> ${shots.filter((s) => s.runs === 4).length}</p>
      </div>`;
      showModal("🎯", "Wagon Wheel Summary", html);
    });
  }

  // --- PROFILE HEADER UI ---
  function updateHeaderProfileUI(user) {
    if (elements.headerUsername) elements.headerUsername.textContent = user.username;
    if (elements.headerTitle) {
      const cleanTitle = (user.equipped.title || "title_gully").replace("title_", "").toUpperCase();
      elements.headerTitle.textContent = `${cleanTitle} CHAMP`;
    }
    if (elements.headerXP) elements.headerXP.textContent = `${user.xp} XP (Lvl ${user.level})`;
    if (elements.headerCoins) elements.headerCoins.textContent = user.coins;
  }

  function updateScorebugUI(state) {
    if (elements.playerScore) elements.playerScore.textContent = state.currentRuns;
    if (elements.wicketsLost) elements.wicketsLost.textContent = state.wicketsLost;
    if (elements.oversVal) elements.oversVal.textContent = `${state.oversFormatted || "0.0"} / ${window.gameEngine.totalBalls / 6}.0`;
    if (elements.targetScoreVal) elements.targetScoreVal.textContent = window.gameEngine.targetScore;
    if (elements.runsNeededVal) elements.runsNeededVal.textContent = state.runsNeeded !== undefined ? state.runsNeeded : window.gameEngine.targetScore;
    if (elements.ballsLeftVal) elements.ballsLeftVal.textContent = state.ballsLeft !== undefined ? state.ballsLeft : window.gameEngine.totalBalls;
    if (elements.rrrVal) elements.rrrVal.textContent = state.rrr || "12.0";
  }

  function updateCommentaryUI() {
    if (elements.commentaryText) elements.commentaryText.textContent = window.gameEngine.commentary;
    if (elements.commentaryDetail) elements.commentaryDetail.textContent = window.gameEngine.commentaryDetail;
  }

  function handleMatchEnd(state) {
    const isPlayerWin = state.matchWinner === "player";
    const title = isPlayerWin ? "VICTORY! TARGET CHASED!" : "MATCH LOST!";
    const icon = isPlayerWin ? "🏆" : "💔";
    const msg = isPlayerWin
      ? `<p>Outstanding! You chased down ${window.gameEngine.targetScore} runs with ${state.ballsLeft} balls remaining!</p>`
      : `<p>Target missed! You scored ${state.currentRuns}/${state.wicketsLost} chasing ${window.gameEngine.targetScore}.</p>`;

    showModal(icon, title, msg);
  }

  // --- PRO SHOP RENDERING ---
  elements.shopTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.shopTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeShopCategory = tab.dataset.category;
      renderShop();
    });
  });

  async function renderShop() {
    if (!elements.shopGridContainer) return;
    const catalog = await window.apiClient.getCatalog();
    const items = catalog[activeShopCategory] || [];

    const isSquad = activeShopCategory === "squad";
    const ownedList = isSquad ? (currentUser.squad || []) : currentUser.inventory;

    elements.shopGridContainer.innerHTML = items
      .map((item) => {
        const isOwned = ownedList.includes(item.id);
        const slot = activeShopCategory.replace(/s$/, "");
        const isEquipped = !isSquad && currentUser.equipped[slot] === item.id;

        let btnHtml = "";
        if (isSquad) {
          btnHtml = isOwned
            ? `<button class="btn-equip-action" disabled>RECRUITED</button>`
            : `<button class="btn-buy-action" onclick="window.handleBuyItem('${item.id}', '${activeShopCategory}')">Recruit 🪙 ${item.price}</button>`;
        } else {
          if (isEquipped) {
            btnHtml = `<button class="btn-equip-action" disabled>EQUIPPED</button>`;
          } else if (isOwned) {
            btnHtml = `<button class="btn-equip-action" onclick="window.handleEquipItem('${item.id}', '${activeShopCategory}')">Equip Item</button>`;
          } else {
            btnHtml = `<button class="btn-buy-action" onclick="window.handleBuyItem('${item.id}', '${activeShopCategory}')">Buy 🪙 ${item.price}</button>`;
          }
        }

        return `<article class="shop-item-card">
          <div class="card-top">
            <span class="icon">${item.icon || "🏏"}</span>
            <span class="badge">${item.rarity || item.role || "Item"}</span>
          </div>
          <h4>${item.name}</h4>
          <p>${item.desc || "High performance equipment."}</p>
          ${btnHtml}
        </article>`;
      })
      .join("");
  }

  window.handleBuyItem = async (itemId, category) => {
    const res = await window.apiClient.buyItem(currentUser.username, itemId, category);
    if (res.success) {
      currentUser = res.user;
      updateHeaderProfileUI(currentUser);
      renderShop();
      window.soundEngine.play("coin");
      showToast(res.message);
    } else {
      showToast(res.error || "Purchase failed");
    }
  };

  window.handleEquipItem = async (itemId, category) => {
    const res = await window.apiClient.equipItem(currentUser.username, itemId, category);
    if (res.success) {
      currentUser = res.user;
      updateHeaderProfileUI(currentUser);
      renderShop();
      window.soundEngine.play("click");
      showToast(res.message);
    }
  };

  // --- CAREER STATS RENDERING ---
  function renderStats() {
    const s = currentUser.stats || {};
    if (elements.statsLevelVal) elements.statsLevelVal.textContent = `LEVEL ${currentUser.level}`;

    const reqXP = currentUser.level * 100;
    const pct = Math.min(100, Math.round((currentUser.xp / reqXP) * 100));
    if (elements.statsXpProgress) elements.statsXpProgress.style.width = `${pct}%`;
    if (elements.statsXpText) elements.statsXpText.textContent = `${currentUser.xp} / ${reqXP} XP`;

    if (elements.statsMatchesVal) elements.statsMatchesVal.textContent = s.matchesPlayed || 0;
    const winRate = s.matchesPlayed > 0 ? Math.round((s.matchesWon / s.matchesPlayed) * 100) : 0;
    if (elements.statsWinRateVal) elements.statsWinRateVal.textContent = `${winRate}%`;
    if (elements.statsTotalRunsVal) elements.statsTotalRunsVal.textContent = s.totalRuns || 0;
    if (elements.statsSixesVal) elements.statsSixesVal.textContent = s.totalSixes || 0;
  }

  // --- LEADERBOARD RENDERING ---
  async function renderLeaderboard() {
    if (!elements.leaderboardBody) return;
    const list = await window.apiClient.getLeaderboard();
    const medals = ["🥇", "🥈", "🥉"];

    elements.leaderboardBody.innerHTML = list
      .map((entry, idx) => {
        const medal = medals[idx] || `#${idx + 1}`;
        return `<tr>
          <td style="font-weight:800;">${medal}</td>
          <td style="font-weight:700;">${entry.username}</td>
          <td><span style="color:var(--gold-accent); font-size:0.8rem; font-weight:800;">${(entry.title || "GULLY CHAMP").replace("title_", "").toUpperCase()}</span></td>
          <td>Level ${entry.level || 1}</td>
          <td style="font-weight:800; color:var(--emerald-light);">${entry.totalRuns || 0}</td>
          <td>${entry.matchesWon || 0}</td>
        </tr>`;
      })
      .join("");
  }

  // Initial State
  updateHeaderProfileUI(currentUser);
  await startNewMatchSession("classic");
});
