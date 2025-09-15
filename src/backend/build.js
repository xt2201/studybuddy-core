#!/usr/bin/env node

// Build script for Vercel deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname));
  
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🗄️ Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('🔨 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}