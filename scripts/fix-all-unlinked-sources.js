const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/db/destinations-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

const notice = 'Digital source unavailable — bibliographic citation retained.';

// Match every source object inside sources: [ ... ]
// We can find each source block between { and } within sources: [ ... ]
content = content.replace(/sources:\s*\[([\s\S]*?)\]\s*,\s*visitInfo:/g, (match, sourcesBlock) => {
  // Now inside this sourcesBlock, split by individual object { ... }
  const updatedBlock = sourcesBlock.replace(/\{([^{}]+)\}/g, (srcObjMatch, srcObjContent) => {
    // If it does NOT contain 'url:' and contains 'notes:'
    if (!srcObjContent.includes('url:')) {
      if (srcObjContent.includes('notes:') && !srcObjContent.includes(notice)) {
        // Add notice to notes
        return srcObjContent.replace(/notes:\s*(['"])(.*?)\1/, (notesMatch, quote, notesVal) => {
          return `notes: ${quote}${notice} ${notesVal}${quote}`;
        });
      } else if (!srcObjContent.includes('notes:')) {
        // Add notes with notice
        return srcObjContent.trimEnd() + `,\n        notes: '${notice}',\n      `;
      }
    }
    return `{${srcObjContent}}`;
  });
  return `sources: [${updatedBlock}],\n    visitInfo:`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Processed all unlinked sources across all destinations.');
