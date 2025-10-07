// WeatherPro JavaScript Application with AI Integration

// AI Weather Assistant Class
class WeatherAI {
    constructor(apiKey = null) {
        this.apiKey = apiKey || 'demo-key'; // Use demo key for demo purposes
        this.invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
        this.model = "meta/llama-4-maverick-17b-128e-instruct";
        this.currentWeatherData = null;
        this.forecastData = null;
        this.conversationHistory = [];
    }

    async generateWeatherInsight(weatherData, forecastData = null) {
        this.currentWeatherData = weatherData;
        this.forecastData = forecastData;

        const prompt = this.buildWeatherInsightPrompt(weatherData, forecastData);
        try {
            const response = await this.callAI(prompt);
            return this.formatInsightResponse(response);
        } catch (error) {
            console.error('AI insight generation failed:', error);
            return this.getFallbackInsight(weatherData);
        }
    }

    async handleChatQuery(userQuery) {
        if (!this.currentWeatherData) {
            return "I don't have current weather data to analyze. Please search for a location first!";
        }

        const prompt = this.buildChatPrompt(userQuery, this.currentWeatherData, this.forecastData);
        try {
            const response = await this.callAI(prompt);
            this.conversationHistory.push({ user: userQuery, ai: response });
            return response;
        } catch (error) {
            console.error('AI chat failed:', error);
            return this.getFallbackChatResponse(userQuery);
        }
    }

    buildWeatherInsightPrompt(weatherData, forecastData) {
        const weather = {
            location: `${weatherData.name}, ${weatherData.sys.country}`,
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            condition: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round(weatherData.wind?.speed * 3.6 || 0),
            pressure: weatherData.main.pressure,
            visibility: Math.round((weatherData.visibility || 10000) / 1000)
        };

        return `As a professional weather assistant, analyze this weather data and provide 3 helpful insights for daily planning:

Location: ${weather.location}
Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
Condition: ${weather.condition}
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} km/h
Pressure: ${weather.pressure} hPa
Visibility: ${weather.visibility} km

Provide practical, concise insights about:
1. Comfort and clothing recommendations
2. Activity suggestions based on conditions
3. Health or safety considerations

Keep each insight to 1-2 sentences and focus on actionable advice.`;
    }

    buildChatPrompt(userQuery, weatherData, forecastData) {
        const weather = {
            location: `${weatherData.name}, ${weatherData.sys.country}`,
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            condition: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round(weatherData.wind?.speed * 3.6 || 0),
            pressure: weatherData.main.pressure
        };

        return `You are a helpful weather assistant. Answer the user's question based on current weather data:

Current Weather in ${weather.location}:
- Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} km/h
- Pressure: ${weather.pressure} hPa

User Question: ${userQuery}

Provide a helpful, conversational response focused on practical weather advice. Keep it concise and friendly.`;
    }

    async callAI(prompt) {
        // For demo purposes, simulate AI responses
        return this.simulateAIResponse(prompt);
    }

    simulateAIResponse(prompt) {
        // Simulate AI processing delay
        return new Promise((resolve) => {
            setTimeout(() => {
                if (prompt.includes('insights for daily planning')) {
                    resolve(this.generateSimulatedInsight());
                } else if (prompt.includes('umbrella')) {
                    resolve(this.getUmbrellaAdvice());
                } else if (prompt.includes('wear') || prompt.includes('clothing')) {
                    resolve(this.getClothingAdvice());
                } else if (prompt.includes('activities') || prompt.includes('outdoor')) {
                    resolve(this.getActivityAdvice());
                } else {
                    resolve(this.getGeneralWeatherAdvice());
                }
            }, 1000 + Math.random() * 2000); // 1-3 second delay
        });
    }

    generateSimulatedInsight() {
        if (!this.currentWeatherData) return "Weather data not available for insights.";

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
    }

    getUmbrellaAdvice() {
        if (!this.currentWeatherData) return "I need weather data to give umbrella advice!";

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
    }

    getClothingAdvice() {
        if (!this.currentWeatherData) return "I need weather data to give clothing advice!";

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
    }

    getActivityAdvice() {
        if (!this.currentWeatherData) return "I need weather data to suggest activities!";

        const temp = Math.round(this.currentWeatherData.main.temp);
        const condition = this.currentWeatherData.weather[0].main.toLowerCase();
        const visibility = Math.round((this.currentWeatherData.visibility || 10000) / 1000);

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
    }

    getGeneralWeatherAdvice() {
        if (!this.currentWeatherData) return "Search for a location first to get personalized weather advice!";

        const temp = Math.round(this.currentWeatherData.main.temp);
        const condition = this.currentWeatherData.weather[0].description;
        const location = `${this.currentWeatherData.name}, ${this.currentWeatherData.sys.country}`;

        return `Current conditions in ${location} show ${condition} with temperatures around ${temp}°C. This is great weather data to work with! Feel free to ask me specific questions about clothing, activities, or whether you need an umbrella today.`;
    }

