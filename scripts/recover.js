const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/5e8bddcb-7e4f-45e6-9abe-56f15033b1e7/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let bestContent = null;
let bestStep = 0;

rl.on('line', (line) => {
  if (line.includes('destinations-data.ts')) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      if (tc && tc.args && tc.args.CodeContent && tc.args.TargetFile && tc.args.TargetFile.includes('destinations-data.ts')) {
        if (!bestContent || tc.args.CodeContent.length > bestContent.length) {
          bestContent = tc.args.CodeContent;
          bestStep = obj.step_index;
        }
      }
    } catch(e) {}
  }
});

rl.on('close', () => {
  if (bestContent) {
    fs.writeFileSync('src/lib/db/destinations-data.ts', bestContent, 'utf8');
    console.log(`Recovered best destinations-data.ts from step ${bestStep} with length ${bestContent.length}`);
  }
});
