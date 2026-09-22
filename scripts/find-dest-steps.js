const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/5e8bddcb-7e4f-45e6-9abe-56f15033b1e7/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (line.includes('destinations-data.ts')) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      if (tc && tc.args && tc.args.TargetFile && tc.args.TargetFile.endsWith('destinations-data.ts')) {
        console.log(`Step ${obj.step_index}: ${tc.name} - ${tc.args.Description || ''}`);
      }
    } catch(e) {}
  }
});
