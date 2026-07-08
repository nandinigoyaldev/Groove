const baseURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const apiKey = "ff19c9d8dacd0e5f339bc5f242cd49fe";

// DOM elements
const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("enter-button");
const weatherIcon = document.querySelector(".weather-icon");
const toggleBtn = document.getElementById("toggle-broadcast");
const delhiBtn = document.getElementById("delhi-shortcut");
const tempNeedle = document.getElementById("temp-needle");
const statusText = document.getElementById("audio-status");

let activeWeather = "clear";
let activeCity = "San Francisco";
let activeTemp = 18;

// Custom dynamic sound synthesizer
class WeatherRadio {
  constructor() {
    this.ctx = null;
    this.audioNodes = [];
    this.isPlaying = false;
    this.melodyInterval = null;
  }

  playRickshawHorn() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Funny double squeaky horn
    const triggerBeep = (time, freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    };

    triggerBeep(now, 900);
    triggerBeep(now + 0.12, 950);
  }

  start(condition, city) {
    if (this.isPlaying) this.stop();
    this.isPlaying = true;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const isRain = condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm");
    const isDelhi = city.toLowerCase() === "delhi";

    if (isRain) {
      // 1. Rainy Ambient Sound: Soft white noise rain hiss
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSource.start();
      this.audioNodes.push(noiseSource);

      // 2. Nostalgic Melancholy Rain Melody: Slow cozy minor progression
      // Plays a recurring soft chime note every 2 seconds
      const notes = [220.00, 261.63, 293.66, 329.63]; // A minor progression (A, C, D, E)
      let noteIdx = 0;

      const playRainChime = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx], now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.5); // Soft slow attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // Long fade

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2);

        noteIdx = (noteIdx + 1) % notes.length;
      };

      playRainChime();
      this.melodyInterval = setInterval(playRainChime, 2000);
      statusText.innerHTML = "TUNE: COZY RAIN MELODY 🌧️🎵";
    } else {
      // Sunny Ambient Sound: Bouncy, happy, nostalgic cartoon arpeggio (C Major)
      const arpeggio = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C, E, G, C5
      let step = 0;

      const playSunnyStep = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle'; // Sweet cartoony sound
        osc.frequency.setValueAtTime(arpeggio[step], now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);

        step = (step + 1) % arpeggio.length;
      };

      playSunnyStep();
      this.melodyInterval = setInterval(playSunnyStep, 400); // Quick bouncy tempo
      statusText.innerHTML = "TUNE: NOSTALGIC SUNSHINE CHIME ☀️✨";
    }

    if (isDelhi) {
      statusText.innerHTML = "TUNE: DELHI AM // AUTO-RICKSHAW HONK 🛺";
      // Honk the cartoon rickshaw horn!
      setTimeout(() => this.playRickshawHorn(), 400);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    this.audioNodes.forEach(node => {
      try { node.stop(); } catch(e){}
    });
    this.audioNodes = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

const weatherRadio = new WeatherRadio();
let signalInterval = null;

function animateSignal(active) {
  const bars = [
    document.getElementById('signal-bar-1'),
    document.getElementById('signal-bar-2'),
    document.getElementById('signal-bar-3')
  ];

  if (active) {
    if (signalInterval) clearInterval(signalInterval);
    signalInterval = setInterval(() => {
      bars.forEach(bar => {
        if (bar) {
          if (Math.random() > 0.4) {
            bar.classList.add('active');
          } else {
            bar.classList.remove('active');
          }
        }
      });
    }, 150);
  } else {
    if (signalInterval) clearInterval(signalInterval);
    bars.forEach(bar => bar?.classList.remove('active'));
  }
}

// Toggle broadcast
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (weatherRadio.isPlaying) {
      weatherRadio.stop();
      toggleBtn.classList.remove('playing');
      toggleBtn.innerHTML = '<i class="fa-solid fa-play" id="play-icon"></i> LISTEN BROADCAST';
      animateSignal(false);
      statusText.innerHTML = "SELECT STATION BROADCAST";
    } else {
      weatherRadio.start(activeWeather, activeCity);
      toggleBtn.classList.add('playing');
      toggleBtn.innerHTML = '<i class="fa-solid fa-stop" id="play-icon"></i> STOP BROADCAST';
      animateSignal(true);
    }
  });
}

// Delhi AM Tuning shortcut
if (delhiBtn) {
  delhiBtn.addEventListener('click', () => {
    if (searchBox) searchBox.value = "Delhi";
    checkWeather("Delhi");
  });
}

async function checkWeather(city) {
  if (!city) return;
  activeCity = city;

  try {
    const response = await fetch(`${baseURL}&q=${city}&appid=${apiKey}`);

    if (!response.ok) {
      useMockWeather(city);
      return;
    }

    const data = await response.json();
    updateWeatherUI(data);
  } catch (err) {
    console.warn("Weather API unreachable. Falling back to mock data.", err);
    useMockWeather(city);
  }
}

function updateWeatherUI(data) {
  const cityEl = document.querySelector(".city-name");
  const tempEl = document.querySelector(".temperature");
  const windEl = document.querySelector(".wind");
  const humidityEl = document.querySelector(".humidity");
  const descEl = document.querySelector(".weather-desc");

  activeTemp = Math.round(data.main.temp);
  activeWeather = data.weather && data.weather[0] ? data.weather[0].main.toLowerCase() : "clear";

  if (cityEl) cityEl.innerHTML = data.name;
  if (tempEl) tempEl.innerHTML = activeTemp + "°C";
  if (windEl) windEl.innerHTML = data.wind.speed + " km/h";
  if (humidityEl) humidityEl.innerHTML = data.main.humidity + "%";
  if (descEl && data.weather && data.weather[0]) {
    descEl.innerHTML = data.weather[0].description;
  }

  // Update analog needle dial (-10C to 45C mapped to 0-100%)
  if (tempNeedle) {
    const needleLeft = Math.max(0, Math.min(100, ((activeTemp + 10) / 55) * 100));
    tempNeedle.style.left = needleLeft + '%';
  }

  // Restart sound to match new weather if playing
  if (weatherRadio.isPlaying) {
    weatherRadio.start(activeWeather, activeCity);
  }
}

function useMockWeather(city) {
  let temp = 18 + Math.floor(Math.random() * 8);
  let condition = "clear";
  
  if (city.toLowerCase() === "delhi") {
    temp = 38;
    condition = "clear";
  } else if (city.toLowerCase() === "london") {
    temp = 12;
    condition = "rain";
  }

  const mockData = {
    name: city.charAt(0).toUpperCase() + city.slice(1),
    main: { temp: temp, humidity: 65 + Math.floor(Math.random() * 10) },
    wind: { speed: 12 + Math.floor(Math.random() * 6) },
    weather: [{ main: condition, description: condition === "rain" ? "showers" : "sunny sky" }]
  };
  updateWeatherUI(mockData);
}

// Search interactions
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    checkWeather(city);
  });
}

if (searchBox) {
  searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkWeather(searchBox.value.trim());
    }
  });
}

// Load default city on page load
document.addEventListener("DOMContentLoaded", () => {
  checkWeather(searchBox?.value.trim() || "San Francisco");
});
