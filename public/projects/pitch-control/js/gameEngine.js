/**
 * Hype & Fire Arcade Game Engine for Pitch (Groove LP // 06)
 * Manages combos, super power energy meter, directional field gap placement, and game modes.
 */

const BOWLERS = [
  { name: "Bumrah", type: "Slower Yorker" },
  { name: "Rashid Khan", type: "Leg Spin Wrong'un" },
  { name: "Shami", type: "Pace Inswing" },
  { name: "Starc", type: "Left-Arm Bouncer" },
  { name: "Jadeja", type: "Left-Arm Arm Ball" }
];

const BROADCAST_COMMENTARY = {
  superSix: [
    "🔥 UNSTOPPABLE HELICOPTER SLAM! 115m METEORIC SIX INTO THE STANDS!",
    "⚡ MAXIMUM POWER UNLEASHED! Cleared the stadium roof with sheer force!",
    "💥 MONSTER STRIKE! Golden firework beam into deep mid-wicket!"
  ],
  six: [
    "CLOBBERED INTO THE STANDS! Pure sweet-spot contact for a massive 6!",
    "HIGH AND MIGHTY! Cleared the boundary rope with absolute ease!",
    "POWERFUL TIMING! Dispatched way back over long-on!",
    "INTO THE CROWD! Clean lofted strike under pressure!"
  ],
  four: [
    "CRACKING DRIVE! Pierced the fielder gap for a brilliant 4!",
    "BEAUTIFUL PLACEMENT! Perfectly threaded between Cover and Mid-off!",
    "ONE BOUNCE OVER THE ROPE! Exceptional directional placement!",
    "BEAT THE FIELDER! Outfielders had zero chance against that placement!"
  ],
  runs: [
    "Pushed smartly into the open outfield gap for runs.",
    "Driven down to long-on for a comfortable double.",
    "Worked away to deep mid-wicket into the clear zone."
  ],
  wicket: [
    "BOWLED HIM! Cleaned up by seam movement! Huge breakthrough!",
    "CAUGHT IN THE GAPS! Fielder takes a brilliant diving catch!",
    "LBW DECISION! Trapped right in front of middle stump!",
    "CAUGHT BEHIND! Thin edge taken cleanly behind the stumps!"
  ],
  dot: [
    "DOT BALL! Well bowled into the bowler's channel.",
    "SOLID BLOCK! Stopped by cover fielder, no run.",
    "BEATEN BY PACE! Swing and a miss outside off."
  ]
};

class GameEngine {
  constructor() {
    this.gameMode = "classic"; // 'classic', 'superover', 'thriller', 'derby', 'tournament'
    this.tournamentStage = 0;

    this.currentRuns = 0;
    this.wicketsLost = 0;
    this.currentBall = 0;
    this.totalBalls = 12;
    this.targetScore = 24;
    this.maxWickets = 3;

    // Hype Mechanics
    this.comboStreak = 0;
    this.powerMeter = 0; // 0 to 100%
    this.isSuperPowerActive = false;

    this.isDelivering = false;
    this.lastDelivery = null;
    this.lastOutcome = null;
    this.currentBowler = BOWLERS[0];
    this.overHistory = [];

    this.commentary = "Match Ready. Select your directional shot and press STRIKE!";
    this.commentaryDetail = `Facing ${this.currentBowler.name} (${this.currentBowler.type})`;
  }

  async startNewMatch(username = "Player1", mode = "classic") {
    this.gameMode = mode;
    const response = await window.apiClient.startMatch({ username, gameMode: mode });

    if (response && response.success) {
      const cfg = response.matchConfig;
      this.totalBalls = mode === "thriller" ? 6 : (mode === "derby" ? 10 : cfg.totalBalls);
      this.targetScore = mode === "thriller" ? 18 : (mode === "derby" ? 30 : cfg.targetScore);
      this.maxWickets = mode === "superover" ? 2 : (mode === "thriller" ? 2 : 3);
      this.currentBall = 0;
      this.currentRuns = 0;
      this.wicketsLost = 0;
      this.comboStreak = 0;
      this.powerMeter = 30; // Start with partial power
      this.isSuperPowerActive = false;
      this.isDelivering = false;
      this.lastDelivery = null;
      this.lastOutcome = null;
      this.overHistory = [];
      this.currentBowler = this.nextBowler();

      this.commentary = `${mode.toUpperCase()} MODE STARTED! Target: ${this.targetScore} Runs in ${this.totalBalls} Balls`;
      this.commentaryDetail = `Facing ${this.currentBowler.name} (${this.currentBowler.type}). Req Rate: ${((this.targetScore / this.totalBalls) * 6).toFixed(1)} RPO`;
      return response;
    }
    return null;
  }

  nextBowler() {
    return BOWLERS[Math.floor(Math.random() * BOWLERS.length)];
  }

  activateSuperPower() {
    if (this.powerMeter >= 100 && !this.isSuperPowerActive) {
      this.isSuperPowerActive = true;
      window.soundEngine.play("coin");
      return true;
    }
    return false;
  }

