const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/DELL/.gemini/antigravity-ide/brain/5e8bddcb-7e4f-45e6-9abe-56f15033b1e7/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (line.includes('"step_index":3576') || line.includes('"step_index": 3576')) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];
      console.log('Step 3576 tool:', tc.name);
      console.log('TargetFile:', tc.args?.TargetFile);
      console.log('Description:', tc.args?.Description);
      console.log('CodeContent length:', tc.args?.CodeContent?.length);
      const content = tc.args?.CodeContent;
      const slugs = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
      console.log('Slugs count in 3576:', slugs.length);
      console.log('First 5 slugs:', slugs.slice(0, 5));
      console.log('Last 5 slugs:', slugs.slice(-5));
      fs.writeFileSync('scripts/step3576.ts', content, 'utf8');
    } catch(e) {
      console.error(e);
    }
  }
});
