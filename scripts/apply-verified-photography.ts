import fs from 'fs';

const verifiedData = JSON.parse(fs.readFileSync('scripts/verified-intake-results.json', 'utf8'));

const filePath = 'src/lib/db/destinations-data.ts';
let content = fs.readFileSync(filePath, 'utf8');

for (const slug of Object.keys(verifiedData)) {
  const images = verifiedData[slug];
  const imagesJson = JSON.stringify(images, null, 10)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '      ' + line))
    .join('\n');

  // Match: "slug": "...", ... "images": [ ... ]
  // We want to replace from "images": [ to the matching ]
  const slugIdx = content.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) {
    console.error(`Could not find slug: ${slug}`);
    continue;
  }

  const imagesIdx = content.indexOf('"images": [', slugIdx);
  if (imagesIdx === -1) {
    console.error(`Could not find images array for slug: ${slug}`);
    continue;
  }

  // Find closing bracket of images array
  let bracketDepth = 0;
  let closingBracketIdx = -1;
  const startSearchIdx = content.indexOf('[', imagesIdx);
  for (let i = startSearchIdx; i < content.length; i++) {
    if (content[i] === '[') bracketDepth++;
    else if (content[i] === ']') {
      bracketDepth--;
      if (bracketDepth === 0) {
        closingBracketIdx = i;
        break;
      }
    }
  }

  if (closingBracketIdx === -1) {
    console.error(`Could not find closing bracket for ${slug}`);
    continue;
  }

  const before = content.slice(0, imagesIdx);
  const after = content.slice(closingBracketIdx + 1);
  content = `${before}"images": ${imagesJson}${after}`;
  console.log(`Successfully updated images for ${slug}`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished applying verified photography!');
