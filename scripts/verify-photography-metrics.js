const fs = require('fs');

// We can read and parse the images directly from destinations-data.ts or import via tsx
// Let's create a quick script to inspect using regex or node
const content = fs.readFileSync('src/lib/db/destinations-data.ts', 'utf8');

const regex = /"editorialStatus":\s*"([^"]+)"/g;
let match;
const statuses = {};
while ((match = regex.exec(content)) !== null) {
  const status = match[1];
  statuses[status] = (statuses[status] || 0) + 1;
}

console.log('Editorial statuses found across file:', statuses);
