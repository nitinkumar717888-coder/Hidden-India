import fs from 'fs';
import path from 'path';

const verifiedData = JSON.parse(fs.readFileSync('scripts/verified-intake-results.json', 'utf8'));

const filePath = 'src/lib/db/destinations-data.ts';
let content = fs.readFileSync(filePath, 'utf8');

// For each slug in verifiedData, find its destination entry and replace its "images": [...] block
for (const slug of Object.keys(verifiedData)) {
  const images = verifiedData[slug];
  const imagesJson = JSON.stringify(images, null, 10)
    .replace(/^/gm, '      ')
    .trim();

  // Find destination by slug in content
  const slugRegex = new RegExp(`("slug":\\s*"${slug}"[\\s\\S]*?"images":\\s*\\[)[\\s\\S]*?(\\]\\s*\\n\\s*\\})`);
  const match = content.match(slugRegex);
  if (!match) {
    console.error(`Could not find slug match for ${slug}`);
    continue;
  }

  content = content.replace(slugRegex, `$1\n${imagesJson}\n      $2`);
  console.log(`Updated images for ${slug} (${images.length} verified images)`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated destinations-data.ts with verified photography!');