  async playBall(username, shotChoice, timingIndex) {
    if (this.isDelivering) return null;
    this.isDelivering = true;

    window.soundEngine.play("click");

    // Compute Hype Mechanics
    const accuracy = 1.0 - (Math.abs(timingIndex - 0.5) * 2);
    let runs = 0;
    let isWicket = false;
    let isSuperSix = false;

    if (this.isSuperPowerActive) {
      // HELICOPTER POWER SLAM!
      runs = 6;
      isWicket = false;
      isSuperSix = true;
      this.isSuperPowerActive = false;
      this.powerMeter = 0;
      this.comboStreak += 1;
    } else {
      if (accuracy < 0.22) {
        if (Math.random() < 0.5) {
          isWicket = true;
          this.comboStreak = 0;
        } else {
          runs = 0;
          this.comboStreak = 0;
        }
      } else if (accuracy >= 0.72) {
        runs = (shotChoice === "loft" || shotChoice === "onside" || shotChoice === "scoop") ? 6 : 4;
        this.comboStreak += 1;
        this.powerMeter = Math.min(100, this.powerMeter + 25);
      } else if (accuracy >= 0.45) {
        runs = (shotChoice === "loft") ? 4 : (shotChoice === "straight" ? 3 : 2);
        this.comboStreak += 1;
        this.powerMeter = Math.min(100, this.powerMeter + 15);
      } else {
        runs = shotChoice === "defend" ? 0 : 1;
        if (runs === 0) this.comboStreak = 0;
        this.powerMeter = Math.min(100, this.powerMeter + 8);
      }
    }

    // Apply Streak Multiplier
    let streakMultiplier = 1.0;
    if (this.comboStreak >= 5) streakMultiplier = 3.0;
    else if (this.comboStreak >= 3) streakMultiplier = 2.0;
    else if (this.comboStreak >= 2) streakMultiplier = 1.5;

    const finalRuns = Math.round(runs * streakMultiplier);

    const payload = {
      username,
      shotChoice,
      timingIndex,
      gameMode: this.gameMode,
      currentRuns: this.currentRuns,
      wicketsLost: this.wicketsLost,
      currentBall: this.currentBall,
      totalBalls: this.totalBalls,
      targetScore: this.targetScore,
      maxWickets: this.maxWickets
    };

    const response = await window.apiClient.deliverBall(payload);

    if (response && response.success) {
      const res = response.result;
      res.outcome.runs = finalRuns;
      res.outcome.isWicket = isWicket;
      res.outcome.isSuperSix = isSuperSix;
      res.outcome.streakMultiplier = streakMultiplier;
      res.outcome.comboStreak = this.comboStreak;

      const newRuns = this.currentRuns + finalRuns;
      const newWickets = this.wicketsLost + (isWicket ? 1 : 0);
      const newBallCount = this.currentBall + 1;
      const ballsLeft = this.totalBalls - newBallCount;
      const runsNeeded = Math.max(0, this.targetScore - newRuns);

      const isTargetAchieved = newRuns >= this.targetScore;
      const isAllOut = newWickets >= this.maxWickets;
      const isBallsExhausted = newBallCount >= this.totalBalls;
      const isMatchOver = isTargetAchieved || isAllOut || isBallsExhausted;
      const matchWinner = isTargetAchieved ? "player" : (isMatchOver ? "computer" : null);

      this.currentRuns = newRuns;
      this.wicketsLost = newWickets;
      this.currentBall = newBallCount;

      res.matchState = {
        currentRuns: newRuns,
        wicketsLost: newWickets,
        currentBall: newBallCount,
        oversFormatted: `${Math.floor(newBallCount / 6)}.${newBallCount % 6}`,
        totalBalls: this.totalBalls,
        ballsLeft,
        runsNeeded,
        rrr: ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(1) : "0.0",
        isMatchOver,
        matchWinner
      };

      // Update Over History Tracker
      const ballLabel = isWicket ? "W" : String(finalRuns);
      this.overHistory.push(ballLabel);
      if (this.overHistory.length > 6) {
        this.overHistory.shift();
      }

      this.currentBowler = this.nextBowler();
      res.delivery = { bowler: this.currentBowler, shotChoice };

      // Update Audio FX
      if (isSuperSix) {
        window.soundEngine.play("win");
        setTimeout(() => window.soundEngine.play("cheer"), 100);
      } else if (isWicket) {
        window.soundEngine.play("stump");
      } else if (finalRuns >= 4) {
        window.soundEngine.play("hit");
        setTimeout(() => window.soundEngine.play("cheer"), 100);
      } else if (finalRuns > 0) {
        window.soundEngine.play("hit");
      }

      this.updateCommentary(res.outcome, res.matchState);

      if (isMatchOver) {
        if (matchWinner === "player") {
          window.soundEngine.play("win");
        } else {
          window.soundEngine.play("lose");
        }
      }

      this.isDelivering = false;
      return res;
    }

    this.isDelivering = false;
    return null;
  }

  updateCommentary(outcome, state) {
    if (outcome.isSuperSix) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.superSix);
      this.commentaryDetail = `🔥 HELICOPTER POWER SLAM! +${outcome.runs} RUNS (x${outcome.streakMultiplier} Multiplier)!`;
    } else if (outcome.isWicket) {
      this.commentary = "WICKET FALLS! Fielder takes clean catch!";
      this.commentaryDetail = `Wickets: ${state.wicketsLost}/${this.maxWickets}. Facing ${this.currentBowler.name} (${this.currentBowler.type})`;
    } else if (outcome.runs >= 6) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.six);
      this.commentaryDetail = `Streak x${outcome.streakMultiplier}! Facing ${this.currentBowler.name} (${this.currentBowler.type})`;
    } else if (outcome.runs >= 4) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.four);
      this.commentaryDetail = `Placed into field gap for 4! Facing ${this.currentBowler.name} (${this.currentBowler.type})`;
    } else if (outcome.runs > 0) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.runs);
      this.commentaryDetail = `Pushed for ${outcome.runs} run(s). Need ${state.runsNeeded} off ${state.ballsLeft} balls.`;
    } else {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.dot);
      this.commentaryDetail = `Dot ball! Pressure building. Req Rate: ${state.rrr}`;
    }
  }

  getRandomTemplate(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
}

window.gameEngine = new GameEngine();
