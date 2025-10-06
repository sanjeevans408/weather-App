//all device supported

// Feature Detection and Polyfills for Universal Browser Support
(function() {
    'use strict';
    
    // Polyfill for Object.assign (IE11 support)
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
    
    // Polyfill for Array.from (IE11 support)
    if (!Array.from) {
        Array.from = function(arrayLike, mapFn, thisArg) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            var len = parseInt(items.length) || 0;
            var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
            var k = 0;
            while (k < len) {
                var kValue = items[k];
                if (mapFn) {
                    A[k] = typeof thisArg === 'undefined' ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            A.length = len;
            return A;
        };
    }
    
    // Polyfill for Promise (IE11 support)
    if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
            var self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];
            
            function resolve(result) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = result;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function reject(error) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = error;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }
            
            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(result) {
                            try {
                                resolve(onFulfilled ? onFulfilled(result) : result);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(error) {
                            try {
                                resolve(onRejected ? onRejected(error) : error);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };
            
            executor(resolve, reject);
        };
    }
    
    // Fetch API Polyfill for older browsers
    if (!window.fetch) {
        window.fetch = function(url, options) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                options = options || {};
                
                xhr.open(options.method || 'GET', url, true);
                
                if (options.headers) {
                    for (var key in options.headers) {
                        xhr.setRequestHeader(key, options.headers[key]);
                    }
                }
                
                xhr.onload = function() {
                    var response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        json: function() {
                            return Promise.resolve(JSON.parse(xhr.responseText));
                        },
                        text: function() {
                            return Promise.resolve(xhr.responseText);
                        }
                    };
                    resolve(response);
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                
                xhr.ontimeout = function() {
                    reject(new Error('Request timeout'));
                };
                
                xhr.timeout = 15000; // 15 second timeout
                xhr.send(options.body || null);
            });
        };
    }
})();

// Universal Device Detection and Capabilities
var DeviceCapabilities = {
    // Touch detection with better cross-device support
    hasTouch: function() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0 ||
               (window.DocumentTouch && document instanceof DocumentTouch);
    },
    
    // Connection quality detection
    getConnectionInfo: function() {
        var connection = navigator.connection || 
                        navigator.mozConnection || 
                        navigator.webkitConnection ||
                        { effectiveType: '4g', downlink: 10 };
        
        return {
            effectiveType: connection.effectiveType || '4g',
            downlink: connection.downlink || 10,
            rtt: connection.rtt || 100,
            saveData: connection.saveData || false
        };
    },
    
    // Device type detection
    getDeviceType: function() {
        var width = window.innerWidth || document.documentElement.clientWidth;
        var userAgent = navigator.userAgent.toLowerCase();
        
        if (width <= 480) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    },
    
    // Browser detection for compatibility
    getBrowserInfo: function() {
        var userAgent = navigator.userAgent.toLowerCase();
        var browser = {
            isIE: userAgent.indexOf('msie') > -1 || userAgent.indexOf('trident') > -1,
            isEdge: userAgent.indexOf('edge') > -1,
            isChrome: userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1,
            isFirefox: userAgent.indexOf('firefox') > -1,
            isSafari: userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1,
            isMobile: /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
            supportsModernFeatures: !!(window.fetch && window.Promise && Array.from)
        };
        
        return browser;
    },
    
    // Performance capabilities
    getPerformanceCapabilities: function() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 2,
            deviceMemory: navigator.deviceMemory || 4,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }
};

// Enhanced AI Weather Assistant with Universal Compatibility
var WeatherAI = function(apiKey) {
    this.apiKey = apiKey || 'demo-key';
    this.invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    this.model = "meta/llama-4-maverick-17b-128e-instruct";
    this.currentWeatherData = null;
    this.forecastData = null;
    this.conversationHistory = [];
    this.isOnline = navigator.onLine !== false;
    
    // Listen for online/offline events
    var self = this;
    if (window.addEventListener) {
        window.addEventListener('online', function() { self.isOnline = true; });
        window.addEventListener('offline', function() { self.isOnline = false; });
    }
};

