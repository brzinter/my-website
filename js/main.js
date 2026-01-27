// Update time and date
function updateTime() {
    const now = new Date();

    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;

    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

// Update time immediately and then every second
updateTime();
setInterval(updateTime, 1000);

// Fetch weather data given coordinates
async function fetchWeatherData(lat, lon, locationSource = '') {
    try {
        // Using Open-Meteo API (free, no API key required)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
        console.log('Fetching weather from:', weatherUrl);

        const response = await fetch(weatherUrl);

        if (!response.ok) throw new Error('Weather data unavailable');

        const data = await response.json();
        console.log('Weather data received:', data);
        const current = data.current;

        // Weather code descriptions (WMO codes)
        const weatherDescriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };

        const weatherDescription = weatherDescriptions[current.weather_code] || 'Unknown';
        const locationNote = locationSource ? `<div style="font-size: 0.8em; opacity: 0.7; margin-top: 10px;">${locationSource}</div>` : '';

        document.getElementById('weather-content').innerHTML = `
            <div class="weather-info">
                <div class="weather-item">
                    <div class="temperature">${Math.round(current.temperature_2m)}°F</div>
                    <div class="weather-description">${weatherDescription}</div>
                </div>
            </div>
            <div class="weather-details">
                <div>Feels like: ${Math.round(current.apparent_temperature)}°F</div>
                <div>Humidity: ${current.relative_humidity_2m}%</div>
                <div>Wind: ${Math.round(current.wind_speed_10m)} mph</div>
            </div>
            ${locationNote}
        `;
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById('weather-content').innerHTML =
            `<div class="error">Unable to fetch weather data: ${error.message}</div>`;
    }
}

// Fallback: Get location from IP address
async function getWeatherFromIP() {
    console.log('Trying IP-based location...');
    document.getElementById('weather-content').innerHTML = '<div class="loading">Getting location from IP...</div>';

    try {
        // Using ipapi.co for IP-based geolocation (free, no API key needed)
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP location unavailable');

        const data = await response.json();
        console.log('IP location data:', data);

        const lat = data.latitude;
        const lon = data.longitude;
        const city = data.city;
        const region = data.region;

        await fetchWeatherData(lat, lon, `📍 Location: ${city}, ${region} (IP-based)`);
    } catch (error) {
        console.error('IP location error:', error);
        document.getElementById('weather-content').innerHTML =
            '<div class="error">Unable to determine location. Please enable location services in your browser.</div>';
    }
}

// Get weather based on user's location
function getWeather() {
    console.log('Requesting location for weather...');

    if (!navigator.geolocation) {
        console.log('Geolocation not supported, using IP fallback');
        getWeatherFromIP();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            console.log('GPS location received:', position.coords.latitude, position.coords.longitude);
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await fetchWeatherData(lat, lon, '📍 Using precise GPS location');
        },
        (error) => {
            console.error('Geolocation error:', error.code, error.message);
            console.log('GPS failed, falling back to IP-based location');
            // Fallback to IP-based location
            getWeatherFromIP();
        },
        {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Get weather when page loads
getWeather();

// Get ServiceNow stock data
async function getStockData() {
    try {
        const symbol = 'NOW';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

        // Try multiple proxy services as fallbacks
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`
        ];

        let data = null;
        let lastError = null;

        // Try each proxy in order
        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    signal: AbortSignal.timeout(8000) // 8 second timeout
                });

                if (!response.ok) {
                    lastError = new Error(`HTTP ${response.status}`);
                    continue;
                }

                const responseData = await response.json();

                if (responseData.chart && responseData.chart.result && responseData.chart.result.length > 0) {
                    data = responseData;
                    break; // Success! Exit the loop
                }
            } catch (error) {
                lastError = error;
                console.log(`Proxy failed: ${proxyUrl}`, error.message);
                continue; // Try next proxy
            }
        }

        if (!data) {
            throw lastError || new Error('All proxies failed');
        }

        const result = data.chart.result[0];
        const quote = result.meta;
        const indicators = result.indicators.quote[0];

        const price = quote.regularMarketPrice;
        const previousClose = quote.previousClose || quote.chartPreviousClose;
        const change = price - previousClose;
        const percentChange = (change / previousClose) * 100;
        const open = indicators.open[0];
        const high = indicators.high[0];
        const low = indicators.low[0];

        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '+' : '';

        document.getElementById('stock-content').innerHTML = `
            <div class="stock-info">
                <div class="stock-price">$${price.toFixed(2)}</div>
                <div class="stock-change ${changeClass}">
                    ${changeSymbol}${change.toFixed(2)} (${changeSymbol}${percentChange.toFixed(2)}%)
                </div>
                <div class="stock-details">
                    <div>Open: $${open.toFixed(2)}</div>
                    <div>High: $${high.toFixed(2)}</div>
                    <div>Low: $${low.toFixed(2)}</div>
                    <div>Prev Close: $${previousClose.toFixed(2)}</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Stock data error:', error);
        document.getElementById('stock-content').innerHTML =
            `<div class="error">Unable to fetch stock data. The service may be temporarily unavailable or rate limited. Try refreshing in a few minutes.</div>`;
    }
}

// Get top news headlines
async function getNews() {
    try {
        // Using CORS proxy to fetch RSS feed and parse it
        const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) throw new Error('News data unavailable');

        const data = await response.json();

        // Parse the RSS XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');

        // Get the first 3 items
        const items = xmlDoc.querySelectorAll('item');

        if (items.length === 0) {
            throw new Error('No news articles found');
        }

        const newsHtml = Array.from(items).slice(0, 3).map(item => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            const pubDate = new Date(item.querySelector('pubDate').textContent);
            const formattedDate = pubDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            return `
                <div class="news-item">
                    <a href="${link}" target="_blank">
                        <h3>${title}</h3>
                        <div class="news-source">BBC News - ${formattedDate}</div>
                    </a>
                </div>
            `;
        }).join('');

        document.getElementById('news-content').innerHTML = `
            <div class="news-list">
                ${newsHtml}
            </div>
        `;
    } catch (error) {
        document.getElementById('news-content').innerHTML =
            `<div class="error">Unable to fetch news: ${error.message}</div>`;
    }
}

// Load stock and news data
getStockData();
getNews();

// Refresh stock data every 5 minutes
setInterval(getStockData, 5 * 60 * 1000);

// Refresh news every 15 minutes
setInterval(getNews, 15 * 60 * 1000);
