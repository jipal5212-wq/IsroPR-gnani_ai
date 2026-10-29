/**
 * generate-nvs03-all-languages.js
 * Synthesizes studio audio for NVS-03 in English, Tamil, Telugu, Bengali, and Kannada
 * using Gnani TTS API (Shivani, timbre-v3.0) with emotion tags (<exhales>, <slow>, <sniffles>, <soft>).
 * Updates SQLite story_translations table with bodies and audio metadata.
 *
 * Run: node --env-file=.env scripts/generate-nvs03-all-languages.js
 */
import { synthesizeSpeech } from '../server/services/gnani/tts.js';
import { getDb } from '../server/db/db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../data/audio/stories/nvs-03');
mkdirSync(OUT_DIR, { recursive: true });

function splitIntoChunks(text, maxLen = 650) {
  const sentences = text.split(/(?<=[.?।।!])\s+(?=<|\S)/);
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

const SCRIPTS = {
  'en-IN': `<exhales> The story begins in 1999. In the frozen heights of Kargil, the Indian armed forces were fighting a fierce battle. <slow> Military commanders urgently required precision coordinates to locate enemy bunkers and guide our soldiers. India reached out to America for access to GPS. And America said no. <sniffles> On that fateful day, India's leaders realized the grave danger of relying on foreign technology. Someone else's system will always run on someone else's terms. <slow> That day, a sovereign dream was planted: India must build its own satellite navigation constellation, independent of anyone's permission.

<slow> From that resolute conviction rose NavIC — Navigation with Indian Constellation. In simple words, India's sovereign GPS. <exhales> Covering the entire Indian subcontinent and extending 1,500 kilometers beyond our borders, NavIC guides a soldier at the frontiers, a fisherman on the high seas, and civilian smartphones across our cities. <slow> But the road to sovereign navigation was fraught with heartbreak. NavIC requires a minimum of seven operational satellites for full coverage, and at least four for independent 3D positioning. Following satellite retirements, only three remained operational in the skies.

<exhales> Then came 29 January 2025. The GSLV-F15 rocket soared from Sriharikota, placing the 2,235-kilogram NVS-02 satellite into geosynchronous transfer orbit with pinpoint accuracy. The rocket had performed flawlessly. <sniffles> But then, the satellite had to fire its own Liquid Apogee Motor to raise itself into final geostationary orbit. That engine never roared to life. NVS-02 was stranded in an incomplete orbit — crores of rupees, revolving silently, unreachable.

<slow> ISRO launched an Apex Committee investigation. Weeks of forensic telemetry analysis revealed the silent culprit: a tiny pyrotechnic valve. <exhales> The pyro valve seals the propellant lines during liftoff. Once in space, an electrical firing pulse must detonate a miniature charge to open the valve and let oxidiser reach the engine. But a connector contact had separated under flight stress. The primary path failed, the backup path failed. <sniffles> A single dislodged electrical pin, and an entire national mission was lost.

<slow> Now ISRO stood at a historic crossroads for NVS-03. Should they repeat the same launch sequence and risk another valve glitch? <exhales> ISRO made a daring decision never before taken in its 51-year spaceflight history. <slow> For NVS-03, engineers fired the pyro valves open on the ground prior to launch! That electrical signal which failed in NVS-02 will never be needed in space — the oxidiser line is already wide open. <sniffles> The entire mission now depends on the downstream latch valves, thoroughly proven through exhaustive vibration, thermal, and shock qualifications.

<slow> Aboard NVS-03 sits another triumph of self-reliance: an indigenous Rubidium atomic clock designed by the Space Applications Centre in Ahmedabad. <exhales> In satellite navigation, time is distance — a mere microsecond drift causes a 300-meter positioning error. NVS-03 broadcasts on civilian L1 and L5 bands as well as high-security S-band frequencies. <slow> When GSLV-F18 lifts off from Sriharikota, its fiery plume carrying NVS-03 into the night sky will restore the fourth active satellite to the NavIC constellation. <soft> This is more than a rocket launch — it is India's unyielding belief in its own engineers, protecting our skies, our borders, and our sovereignty.`,

  'ta-IN': `<exhales> இந்தக் கதை 1999 ஆம் ஆண்டு கார்கில் போரிலிருந்து தொடங்குகிறது. <slow> பனிபடர்ந்த மலைகளில் நமது வீரர்கள் போராடிக் கொண்டிருந்த போது, எதிரிகளின் நிலைகளைத் துல்லியமாக அறிய அமெரிக்காவின் ஜிபிஎஸ் உதவியை இந்தியா கோரியது. ஆனால் அமெரிக்கா மறுத்துவிட்டது. <sniffles> பிற நாட்டின் தொழில்நுட்பத்தைச் சார்ந்து வாழ்வது எவ்வளவு ஆபத்தானது என்பதை இந்தியா அன்று உணர்ந்தது. <slow> அன்று ஒரு வைராக்கியம் பிறந்தது: பிறரின் அனுமதியை எதிர்பார்க்காத இந்தியாவின் சொந்த வழிகாட்டுதல் செயற்கைக்கோள் கட்டமைப்பு!

<slow> அந்த வைராக்கியத்திலிருந்து உருவானதுதான் நாவிக் (NavIC) — இந்தியாவின் சொந்த ஜிபிஎஸ். <exhales> இந்திய நிலப்பரப்பு மற்றும் எல்லையிலிருந்து 1,500 கிலோமீட்டர் சுற்றளவுக்குத் துல்லியமான இருப்பிடத்தைக் காட்டும் இந்த அமைப்பு, எல்லையில் நிற்கும் ராணுவ வீரர் முதல் கடலில் மீன்பிடிக்கும் மீனவர் வரை அனைவருக்கும் வழிகாட்டுகிறது. <slow> ஆனால் இந்தப் பயணம் எளிதானதாக இருக்கவில்லை. நாவிக் அமைப்பு சரியாகச் செயல்பட குறைந்தது நான்கு செயற்கைக்கோள்கள் தேவைப்படும் நிலையில், பழைய செயற்கைக்கோள்கள் செயலிழந்ததால் மூன்றே செயற்கைக்கோள்கள் மட்டுமே இயங்கின.

<exhales> 2025 ஜனவரியில் ஏவப்பட்ட என்விஎஸ்-02 செயற்கைக்கோள் ராக்கெட்டிலிருந்து வெற்றிகரமாகப் பிரிந்தும், அதன் எஞ்சின் இயங்கவே இல்லை. <sniffles> பல நூறு கோடி ரூபாய் மதிப்புள்ள செயற்கைக்கோள் விண்வெளியில் பயனற்றுக் கிடந்தது. இஸ்ரோவின் விரிவான ஆய்வில், பைரோ வால்வு திறப்பதற்கான மின் சமிக்ஞை ஒரு சிறிய இணைப்பான் கழன்றதால் வால்வை அடையவில்லை என்பது தெரியவந்தது.

<slow> இப்போது என்விஎஸ்-03 ஏவுதலில் இஸ்ரோ தனது 51 ஆண்டு கால வரலாற்றில் இதுவரை எடுத்திராத ஒரு துணிச்சலான முடிவை எடுத்தது. <exhales> ஏவுவதற்கு முன்பாகவே தரையிலேயே பைரோ வால்வை வெடிக்கச் செய்து திறந்துவிட்டனர்! <slow> விண்வெளியில் மின் சமிக்ஞை தோல்வியடையும் வாய்ப்பே இனி இல்லை. மேலும் இதில் அகமதாபாத் விண்வெளி பயன்பாட்டு மையம் உள்நாட்டிலேயே தயாரித்த அதிநவீன ரூபிடியம் அணுக்கடிகாரம் பொருத்தப்பட்டுள்ளது. <soft> ஜிஎஸ்எல்வி-எஃப்18 ராக்கெட் மூலம் என்விஎஸ்-03 விண்ணில் பாயும்போது, இந்தியாவின் நாவிக் கட்டமைப்பு மீண்டும் முழு பலத்துடன் வானில் சுயாட்சி பெறும். இது இந்தியாவின் தொழில்நுட்ப சுதந்திரத்தின் அடையாளம்!`,

  'te-IN': `<exhales> ఈ కథ 1999 నాటి కార్గిల్ యుద్ధంతో మొదలవుతుంది. <slow> శత్రువుల స్థావరాలను ఖచ్చితంగా గుర్తించడానికి భారత సైన్యం అమెరికా జీపీఎస్ సహాయం కోరినప్పుడు, అమెరికా నిర్ద్వంద్వంగా తిరస్కరించింది. <sniffles> పరాయి దేశాల సాంకేతికతపై ఆధారపడటం ఎంత ప్రమాదకరమో భారతదేశం ఆ రోజు తెలుసుకుంది. <slow> ఎవరి అనుమతిపైనా ఆధారపడని స్వదేశీ నావిగేషన్ వ్యవస్థను నిర్ಮించాలనే గొప్ప సంకల్పం ఆ రోజే మొదలైంది.

<slow> ఆ సంకల్పం నుండి పుట్టిందే నావిక్ (NavIC) — భారతదేశపు స్వంత జీపీఎస్. <exhales> భారతదేశంతో పాటు సరిహద్దు దాటి 1,500 కిలోమీటర్ల మేర ఖచ్చితమైన స్థానాన్ని చూపే ఈ వ్యవస్థ మన రక్షణ రంగానికి వెన్నెముక. <slow> అయితే ఈ ప్రయాణంలో ఎన్నో అడ్డంకులు ఎదురయ్యాయి. నావిక్ పనిచేయడానికి కనీసం నాలుగు ఉపగ్రహాలు అవసరం కాగా, పాత ఉపగ్రహాలు ముగియడంతో మూడు మాత్రమే కక్ష్యలో మిగిలాయి.

<exhales> 2025 జనవరిలో ఎన్‌వీఎస్-02 ఉపగ్రహం జీఎస్ఎల్వీ ద్వారా కక్ష్యలోకి చేరినా, దాని ఇంజిన్ మండకపోవడంతో అక్కడే నిరుపయోగంగా మిగిలిపోయింది. <sniffles> దర్యాప్తులో పైరో వాల్వ్ ఓపెన్ కావాల్సిన ఎలక్ట్రికల్ కనెక్టర్ లూజ్ కావడం వల్లే ఆక్సిడైజర్ ఇంజిన్‌కు చేరలేదని తేలింది. ఒక చిన్న కనెక్టర్ వల్ల మొత్తం మిషన్ నిలిచిపోయింది.

<slow> ఇప్పుడు ఎన్‌వీఎస్-03 కోసం ఇస్రో 51 ఏళ్ల చరిత్రలోనే మునుపెన్నడూ లేని సాహసోపేత నిర్ణయం తీసుకుంది. <exhales> రాకెట్ ఎగరడానికి ముందే భూమిపైనే పైరో వాల్వ్‌ను ఫైర్ చేసి తెరిచి ఉంచారు! <slow> అంతరిక్షంలో సిగ్నಲ್ ఫెయిల్ అయ్యే ప్రమాదమే లేకుండా చేశారు. అహ్మదాబాద్ స్పేస్ అప్లికేషన్స్ సెంటర్ రూపొందించిన స్వదేశీ రుబీడియం అటామిక్ క్లాక్ ఈ ఉపగ్రహానికి గుండెకాయ వంటిది. <soft> జీఎస్ఎల్వీ-ఎఫ్18 ద్వారా ఎన్‌వీఎస్-03 అంతరిక్షంలోకి దూసుకెళ్తున్నప్పుడు, భారతదేశం తన స్వదేశీ నావిగేషన్ సామర్థ్యాన్ని గర్వంగా పునరుద్ధరించుకుంటుంది.`,

  'bn-IN': `<exhales> এই গল্প শুরু হয়েছিল ১৯৯৯ সালের কার্গিল যুদ্ধের রক্তক্ষয়ী দিনে। <slow> সীমান্তে শত্রুর সঠিক অবস্থান জানার জন্য ভারতীয় সেনা আমেরিকার কাছে জিপিএস সহায়তা চেয়েছিল। আর আমেরিকা সরাসরি তা অস্বীকার করে। <sniffles> সেদিন ভারত উপলব্ধি করেছিল, অন্যের প্রযুক্তির ওপর নির্ভর করা কতটা বিপজ্জনক। <slow> সেই কঠিন অভিজ্ঞতা থেকেই জন্ম নিয়েছিল এক দৃঢ় সংকল্প: ভারতের আকাশে গড়ে উঠবে নিজস্ব নেভিগেশন ব্যবস্থা, যা চলবে সম্পূর্ণ স্বনির্ভর শক্তিতে।

<slow> সেই সংকল্প থেকেই এলো নাভিক (NavIC) — ভারতের নিজস্ব জিপিএস। <exhales> সমগ্র ভারত এবং দেশের সীমান্ত ছাড়িয়ে ১,৫০০ কিলোমিটার পর্যন্ত নির্ভুল অবস্থান নির্দেশ করতে পারে এই ব্যবস্থা। <slow> কিন্তু পথটা সহজ ছিল না। স্বাধীনভাবে ত্রিমাত্রিক অবস্থান নির্ণয়ের জন্য কমপক্ষে চারটি সক্রিয় উপগ্রহ প্রয়োজন, অথচ পুরনো উপগ্রহগুলোর মেয়াদ শেষ হয়ে যাওয়ায় মহাকাশে মাত্র তিনটি উপগ্রহ অবশিষ্ট ছিল।

<exhales> ২০২৫ সালের ২৯ জানুয়ারি এনভিএস-০২ উপগ্রহটি রকেটের মাধ্যমে সফলভাবে উৎক্ষেপণ হলেও মহাকাশে তার ইঞ্জিন আর চালু হতে পারেনি। <sniffles> তদন্তে জানা যায়, ইঞ্জিনে অক্সিডাইজার পৌঁছানোর জন্য যে পাইরো ভালভ খোলার কথা ছিল, তার ইলেকট্রিক্যাল সংযোগ বিচ্ছিন্ন হয়ে পড়েছিল। একটি ছোট্ট সংযোগ বিচ্ছিন্ন হওয়ার কারণে পুরো অভিযান থমকে যায়।

<slow> এই পরিস্থিতিতে এনভিএস-০৩ অভিযানের জন্য ইসরো তাদের ৫১ বছরের ইতিহাসে প্রথমবার এক বৈপ্লবিক সিদ্ধান্ত নেয়। <exhales> উৎক্ষেপণের আগেই গ্রাউন্ডে পাইরো ভালভটি সক্রিয় করে খুলে রাখা হয়েছে! <slow> ফলে মহাকাশে সিগন্যাল ব্যর্থ হওয়ার কোনো ঝুঁকি আর রইল না। এর সাথে আমেদাবাদের স্পেস অ্যাপ্লিকেশন সেন্টারের তৈরি সম্পূর্ণ দেশীয় রুবিডিয়াম পারমাণবিক ঘড়ি যুক্ত করা হয়েছে। <soft> জিএসএলভি-এফ১৮ রকেটে চড়ে যখন এনভিএস-০৩ মহাকাশের দিকে উড়ে যাবে, তখন ভারতের আকাশে সম্পূর্ণ স্বনির্ভর নাভিক ব্যবস্থা আবার পূর্ণ শক্তিতে জেগে উঠবে।`,

  'kn-IN': `<exhales> ಈ ಕಥೆ ಶುರುವಾಗುವುದು 1999 ರ ಕಾರ್ಗಿಲ್ ಯುದ್ಧದಿಂದ. <slow> ಎತ್ತರದ ಬೆಟ್ಟಗಳಲ್ಲಿ ಭಾರತೀಯ ಸೇನೆ ಹೋರಾಡುತ್ತಿದ್ದಾಗ, ಶತ್ರುಗಳ ನಿಖರ ತಾಣ ತಿಳಿಯಲು ಅಮೆರಿಕದ ಜಿಪಿಎಸ್ ನೆರವು ಕೋರಲಾಗಿತ್ತು. ಆದರೆ ಅಮೆರಿಕ ನಿರಾಕರಿಸಿತು. <sniffles> ಪರರ ತಂತ್ರಜ್ಞಾನವನ್ನು ನೆಚ್ಚಿಕೊಂಡಿರುವುದು ಎಷ್ಟು ಅಪಾಯಕಾರಿ ಎಂದು ಅಂದು ಭಾರತಕ್ಕೆ ಮನವರಿಕೆಯಾಯಿತು. <slow> ಯಾರ ಅನುಮತಿಗೂ ಕಾಯದ ಸ್ವಂತ ಉಪಗ್ರಹ ಮಾರ್ಗದರ್ಶನ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿರ್ಮಿಸುವ ಸಂಕಲ್ಪ ಅಂದೇ ಹುಟ್ಟಿಕೊಂಡಿತು.

<slow> ಆ ಸಂಕಲ್ಪದಿಂದ ರೂಪುಗೊಂಡಿದ್ದೇ ನಾವಿಕ್ (NavIC) — ಭಾರತದ ಸ್ವದೇಶಿ ಜಿಪಿಎಸ್. <exhales> ಭಾರತ ಮತ್ತು ಗಡಿಯಿಂದ ಆಚೆಗೆ 1,500 ಕಿಲೋಮೀಟರ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ನಿಖರ ಮಾಹಿತಿ ನೀಡುವ ಈ ವ್ಯವಸ್ಥೆ, ಸೈನಿಕರಿಂದ ಹಿಡಿದು ಮೀನುಗಾರರವರೆಗೆ ಎಲ್ಲರಿಗೂ ದಾರಿದೀಪ. <slow> ಆದರೆ ನಾವಿಕ್ ಸರಾಗವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಲು ಕನಿಷ್ಠ ನಾಲ್ಕು ಉಪಗ್ರಹಗಳು ಬೇಕು, ಆದರೆ ಹಳೆಯ ಉಪಗ್ರಹಗಳ ನಿವೃತ್ತಿಯಿಂದ ಕೇವಲ ಮೂರು ಉಪಗ್ರಹಗಳು ಮಾತ್ರ ಆಕಾಶದಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದ್ದವು.

<exhales> ಜನವರಿ 2025 ರಲ್ಲಿ ಜಿಎಸ್‌ಎಲ್‌ವಿ ರಾಕೆಟ್ ಎನ್‌ವಿಎಸ್-02 ಉಪಗ್ರಹವನ್ನು ಕಕ್ಷೆಗೆ ತಲುಪಿಸಿತಾದರೂ, ಅದರ ಎಂಜಿನ್ ಎಂದಿಗೂ ಚಾಲನೆಯಾಗಲೇ ಇಲ್ಲ. <sniffles> ತನಿಖೆಯಲ್ಲಿ ಇಂಧನ ಪೂರೈಸುವ ಪೈರೋ ವಾಲ್ವ್ ತೆರೆಯಬೇಕಿದ್ದ ವೈರಿಂಗ್ ಸಂಪರ್ಕ ಕಳಚಿದ್ದೇ ಇದಕ್ಕೆ ಕಾರಣ ಎಂದು ತಿಳಿಯಿತು. ಒಂದು ಸಣ್ಣ ಸಂಪರ್ಕ ಕಡಿತದಿಂದ ಇಡೀ ಮಿಷನ್ ವಿಫಲವಾಯಿತು.

<slow> ಈ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಎನ್‌ವಿಎಸ್-03 ಗಾಗಿ ಇಸ್ರೋ ತನ್ನ 51 ವರ್ಷಗಳ ಇತಿಹಾಸದಲ್ಲೇ ಅತ್ಯಂತ ಧೀರ ನಿರ್ಧಾರ ಕೈಗೊಂಡಿತು. <exhales> ರಾಕೆಟ್ ಉಡಾವಣೆಗೆ ಮುನ್ನವೇ ನೆಲದ ಮೇಲೆಯೇ ಪೈರೋ ವಾಲ್ವ್‌ಗಳನ್ನು ತೆರೆದು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ! <slow> ಇದರಿಂದ ಬಾಹ್ಯಾಕಾಶದಲ್ಲಿ ಸಿಗ್ನಲ್ ವಿಫಲತೆಯ ಭಯವೇ ಇಲ್ಲ. ಅಹಮದಾಬಾದ್‌ನ ಸ್ಪೇಸ್ ಅಪ್ಲಿಕೇಷನ್ಸ್ ಸೆಂಟರ್ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ ಸ್ವದೇಶಿ ರುಬಿಡಿಯಮ್ ಪರಮಾಣು ಗಡಿಯಾರ ಇದರಲ್ಲಿದೆ. <soft> ಜಿಎಸ್‌ಎಲ್‌ವಿ-ಎಫ್18 ರಾಕೆಟ್ ಮೂಲಕ ಎನ್‌ವಿಎಸ್-03 ನಭಕ್ಕೆ ಚಿಮ್ಮಿದಾಗ, ಭಾರತದ ನಾವಿಕ್ ವ್ಯವಸ್ಥೆಯು ಪೂರ್ಣ ಸ್ವಾವಲಂಬನೆಯೊಂದಿಗೆ ಮತ್ತೆ ಮಿನುಗಲಿದೆ.`
};

const LANG_NAMES = {
  'en-IN': 'English',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'bn-IN': 'Bengali',
  'kn-IN': 'Kannada'
};

async function generateForLang(lang, text, langName) {
  const finalPath = path.join(OUT_DIR, `${lang}.wav`);

  // If already generated new audio (not the old 25.9MB Hindi placeholder), skip
  if (existsSync(finalPath)) {
    const size = statSync(finalPath).size;
    if (size !== 25942582 && size > 1000000) {
      console.log(`  ⏭️  ${langName}: already generated (${(size / 1024 / 1024).toFixed(2)} MB), skipping.`);
      const durationSec = Math.round((size - 44) / (24000 * 2));
      return { lang, path: finalPath, durationSec, body: text };
    }
  }

  const chunks = splitIntoChunks(text);
  console.log(`\n🎙️  Synthesizing ${langName} (${lang}) across ${chunks.length} chunks...`);

  const pcmBuffers = [];
  let chunkIdx = 0;

  for (const chunk of chunks) {
    chunkIdx++;
    const tmpPath = path.join(OUT_DIR, `.tmp-nvs03-${lang}-${chunkIdx}.wav`);
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
        // Pacing delay between calls
        await new Promise(r => setTimeout(r, 2500));
      } catch (err) {
        rmSync(tmpPath, { force: true });
        if (attempts < 3) {
          console.log(`\n    ⚠️ chunk ${chunkIdx} failed (attempt ${attempts}): ${err.message}. Waiting 6s...`);
          await new Promise(r => setTimeout(r, 6000));
        } else {
          console.error(`\n    ❌ chunk ${chunkIdx} failed permanently: ${err.message}`);
        }
      }
    }
  }

  if (pcmBuffers.length === 0) {
    throw new Error(`Failed to synthesize any audio for ${lang}`);
  }

  const combined = Buffer.concat(pcmBuffers);
  const header = buildWavHeader(combined.length);
  const finalWav = Buffer.concat([header, combined]);
  writeFileSync(finalPath, finalWav);

  const durationSec = Math.round(combined.length / (24000 * 2));
  const sizeMB = (finalWav.length / (1024 * 1024)).toFixed(2);
  console.log(`\n  ✅ ${langName} Complete: ${finalPath} (${sizeMB} MB, ${durationSec}s)`);

  return { lang, path: finalPath, durationSec, body: text };
}

