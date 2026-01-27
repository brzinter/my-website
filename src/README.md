# Source Directory

This directory contains all source code for the Personal Dashboard application.

## Structure

```
src/
├── index.html          # Main HTML file
├── css/                # Stylesheets
│   └── styles.css      # Main styles
├── js/                 # JavaScript modules
│   └── main.js         # Main application logic
└── assets/             # Static assets (images, fonts, etc.)
```

## Development

When developing, the server runs from this directory:

```bash
npm run dev
# or
npm start
```

This serves the files directly from `src/` at `http://localhost:8000`.

## Production Build

For production, run the build script which copies optimized files to `dist/`:

```bash
npm run build
```

## Adding New Files

### Adding JavaScript Modules

Place new JavaScript files in `src/js/`:
- `src/js/weather.js` - Weather-specific logic
- `src/js/stock.js` - Stock-specific logic
- `src/js/news.js` - News-specific logic
- `src/js/utils.js` - Utility functions

Update `main.js` to import them:
```javascript
import { fetchWeather } from './weather.js';
```

### Adding CSS Modules

Place new CSS files in `src/css/`:
- `src/css/components.css` - Component-specific styles
- `src/css/theme.css` - Theme variables
- `src/css/responsive.css` - Responsive breakpoints

Import them in `styles.css`:
```css
@import 'theme.css';
@import 'components.css';
```

### Adding Assets

Place static files in `src/assets/`:
- Images: `src/assets/logo.png`
- Fonts: `src/assets/fonts/`
- Icons: `src/assets/icons/`

Reference in HTML:
```html
<img src="assets/logo.png" alt="Logo">
```

## Code Organization

For better maintainability, consider splitting `main.js` into:

```
src/js/
├── main.js              # Entry point, initialization
├── services/
│   ├── weatherService.js
│   ├── stockService.js
│   └── newsService.js
├── components/
│   ├── clock.js
│   ├── weather.js
│   ├── stock.js
│   └── news.js
└── utils/
    ├── api.js           # API utilities
    ├── dom.js           # DOM utilities
    └── format.js        # Formatting utilities
```
