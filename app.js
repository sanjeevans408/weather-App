// Weather App JavaScript with Navigation

class WeatherApp {
    constructor() {
        this.apiKey = 'f146799a557e8ab658304c1b30cc3cfd';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentLocation = null;
        this.currentSection = 'weather';
        this.weatherIcons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '⛅',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌦️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.updateCurrentDate();
        this.handleInitialHash();
    }

    bindEvents() {
        // Weather functionality events
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const locationBtn = document.getElementById('locationBtn');
        const retryBtn = document.getElementById('retryBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        if (cityInput) {
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }

        if (locationBtn) {
            locationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGeolocation();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadDefaultWeather();
            });
        }

        // Contact form events
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Hash change event for browser back/forward
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navToggle &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target) &&
                navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                console.log('Navigation clicked:', section);
                if (section) {
                    this.navigateToSection(section);
                    // Update URL hash
                    window.history.pushState(null, '', `#${section}`);
                }
            });
        });
    }

    handleInitialHash() {
        const hash = window.location.hash.slice(1);
        const validSections = ['weather', 'about', 'contact'];

        if (hash && validSections.includes(hash)) {
            this.navigateToSection(hash);
        } else {
            this.navigateToSection('weather');
            // Load default weather only if we're on weather section
            setTimeout(() => {
                if (this.currentSection === 'weather') {
                    this.loadDefaultWeather();
                }
            }, 100);
        }
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        const validSections = ['weather', 'about', 'contact'];

        if (hash && validSections.includes(hash)) {
            this.navigateToSection(hash);
        } else if (!hash) {
            this.navigateToSection('weather');
        }
    }

    navigateToSection(sectionName) {
        console.log('Navigating to section:', sectionName);

        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section activated:', sectionName);
        } else {
            console.error('Section not found:', `${sectionName}Section`);
        }

        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });

        this.currentSection = sectionName;

        // Load weather data if navigating to weather section and no data exists
        if (sectionName === 'weather') {
            const weatherContent = document.getElementById('weatherContent');
            if (weatherContent && weatherContent.classList.contains('hidden')) {
                this.loadDefaultWeather();
            }
        }
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            currentDateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    async loadDefaultWeather() {
        // Load weather for London as default
        await this.fetchWeatherByCity('Krishnagiri');
    }

    async handleSearch() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput?.value?.trim();

        console.log('Search triggered for city:', city);

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.fetchWeatherByCity(city);
        if (cityInput) {
            cityInput.value = '';
        }
    }

    async handleGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.disabled = true;
            locationBtn.innerHTML = '<span class="location-icon">📍</span> Getting Location...';
        }

        this.showLoading();

        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherByCoords(latitude, longitude);
        } catch (error) {
            let message = 'Unable to retrieve your location';
            switch (error.code) {
                case 1: // PERMISSION_DENIED
                    message = 'Location access denied. Please enable location access or search for a city manually.';
                    break;
                case 2: // POSITION_UNAVAILABLE
                    message = 'Location information unavailable. Please try searching for a city instead.';
                    break;
                case 3: // TIMEOUT
                    message = 'Location request timed out. Please try again or search for a city.';
                    break;
                default:
                    message = 'Failed to get your location. Please try searching for a city instead.';
                    break;
            }
            this.showError(message);
        } finally {
            if (locationBtn) {
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<span class="location-icon">📍</span> Use My Location';
            }
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000
            });
        });
    }

    async fetchWeatherByCity(city) {
        this.showLoading();

        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = true;
        }

        try {
            const currentWeatherUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
            const forecastUrl = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            if (!currentResponse.ok) {
                if (currentResponse.status === 404) {
                    throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
                } else if (currentResponse.status === 401) {
                    throw new Error('API key invalid. Please check your API configuration.');
                } else {
                    throw new Error(`Failed to fetch weather data (Status: ${currentResponse.status})`);
                }
            }

            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);

        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message || 'Failed to fetch weather data. Please try again.');
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
            }
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        this.showLoading();

        try {
            const currentWeatherUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
            const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;

            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            if (!currentResponse.ok) {
                throw new Error('Failed to fetch weather data for your location');
            }

            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data for your location');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);

        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message || 'Failed to fetch weather data for your location');
        }
    }

    displayWeatherData(currentData, forecastData) {
        try {
            console.log('Displaying weather data:', currentData);

            // Update current weather
            const locationElement = document.getElementById('currentLocation');
            if (locationElement) {
                locationElement.textContent = `${currentData.name}, ${currentData.sys.country}`;
            }

            const tempElement = document.getElementById('currentTemp');
            if (tempElement) {
                tempElement.textContent = Math.round(currentData.main.temp);
            }

            const descElement = document.getElementById('weatherDescription');
            if (descElement) {
                descElement.textContent = currentData.weather[0].description;
            }

            const feelsLikeElement = document.getElementById('feelsLike');
            if (feelsLikeElement) {
                feelsLikeElement.textContent = Math.round(currentData.main.feels_like);
            }

            // Update weather icon
            const iconCode = currentData.weather[0].icon;
            const iconElement = document.getElementById('weatherIconLarge');
            if (iconElement) {
                iconElement.textContent = this.weatherIcons[iconCode] || '🌤️';
            }

            // Update weather details
            const humidityElement = document.getElementById('humidity');
            if (humidityElement) {
                humidityElement.textContent = `${currentData.main.humidity}%`;
            }

            const windSpeedElement = document.getElementById('windSpeed');
            if (windSpeedElement) {
                windSpeedElement.textContent = `${Math.round(currentData.wind?.speed * 3.6 || 0)} km/h`;
            }

            const pressureElement = document.getElementById('pressure');
            if (pressureElement) {
                pressureElement.textContent = `${currentData.main.pressure} hPa`;
            }

            const visibilityElement = document.getElementById('visibility');
            if (visibilityElement) {
                visibilityElement.textContent = `${Math.round((currentData.visibility || 10000) / 1000)} km`;
            }

            // Update sun times
            const sunrise = new Date(currentData.sys.sunrise * 1000);
            const sunset = new Date(currentData.sys.sunset * 1000);

            const sunriseElement = document.getElementById('sunrise');
            if (sunriseElement) {
                sunriseElement.textContent = sunrise.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }

            const sunsetElement = document.getElementById('sunset');
            if (sunsetElement) {
                sunsetElement.textContent = sunset.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }

            // Update 5-day forecast
            this.displayForecast(forecastData);

            // Show weather content
            this.showWeatherContent();
        } catch (error) {
            console.error('Error displaying weather data:', error);
            this.showError('Failed to display weather data');
        }
    }

    displayForecast(forecastData) {
        const forecastContainer = document.getElementById('forecastContainer');
        if (!forecastContainer) return;

        forecastContainer.innerHTML = '';

        try {
            console.log('Displaying forecast data:', forecastData);

            // Group forecast data by day (take one forecast per day around noon)
            const dailyForecasts = {};

            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateKey = date.toDateString();

                // Take the forecast closest to noon (12:00)
                if (!dailyForecasts[dateKey] ||
                    Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
                    dailyForecasts[dateKey] = item;
                }
            });

            // Get first 5 days
            const forecasts = Object.values(dailyForecasts).slice(0, 5);
            console.log('Processed forecasts:', forecasts.length);

            forecasts.forEach((forecast, index) => {
                const forecastCard = document.createElement('div');
                forecastCard.className = 'forecast-card';

                const date = new Date(forecast.dt * 1000);
                const dateStr = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                const iconCode = forecast.weather[0].icon;
                const icon = this.weatherIcons[iconCode] || '🌤️';

                forecastCard.innerHTML = `
                    <p class="forecast-date">${dateStr}</p>
                    <div class="forecast-icon">${icon}</div>
                    <div class="forecast-temps">
                        <span class="forecast-high">${Math.round(forecast.main.temp_max)}°</span>
                        <span class="forecast-low">${Math.round(forecast.main.temp_min)}°</span>
                    </div>
                    <p class="forecast-desc">${forecast.weather[0].description}</p>
                `;

                forecastContainer.appendChild(forecastCard);
            });
        } catch (error) {
            console.error('Error displaying forecast:', error);
            forecastContainer.innerHTML = '<p style="color: white; text-align: center;">Unable to load forecast data</p>';
        }
    }

    updateBackgroundByWeather(weatherMain) {
        const backgroundOverlay = document.querySelector('.background-overlay');
        if (!backgroundOverlay) return;

        // Remove existing weather classes
        backgroundOverlay.className = 'background-overlay';

        // Add weather-specific class
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                backgroundOverlay.classList.add('sunny');
                break;
            case 'clouds':
                backgroundOverlay.classList.add('cloudy');
                break;
            case 'rain':
            case 'drizzle':
            case 'thunderstorm':
                backgroundOverlay.classList.add('rainy');
                break;
            case 'snow':
                backgroundOverlay.classList.add('snowy');
                break;
            default:
                // Keep default gradient
                break;
        }
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const weatherContent = document.getElementById('weatherContent');

        if (loadingState) loadingState.classList.remove('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (weatherContent) weatherContent.classList.add('hidden');
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorState = document.getElementById('errorState');
        const loadingState = document.getElementById('loadingState');
        const weatherContent = document.getElementById('weatherContent');

        if (errorMessage) errorMessage.textContent = message;
        if (errorState) errorState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (weatherContent) weatherContent.classList.add('hidden');

        console.error('Weather App Error:', message);
    }

    showWeatherContent() {
        const weatherContent = document.getElementById('weatherContent');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');

        if (weatherContent) weatherContent.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
    }

    // Contact form handling
    handleContactForm(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        // Basic form validation
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const subject = formData.get('subject')?.trim();
        const message = formData.get('message')?.trim();

        if (!name || !email || !subject || !message) {
            this.showFormError('Please fill in all required fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showFormError('Please enter a valid email address.');
            return;
        }

        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="btn-icon">⏳</span> Sending...';

        // Simulate form submission (since we can't actually send emails)
        setTimeout(() => {
            this.showContactSuccess();
            form.reset();

            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }, 2000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFormError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.contact-form-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'contact-form-error';
            errorDiv.style.cssText = `
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                text-align: center;
            `;
            const form = document.getElementById('contactForm');
            form.insertBefore(errorDiv, form.firstChild);
        }

        errorDiv.textContent = message;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showContactSuccess() {
        const formContainer = document.querySelector('.contact-form-container');
        const successElement = document.getElementById('contactSuccess');

        if (formContainer && successElement) {
            // Hide the form
            const form = document.getElementById('contactForm');
            if (form) {
                form.style.display = 'none';
            }

            // Show success message
            successElement.classList.remove('hidden');

            // Auto-hide success message and show form again after 5 seconds
            setTimeout(() => {
                successElement.classList.add('hidden');
                if (form) {
                    form.style.display = 'grid';
                }
            }, 5000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new WeatherApp();
        console.log('WeatherApp initialized successfully');
    } catch (error) {
        console.error('Failed to initialize WeatherApp:', error);
    }
});