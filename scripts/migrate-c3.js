import { getDb } from '../server/db/db.js';
import fs from 'node:fs';
import path from 'node:path';

const db = getDb();

// 1. Delete all other stories; keep ONLY chandrayaan-3
db.prepare('DELETE FROM story_translations WHERE story_id != ?').run('chandrayaan-3');
db.prepare('DELETE FROM stories WHERE id != ?').run('chandrayaan-3');
console.log('Stories remaining in DB:', db.prepare('SELECT id, title FROM stories').all());

// 2. Remove old chandrayaan audio folder if exists
const oldChandrayaanDir = path.resolve('data/audio/stories/chandrayaan');
if (fs.existsSync(oldChandrayaanDir)) {
  fs.rmSync(oldChandrayaanDir, { recursive: true, force: true });
  console.log('Removed directory:', oldChandrayaanDir);
}

// 3. Clean up data/audio/stories/chandrayaan-3
const c3Dir = path.resolve('data/audio/stories/chandrayaan-3');
if (!fs.existsSync(c3Dir)) {
  fs.mkdirSync(c3Dir, { recursive: true });
} else {
  const existingFiles = fs.readdirSync(c3Dir);
  for (const f of existingFiles) {
    fs.unlinkSync(path.join(c3Dir, f));
  }
  console.log('Cleaned old audio files in:', c3Dir);
}

// 4. Copy the 5 new audio files and standardize names
const srcDir = path.resolve('server/services/chandrayaan3');
const partMapping = [
  { src: 'chandrayan3-part1.wav', dest: 'part1.wav', part: 1, title: 'Part 1: The Launch from Sriharikota', title_hi: 'भाग 1: श्रीहरिकोटा से उड़ान', duration: 40.75 },
  { src: 'chandrayaan3 part2.wav', dest: 'part2.wav', part: 2, title: 'Part 2: 15 Minutes of Terror & Descent', title_hi: 'भाग 2: 23 अगस्त का अवतरण', duration: 37.10 },
  { src: 'chandrayaan3 part3.wav', dest: 'part3.wav', part: 3, title: 'Part 3: Soft Landing & Pragyan Rover', title_hi: 'भाग 3: दक्षिण ध्रुव पर लैंडिंग और प्रज्ञान', duration: 32.04 },
  { src: 'chandrayaan3 part4.wav', dest: 'part4.wav', part: 4, title: 'Part 4: Today the Moon, Tomorrow Mars', title_hi: 'भाग 4: आज चाँद, कल मंगल', duration: 27.64 },
  { src: 'chandrayaan3 part5.wav', dest: 'part5.wav', part: 5, title: 'Part 5: Lessons Learned & Inspiring the Future', title_hi: 'भाग 5: असफलता से सीख और प्रेरणा', duration: 42.56 }
];

const dataChunks = [];
let sampleRate = 44100;
let numChannels = 1;
let bitsPerSample = 16;
let byteRate = 88200;
let blockAlign = 2;

for (const item of partMapping) {
  const srcPath = path.join(srcDir, item.src);
  const destPath = path.join(c3Dir, item.dest);
  const buf = fs.readFileSync(srcPath);
  fs.writeFileSync(destPath, buf);

  numChannels = buf.readUInt16LE(22);
  sampleRate = buf.readUInt32LE(24);
  byteRate = buf.readUInt32LE(28);
  blockAlign = buf.readUInt16LE(32);
  bitsPerSample = buf.readUInt16LE(34);
  const dataSubchunkIndex = buf.indexOf('data');
  const dataStart = dataSubchunkIndex !== -1 ? dataSubchunkIndex + 8 : 44;
  const rawData = buf.subarray(dataStart);
  dataChunks.push(rawData);
}

