/**
 * Universal API Client with Automatic Offline Storage Fallback
 * Supports full-stack Node Express REST backend AND offline static mode.
 */

const LOCAL_STORAGE_KEY = "pitch_console_user_v1";

const CLIENT_SEED_CATALOG = {
  bats: [
    { id: "bat_classic", name: "Pro English Willow", price: 0, xpMultiplier: 1.0, powerBonus: 0, icon: "🏏", rarity: "Common", desc: "Balanced willow for controlled boundary striking." },
    { id: "bat_kashmir", name: "Kashmir Thunder", price: 200, xpMultiplier: 1.15, powerBonus: 10, icon: "⚡", rarity: "Uncommon", desc: "+10 Power & 15% bonus XP on boundary hits." },
    { id: "bat_gold", name: "Imperial Gold Craft", price: 600, xpMultiplier: 1.35, powerBonus: 25, icon: "✨", rarity: "Rare", desc: "+25 Power & expanded timing sweet-spot." },
    { id: "bat_titanium", name: "Titanium Cyberblade", price: 1500, xpMultiplier: 1.6, powerBonus: 45, icon: "🔥", rarity: "Legendary", desc: "Max power boost for effortless 100m+ sixes." }
  ],
  balls: [
    { id: "ball_red", name: "Red Test Leather", price: 0, icon: "🔴", rarity: "Common", desc: "Standard 80-over test match leather ball." },
    { id: "ball_white", name: "Kookaburra White ODI", price: 150, icon: "⚪", rarity: "Uncommon", desc: "Smooth swing seam for day-night T20 sprints." },
    { id: "ball_glow", name: "Neon Matrix Ball", price: 400, icon: "🟢", rarity: "Rare", desc: "High-contrast visual trail on pitch bounces." },
    { id: "ball_gold", name: "Golden Trophy Ball", price: 900, icon: "🟡", rarity: "Legendary", desc: "Premium collector edition with +20% coin rewards." }
  ],
  pitches: [
    { id: "pitch_lords", name: "Lord's Grand Pavilion", price: 0, icon: "🌱", rarity: "Common", desc: "Historic green turf pitch with steady bounce." },
    { id: "pitch_eden", name: "Eden Gardens Night", price: 350, icon: "🏟️", rarity: "Uncommon", desc: "Pristine floodlights with electrified crowd acoustics." },
    { id: "pitch_wankhede", name: "Wankhede Sunset Bay", price: 700, icon: "🌅", rarity: "Rare", desc: "Fast outfields perfect for high-scoring T20 chases." },
    { id: "pitch_cyber", name: "Cyber Arena 2077", price: 1600, icon: "🌌", rarity: "Legendary", desc: "Futuristic neon grid under cosmic stadium lights." }
  ],
  squad: [
    { id: "player_rohit", name: "Hitman Opener", price: 300, role: "Batter", power: 88, timing: 92, icon: "🎯", desc: "Specialist in pulling short balls for massive sixes." },
    { id: "player_bumrah", name: "Yorker King", price: 500, role: "Bowler", pace: 95, control: 96, icon: "🎯", desc: "Deadly death-overs Yorker and slower ball specialist." },
    { id: "player_rashid", name: "Mystery Spinner", price: 750, role: "Bowler", spin: 94, control: 92, icon: "🌀", desc: "Deceptive wrong'uns that confuse AI batters." },
    { id: "player_abd", name: "360 Finisher", price: 1200, role: "All-Rounder", power: 96, timing: 98, icon: "⚡", desc: "Master of scoops, ramps, and clutch match finishes." }
  ],
  titles: [
    { id: "title_gully", name: "Gully Champion", price: 0, icon: "🏆", desc: "Local neighborhood legend." },
    { id: "title_master", name: "Timing Master", price: 250, icon: "🎯", desc: "Master of sweet-spot precision." },
    { id: "title_sixer", name: "Sixer King", price: 600, icon: "💥", desc: "Power hitter extra-ordinaire." },
    { id: "title_legend", name: "World Legend", price: 1500, icon: "👑", desc: "Undisputed champion of T20 Leagues." }
  ]
};

class APIClient {
  constructor() {
    this.isServerOnline = false;
    this.baseUrl = window.location.origin;
  }

