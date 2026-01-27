# Migration Guide

This document explains what changed in the project restructure and how to work with the new structure.

## What Changed?

The project has been restructured from a flat structure to a more scalable source-build pattern.

### Before (Old Structure)

```
my-website/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── main.js
```

### After (New Structure)

```
my-website/
├── src/                  # Development files (edit here!)
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── assets/
├── dist/                 # Production build (generated)
├── scripts/              # Build scripts
├── config/               # Configuration
└── tests/                # Test suite
```

## Key Changes

### 1. Source Files Moved to `src/`

All source code is now in the `src/` directory:
- `index.html` → `src/index.html`
- `css/styles.css` → `src/css/styles.css`
- `js/main.js` → `src/js/main.js`

### 2. New Build Process

**Development:**
```bash
npm run dev
# Serves from src/ directory
```

**Production:**
```bash
npm run build
# Creates optimized files in dist/

npm run serve:dist
# Preview production build
```

### 3. Updated npm Scripts

| Old Command | New Command | What It Does |
|------------|-------------|--------------|
| `python3 -m http.server 8000` | `npm run dev` or `npm start` | Start dev server |
| N/A | `npm run build` | Build for production |
| N/A | `npm run serve:dist` | Preview production |
| `jest` | `npm test` | Run tests (unchanged) |

## Working with the New Structure

### Making Changes to Code

1. **Edit files in `src/`** directory:
   ```bash
   # Edit source files
   vim src/index.html
   vim src/css/styles.css
   vim src/js/main.js
   ```

2. **Test changes in development**:
   ```bash
   npm run dev
   # Open http://localhost:8000
   ```

3. **Build for production** (when ready):
   ```bash
   npm run build
   npm run serve:dist
   ```

### Adding New Files

**CSS:**
```bash
# Add new CSS file
echo '@import "theme.css";' >> src/css/styles.css
```

**JavaScript:**
```bash
# Create new JS module
touch src/js/utils.js
```

**Assets:**
```bash
# Add images, fonts, etc.
cp logo.png src/assets/
```

**Update HTML to reference:**
```html
<img src="assets/logo.png" alt="Logo">
```

## Configuration Files

### Environment Settings

Edit `config/environment.js` for environment-specific settings:

```javascript
development: {
  API_TIMEOUT: 8000,
  DEBUG: true
}
```

### Build Script

The build script `scripts/build.js` handles:
- Cleaning the `dist/` directory
- Copying files from `src/` to `dist/`
- (Future) Minification, bundling, etc.

## Testing

Tests remain unchanged and still work:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Test configuration (`jest.config.js`) was updated to look in `src/js/` for coverage.

## Git Workflow

The `.gitignore` is already configured to ignore:
- `dist/` (generated files)
- `node_modules/` (dependencies)
- `coverage/` (test reports)

Only commit source files in `src/`:

```bash
git add src/
git add tests/
git add package.json
git add README.md
git commit -m "Update feature"
```

## Troubleshooting

### Issue: Server not finding files

**Problem:** Files return 404 errors

**Solution:** Make sure you're running the correct command:
- Development: `npm run dev` (serves from `src/`)
- Production: `npm run serve:dist` (serves from `dist/`)

### Issue: Changes not appearing

**Problem:** Code changes don't show up

**Solution:**
1. Check you're editing files in `src/`, not `dist/`
2. Refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. For production builds, run `npm run build` again

### Issue: Tests failing

**Problem:** Tests can't find files

**Solution:** Tests are configured correctly. If failing:
1. Check `jest.config.js` has `src/js/**/*.js` in collectCoverageFrom
2. Test files should remain in `tests/` directory
3. Run `npm test -- --verbose` for details

### Issue: Build script errors

**Problem:** `npm run build` fails

**Solution:**
1. Ensure all source files exist in `src/`
2. Check file permissions: `ls -la src/`
3. Try cleaning first: `npm run clean && npm run build`

## Benefits of New Structure

### ✅ Scalability
- Easy to add new modules and components
- Clear separation of source and build artifacts
- Room for future build optimizations

### ✅ Best Practices
- Industry-standard project structure
- Clear development vs production workflow
- Better for team collaboration

### ✅ Future-Ready
- Easy to add bundlers (Webpack, Vite, Rollup)
- Ready for CSS preprocessors (Sass, PostCSS)
- Prepared for TypeScript migration
- Simple to add minification

### ✅ Deployment
- Clean production builds
- Only deploy `dist/` directory
- Smaller deployment footprint

## Next Steps

Now that the structure is updated, consider these enhancements:

1. **Split `main.js` into modules** (see [ARCHITECTURE.md](ARCHITECTURE.md))
2. **Add a bundler** (Webpack, Vite, or Rollup)
3. **Implement dark mode** (CSS custom properties)
4. **Add PWA support** (service worker, manifest)
5. **Create widget plugins** (modular architecture)

## Rollback (If Needed)

If you need to revert to the old structure:

```bash
# Copy files back to root
cp src/index.html ./
cp -r src/css ./
cp -r src/js ./

# Remove new directories
rm -rf src dist scripts config

# Revert package.json and jest.config.js
git checkout package.json jest.config.js
```

However, the new structure is recommended for long-term maintainability.

## Questions?

Refer to:
- [README.md](README.md) - General project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture decisions and future plans
- [src/README.md](src/README.md) - Source directory structure
- [tests/README.md](tests/README.md) - Testing documentation
