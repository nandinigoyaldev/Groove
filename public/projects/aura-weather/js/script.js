const baseURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const apiKey = "ff19c9d8dacd0e5f339bc5f242cd49fe";

// DOM elements
const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("enter-button");
const weatherIcon = document.querySelector(".weather-icon");
const toggleBtn = document.getElementById("toggle-broadcast");
const playIcon = document.getElementById("play-icon");

// Custom Audio Synthesizer for Radio Static/Hum
class RadioBroadcast {
  constructor() {
    this.ctx = null;
    this.staticNode = null;
    this.humNode = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create white noise static
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.015; // Soft static hiss
    }
    
    this.staticNode = this.ctx.createBufferSource();
    this.staticNode.buffer = noiseBuffer;
    this.staticNode.loop = true;

    // Create 60Hz radio hum oscillator
    this.humNode = this.ctx.createOscillator();
    this.humNode.type = 'sine';
    this.humNode.frequency.setValueAtTime(60, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.staticNode.connect(filter);
    this.humNode.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.staticNode.start();
    this.humNode.start();
  }

  stop() {
    this.isPlaying = false;
    if (this.staticNode) {
      try { this.staticNode.stop(); } catch(e){}
    }
    if (this.humNode) {
      try { this.humNode.stop(); } catch(e){}
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

const radio = new RadioBroadcast();
let signalInterval = null;

function animateSignal(active) {
  const bars = [
    document.getElementById('signal-bar-1'),
    document.getElementById('signal-bar-2'),
    document.getElementById('signal-bar-3')
  ];

  if (active) {
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

// Toggle play button
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (radio.isPlaying) {
      radio.stop();
      toggleBtn.classList.remove('playing');
      toggleBtn.innerHTML = '<i class="fa-solid fa-play" id="play-icon"></i> LISTEN FM 108.0';
      animateSignal(false);
    } else {
      radio.start();
      toggleBtn.classList.add('playing');
      toggleBtn.innerHTML = '<i class="fa-solid fa-stop" id="play-icon"></i> STATIC PLAYING';
      animateSignal(true);
    }
  });
}

async function checkWeather(city) {
  if (!city) return;

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

  if (cityEl) cityEl.innerHTML = data.name;
  if (tempEl) tempEl.innerHTML = Math.round(data.main.temp) + "°C";
  if (windEl) windEl.innerHTML = data.wind.speed + " km/h";
  if (humidityEl) humidityEl.innerHTML = data.main.humidity + "%";
  if (descEl && data.weather && data.weather[0]) {
    descEl.innerHTML = data.weather[0].description;
  }
}

function useMockWeather(city) {
  const mockData = {
    name: city.charAt(0).toUpperCase() + city.slice(1),
    main: { temp: 18 + Math.floor(Math.random() * 8), humidity: 65 + Math.floor(Math.random() * 10) },
    wind: { speed: 12 + Math.floor(Math.random() * 6) },
    weather: [{ main: "Clouds", description: "scattered clouds" }]
  };
  updateWeatherUI(mockData);
}

// Event listener for search button
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
