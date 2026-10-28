/**
 * generate-mangalyaan-audio.js
 * Generates Shivani voice audio for Mangalyaan story in 5 languages.
 * Splits long texts into ~600-char sentence chunks, synthesizes each chunk,
 * then concatenates all raw PCM bytes into a single WAV file.
 * Run: node scripts/generate-mangalyaan-audio.js
 */
import { synthesizeSpeech } from '../server/services/gnani/tts.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../data/audio/stories/mangalyaan');
mkdirSync(OUT_DIR, { recursive: true });

/**
 * Split a long script into chunks at sentence / emotion-tag boundaries,
 * keeping each chunk under ~700 characters so Gnani TTS doesn't error.
 */
function splitIntoChunks(text, maxLen = 700) {
  // Split on period/question mark followed by space+<tag or whitespace
  const sentences = text.split(/(?<=[.?।।])\s+(?=<|\S)/);
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current.trim());
      // If a single sentence is still too long, split on comma/tag
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

/**
 * Build a WAV file header for raw 24kHz, 16-bit, mono PCM data.
 */
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

/**
 * Extract raw PCM data from a WAV buffer (strips the 44-byte header).
 */
function extractPcm(wavBuffer) {
  // Find 'data' chunk
  const dataIdx = wavBuffer.indexOf(Buffer.from('data'));
  if (dataIdx === -1) return wavBuffer.slice(44); // fallback
  return wavBuffer.slice(dataIdx + 8); // skip 'data' + 4-byte size
}

async function generateForLang(lang, text, langName) {
  const finalPath = path.join(OUT_DIR, `${lang}.wav`);
  if (existsSync(finalPath)) {
    console.log(`  ⏭️  ${langName}: already exists, skipping.`);
    return { lang, success: true, path: finalPath, skipped: true };
  }

  const chunks = splitIntoChunks(text);
  console.log(`  📝 ${langName}: ${chunks.length} chunks to synthesize`);

  const pcmBuffers = [];
  let chunkIdx = 0;

  for (const chunk of chunks) {
    chunkIdx++;
    const tmpPath = path.join(OUT_DIR, `.tmp-${lang}-${chunkIdx}.wav`);
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
    } catch (err) {
      console.error(`\n    ❌ chunk ${chunkIdx} failed for ${lang}: ${err.message}`);
      rmSync(tmpPath, { force: true });
      // Continue with remaining chunks
    }
  }

  if (pcmBuffers.length === 0) {
    return { lang, success: false, error: 'All chunks failed' };
  }

  // Concatenate all PCM buffers into single WAV
  const combined = Buffer.concat(pcmBuffers);
  const header = buildWavHeader(combined.length);
  writeFileSync(finalPath, Buffer.concat([header, combined]));

  const sizeMB = ((header.length + combined.length) / 1024 / 1024).toFixed(2);
  console.log(`\n  ✅ ${langName}: ${finalPath} (${sizeMB} MB, ${pcmBuffers.length}/${chunks.length} chunks OK)`);
  return { lang, success: true, path: finalPath };
}

// --------------- TRANSLATIONS ---------------
// Each text follows the SAME emotional cue pattern as the source Hindi.
// <exhales>, <slow>, <sniffles>, <soft> tags are preserved.