// 5. Concatenate all 5 parts into full seamless master WAV
const totalDataLen = dataChunks.reduce((acc, c) => acc + c.length, 0);
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + totalDataLen, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM format
header.writeUInt16LE(numChannels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(blockAlign, 32);
header.writeUInt16LE(bitsPerSample, 34);
header.write('data', 36);
header.writeUInt32LE(totalDataLen, 40);

const masterWav = Buffer.concat([header, ...dataChunks]);
const masterHiPath = path.join(c3Dir, 'hi-IN.wav');
const masterEnPath = path.join(c3Dir, 'en-IN.wav');
const masterFullPath = path.join(c3Dir, 'chandrayaan-3-full.wav');
fs.writeFileSync(masterHiPath, masterWav);
fs.writeFileSync(masterEnPath, masterWav);
fs.writeFileSync(masterFullPath, masterWav);

// 6. Write parts.json for playlist & sync
const partsJson = partMapping.map((item, idx) => ({
  part: item.part,
  title: item.title,
  title_hi: item.title_hi,
  src: `/media/audio/stories/chandrayaan-3/${item.dest}`,
  duration_sec: item.duration,
  start_sec: partMapping.slice(0, idx).reduce((acc, prev) => acc + prev.duration, 0)
}));

fs.writeFileSync(path.join(c3Dir, 'parts.json'), JSON.stringify(partsJson, null, 2));
console.log('Created parts.json and master WAV files. Total duration:', (totalDataLen / byteRate).toFixed(2), 'seconds');

// 7. Update story_translations in DB
const hindiBody = `भाग 1: श्रीहरिकोटा से उड़ान
क्या आपने कभी रात के आसमान को देखकर सोचा है कि उसके उस पार क्या होगा? इंसान सदियों से यही सवाल पूछता आया है। पहले लोग तारों को देखकर रास्ता ढूंढते थे, फिर दूरबीन आई। और आज हम दूसरे ग्रहों तक अपने यान भेज रहे हैं। इंसान की असली फितरत यही है कि वो एक ही जगह बैठकर संतुष्ट नहीं होता। वो हमेशा आगे देखना चाहता है और नए रास्ते खोजना चाहता है। इसी सोच से निकली है चंद्रयान-3 की कहानी। जुलाई 2023 की बात है, श्रीहरिकोटा के लॉन्च पैड से एक रॉकेट ने उड़ान भरी। उसके अंदर था चंद्रयान-3 और उसके साथ थे करोड़ों लोगों के सपने।

भाग 2: 23 अगस्त का अवतरण
वहाँ बैठे साइंटिस्ट में से शायद ही किसी को उस रात ठीक से नींद आई हो। सबके मन में बस एक सवाल था: क्या हम वहाँ लैंड कर पाएंगे जहाँ अब तक कोई नहीं पहुँचा? सफर आसान नहीं था। यान कई हफ़्तों तक धीरे-धीरे अपना ऑर्बिट बदलता रहा, जैसे कोई धीरे-धीरे किसी अपने के करीब आ रहा हो। और ज़मीन पर बैठी टीम हर पल उसकी खबर लेती रही। फिर आया वो पल, 23 अगस्त 2023, शाम का वक्त। विक्रम नाम का लैंडर चाँद की सरफेस की तरफ बढ़ रहा था। उसके इंजन चले और उसने अपनी स्पीड धीरे-धीरे कम की।

भाग 3: दक्षिण ध्रुव पर लैंडिंग और प्रज्ञान रोवर
हर सेकंड एक फैसला था, एक भी गलती और सब कुछ खत्म हो सकता था। और फिर लैंडर ने चाँद को छू लिया! भारत चाँद के साउथ पोल के पास उतरने वाला पहला देश बन गया। ये सिर्फ एक मशीन की जीत नहीं थी, ये उन हाथों की जीत थी जिन्होंने सालों तक मेहनत की थी। लैंडर खुलने के बाद उसके अंदर से निकला प्रज्ञान—एक छोटा सा रोवर, जो अपने छह पहियों के सहारे धीरे-धीरे चाँद की मिट्टी पर चला। उसने वहाँ की मिट्टी को परखा और उसमें सल्फर की मौजूदगी पकड़ी।

भाग 4: आज चाँद, कल मंगल
ऐसी जानकारियाँ भेजीं, जो आने वाली पीढ़ियों के काम आएंगी। ये कदम सिर्फ चाँद तक का नहीं है, ये इंसान के उस बड़े सपने का हिस्सा है कि हम अपने ग्रह से बाहर जाकर ब्रह्मांड को समझें। धरती हमारा घर है, पर इंसान को सिर्फ इसी एक जगह तक सीमित नहीं रहना है। आज चाँद, कल मंगल और उसके आगे न जाने कितने ग्रह और तारे! हर नई मंज़िल एक नया सवाल लेकर आती है।

भाग 5: असफलता से सीख और नई पीढ़ी की प्रेरणा
मिशन हमें एक बात सिखाता है: सपने बड़े हों पर कदम सोच समझ कर रखे जाएँ। चंद्रयान-2 की कमियों से सीखकर ही टीम ने वो कर दिखाया जो पहले नहीं हुआ था। असफलता भी एक शिक्षक होती है अगर हम उससे सीखने को तैयार हों। और सबसे खूबसूरत बात, इस मिशन ने लाखों बच्चों की आँखों में सवाल जगा दिए। किसी ने पूछा, "चाँद की मिट्टी तक ये सब कैसे पहुँचा?" किसी ने सोचा, "मैं भी एक दिन साइंटिस्ट बनूँगा।" शायद यही असली कामयाबी है। तो अगली बार जब रात को चाँद दिखे, तो उसे सिर्फ एक खूबसूरत नज़ारा मत समझिएगा। वो एक दरवाज़ा है जो बताता है कि इंसान का सफर अभी शुरू हुआ है, और वो सफर हम सबका है।`;

const englishBody = `Part 1: The Launch from Sriharikota
Have you ever looked up at the night sky and wondered what lies beyond? For centuries, humanity has asked this very question. In ancient times we navigated by the stars, then telescopes expanded our vision, and today we send spacecraft to other worlds. It is human nature never to stay content in one place—we strive forward to discover new horizons. From this very aspiration came the story of Chandrayaan-3. In July 2023, a launch vehicle roared into the skies from the launchpad of Sriharikota, carrying Chandrayaan-3 and the dreams of over a billion people.

Part 2: The 15 Minutes of Terror & Descent
Hardly anyone in mission operations slept that night. A single question resonated: could we land where no nation had ever ventured before? The voyage was daunting. For weeks, the spacecraft gradually adjusted its orbits, drawing ever closer to the lunar surface while the ground control team tracked every pulse. Then arrived the pivotal moment—the evening of August 23, 2023. The Vikram lander descended towards the lunar terrain, its throttleable engines firing to steadily bleed off velocity.

Part 3: Soft Landing & Pragyan Rover
Every second demanded precision; a single miscalculation could end everything. And then, Vikram touched the lunar dust! India became the first country in history to soft-land near the Moon's South Pole. This was not merely the triumph of a machine—it was the victory of countless dedicated scientists who poured years of their lives into this endeavor. Soon, the ramp descended and Pragyan, the six-wheeled rover, rolled onto the lunar regolith, conducting in-situ experiments and confirming the presence of sulphur.

Part 4: Today the Moon, Tomorrow Mars
The scientific data transmitted back will serve generations of researchers. Yet this milestone transcends the Moon; it is part of a larger human voyage to comprehend the cosmos. Earth is our cradle, but humanity cannot remain confined to one haven forever. Today the Moon, tomorrow Mars, and beyond that, unfathomable worlds and stars! Every new destination presents fresh frontiers to explore.

Part 5: Lessons from Failure & Inspiring the Future
Chandrayaan-3 teaches us a profound lesson: dream boldly, but build with meticulous foresight. By learning from the setbacks of Chandrayaan-2, the ISRO team achieved the unprecedented. Failure is indeed a great teacher when we have the humility to learn. Most beautifully, this journey sparked curiosity in millions of young minds who gazed at the stars and dreamed, "One day, I will become a space scientist." That is the true victory. The Moon is not merely a sight in the night sky—it is an open doorway reminding us that our collective journey has only just begun.`;

const totalDuration = Math.round(totalDataLen / byteRate);

db.prepare(`
  UPDATE story_translations
  SET body = ?, audio_path = '/media/audio/stories/chandrayaan-3/hi-IN.wav', audio_status = 'ready', audio_duration_sec = ?
  WHERE story_id = 'chandrayaan-3' AND lang = 'hi-IN'
`).run(hindiBody, totalDuration);

db.prepare(`
  UPDATE story_translations
  SET body = ?, audio_path = '/media/audio/stories/chandrayaan-3/en-IN.wav', audio_status = 'ready', audio_duration_sec = ?
  WHERE story_id = 'chandrayaan-3' AND lang = 'en-IN'
`).run(englishBody, totalDuration);

// Set any other language audio_status to 'ready' using master WAV or keep existing text
const otherLangs = ['ta-IN', 'te-IN', 'bn-IN', 'kn-IN'];
for (const l of otherLangs) {
  db.prepare(`
    UPDATE story_translations
    SET audio_path = '/media/audio/stories/chandrayaan-3/hi-IN.wav', audio_status = 'ready', audio_duration_sec = ?
    WHERE story_id = 'chandrayaan-3' AND lang = ?
  `).run(totalDuration, l);
}

console.log('Database updated successfully for chandrayaan-3!');
