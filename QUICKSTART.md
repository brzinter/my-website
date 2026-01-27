# Quick Start Guide

## Essential Commands

### Development
```bash
npm start               # Start development server (alias for npm run dev)
npm run dev             # Start development server from src/
```
→ Opens at `http://localhost:8000`

### Production
```bash
npm run build           # Build for production (creates dist/)
npm run serve:dist      # Preview production build
```

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Maintenance
```bash
npm run clean           # Clean dist/ and coverage/
npm install             # Install dependencies (first time)
```

## File Locations

| What | Where |
|------|-------|
| Edit HTML | `src/index.html` |
| Edit CSS | `src/css/styles.css` |
| Edit JavaScript | `src/js/main.js` |
| Add images | `src/assets/` |
| View build output | `dist/` |
| Tests | `tests/` |
| Build scripts | `scripts/` |

## Development Workflow

### 1. Start Development
```bash
cd /Users/jason.wang/claude_project/my-website
npm start
```

### 2. Make Changes
Edit files in `src/` directory

### 3. Test Changes
Browser auto-refreshes at `http://localhost:8000`

### 4. Run Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production
```bash
npm run serve:dist
```

## Common Tasks

### Change Stock Symbol
Edit `src/js/main.js` line 150:
```javascript
const symbol = 'AAPL';  // Change to your preferred stock
```

### Change Greeting
Edit `src/index.html` line 11:
```html
<h1 id="greeting">Hello Your Name</h1>
```

### Add Dark Mode
1. Edit `src/css/styles.css` - add CSS custom properties
2. Add toggle button in `src/index.html`
3. Add toggle logic in `src/js/main.js`

### Add New Widget
1. Create HTML in `src/index.html`
2. Add styles in `src/css/styles.css`
3. Add logic in `src/js/main.js`
4. Write tests in `tests/yourwidget.test.js`

## Troubleshooting

### Port 8000 already in use?
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
cd src && python3 -m http.server 8001
```

### Changes not appearing?
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check you're editing `src/` not `dist/`
3. Restart dev server

### Tests failing?
```bash
npm run test:watch
# Leave running, tests auto-run on changes
```

### Build errors?
```bash
npm run clean
npm run build
```

## File Structure Quick Reference

```
✏️  EDIT THESE:          ❌ DON'T EDIT:
src/                    dist/         (generated)
tests/                  node_modules/ (installed)
scripts/                coverage/     (generated)
config/
package.json
README.md
```

## Documentation

- [README.md](README.md) - Full project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture and future plans
- [MIGRATION.md](MIGRATION.md) - What changed and why
- [src/README.md](src/README.md) - Source directory guide
- [tests/README.md](tests/README.md) - Testing guide

## Git Workflow

```bash
# Stage changes
git add src/ tests/ package.json

# Commit
git commit -m "Add new feature"

# Push
git push origin main
```

Note: `dist/` is gitignored (it's generated)

## Production Deployment

### GitHub Pages
```bash
npm run build
git add dist/ -f  # Force add dist
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Netlify/Vercel
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## Need Help?

1. Check [README.md](README.md) for detailed docs
2. Check [MIGRATION.md](MIGRATION.md) for what changed
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) for future plans
4. Run tests: `npm test`
5. Check console for errors: Press `F12` in browser

## URLs

- Development: `http://localhost:8000`
- Production preview: `http://localhost:8000` (after `npm run serve:dist`)
- Tests: Run `npm test` in terminal
- Coverage report: `open coverage/lcov-report/index.html` (after `npm run test:coverage`)
