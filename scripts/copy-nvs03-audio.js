import fs from 'node:fs';
import path from 'node:path';

const dir = 'data/audio/stories/nvs-03';
const master = path.join(dir, 'hi-IN.wav');
const langs = ['en-IN', 'ta-IN', 'te-IN', 'bn-IN', 'kn-IN'];

for (const l of langs) {
  const dest = path.join(dir, l + '.wav');
  fs.copyFileSync(master, dest);
  console.log('Copied master to ' + dest + ' (' + fs.statSync(dest).size + ' bytes)');
}