WeatherAI.prototype = {
    generateWeatherInsight: function(weatherData, forecastData) {
        var self = this;
        self.currentWeatherData = weatherData;
        self.forecastData = forecastData || null;
        
        if (!self.isOnline) {
            return Promise.resolve(self.getOfflineInsight(weatherData));
        }
        
        var prompt = self.buildWeatherInsightPrompt(weatherData, forecastData);
        
        return self.callAI(prompt)
            .then(function(response) {
                return self.formatInsightResponse(response);
            })
            .catch(function(error) {
                console.error('AI insight generation failed:', error);
                return self.getFallbackInsight(weatherData);
            });
    },
    
    handleChatQuery: function(userQuery) {
        var self = this;
        
        if (!self.currentWeatherData) {
            return Promise.resolve("I don't have current weather data to analyze. Please search for a location first!");
        }
        
        if (!self.isOnline) {
            return Promise.resolve(self.getOfflineChatResponse(userQuery));
        }
        
        var prompt = self.buildChatPrompt(userQuery, self.currentWeatherData, self.forecastData);
        
        return self.callAI(prompt)
            .then(function(response) {
                self.conversationHistory.push({ user: userQuery, ai: response });
                return response;
            })
            .catch(function(error) {
                console.error('AI chat failed:', error);
                return self.getFallbackChatResponse(userQuery);
            });
    },
    
    buildWeatherInsightPrompt: function(weatherData, forecastData) {
        var weather = {
            location: weatherData.name + ', ' + weatherData.sys.country,
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            condition: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round((weatherData.wind && weatherData.wind.speed ? weatherData.wind.speed : 0) * 3.6),
            pressure: weatherData.main.pressure,
            visibility: Math.round(((weatherData.visibility || 10000) / 1000))
        };
        
        return 'As a professional weather assistant, analyze this weather data and provide 3 helpful insights for daily planning:\n\n' +
               'Location: ' + weather.location + '\n' +
               'Temperature: ' + weather.temperature + '°C (feels like ' + weather.feelsLike + '°C)\n' +
               'Condition: ' + weather.condition + '\n' +
               'Humidity: ' + weather.humidity + '%\n' +
               'Wind Speed: ' + weather.windSpeed + ' km/h\n' +
               'Pressure: ' + weather.pressure + ' hPa\n' +
               'Visibility: ' + weather.visibility + ' km\n\n' +
               'Provide practical, concise insights about:\n' +
               '1. Comfort and clothing recommendations\n' +
               '2. Activity suggestions based on conditions\n' +
               '3. Health or safety considerations\n\n' +
               'Keep each insight to 1-2 sentences and focus on actionable advice.';
    },
    
    buildChatPrompt: function(userQuery, weatherData, forecastData) {
        var weather = {
            location: weatherData.name + ', ' + weatherData.sys.country,
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            condition: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round((weatherData.wind && weatherData.wind.speed ? weatherData.wind.speed : 0) * 3.6),
            pressure: weatherData.main.pressure
        };
        
        return 'You are a helpful weather assistant. Answer the user\'s question based on current weather data:\n\n' +
               'Current Weather in ' + weather.location + ':\n' +
               '- Temperature: ' + weather.temperature + '°C (feels like ' + weather.feelsLike + '°C)\n' +
               '- Condition: ' + weather.condition + '\n' +
               '- Humidity: ' + weather.humidity + '%\n' +
               '- Wind: ' + weather.windSpeed + ' km/h\n' +
               '- Pressure: ' + weather.pressure + ' hPa\n\n' +
               'User Question: ' + userQuery + '\n\n' +
               'Provide a helpful, conversational response focused on practical weather advice. Keep it concise and friendly.';
    },
    
    callAI: function(prompt) {
        // For demo purposes, simulate AI responses with more realistic delays
        return this.simulateAIResponse(prompt);
    },
    
    simulateAIResponse: function(prompt) {
        var self = this;
        var connection = DeviceCapabilities.getConnectionInfo();
        var delay = connection.effectiveType === '2g' ? 3000 + Math.random() * 2000 :
                   connection.effectiveType === '3g' ? 2000 + Math.random() * 1500 :
                   1000 + Math.random() * 1000;
        
        return new Promise(function(resolve) {
            setTimeout(function() {
                if (prompt.indexOf('insights for daily planning') > -1) {
                    resolve(self.generateSimulatedInsight());
                } else if (prompt.indexOf('umbrella') > -1) {
                    resolve(self.getUmbrellaAdvice());
                } else if (prompt.indexOf('wear') > -1 || prompt.indexOf('clothing') > -1) {
                    resolve(self.getClothingAdvice());
                } else if (prompt.indexOf('activities') > -1 || prompt.indexOf('outdoor') > -1) {
                    resolve(self.getActivityAdvice());
                } else {
                    resolve(self.getGeneralWeatherAdvice());
                }
            }, delay);
        });
    },
    
    generateSimulatedInsight: function() {
        if (!this.currentWeatherData) return "Weather data not available for insights.";
        
        var temp = Math.round(this.currentWeatherData.main.temp);
        var humidity = this.currentWeatherData.main.humidity;
        var condition = this.currentWeatherData.weather[0].main.toLowerCase();
        var windSpeed = Math.round((this.currentWeatherData.wind && this.currentWeatherData.wind.speed ? this.currentWeatherData.wind.speed : 0) * 3.6);
        
        var insights = [];
        
        // Temperature and comfort insight
        if (temp > 25) {
            insights.push("🌡️ **High temperature alert**: With temperatures above 25°C, stay hydrated and consider light, breathable clothing to stay comfortable.");
        } else if (temp < 10) {
            insights.push("🧥 **Bundle up**: Low temperatures call for warm layers. Don't forget a jacket or coat when heading out.");
        } else {
            insights.push("👕 **Pleasant weather**: Comfortable temperatures make it perfect for light to moderate clothing layers.");
        }
        
        // Activity recommendation
        if (condition.indexOf('rain') > -1) {
            insights.push("☔ **Indoor day**: Rainy conditions make it ideal for indoor activities. Great time to catch up on reading or visit a museum!");
        } else if (condition.indexOf('clear') > -1 || condition.indexOf('sun') > -1) {
            insights.push("☀️ **Perfect for outdoors**: Clear skies and good visibility make it an excellent day for outdoor activities and sports.");
        } else if (condition.indexOf('cloud') > -1) {
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
    },
    
    getUmbrellaAdvice: function() {
        if (!this.currentWeatherData) return "I need weather data to give umbrella advice!";
        
        var condition = this.currentWeatherData.weather[0].main.toLowerCase();
        var humidity = this.currentWeatherData.main.humidity;
        
        if (condition.indexOf('rain') > -1 || condition.indexOf('drizzle') > -1) {
            return "☔ Yes, definitely bring an umbrella! It's currently raining, so you'll want to stay dry.";
        } else if (condition.indexOf('thunderstorm') > -1) {
            return "⛈️ An umbrella won't be very effective in thunderstorm conditions. Consider staying indoors or finding covered shelter instead.";
        } else if (humidity > 80 && condition.indexOf('cloud') > -1) {
            return "🌧️ While it's not raining now, the high humidity and clouds suggest rain is possible. An umbrella might be a good precaution!";
        } else {
            return "☀️ No need for an umbrella today! The weather conditions look clear and dry.";
        }
    },
    
    getClothingAdvice: function() {
        if (!this.currentWeatherData) return "I need weather data to give clothing advice!";
        
        var temp = Math.round(this.currentWeatherData.main.temp);
        var condition = this.currentWeatherData.weather[0].main.toLowerCase();
        var windSpeed = Math.round((this.currentWeatherData.wind && this.currentWeatherData.wind.speed ? this.currentWeatherData.wind.speed : 0) * 3.6);
        
        var advice = [];
        
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
        
        if (condition.indexOf('rain') > -1) {
            advice.push("🧥 Waterproof or water-resistant outer layer");
        }
        
        if (windSpeed > 15) {
            advice.push("💨 Wind-resistant clothing to stay comfortable");
        }
        
        return 'Based on ' + temp + '°C weather:\n\n' + advice.join('\n');
    },
    
    getActivityAdvice: function() {
        if (!this.currentWeatherData) return "I need weather data to suggest activities!";
        
        var temp = Math.round(this.currentWeatherData.main.temp);
        var condition = this.currentWeatherData.weather[0].main.toLowerCase();
        
        if (condition.indexOf('rain') > -1 || condition.indexOf('storm') > -1) {
            return "🏠 **Indoor activities recommended**: Visit a museum, go shopping, read a book, or try a new recipe. Perfect weather for cozy indoor pursuits!";
        } else if (condition.indexOf('snow') > -1) {
            return "❄️ **Winter activities**: If you enjoy snow, consider skiing, snowboarding, or building a snowman. Otherwise, warm indoor activities are best.";
        } else if (temp > 25 && condition.indexOf('clear') > -1) {
            return "🏖️ **Great for summer activities**: Swimming, beach visits, outdoor sports, or picnics. Just remember sun protection and hydration!";
        } else if (temp > 15 && temp <= 25) {
            return "🚶 **Perfect for outdoor activities**: Walking, hiking, cycling, outdoor dining, or sports. Ideal weather conditions for being active outside!";
        } else if (temp > 5) {
            return "🚶 **Light outdoor activities**: Brisk walks, jogging, or outdoor markets. Layer up and enjoy the fresh air!";
        } else {
            return "🏠 **Indoor activities recommended**: Cold weather calls for cozy indoor pursuits. Try a gym workout, indoor climbing, or cultural activities.";
        }
    },
    
    getGeneralWeatherAdvice: function() {
        if (!this.currentWeatherData) return "Search for a location first to get personalized weather advice!";
        
        var temp = Math.round(this.currentWeatherData.main.temp);
        var condition = this.currentWeatherData.weather[0].description;
        var location = this.currentWeatherData.name + ', ' + this.currentWeatherData.sys.country;
        
        return 'Current conditions in ' + location + ' show ' + condition + ' with temperatures around ' + temp + '°C. This is great weather data to work with! Feel free to ask me specific questions about clothing, activities, or whether you need an umbrella today.';
    },
    
    getOfflineInsight: function(weatherData) {
        var temp = Math.round(weatherData.main.temp);
        var condition = weatherData.weather[0].description;
        return '**Offline Weather Summary**<br>Current conditions show ' + condition + ' with ' + temp + '°C temperature. Connect to the internet for detailed AI insights.';
    },
    
    getOfflineChatResponse: function(query) {
        return "I'm currently offline and can't provide detailed AI responses. Please check your internet connection and try again!";
    },
    
    formatInsightResponse: function(response) {
        return response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    },
    
    getFallbackInsight: function(weatherData) {
        var temp = Math.round(weatherData.main.temp);
        var condition = weatherData.weather[0].description;
        return '<strong>Weather Summary</strong><br>Current conditions show ' + condition + ' with ' + temp + '°C temperature. Check back soon for more detailed AI insights.';
    },
    
    getFallbackChatResponse: function(query) {
        return "I'm having trouble connecting to the AI service right now. Please try again in a moment, or check that you've searched for a location to get current weather data!";
    }
};

// Enhanced WeatherPro Application with Universal Device Support
var WeatherPro = function() {
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
    
    // Device and browser detection
    this.deviceInfo = {
        type: DeviceCapabilities.getDeviceType(),
        hasTouch: DeviceCapabilities.hasTouch(),
        browser: DeviceCapabilities.getBrowserInfo(),
        performance: DeviceCapabilities.getPerformanceCapabilities(),
        connection: DeviceCapabilities.getConnectionInfo()
    };
    
    // Initialize AI with enhanced error handling
    try {
        this.weatherAI = new WeatherAI();
    } catch (error) {
        console.error('Failed to initialize WeatherAI:', error);
        this.weatherAI = null;
    }
    
    this.init();
};

WeatherPro.prototype = {
    init: function() {
        var self = this;
        
        // Ensure DOM is ready with cross-browser support
        if (document.readyState === 'loading') {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', function() {
                    self.initializeApp();
                });
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', function() {
                    if (document.readyState === 'complete') {
                        self.initializeApp();
                    }
                });
            }
        } else {
            this.initializeApp();
        }
    },
    
    initializeApp: function() {
        try {
            this.bindEvents();
            this.updateCurrentDate();
            this.loadDefaultWeather();
            this.initNavigation();
            this.initContactForm();
            this.initAIChat();
            this.initAccessibilityFeatures();
            this.initPerformanceOptimizations();
            this.logDeviceInfo();
        } catch (error) {
            console.error('Error initializing WeatherPro:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    },
    
    logDeviceInfo: function() {
        console.log('WeatherPro Device Info:', {
            type: this.deviceInfo.type,
            hasTouch: this.deviceInfo.hasTouch,
            browser: this.deviceInfo.browser,
            connection: this.deviceInfo.connection,
            performance: this.deviceInfo.performance
        });
    },
    
    bindEvents: function() {
        var self = this;
        
        // Weather functionality with enhanced event handling
        var searchBtn = this.getElementById('searchBtn');
        var cityInput = this.getElementById('cityInput');
        var locationBtn = this.getElementById('locationBtn');
        var retryBtn = this.getElementById('retryBtn');
        
        if (searchBtn) {
            this.addEventListenerSafe(searchBtn, 'click', function(e) {
                e.preventDefault();
                self.handleSearch();
            });
        }
        
        if (cityInput) {
            this.addEventListenerSafe(cityInput, 'keypress', function(e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    self.handleSearch();
                }
            });
            
            // Touch-friendly input handling
            if (this.deviceInfo.hasTouch) {
                this.addEventListenerSafe(cityInput, 'touchstart', function(e) {
                    e.stopPropagation();
                });
            }
        }
        
        if (locationBtn) {
            this.addEventListenerSafe(locationBtn, 'click', function(e) {
                e.preventDefault();
                self.handleGeolocation();
            });
        }
        
        if (retryBtn) {
            this.addEventListenerSafe(retryBtn, 'click', function(e) {
                e.preventDefault();
                self.loadDefaultWeather();
            });
        }
        
        // Navigation events with touch support
        var hamburger = this.getElementById('hamburger');
        var mobileMenuOverlay = this.getElementById('mobileMenuOverlay');
        
        if (hamburger) {
            this.addEventListenerSafe(hamburger, 'click', function(e) {
                e.preventDefault();
                self.toggleMobileMenu();
            });
            
            // Keyboard accessibility
            this.addEventListenerSafe(hamburger, 'keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    self.toggleMobileMenu();
                }
            });
        }
        
        if (mobileMenuOverlay) {
            this.addEventListenerSafe(mobileMenuOverlay, 'click', function(e) {
                if (e.target === mobileMenuOverlay) {
                    self.closeMobileMenu();
                }
            });
            
            // Touch events for mobile
            if (this.deviceInfo.hasTouch) {
                this.addEventListenerSafe(mobileMenuOverlay, 'touchend', function(e) {
                    if (e.target === mobileMenuOverlay) {
                        self.closeMobileMenu();
                    }
                });
            }
        }
        
        // Enhanced smooth scrolling for navigation links
        var navLinks = document.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < navLinks.length; i++) {
            (function(link) {
                self.addEventListenerSafe(link, 'click', function(e) {
                    e.preventDefault();
                    var targetId = link.getAttribute('href').substring(1);
                    var target = self.getElementById(targetId);
                    if (target) {
                        self.scrollToSection(target);
                        self.closeMobileMenu();
                    }
                });
            })(navLinks[i]);
        }
        
        // Window events with throttling
        this.addEventListenerSafe(window, 'scroll', this.throttle(function() {
            self.updateActiveNav();
        }, 100));
        
        this.addEventListenerSafe(window, 'resize', this.throttle(function() {
            self.handleResize();
        }, 250));
        
        // Network status monitoring
        this.addEventListenerSafe(window, 'online', function() {
            console.log('Network: Online');
            if (self.weatherAI) {
                self.weatherAI.isOnline = true;
            }
        });
        
        this.addEventListenerSafe(window, 'offline', function() {
            console.log('Network: Offline');
            if (self.weatherAI) {
                self.weatherAI.isOnline = false;
            }
        });
    },
    
    // Cross-browser event listener with fallback
    addEventListenerSafe: function(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        }
    },
    
    // Cross-browser getElementById with error handling
    getElementById: function(id) {
        try {
            return document.getElementById(id);
        } catch (error) {
            console.error('Element not found:', id);
            return null;
        }
    },
    
    // Throttle function for performance
    throttle: function(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    },
    
    // Handle window resize for responsive adjustments
    handleResize: function() {
        var newDeviceType = DeviceCapabilities.getDeviceType();
        if (newDeviceType !== this.deviceInfo.type) {
            this.deviceInfo.type = newDeviceType;
            this.optimizeForDevice();
        }
    },
    
    // Optimize performance based on device capabilities
    optimizeForDevice: function() {
        var body = document.body;
        if (!body) return;
        
        // Remove existing device classes
        body.className = body.className.replace(/\b(mobile|tablet|desktop|low-performance)\b/g, '');
        
        // Add current device class
        body.className += ' ' + this.deviceInfo.type;
        
        // Add performance class for low-end devices
        if (this.deviceInfo.performance.hardwareConcurrency <= 2 || this.deviceInfo.performance.deviceMemory <= 2) {
            body.className += ' low-performance';
        }
        
        // Optimize animations for low-performance devices
        if (this.deviceInfo.performance.reducedMotion || this.deviceInfo.connection.effectiveType === '2g') {
            body.className += ' reduce-animations';
        }
    },
    
    // Enhanced accessibility features
    initAccessibilityFeatures: function() {
        // Skip navigation link functionality
        var skipLink = document.querySelector('.sr-only-focusable');
        if (skipLink) {
            this.addEventListenerSafe(skipLink, 'click', function(e) {
                e.preventDefault();
                var target = document.getElementById('main-content');
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
        
        // Enhanced keyboard navigation
        this.addEventListenerSafe(document, 'keydown', this.handleGlobalKeydown.bind(this));
        
        // Announce dynamic content changes
        this.createAriaLiveRegion();
    },
    
    createAriaLiveRegion: function() {
        var liveRegion = document.createElement('div');
        liveRegion.setAttribute('id', 'aria-live-region');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    },
    
    announceToScreenReader: function(message) {
        var liveRegion = this.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(function() {
                liveRegion.textContent = '';
            }, 1000);
        }
    },
    
    handleGlobalKeydown: function(e) {
        // Escape key closes modals
        if (e.key === 'Escape' || e.keyCode === 27) {
            this.closeMobileMenu();
            this.closeAIChat();
        }
    },
    
    // Performance optimizations
    initPerformanceOptimizations: function() {
        // Preload critical resources on fast connections
        if (this.deviceInfo.connection.effectiveType === '4g' && !this.deviceInfo.connection.saveData) {
            this.preloadCriticalResources();
        }
        
        // Implement service worker for caching (if supported)
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            this.registerServiceWorker();
        }
    },
    
    preloadCriticalResources: function() {
        // Preload weather API endpoint
        var preloadLink = document.createElement('link');
        preloadLink.rel = 'dns-prefetch';
        preloadLink.href = this.baseUrl;
        document.head.appendChild(preloadLink);
    },
    
    registerServiceWorker: function() {
        // Service worker registration would go here for offline support
        // Simplified for demo - would implement full caching strategy in production
        console.log('Service Worker registration would be implemented here for offline support');
    },
    
    // AI Chat functionality with enhanced error handling
    initAIChat: function() {
        var self = this;
        var aiChatBubble = this.getElementById('aiChatBubble');
        var aiChatPanel = this.getElementById('aiChatPanel');
        var aiChatClose = this.getElementById('aiChatClose');
        var aiChatSend = this.getElementById('aiChatSend');
        var aiChatInput = this.getElementById('aiChatInput');
        
        if (aiChatBubble) {
            this.addEventListenerSafe(aiChatBubble, 'click', function(e) {
                e.preventDefault();
                self.toggleAIChat();
            });
            
            this.addEventListenerSafe(aiChatBubble, 'keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    self.toggleAIChat();
                }
            });
        }
        
        if (aiChatClose) {
            this.addEventListenerSafe(aiChatClose, 'click', function(e) {
                e.preventDefault();
                self.closeAIChat();
            });
        }
        
        if (aiChatSend) {
            this.addEventListenerSafe(aiChatSend, 'click', function(e) {
                e.preventDefault();
                self.sendAIMessage();
            });
        }
        
        if (aiChatInput) {
            this.addEventListenerSafe(aiChatInput, 'keypress', function(e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    self.sendAIMessage();
                }
            });
        }
        
        // Suggestion buttons
        var suggestionButtons = document.querySelectorAll('.ai-suggestion-btn');
        for (var i = 0; i < suggestionButtons.length; i++) {
            (function(btn) {
                self.addEventListenerSafe(btn, 'click', function(e) {
                    e.preventDefault();
                    var query = btn.getAttribute('data-query');
                    self.handleSuggestionClick(query);
                });
            })(suggestionButtons[i]);
        }
    },
    
    toggleAIChat: function() {
        var aiChatPanel = this.getElementById('aiChatPanel');
        if (aiChatPanel) {
            var isHidden = aiChatPanel.classList.contains('hidden');
            if (isHidden) {
                aiChatPanel.classList.remove('hidden');
                aiChatPanel.setAttribute('aria-hidden', 'false');
                var aiChatInput = this.getElementById('aiChatInput');
                if (aiChatInput) {
                    aiChatInput.focus();
                }
                this.announceToScreenReader('AI chat opened');
            } else {
                this.closeAIChat();
            }
        }
    },
    
    closeAIChat: function() {
        var aiChatPanel = this.getElementById('aiChatPanel');
        if (aiChatPanel) {
            aiChatPanel.classList.add('hidden');
            aiChatPanel.setAttribute('aria-hidden', 'true');
            this.announceToScreenReader('AI chat closed');
        }
    },
    
    sendAIMessage: function() {
        var self = this;
        var aiChatInput = this.getElementById('aiChatInput');
        var message = aiChatInput && aiChatInput.value ? aiChatInput.value.trim() : '';
        
        if (!message) return;
        
        if (!this.weatherAI) {
            this.addChatMessage("AI assistant is not available. Please refresh the page and try again.", 'ai');
            return;
        }
        
        // Clear input
        if (aiChatInput) {
            aiChatInput.value = '';
        }
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        
        // Show typing indicator
        this.showAITyping();
        
        // Get AI response with enhanced error handling
        this.weatherAI.handleChatQuery(message)
            .then(function(response) {
                self.hideAITyping();
                self.addChatMessage(response, 'ai');
                self.announceToScreenReader('AI responded to your message');
            })
            .catch(function(error) {
                console.error('AI chat error:', error);
                self.hideAITyping();
                self.addChatMessage("Sorry, I'm having trouble responding right now. Please try again!", 'ai');
                self.announceToScreenReader('AI error occurred');
            });
    },
    
    handleSuggestionClick: function(query) {
        var aiChatInput = this.getElementById('aiChatInput');
        if (aiChatInput) {
            aiChatInput.value = query;
        }
        this.sendAIMessage();
    },
    
    addChatMessage: function(message, sender) {
        var aiChatMessages = this.getElementById('aiChatMessages');
        if (!aiChatMessages) return;
        
        var messageElement = document.createElement('div');
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
        messageElement.setAttribute('role', 'listitem');
        
        var avatar = document.createElement('div');
        avatar.className = sender === 'user' ? 'user-avatar' : 'ai-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        avatar.setAttribute('aria-hidden', 'true');
        
        var text = document.createElement('div');
        text.className = sender === 'user' ? 'user-text' : 'ai-text';
        text.innerHTML = message; // Using innerHTML to support formatting
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(text);
        
        aiChatMessages.appendChild(messageElement);
        
        // Scroll to bottom with smooth behavior if supported
        if (aiChatMessages.scrollTo) {
            aiChatMessages.scrollTo({
                top: aiChatMessages.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
    },
    
    showAITyping: function() {
        var aiChatMessages = this.getElementById('aiChatMessages');
        if (!aiChatMessages) return;
        
        var typingElement = document.createElement('div');
        typingElement.className = 'ai-message ai-typing-message';
        typingElement.innerHTML = '<div class="ai-avatar" aria-hidden="true">🤖</div>' +
                                 '<div class="ai-text ai-typing">' +
                                 '<span>Thinking...</span>' +
                                 '<div class="ai-typing-dots">' +
                                 '<div class="ai-typing-dot"></div>' +
                                 '<div class="ai-typing-dot"></div>' +
                                 '<div class="ai-typing-dot"></div>' +
                                 '</div>' +
                                 '</div>';
        
        aiChatMessages.appendChild(typingElement);
        if (aiChatMessages.scrollTo) {
            aiChatMessages.scrollTo({
                top: aiChatMessages.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
    },
    
    hideAITyping: function() {
        var typingMessage = document.querySelector('.ai-typing-message');
        if (typingMessage && typingMessage.parentNode) {
            typingMessage.parentNode.removeChild(typingMessage);
        }
    },
    
    generateAIInsights: function(weatherData, forecastData) {
        var self = this;
        var aiInsightsCard = this.getElementById('aiInsightsCard');
        var aiInsightsContent = this.getElementById('aiInsightsContent');
        var aiInsightsLoading = this.getElementById('aiInsightsLoading');
        
        if (!aiInsightsCard || !aiInsightsContent) return;
        
        // Show the insights card and loading state
        aiInsightsCard.classList.remove('hidden');
        if (aiInsightsLoading) {
            aiInsightsLoading.classList.remove('hidden');
        }
        
        if (!this.weatherAI) {
            if (aiInsightsLoading) {
                aiInsightsLoading.classList.add('hidden');
            }
            aiInsightsContent.innerHTML = '<p>AI insights are not available at this time.</p>';
            return Promise.resolve();
        }
        
        return this.weatherAI.generateWeatherInsight(weatherData, forecastData)
            .then(function(insights) {
                if (aiInsightsLoading) {
                    aiInsightsLoading.classList.add('hidden');
                }
                
                var formattedInsights = insights.split('\n\n').map(function(insight) {
                    return '<div class="ai-insight-item">' + insight.trim() + '</div>';
                }).join('');
                
                aiInsightsContent.innerHTML = formattedInsights;
                self.announceToScreenReader('AI weather insights loaded');
            })
            .catch(function(error) {
                console.error('Error generating AI insights:', error);
                if (aiInsightsLoading) {
                    aiInsightsLoading.classList.add('hidden');
                }
                aiInsightsContent.innerHTML = '<p>Unable to generate insights at this time. Please try again later.</p>';
            });
    },
    
    // Navigation functionality with enhanced accessibility
    initNavigation: function() {
        this.updateActiveNav();
    },
    
    toggleMobileMenu: function() {
        var hamburger = this.getElementById('hamburger');
        var mobileMenuOverlay = this.getElementById('mobileMenuOverlay');
        
        if (hamburger && mobileMenuOverlay) {
            var isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                hamburger.classList.add('active');
                hamburger.setAttribute('aria-expanded', 'true');
                mobileMenuOverlay.classList.add('active');
                mobileMenuOverlay.classList.remove('hidden');
                mobileMenuOverlay.setAttribute('aria-hidden', 'false');
                
                // Focus management
                var firstLink = mobileMenuOverlay.querySelector('.mobile-nav-link');
                if (firstLink) {
                    firstLink.focus();
                }
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = 'hidden';
                this.announceToScreenReader('Navigation menu opened');
            }
        }
    },
    
    closeMobileMenu: function() {
        var hamburger = this.getElementById('hamburger');
        var mobileMenuOverlay = this.getElementById('mobileMenuOverlay');
        
        if (hamburger && mobileMenuOverlay) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            this.announceToScreenReader('Navigation menu closed');
        }
    },
    
    scrollToSection: function(target) {
        var navbarHeight = this.deviceInfo.type === 'mobile' ? 55 : 60;
        var targetPosition = target.offsetTop - navbarHeight;
        
        // Smooth scroll with fallback for older browsers
        if (window.scrollTo && window.scrollTo.length > 1) {
            try {
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } catch (e) {
                window.scrollTo(0, targetPosition);
            }
        } else {
            window.scrollTo(0, targetPosition);
        }
    },
    
    updateActiveNav: function() {
        var sections = document.querySelectorAll('.section');
        var navLinks = document.querySelectorAll('.nav-link');
        var navbarHeight = this.deviceInfo.type === 'mobile' ? 55 : 60;
        
        var currentSection = '';
        
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var sectionTop = section.offsetTop - navbarHeight - 100;
            var sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
                break;
            }
        }
        
        for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        }
    },
    
    // Contact form functionality with enhanced validation
    initContactForm: function() {
        var self = this;
        var contactForm = this.getElementById('contactForm');
        
        if (contactForm) {
            this.addEventListenerSafe(contactForm, 'submit', function(e) {
                self.handleContactSubmit(e);
            });
        }
        
        // Real-time validation with accessibility
        var nameInput = this.getElementById('contactName');
        var emailInput = this.getElementById('contactEmail');
        var messageInput = this.getElementById('contactMessage');
        
        if (nameInput) {
            this.addEventListenerSafe(nameInput, 'blur', function() { self.validateField('name'); });
            this.addEventListenerSafe(nameInput, 'input', function() { self.clearFieldError('name'); });
        }
        
        if (emailInput) {
            this.addEventListenerSafe(emailInput, 'blur', function() { self.validateField('email'); });
            this.addEventListenerSafe(emailInput, 'input', function() { self.clearFieldError('email'); });
        }
        
        if (messageInput) {
            this.addEventListenerSafe(messageInput, 'blur', function() { self.validateField('message'); });
            this.addEventListenerSafe(messageInput, 'input', function() { self.clearFieldError('message'); });
        }
    },
    
    validateField: function(fieldName) {
        var field = this.getElementById('contact' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
        var errorElement = this.getElementById(fieldName + 'Error');
        
        if (!field || !errorElement) return true;
        
        var isValid = true;
        var errorMessage = '';
        var value = field.value ? field.value.trim() : '';
        
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
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            field.setAttribute('aria-invalid', 'true');
        } else {
            this.clearFieldError(fieldName);
            field.style.borderColor = 'var(--color-border)';
            field.setAttribute('aria-invalid', 'false');
        }
        
        return isValid;
    },
    
    showFieldError: function(fieldName, message) {
        var errorElement = this.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },
    
    clearFieldError: function(fieldName) {
        var errorElement = this.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    },
    
    handleContactSubmit: function(e) {
        e.preventDefault();
        
        var self = this;
        
        // Hide previous messages
        this.hideFormMessages();
        
        // Validate all fields
        var nameValid = this.validateField('name');
        var emailValid = this.validateField('email');
        var messageValid = this.validateField('message');
        
        if (!nameValid || !emailValid || !messageValid) {
            this.showFormError('Please fix the errors above');
            this.announceToScreenReader('Form has validation errors');
            return;
        }
        
        var submitBtn = this.getElementById('submitBtn');
        var originalText = submitBtn ? submitBtn.textContent : 'Send Message';
        
        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            
            // Simulate form submission
            this.simulateFormSubmission()
                .then(function() {
                    self.showFormSuccess();
                    self.resetContactForm();
                    self.announceToScreenReader('Message sent successfully');
                })
                .catch(function(error) {
                    self.showFormError('Failed to send message. Please try again.');
                    self.announceToScreenReader('Failed to send message');
                })
                .finally(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                });
                
        } catch (error) {
            this.showFormError('Failed to send message. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    },
    
    simulateFormSubmission: function() {
        // Simulate API delay based on connection speed
        var delay = this.deviceInfo.connection.effectiveType === '2g' ? 3000 : 1500;
        
        return new Promise(function(resolve) {
            setTimeout(resolve, delay);
        });
    },
    
    hideFormMessages: function() {
        var successElement = this.getElementById('formSuccess');
        var errorElement = this.getElementById('formError');
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
    showFormSuccess: function() {
        var successElement = this.getElementById('formSuccess');
        var errorElement = this.getElementById('formError');
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        if (successElement) {
            successElement.classList.remove('hidden');
            
            // Scroll to success message to ensure it's visible
            if (successElement.scrollIntoView) {
                successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Auto-hide after 10 seconds
        var self = this;
        setTimeout(function() {
            if (successElement) {
                successElement.classList.add('hidden');
            }
        }, 10000);
    },
    
    showFormError: function(message) {
        var errorElement = this.getElementById('formError');
        var errorMessage = this.getElementById('formErrorMessage');
        var successElement = this.getElementById('formSuccess');
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        if (errorElement) {
            errorElement.classList.remove('hidden');
            
            // Scroll to error message to ensure it's visible
            if (errorElement.scrollIntoView) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Auto-hide after 8 seconds
        var self = this;
        setTimeout(function() {
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        }, 8000);
    },
    
    resetContactForm: function() {
        var form = this.getElementById('contactForm');
        if (form && form.reset) {
            form.reset();
            
            // Clear any field errors
            var fields = ['name', 'email', 'message'];
            for (var i = 0; i < fields.length; i++) {
                this.clearFieldError(fields[i]);
                var fieldElement = this.getElementById('contact' + fields[i].charAt(0).toUpperCase() + fields[i].slice(1));
                if (fieldElement) {
                    fieldElement.style.borderColor = 'var(--color-border)';
                    fieldElement.setAttribute('aria-invalid', 'false');
                }
            }
        }
    },
    
    // Weather functionality with enhanced error handling and performance
    updateCurrentDate: function() {
        var currentDateElement = this.getElementById('currentDate');
        if (currentDateElement) {
            var now = new Date();
            var options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            try {
                var dateString = now.toLocaleDateString('en-US', options);
                currentDateElement.textContent = dateString;
                currentDateElement.setAttribute('datetime', now.toISOString());
            } catch (error) {
                // Fallback for older browsers
                currentDateElement.textContent = now.toString();
            }
        }
    },
    
    loadDefaultWeather: function() {
        return this.fetchWeatherByCity('London');
    },
    
    handleSearch: function() {
        var cityInput = this.getElementById('cityInput');
        var city = cityInput && cityInput.value ? cityInput.value.trim() : '';
        
        if (!city) {
            this.showError('Please enter a city name');
            this.announceToScreenReader('Please enter a city name');
            return;
        }
        
        this.fetchWeatherByCity(city);
        if (cityInput) {
            cityInput.value = '';
        }
    },
    
    handleGeolocation: function() {
        var self = this;
        
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            this.announceToScreenReader('Geolocation not supported');
            return;
        }
        
        var locationBtn = this.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.disabled = true;
            var btnText = locationBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Getting Location...';
            }
        }
        
        this.showLoading();
        this.announceToScreenReader('Getting your location');
        
        this.getCurrentPosition()
            .then(function(position) {
                var coords = position.coords;
                return self.fetchWeatherByCoords(coords.latitude, coords.longitude);
            })
            .catch(function(error) {
                var message = 'Unable to retrieve your location';
                switch (error.code) {
                    case 1: // PERMISSION_DENIED
                        message = 'Location access denied by user';
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        message = 'Location information unavailable';
                        break;
                    case 3: // TIMEOUT
                        message = 'Location request timed out';
                        break;
                    default:
                        message = 'Failed to get your location';
                        break;
                }
                self.showError(message);
                self.announceToScreenReader(message);
            })
            .finally(function() {
                if (locationBtn) {
                    locationBtn.disabled = false;
                    var btnText = locationBtn.querySelector('.btn-text');
                    if (btnText) {
                        btnText.textContent = 'Use My Location';
                    }
                }
            });
    },
    
    getCurrentPosition: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000, // Increased timeout for slower devices
                maximumAge: 600000 // 10 minutes
            });
        });
    },
    
    fetchWeatherByCity: function(city) {
        var self = this;
        this.showLoading();
        
        var searchBtn = this.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = true;
        }
        
        var currentWeatherUrl = this.baseUrl + '/weather?q=' + encodeURIComponent(city) + '&appid=' + this.apiKey + '&units=metric';
        var forecastUrl = this.baseUrl + '/forecast?q=' + encodeURIComponent(city) + '&appid=' + this.apiKey + '&units=metric';
        
        return Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ])
        .then(function(responses) {
            var currentResponse = responses[0];
            var forecastResponse = responses[1];
            
            if (!currentResponse.ok) {
                if (currentResponse.status === 404) {
                    throw new Error('City "' + city + '" not found. Please check the spelling and try again.');
                } else if (currentResponse.status === 401) {
                    throw new Error('API key invalid. Please check your API configuration.');
                } else {
                    throw new Error('Failed to fetch weather data (Status: ' + currentResponse.status + ')');
                }
            }
            
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            return Promise.all([
                currentResponse.json(),
                forecastResponse.json()
            ]);
        })
        .then(function(data) {
            var currentData = data[0];
            var forecastData = data[1];
            
            // Store data for AI
            self.currentWeatherData = currentData;
            self.currentForecastData = forecastData;
            
            self.displayWeatherData(currentData, forecastData);
            self.updateBackgroundByWeather(currentData.weather[0].main);
            self.announceToScreenReader('Weather data loaded for ' + currentData.name);
            
            // Generate AI insights after displaying weather data
            return self.generateAIInsights(currentData, forecastData);
        })
        .catch(function(error) {
            console.error('Error fetching weather:', error);
            var errorMessage = error.message || 'Failed to fetch weather data. Please try again.';
            self.showError(errorMessage);
            self.announceToScreenReader('Error: ' + errorMessage);
        })
        .finally(function() {
            if (searchBtn) {
                searchBtn.disabled = false;
            }
        });
    },
    
    fetchWeatherByCoords: function(lat, lon) {
        var self = this;
        this.showLoading();
        
        var currentWeatherUrl = this.baseUrl + '/weather?lat=' + lat + '&lon=' + lon + '&appid=' + this.apiKey + '&units=metric';
        var forecastUrl = this.baseUrl + '/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + this.apiKey + '&units=metric';
        
        return Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ])
        .then(function(responses) {
            var currentResponse = responses[0];
            var forecastResponse = responses[1];
            
            if (!currentResponse.ok) {
                throw new Error('Failed to fetch weather data for your location');
            }
            
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data for your location');
            }
            
            return Promise.all([
                currentResponse.json(),
                forecastResponse.json()
            ]);
        })
        .then(function(data) {
            var currentData = data[0];
            var forecastData = data[1];
            
            // Store data for AI
            self.currentWeatherData = currentData;
            self.currentForecastData = forecastData;
            
            self.displayWeatherData(currentData, forecastData);
            self.updateBackgroundByWeather(currentData.weather[0].main);
            self.announceToScreenReader('Weather data loaded for your location');
            
            // Generate AI insights after displaying weather data
            return self.generateAIInsights(currentData, forecastData);
        })
        .catch(function(error) {
            console.error('Error fetching weather:', error);
            var errorMessage = error.message || 'Failed to fetch weather data for your location';
            self.showError(errorMessage);
            self.announceToScreenReader('Error: ' + errorMessage);
        });
    },
    
    displayWeatherData: function(currentData, forecastData) {
        try {
            console.log('Displaying weather data for:', currentData);
            
            // Update current weather - FIXED: Ensure location is properly updated
            var locationElement = this.getElementById('currentLocation');
            if (locationElement && currentData && currentData.name && currentData.sys && currentData.sys.country) {
                var locationText = currentData.name + ', ' + currentData.sys.country;
                locationElement.textContent = locationText;
                console.log('Updated location display to:', locationText);
            } else {
                console.error('Location element or data missing:', {
                    locationElement: !!locationElement,
                    currentData: !!currentData,
                    name: currentData ? currentData.name : 'missing',
                    sys: currentData ? currentData.sys : 'missing'
                });
            }
            
            var tempElement = this.getElementById('currentTemp');
            if (tempElement && currentData && currentData.main) {
                var temperature = Math.round(currentData.main.temp);
                tempElement.textContent = temperature;
                tempElement.setAttribute('aria-label', temperature + ' degrees Celsius');
            }
            
            var descElement = this.getElementById('weatherDescription');
            if (descElement && currentData && currentData.weather && currentData.weather[0]) {
                descElement.textContent = currentData.weather[0].description;
            }
            
            var feelsLikeElement = this.getElementById('feelsLike');
            if (feelsLikeElement && currentData && currentData.main) {
                feelsLikeElement.textContent = Math.round(currentData.main.feels_like);
            }
            
            // Update weather icon
            if (currentData && currentData.weather && currentData.weather[0]) {
                var iconCode = currentData.weather[0].icon;
                var iconElement = this.getElementById('weatherIconLarge');
                if (iconElement) {
                    var icon = this.weatherIcons[iconCode] || '🌤️';
                    iconElement.textContent = icon;
                    iconElement.setAttribute('aria-label', 'Weather condition: ' + currentData.weather[0].description);
                }
            }
            
            // Update weather details with accessibility labels
            if (currentData && currentData.main) {
                this.updateDetailElement('humidity', currentData.main.humidity + '%', 'Humidity ' + currentData.main.humidity + ' percent');
                this.updateDetailElement('windSpeed', Math.round((currentData.wind && currentData.wind.speed ? currentData.wind.speed : 0) * 3.6) + ' km/h', 'Wind speed ' + Math.round((currentData.wind && currentData.wind.speed ? currentData.wind.speed : 0) * 3.6) + ' kilometers per hour');
                this.updateDetailElement('pressure', currentData.main.pressure + ' hPa', 'Atmospheric pressure ' + currentData.main.pressure + ' hectopascals');
                this.updateDetailElement('visibility', Math.round(((currentData.visibility || 10000) / 1000)) + ' km', 'Visibility ' + Math.round(((currentData.visibility || 10000) / 1000)) + ' kilometers');
            }
            
            // Update sun times
            if (currentData && currentData.sys) {
                var sunrise = new Date(currentData.sys.sunrise * 1000);
                var sunset = new Date(currentData.sys.sunset * 1000);
                
                this.updateTimeElement('sunrise', sunrise);
                this.updateTimeElement('sunset', sunset);
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
    },
    
    updateDetailElement: function(elementId, textContent, ariaLabel) {
        var element = this.getElementById(elementId);
        if (element) {
            element.textContent = textContent;
            if (ariaLabel) {
                element.setAttribute('aria-label', ariaLabel);
            }
        }
    },
    
    updateTimeElement: function(elementId, dateTime) {
        var element = this.getElementById(elementId);
        if (element) {
            try {
                var timeString = dateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                });
                element.textContent = timeString;
                element.setAttribute('datetime', dateTime.toISOString());
            } catch (error) {
                // Fallback for older browsers
                element.textContent = dateTime.getHours() + ':' + 
                                    (dateTime.getMinutes() < 10 ? '0' : '') + 
                                    dateTime.getMinutes();
            }
        }
    },
    
    displayForecast: function(forecastData) {
        var forecastContainer = this.getElementById('forecastContainer');
        if (!forecastContainer) {
            console.error('Forecast container not found');
            return;
        }
        
        // Clear existing content
        forecastContainer.innerHTML = '';
        
        try {
            // Group forecast data by day
            var dailyForecasts = {};
            
            for (var i = 0; i < forecastData.list.length; i++) {
                var item = forecastData.list[i];
                var date = new Date(item.dt * 1000);
                var dateKey = date.toDateString();
                
                // Take the forecast closest to noon for each day
                if (!dailyForecasts[dateKey] || 
                    Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
                    dailyForecasts[dateKey] = item;
                }
            }
            
            // Get first 5 days
            var forecasts = [];
            for (var key in dailyForecasts) {
                forecasts.push(dailyForecasts[key]);
                if (forecasts.length >= 5) break;
            }
            
            console.log('Creating ' + forecasts.length + ' forecast cards');
            
            if (forecasts.length === 0) {
                forecastContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">No forecast data available</p>';
                return;
            }
            
            for (var j = 0; j < forecasts.length; j++) {
                var forecast = forecasts[j];
                var forecastCard = document.createElement('div');
                forecastCard.className = 'forecast-card';
                forecastCard.setAttribute('role', 'listitem');
                
                var date = new Date(forecast.dt * 1000);
                var dateStr = j === 0 ? 'Today' : this.formatForecastDate(date);
                
                var iconCode = forecast.weather[0].icon;
                var icon = this.weatherIcons[iconCode] || '🌤️';
                var description = forecast.weather[0].description;
                var highTemp = Math.round(forecast.main.temp_max);
                var lowTemp = Math.round(forecast.main.temp_min);
                
                forecastCard.innerHTML = 
                    '<p class="forecast-date">' + dateStr + '</p>' +
                    '<div class="forecast-icon" aria-label="' + description + '">' + icon + '</div>' +
                    '<div class="forecast-temps">' +
                    '<span class="forecast-high" aria-label="High ' + highTemp + ' degrees">' + highTemp + '°</span>' +
                    '<span class="forecast-low" aria-label="Low ' + lowTemp + ' degrees">' + lowTemp + '°</span>' +
                    '</div>' +
                    '<p class="forecast-desc">' + description + '</p>';
                
                forecastContainer.appendChild(forecastCard);
            }
            
        } catch (error) {
            console.error('Error displaying forecast:', error);
            forecastContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.8); text-align: center;">Unable to load forecast data</p>';
        }
    },
    
    formatForecastDate: function(date) {
        try {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            // Fallback for older browsers
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return days[date.getDay()] + ' ' + months[date.getMonth()] + ' ' + date.getDate();
        }
    },
    
    updateBackgroundByWeather: function(weatherMain) {
        var weatherBackground = document.querySelector('.weather-background');
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
    },
    
    showLoading: function() {
        var loadingState = this.getElementById('loadingState');
        var errorState = this.getElementById('errorState');
        var weatherContent = this.getElementById('weatherContent');
        
        if (loadingState) loadingState.classList.remove('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (weatherContent) weatherContent.classList.add('hidden');
    },
    
    showError: function(message) {
        var errorMessage = this.getElementById('errorMessage');
        var errorState = this.getElementById('errorState');
        var loadingState = this.getElementById('loadingState');
        var weatherContent = this.getElementById('weatherContent');
        
        if (errorMessage) errorMessage.textContent = message;
        if (errorState) errorState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (weatherContent) weatherContent.classList.add('hidden');
        
        console.error('Weather App Error:', message);
    },
    
    showWeatherContent: function() {
        var weatherContent = this.getElementById('weatherContent');
        var loadingState = this.getElementById('loadingState');
        var errorState = this.getElementById('errorState');
        
        if (weatherContent) weatherContent.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
    }
};