  async checkServerHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { method: "GET" });
      if (res.ok) {
        this.isServerOnline = true;
        console.log("🟢 Connected to Full-Stack Express Server API!");
        return true;
      }
    } catch (e) {
      console.log("🌐 Server offline, switching to Client Offline Storage Engine.");
    }
    this.isServerOnline = false;
    return false;
  }

  async getOrCreateUser(username = "Player1") {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/user/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.success) return data.user;
      } catch (e) {
        console.warn("User API error, fallback:", e);
      }
    }
    return this.getLocalUser(username);
  }

  async startMatch(payload) {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/match/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) return data;
      } catch (e) {
        console.warn("Start Match API error, fallback:", e);
      }
    }
    const maxOvers = payload.gameMode === "superover" ? 1 : (payload.gameMode === "tournament" ? 3 : 2);
    const targetScore = payload.gameMode === "superover" ? 14 : (payload.gameMode === "tournament" ? 36 : 24);
    return {
      success: true,
      matchConfig: {
        gameMode: payload.gameMode,
        maxOvers,
        totalBalls: maxOvers * 6,
        targetScore,
        maxWickets: payload.gameMode === "superover" ? 2 : 3,
        currentBall: 0,
        currentRuns: 0,
        wicketsLost: 0,
        ballsRemaining: maxOvers * 6,
        requiredRuns: targetScore
      },
      user: this.getLocalUser(payload.username)
    };
  }

  async deliverBall(payload) {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/match/deliver`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) return data;
      } catch (e) {
        console.warn("Deliver Ball API error, fallback:", e);
      }
    }
    return this.processLocalDelivery(payload);
  }

  async getCatalog() {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/shop/catalog`);
        const data = await res.json();
        if (data.success) return data.catalog;
      } catch (e) {
        console.warn("Catalog API error, fallback:", e);
      }
    }
    return CLIENT_SEED_CATALOG;
  }

  async buyItem(username, itemId, category) {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/shop/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, itemId, category })
        });
        return await res.json();
      } catch (e) {
        console.warn("Buy API error, fallback:", e);
      }
    }
    return this.processLocalBuy(username, itemId, category);
  }

  async equipItem(username, itemId, category) {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/shop/equip`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, itemId, category })
        });
        return await res.json();
      } catch (e) {
        console.warn("Equip API error, fallback:", e);
      }
    }
    return this.processLocalEquip(username, itemId, category);
  }

  async getLeaderboard() {
    if (this.isServerOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/api/leaderboard`);
        const data = await res.json();
        if (data.success) return data.leaderboard;
      } catch (e) {
        console.warn("Leaderboard API error, fallback:", e);
      }
    }
    const user = this.getLocalUser();
    return [
      { username: user.username, level: user.level, xp: user.xp, matchesWon: user.stats.matchesWon, totalRuns: user.stats.totalRuns || 0, title: user.equipped.title },
      { username: "Mumbai_Strikers", level: 15, xp: 2100, matchesWon: 34, totalRuns: 420, title: "Sixer King" },
      { username: "Chennai_SuperStars", level: 12, xp: 1650, matchesWon: 26, totalRuns: 310, title: "Timing Master" },
      { username: "Bangalore_Blitz", level: 9, xp: 1100, matchesWon: 18, totalRuns: 240, title: "Gully Champion" }
    ];
  }

  // --- LOCAL ENGINE FALLBACKS ---
  getLocalUser(username = "Player1") {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let user = null;
    if (raw) {
      try { user = JSON.parse(raw); } catch (e) {}
    }
    if (!user) {
      user = {
        username: username.trim().substring(0, 20) || "Player1",
        level: 1,
        xp: 0,
        coins: 200,
        inventory: ["bat_classic", "ball_red", "pitch_lords", "title_gully"],
        squad: ["player_rohit"],
        equipped: { bat: "bat_classic", ball: "ball_red", pitch: "pitch_lords", title: "title_gully" },
        stats: { matchesPlayed: 0, matchesWon: 0, superOverWins: 0, tournamentWins: 0, totalRuns: 0, totalSixes: 0, highestScore: 0, currentStreak: 0, highestStreak: 0 }
      };
      this.saveLocalUser(user);
    }
    return user;
  }

  saveLocalUser(user) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }

  processLocalDelivery(payload) {
    const { username, shotChoice, timingIndex = 0.5, currentRuns = 0, wicketsLost = 0, currentBall = 0, totalBalls = 12, targetScore = 24, maxWickets = 3 } = payload;
    const user = this.getLocalUser(username);

    // Ball outcome logic
    const accuracy = 1.0 - (Math.abs(timingIndex - 0.5) * 2);
    let runs = 0;
    let isWicket = false;
    let outcomeLabel = "DOT BALL";
    let timingGrade = "MIS-TIMED";

    if (accuracy < 0.25) {
      if (Math.random() < 0.5) {
        isWicket = true;
        outcomeLabel = "WICKET!";
        timingGrade = "MIS-TIMED";
      } else {
        runs = 0;
        outcomeLabel = "DOT BALL";
        timingGrade = "POOR TIMING";
      }
    } else if (accuracy >= 0.75) {
      runs = (shotChoice === "loft" || shotChoice === "pull") ? 6 : 4;
      outcomeLabel = runs === 6 ? "MASSIVE SIX! 🚀" : "CRACKING FOUR! ⚡";
      timingGrade = "PERFECT TIMING";
    } else if (accuracy >= 0.5) {
      runs = shotChoice === "loft" ? 4 : (shotChoice === "drive" ? 2 : 1);
      outcomeLabel = `${runs} RUNS!`;
      timingGrade = "GOOD";
    } else {
      runs = shotChoice === "defend" ? 0 : 1;
      outcomeLabel = runs === 0 ? "DOT BALL" : "1 RUN";
      timingGrade = "EARLY / LATE";
    }

    const newRuns = currentRuns + runs;
    const newWickets = wicketsLost + (isWicket ? 1 : 0);
    const newBallCount = currentBall + 1;
    const ballsLeft = totalBalls - newBallCount;
    const runsNeeded = targetScore - newRuns;

    const isTargetAchieved = newRuns >= targetScore;
    const isAllOut = newWickets >= maxWickets;
    const isBallsExhausted = newBallCount >= totalBalls;
    const isMatchOver = isTargetAchieved || isAllOut || isBallsExhausted;
    const matchWinner = isTargetAchieved ? "player" : (isMatchOver ? "computer" : null);

    let earnedXP = runs * 5;
    let earnedCoins = runs;

    if (isMatchOver && matchWinner === "player") {
      earnedXP += 100;
      earnedCoins += 60;
      user.stats.matchesWon += 1;
    }

    user.xp += earnedXP;
    user.coins += earnedCoins;
    user.stats.totalRuns = (user.stats.totalRuns || 0) + newRuns;
    this.saveLocalUser(user);

    return {
      success: true,
      result: {
        delivery: { name: "Pace Delivery", line: "Stumps", length: "Good Length", pitchY: 0.6, shotChoice },
        outcome: { runs, isWicket, outcomeLabel, timingGrade },
        matchState: {
          currentRuns: newRuns,
          wicketsLost: newWickets,
          currentBall: newBallCount,
          oversFormatted: `${Math.floor(newBallCount / 6)}.${newBallCount % 6}`,
          totalBalls,
          ballsLeft,
          runsNeeded: Math.max(0, runsNeeded),
          rrr: ballsLeft > 0 ? ((Math.max(0, runsNeeded) / ballsLeft) * 6).toFixed(1) : "0.0",
          isMatchOver,
          matchWinner
        },
        earnedXP,
        earnedCoins
      },
      user
    };
  }

  processLocalBuy(username, itemId, category) {
    const user = this.getLocalUser(username);
    const catalog = CLIENT_SEED_CATALOG[category];
    const item = catalog ? catalog.find((i) => i.id === itemId) : null;

    if (!item) return { success: false, error: "Item not found" };

    const isSquad = category === "squad";
    const userList = isSquad ? (user.squad || []) : user.inventory;

    if (userList.includes(itemId)) return { success: false, error: "Item already acquired!" };
    if (user.coins < item.price) return { success: false, error: "Insufficient coins!" };

    user.coins -= item.price;
    if (isSquad) {
      if (!user.squad) user.squad = [];
      user.squad.push(itemId);
    } else {
      user.inventory.push(itemId);
    }
    this.saveLocalUser(user);
    return { success: true, message: `Acquired ${item.name}!`, user };
  }

  processLocalEquip(username, itemId, category) {
    const user = this.getLocalUser(username);
    const catMap = { bats: "bat", balls: "ball", pitches: "pitch", titles: "title" };
    const slot = catMap[category] || category;
    if (!user.inventory.includes(itemId)) return { success: false, error: "Item not owned" };

    user.equipped[slot] = itemId;
    this.saveLocalUser(user);
    return { success: true, message: `Equipped item!`, user };
  }
}

window.apiClient = new APIClient();
