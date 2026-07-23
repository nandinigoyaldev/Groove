/**
 * Game Engine Controller for Pitch (Groove LP // 06)
 * Manages match state, ball-by-ball progression, timing sweeper gauge, overs, wickets, and commentary.
 */

const BROADCAST_COMMENTARY = {
  six: [
    "CLOBBERED INTO THE STANDS! Pure sweet-spot contact for a massive 6!",
    "HIGH AND MIGHTY! Cleared the boundary rope with absolute ease!",
    "POWERFUL TIMING! Dispatched way back over long-on!",
    "INTO THE CROWD! Clean lofted strike under immense pressure!"
  ],
  four: [
    "CRACKING DRIVE! Races across the outfield for a brilliant 4!",
    "BEAUTIFUL FOOTWORK! Placed cleanly between cover and mid-off!",
    "ONE BOUNCE OVER THE ROPE! Exceptional precision strike!",
    "PIERCED THE GAP! Fielders had no chance against that placement!"
  ],
  runs: [
    "Pushed softly into the gap for a quick run.",
    "Driven down to long-on for a comfortable double.",
    "Worked away to deep mid-wicket for runs."
  ],
  wicket: [
    "BOWLED HIM! Cleaned up by seam movement! Huge breakthrough!",
    "CAUGHT AT COVER! Mis-timed shot pops straight to the fielder!",
    "LBW DECISION! Trapped right in front of the middle stump!",
    "CAUGHT BEHIND! Thin edge taken cleanly behind the stumps!"
  ],
  dot: [
    "DOT BALL! Well bowled, beats the bat outside off stump.",
    "SOLID DEFENCE! Blocked cleanly, no run on offer.",
    "SWING AND A MISS! Beaten by pace off the pitch."
  ]
};

const TOURNAMENT_TEAMS = [
  { id: 1, name: "Mumbai Strikers", captain: "Captain Rohit", targetBonus: 0, icon: "🛡️" },
  { id: 2, name: "Chennai SuperStars", captain: "Captain Dhoni", targetBonus: 4, icon: "⚡" },
  { id: 3, name: "Bangalore Blitz", captain: "Captain Virat", targetBonus: 8, icon: "🔥" }
];

class GameEngine {
  constructor() {
    this.gameMode = "classic"; // 'classic', 'superover', 'tournament'
    this.tournamentStage = 0;

    this.currentRuns = 0;
    this.wicketsLost = 0;
    this.currentBall = 0;
    this.totalBalls = 12;
    this.targetScore = 24;
    this.maxWickets = 3;

    this.isDelivering = false;
    this.lastDelivery = null;
    this.lastOutcome = null;
    this.commentary = "Select your shot type and hit the timing sweet-spot to chase the target!";
    this.commentaryDetail = "Match Ready. Bowler approaching crease...";
  }

  async startNewMatch(username = "Player1", mode = "classic") {
    this.gameMode = mode;
    const response = await window.apiClient.startMatch({ username, gameMode: mode });

    if (response && response.success) {
      const cfg = response.matchConfig;
      this.totalBalls = cfg.totalBalls;
      this.targetScore = cfg.targetScore;
      this.maxWickets = cfg.maxWickets;
      this.currentBall = 0;
      this.currentRuns = 0;
      this.wicketsLost = 0;
      this.isDelivering = false;
      this.lastDelivery = null;
      this.lastOutcome = null;
      this.commentary = `CHASE STARTED! Target: ${this.targetScore} Runs in ${cfg.maxOvers} Overs (${cfg.totalBalls} Balls)`;
      this.commentaryDetail = `Req. Run Rate: ${((this.targetScore / cfg.totalBalls) * 6).toFixed(1)} RPO. Pick your shot!`;
      return response;
    }
    return null;
  }

  async playBall(username, shotChoice, timingIndex) {
    if (this.isDelivering) return null;
    this.isDelivering = true;

    window.soundEngine.play("click");

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
      this.lastDelivery = res.delivery;
      this.lastOutcome = res.outcome;
      this.currentRuns = res.matchState.currentRuns;
      this.wicketsLost = res.matchState.wicketsLost;
      this.currentBall = res.matchState.currentBall;

      // Update audio FX
      if (res.outcome.isWicket) {
        window.soundEngine.play("stump");
      } else if (res.outcome.runs === 6 || res.outcome.runs === 4) {
        window.soundEngine.play("hit");
        setTimeout(() => window.soundEngine.play("cheer"), 100);
      } else if (res.outcome.runs > 0) {
        window.soundEngine.play("hit");
      }

      this.updateCommentary(res.outcome, res.matchState);

      if (res.matchState.isMatchOver) {
        if (res.matchState.matchWinner === "player") {
          window.soundEngine.play("win");
          if (this.gameMode === "tournament" && this.tournamentStage < TOURNAMENT_TEAMS.length - 1) {
            this.tournamentStage += 1;
          }
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
    if (outcome.isWicket) {
      this.commentary = outcome.wicketType || "WICKET FALLS!";
      this.commentaryDetail = `Wickets: ${state.wicketsLost}/${this.maxWickets}. Required: ${state.runsNeeded} off ${state.ballsLeft} balls.`;
    } else if (outcome.runs === 6) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.six);
      this.commentaryDetail = `Timing Grade: ${outcome.timingGrade} | RRR: ${state.rrr}`;
    } else if (outcome.runs === 4) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.four);
      this.commentaryDetail = `Timing Grade: ${outcome.timingGrade} | RRR: ${state.rrr}`;
    } else if (outcome.runs > 0) {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.runs);
      this.commentaryDetail = `Pushed for ${outcome.runs} run(s). Need ${state.runsNeeded} in ${state.ballsLeft} balls.`;
    } else {
      this.commentary = this.getRandomTemplate(BROADCAST_COMMENTARY.dot);
      this.commentaryDetail = `Dot ball! Pressure building. RRR rises to ${state.rrr}`;
    }
  }

  getRandomTemplate(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  getOversFormatted() {
    return `${Math.floor(this.currentBall / 6)}.${this.currentBall % 6}`;
  }
}

window.gameEngine = new GameEngine();
window.TOURNAMENT_TEAMS = TOURNAMENT_TEAMS;
