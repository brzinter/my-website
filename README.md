# Personal Dashboard

A modern, responsive personal dashboard that displays real-time information including the current time, weather, stock prices, and news headlines.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

### 🕐 Real-Time Clock
- Live updating clock with hours, minutes, and seconds
- Full date display with day of the week
- Updates every second

### 🌤️ Weather Widget
- Displays current temperature, weather conditions, humidity, and wind speed
- Automatically detects your location using GPS
- Falls back to IP-based geolocation if GPS is unavailable
- Uses Fahrenheit for temperature and mph for wind speed
- Shows "feels like" temperature

### 📈 Stock Tracker
- Real-time stock price for ServiceNow (NOW)
- Shows price change and percentage change with color indicators (green/red)
- Displays opening price, high, low, and previous close
- Automatically refreshes every 5 minutes
- Multi-proxy fallback system for reliability

### 📰 News Headlines
- Top 3 headlines from BBC News
- Clickable links to full articles
- Shows publication date
- Automatically refreshes every 15 minutes

## Project Structure

```
my-website/
├── src/                    # Source code (development)
│   ├── index.html          # Main HTML structure
│   ├── css/
│   │   └── styles.css      # All styling and responsive design
│   ├── js/
│   │   └── main.js         # All JavaScript functionality
│   ├── assets/             # Static assets (images, fonts, etc.)
│   └── README.md           # Source directory documentation
├── dist/                   # Production build (generated)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── tests/                  # Test suite
│   ├── setup.js
│   ├── time.test.js
│   ├── weather.test.js
│   ├── stock.test.js
│   ├── news.test.js
│   └── README.md
├── scripts/                # Build and utility scripts
│   └── build.js            # Production build script
├── config/                 # Configuration files
│   └── environment.js      # Environment settings
├── package.json            # NPM configuration
├── jest.config.js          # Jest testing configuration
└── README.md               # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid layouts
- **Vanilla JavaScript**: No frameworks or dependencies
- **APIs**:
  - [Open-Meteo API](https://open-meteo.com/) - Weather data (free, no API key required)
  - [ipapi.co](https://ipapi.co/) - IP-based geolocation (free)
  - [Yahoo Finance API](https://finance.yahoo.com/) - Stock data (via CORS proxies)
  - [BBC News RSS](https://feeds.bbci.co.uk/news/rss.xml) - News headlines

## How to Run

### Prerequisites
- **Node.js** (v14 or higher) and npm installed
- **Python 3.x** installed on your system

### Quick Start

1. **Navigate to the project directory**:
   ```bash
   cd /Users/jason.wang/claude_project/my-website
   ```

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   # or
   npm run dev
   ```
   This serves the application from `src/` at `http://localhost:8000`

4. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

5. **Grant location permission** (optional but recommended):
   - When prompted by your browser, click "Allow" to enable GPS-based weather
   - If you deny, the dashboard will use IP-based location instead

### Production Build

To create an optimized production build:

```bash
npm run build
```

This creates a `dist/` directory with production-ready files.

To preview the production build:

```bash
npm run serve:dist
```

### Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

### Available Scripts

- `npm start` or `npm run dev` - Start development server (serves from `src/`)
- `npm run build` - Build for production (creates `dist/`)
- `npm run serve:dist` - Preview production build (serves from `dist/`)
- `npm run clean` - Clean build artifacts and coverage reports
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Browser Compatibility

This dashboard works best on modern browsers that support:
- ES6+ JavaScript features (async/await, fetch API, arrow functions)
- CSS Grid and Flexbox
- Geolocation API
- AbortSignal.timeout (for request timeouts)

**Recommended Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Customization

All source files are located in the [src/](src/) directory. After making changes, rebuild for production using `npm run build`.

### Change the Stock Symbol
Edit [src/js/main.js](src/js/main.js) line 150:
```javascript
const symbol = 'NOW';  // Change to any stock symbol (e.g., 'AAPL', 'GOOGL')
```

### Change Your Name
Edit [src/index.html](src/index.html) line 11:
```html
<h1 id="greeting">Hello Jason</h1>  <!-- Change "Jason" to your name -->
```

### Change the Background Color
Edit [src/css/styles.css](src/css/styles.css) line 8:
```css
background: lightgreen;  /* Change to any color */
```

### Adjust Refresh Intervals
Edit [src/js/main.js](src/js/main.js) lines 289-292:
```javascript
// Refresh stock data (default: 5 minutes)
setInterval(getStockData, 5 * 60 * 1000);

// Refresh news (default: 15 minutes)
setInterval(getNews, 15 * 60 * 1000);
```

### Add Environment Variables
Edit [config/environment.js](config/environment.js) to customize settings:
```javascript
development: {
  API_TIMEOUT: 8000,
  REFRESH_INTERVALS: {
    stock: 5 * 60 * 1000,  // 5 minutes
    news: 15 * 60 * 1000,   // 15 minutes
  },
  DEBUG: true
}
```

## Known Issues & Limitations

### Stock Data
- Free CORS proxy services can be unreliable or rate-limited
- The dashboard tries multiple proxies (allorigins.win, corsproxy.io, codetabs.com)
- If all proxies fail, you'll see an error message
- Stock data may be delayed by 15-20 minutes (not real-time)

### Weather Data
- Requires browser location permission for GPS-based weather
- IP-based location is less accurate (city-level)
- Some browsers block geolocation on non-HTTPS sites

### News Headlines
- Limited to 3 headlines from BBC News RSS feed
- RSS feed may occasionally be unavailable
- Multi-proxy fallback system for reliability

## Testing

This project includes a comprehensive test suite using Jest.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **37 tests** covering all major functionality
- Time and date display (5 tests)
- Weather API and geolocation (9 tests)
- Stock data and multi-proxy fallback (10 tests)
- News RSS feed parsing (13 tests)

See [tests/README.md](tests/README.md) for detailed testing documentation.

## Troubleshooting

### "Unable to fetch stock data"
- **Cause**: Proxy services are down or rate-limited
- **Solution**: Wait a few minutes and refresh the page, or try a different network

### "Unable to determine location"
- **Cause**: Location services denied or unavailable
- **Solution**: Grant location permission in browser settings, or allow IP-based location

### Page won't load
- **Cause**: Server not running or wrong port
- **Solution**: Ensure Python server is running on port 8000

### Styles not loading
- **Cause**: Relative paths or server directory issue
- **Solution**: Ensure server is started from the project root directory

## Future Enhancements

Potential features to add:
- [ ] Multiple timezone clocks
- [ ] Calendar integration
- [ ] Customizable widget layout (drag & drop)
- [ ] Dark mode toggle
- [ ] Multiple stock tickers
- [ ] Weather forecast (3-5 days)
- [ ] Cryptocurrency prices
- [ ] To-do list integration
- [ ] Custom news sources

## License

This project is open source and available for personal use.

## Author

**Jason Wang**

---

*Built with ❤️ using vanilla HTML, CSS, and JavaScript*
