#!/usr/bin/env node

// Frontend Debug Script for Port 5174 Blank Screen Issue
// Generated: 2025-08-22

const fs = require('fs');
const path = require('path');

console.log('🔍 Frontend Debug Analysis - Port 5174');
console.log('=====================================');

// Check package.json
const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ Package.json found:', packageJson.name);
    console.log('   Dependencies:', Object.keys(packageJson.dependencies || {}).slice(0, 5).join(', '));
} else {
    console.log('❌ Package.json not found');
}

// Check main.tsx
const mainTsxPath = path.join(__dirname, 'frontend', 'src', 'main.tsx');
if (fs.existsSync(mainTsxPath)) {
    const mainTsx = fs.readFileSync(mainTsxPath, 'utf8');
    console.log('✅ main.tsx found');
    console.log('   Contains React:', mainTsx.includes('React') ? '✅' : '❌');
    console.log('   Contains createRoot:', mainTsx.includes('createRoot') ? '✅' : '❌');
    console.log('   Contains App:', mainTsx.includes('App') ? '✅' : '❌');
} else {
    console.log('❌ main.tsx not found');
}

// Check App.tsx
const appTsxPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
if (fs.existsSync(appTsxPath)) {
    const appTsx = fs.readFileSync(appTsxPath, 'utf8');
    console.log('✅ App.tsx found');
    console.log('   Contains export default:', appTsx.includes('export default') ? '✅' : '❌');
    console.log('   Contains return:', appTsx.includes('return') ? '✅' : '❌');
} else {
    console.log('❌ App.tsx not found');
}

// Check environment variables
const envPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file found');
    console.log('   Variables count:', envContent.split('\n').filter(line => line.includes('=')).length);
} else {
    console.log('⚠️  .env file not found (may be using defaults)');
}

console.log('\n🎯 Recommendations:');
console.log('1. Check browser console at http://localhost:5174/');
console.log('2. Open Network tab to see failed requests');
console.log('3. Check if API calls to localhost:8080 are working');
console.log('4. Verify Clerk environment variables if authentication is required');

console.log('\n✅ Debug analysis complete!');