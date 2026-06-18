const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = ['package.json', 'package-lock.json', 'vercel.json'];

let failed = false;

for (const file of files) {
  const absolutePath = path.join(root, file);
  try {
    JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    console.log(`OK ${file}`);
  } catch (error) {
    failed = true;
    console.error(`Invalid JSON in ${file}: ${error.message}`);
  }
}

if (failed) process.exit(1);
