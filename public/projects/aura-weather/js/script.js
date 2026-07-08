const baseURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const apiKey = "ff19c9d8dacd0e5f339bc5f242cd49fe";

// DOM elements
const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("enter-button");
const weatherIcon = document.querySelector(".weather-icon");
const humidityIcon = document.querySelector(".humidity-icon");
const windIcon = document.querySelector(".wind-icon");

async function checkWeather(city) {
  if (!city) return;

  try {
    const response = await fetch(`${baseURL}&q=${city}&appid=${apiKey}`);

    if (!response.ok) {
      alert("City not found!");
      return;
    }

    const data = await response.json();
    console.log(data);

    document.querySelector(".city-name").innerHTML = data.name;
    document.querySelector(".temperature").innerHTML =
      Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    // Weather condition icon handling
    const condition = data.weather[0].main.toLowerCase();

    const icons = {
      clear: "assets/sunny.png",
      clouds: "assets/cloudy.png",
      rain: "assets/heavy-rain.png",
      drizzle: "assets/drizzle.png",
      thunderstorm: "assets/thunderstrom.png",
      snow: "assets/snow.png",
      mist: "assets/mist.png",
      fog: "assets/fog.png",
      haze: "assets/haze.png",
      dust: "assets/broom.png",
      wind: "assets/wind.png",
      humidity: "assets/humidity.png",
    };

    weatherIcon.src = icons[condition] || "assets/sunny.png";
    humidityIcon.src = icons.humidity;
    windIcon.src = icons.wind;
  } catch (err) {
    console.error("Weather API error:", err);
    alert("Unable to fetch weather data.");
  }
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  checkWeather(city);
});

// Load default city on page load
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  checkWeather(searchBox.value.trim() || "New York");
});

// Initialize EmailJS
(function () {
  emailjs.init("86DpoOTsPkjJZkQy2");
})();

// Handle contact form submission
function handleSubmit() {
  const form = document.getElementById("contact");

  emailjs
    .sendForm("service_1oivpvl", "template_wl51hhd", form)
    .then((response) => {
      console.log("Success:", response);
      alert("Your message has been sent!");
      form.reset();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Something went wrong. Please try again later.");
    });
}
