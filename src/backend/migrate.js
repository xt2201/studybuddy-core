#!/usr/bin/env node

// Migration script for production
const { execSync } = require('child_process');

console.log('🚀 Running database migration...');

try {
  console.log('📊 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('🌱 Running database seed...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('💡 Make sure DATABASE_URL is set correctly and database is accessible.');
  process.exit(1);
}