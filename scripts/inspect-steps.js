const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/5e8bddcb-7e4f-45e6-9abe-56f15033b1e7/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

const steps = [2870, 3481, 3582, 3716, 3821, 3825, 4089];

rl.on('line', (line) => {
  for (const s of steps) {
    if (line.includes(`"step_index":${s}`) || line.includes(`"step_index": ${s}`)) {
      try {
        const obj = JSON.parse(line);
        console.log(`Step ${s}:`, obj.tool_calls?.[0]?.name, obj.tool_calls?.[0]?.args?.Description);
      } catch(e) {}
    }
  }
});
