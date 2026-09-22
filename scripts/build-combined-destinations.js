const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get HEAD destinations-data.ts (Core 22)
const headData = execSync('git show HEAD:src/lib/db/destinations-data.ts', { maxBuffer: 10 * 1024 * 1024 }).toString();

const declSearch = 'export const RESEARCHED_DESTINATIONS';
const arrayDeclIdx = headData.indexOf(declSearch);
if (arrayDeclIdx === -1) {
  throw new Error('Could not find array declaration in HEAD');
}

const headOpenBracketIdx = headData.indexOf('[', arrayDeclIdx);
const headLastBracketIdx = headData.lastIndexOf('];');
const core22Content = headData.slice(headOpenBracketIdx + 1, headLastBracketIdx).trim();

// 2. Get the 31 expansion destinations from current file
const currentFile = fs.readFileSync('src/lib/db/destinations-data.ts', 'utf8');
const expArrayDeclIdx = currentFile.indexOf(declSearch);
const expOpenBracketIdx = currentFile.indexOf('[', expArrayDeclIdx);
const expLastBracketIdx = currentFile.lastIndexOf('];');
const exp31Content = currentFile.slice(expOpenBracketIdx + 1, expLastBracketIdx).trim();

// Parse verified intake results
const verifiedResults = JSON.parse(fs.readFileSync('scripts/verified-intake-results.json', 'utf8'));

const preamble = headData.slice(0, headOpenBracketIdx + 1);

// Construct full file
let fullFile = `${preamble}\n`;
fullFile += `  // =========================================================================\n`;
fullFile += `  // 22 CORE PUBLISHED DESTINATIONS\n`;
fullFile += `  // =========================================================================\n\n`;
fullFile += core22Content;
fullFile += `,\n\n  // =========================================================================\n`;
fullFile += `  // 31 EXPANSION CANDIDATE DESTINATIONS\n`;
fullFile += `  // =========================================================================\n\n`;
fullFile += exp31Content;
fullFile += `\n];\n\n`;
fullFile += `export const RESEARCHED_22_DESTINATIONS = RESEARCHED_DESTINATIONS.slice(0, 22);\n`;
fullFile += `export const EXPANSION_30_DESTINATIONS = RESEARCHED_DESTINATIONS.slice(22);\n`;
fullFile += `/** @deprecated Use RESEARCHED_22_DESTINATIONS instead. Kept for backward compatibility. */\n`;
fullFile += `export const RESEARCHED_20_DESTINATIONS = RESEARCHED_22_DESTINATIONS;\n`;

// Now apply verified images for the 17 destinations
for (const slug of Object.keys(verifiedResults)) {
  const images = verifiedResults[slug];
  const imagesFormatted = JSON.stringify(images, null, 6)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '    ' + line))
    .join('\n');

  let slugSearch = `slug: '${slug}',`;
  let slugIdx = fullFile.indexOf(slugSearch);
  if (slugIdx === -1) {
    slugSearch = `"slug": "${slug}",`;
    slugIdx = fullFile.indexOf(slugSearch);
  }

  if (slugIdx === -1) {
    console.error(`Could not find slug ${slug} in fullFile!`);
    continue;
  }

  // Find "images": [ after slugIdx
  let imagesKeyIdx = fullFile.indexOf('images: [', slugIdx);
  if (imagesKeyIdx === -1) {
    imagesKeyIdx = fullFile.indexOf('"images": [', slugIdx);
  }

  if (imagesKeyIdx === -1) {
    console.error(`Could not find images array for slug ${slug}`);
    continue;
  }

  const startBracketIdx = fullFile.indexOf('[', imagesKeyIdx);
  let depth = 0;
  let endBracketIdx = -1;
  for (let i = startBracketIdx; i < fullFile.length; i++) {
    if (fullFile[i] === '[') depth++;
    else if (fullFile[i] === ']') {
      depth--;
      if (depth === 0) {
        endBracketIdx = i;
        break;
      }
    }
  }

  const before = fullFile.slice(0, imagesKeyIdx);
  const after = fullFile.slice(endBracketIdx + 1);
  const imagesKey = fullFile.slice(imagesKeyIdx, startBracketIdx).trim();

  fullFile = `${before}${imagesKey} ${imagesFormatted}${after}`;
  console.log(`Replaced images for ${slug} with verified records.`);
}

// Ensure Harmandir Sahib coordinates precision
fullFile = fullFile.replace(/latitude:\s*31\.62,/g, 'latitude: 31.61998,');
fullFile = fullFile.replace(/"latitude":\s*31\.62,/g, '"latitude": 31.61998,');

fs.writeFileSync('src/lib/db/destinations-data.ts', fullFile, 'utf8');
console.log('Successfully wrote combined destinations-data.ts with verified photography!');