async function main() {
  console.log(`🚀 Starting NVS-03 Multilingual Voice Generation...`);
  const db = getDb();

  for (const [lang, text] of Object.entries(SCRIPTS)) {
    const res = await generateForLang(lang, text, LANG_NAMES[lang]);

    // Update database translation
    const existing = db.prepare('SELECT story_id FROM story_translations WHERE story_id = ? AND lang = ?').get('nvs-03', lang);
    if (existing) {
      db.prepare(`
        UPDATE story_translations 
        SET body = ?, audio_path = ?, audio_status = 'ready', audio_duration_sec = ?
        WHERE story_id = 'nvs-03' AND lang = ?
      `).run(text, `/media/audio/stories/nvs-03/${lang}.wav`, res.durationSec, lang);
    } else {
      db.prepare(`
        INSERT INTO story_translations (story_id, lang, body, voice, audio_path, audio_status, audio_duration_sec)
        VALUES ('nvs-03', ?, ?, 'Shivani', ?, 'ready', ?)
      `).run(lang, text, `/media/audio/stories/nvs-03/${lang}.wav`, res.durationSec);
    }
    console.log(`  💾 Database updated for ${lang} (${res.durationSec}s)`);

    // Inter-language pacing
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\n🎉 ALL 5 LANGUAGES GENERATED & DATABASE UPDATED!`);
}

main().catch(err => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});
