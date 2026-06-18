const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const attributePattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const ignoredSchemes = /^(?:https?:|mailto:|tel:|data:|blob:|javascript:|about:|\/\/)/i;
const missing = [];

function stripUrl(value) {
  return value.split('#')[0].split('?')[0].trim();
}

function candidatePaths(rawValue, sourceFile) {
  const cleanValue = stripUrl(rawValue);
  if (!cleanValue || cleanValue.startsWith('#') || ignoredSchemes.test(cleanValue)) return [];

  const withoutLeadingSlash = cleanValue.startsWith('/') ? cleanValue.slice(1) : cleanValue;
  const relativeToRoot = path.normalize(withoutLeadingSlash);
  const relativeToSource = path.normalize(path.join(path.dirname(sourceFile), cleanValue));
  const candidates = new Set([relativeToRoot, relativeToSource]);

  if (!path.extname(relativeToRoot)) candidates.add(`${relativeToRoot}.html`);
  if (!path.extname(relativeToSource)) candidates.add(`${relativeToSource}.html`);

  return [...candidates].filter((candidate) => !candidate.startsWith('..'));
}

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(path.join(root, htmlFile), 'utf8');
  for (const match of content.matchAll(attributePattern)) {
    const rawValue = match[1];
    const candidates = candidatePaths(rawValue, htmlFile);
    if (!candidates.length) continue;

    const exists = candidates.some((candidate) => fs.existsSync(path.join(root, candidate)));
    if (!exists) missing.push(`${htmlFile}: ${rawValue}`);
  }
}

if (missing.length) {
  console.error('Missing local href/src targets:');
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`OK local links/assets in ${htmlFiles.length} HTML files`);
