const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const requiredPaths = [
  'index.html',
  'profile.html',
  'script.js',
  'style.css',
  'package.json',
  'vercel.json',
  '.env.example',
  'api/security-utils.js',
  'api/create-checkout-session.js',
  'api/stripe-webhook.js',
  'api/support.js',
  'api/support-admin.js',
  'supabase-schema.sql',
];

const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));

if (missing.length) {
  console.error('Missing required project files:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log(`OK required files present (${requiredPaths.length})`);
