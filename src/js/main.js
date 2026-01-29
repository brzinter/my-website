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
    // Try multiple RSS feeds using rss2json service
    const newsSources = [
        {
            name: 'BBC News',
            rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml'
        },
        {
            name: 'TechCrunch',
            rssUrl: 'https://techcrunch.com/feed/'
        },
        {
            name: 'Hacker News',
            rssUrl: 'https://news.ycombinator.com/rss'
        }
    ];

    for (const source of newsSources) {
        try {
            console.log(`Trying to fetch news from ${source.name}...`);

            // Use rss2json service - free, no API key needed
            const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`;

            const response = await fetch(rss2jsonUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(8000)
            });

            if (!response.ok) {
                console.log(`RSS2JSON returned ${response.status} for ${source.name}`);
                continue;
            }

            const data = await response.json();

            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                console.log(`No items in feed for ${source.name}`);
                continue;
            }

            console.log(`Successfully fetched ${data.items.length} items from ${source.name}`);

            // Get first 3 items
            const newsHtml = data.items.slice(0, 3).map(item => {
                const title = item.title || 'No title';
                const link = item.link || '#';
                let formattedDate = 'Recent';

                if (item.pubDate) {
                    try {
                        const pubDate = new Date(item.pubDate);
                        formattedDate = pubDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    } catch (e) {
                        console.log('Date parsing error:', e);
                    }
                }

                return `
                    <div class="news-item">
                        <a href="${link}" target="_blank">
                            <h3>${title}</h3>
                            <div class="news-source">${source.name} - ${formattedDate}</div>
                        </a>
                    </div>
                `;
            }).join('');

            document.getElementById('news-content').innerHTML = `
                <div class="news-list">
                    ${newsHtml}
                </div>
            `;

            console.log(`Successfully displayed news from ${source.name}`);
            return; // Success! Exit the function

        } catch (error) {
            console.error(`Error with ${source.name}:`, error);
            continue; // Try next source
        }
    }

    // If we get here, all sources failed
    console.error('All news sources failed');
    document.getElementById('news-content').innerHTML =
        `<div class="error">Unable to fetch news. Please check your internet connection or try again later.</div>`;
}

// Load stock and news data
getStockData();
getNews();

// Refresh stock data every 5 minutes
setInterval(getStockData, 5 * 60 * 1000);

// Refresh news every 15 minutes
setInterval(getNews, 15 * 60 * 1000);

// MCP Client Configuration
const MCP_BACKEND_URL = 'http://localhost:3001';

// MCP Modal Management
let currentTools = [];
let selectedTool = null;

const modal = document.getElementById('mcp-modal');
const closeBtn = document.querySelector('.close');
const toolsList = document.getElementById('mcp-tools-list');
const toolForm = document.getElementById('mcp-tool-form');
const resultContainer = document.getElementById('mcp-result');

// Open modal and load tools
async function openMCPModal() {
    modal.classList.add('show');
    modal.style.display = 'flex';

    // Reset views
    toolsList.style.display = 'grid';
    toolForm.style.display = 'none';
    resultContainer.style.display = 'none';

    try {
        // Check backend health
        const healthResponse = await fetch(`${MCP_BACKEND_URL}/api/health`);
        if (!healthResponse.ok) {
            throw new Error('MCP backend is not running. Start it with: npm run mcp');
        }

        // Load tools
        const toolsResponse = await fetch(`${MCP_BACKEND_URL}/api/mcp/tools`);
        const toolsData = await toolsResponse.json();

        if (!toolsData.success) {
            throw new Error(toolsData.error || 'Failed to fetch tools');
        }

        currentTools = toolsData.tools;
        displayToolsList(currentTools);

    } catch (error) {
        console.error('MCP Client error:', error);
        toolsList.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Display tools in grid
function displayToolsList(tools) {
    if (!tools || tools.length === 0) {
        toolsList.innerHTML = '<div class="error">No tools available</div>';
        return;
    }

    toolsList.innerHTML = tools.map(tool => `
        <div class="tool-card" data-tool-name="${tool.name}">
            <h4>${tool.title || tool.name}</h4>
            <p>${truncateText(tool.description || 'No description', 80)}</p>
        </div>
    `).join('');

    // Add click handlers to tool cards
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const toolName = card.dataset.toolName;
            const tool = currentTools.find(t => t.name === toolName);
            if (tool) showToolForm(tool);
        });
    });
}

// Show form for selected tool
function showToolForm(tool) {
    selectedTool = tool;
    toolsList.style.display = 'none';
    toolForm.style.display = 'block';

    document.getElementById('tool-name').textContent = tool.title || tool.name;
    document.getElementById('tool-description').textContent = tool.description || '';

    const inputsContainer = document.getElementById('tool-inputs');
    const schema = tool.inputSchema;

    if (!schema || !schema.properties || Object.keys(schema.properties).length === 0) {
        inputsContainer.innerHTML = '<p>This tool requires no parameters.</p>';
        return;
    }

    // Generate form inputs based on schema
    inputsContainer.innerHTML = Object.entries(schema.properties).map(([key, prop]) => {
        const required = schema.required && schema.required.includes(key);
        const isArray = prop.type === 'array';

        return `
            <div class="form-group">
                <label for="input-${key}">
                    ${key} ${required ? '<span style="color: red;">*</span>' : ''}
                </label>
                ${isArray ?
                    `<textarea id="input-${key}" placeholder="${prop.description || ''}" ${required ? 'required' : ''}></textarea>
                    <small>Enter one value per line for array input</small>` :
                    `<input type="text" id="input-${key}" placeholder="${prop.description || ''}" ${required ? 'required' : ''}>`
                }
                ${prop.description ? `<small>${prop.description}</small>` : ''}
            </div>
        `;
    }).join('');
}

// Execute selected tool
async function executeTool() {
    if (!selectedTool) return;

    const executeBtn = document.getElementById('execute-tool-btn');
    executeBtn.disabled = true;
    executeBtn.textContent = 'Executing...';

    try {
        const schema = selectedTool.inputSchema;
        const toolArgs = {};

        // Collect form values
        if (schema && schema.properties) {
            for (const [key, prop] of Object.entries(schema.properties)) {
                const input = document.getElementById(`input-${key}`);
                if (input && input.value) {
                    if (prop.type === 'array') {
                        // Split textarea by lines for array input
                        toolArgs[key] = input.value.split('\n').filter(line => line.trim());
                    } else if (prop.type === 'number') {
                        toolArgs[key] = Number(input.value);
                    } else if (prop.type === 'boolean') {
                        toolArgs[key] = input.value === 'true';
                    } else {
                        toolArgs[key] = input.value;
                    }
                }
            }
        }

        // Call the tool
        const response = await fetch(`${MCP_BACKEND_URL}/api/mcp/call-tool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toolName: selectedTool.name,
                arguments: toolArgs
            })
        });

        const result = await response.json();

        if (result.success) {
            showResult(result.result);
        } else {
            showResult({ error: result.error }, true);
        }

    } catch (error) {
        showResult({ error: error.message }, true);
    } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Execute Tool';
    }
}