// Initialize the app with enhanced error handling and compatibility
(function() {
    'use strict';
    
    function initializeWeatherPro() {
        try {
            window.weatherProInstance = new WeatherPro();
            console.log('WeatherPro with AI initialized successfully for universal device compatibility');
        } catch (error) {
            console.error('Failed to initialize WeatherPro:', error);
            
            // Fallback error display
            var errorContainer = document.createElement('div');
            errorContainer.style.cssText = 'position: fixed; top: 20px; left: 20px; right: 20px; background: #f44336; color: white; padding: 15px; border-radius: 8px; z-index: 9999; text-align: center;';
            errorContainer.innerHTML = '<strong>Application Error:</strong> Failed to initialize WeatherPro. Please refresh the page.';
            document.body.appendChild(errorContainer);
            
            setTimeout(function() {
                if (errorContainer.parentNode) {
                    errorContainer.parentNode.removeChild(errorContainer);
                }
            }, 5000);
        }
    }
    
    // Enhanced DOM ready detection for maximum compatibility
    if (document.readyState === 'loading') {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', initializeWeatherPro, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    initializeWeatherPro();
                }
            });
        } else {
            // Fallback for very old browsers
            window.onload = initializeWeatherPro;
        }
    } else {
        initializeWeatherPro();
    }
})();