    formatInsightResponse(response) {
        // Format the response for better display
        return response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    getFallbackInsight(weatherData) {
        const temp = Math.round(weatherData.main.temp);
        const condition = weatherData.weather[0].description;
        
        return `<strong>Weather Summary</strong><br>
Current conditions show ${condition} with ${temp}°C temperature. Check back soon for more detailed AI insights as we continue to enhance our analysis capabilities.`;
    }

    getFallbackChatResponse(query) {
        return "I'm having trouble connecting to the AI service right now. Please try again in a moment, or check that you've searched for a location to get current weather data!";
    }
}

class WeatherPro {
    constructor() {
        this.apiKey = 'f146799a557e8ab658304c1b30cc3cfd';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
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
        
        // Initialize AI
        this.weatherAI = new WeatherAI();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCurrentDate();
        this.loadDefaultWeather();
        this.initNavigation();
        this.initContactForm();
        this.initAIChat();
    }

    bindEvents() {
        // Weather functionality
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const locationBtn = document.getElementById('locationBtn');
        const retryBtn = document.getElementById('retryBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (cityInput) {
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.handleGeolocation());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadDefaultWeather());
        }

        // Navigation events
        const hamburger = document.getElementById('hamburger');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToSection(target);
                    this.closeMobileMenu();
                }
            });
        });

        // Update active nav on scroll
        window.addEventListener('scroll', () => this.updateActiveNav());
    }

    // AI Chat functionality
    initAIChat() {
        const aiChatBubble = document.getElementById('aiChatBubble');
        const aiChatPanel = document.getElementById('aiChatPanel');
        const aiChatClose = document.getElementById('aiChatClose');
        const aiChatSend = document.getElementById('aiChatSend');
        const aiChatInput = document.getElementById('aiChatInput');

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
                    this.sendAIMessage();
                }
            });
        }

        // Suggestion buttons
        document.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                this.handleSuggestionClick(query);
            });
        });
    }

    toggleAIChat() {
        const aiChatPanel = document.getElementById('aiChatPanel');
        if (aiChatPanel) {
            aiChatPanel.classList.toggle('hidden');
        }
    }

    closeAIChat() {
        const aiChatPanel = document.getElementById('aiChatPanel');
        if (aiChatPanel) {
            aiChatPanel.classList.add('hidden');
        }
    }

    async sendAIMessage() {
        const aiChatInput = document.getElementById('aiChatInput');
        const message = aiChatInput?.value?.trim();
        
        if (!message) return;

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
    }

    handleSuggestionClick(query) {
        const aiChatInput = document.getElementById('aiChatInput');
        if (aiChatInput) {
            aiChatInput.value = query;
        }
        this.sendAIMessage();
    }

    addChatMessage(message, sender) {
        const aiChatMessages = document.getElementById('aiChatMessages');
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
    }

    showAITyping() {
        const aiChatMessages = document.getElementById('aiChatMessages');
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
    }

    hideAITyping() {
        const typingMessage = document.querySelector('.ai-typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    async generateAIInsights(weatherData, forecastData) {
        const aiInsightsCard = document.getElementById('aiInsightsCard');
        const aiInsightsContent = document.getElementById('aiInsightsContent');
        const aiInsightsLoading = document.getElementById('aiInsightsLoading');

        if (!aiInsightsCard || !aiInsightsContent) return;

        // Show the insights card and loading state
        aiInsightsCard.classList.remove('hidden');
        if (aiInsightsLoading) {
            aiInsightsLoading.classList.remove('hidden');
        }
        
        try {
            // Generate AI insights
            const insights = await this.weatherAI.generateWeatherInsight(weatherData, forecastData);
            
            // Hide loading and show insights
            if (aiInsightsLoading) {
                aiInsightsLoading.classList.add('hidden');
            }
            
            // Convert insights to formatted HTML
            const formattedInsights = insights.split('\n\n').map(insight => 
                `<div class="ai-insight-item">${insight.trim()}</div>`
            ).join('');
            
            aiInsightsContent.innerHTML = formattedInsights;
            
        } catch (error) {
            console.error('Error generating AI insights:', error);
            if (aiInsightsLoading) {
                aiInsightsLoading.classList.add('hidden');
            }
            aiInsightsContent.innerHTML = '<p>Unable to generate insights at this time. Please try again later.</p>';
        }
    }

    // Navigation functionality
    initNavigation() {
        this.updateActiveNav();
    }

    toggleMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (hamburger && mobileMenuOverlay) {
            hamburger.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('hidden');
            
            // Prevent body scroll when menu is open
            if (mobileMenuOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (hamburger && mobileMenuOverlay) {
            hamburger.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    scrollToSection(target) {
        const navbarHeight = 70;
        const targetPosition = target.offsetTop - navbarHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNav() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        const navbarHeight = 70;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Contact form functionality
    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Real-time validation
        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const messageInput = document.getElementById('contactMessage');

        if (nameInput) {
            nameInput.addEventListener('blur', () => this.validateField('name'));
            nameInput.addEventListener('input', () => this.clearFieldError('name'));
        }

        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateField('email'));
            emailInput.addEventListener('input', () => this.clearFieldError('email'));
        }

        if (messageInput) {
            messageInput.addEventListener('blur', () => this.validateField('message'));
            messageInput.addEventListener('input', () => this.clearFieldError('message'));
        }
    }

    validateField(fieldName) {
        const field = document.getElementById(`contact${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (!field || !errorElement) return true;

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Name is required';
                } else if (field.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            
            case 'message':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Message is required';
                } else if (field.value.trim().length < 10) {
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
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
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

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate form submission (in real app, this would be an API call)
            await this.simulateFormSubmission();
            
            // Show success message and reset form
            this.showFormSuccess();
            this.resetContactForm();
            
        } catch (error) {
            this.showFormError('Failed to send message. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async simulateFormSubmission() {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }

    hideFormMessages() {
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    showFormSuccess() {
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        if (successElement) {
            successElement.classList.remove('hidden');
            // Scroll to success message to ensure it's visible
            successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (successElement) {
                successElement.classList.add('hidden');
            }
        }, 10000);
    }

    showFormError(message) {
        const errorElement = document.getElementById('formError');
        const errorMessage = document.getElementById('formErrorMessage');
        const successElement = document.getElementById('formSuccess');
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        if (errorElement) {
            errorElement.classList.remove('hidden');
            // Scroll to error message to ensure it's visible
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        }, 8000);
    }

    resetContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
            // Clear any field errors
            ['name', 'email', 'message'].forEach(field => {
                this.clearFieldError(field);
                const fieldElement = document.getElementById(`contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
                if (fieldElement) {
                    fieldElement.style.borderColor = 'var(--color-border)';
                }
            });
        }
    }

    // Weather functionality
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
        await this.fetchWeatherByCity('krishnagiri');
    }

    async handleSearch() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput?.value?.trim();
        
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

            // Store data for AI
            this.currentWeatherData = currentData;
            this.currentForecastData = forecastData;

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);
            
            // Generate AI insights after displaying weather data
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

            // Store data for AI
            this.currentWeatherData = currentData;
            this.currentForecastData = forecastData;

            this.displayWeatherData(currentData, forecastData);
            this.updateBackgroundByWeather(currentData.weather[0].main);
            
            // Generate AI insights after displaying weather data
            await this.generateAIInsights(currentData, forecastData);
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message || 'Failed to fetch weather data for your location');
        }
    }

    displayWeatherData(currentData, forecastData) {
        try {
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
            
            console.log('Weather data displayed successfully');
        } catch (error) {
            console.error('Error displaying weather data:', error);
            this.showError('Failed to display weather data');
        }
    }

    displayForecast(forecastData) {
        const forecastContainer = document.getElementById('forecastContainer');
        if (!forecastContainer) {
            console.error('Forecast container not found');
            return;
        }

        // Clear existing content
        forecastContainer.innerHTML = '';

        try {
            // Group forecast data by day (take one forecast per day around noon)
            const dailyForecasts = {};
            
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateKey = date.toDateString();
                
                // Take the forecast closest to noon (12:00) for each day
                if (!dailyForecasts[dateKey] || 
                    Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
                    dailyForecasts[dateKey] = item;
                }
            });

            // Get first 5 days
            const forecasts = Object.values(dailyForecasts).slice(0, 5);
            
            console.log(`Creating ${forecasts.length} forecast cards`);

            if (forecasts.length === 0) {
                forecastContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">No forecast data available</p>';
                return;
            }

            forecasts.forEach((forecast, index) => {
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
            });
            
        } catch (error) {
            console.error('Error displaying forecast:', error);
            forecastContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">Unable to load forecast data</p>';
        }
    }

    updateBackgroundByWeather(weatherMain) {
        const weatherBackground = document.querySelector('.weather-background');
        if (!weatherBackground) return;
        
        // Remove existing weather classes
        weatherBackground.className = 'weather-background';
        
        // Add weather-specific class
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                weatherBackground.classList.add('sunny');
                break;
            case 'clouds':
                weatherBackground.classList.add('cloudy');
                break;
            case 'rain':
            case 'drizzle':
            case 'thunderstorm':
                weatherBackground.classList.add('rainy');
                break;
            case 'snow':
                weatherBackground.classList.add('snowy');
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new WeatherPro();
        console.log('WeatherPro with AI initialized successfully');
    } catch (error) {
        console.error('Failed to initialize WeatherPro:', error);
    }
});