// Display result
function showResult(result, isError = false) {
    toolForm.style.display = 'none';
    resultContainer.style.display = 'block';

    const resultContent = document.getElementById('result-content');

    if (isError) {
        resultContent.innerHTML = `<span style="color: #c0392b;">${JSON.stringify(result, null, 2)}</span>`;
    } else {
        // Format the result nicely
        let displayText = '';

        if (result.content && Array.isArray(result.content)) {
            displayText = result.content.map(item => item.text || JSON.stringify(item, null, 2)).join('\n\n');
        } else if (result.structuredContent && result.structuredContent.content) {
            displayText = result.structuredContent.content;
        } else {
            displayText = JSON.stringify(result, null, 2);
        }

        resultContent.textContent = displayText;
    }
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Back to list handlers
document.getElementById('back-to-list-btn').addEventListener('click', () => {
    toolForm.style.display = 'none';
    resultContainer.style.display = 'none';
    toolsList.style.display = 'grid';
    selectedTool = null;
});

document.getElementById('back-to-list-from-result-btn').addEventListener('click', () => {
    toolForm.style.display = 'none';
    resultContainer.style.display = 'none';
    toolsList.style.display = 'grid';
    selectedTool = null;
});

// Execute tool button
document.getElementById('execute-tool-btn').addEventListener('click', executeTool);

// Close modal handlers
closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
});

// AI Agent Button Handler - Open MCP Modal
document.getElementById('ai-agent-btn').addEventListener('click', openMCPModal);