const SCRIPTS = {
  'hi-IN': `<exhales> क्या आपने कभी मंगल ग्रह को रात के आसमान में लाल रंग में चमकते देखा है? <slow> हज़ारों सालों से इंसान उसे देखकर सोचता आया है, कि वहाँ क्या होगा। क्या वहाँ कभी पानी था? क्या वहाँ कभी ज़िंदगी पनपी होगी? <sniffles> इन्हीं सवालों के जवाब ढूँढने के लिए इंसान अपने ग्रह से बाहर निकलने की हिम्मत करता है। <slow> इसी सोच से निकली है Mangalyaan की कहानी। नवंबर 2013 की बात है। श्रीहरिकोटा के launch pad से एक rocket ने उड़ान भरी। उसके अंदर था Mangalyaan, यानी भारत का पहला Mars orbiter mission। <slow> ये सफ़र आसान नहीं था। लगभग 300 दिनों से ज़्यादा का रास्ता तय करना था, और हर दिन यान को अपने रास्ते पर सही बने रहना था। <exhales> ज़मीन पर बैठी team हर पल उसकी हालत पर नज़र रखती रही। कहीं कोई छोटी सी गड़बड़ी भी पूरे mission को खतरे में डाल सकती थी। <slow> फिर आया वो पल। 24 सितंबर 2014 की सुबह। यान ने अपने engine चलाए, और मंगल की orbit में धीरे-धीरे दाखिल हो गया। <sniffles> उस पल ज़मीन पर बैठे लोगों की आँखें नम थीं, और सबके चेहरे पर एक ही भाव था, गर्व। <slow> भारत मंगल की orbit तक पहुँचने वाला पहला एशियाई देश बन गया। और इससे भी बड़ी बात ये, कि ये कामयाबी पहली ही कोशिश में मिली। <exhales> दुनिया के कई देश मंगल तक पहुँचने की कोशिश कर चुके थे, और उनमें से कई को शुरुआती असफलताओं का सामना करना पड़ा था। <slow> Mangalyaan ने ये साबित किया, कि सीमित संसाधनों में भी बड़ा सपना पूरा किया जा सकता है। <sniffles> ये सिर्फ़ एक machine की जीत नहीं थी। ये उन इंजीनियरों, वैज्ञानिकों और कारीगरों की जीत थी, जिन्होंने रात-दिन एक करके काम किया। <exhales> Mangalyaan ने मंगल की सतह और उसके वातावरण की तस्वीरें लीं, और वहाँ के कुछ गैसों की मौजूदगी की जाँच की, जिसमें methane भी शामिल है। <slow> यह जानकारी इसलिए अहम है, क्योंकि ये हमें बताती है कि मंगल की दुनिया कैसी है, और क्या वहाँ कभी ज़िंदगी के निशान रहे होंगे। <exhales> ये इंसान के उस बड़े सपने का हिस्सा है, कि हम ब्रह्मांड को समझें, और अपने ग्रह तक सीमित न रहें। <slow> Mangalyaan हमें एक बात सिखाता है। सपने बड़े हों, पर उन्हें पूरा करने के लिए सोच-समझकर और मेहनत से काम किया जाए। <exhales> सीमित बजट और सीमित संसाधनों में भी, अगर इरादा पक्का हो, तो दुनिया को चौंकाया जा सकता है। <slow> और सबसे खूबसूरत बात? इस mission ने लाखों बच्चों के मन में सवाल जगा दिए। किसी ने पूछा, "मंगल पर पानी कैसे ढूँढा जाता है?" किसी ने सोचा, "मैं भी एक दिन scientist बनूँगा।" <soft> शायद यही असली कामयाबी है। <slow> तो अगली बार जब लाल रंग का मंगल आसमान में दिखे, तो उसे सिर्फ़ एक चमकता तारा मत समझिएगा। वो एक नया सफ़र है, जो इंसान ने शुरू किया है। और वो सफ़र हम सबका है।`,

  'en-IN': `<exhales> Have you ever seen Mars glowing red in the night sky? <slow> For thousands of years, humans have gazed at it and wondered — what could be there? Was there ever water? Could life have once bloomed on that distant world? <sniffles> Driven by these very questions, humanity dared to step beyond its own planet. <slow> And from that courage was born the story of Mangalyaan. It was November 2013. A rocket lifted off from the launchpad at Sriharikota. Inside it rested Mangalyaan — India's first Mars Orbiter Mission. <slow> The journey was anything but easy. The spacecraft had to travel more than three hundred days through the silent void of space, staying perfectly on course every single day. <exhales> Back on the ground, a dedicated team kept a watchful eye every moment. Even the smallest error could have put the entire mission in jeopardy. <slow> Then came that moment. The morning of 24 September 2014. The spacecraft fired its engines and gently slipped into orbit around Mars. <sniffles> In that instant, the eyes of the scientists on the ground filled with tears, and every face wore a single expression — pride. <slow> India became the first Asian nation to reach the orbit of Mars. And what made it even more extraordinary — this success came on the very first attempt. <exhales> Many nations had tried to reach Mars before, and several had faced failure after failure in their early efforts. <slow> Mangalyaan proved that even with limited resources, the greatest of dreams can be made real. <sniffles> This was not merely a machine's victory. It was the victory of engineers, scientists, and craftspeople who worked day and night without rest. <exhales> Mangalyaan captured images of the Martian surface and atmosphere, and studied the presence of certain gases there, including methane. <slow> This information is precious because it tells us what Mars is truly like — and whether signs of life may once have existed there. <exhales> It is part of humanity's greatest dream — to understand the universe, and to no longer be confined to a single planet. <slow> Mangalyaan teaches us one enduring lesson. Dream big, but pursue those dreams with careful thought and honest hard work. <exhales> Even with a limited budget and limited resources, if the resolve is firm, the world can be astonished. <slow> And the most beautiful part? This mission ignited questions in millions of young minds. Some asked, "How do you search for water on Mars?" Others thought, "I too will become a scientist one day." <soft> Perhaps that is the truest success of all. <slow> So the next time you see that red glow of Mars in the sky, do not think of it as just another distant star. It is a new journey that humanity has begun. And that journey belongs to all of us.`,

  'ta-IN': `<exhales> இரவு வானில் செவ்வாய் கிரகம் சிவப்பு நிறத்தில் மிளிர்வதை நீங்கள் பார்த்ததுண்டா? <slow> ஆயிரக்கணக்கான ஆண்டுகளாக மனிதர்கள் அதை பார்த்து ஒரே கேள்வியை கேட்டுக்கொண்டே இருந்தார்கள் — அங்கே என்ன இருக்கும்? ஒருகாலத்தில் நீர் இருந்ததா? உயிரினங்கள் வாழ்ந்திருக்குமா? <sniffles> இந்தக் கேள்விகளுக்கான விடைகளை தேடி, மனிதன் தன் கிரகத்தை விட்டு வெளியே செல்லும் தைரியம் காட்டினான். <slow> அந்தத் தைரியத்திலிருந்தே மங்கள்யான் கதை பிறந்தது. 2013 நவம்பர் மாதம். ஸ்ரீஹரிகோட்டா ஏவுதளத்திலிருந்து ஒரு ராக்கெட் விண்ணை நோக்கிப் பறந்தது. அதன் உள்ளே இருந்தது மங்கள்யான் — இந்தியாவின் முதல் செவ்வாய்க் கோள் சுற்றுப்பாதை வாகனம். <slow> இந்த பயணம் எளிதானதல்ல. விண்கலம் 300 நாட்களுக்கும் மேலாக தன் பாதையில் சரியாக பயணிக்க வேண்டியிருந்தது. <exhales> தரையில் இருந்த குழுவினர் ஒவ்வொரு நிமிடமும் அதன் நிலையை கண்காணித்தனர். ஒரு சிறிய தவறு கூட முழு திட்டத்தையும் ஆபத்தில் ஆழ்த்தியிருக்கும். <slow> பிறகு அந்த நிமிடம் வந்தது. 2014 செப்டம்பர் 24 காலை. விண்கலம் தன் என்ஜின்களை இயக்கி, செவ்வாயின் சுற்றுப்பாதையில் நுழைந்தது. <sniffles> அந்த நொடியில் தரையில் இருந்தவர்களின் கண்கள் கலங்கின, முகங்களில் ஒரே ஒரு உணர்வு — பெருமை. <slow> செவ்வாயை சுற்றுப்பாதையில் அடைந்த முதல் ஆசிய நாடாக இந்தியா உயர்ந்தது. இன்னும் சிறந்தது என்னவென்றால் — இது முதல் முயற்சியிலேயே வெற்றி பெற்றது. <exhales> பல நாடுகள் செவ்வாயை அடைய முயற்சித்திருந்தன, பலர் ஆரம்பத்தில் தோல்விகளை சந்தித்திருந்தனர். <slow> வரையறுக்கப்பட்ட வளங்களிலும் மாபெரும் கனவை நினைவாக்க முடியும் என்று மங்கள்யான் நிரூபித்தது. <sniffles> இது வெறும் ஒரு இயந்திரத்தின் வெற்றி மட்டுமல்ல. பகல் இரவாக உழைத்த பொறியாளர்கள், விஞ்ஞானிகள், தொழிலாளர்கள் அனைவரின் வெற்றி. <exhales> மங்கள்யான் செவ்வாயின் மேற்பரப்பு மற்றும் வளிமண்டலத்தின் படங்களை எடுத்தது, மீத்தேன் உட்பட சில வாயுக்களின் இருப்பை ஆய்வு செய்தது. <slow> இந்தத் தகவல்கள் செவ்வாயில் உயிரின் தடங்கள் இருந்தனவா என்பதை புரிந்துகொள்ள உதவுகின்றன. <exhales> பிரபஞ்சத்தை புரிந்துகொள்ள வேண்டும், ஒரு கிரகத்தோடு நின்றுவிடக்கூடாது என்பதே மனித இனத்தின் பெரிய கனவு. <slow> மங்கள்யான் நமக்கு ஒரு பாடம் கற்றுத்தருகிறது. கனவுகள் பெரிதாக இருக்கட்டும், ஆனால் சிந்தித்து, கடினமாக உழைத்து அவற்றை அடையுங்கள். <exhales> வரையறுக்கப்பட்ட பட்ஜெட்டிலும் வரையறுக்கப்பட்ட வளங்களிலும், உறுதி இருந்தால் உலகை ஆச்சரியப்படுத்தலாம். <slow> மிக அழகான விஷயம் என்னவென்றால்? இந்த திட்டம் கோடிக்கணக்கான குழந்தைகளின் மனத்தில் கேள்விகளை தூண்டியது. "செவ்வாயில் நீரை எப்படி கண்டுபிடிப்பார்கள்?" என்று சிலர் கேட்டனர். "நானும் ஒரு நாள் விஞ்ஞானி ஆவேன்" என்று சிலர் கனவு கண்டனர். <soft> அதுவே உண்மையான வெற்றி. <slow> எனவே அடுத்த முறை சிவப்பு செவ்வாயை வானில் காணும்போது, அதை வெறும் ஒரு நட்சத்திரமாக நினைக்காதீர்கள். அது மனிதன் தொடங்கிய ஒரு புதிய பயணம். அந்தப் பயணம் நம் அனைவருக்கும் உரியது.`,

  'te-IN': `<exhales> రాత్రి ఆకాశంలో అంగారకుడు ఎరుపు రంగులో మెరుస్తుండటం మీరు ఎప్పుడైనా చూశారా? <slow> వేల సంవత్సరాలుగా మానవులు అతనిని చూసి ఒకే ప్రశ్న అడుగుతూనే ఉన్నారు — అక్కడ ఏముంటుందో? ఎప్పుడైనా నీరు ఉందా? జీవం వర్ధిల్లి ఉంటుందా? <sniffles> ఈ ప్రశ్నలకు సమాధానాలు వెతుకుతూ, మానవుడు తన గ్రహాన్ని దాటి బయటికి వెళ్ళే ధైర్యం చేశాడు. <slow> అదే సాహసంతో మంగళ్యాన్ కథ పుట్టింది. నవంబర్ 2013 వ సంవత్సరం. శ్రీహరికోట లాంచ్‌పాడ్ నుండి ఒక రాకెట్ ఆకాశంలోకి దూసుకెళ్ళింది. దాని లోపల ఉంది మంగళ్యాన్ — భారతదేశపు తొలి అంగారక కక్ష్యా వాహనం. <slow> ఈ ప్రయాణం అస్సలు సులభమైనది కాదు. అంతరిక్ష నౌక 300 రోజులకంటే ఎక్కువ ప్రయాణించాల్సి వచ్చింది, ప్రతి రోజూ సరైన మార్గంలో ఉండాల్సింది. <exhales> భూమిపై ఉన్న జట్టు ప్రతి నిమిషం దాని స్థితిని పర్యవేక్షిస్తూనే ఉంది. చిన్న తప్పు కూడా మొత్తం మిషన్‌ను ప్రమాదంలో పెట్టేది. <slow> తర్వాత ఆ క్షణం వచ్చింది. సెప్టెంబర్ 24, 2014 ఉదయం. నౌక తన ఇంజన్లు మండించి, అంగారకుని కక్ష్యలోకి నెమ్మదిగా ప్రవేశించింది. <sniffles> ఆ క్షణంలో భూమిపై ఉన్న వారి కళ్ళు నీటితో నిండాయి, అందరి మొహాల్లో ఒకే భావన — గర్వం. <slow> అంగారకుని కక్ష్యకు చేరుకున్న మొదటి ఆసియా దేశంగా భారతదేశం అవతరించింది. ఇంకా గొప్ప విషయమేమిటంటే — ఈ విజయం మొదటి ప్రయత్నంలోనే వచ్చింది. <exhales> ప్రపంచంలోని అనేక దేశాలు అంగారకుని చేరుకోవడానికి ప్రయత్నించాయి, అనేకం ప్రారంభ వైఫల్యాలను చవిచూశాయి. <slow> పరిమిత వనరులతో కూడా గొప్ప కలలు నిజమవుతాయని మంగళ్యాన్ నిరూపించింది. <sniffles> ఇది కేవలం ఒక యంత్రం గెలుపు కాదు. రాత్రీ పగలూ అలుపెరగకుండా పనిచేసిన ఇంజనీర్లు, శాస్త్రవేత్తలు, కళాకారుల గెలుపు. <exhales> మంగళ్యాన్ అంగారక ఉపరితలం మరియు వాతావరణ చిత్రాలు తీసింది, మీథేన్ సహా అక్కడి కొన్ని వాయువుల ఉనికిని అధ్యయనం చేసింది. <slow> ఈ సమాచారం అంగారకుని నిజస్వరూపం ఏమిటి, అక్కడ జీవం గుర్తులు ఉన్నాయా అని అర్థం చేసుకోవడంలో సహాయపడుతుంది. <exhales> విశ్వాన్ని అర్థం చేసుకోవాలి, ఒక గ్రహానికే పరిమితం కాకూడదు అనేది మానవులందరి గొప్ప కల. <slow> మంగళ్యాన్ మనకు ఒక పాఠం నేర్పుతుంది. కలలు పెద్దవిగా ఉండనీ, కానీ ఆలోచించి, కష్టపడి వాటిని సాధించండి. <exhales> పరిమిత బడ్జెట్‌లో, పరిమిత వనరులతో కూడా, సంకల్పం బలంగా ఉంటే ప్రపంచాన్ని ఆశ్చర్యపరచవచ్చు. <slow> అన్నింటికంటే అందమైన విషయమేమిటంటే? ఈ మిషన్ కోట్లాది పిల్లల మనసుల్లో ప్రశ్నలు రేకెత్తించింది. "అంగారకుడిపై నీటిని ఎలా వెతుకుతారు?" అని కొందరు అడిగారు. "నేను కూడా ఒక రోజు శాస్త్రవేత్త అవుతాను" అని కొందరు కలలు కన్నారు. <soft> బహుశా అదే నిజమైన విజయం. <slow> కాబట్టి తదుపరిసారి ఆకాశంలో ఆ ఎరుపు అంగారకుని చూసినప్పుడు, అతనిని కేవలం ఒక మెరిసే నక్షత్రంగా భావించకండి. అది మానవుడు ప్రారంభించిన ఒక కొత్త ప్రయాణం. మరియు ఆ ప్రయాణం మనందరిది.`,

  'bn-IN': `<exhales> রাতের আকাশে মঙ্গল গ্রহকে লাল রঙে জ্বলজ্বল করতে দেখেছেন কখনো? <slow> হাজার হাজার বছর ধরে মানুষ ওটার দিকে তাকিয়ে একটাই প্রশ্ন মনে মনে ভেবেছে — ওখানে কী আছে? কোনোদিন কি জল ছিল? জীবন কি একদিন সেখানে ফুলে ফেঁপে উঠেছিল? <sniffles> এই প্রশ্নগুলোর উত্তর খুঁজতেই মানুষ নিজের গ্রহের বাইরে পা রাখার সাহস দেখিয়েছে। <slow> সেই সাহস থেকেই জন্ম নিয়েছে মঙ্গলযান-এর গল্প। ২০১৩ সালের নভেম্বর মাস। শ্রীহরিকোটার লঞ্চপ্যাড থেকে একটি রকেট আকাশের দিকে উড়ে গেল। তার ভেতরে ছিল মঙ্গলযান — ভারতের প্রথম মঙ্গল কক্ষপথ মিশন। <slow> এই যাত্রা মোটেও সহজ ছিল না। মহাকাশযানকে ৩০০ দিনেরও বেশি সময় সঠিক পথে চলতে হয়েছিল। <exhales> মাটিতে থাকা দলটি প্রতিটি মুহূর্তে তার অবস্থা পর্যবেক্ষণ করছিল। একটুখানি ভুলও পুরো মিশনকে বিপদে ফেলতে পারত। <slow> তারপর এলো সেই মুহূর্ত। ২০১৪ সালের ২৪ সেপ্টেম্বরের সকাল। মহাকাশযান তার ইঞ্জিন চালু করে ধীরে ধীরে মঙ্গলের কক্ষপথে প্রবেশ করল। <sniffles> সেই মুহূর্তে মাটিতে থাকা মানুষদের চোখ ভিজে উঠল, আর সকলের মুখে একটাই ভাব — গর্ব। <slow> মঙ্গলের কক্ষপথে পৌঁছানো প্রথম এশিয়ান দেশ হিসেবে ভারত নিজেকে প্রতিষ্ঠিত করল। আরও বড় কথা — এই সাফল্য প্রথম চেষ্টাতেই এলো। <exhales> পৃথিবীর অনেক দেশ মঙ্গলে পৌঁছানোর চেষ্টা করেছিল, অনেককে প্রথম প্রথম ব্যর্থতার মুখে পড়তে হয়েছিল। <slow> মঙ্গলযান প্রমাণ করেছিল যে সীমিত সম্পদেও বড় স্বপ্নকে সত্যি করা যায়। <sniffles> এটা কেবল একটি যন্ত্রের জয় ছিল না। এটা সেই সব ইঞ্জিনিয়ার, বিজ্ঞানী আর কারিগরদের জয় ছিল, যারা দিনরাত একনিষ্ঠভাবে কাজ করেছিলেন। <exhales> মঙ্গলযান মঙ্গলের পৃষ্ঠ ও বায়ুমণ্ডলের ছবি তুলেছিল এবং সেখানকার কিছু গ্যাসের উপস্থিতি পরীক্ষা করেছিল, যার মধ্যে মিথেনও ছিল। <slow> এই তথ্য গুরুত্বপূর্ণ কারণ এটি বলে দেয় মঙ্গলের দুনিয়া আসলে কেমন, এবং সেখানে কখনো জীবনের চিহ্ন ছিল কিনা। <exhales> মহাবিশ্বকে বুঝতে হবে, একটা গ্রহের মধ্যে আটকে থাকলে চলবে না — এটাই মানবজাতির সবচেয়ে বড় স্বপ্ন। <slow> মঙ্গলযান আমাদের একটি শিক্ষা দেয়। স্বপ্ন বড় হোক, কিন্তু সেটা পূরণ করতে ভেবে-চিন্তে এবং পরিশ্রম করে এগিয়ে যেতে হবে। <exhales> সীমিত বাজেটে, সীমিত সম্পদে, যদি ইচ্ছাশক্তি দৃঢ় থাকে, তাহলে পৃথিবীকে অবাক করে দেওয়া যায়। <slow> আর সবচেয়ে সুন্দর কথা? এই মিশন কোটি কোটি শিশুর মনে প্রশ্নের ঝরনা বইয়ে দিয়েছে। কেউ জিজ্ঞেস করেছে, "মঙ্গলে জল কীভাবে খোঁজা হয়?" কেউ ভেবেছে, "আমিও একদিন বিজ্ঞানী হব।" <soft> এটাই হয়তো সত্যিকারের সাফল্য। <slow> তাই পরের বার যখন লাল মঙ্গলকে আকাশে দেখবেন, তখন ওটাকে শুধু একটা জ্বলজ্বলে তারা ভাববেন না। ওটা একটি নতুন যাত্রা, যা মানুষ শুরু করেছে। আর সেই যাত্রা আমাদের সবার।`,

  'kn-IN': `<exhales> ರಾತ್ರಿ ಆಕಾಶದಲ್ಲಿ ಮಂಗಳ ಗ್ರಹ ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿ ಹೊಳೆಯುವುದನ್ನು ನೀವು ಎಂದಾದರೂ ನೋಡಿದ್ದೀರಾ? <slow> ಸಾವಿರಾರು ವರ್ಷಗಳಿಂದ ಮಾನವರು ಅದನ್ನು ನೋಡಿ ಒಂದೇ ಪ್ರಶ್ನೆ ಕೇಳುತ್ತಾ ಬಂದಿದ್ದಾರೆ — ಅಲ್ಲಿ ಏನಿರಬಹುದು? ಎಂದಾದರೂ ನೀರು ಇತ್ತೇ? ಜೀವ ಅರಳಿರಬಹುದೇ? <sniffles> ಈ ಪ್ರಶ್ನೆಗಳ ಉತ್ತರ ಹುಡುಕಲೇ ಮಾನವ ತನ್ನ ಗ್ರಹದ ಆಚೆ ಹೋಗುವ ಧೈರ್ಯ ತೋರಿದ. <slow> ಅದೇ ಸಾಹಸದಿಂದ ಮಂಗಳ್ಯಾನ್ ಕಥೆ ಹುಟ್ಟಿತು. ನವೆಂಬರ್ 2013. ಶ್ರೀಹರಿಕೋಟಾದ ಉಡಾವಣಾ ತಾಣದಿಂದ ಒಂದು ರಾಕೆಟ್ ಆಕಾಶಕ್ಕೆ ನೆಗೆಯಿತು. ಅದರ ಒಳಗಿತ್ತು ಮಂಗಳ್ಯಾನ್ — ಭಾರತದ ಮೊದಲ ಮಂಗಳ ಕಕ್ಷೀಯ ಮಿಷನ್. <slow> ಈ ಪ್ರಯಾಣ ಸುಲಭವಾದದ್ದಲ್ಲ. ಬಾಹ್ಯಾಕಾಶ ನೌಕೆ 300 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಸರಿಯಾದ ಹಾದಿಯಲ್ಲಿ ಪ್ರಯಾಣಿಸಬೇಕಿತ್ತು. <exhales> ನೆಲದ ಮೇಲಿದ್ದ ತಂಡ ಪ್ರತಿ ಕ್ಷಣ ಅದರ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸುತ್ತಿತ್ತು. ಚಿಕ್ಕ ತಪ್ಪೂ ಸಹ ಇಡೀ ಮಿಷನ್ ಅನ್ನು ಅಪಾಯಕ್ಕೆ ದೂಡಬಹುದಿತ್ತು. <slow> ಆಮೇಲೆ ಆ ಕ್ಷಣ ಬಂತು. ಸೆಪ್ಟೆಂಬರ್ 24, 2014 ರ ಬೆಳಗ್ಗೆ. ನೌಕೆ ತನ್ನ ಇಂಜಿನ್ಗಳನ್ನು ಉರಿಸಿ ನಿಧಾನವಾಗಿ ಮಂಗಳದ ಕಕ್ಷೆಗೆ ಪ್ರವೇಶಿಸಿತು. <sniffles> ಆ ಕ್ಷಣ ನೆಲದ ಮೇಲಿದ್ದ ಜನರ ಕಣ್ಣು ತೇವವಾಯಿತು, ಎಲ್ಲರ ಮುಖದ ಮೇಲೆ ಒಂದೇ ಭಾವ — ಹೆಮ್ಮೆ. <slow> ಮಂಗಳದ ಕಕ್ಷೆಯನ್ನು ತಲುಪಿದ ಮೊದಲ ಏಷ್ಯಾ ರಾಷ್ಟ್ರವಾಗಿ ಭಾರತ ಹೊರಹೊಮ್ಮಿತು. ಇನ್ನೂ ಮಹತ್ವದ ವಿಷಯ — ಈ ಯಶಸ್ಸು ಮೊದಲ ಪ್ರಯತ್ನದಲ್ಲೇ ಬಂತು. <exhales> ಜಗತ್ತಿನ ಅನೇಕ ದೇಶಗಳು ಮಂಗಳಕ್ಕೆ ಹೋಗಲು ಪ್ರಯತ್ನಿಸಿದ್ದವು, ಹಲವು ಆರಂಭಿಕ ವೈಫಲ್ಯಗಳನ್ನು ಎದುರಿಸಿದ್ದವು. <slow> ಸೀಮಿತ ಸಂಪನ್ಮೂಲದಲ್ಲೂ ದೊಡ್ಡ ಕನಸನ್ನು ನನಸು ಮಾಡಬಹುದು ಎಂದು ಮಂಗಳ್ಯಾನ್ ಸಾಬೀತುಪಡಿಸಿತು. <sniffles> ಇದು ಕೇವಲ ಒಂದು ಯಂತ್ರದ ಗೆಲುವಲ್ಲ. ದಿನರಾತ್ರಿ ದುಡಿದ ಇಂಜಿನಿಯರ್‌ಗಳು, ವಿಜ್ಞಾನಿಗಳು, ಕಾರ್ಮಿಕರ ಗೆಲುವು. <exhales> ಮಂಗಳ್ಯಾನ್ ಮಂಗಳದ ಮೇಲ್ಮೈ ಮತ್ತು ವಾಯುಮಂಡಲದ ಚಿತ್ರಗಳನ್ನು ತೆಗೆಯಿತು, ಮೀಥೇನ್ ಸೇರಿದಂತೆ ಕೆಲ ಅನಿಲಗಳ ಇರುವಿಕೆಯನ್ನು ಅಧ್ಯಯನ ಮಾಡಿತು. <slow> ಮಂಗಳ ಯಾವ ರೀತಿಯ ಲೋಕ, ಅಲ್ಲಿ ಜೀವದ ಕುರುಹುಗಳಿದ್ದವೇ ಎಂಬುದನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಲು ಇದು ಮುಖ್ಯ. <exhales> ವಿಶ್ವವನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಬೇಕು, ಒಂದೇ ಗ್ರಹಕ್ಕೆ ಸೀಮಿತವಾಗಿ ಉಳಿಯಬಾರದು — ಇದೇ ಮಾನವ ಜಾತಿಯ ದೊಡ್ಡ ಕನಸು. <slow> ಮಂಗಳ್ಯಾನ್ ನಮಗೊಂದು ಪಾಠ ಕಲಿಸುತ್ತದೆ. ಕನಸುಗಳು ದೊಡ್ಡದಾಗಿರಲಿ, ಆದರೆ ಯೋಚಿಸಿ ಮತ್ತು ಶ್ರಮಪಟ್ಟು ಅವನ್ನು ಸಾಧಿಸಿ. <exhales> ಸೀಮಿತ ಬಜೆಟ್‌ನಲ್ಲಿ, ಸೀಮಿತ ಸಂಪನ್ಮೂಲದಲ್ಲಿ, ಸಂಕಲ್ಪ ದೃಢವಾಗಿದ್ದರೆ ಜಗತ್ತನ್ನೇ ಚಕಿತಗೊಳಿಸಬಹುದು. <slow> ಇನ್ನೊಂದು ಸುಂದರ ಸಂಗತಿ? ಈ ಮಿಷನ್ ಕೋಟ್ಯಂತರ ಮಕ್ಕಳ ಮನಸ್ಸಿನಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕಿತು. "ಮಂಗಳದಲ್ಲಿ ನೀರು ಹೇಗೆ ಹುಡುಕುತ್ತಾರೆ?" ಎಂದು ಕೆಲವರು ಕೇಳಿದರು. "ನಾನೂ ಒಂದು ದಿನ ವಿಜ್ಞಾನಿ ಆಗುತ್ತೇನೆ" ಎಂದು ಕೆಲವರು ಕನಸು ಕಂಡರು. <soft> ಅದೇ ನಿಜವಾದ ಯಶಸ್ಸು ಇರಬಹುದು. <slow> ಆದ್ದರಿಂದ ಮುಂದಿನ ಬಾರಿ ಆಕಾಶದಲ್ಲಿ ಕೆಂಪು ಮಂಗಳ ಕಾಣಿಸಿಕೊಂಡಾಗ, ಅದನ್ನು ಕೇವಲ ಒಂದು ಮಿನುಗು ನಕ್ಷತ್ರ ಎಂದು ಭಾವಿಸಬೇಡಿ. ಅದು ಮಾನವ ಪ್ರಾರಂಭಿಸಿದ ಒಂದು ಹೊಸ ಪ್ರಯಾಣ. ಮತ್ತು ಆ ಪ್ರಯಾಣ ನಮ್ಮೆಲ್ಲರದ್ದು.`
};

const LANG_NAMES = {
  'hi-IN': 'Hindi',
  'en-IN': 'English', 'ta-IN': 'Tamil', 'te-IN': 'Telugu',
  'bn-IN': 'Bengali', 'kn-IN': 'Kannada'
};

async function generate() {
  const results = [];

  for (const [lang, text] of Object.entries(SCRIPTS)) {
    console.log(`\n🎙️  Generating ${LANG_NAMES[lang]} (${lang})...`);
    const result = await generateForLang(lang, text, LANG_NAMES[lang]);
    results.push(result);
    // Small pause between languages
    if (result.success && !result.skipped) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log('\n📦 Summary:');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`  ${icon} ${LANG_NAMES[r.lang]} (${r.lang}): ${r.success ? (r.skipped ? 'skipped (exists)' : r.path) : r.error}`);
  });
}

generate().catch(console.error);
