# Architecture Guide

This document explains the architecture of the Personal Dashboard project and provides guidance for future enhancements.

## Directory Structure Philosophy

The project follows a **source-build separation** pattern:

- **`src/`** - Development source code (edit here)
- **`dist/`** - Production build artifacts (generated, don't edit)
- **`tests/`** - Test suites
- **`scripts/`** - Build and automation scripts
- **`config/`** - Configuration files

## Current Architecture

### Monolithic Structure (Current)

```
src/
├── index.html           # Single HTML file
├── css/
│   └── styles.css       # All styles in one file
└── js/
    └── main.js          # All JavaScript in one file (330+ lines)
```

**Pros:**
- Simple, easy to understand
- No build complexity
- Direct browser loading

**Cons:**
- `main.js` is becoming large (330+ lines)
- Difficult to test individual functions
- No code reusability
- Hard to maintain as features grow

## Recommended Future Architecture

### Modular Structure

For better scalability, consider refactoring to:

```
src/
├── index.html
├── css/
│   ├── base.css          # Reset, variables, base styles
│   ├── components.css    # Reusable component styles
│   ├── layout.css        # Grid, flexbox layouts
│   └── theme.css         # Color schemes, theming
├── js/
│   ├── main.js           # Entry point, initialization
│   ├── services/         # API interaction layer
│   │   ├── weatherService.js
│   │   ├── stockService.js
│   │   └── newsService.js
│   ├── components/       # UI components
│   │   ├── clock.js
│   │   ├── weather.js
│   │   ├── stock.js
│   │   └── news.js
│   ├── utils/            # Helper functions
│   │   ├── api.js        # Fetch wrappers, retry logic
│   │   ├── dom.js        # DOM manipulation helpers
│   │   └── format.js     # Date, number formatting
│   └── config.js         # Client-side configuration
└── assets/
    ├── images/
    ├── fonts/
    └── icons/
```

## Migration Path

### Phase 1: Extract Services (Recommended First Step)

Create separate service files for each API:

**src/js/services/weatherService.js**
```javascript
export async function fetchWeatherData(lat, lon) {
  // Move weather fetching logic here
}

export async function getWeatherFromIP() {
  // Move IP-based weather logic here
}
```

**src/js/services/stockService.js**
```javascript
export async function getStockData(symbol) {
  // Move stock fetching logic here
}
```

**src/js/services/newsService.js**
```javascript
export async function getNews() {
  // Move news fetching logic here
}
```

Update `main.js` to import and use these services:
```javascript
import { fetchWeatherData, getWeatherFromIP } from './services/weatherService.js';
import { getStockData } from './services/stockService.js';
import { getNews } from './services/newsService.js';
```

### Phase 2: Extract Components

Create UI component files:

**src/js/components/clock.js**
```javascript
export function initializeClock() {
  updateTime();
  setInterval(updateTime, 1000);
}

function updateTime() {
  // Clock logic here
}
```

### Phase 3: Extract Utilities

**src/js/utils/api.js**
```javascript
export async function fetchWithRetry(urls, options = {}) {
  // Multi-proxy fetch logic here
}
```

**src/js/utils/format.js**
```javascript
export function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

export function formatPercentage(value) {
  return `${value.toFixed(2)}%`;
}
```

## Build System Evolution

### Current Build System

Simple file copying from `src/` to `dist/`:

```javascript
// scripts/build.js
fs.copyFileSync('src/index.html', 'dist/index.html');
```

### Future Build System Options

#### Option 1: Webpack

For a full-featured build system with module bundling:

```bash
npm install --save-dev webpack webpack-cli
```

Benefits:
- Module bundling
- Code splitting
- Tree shaking
- Hot module replacement

#### Option 2: Vite

For modern, fast development:

```bash
npm install --save-dev vite
```

Benefits:
- Instant server start
- Lightning-fast HMR
- Optimized builds
- Native ES modules

#### Option 3: Rollup

For library-focused builds:

```bash
npm install --save-dev rollup
```

Benefits:
- Smaller bundle sizes
- Better tree shaking
- ES module output

## Testing Strategy

### Current Testing

Unit tests for logic verification:
- Mock fetch API
- Test data transformations
- Test error handling

### Future Testing Additions

1. **Integration Tests**
   ```bash
   npm install --save-dev cypress
   ```
   - Test full user flows
   - Test API integrations
   - Visual regression testing

2. **Component Tests**
   - Test individual UI components
   - Test user interactions
   - Test accessibility

3. **E2E Tests**
   - Test in real browsers
   - Test cross-browser compatibility

## Feature Enhancement Ideas

### Short-term (Easy Wins)

1. **Dark Mode**
   - Add CSS custom properties
   - Toggle between themes
   - Persist user preference

2. **Widget Configuration**
   - Allow users to show/hide widgets
   - Save preferences in localStorage

3. **Additional Stock Tickers**
   - Support multiple stock symbols
   - User-configurable watchlist

### Medium-term (Moderate Effort)

1. **Progressive Web App (PWA)**
   - Add service worker
   - Enable offline support
   - Add install prompt

2. **Data Visualization**
   - Stock price charts
   - Weather forecast graphs
   - Historical trends

3. **User Settings Panel**
   - Configure refresh intervals
   - Choose temperature units
   - Select news sources

### Long-term (Major Features)

1. **Backend Integration**
   - Node.js/Express backend
   - User authentication
   - Personal data storage

2. **Widget Marketplace**
   - Plugin architecture
   - Community widgets
   - Widget store

3. **Multi-Dashboard Support**
   - Create multiple dashboards
   - Share dashboards
   - Templates

## Performance Considerations

### Current Performance

- No bundling (multiple HTTP requests)
- No minification
- No code splitting

### Optimization Recommendations

1. **Lazy Loading**
   ```javascript
   // Load news widget only when visible
   const newsObserver = new IntersectionObserver(entries => {
     if (entries[0].isIntersecting) {
       loadNewsWidget();
     }
   });
   ```

2. **Code Splitting**
   - Split by route
   - Split by widget
   - Dynamic imports

3. **Caching Strategy**
   - Cache API responses
   - Service worker caching
   - CDN for static assets

## Security Considerations

### Current Security

- Client-side only (no secrets)
- Public APIs only
- CORS proxies for restricted APIs

### Security Enhancements

1. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self'">
   ```

2. **Subresource Integrity (SRI)**
   ```html
   <script src="main.js"
           integrity="sha384-..."
           crossorigin="anonymous"></script>
   ```

3. **Backend API Key Management**
   - Move API keys to backend
   - Implement rate limiting
   - Add authentication

## Deployment Options

### Current Deployment

Static file hosting:
- GitHub Pages
- Netlify
- Vercel
- AWS S3

### Future Deployment with Backend

Full-stack hosting:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

## Contributing Guidelines

When adding new features:

1. **Code Organization**
   - Keep functions small (<50 lines)
   - One responsibility per function
   - Descriptive naming

2. **Testing**
   - Write tests for new features
   - Maintain >80% coverage
   - Test edge cases

3. **Documentation**
   - Update README.md
   - Add JSDoc comments
   - Update this ARCHITECTURE.md

4. **Build Process**
   - Ensure `npm run build` works
   - Test production build
   - Verify all paths correct

## Questions?

For architecture questions or suggestions, please:
1. Check existing documentation
2. Open a GitHub discussion
3. Create an issue with the "architecture" label
