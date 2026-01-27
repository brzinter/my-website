#!/usr/bin/env node

/**
 * Build script for production
 * Copies files from src/ to dist/ with optional minification
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// Create dist directory structure
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'js'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });

// Copy files
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`✓ Copied: ${path.relative(process.cwd(), dest)}`);
}

console.log('🔨 Building project...\n');

// Copy HTML
copyFile(
  path.join(srcDir, 'index.html'),
  path.join(distDir, 'index.html')
);

// Copy CSS
copyFile(
  path.join(srcDir, 'css', 'styles.css'),
  path.join(distDir, 'css', 'styles.css')
);

// Copy JS
copyFile(
  path.join(srcDir, 'js', 'main.js'),
  path.join(distDir, 'js', 'main.js')
);

// Copy assets if they exist
const assetsDir = path.join(srcDir, 'assets');
if (fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length > 0) {
  const files = fs.readdirSync(assetsDir);
  files.forEach(file => {
    copyFile(
      path.join(assetsDir, file),
      path.join(distDir, 'assets', file)
    );
  });
}

console.log('\n✅ Build complete! Files are in dist/');
console.log('💡 Run "npm run serve:dist" to preview the production build\n');
