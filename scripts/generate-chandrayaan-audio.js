/**
 * generate-chandrayaan-audio.js
 * Generates Shivani voice audio for Chandrayaan-3 story in 5 languages
 * (English, Tamil, Telugu, Bengali, Kannada) preserving emotion tags (<exhales>, <slow>, <sniffles>, <soft>).
 * Hindi is already existing.
 * Run: node --env-file=.env scripts/generate-chandrayaan-audio.js
 */
import { synthesizeSpeech } from '../server/services/gnani/tts.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../data/audio/stories/chandrayaan-3');
mkdirSync(OUT_DIR, { recursive: true });

function splitIntoChunks(text, maxLen = 700) {
  const sentences = text.split(/(?<=[.?।।])\s+(?=<|\S)/);
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current.trim());
      if (s.length > maxLen) {
        const subparts = s.split(/(?<=,)\s+/);
        let sub = '';
        for (const p of subparts) {
          if ((sub + ' ' + p).trim().length <= maxLen) {
            sub = (sub + ' ' + p).trim();
          } else {
            if (sub) chunks.push(sub.trim());
            sub = p.trim();
          }
        }
        if (sub) chunks.push(sub.trim());
        current = '';
      } else {
        current = s.trim();
      }
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(c => c.length > 0);
}

function buildWavHeader(pcmByteLength) {
  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmByteLength;
  const riffSize = 36 + dataSize;

  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(riffSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);       // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

function extractPcm(wavBuffer) {
  const dataIdx = wavBuffer.indexOf(Buffer.from('data'));
  if (dataIdx === -1) return wavBuffer.slice(44);
  return wavBuffer.slice(dataIdx + 8);
}

async function generateForLang(lang, text, langName) {
  const finalPath = path.join(OUT_DIR, `${lang}.wav`);

  // If already generated new audio (not the old 15MB placeholder), skip
  if (existsSync(finalPath)) {
    const size = statSync(finalPath).size;
    if (size !== 15884084 && size > 100000) {
      console.log(`  ⏭️  ${langName}: already exists (${(size / 1024 / 1024).toFixed(2)} MB), skipping.`);
      return { lang, success: true, path: finalPath, skipped: true };
    }
  }

  const chunks = splitIntoChunks(text);
  console.log(`  📝 ${langName}: ${chunks.length} chunks to synthesize`);

  const pcmBuffers = [];
  let chunkIdx = 0;

  for (const chunk of chunks) {
    chunkIdx++;
    const tmpPath = path.join(OUT_DIR, `.tmp-c3-${lang}-${chunkIdx}.wav`);
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      attempts++;
      try {
        await synthesizeSpeech({
          text: chunk,
          lang,
          voice: 'Shivani',
          model: 'timbre-v3.0',
          targetPath: tmpPath
        });
        const wavBuf = readFileSync(tmpPath);
        pcmBuffers.push(extractPcm(wavBuf));
        rmSync(tmpPath, { force: true });
        process.stdout.write(`    ✓ chunk ${chunkIdx}/${chunks.length}\r`);
        success = true;
        // Pacing delay between chunks to avoid Cloudflare rate limiting
        await new Promise(r => setTimeout(r, 2500));
      } catch (err) {
        rmSync(tmpPath, { force: true });
        if (attempts < 3) {
          console.log(`\n    ⚠️ chunk ${chunkIdx} failed (attempt ${attempts}): ${err.message}. Waiting 8s...`);
          await new Promise(r => setTimeout(r, 8000));
        } else {
          console.error(`\n    ❌ chunk ${chunkIdx} failed permanently: ${err.message}`);
        }
      }
    }
  }

  if (pcmBuffers.length === 0) {
    return { lang, success: false, error: 'All chunks failed' };
  }

  const combined = Buffer.concat(pcmBuffers);
  const header = buildWavHeader(combined.length);
  writeFileSync(finalPath, Buffer.concat([header, combined]));

  const sizeMB = ((header.length + combined.length) / 1024 / 1024).toFixed(2);
  console.log(`\n  ✅ ${langName}: ${finalPath} (${sizeMB} MB, ${pcmBuffers.length}/${chunks.length} chunks OK)`);
  return { lang, success: true, path: finalPath };
}

