const baseURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const apiKey = "ff19c9d8dacd0e5f339bc5f242cd49fe";

// DOM elements
const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("enter-button");
const weatherIconFa = document.getElementById("weather-icon-fa");
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
    
    // Squeaky double-squeak auto-rickshaw horn
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
    const cond = condition.toLowerCase();
    const isDelhi = city.toLowerCase() === "delhi";

    if (cond === "rainy" || cond === "stormy") {
      // 1. Rain Static Noise
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
      filter.frequency.value = cond === "stormy" ? 380 : 500; // Stormy is lower/heavier

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(cond === "stormy" ? 0.08 : 0.05, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSource.start();
      this.audioNodes.push(noiseSource);

      // 2. Slow cozy minor progression chimes
      const notes = cond === "stormy" ? [196.00, 220.00, 246.94] : [220.00, 261.63, 293.66, 329.63]; 
      let noteIdx = 0;

      const playRainChime = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx], now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2);

        // Rare thunder rumble on storm
        if (cond === "stormy" && Math.random() > 0.6) {
          this.playThunderRumble(now + 0.2);
        }

        noteIdx = (noteIdx + 1) % notes.length;
      };

      playRainChime();
      this.melodyInterval = setInterval(playRainChime, 2000);
      statusText.innerHTML = cond === "stormy" ? "TUNE: HEAVY STORM RUMBLE ⛈️⚡" : "TUNE: COZY RAIN MELODY 🌧️🎵";

    } else if (cond === "snowy") {
      // Sparkling high-pitched winter chimes
      const snowChimes = [783.99, 880.00, 987.77, 1046.50]; // G5, A5, B5, C6
      let step = 0;

      const playSnowStep = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(snowChimes[step], now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);

        step = (step + 1) % snowChimes.length;
      };

      playSnowStep();
      this.melodyInterval = setInterval(playSnowStep, 1500);
      statusText.innerHTML = "TUNE: SPARKLING WINTER CHIME ❄️✨";

    } else if (cond === "cloudy") {
      // Overcast: Deep warm atmospheric low-frequency drone
      const playCloudDrone = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 110.00; // Low A
        osc2.type = 'sine';
        osc2.frequency.value = 165.00; // Low E (Fifth interval)

        gain.gain.setValueAtTime(0.06, now);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        this.audioNodes.push(osc1, osc2);
      };

      playCloudDrone();
      statusText.innerHTML = "TUNE: ATMOSPHERIC OVERCAST DRONE ☁️🌫️";

    } else {
      // Sunny: Bouncy, happy, nostalgic cartoon arpeggio (C Major)
      const arpeggio = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
      let step = 0;

      const playSunnyStep = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
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
      this.melodyInterval = setInterval(playSunnyStep, 400);
      statusText.innerHTML = "TUNE: NOSTALGIC SUNSHINE CHIME ☀️✨";
    }

    if (isDelhi) {
      statusText.innerHTML = "TUNE: DELHI AM // AUTO-RICKSHAW HONK 🛺";
      setTimeout(() => this.playRickshawHorn(), 400);
    }
  }

  playThunderRumble(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, time); // Very low rumble frequency
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(70, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.1);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 2);
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

// Geocode and Fetch real weather via Open-Meteo
async function checkWeather(city) {
  if (!city) return;
  activeCity = city;

  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geoResponse.ok) throw new Error('Geocoding error');
    
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      alert("City not found!");
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
    if (!weatherResponse.ok) throw new Error('Weather fetching error');

    const weatherData = await weatherResponse.json();
    updateWeatherUI(name, weatherData.current);
  } catch (err) {
    console.error("Open-Meteo API error:", err);
    alert("Unable to fetch weather data.");
  }
}

// Map WMO weather codes to condition strings and FontAwesome icons
function mapWMOCode(code) {
  if (code === 0) return { name: "Clear", iconClass: "fa-sun", class: "state-clear" };
  if (code >= 1 && code <= 3) return { name: "Cloudy", iconClass: "fa-cloud", class: "state-cloudy" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { name: "Rainy", iconClass: "fa-cloud-showers-heavy", class: "state-rainy" };
  if (code >= 71 && code <= 77) return { name: "Snowy", iconClass: "fa-snowflake", class: "state-snowy" };
  if (code >= 95) return { name: "Stormy", iconClass: "fa-cloud-bolt", class: "state-stormy" };
  return { name: "Cloudy", iconClass: "fa-cloud", class: "state-cloudy" };
}

function updateWeatherUI(cityName, current) {
  const cityEl = document.querySelector(".city-name");
  const tempEl = document.querySelector(".temperature");
  const windEl = document.querySelector(".wind");
  const humidityEl = document.querySelector(".humidity");
  const descEl = document.querySelector(".weather-desc");

  activeTemp = Math.round(current.temperature_2m);
  const condition = mapWMOCode(current.weather_code);
  activeWeather = condition.name.toLowerCase();

  if (cityEl) cityEl.innerHTML = cityName;
  if (tempEl) tempEl.innerHTML = activeTemp + "°C";
  if (windEl) windEl.innerHTML = Math.round(current.wind_speed_10m) + " km/h";
  if (humidityEl) humidityEl.innerHTML = current.relative_humidity_2m + "%";
  if (descEl) descEl.innerHTML = condition.name;
  
  if (weatherIconFa) {
    // Reset classes and set exact FontAwesome weather icon
    weatherIconFa.className = `fa-solid ${condition.iconClass} ${condition.class}`;
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
  checkWeather("Delhi");
});
