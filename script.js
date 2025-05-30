// API key for OpenWeatherMap
const API_KEY = 'af4449386893999d3c0e3dba7128eaa1';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherContainer = document.getElementById('weather-container');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const themeToggle = document.getElementById('theme-toggle');
const initialLoader = document.getElementById('initial-loader');

// Hide initial loader
function hideInitialLoader() {
    initialLoader.classList.add('fade-out');
    setTimeout(() => {
        initialLoader.style.display = 'none';
    }, 500);
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
        localStorage.setItem('theme', 'light');
    }
});

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

// Search by city name
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

// Enter key functionality for search
cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

// Get weather by current location
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                hideLoading();
                showError(`Geolocation error: ${error.message}`);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

// Get weather data by city name
async function getWeatherByCity(city) {
    showLoading();
    try {
        // Get current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        
        if (!currentWeatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Get forecast using coordinates from current weather
        const { lat, lon } = currentWeatherData.coord;
        getForecast(lat, lon, currentWeatherData);
        
    } catch (error) {
        hideLoading();
        showError(`Error: ${error.message}`);
    }
}

// Get weather data by coordinates
async function getWeatherByCoordinates(lat, lon) {
    showLoading();
    try {
        // Get current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        
        if (!currentWeatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Get forecast
        getForecast(lat, lon, currentWeatherData);
        
    } catch (error) {
        hideLoading();
        showError(`Error: ${error.message}`);
    }
}

// Get 5-day forecast data
async function getForecast(lat, lon, currentWeatherData) {
    try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Update UI with both current weather and forecast
        updateUI(currentWeatherData, forecastData);
        hideLoading();
        hideError();
        
    } catch (error) {
        hideLoading();
        showError(`Error: ${error.message}`);
    }
}

// Update UI with weather data
function updateUI(currentWeather, forecastData) {
    // Update current weather
    document.getElementById('city-name').textContent = `${currentWeather.name}, ${currentWeather.sys.country}`;
    document.getElementById('current-date').textContent = formatDate(new Date(), 'full');
    document.getElementById('temperature').textContent = `${Math.round(currentWeather.main.temp)}°C`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
    document.getElementById('weather-description').textContent = capitalizeFirstLetter(currentWeather.weather[0].description);
    document.getElementById('feels-like').textContent = `${Math.round(currentWeather.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${currentWeather.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${currentWeather.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${currentWeather.main.pressure} hPa`;
    
    // Update background based on weather condition
    updateWeatherBackground(currentWeather.weather[0].main.toLowerCase());
    
    // Update 5-day forecast
    updateForecast(forecastData);
    
    // Show weather container with animation
    weatherContainer.style.display = 'block';
    weatherContainer.classList.add('fade-in');
    
    // Hide initial loader after a short delay
    setTimeout(hideInitialLoader, 1000);
}

// Update weather background
function updateWeatherBackground(weatherCondition) {
    const weatherBg = document.querySelector('.weather-bg');
    
    // Remove all weather classes
    weatherBg.className = 'weather-bg';
    
    // Get current time
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;
    
    // Stop rain effect if it's active
    if (rainEffect.isActive) {
        rainEffect.stop();
    }
    
    // background will be as per the current weather condition
    const weatherMap = {
        'clear': isDaytime ? 'clear-day' : 'clear-night',
        'clouds': isDaytime ? 'clouds-day' : 'clouds-night',
        'rain': isDaytime ? 'rain-day' : 'rain-night',
        'drizzle': isDaytime ? 'rain-day' : 'rain-night',
        'thunderstorm': isDaytime ? 'thunderstorm-day' : 'thunderstorm-night',
        'snow': isDaytime ? 'snow-day' : 'snow-night',
        'mist': isDaytime ? 'mist-day' : 'mist-night',
        'fog': isDaytime ? 'mist-day' : 'mist-night',
        'haze': isDaytime ? 'mist-day' : 'mist-night',
        'smoke': isDaytime ? 'mist-day' : 'mist-night',
        'dust': isDaytime ? 'mist-day' : 'mist-night',
        'sand': isDaytime ? 'mist-day' : 'mist-night',
        'ash': isDaytime ? 'mist-day' : 'mist-night',
        'squall': isDaytime ? 'thunderstorm-day' : 'thunderstorm-night',
        'tornado': isDaytime ? 'thunderstorm-day' : 'thunderstorm-night'
    };
    
    // Add the appropriate class
    const bgClass = weatherMap[weatherCondition] || (isDaytime ? 'clear-day' : 'clear-night');
    weatherBg.classList.add(bgClass);
    
    // Initialize rain effect for rainy conditions
    if (weatherCondition === 'rain' || weatherCondition === 'drizzle') {
        rainEffect.init(isDaytime);
    }
    
    // Update theme based on time
    if (!isDaytime && !document.body.classList.contains('dark-mode')) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
}

// Update forecast section
function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    
    // Process forecast data to get one forecast per day (at 12:00)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        const hour = date.getHours();
        
        // Select midday forecasts (closest to 12:00)
        if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
            dailyForecasts[day] = item;
        }
    });
    
    // Create forecast cards with staggered animation
    Object.values(dailyForecasts).slice(0, 5).forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayName = formatDate(date, 'day');
        const monthDay = formatDate(date, 'monthDay');
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card fade-in';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
        
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${monthDay}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather icon" class="forecast-icon">
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-description">${capitalizeFirstLetter(forecast.weather[0].description)}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Helper functions
function formatDate(date, format) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    if (format === 'full') {
        return date.toLocaleDateString('en-US', options);
    } else if (format === 'day') {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (format === 'monthDay') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoading() {
    loadingIndicator.style.display = 'block';
    weatherContainer.style.display = 'none';
    weatherContainer.classList.remove('fade-in');
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message) {
    errorContainer.style.display = 'block';
    errorMessage.textContent = message;
    errorContainer.classList.add('fade-in');
}

function hideError() {
    errorContainer.style.display = 'none';
    errorContainer.classList.remove('fade-in');
}

// Load weather for default city on page load
window.addEventListener('load', () => {
    // Try to get user's location first
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                // If geolocation fails, load default city
                getWeatherByCity('London');
            }
        );
    } else {
        // If geolocation not supported, load default city
        getWeatherByCity('London');
    }
}); 