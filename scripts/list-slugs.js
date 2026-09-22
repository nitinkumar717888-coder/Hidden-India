const fs = require('fs');
const content = fs.readFileSync('src/lib/db/destinations-data.ts', 'utf8');

const regex = /slug["']?:\s*["']([^"']+)["']/g;
const matches = [];
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push(m[1]);
}

console.log('Total matches:', matches.length);
console.log('Core 22:', matches.slice(0, 22));
console.log('Expansion 31:', matches.slice(22));