const SCRIPTS = {
  'en-IN': `<exhales> Have you ever looked up at the night sky and wondered what lies beyond? <slow> For centuries, humanity has asked this very question. First, our ancestors navigated by the stars, then came the telescope, and today we send our spacecraft to other worlds. <sniffles> The true nature of humanity is that we are never content to stand still in one place. We always yearn to look further, to discover new pathways. <slow> From this restless longing was born the story of Chandrayaan-3. It was July 2023. A rocket lifted off from the launchpad at Sriharikota. Inside rested Chandrayaan-3, and with it, the hopes and dreams of over a billion people. <slow> Hardly any of the scientists gathered there that night could sleep. A single question echoed in every mind: could we land where no nation had ever set foot before? The journey was anything but simple. For weeks, the spacecraft gently adjusted its orbit, drawing closer and closer like someone reuniting with a loved one. <exhales> Down on Earth, the team watched over its every move day and night. And then came that moment. <slow> The evening of 23 August 2023. The lander named Vikram began its descent toward the lunar surface. Its engines roared to life, slowly bleeding away velocity. <sniffles> Every second was a crucial verdict. A single misjudgment, and everything could be lost. And then... the lander touched the lunar dust. India became the very first country to land near the Moon's south pole. <slow> This was not merely the victory of a machine. It was the triumph of countless human hands that had laboured for years. Once the ramp lowered, out rolled Pragyan — a small six-wheeled rover gliding across the soft lunar soil. It examined the ground and confirmed the presence of sulphur. <exhales> It sent back knowledge that will serve generations yet to come. This step is not just about the Moon. It is part of humanity's grandest aspiration — to step beyond our home world and comprehend the cosmos. <slow> Earth is our home, but humanity cannot stay forever confined to a single haven. Today the Moon, tomorrow Mars, and beyond that, unfathomable worlds and stars. <exhales> Every new horizon brings a new question. This mission teaches us an enduring lesson: dream boldly, but tread with wisdom and precision. By learning from the setbacks of Chandrayaan-2, the team accomplished what had never been done before. <slow> Failure too is a great mentor, if only we have the courage to learn from it. And the most beautiful thing of all? This mission ignited wonder in millions of young hearts. A child asked, "How did all this reach the lunar soil?" Another thought, "I too will become a scientist one day." <soft> Perhaps that is the truest triumph of all. <slow> So the next time you gaze upon the Moon in the night sky, do not see it as merely a luminous view. It is an open doorway, whispering that humanity's voyage has only just begun. And that voyage belongs to every single one of us.`,

  'ta-IN': `<exhales> இரவு வானை அண்ணாந்து பார்த்து, அதற்கு அப்பால் என்ன இருக்கும் என்று நீங்கள் எப்போதாவது யோசித்ததுண்டா? <slow> பல நூற்றாண்டுகளாக மனித இனம் இந்தக் கேள்வியை தொடர்ந்து கேட்டுக் கொண்டே இருக்கிறது. ஆரம்பத்தில் மனிதர்கள் நட்சத்திரங்களை வழிகாட்டிகளாகப் பார்த்தார்கள், பின்னர் தொலைநோக்கிகள் வந்தன, இன்றோ நாம் பிற உலகங்களுக்கு விண்கலங்களை அனுப்புகிறோம். <sniffles> ஒரே இடத்தில் திருப்தியடைந்து நின்றுவிடாமல் இருப்பதுதான் மனிதனின் இயல்பு. அவன் எப்போதும் தொலைநோக்குடன் பார்க்க விரும்புகிறான், புதிய பாதைகளைத் தேடுகிறான். <slow> இந்தத் தேடலிலிருந்தே சந்திரயான்-3 கதை பிறந்தது. அது 2023 ஜூலை மாதம். ஸ்ரீஹரிகோட்டாவின் ஏவுதளத்திலிருந்து ஒரு ராக்கெட் வானை நோக்கிப் பாய்ந்தது. அதனுள் இருந்தது சந்திரயான்-3, அதனோடு நூறு கோடிக்கும் அதிகமான மக்களின் கனவுகள். <slow> கட்டுப்பாட்டு அறையில் அமர்ந்திருந்த விஞ்ஞானிகளில் யாருக்கும் அந்த இரவில் தூக்கமே வரவில்லை. அனைவரின் மனதிலும் ஒரே ஒரு கேள்வி: இதுவரையில் எவரும் செல்லாத அந்த நிலவின் தென் துருவத்தில் நாம் தரை இறங்க முடியுமா? பயணம் எளிதானதாக இருக்கவில்லை. பல வாரங்களாக விண்கலம் தனது சுற்றுப்பாதையை படிப்படியாக மாற்றிக்கொண்டே நிலவை நெருங்கியது, ஒரு பிரியமானவரை நோக்கிச் செல்வது போல. <exhales> பூமியில் இருந்த குழுவினர் ஒவ்வொரு கணமும் அதன் துடிப்பைக் கவனித்துக் கொண்டே இருந்தனர். பிறகு அந்தத் தருணம் வந்தது. <slow> 2023 ஆகஸ்ட் 23, மாலை நேரம். விக்ரம் என்ற லேண்டர் நிலவின் மேற்பரப்பை நோக்கி இறங்கத் தொடங்கியது. அதன் என்ஜின்கள் இயங்கி, வேகத்தை மெதுவாகக் குறைத்தன. <sniffles> ஒவ்வொரு விநாடியும் ஒரு முக்கியமான தீர்மானம். ஒரு சிறு தவறு நேர்ந்தாலும் எல்லாம் பாழாகிவிடும். அப்போது... லேண்டர் நிலவின் மண்ணைத் தொட்டது! நிலவின் தென் துருவத்தில் கால் பதித்த உலகின் முதல் நாடு என்ற பெருமையை இந்தியா பெற்றது. <slow> இது வெறும் ஒரு இயந்திரத்தின் வெற்றி மட்டுமல்ல. பல ஆண்டுகள் அரும்பாடுபட்ட விஞ்ஞானிகளின் கைகளுக்குக் கிடைத்த மாபெரும் வெற்றி. லேண்டரின் கதவு திறந்து பிரக்யான் வெளியே வந்தது. ஆறு சக்கரங்களைக் கொண்ட அந்தச் சிறிய ரோவர் நிலவின் புழுதியில் மெதுவாக நகர்ந்தது. நிலவின் மண்ணை ஆராய்ந்து சல்பர் இருப்பதை உறுதி செய்தது. <exhales> அது அனுப்பிய தகவல்கள் வரும் தலைமுறைகளுக்கும் வழிகாட்டும். இந்தப் பயணம் நிலவோடு முடிந்துவிடப் போவதில்லை. பூமியைத் தாண்டிப் பிரபஞ்சத்தைப் புரிந்துகொள்ள வேண்டும் என்ற மனிதனின் மாபெரும் கனவின் ஒரு பகுதி இது. <slow> பூமி நமது வீடு, ஆனால் மனிதன் இந்த ஒரு இடத்திலேயே அடங்கிப் போய்விட முடியாது. இன்று நிலவு, நாளை செவ்வாய், அதற்கும் அப்பால் எண்ணற்ற கிரகங்களும் நட்சத்திரங்களும். <exhales> ஒவ்வொரு புதிய இலக்கும் ஒரு புதிய கேள்வியைக் கொண்டுவருகிறது. சந்திரயான்-3 நமக்கு ஒரு பாடம் கற்பிக்கிறது: பெரிய கனவுகளைக் காணுங்கள், ஆனால் கவனத்துடனும் நிதானத்துடனும் முன்னேறுங்கள். சந்திரயான்-2ன் பின்னடைவுகளிலிருந்து கற்றுக்கொண்டதால்தான் இந்த வரலாற்று வெற்றியைப் பெற முடிந்தது. <slow> தோல்வியும் ஒரு நல்ல ஆசான்தான், நாம் அதிலிருந்து கற்றுக்கொள்ளத் துணிந்தால். அனைத்திலும் அழகான விஷயம் என்ன தெரியுமா? இந்தத் திட்டம் கோடிக்கணக்கான குழந்தைகளின் கண்களில் புதிய வெளிச்சத்தை ஏற்றியுள்ளது. "நிலவின் மண்ணில் எப்படி இறங்குவது?" என்று ஒரு குழந்தை கேட்கிறது. "நானும் ஒரு நாள் விண்வெளி விஞ்ஞானி ஆவேன்" என்று இன்னொரு குழந்தை கனவு காண்கிறது. <soft> ஒருவேಳೆ அதுதான் உண்மையான வெற்றியாக இருக்கும். <slow> எனவே அடுத்த முறை இரவு வானில் நிலவைப் பார்க்கும்போது, அதை வெறும் அழகிய காட்சியாக மட்டும் பார்க்காதீர்கள். அது ஒரு திறந்த வாசல், மனிதனின் மாபெரும் பயணம் இப்போதுதான் தொடங்கியுள்ளது என்பதை நமக்கு நினைவூட்டுகிறது. அந்தப் பயணம் நம் அனைவருக்கும் உரியது.`,

  'te-IN': `<exhales> రాత్రి వేళ ఆకాశం వైపు చూసి, ఆ అవతల ఏముంటుందో అని మీరు ఎప్పుడైనా ఆలోచించారా? <slow> శతాబ్దాలుగా మానవజాతి ఇదే ప్రశ్న అడుగుతూ ఉంది. పూర్వం నక్షత్రాలను చూసి దారులు వెతుక్కునేవారు, ఆ తర్వాత టెలిస్కోప్ వచ్చింది, నేడు మనం ఇతర గ్రహాలకు నౌకలను పంపుతున్నాం. <sniffles> ఒకే చోట ఆగిపోకుండా ఉండటమే మనిషి నిజమైన నైజం. ఎల్లప్పుడూ ముందుకు చూడాలని, సరికొత్త దారులు వెతకాలని తపిస్తుంటాడు. <slow> ఈ ఆలోచన నుండే చంద్రయాన్-3 కథ పుట్టింది. 2023 జూలై నెల. శ్రీహరికోట లాంచ్‌ప్యాడ్ నుండి ఒక రాకెట్ ఆకాశంలోకి దూసుకెళ్ళింది. దాని లోపల చంద్రయాన్-3 ఉంది, దానితో పాటు వంద కోట్ల మంది ప్రజల ఆశలు, కలలు ఉన్నాయి. <slow> ఆ రాత్రి కంట్రోల్ రూమ్‌లో ఉన్న శాస్త్రవేత్తలలో ఎవరికీ నిద్ర పట్టలేదు. అందరి మనసుల్లో ఒకటే ప్రశ్న: ఇప్పటివరకు ఏ దేశమూ చేరని చోట మనం దిగగలమా? ప్రయాణం అంత సులువేమీ కాదు. వారాల తరబడి అంతరిక్ష నౌక నిదానంగా కక్ష్యను మార్చుకుంటూ చంద్రుని వైపు సాగింది, తన వారిని చేరుకోవడానికి వెళ్తున్నట్లుగా. <exhales> భూమిపై ఉన్న బృందం ప్రతి క్షణం దాని గమనాన్ని గమనిస్తూనే ఉంది. ఇక ఆ క్షణం రానే వచ్చింది. <slow> 23 ఆగస్టు 2023, సాయంత్రం వేళ. విక్రమ్ అనే ల్యాండర్ చంద్రుని ఉపరితలం వైపు దిగడం ప్రారంభించింది. ఇంజన్లు మండి, వేగాన్ని క్రమంగా తగ్గించాయి. <sniffles> ప్రతి సెకను ఒక కీలక పరీక్ష. ఒక్క చిన్న పొరపాటు జరిగినా సర్వం నాశనమయ్యేది. కానీ... ల్యాండర్ చంద్రుడి నేలను ముద్దాడింది! చంద్రుని దక్షిణ ధ్రువానికి చేరుకున్న ప్రపంచంలోనే తొలి దేశంగా భారతదేశం చరిత్ర సృష్టించింది. <slow> ఇది కేవలం ఒక యంత్రం విజయం మాత్రమే కాదు. ఏళ్ల తరబడి శ్రమించిన వేలాది శాస్త్రవేత్తల చేతుల విజయం. ల్యాండర్ తలుపులు తెరుచుకున్నాక లోపలి నుండి ప్రగ్యాన్ రోవర్ బయటకు వచ్చింది. ఆరు చక్రాల ఆ చిన్న రోవర్ చంద్రుని నేలపై నెమ్మదిగా కదిలింది. అక్కడి మట్టిని పరీక్షించి సల్ఫర్ ఉనికిని నిర్ధారించింది. <exhales> రాబోయే తరాలకు ఉపయోగపడే అద్భుతమైన సమాచారాన్ని పంపింది. ఈ అడుగు కేవలం చంద్రుని వరకే కాదు. మన భూమిని దాటి విశ్వాన్ని అర్థం చేసుకోవాలనే మానవాళి గొప్ప సంకల్పంలో ఇది ఒక భాగం. <slow> భూమి మన నివాసం, కానీ మనిషి ఒక్కచోటే పరిమితమై ఉండిపోలేడు. నేడు చంద్రుడు, రేపు అంగారకుడు, ఆపై ఎన్నో కొత్త లోకాలు మరియు నక్షత్రాలు. <exhales> ప్రతి కొత్త గమ్యమూ సరికొత్త ప్రశ్నను తెస్తుంది. చంద్రయాన్-3 మనకు ఒక గొప్ప పాఠం నేర్పుతుంది: కలలు పెద్దవిగా ఉండాలి, కానీ అడుగులు ఆలోచించి వేయాలి. చంద్రయాన్-2 అనుభవాల నుండి నేర్చుకున్నందునే ఈ చారిత్రక విజయం సాధ్యమైంది. <slow> మనం నేర్చుకోవడానికి సిద్ధంగా ఉంటే ఓటమి కూడా ఒక ఉత్తమ గురువుగా మారుతుంది. అన్నింటికంటే అందమైన విషయమేమిటంటే? ఈ మిషన్ కోట్లాది మంది పిల్లల కళ్లలో ఆశలు రేకెత్తించింది. "చంద్రుడి నేల మీదకి ఇవన్నీ ఎలా వెళ్లాయి?" అని ఒకరు అడిగారు. "నేను కూడా ఒక రోజు శాస్త్రవేత్త అవుతాను" అని మరొకరు భావించారు. <soft> బహుశా అదే నిజమైన విజయం. <slow> అందుకే తదుపరిసారి రాత్రి ఆకాశంలో చంద్రుడిని చూసినప్పుడు, అతన్ని కేవలం ఒక అందమైన దృశ్యంగా భావించకండి. మానవుడి ప్రయాణం ఇప్పుడే మొదలైందని గుర్తుచేసే తెరిచిన ద్వారం అది. ఆ ప్రయాణం మనందరిదీ.`,

  'bn-IN': `<exhales> রাতের আকাশের দিকে তাকিয়ে কখনো কি ভেবেছেন, এর ওপারে ঠিক কী আছে? <slow> মানুষ শতাব্দীর পর শতাব্দী ধরে এই একটাই প্রশ্ন করে আসছে। আগে মানুষ তারাদের দেখে দিক নির্ণয় করত, তারপর এলো দূরবীন, আর আজ আমরা ভিনগ্রহে মহাকাশযান পাঠাচ্ছি। <sniffles> মানুষের আসল স্বভাবই হলো এক জায়গায় থমকে না থাকা। সে সবসময় আরও দূরে দেখতে চায়, নতুন পথের সন্ধান পেতে চায়। <slow> ঠিক এই ভাবনা থেকেই জন্ম নিয়েছে চন্দ্রযান-৩ এর গল্প। ২০২৩ সালের জুলাই মাসের কথা। শ্রীহরিকোটার উৎক্ষেপণ কেন্দ্র থেকে একটি রকেট মেঘ চিরে উড়ে গেল। তার ভেতরে ছিল চন্দ্রযান-৩, আর তার সাথে ছিল একশো কোটিরও বেশি মানুষের স্বপ্ন। <slow> কন্ট্রোল রুমে বসা বিজ্ঞানীদের মধ্যে বোধহয় সেদিন রাতে কারো চোখেই ঘুম ছিল না। সবার মনে শুধু একটাই প্রশ্ন ঘুরছিল: যেখানে আজ পর্যন্ত কোনো দেশ পৌঁছাতে পারেনি, সেখানে কি আমরা নামতে পারব? যাত্রাটা মোটেও সহজ ছিল না। কয়েক সপ্তাহ ধরে মহাকাশযানটি ধীরে ধীরে তার কক্ষপথ বদলাতে বদলাতে চাঁদের কাছে এগিয়ে গেল, যেন ভালোবাসার মানুষের কাছে কোনো প্রিয়জন এগিয়ে চলেছে। <exhales> আর পৃথিবীর মাটিতে বসে থাকা দলটা প্রতিটি মুহূর্তের খবর রাখছিল। তারপর এলো সেই অবিস্মরণীয় ক্ষণ। <slow> ২৩ আগস্ট ২০২৩, বিকেলবেলা। বিক্রম নামের ল্যান্ডারটি চাঁদের পৃষ্ঠের দিকে নামতে শুরু করল। তার ইঞ্জিনগুলো জ্বলে উঠল, আর ধীরে ধীরে গতি কমিয়ে আনতে লাগল। <sniffles> প্রতিটি সেকেন্ড ছিল একেকটা কঠিন সিদ্ধান্ত। একটাই ভুল, আর চোখের নিমেষে সব শেষ হয়ে যেতে পারত। আর তারপর... ল্যান্ডারটি চাঁদের মাটি স্পর্শ করল! চাঁদের দক্ষিণ মেরুতে পৌঁছানো পৃথিবীর প্রথম দেশ হিসেবে ভারত ইতিহাস তৈরি করল। <slow> এটা শুধু একটা যন্ত্রের জয় ছিল না। এটা ছিল সেই অগুনতি হাতের জয়, যারা বছরের পর বছর অক্লান্ত পরিশ্রম করেছিলেন। ল্যান্ডার খোলার পর ভেতর থেকে বেরিয়ে এলো প্রজ্ঞান। ছয় চাকার ছোট্ট একটি রোভার, যা চাঁদের ধুলোয় ধীরে ধীরে পথ চলতে শুরু করল। সেখানের মাটির পরীক্ষা করে সে সালফারের অস্তিত্ব আবিষ্কার করল। <exhales> এমন সব বৈজ্ঞানিক তথ্য পাঠাল, যা আগামী বহু প্রজন্মের গবেষণার কাজে লাগবে। এই পদক্ষেপটি শুধু চাঁদে পৌঁছানোর নয়। এটা মানুষের সেই বিশাল স্বপ্নের অংশ, যা আমাদের পৃথিবীর বাইরে নিয়ে গিয়ে এই মহাবিশ্বকে বুঝতে শেখায়। <slow> পৃথিবী আমাদের ঘর, কিন্তু মানুষ কেবল একটা সীমানার ভেতর বন্দি হয়ে থাকতে পারে না। আজ চাঁদ, কাল মঙ্গল, আর তারও পরে কত অজানা গ্রহ আর নক্ষত্র! <exhales> প্রতিটি নতুন গন্তব্য একেকটা নতুন প্রশ্ন নিয়ে আসে। এই অভিযান আমাদের একটা গভীর শিক্ষা দেয়: স্বপ্ন বড় হওয়া উচিত, কিন্তু পথ চলতে হবে ভেবেচিন্তে ও নিখুঁত পদক্ষেপে। চন্দ্রযান-২ এর ব্যর্থতা থেকে শিক্ষা নিয়েই বিজ্ঞানীরা এমন এক ইতিহাস গড়লেন যা আগে কখনো ঘটেনি। <slow> ব্যর্থতাও একজন মহান শিক্ষক, যদি আমরা তার কাছ থেকে শিখতে প্রস্তুত থাকি। আর সবচেয়ে সুন্দর কথা কী জানেন? এই অভিযান কোটি কোটি শিশুর চোখে নতুন স্বপ্ন এঁকে দিয়েছে। কেউ জানতে চেয়েছে, "চাঁদের মাটিতে ওটা কেমন করে পৌঁছাল?" কেউ ভেবেছে, "আমিও একদিন বিজ্ঞানী হব।" <soft> এটাই বোধহয় সবচেয়ে বড় সার্থকতা। <slow> তাই পরের বার যখন রাতের আকাশে চাঁদের দিকে তাকাবেন, তাকে কেবল সুন্দর একটা দৃশ্য ভাববেন না। ওটা একটা খোলা দরজা, যা আমাদের মনে করিয়ে দেয় মানুষের এই অনন্ত যাত্রা সবেমাত্র শুরু হয়েছে। আর এই যাত্রা আমাদের সবার।`,

  'kn-IN': `<exhales> ರಾತ್ರಿ ಆಕಾಶವನ್ನು ನೋಡಿ, ಅದರ ಆಚೆಗೆ ಏನಿರಬಹುದು ಎಂದು ನೀವು ಎಂದಾದರೂ ಯೋಚಿಸಿದ್ದೀರಾ? <slow> ಶತಮಾನಗಳಿಂದಲೂ ಮಾನವ ಇದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳುತ್ತಲೇ ಬಂದಿದ್ದಾನೆ. ಮೊದಲು ನಕ್ಷತ್ರಗಳನ್ನು ನೋಡಿ ದಾರಿ ಹುಡುಕುತ್ತಿದ್ದೆವು, ಆಮೇಲೆ ದೂರದರ್ಶಕ ಬಂತು, ಮತ್ತು ಇಂದು ನಾವು ಇತರ ಗ್ರಹಗಳಿಗೇ ಗಗನನೌಕೆಗಳನ್ನು ಕಳುಹಿಸುತ್ತಿದ್ದೇವೆ. <sniffles> ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಕುಳಿತು ತೃಪ್ತಿಪಡದಿರುವುದೇ ಮಾನವನ ನೈಜ ಸ್ವಭಾವ. ಅವನು ಯಾವಾಗಲೂ ಮುಂದೆ ನೋಡಲು ಮತ್ತು ಹೊಸ ಮಾರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಹಂಬಲಿಸುತ್ತಾನೆ. <slow> ಇದೇ ಚಿಂತನೆಯಿಂದ ಚಂದ್ರಯಾನ-3 ಕಥೆ ಹುಟ್ಟಿಕೊಂಡಿತು. ಅದು ಜುಲೈ 2023. ಶ್ರೀಹರಿಕೋಟಾದ ಉಡಾವಣಾ ವೇದಿಕೆಯಿಂದ ಒಂದು ಬೃಹತ್ ರಾಕೆಟ್ ನಭಕ್ಕೆ ನೆಗೆಯಿತು. ಅದರೊಳಗೆ ಚಂದ್ರಯಾನ-3 ಇತ್ತು, ಮತ್ತು ಅದರೊಂದಿಗೆ ಕೋಟ್ಯಂತರ ಭಾರತೀಯರ ನಂಬಿಕೆ ಮತ್ತು ಕನಸುಗಳಿದ್ದವು. <slow> ನಿಯಂತ್ರಣ ಕೊಠಡಿಯಲ್ಲಿದ್ದ ವಿಜ್ಞಾನಿಗಳಲ್ಲಿ ಆ ರಾತ್ರಿ ಯಾರೊಬ್ಬರಿಗೂ ಸರಿಯಾಗಿ ನಿದ್ದೆಯೇ ಬರಲಿಲ್ಲ. ಪ್ರತಿಯೊಬ್ಬರ ಮನಸ್ಸಿನಲ್ಲೂ ಒಂದೇ ಪ್ರಶ್ನೆ: ಇದುವರೆಗೆ ಯಾವ ದೇಶವೂ ತಲುಪದ ಸ್ಥಳದಲ್ಲಿ ನಾವು ಯಶಸ್ವಿಯಾಗಿ ಇಳಿಯಲು ಸಾಧ್ಯವೇ? ಪ್ರಯಾಣ ಸುಲಭವಾಗಿರಲಿಲ್ಲ. ವಾರಗಳ ಕಾಲ ಗಗನನೌಕೆ ನಿಧಾನವಾಗಿ ತನ್ನ ಕಕ್ಷೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತಾ ಚಂದ್ರನ ಸನಿಹಕ್ಕೆ ಸಾಗಿತು, ಪ್ರೀತಿಯ ವ್ಯಕ್ತಿಯನ್ನು ಭೇಟಿಯಾಗಲು ಹೋಗುವಂತೆ. <exhales> ನೆಲದ ಮೇಲಿದ್ದ ಇಡೀ ತಂಡ ಪ್ರತಿಯೊಂದು ಕ್ಷಣವೂ ಅದರ ಚಲನವಲನವನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸುತ್ತಿತ್ತು. ಅಂತಿಮವಾಗಿ ಆ ನಿರ್ಣಾಯಕ ಕ್ಷಣ ಬಂದೇ ಬಿಟ್ಟಿತು. <slow> 23 ಆಗಸ್ಟ್ 2023, ಸಂಜೆಯ ಸಮಯ. ವಿಕ್ರಮ್ ಹೆಸರಿನ ಲ್ಯಾಂಡರ್ ಚಂದ್ರನ ಮೇಲ್ಮೈ ಕಡೆಗೆ ಇಳಿಯಲಾರಂಭಿಸಿತು. ಅದರ ಎಂಜಿನ್‌ಗಳು ಉರಿದು ವೇಗವನ್ನು ನಿಧಾನವಾಗಿ ಕಡಿಮೆ ಮಾಡಿದವು. <sniffles> ಪ್ರತಿಯೊಂದು ಸೆಕೆಂಡೂ ಒಂದು ಅಗ್ನಿಪರೀಕ್ಷೆಯಾಗಿತ್ತು. ಒಂದೇ ಒಂದು ಸಣ್ಣ ತಪ್ಪು ನಡೆದರೂ ಎಲ್ಲವೂ ನಾಶವಾಗಬಹುದಿತ್ತು. ಮತ್ತು ಕೊನೆಗೆ... ಲ್ಯಾಂಡರ್ ಚಂದ್ರನ ಮಣ್ಣನ್ನು ಮೃದುವಾಗಿ ಸ್ಪರ್ಶಿಸಿತು! ಚಂದ್ರನ ದಕ್ಷಿಣ ಧ್ರುವದ ಬಳಿ ಇಳಿದ ವಿಶ್ವದ ಮೊದಲ ರಾಷ್ಟ್ರವಾಗಿ ಭಾರತ ಇತಿಹಾಸ ಸೃಷ್ಟಿಸಿತು. <slow> ಇದು ಕೇವಲ ಒಂದು ಯಂತ್ರದ ವಿಜಯವಾಗಿರಲಿಲ್ಲ. ವರ್ಷಗಟ್ಟಲೆ ಶ್ರಮಿಸಿದ ವಿಜ್ಞಾನಿಗಳ ಕೈಗಳ ವಿಜಯವಾಗಿತ್ತು. ಲ್ಯಾಂಡರ್ ತೆರೆದ ನಂತರ ಅದರೊಳಗಿಂದ ಹೊರಬಂದದ್ದು ಪ್ರಜ್ಞಾನ್. ಆರು ಚಕ್ರಗಳ ಆ ಪುಟ್ಟ ರೋವರ್ ಚಂದ್ರನ ಮಣ್ಣಿನ ಮೇಲೆ ನಿಧಾನವಾಗಿ ಹೆಜ್ಜೆ ಇಟ್ಟಿತು. ಅಲ್ಲಿನ ಮಣ್ಣನ್ನು ಪರೀಕ್ಷಿಸಿ ಗಂಧಕದ (ಸಲ್ಫರ್) ಇರುವಿಕೆಯನ್ನು ದೃಢಪಡಿಸಿತು. <exhales> ಭವಿಷ್ಯದ ಪೀಳಿಗೆಗೆ ಮಾರ್ಗದರ್ಶಿಯಾಗುವಂತಹ ಅಮೂಲ್ಯ ಮಾಹಿತಿಯನ್ನು ಅದು ಭೂಮಿಗೆ ರವಾನಿಸಿತು. ಈ ಹೆಜ್ಜೆ ಕೇವಲ ಚಂದ್ರನಿಗೆ ಸೀಮಿತವಲ್ಲ. ಇದು ನಮ್ಮ ಗ್ರಹದ ಆಚೆಗೆ ಸಾಗಿ ಇಡೀ ಬ್ರಹ್ಮಾಂಡವನ್ನು ಅರ್ಥೈಸಿಕೊಳ್ಳಬೇಕೆಂಬ ಮಾನವನ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಭಾಗವಾಗಿದೆ. <slow> ಭೂಮಿ ನಮ್ಮ ನೆಲೆ ನಿಜ, ಆದರೆ ಮಾನವ ಒಂದೇ ಕಡೆ ಸೀಮಿತವಾಗಿ ಉಳಿಯಲು ಸಾಧ್ಯವಿಲ್ಲ. ಇಂದು ಚಂದ್ರ, ನಾಳೆ ಮಂಗಳ, ಮತ್ತು ಅದರ ಆಚೆಗೂ ಅಗಣಿತ ಲೋಕಗಳು ಮತ್ತು ತಾರೆಗಳು. <exhales> ಪ್ರತಿಯೊಂದು ಹೊಸ ಗಮ್ಯವೂ ಹೊಸ ಪ್ರಶ್ನೆಗಳನ್ನು ಹೊತ್ತು ತರುತ್ತದೆ. ಚಂದ್ರಯಾನ-3 ನಮಗೊಂದು ಶಾಶ್ವತ ಪಾಠ ಕಲಿಸುತ್ತದೆ: ಕನಸುಗಳು ದೊಡ್ಡದಾಗಿರಲಿ, ಆದರೆ ಹೆಜ್ಜೆಗಳನ್ನು ಯೋಚಿಸಿ ಮತ್ತು ಜಾಗರೂಕತೆಯಿಂದ ಇಡಿ. ಚಂದ್ರಯಾನ-2 ರ ಹಿನ್ನಡೆಗಳಿಂದ ಕಲಿತ ಪಾಠವೇ ಈ ಐತಿಹಾಸಿಕ ಸಾಧನೆಗೆ ದಾರಿ ಮಾಡಿಕೊಟ್ಟಿತು. <slow> ನಾವು ಕಲಿಯಲು ಸಿದ್ಧರಿದ್ದರೆ ಸೋಲು ಕೂಡ ಅದ್ಭುತ ಗುರುವಾಗುತ್ತದೆ. ಎಲ್ಲಕ್ಕಿಂತ ಸುಂದರವಾದ ವಿಷಯವೇನೆಂದರೆ? ಈ ಮಿಷನ್ ಕೋಟ್ಯಂತರ ಮಕ್ಕಳ ಮನಸ್ಸಿನಲ್ಲಿ ಹೊಸ ಜಿಜ್ಞಾಸೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕಿತು. "ಚಂದ್ರನ ಮಣ್ಣಿಗೆ ಇದೆಲ್ಲ ಹೇಗೆ ತಲುಪಿತು?" ಎಂದು ಮಗುವೊಂದು ಕೇಳಿತು. "ನಾನೂ ಒಂದು ದಿನ ಬಾಹ್ಯಾಕಾಶ ವಿಜ್ಞಾನಿ ಆಗುತ್ತೇನೆ" ಎಂದು ಮತ್ತೊಂದು ಮಗು ಕನಸು ಕಂಡಿತು. <soft> ಪ್ರಾಯಶಃ ಅದೇ ನಿಜವಾದ ಗೆಲುವು. <slow> ಆದ್ದರಿಂದ ಮುಂದಿನ ಬಾರಿ ರಾತ್ರಿ ಆಕಾಶದಲ್ಲಿ ಚಂದ್ರನನ್ನು ನೋಡಿದಾಗ, ಅದನ್ನು ಕೇವಲ ಒಂದು ಸುಂದರ ದೃಶ್ಯವೆಂದು ಭಾವಿಸಬೇಡಿ. ಅದು ಒಂದು ತೆರೆದ ಬಾಗಿಲು, ಮಾನವನ ಮಹಾಯಾತ್ರೆ ಈಗಷ್ಟೇ ಪ್ರಾರಂಭವಾಗಿದೆ ಎಂದು ನೆನಪಿಸುವ ಬಾಗಿಲು. ಮತ್ತು ಆ ಯಾತ್ರೆ ನಮ್ಮೆಲ್ಲರದ್ದು.`
};

const LANG_NAMES = {
  'en-IN': 'English', 'ta-IN': 'Tamil', 'te-IN': 'Telugu',
  'bn-IN': 'Bengali', 'kn-IN': 'Kannada'
};

async function generate() {
  const results = [];

  for (const [lang, text] of Object.entries(SCRIPTS)) {
    console.log(`\n🎙️  Generating Chandrayaan-3 ${LANG_NAMES[lang]} (${lang})...`);
    const result = await generateForLang(lang, text, LANG_NAMES[lang]);
    results.push(result);
    if (result.success && !result.skipped) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('\n📦 Summary:');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`  ${icon} ${LANG_NAMES[r.lang]} (${r.lang}): ${r.success ? r.path : r.error}`);
  });
}

generate().catch(console.error);
