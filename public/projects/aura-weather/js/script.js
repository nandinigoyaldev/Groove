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
    this.sourceNode = null;
    this.lfoNode = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  playRickshawHorn() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Quick double beep beep!
    const triggerBeep = (time) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, time); // Rickshaw high pitch horn
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    };

    triggerBeep(now);
    triggerBeep(now + 0.18);
  }

  start(condition, city) {
    if (this.isPlaying) this.stop();
    this.isPlaying = true;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    const isRain = condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm");
    const isDelhi = city.toLowerCase() === "delhi";

    if (isRain) {
      // Synthesize rain using white noise + low pass filter
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.sourceNode = this.ctx.createBufferSource();
      this.sourceNode.buffer = noiseBuffer;
      this.sourceNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450; // Muffled rain sound

      // Modulate volume slightly to simulate rain waves
      this.lfoNode = this.ctx.createGain();
      this.lfoNode.gain.setValueAtTime(0.05, this.ctx.currentTime);

      this.sourceNode.connect(filter);
      filter.connect(this.lfoNode);
      this.lfoNode.connect(this.gainNode);
      this.sourceNode.start();
      
      statusText.innerHTML = "BROADCAST: RAIN WEATHER NOISE";
    } else {
      // Synthesize sunny sound: Warm sine major chords
      const notes = [293.66, 369.99, 440.00]; // D major chord
      this.sourceNode = [];
      
      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        oscGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.gainNode);
        osc.start();
        this.sourceNode.push(osc);
      });

      statusText.innerHTML = "BROADCAST: SUNNY SUMMER CHORD";
    }

    if (isDelhi) {
      statusText.innerHTML = "TUNE: DELHI AM // AUTO-RICKSHAW DETECTED";
      // Honk the horn!
      setTimeout(() => this.playRickshawHorn(), 400);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.sourceNode) {
      if (Array.isArray(this.sourceNode)) {
        this.sourceNode.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
      } else {
        try { this.sourceNode.stop(); } catch(e){}
      }
      this.sourceNode = null;
    }
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
    temp = 38; // Sunny & Hot in Delhi mock
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
