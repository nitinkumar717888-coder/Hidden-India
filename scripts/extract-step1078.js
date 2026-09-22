const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/5e8bddcb-7e4f-45e6-9abe-56f15033b1e7/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (line.includes('"step_index":1078') || line.includes('"step_index": 1078')) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      if (tc && tc.args && tc.args.CodeContent) {
        fs.writeFileSync('scripts/step1078-core22.ts', tc.args.CodeContent, 'utf8');
        console.log(`Saved step 1078 to scripts/step1078-core22.ts! Length: ${tc.args.CodeContent.length}`);
      }
    } catch(e) {
      console.error(e);
    }
  }
});
