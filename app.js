// app.js

// Utility functions for error handling and DOM manipulation
const SafeDOM = {
    get: (id) => {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found`);
                return null;
            }
            return element;
        } catch (error) {
            console.error(`Error getting element with ID '${id}':`, error);
            return null;
        }
    },

    query: (selector) => {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.error(`Error querying selector '${selector}':`, error);
            return null;
        }
    },

    queryAll: (selector) => {
        try {
            return document.querySelectorAll(selector) || [];
        } catch (error) {
            console.error(`Error querying all selector '${selector}':`, error);
            return [];
        }
    },

    addClass: (element, className) => {
        if (element && element.classList) {
            element.classList.add(className);
        }
    },

    removeClass: (element, className) => {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    },

    toggleClass: (element, className) => {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    },

    setText: (element, text) => {
        if (element) {
            element.textContent = text;
        }
    },

    setHTML: (element, html) => {
        if (element) {
            element.innerHTML = html;
        }
    }
};

// AI Weather Assistant Class with Enhanced Error Handling
class WeatherAI {
    constructor() {
        this.currentWeatherData = null;
        this.forecastData = null;
        this.conversationHistory = [];
    }

    async generateWeatherInsight(weatherData, forecastData = null) {
        try {
            this.currentWeatherData = weatherData;
            this.forecastData = forecastData;

            // Simulate AI processing with more realistic delay
            await this.delay(1500 + Math.random() * 1500);
            
            return this.generateSimulatedInsight();
        } catch (error) {
            console.error('AI insight generation failed:', error);
            return this.getFallbackInsight(weatherData);
        }
    }

    async handleChatQuery(userQuery) {
        try {
            if (!this.currentWeatherData) {
                return "I don't have current weather data to analyze. Please search for a location first!";
            }

            // Simulate AI processing
            await this.delay(1000 + Math.random() * 2000);
            
            let response;
            const query = userQuery.toLowerCase();

            if (query.includes('umbrella') || query.includes('rain')) {
                response = this.getUmbrellaAdvice();
            } else if (query.includes('wear') || query.includes('clothing') || query.includes('dress')) {
                response = this.getClothingAdvice();
            } else if (query.includes('activities') || query.includes('outdoor') || query.includes('exercise')) {
                response = this.getActivityAdvice();
            } else {
                response = this.getGeneralWeatherAdvice();
            }

            this.conversationHistory.push({ user: userQuery, ai: response });
            return response;
        } catch (error) {
            console.error('AI chat failed:', error);
            return this.getFallbackChatResponse(userQuery);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateSimulatedInsight() {
        if (!this.currentWeatherData) {
            return "Weather data not available for insights.";
        }

        try {
            const temp = Math.round(this.currentWeatherData.main.temp);
            const humidity = this.currentWeatherData.main.humidity;
            const condition = this.currentWeatherData.weather[0].main.toLowerCase();
            const windSpeed = Math.round(this.currentWeatherData.wind?.speed * 3.6 || 0);

            const insights = [];

            // Temperature and comfort insight
            if (temp > 25) {
                insights.push("🌡️ **High temperature alert**: With temperatures above 25°C, stay hydrated and consider light, breathable clothing to stay comfortable.");
            } else if (temp < 10) {
                insights.push("🧥 **Bundle up**: Low temperatures call for warm layers. Don't forget a jacket or coat when heading out.");
            } else {
                insights.push("👕 **Pleasant weather**: Comfortable temperatures make it perfect for light to moderate clothing layers.");
            }

            // Activity recommendation
            if (condition.includes('rain')) {
                insights.push("☔ **Indoor day**: Rainy conditions make it ideal for indoor activities. Great time to catch up on reading or visit a museum!");
            } else if (condition.includes('clear') || condition.includes('sun')) {
                insights.push("☀️ **Perfect for outdoors**: Clear skies and good visibility make it an excellent day for outdoor activities and sports.");
            } else if (condition.includes('cloud')) {
                insights.push("⛅ **Mild outdoor conditions**: Cloudy weather provides natural UV protection - great for walking or light exercise.");
            }

            // Health and comfort consideration
            if (humidity > 70) {
                insights.push("💧 **High humidity**: The air feels muggy today. Take frequent breaks if exercising outdoors and stay in air-conditioned spaces when possible.");
            } else if (windSpeed > 20) {
                insights.push("💨 **Windy conditions**: Strong winds may affect outdoor plans. Secure loose items and be cautious with umbrellas.");
            } else {
                insights.push("🌿 **Comfortable conditions**: Pleasant humidity and wind levels make it a great day to spend time outdoors.");
            }

            return insights.join('\n\n');
        } catch (error) {
            console.error('Error generating simulated insight:', error);
            return "Unable to generate detailed insights at this time.";
        }
    }

    getUmbrellaAdvice() {
        if (!this.currentWeatherData) return "I need weather data to give umbrella advice!";

        try {
            const condition = this.currentWeatherData.weather[0].main.toLowerCase();
            const humidity = this.currentWeatherData.main.humidity;

            if (condition.includes('rain') || condition.includes('drizzle')) {
                return "☔ Yes, definitely bring an umbrella! It's currently raining, so you'll want to stay dry.";
            } else if (condition.includes('thunderstorm')) {
                return "⛈️ An umbrella won't be very effective in thunderstorm conditions. Consider staying indoors or finding covered shelter instead.";
            } else if (humidity > 80 && condition.includes('cloud')) {
                return "🌧️ While it's not raining now, the high humidity and clouds suggest rain is possible. An umbrella might be a good precaution!";
            } else {
                return "☀️ No need for an umbrella today! The weather conditions look clear and dry.";
            }
        } catch (error) {
            console.error('Error getting umbrella advice:', error);
            return "I'm having trouble analyzing the weather conditions for umbrella recommendations.";
        }
    }

    getClothingAdvice() {
        if (!this.currentWeatherData) return "I need weather data to give clothing advice!";

        try {
            const temp = Math.round(this.currentWeatherData.main.temp);
            const condition = this.currentWeatherData.weather[0].main.toLowerCase();
            const windSpeed = Math.round(this.currentWeatherData.wind?.speed * 3.6 || 0);

            let advice = [];

            if (temp > 25) {
                advice.push("👕 Light, breathable clothing like cotton t-shirts and shorts");
                advice.push("🧢 Consider a hat for sun protection");
            } else if (temp > 15) {
                advice.push("👖 Comfortable jeans or pants with a light shirt");
                advice.push("🧥 A light jacket or sweater for layering");
            } else if (temp > 5) {
                advice.push("🧥 Warm jacket or coat is essential");
                advice.push("🧤 Consider gloves and a scarf for extra warmth");
            } else {
                advice.push("🧥 Heavy winter coat, warm layers underneath");
                advice.push("🧤 Gloves, scarf, and warm hat are recommended");
            }

            if (condition.includes('rain')) {
                advice.push("🧥 Waterproof or water-resistant outer layer");
            }

            if (windSpeed > 15) {
                advice.push("💨 Wind-resistant clothing to stay comfortable");
            }

            return `Based on ${temp}°C weather:\n\n${advice.join('\n')}`;
        } catch (error) {
            console.error('Error getting clothing advice:', error);
            return "I'm having trouble analyzing the weather conditions for clothing recommendations.";
        }
    }

    getActivityAdvice() {
        if (!this.currentWeatherData) return "I need weather data to suggest activities!";

        try {
            const temp = Math.round(this.currentWeatherData.main.temp);
            const condition = this.currentWeatherData.weather[0].main.toLowerCase();

            if (condition.includes('rain') || condition.includes('storm')) {
                return "🏠 **Indoor activities recommended**: Visit a museum, go shopping, read a book, or try a new recipe. Perfect weather for cozy indoor pursuits!";
            } else if (condition.includes('snow')) {
                return "❄️ **Winter activities**: If you enjoy snow, consider skiing, snowboarding, or building a snowman. Otherwise, warm indoor activities are best.";
            } else if (temp > 25 && condition.includes('clear')) {
                return "🏖️ **Great for summer activities**: Swimming, beach visits, outdoor sports, or picnics. Just remember sun protection and hydration!";
            } else if (temp > 15 && temp <= 25) {
                return "🚶 **Perfect for outdoor activities**: Walking, hiking, cycling, outdoor dining, or sports. Ideal weather conditions for being active outside!";
            } else if (temp > 5) {
                return "🚶 **Light outdoor activities**: Brisk walks, jogging, or outdoor markets. Layer up and enjoy the fresh air!";
            } else {
                return "🏠 **Indoor activities recommended**: Cold weather calls for cozy indoor pursuits. Try a gym workout, indoor climbing, or cultural activities.";
            }
        } catch (error) {
            console.error('Error getting activity advice:', error);
            return "I'm having trouble analyzing the weather conditions for activity recommendations.";
        }
    }

    getGeneralWeatherAdvice() {
        if (!this.currentWeatherData) {
            return "Search for a location first to get personalized weather advice!";
        }

        try {
            const temp = Math.round(this.currentWeatherData.main.temp);
            const condition = this.currentWeatherData.weather[0].description;
            const location = `${this.currentWeatherData.name}, ${this.currentWeatherData.sys.country}`;

            return `Current conditions in ${location} show ${condition} with temperatures around ${temp}°C. This is great weather data to work with! Feel free to ask me specific questions about clothing, activities, or whether you need an umbrella today.`;
        } catch (error) {
            console.error('Error getting general weather advice:', error);
            return "I have weather data available. Feel free to ask me about clothing, activities, or umbrella recommendations!";
        }
    }

    getFallbackInsight(weatherData) {
        try {
            const temp = Math.round(weatherData.main.temp);
            const condition = weatherData.weather[0].description;
            
            return `<strong>Weather Summary</strong><br>
Current conditions show ${condition} with ${temp}°C temperature. Check back soon for more detailed AI insights as we continue to enhance our analysis capabilities.`;
        } catch (error) {
            return "Weather data is available. More detailed insights will be available soon.";
        }
    }

    getFallbackChatResponse(query) {
        return "I'm having trouble connecting to the AI service right now. Please try again in a moment, or check that you've searched for a location to get current weather data!";
    }
}

// Main WeatherPro Application Class
class WeatherPro {
    constructor() {
        this.apiKey = 'f146799a557e8ab658304c1b30cc3cfd';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.defaultCity = 'Krishnagiri';
        this.currentLocation = null;
        this.currentWeatherData = null;
        this.currentForecastData = null;
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
        
        // Initialize AI with error handling
        try {
            this.weatherAI = new WeatherAI();
        } catch (error) {
            console.error('Failed to initialize WeatherAI:', error);
            this.weatherAI = null;
        }
        
        this.init();
    }

    init() {
        try {
            this.bindEvents();
            this.updateCurrentDate();
            this.loadDefaultWeather();
            this.initNavigation();
            this.initContactForm();
            this.initAIChat();
            console.log('WeatherPro initialized successfully');
        } catch (error) {
            console.error('Error during WeatherPro initialization:', error);
        }
    }

    bindEvents() {
        try {
            // Weather functionality with error checking
            const searchBtn = SafeDOM.get('searchBtn');
            const cityInput = SafeDOM.get('cityInput');
            const locationBtn = SafeDOM.get('locationBtn');
            const retryBtn = SafeDOM.get('retryBtn');

            if (searchBtn) {
                searchBtn.addEventListener('click', () => this.handleSearch());
            }
            
            if (cityInput) {
                cityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleSearch();
                    }
                });
                
                // Clear error state when user starts typing
                cityInput.addEventListener('input', () => {
                    this.clearError();
                });
            }
            
            if (locationBtn) {
                locationBtn.addEventListener('click', () => this.handleGeolocation());
            }
            
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.loadDefaultWeather());
            }

            // Navigation events with error checking
            this.bindNavigationEvents();

            console.log('Events bound successfully');
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    bindNavigationEvents() {
        try {
            const hamburger = SafeDOM.get('hamburger');
            const mobileMenuOverlay = SafeDOM.get('mobileMenuOverlay');

            if (hamburger) {
                hamburger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMobileMenu();
                });
            }

            if (mobileMenuOverlay) {
                mobileMenuOverlay.addEventListener('click', (e) => {
                    if (e.target === mobileMenuOverlay) {
                        this.closeMobileMenu();
                    }
                });
            }

            // Smooth scrolling for all navigation links
            const navLinks = SafeDOM.queryAll('a[href^="#"]');
            navLinks.forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href').substring(1);
                    const target = SafeDOM.get(targetId);
                    if (target) {
                        this.scrollToSection(target);
                        this.closeMobileMenu();
                        this.updateActiveNavLink(targetId);
                    }
                });
            });

            // Update active nav on scroll with throttling
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                scrollTimeout = setTimeout(() => {
                    this.updateActiveNav();
                }, 100);
            });

            console.log('Navigation events bound successfully');
        } catch (error) {
            console.error('Error binding navigation events:', error);
        }
    }

    // Enhanced AI Chat functionality
    initAIChat() {
        try {
            const aiChatBubble = SafeDOM.get('aiChatBubble');
            const aiChatClose = SafeDOM.get('aiChatClose');
            const aiChatSend = SafeDOM.get('aiChatSend');
            const aiChatInput = SafeDOM.get('aiChatInput');

            if (aiChatBubble) {
                aiChatBubble.addEventListener('click', () => this.toggleAIChat());
            }

            if (aiChatClose) {
                aiChatClose.addEventListener('click', () => this.closeAIChat());
            }

            if (aiChatSend) {
                aiChatSend.addEventListener('click', () => this.sendAIMessage());
            }

            if (aiChatInput) {
                aiChatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.sendAIMessage();
                    }
                });
            }

            // Suggestion buttons with error handling
            const suggestionBtns = SafeDOM.queryAll('.ai-suggestion-btn');
            suggestionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    try {
                        const query = e.target.getAttribute('data-query');
                        if (query) {
                            this.handleSuggestionClick(query);
                        }
                    } catch (error) {
                        console.error('Error handling suggestion click:', error);
                    }
                });
            });

            console.log('AI Chat initialized successfully');
        } catch (error) {
            console.error('Error initializing AI Chat:', error);
        }
    }

    toggleAIChat() {
        try {
            const aiChatPanel = SafeDOM.get('aiChatPanel');
            if (aiChatPanel) {
                SafeDOM.toggleClass(aiChatPanel, 'hidden');
            }
        } catch (error) {
            console.error('Error toggling AI chat:', error);
        }
    }

    closeAIChat() {
        try {
            const aiChatPanel = SafeDOM.get('aiChatPanel');
            if (aiChatPanel) {
                SafeDOM.addClass(aiChatPanel, 'hidden');
            }
        } catch (error) {
            console.error('Error closing AI chat:', error);
        }
    }

    async sendAIMessage() {
        try {
            const aiChatInput = SafeDOM.get('aiChatInput');
            const message = aiChatInput?.value?.trim();
            
            if (!message || !this.weatherAI) return;

            // Clear input
            if (aiChatInput) {
                aiChatInput.value = '';
            }

            // Add user message to chat
            this.addChatMessage(message, 'user');

            // Show typing indicator
            this.showAITyping();

            try {
                // Get AI response
                const response = await this.weatherAI.handleChatQuery(message);
                
                // Remove typing indicator and add AI response
                this.hideAITyping();
                this.addChatMessage(response, 'ai');
                
            } catch (error) {
                console.error('AI chat error:', error);
                this.hideAITyping();
                this.addChatMessage("Sorry, I'm having trouble responding right now. Please try again!", 'ai');
            }
        } catch (error) {
            console.error('Error sending AI message:', error);
        }
    }

    handleSuggestionClick(query) {
        try {
            const aiChatInput = SafeDOM.get('aiChatInput');
            if (aiChatInput) {
                aiChatInput.value = query;
                this.sendAIMessage();
            }
        } catch (error) {
            console.error('Error handling suggestion click:', error);
        }
    }

    addChatMessage(message, sender) {
        try {
            const aiChatMessages = SafeDOM.get('aiChatMessages');
            if (!aiChatMessages) return;

            const messageElement = document.createElement('div');
            messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';

            const avatar = document.createElement('div');
            avatar.className = sender === 'user' ? 'user-avatar' : 'ai-avatar';
            avatar.textContent = sender === 'user' ? '👤' : '🤖';

            const text = document.createElement('div');
            text.className = sender === 'user' ? 'user-text' : 'ai-text';
            text.innerHTML = message; // Using innerHTML to support formatting

            messageElement.appendChild(avatar);
            messageElement.appendChild(text);
            aiChatMessages.appendChild(messageElement);
            
            // Scroll to bottom
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        } catch (error) {
            console.error('Error adding chat message:', error);
        }
    }

    showAITyping() {
        try {
            const aiChatMessages = SafeDOM.get('aiChatMessages');
            if (!aiChatMessages) return;

            const typingElement = document.createElement('div');
            typingElement.className = 'ai-message ai-typing-message';
            typingElement.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="ai-text ai-typing">
                    <span>Thinking...</span>
                    <div class="ai-typing-dots">
                        <div class="ai-typing-dot"></div>
                        <div class="ai-typing-dot"></div>
                        <div class="ai-typing-dot"></div>
                    </div>
                </div>
            `;

            aiChatMessages.appendChild(typingElement);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        } catch (error) {
            console.error('Error showing AI typing indicator:', error);
        }
    }

    hideAITyping() {
        try {
            const typingMessage = SafeDOM.query('.ai-typing-message');
            if (typingMessage) {
                typingMessage.remove();
            }
        } catch (error) {
            console.error('Error hiding AI typing indicator:', error);
        }
    }

    async generateAIInsights(weatherData, forecastData) {
        if (!this.weatherAI) return;

        try {
            const aiInsightsCard = SafeDOM.get('aiInsightsCard');
            const aiInsightsContent = SafeDOM.get('aiInsightsContent');
            const aiInsightsLoading = SafeDOM.get('aiInsightsLoading');

            if (!aiInsightsCard || !aiInsightsContent) return;

            // Show the insights card and loading state
            SafeDOM.removeClass(aiInsightsCard, 'hidden');
            if (aiInsightsLoading) {
                SafeDOM.removeClass(aiInsightsLoading, 'hidden');
            }
            
            try {
                // Generate AI insights
                const insights = await this.weatherAI.generateWeatherInsight(weatherData, forecastData);
                
                // Hide loading and show insights
                if (aiInsightsLoading) {
                    SafeDOM.addClass(aiInsightsLoading, 'hidden');
                }
                
                // Convert insights to formatted HTML
                const formattedInsights = insights.split('\n\n').map(insight => 
                    `<div class="ai-insight-item">${insight.trim()}</div>`
                ).join('');
                
                SafeDOM.setHTML(aiInsightsContent, formattedInsights);
                
            } catch (error) {
                console.error('Error generating AI insights:', error);
                if (aiInsightsLoading) {
                    SafeDOM.addClass(aiInsightsLoading, 'hidden');
                }
                SafeDOM.setHTML(aiInsightsContent, '<p>Unable to generate insights at this time. Please try again later.</p>');
            }
        } catch (error) {
            console.error('Error in generateAIInsights:', error);
        }
    }

    // Enhanced Navigation functionality
    initNavigation() {
        try {
            this.updateActiveNav();
            console.log('Navigation initialized successfully');
        } catch (error) {
            console.error('Error initializing navigation:', error);
        }
    }

    toggleMobileMenu() {
        try {
            const hamburger = SafeDOM.get('hamburger');
            const mobileMenuOverlay = SafeDOM.get('mobileMenuOverlay');

            if (hamburger && mobileMenuOverlay) {
                SafeDOM.toggleClass(hamburger, 'active');
                SafeDOM.toggleClass(mobileMenuOverlay, 'active');
                SafeDOM.toggleClass(mobileMenuOverlay, 'hidden');
                
                // Prevent body scroll when menu is open
                if (mobileMenuOverlay.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        } catch (error) {
            console.error('Error toggling mobile menu:', error);
        }
    }

    closeMobileMenu() {
        try {
            const hamburger = SafeDOM.get('hamburger');
            const mobileMenuOverlay = SafeDOM.get('mobileMenuOverlay');

            if (hamburger) {
                SafeDOM.removeClass(hamburger, 'active');
            }
            if (mobileMenuOverlay) {
                SafeDOM.removeClass(mobileMenuOverlay, 'active');
                SafeDOM.addClass(mobileMenuOverlay, 'hidden');
            }
            document.body.style.overflow = '';
        } catch (error) {
            console.error('Error closing mobile menu:', error);
        }
    }

    scrollToSection(target) {
        try {
            const navbarHeight = 70;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error('Error scrolling to section:', error);
        }
    }

    updateActiveNav() {
        try {
            const sections = SafeDOM.queryAll('.section');
            const navLinks = SafeDOM.queryAll('.nav-link, .mobile-nav-link');
            const navbarHeight = 70;
            
            let currentSection = 'weather'; // default
            
            sections.forEach(section => {
                try {
                    const sectionTop = section.offsetTop - navbarHeight - 100;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                        currentSection = section.getAttribute('id');
                    }
                } catch (error) {
                    console.warn('Error processing section:', error);
                }
            });

            this.updateActiveNavLink(currentSection);
        } catch (error) {
            console.error('Error updating active nav:', error);
        }
    }

    updateActiveNavLink(activeSection) {
        try {
            const navLinks = SafeDOM.queryAll('.nav-link, .mobile-nav-link');
            navLinks.forEach(link => {
                SafeDOM.removeClass(link, 'active');
                if (link.getAttribute('href') === `#${activeSection}` || 
                    link.getAttribute('data-section') === activeSection) {
                    SafeDOM.addClass(link, 'active');
                }
            });
        } catch (error) {
            console.error('Error updating active nav link:', error);
        }
    }

    // Enhanced Contact form functionality
    initContactForm() {
        try {
            const contactForm = SafeDOM.get('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
            }

            // Real-time validation with error handling
            const fields = [
                { id: 'contactName', name: 'name' },
                { id: 'contactEmail', name: 'email' },
                { id: 'contactMessage', name: 'message' }
            ];

            fields.forEach(field => {
                const input = SafeDOM.get(field.id);
                if (input) {
                    input.addEventListener('blur', () => this.validateField(field.name));
                    input.addEventListener('input', () => this.clearFieldError(field.name));
                }
            });

            console.log('Contact form initialized successfully');
        } catch (error) {
            console.error('Error initializing contact form:', error);
        }
    }

    validateField(fieldName) {
        try {
            const field = SafeDOM.get(`contact${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
            const errorElement = SafeDOM.get(`${fieldName}Error`);
            
            if (!field) return true;

            let isValid = true;
            let errorMessage = '';

            const value = field.value ? field.value.trim() : '';

            switch (fieldName) {
                case 'name':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Name is required';
                    } else if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Name must be at least 2 characters';
                    }
                    break;
                
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Email is required';
                    } else if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                
                case 'message':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Message is required';
                    } else if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Message must be at least 10 characters';
                    }
                    break;
            }

            if (!isValid) {
                this.showFieldError(fieldName, errorMessage);
                field.style.borderColor = 'var(--color-error)';
            } else {
                this.clearFieldError(fieldName);
                field.style.borderColor = 'var(--color-border)';
            }

            return isValid;
        } catch (error) {
            console.error(`Error validating field ${fieldName}:`, error);
            return true; // Assume valid on error
        }
    }

    showFieldError(fieldName, message) {
        try {
            const errorElement = SafeDOM.get(`${fieldName}Error`);
            if (errorElement) {
                SafeDOM.setText(errorElement, message);
                SafeDOM.addClass(errorElement, 'show');
            }
        } catch (error) {
            console.error(`Error showing field error for ${fieldName}:`, error);
        }
    }

    clearFieldError(fieldName) {
        try {
            const errorElement = SafeDOM.get(`${fieldName}Error`);
            if (errorElement) {
                SafeDOM.removeClass(errorElement, 'show');
            }
        } catch (error) {
            console.error(`Error clearing field error for ${fieldName}:`, error);
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        try {
            // Hide previous messages
            this.hideFormMessages();
            
            // Validate all fields
            const nameValid = this.validateField('name');
            const emailValid = this.validateField('email');
            const messageValid = this.validateField('message');
            
            if (!nameValid || !emailValid || !messageValid) {
                this.showFormError('Please fix the errors above');
                return;
            }

            const submitBtn = SafeDOM.get('submitBtn');
            const originalText = submitBtn ? submitBtn.textContent : 'Send Message';
            
            try {
                // Show loading state
                if (submitBtn) {
                    submitBtn.disabled = true;
                    SafeDOM.setText(submitBtn, 'Sending...');
                }
                
                // Simulate form submission
                await this.simulateFormSubmission();
                
                // Show success message and reset form
                this.showFormSuccess();
                this.resetContactForm();
                
            } catch (error) {
                this.showFormError('Failed to send message. Please try again.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    SafeDOM.setText(submitBtn, originalText);
                }
            }
        } catch (error) {
            console.error('Error handling contact form submit:', error);
            this.showFormError('An unexpected error occurred. Please try again.');
        }
    }

    async simulateFormSubmission() {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }

    hideFormMessages() {
        try {
            const successElement = SafeDOM.get('formSuccess');
            const errorElement = SafeDOM.get('formError');
            
            if (successElement) {
                SafeDOM.addClass(successElement, 'hidden');
            }
            if (errorElement) {
                SafeDOM.addClass(errorElement, 'hidden');
            }
        } catch (error) {
            console.error('Error hiding form messages:', error);
        }
    }

    showFormSuccess() {
        try {
            const successElement = SafeDOM.get('formSuccess');
            const errorElement = SafeDOM.get('formError');
            
            if (errorElement) {
                SafeDOM.addClass(errorElement, 'hidden');
            }
            
            if (successElement) {
                SafeDOM.removeClass(successElement, 'hidden');
                // Scroll to success message
                successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (successElement) {
                    SafeDOM.addClass(successElement, 'hidden');
                }
            }, 10000);
        } catch (error) {
            console.error('Error showing form success:', error);
        }
    }

    showFormError(message) {
        try {
            const errorElement = SafeDOM.get('formError');
            const errorMessage = SafeDOM.get('formErrorMessage');
            const successElement = SafeDOM.get('formSuccess');
            
            if (successElement) {
                SafeDOM.addClass(successElement, 'hidden');
            }
            
            if (errorMessage) {
                SafeDOM.setText(errorMessage, message);
            }
            if (errorElement) {
                SafeDOM.removeClass(errorElement, 'hidden');
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Auto-hide after 8 seconds
            setTimeout(() => {
                if (errorElement) {
                    SafeDOM.addClass(errorElement, 'hidden');
                }
            }, 8000);
        } catch (error) {
            console.error('Error showing form error:', error);
        }
    }

    resetContactForm() {
        try {
            const form = SafeDOM.get('contactForm');
            if (form) {
                form.reset();
                // Clear any field errors
                ['name', 'email', 'message'].forEach(field => {
                    this.clearFieldError(field);
                    const fieldElement = SafeDOM.get(`contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
                    if (fieldElement) {
                        fieldElement.style.borderColor = 'var(--color-border)';
                    }
                });
            }
        } catch (error) {
            console.error('Error resetting contact form:', error);
        }
    }

    // Enhanced Weather functionality
    updateCurrentDate() {
        try {
            const currentDateElement = SafeDOM.get('currentDate');
            if (currentDateElement) {
                const now = new Date();
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                SafeDOM.setText(currentDateElement, now.toLocaleDateString('en-US', options));
            }
        } catch (error) {
            console.error('Error updating current date:', error);
        }
    }

    async loadDefaultWeather() {
        try {
            await this.fetchWeatherByCity(this.defaultCity);
        } catch (error) {
            console.error('Error loading default weather:', error);
            this.showError('Failed to load default weather data. Please try searching for a city.');
        }
    }

    async handleSearch() {
        try {
            const cityInput = SafeDOM.get('cityInput');
            const city = cityInput?.value?.trim();
            
            if (!city) {
                this.showError('Please enter a city name');
                return;
            }

            await this.fetchWeatherByCity(city);
            if (cityInput) {
                cityInput.value = '';
            }
        } catch (error) {
            console.error('Error handling search:', error);
            this.showError('An error occurred while searching. Please try again.');
        }
    }

    async handleGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        const locationBtn = SafeDOM.get('locationBtn');
        
        try {
            if (locationBtn) {
                locationBtn.disabled = true;
                SafeDOM.setHTML(locationBtn, '<span class="location-icon">📍</span> Getting Location...');
            }

            this.showLoading();

            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherByCoords(latitude, longitude);
        } catch (error) {
            let message = 'Unable to retrieve your location';
            if (error.code) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                    default:
                        message = 'Failed to get your location';
                        break;
                }
            }
            this.showError(message);
        } finally {
            if (locationBtn) {
                locationBtn.disabled = false;
                SafeDOM.setHTML(locationBtn, '<span class="location-icon">📍</span> Use My Location');
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
        
        const searchBtn = SafeDOM.get('searchBtn');
        
        try {
            if (searchBtn) {
                searchBtn.disabled = true;
            }
            
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

            // Store data
            this.currentWeatherData = currentData;
            this.currentForecastData = forecastData;

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);
            
            // Generate AI insights
            await this.generateAIInsights(currentData, forecastData);
            
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

            // Store data
            this.currentWeatherData = currentData;
            this.currentForecastData = forecastData;

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);
            
            // Generate AI insights
            await this.generateAIInsights(currentData, forecastData);
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message || 'Failed to fetch weather data for your location');
        }
    }

    displayWeatherData(currentData, forecastData) {
        try {
            // Update current weather with safe DOM manipulation
            SafeDOM.setText(SafeDOM.get('currentLocation'), `${currentData.name}, ${currentData.sys.country}`);
            SafeDOM.setText(SafeDOM.get('currentTemp'), Math.round(currentData.main.temp));
            SafeDOM.setText(SafeDOM.get('weatherDescription'), currentData.weather[0].description);
            SafeDOM.setText(SafeDOM.get('feelsLike'), Math.round(currentData.main.feels_like));

            // Update weather icon
            const iconCode = currentData.weather[0].icon;
            SafeDOM.setText(SafeDOM.get('weatherIconLarge'), this.weatherIcons[iconCode] || '🌤️');

            // Update weather details
            SafeDOM.setText(SafeDOM.get('humidity'), `${currentData.main.humidity}%`);
            SafeDOM.setText(SafeDOM.get('windSpeed'), `${Math.round(currentData.wind?.speed * 3.6 || 0)} km/h`);
            SafeDOM.setText(SafeDOM.get('pressure'), `${currentData.main.pressure} hPa`);
            SafeDOM.setText(SafeDOM.get('visibility'), `${Math.round((currentData.visibility || 10000) / 1000)} km`);

            // Update sun times
            const sunrise = new Date(currentData.sys.sunrise * 1000);
            const sunset = new Date(currentData.sys.sunset * 1000);
            
            SafeDOM.setText(SafeDOM.get('sunrise'), sunrise.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            }));
            SafeDOM.setText(SafeDOM.get('sunset'), sunset.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            }));

            // Update forecast
            this.displayForecast(forecastData);

            // Show weather content
            this.showWeatherContent();
            
            console.log('Weather data displayed successfully');
        } catch (error) {
            console.error('Error displaying weather data:', error);
            this.showError('Failed to display weather data');
        }
    }

    displayForecast(forecastData) {
        try {
            const forecastContainer = SafeDOM.get('forecastContainer');
            if (!forecastContainer) {
                console.error('Forecast container not found');
                return;
            }

            // Clear existing content
            forecastContainer.innerHTML = '';

            if (!forecastData || !forecastData.list) {
                SafeDOM.setHTML(forecastContainer, '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">No forecast data available</p>');
                return;
            }

            // Group forecast data by day
            const dailyForecasts = {};
            
            forecastData.list.forEach(item => {
                try {
                    const date = new Date(item.dt * 1000);
                    const dateKey = date.toDateString();
                    
                    // Take the forecast closest to noon for each day
                    if (!dailyForecasts[dateKey] || 
                        Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
                        dailyForecasts[dateKey] = item;
                    }
                } catch (error) {
                    console.warn('Error processing forecast item:', error);
                }
            });

            // Get first 5 days
            const forecasts = Object.values(dailyForecasts).slice(0, 5);
            
            if (forecasts.length === 0) {
                SafeDOM.setHTML(forecastContainer, '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">No forecast data available</p>');
                return;
            }

            forecasts.forEach((forecast, index) => {
                try {
                    const forecastCard = document.createElement('div');
                    forecastCard.className = 'forecast-card';

                    const date = new Date(forecast.dt * 1000);
                    const dateStr = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });

                    const iconCode = forecast.weather[0].icon;
                    const icon = this.weatherIcons[iconCode] || '🌤️';
                    const description = forecast.weather[0].description;
                    const highTemp = Math.round(forecast.main.temp_max);
                    const lowTemp = Math.round(forecast.main.temp_min);

                    forecastCard.innerHTML = `
                        <p class="forecast-date">${dateStr}</p>
                        <div class="forecast-icon">${icon}</div>
                        <div class="forecast-temps">
                            <span class="forecast-high">${highTemp}°</span>
                            <span class="forecast-low">${lowTemp}°</span>
                        </div>
                        <p class="forecast-desc">${description}</p>
                    `;

                    forecastContainer.appendChild(forecastCard);
                } catch (error) {
                    console.warn('Error creating forecast card:', error);
                }
            });
            
        } catch (error) {
            console.error('Error displaying forecast:', error);
            const forecastContainer = SafeDOM.get('forecastContainer');
            if (forecastContainer) {
                SafeDOM.setHTML(forecastContainer, '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">Unable to load forecast data</p>');
            }
        }
    }

    updateBackgroundByWeather(weatherMain) {
        try {
            const weatherBackground = SafeDOM.query('.weather-background');
            if (!weatherBackground) return;
            
            // Remove existing weather classes
            weatherBackground.className = 'weather-background';
            
            // Add weather-specific class
            switch (weatherMain.toLowerCase()) {
                case 'clear':
                    SafeDOM.addClass(weatherBackground, 'sunny');
                    break;
                case 'clouds':
                    SafeDOM.addClass(weatherBackground, 'cloudy');
                    break;
                case 'rain':
                case 'drizzle':
                case 'thunderstorm':
                    SafeDOM.addClass(weatherBackground, 'rainy');
                    break;
                case 'snow':
                    SafeDOM.addClass(weatherBackground, 'snowy');
                    break;
                default:
                    // Keep default gradient
                    break;
            }
        } catch (error) {
            console.error('Error updating background:', error);
        }
    }

    showLoading() {
        try {
            const loadingState = SafeDOM.get('loadingState');
            const errorState = SafeDOM.get('errorState');
            const weatherContent = SafeDOM.get('weatherContent');
            
            if (loadingState) SafeDOM.removeClass(loadingState, 'hidden');
            if (errorState) SafeDOM.addClass(errorState, 'hidden');
            if (weatherContent) SafeDOM.addClass(weatherContent, 'hidden');
        } catch (error) {
            console.error('Error showing loading state:', error);
        }
    }

    showError(message) {
        try {
            const errorMessage = SafeDOM.get('errorMessage');
            const errorState = SafeDOM.get('errorState');
            const loadingState = SafeDOM.get('loadingState');
            const weatherContent = SafeDOM.get('weatherContent');
            
            if (errorMessage) SafeDOM.setText(errorMessage, message);
            if (errorState) SafeDOM.removeClass(errorState, 'hidden');
            if (loadingState) SafeDOM.addClass(loadingState, 'hidden');
            if (weatherContent) SafeDOM.addClass(weatherContent, 'hidden');
            
            console.error('Weather App Error:', message);
        } catch (error) {
            console.error('Error showing error state:', error);
        }
    }

    clearError() {
        try {
            const errorState = SafeDOM.get('errorState');
            if (errorState) {
                SafeDOM.addClass(errorState, 'hidden');
            }
        } catch (error) {
            console.error('Error clearing error state:', error);
        }
    }

    showWeatherContent() {
        try {
            const weatherContent = SafeDOM.get('weatherContent');
            const loadingState = SafeDOM.get('loadingState');
            const errorState = SafeDOM.get('errorState');
            
            if (weatherContent) SafeDOM.removeClass(weatherContent, 'hidden');
            if (loadingState) SafeDOM.addClass(loadingState, 'hidden');
            if (errorState) SafeDOM.addClass(errorState, 'hidden');
        } catch (error) {
            console.error('Error showing weather content:', error);
        }
    }
}

// Initialize the app when DOM is loaded with enhanced error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Global error handler for uncaught errors
        window.addEventListener('error', (e) => {
            console.error('Global error caught:', e.error);
        });

        // Global handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });

        const app = new WeatherPro();
        
        // Make app globally accessible for debugging
        if (typeof window !== 'undefined') {
            window.WeatherProApp = app;
        }
        
        console.log('WeatherPro with AI and enhanced error handling initialized successfully');
    } catch (error) {
        console.error('Critical error during WeatherPro initialization:', error);
        
        // Show fallback error message to user
        const body = document.body;
        if (body) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed; 
                top: 20px; 
                left: 50%; 
                transform: translateX(-50%); 
                background: #ff4444; 
                color: white; 
                padding: 15px 20px; 
                border-radius: 8px; 
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            errorDiv.textContent = 'Weather app failed to load. Please refresh the page.';
            body.appendChild(errorDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    }
});
