#!/usr/bin/env node
/**
 * Vercel Build Script
 * 1. Builds the Angular frontend
 * 2. Patches index.html with the real API URL from env vars
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

console.log('📦 Building Angular frontend...');
execSync('npm --prefix frontend install', { stdio: 'inherit' });
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

// Patch index.html with the real API URL
const distDir = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');
  html = html.replace(/__VITE_API_BASE_URL__/g, API_URL);
  fs.writeFileSync(indexPath, html);
  console.log(`✅ index.html patched with API URL: ${API_URL}`);
} else {
  console.error('❌ index.html not found at:', indexPath);
  process.exit(1);
}

console.log('🚀 Build complete!');
