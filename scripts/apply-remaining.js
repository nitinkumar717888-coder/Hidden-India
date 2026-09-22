const fs = require('fs');

const SLUG_MAP = {
  'agrasen-ki-baoli-new-delhi': 'agrasen-ki-baoli-delhi',
  'jaisalmer-fort-jaisalmer': 'jaisalmer-fort-rajasthan',
  'chittorgarh-fort-chittorgarh': 'chittorgarh-fort-rajasthan',
  'kumbhalgarh-fort-rajsamand': 'kumbhalgarh-fort-rajasthan',
  'kangra-fort-kangra': 'kangra-fort-himachal',
};

const verifiedResults = JSON.parse(fs.readFileSync('scripts/verified-intake-results.json', 'utf8'));
let fullFile = fs.readFileSync('src/lib/db/destinations-data.ts', 'utf8');

for (const origSlug of Object.keys(verifiedResults)) {
  const targetSlug = SLUG_MAP[origSlug] || origSlug;
  const images = verifiedResults[origSlug];
  const imagesFormatted = JSON.stringify(images, null, 6)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '    ' + line))
    .join('\n');

  let slugSearch = `slug: '${targetSlug}',`;
  let slugIdx = fullFile.indexOf(slugSearch);
  if (slugIdx === -1) {
    slugSearch = `"slug": "${targetSlug}",`;
    slugIdx = fullFile.indexOf(slugSearch);
  }

  if (slugIdx === -1) {
    console.error(`Could not find targetSlug: ${targetSlug}`);
    continue;
  }

  let imagesKeyIdx = fullFile.indexOf('images: [', slugIdx);
  if (imagesKeyIdx === -1) {
    imagesKeyIdx = fullFile.indexOf('"images": [', slugIdx);
  }

  if (imagesKeyIdx === -1) {
    console.error(`Could not find images array for targetSlug: ${targetSlug}`);
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
  console.log(`Replaced images for ${targetSlug} (from ${origSlug}) with verified records.`);
}

fs.writeFileSync('src/lib/db/destinations-data.ts', fullFile, 'utf8');
console.log('Successfully updated destinations-data.ts with all verified photography!');
