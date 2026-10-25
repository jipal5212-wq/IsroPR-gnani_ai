import { getDb } from './db.js';
import { synthesizeSpeech } from '../services/gnani/tts.js';
import path from 'node:path';
import { DIRS } from '../config.js';

export async function seedDatabase() {
  console.log('🌱 Seeding Space Bharat stories and knowledge facts...');
  const db = getDb();

  // 1. Story 1: Chandrayaan-3
  const story1 = {
    id: 'chandrayaan-3',
    title: 'Chandrayaan-3: Historic Touchdown Near the Lunar South Pole',
    summary: 'On August 23, 2023, India became the first country to soft-land near the Moon\'s rugged South Pole. Discover how the Vikram lander and Pragyan rover conducted in-situ experiments on lunar soil.',
    category: 'isro',
    facts_as_of: '2023-08-23',
    sources: JSON.stringify(['https://www.isro.gov.in/Chandrayaan3.html']),
    duration_hint_min: 3,
    pinned: 1,
    published: 1
  };

  db.prepare(`
    INSERT INTO stories (id, title, summary, category, facts_as_of, sources, duration_hint_min, pinned, published)
    VALUES (@id, @title, @summary, @category, @facts_as_of, @sources, @duration_hint_min, @pinned, @published)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      published = excluded.published
  `).run(story1);

  const story1Translations = [
    {
      lang: 'en-IN',
      voice: 'Pranav',
      body: `On August 23, 2023, millions of hearts beat as one as the Indian Space Research Organisation's Chandrayaan-3 spacecraft executed a flawless soft landing on the Moon's South Pole. With this remarkable achievement, India became the fourth nation in history to land on the Moon and the very first to touch down near the challenging lunar south polar region.

The mission comprised the Vikram lander and the Pragyan rover. Vikram touched down smoothly at 18:04 Indian Standard Time. Soon after, the ramp deployed and Pragyan rolled down onto the lunar surface, imprinting ISRO's logo and the Ashoka Lion emblem into the ancient lunar regolith. Pragyan's Laser-Induced Breakdown Spectroscope confirmed the unambiguous presence of sulphur, along with aluminium, calcium, iron, and titanium. Chandrayaan-3 stands as an enduring tribute to India's scientific vision and engineering tenacity.`
    },
    {
      lang: 'hi-IN',
      voice: 'Nalini',
      body: `23 अगस्त 2023 को भारत ने इतिहास के पन्नों में अपना नाम स्वर्णिम अक्षरों से दर्ज कराया। इसरो के चंद्रयान-3 ने चंद्रमा के दक्षिणी ध्रुव पर सफल और सुरक्षित सॉफ्ट लैंडिंग की। इसके साथ ही भारत चंद्रमा के दक्षिणी ध्रुव पर कदम रखने वाला दुनिया का पहला देश बन गया।

विक्रम लैंडर ने शाम 6 बजकर 4 मिनट पर चंद्रमा की धरती को छुआ। कुछ ही घंटों में प्रज्ञान रोवर लैंडर से बाहर निकला और उसने चंद्रमा की सतह पर भारत का राष्ट्रीय प्रतीक और इसरो का लोगो अंकित किया। प्रज्ञान ने चंद्रमा पर सल्फर, कैल्शियम और लोहे जैसे महत्वपूर्ण तत्वों की मौजूदगी की पुष्टि की। चंद्रयान-3 भारत के वैज्ञानिकों के अदम्य साहस और आत्मनिर्भरता का प्रतीक है।`
    },
    {
      lang: 'ta-IN',
      voice: 'Asmita',
      body: `ஆகஸ்ட் 23, 2023 அன்று, இந்திய விண்வெளி ஆராய்ச்சி நிறுவனமான இஸ்ரோவின் சந்திரயான்-3 விண்கலம், நிலவின் தென் துருவத்தில் வெற்றிகரமாக தரையிறங்கி புதிய வரலாறு படைத்தது. நிலவின் தென் துருவத்தில் தடம் பதித்த உலகின் முதல் நாடு என்ற பெருமையை இந்தியா பெற்றது.

விக்ரம் லேண்டர் மென்மையாக நிலவில் இறங்கியவுடன், பிரக்யான் ரோவர் வெளியேறி நிலவின் மண்ணில் ஆய்வு செய்தது. அசோக சின்னம் மற்றும் இஸ்ரோவின் முத்திரையை நிலவின் மேற்பரப்பில் பதித்த பிரக்யான், அங்கு கந்தகம் மற்றும் பிற கனிமங்கள் இருப்பதை உறுதி செய்தது. சந்திரயான்-3 நமது விஞ்ஞானிகளின் கடின உழைப்பிற்கு கிடைத்த மாபெரும் வெற்றியாகும்.`
    },
    {
      lang: 'te-IN',
      voice: 'Suhana',
      body: `ఆగస్టు 23, 2023న ఇస్రో ప్రయోగించిన చంద్రయాన్-3 చంద్రుని దక్షిణ ధ్రువంపై సురక్షితంగా దిగి సరికొత్త చరిత్ర సృష్టించింది. చంద్రుడి దక్షిణ ధ్రువంపై అడుగుపెట్టిన మొట్టమొదటి దేశంగా భారతదేశం అవతరించింది.

విక్రమ్ ల్యాండర్ దిగిన కొద్దిసేపటికే ప్రగ్యాన్ రోవర్ బయటకు వచ్చి చంద్రుని ఉపరితలంపై ప్రయాణించింది. అక్కడ సల్ఫర్ మరియు అల్యూమినియం వంటి మూలకాలను కనుగొని వివరాలను భూమికి పంపింది. భారతీయ శాస్త్రవేత్తల ప్రతిభకు చంద్రయాన్-3 తిరుగులేని నిదర్శనం.`
    },
    {
      lang: 'bn-IN',
      voice: 'Kirra',
      body: `২৩ আগস্ট ২০২৩ সালে ভারতীয় মহাকাশ গবেষণা সংস্থা ইসরো চন্দ্রযান-৩ এর সফল অবতরণ ঘটিয়ে চাঁদের দক্ষিণ মেরুতে পৌঁছানো বিশ্বের প্রথম দেশ হিসেবে ভারতের নাম উজ্জ্বল করল।

বিক্রম ল্যান্ডার চাঁদের মাটিতে পা রাখার পরই প্রজ্ঞান রোভার বেরিয়ে এসে চাঁদের মাটির পরীক্ষা শুরু করে। প্রজ্ঞানের পরীক্ষায় চাঁদে সালফার ও অন্যান্য গুরুত্বপূর্ণ খনিজের উপস্থিতি নিশ্চিত হয়। এই ঐতিহাসিক সাফল্য সমগ্র ভারতবাসীর এক গর্বের মুহূর্ত।`
    }
  ];

  // 2. Story 2: Agnikul Cosmos
  const story2 = {
    id: 'agnikul-cosmos-suborbital',
    title: 'Agnikul Cosmos: Agnibaan Rocket Sets New World Record',
    summary: 'Chennai-based spacetech startup Agnikul Cosmos launched Agnibaan SOrTeD, powered by the world\'s first single-piece 3D-printed semi-cryogenic rocket engine.',
    category: 'startup',
    facts_as_of: '2024-05-30',
    sources: JSON.stringify(['https://agnikul.in/']),
    duration_hint_min: 3,
    pinned: 0,
    published: 1
  };

  db.prepare(`
    INSERT INTO stories (id, title, summary, category, facts_as_of, sources, duration_hint_min, pinned, published)
    VALUES (@id, @title, @summary, @category, @facts_as_of, @sources, @duration_hint_min, @pinned, @published)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      published = excluded.published
  `).run(story2);

  const story2Translations = [
    {
      lang: 'en-IN',
      voice: 'Pranav',
      body: `On May 30, 2024, Indian private space sector achieved a watershed breakthrough. IIT Madras-incubated startup Agnikul Cosmos successfully launched their Agnibaan Sub-Orbital Technology Demonstrator from India's first private launchpad at Sriharikota.

What made this mission truly revolutionary was its propulsion: Agnilet, the world's very first single-piece 3D-printed semi-cryogenic rocket engine. Unlike conventional rocket engines assembled from hundreds of complex parts, Agnilet is printed as a monolithic component, slashing manufacturing time from months to mere days. Agnikul's success signals the dawn of rapid, on-demand satellite launches manufactured right here in India.`
    },
    {
      lang: 'hi-IN',
      voice: 'Nalini',
      body: `30 मई 2024 को भारत के निजी अंतरिक्ष क्षेत्र ने एक अभूतपूर्व उपलब्धि हासिल की। आईआईटी मद्रास के इनक्यूबेटेड स्टार्टअप अग्निकुल कॉस्मॉस ने श्रीहरिकोटा के पहले निजी लॉन्चपैड से अग्निबाण रॉकेट का सफल प्रक्षेपण किया।

इस रॉकेट की सबसे खास बात थी इसका इंजन 'अग्निलेट', जो दुनिया का पहला सिंगल-पीस 3डी-प्रिंटेड सेमी-क्रायोजेनिक रॉकेट इंजन है। जहां पारंपरिक रॉकेट इंजनों में सैकड़ों पुर्जे जोड़े जाते हैं, वहीं अग्निलेट को एक ही बार में प्रिंट किया गया। यह उपलब्धि भारत को वैश्विक वाणिज्यिक अंतरिक्ष बाजार में एक अग्रणी शक्ति बनाती है।`
    },
    {
      lang: 'ta-IN',
      voice: 'Asmita',
      body: `மே 30, 2024 அன்று, இந்தியாவின் தனியார் விண்வெளித் துறையில் அக்னிகுல் காஸ்மாஸ் நிறுவனம் ஒரு மாபெரும் மைல்கல்லை எட்டியது. சென்னை ஐஐடியில் உருவான இந்த நிறுவனம், ஸ்ரீஹரிகோட்டாவில் உள்ள இந்தியாவின் முதல் தனியார் ஏவுதளத்தில் இருந்து அக்னிபான் ராக்கெட்டை வெற்றிகரமாக விண்ணில் செலுத்தியது.

இந்த ராக்கெட்டின் அக்னிலெட் என்ஜின், உலகின் முதல் ஒற்றைத் துண்டு 3D பிரிண்ட் செய்யப்பட்ட செமி-கிரையோஜெனிக் என்ஜின் ஆகும். இது ராக்கெட் தயாரிப்பு நேரத்தை பல மாதங்களில் இருந்து சில நாட்களாகக் குறைக்கிறது.`
    },
    {
      lang: 'te-IN',
      voice: 'Suhana',
      body: `మే 30, 2024న భారత ప్రైవేట్ అంతరిక్ష రంగంలో అగ్నికుల్ కాస్మోస్ అద్భుతమైన విజయాన్ని సాధించింది. శ్రీహరికోటలోని భారతదేశపు మొదటి ప్రైవేట్ లాంచ్‌ప్యాడ్ నుండి అగ్నిబాణ్ రాకెట్‌ను విజయవంతంగా ప్రయోగించారు.

ప్రపంచంలోనే మొట్టమొদటి సింగిల్-పీస్ 3D-ప్రింటెడ్ సెమీ-క్రయోజెనిక్ ఇంజిన్ అయిన 'అగ్నిలెట్' ద్వారా ఈ రాకెట్ పనిచేస్తుంది. ఇది శాటిలైట్ ప్రయోగాలలో భారత సామర్థ్యాన్ని చాటిచెప్పింది.`
    },
    {
      lang: 'bn-IN',
      voice: 'Kirra',
      body: `৩০ মে ২০২৪-এ ভারতের বেসরকারি মহাকাশ ক্ষেত্রে এক বিরাট সাফল্য অর্জিত হয়। চেন্নাইয়ের স্টার্টআপ অগ্নিকুল কসমস শ্রীহরিকোটা থেকে অগ্নিবাণ রকেটটির সফল উৎক্ষেপণ করে।

এই রকেটের ইঞ্জিন অগ্নিলেট হলো বিশ্বের প্রথম একক-টুকরো থ্রি-ডি প্রিন্টেড সেমি-ক্রায়োজেনিক রকেট ইঞ্জিন। এটি মহাকাশ প্রযুক্তিতে ভারতের দ্রুত অগ্রগতির স্পষ্ট প্রমাণ।`
    }
  ];

  // Insert all translations and generate simulated or real cached audio
  const insertTrans = db.prepare(`
    INSERT INTO story_translations (story_id, lang, body, voice, reviewed, audio_status, audio_path, audio_duration_sec)
    VALUES (?, ?, ?, ?, 1, 'ready', ?, ?)
    ON CONFLICT(story_id, lang) DO UPDATE SET
      body = excluded.body,
      voice = excluded.voice,
      reviewed = 1,
      audio_status = 'ready',
      audio_path = excluded.audio_path,
      audio_duration_sec = excluded.audio_duration_sec
  `);

  for (const t of story1Translations) {
    const audioFilePath = path.join(DIRS.AUDIO_STORIES, 'chandrayaan-3', `${t.lang}.mp3`);
    await synthesizeSpeech({ text: t.body, lang: t.lang, voice: t.voice, targetPath: audioFilePath });
    insertTrans.run('chandrayaan-3', t.lang, t.body, t.voice, `/media/audio/stories/chandrayaan-3/${t.lang}.mp3`, 150);
  }

  for (const t of story2Translations) {
    const audioFilePath = path.join(DIRS.AUDIO_STORIES, 'agnikul-cosmos-suborbital', `${t.lang}.mp3`);
    await synthesizeSpeech({ text: t.body, lang: t.lang, voice: t.voice, targetPath: audioFilePath });
    insertTrans.run('agnikul-cosmos-suborbital', t.lang, t.body, t.voice, `/media/audio/stories/agnikul-cosmos-suborbital/${t.lang}.mp3`, 140);
  }

  // 3. Knowledge Base Facts for RAG
  const facts = [
    {
      title: 'Chandrayaan-3 Touchdown Coordinates & Time',
      body: 'Chandrayaan-3 soft-landed on August 23, 2023, at 18:04 IST near the lunar South Pole at coordinates 69.37 S, 32.35 E, between Manzinus C and Simpelius N craters.',
      category: 'isro-missions',
      source_url: 'https://www.isro.gov.in/Chandrayaan3.html',
      as_of: '2023-08-23'
    },
    {
      title: 'Aditya-L1 Halo Orbit Insertion',
      body: 'Aditya-L1 was successfully placed into a halo orbit around the Sun-Earth Lagrange Point 1 (L1) on January 6, 2024, approximately 1.5 million km from Earth, to observe the solar corona and flares continuously without eclipses.',
      category: 'solar-missions',
      source_url: 'https://www.isro.gov.in/Aditya_L1.html',
      as_of: '2024-01-06'
    },
    {
      title: 'Gaganyaan Human Spaceflight Mission Profile',
      body: 'The Gaganyaan mission aims to demonstrate human spaceflight capability to low Earth orbit (400 km) for a 3-day mission with 3 crew members and safe return to Indian sea waters.',
      category: 'human-spaceflight',
      source_url: 'https://www.isro.gov.in/Gaganyaan.html',
      as_of: '2024-02-27'
    },
    {
      title: 'Agnikul Cosmos Agnilet 3D Printed Engine',
      body: 'Agnilet is the world\'s first single-piece 3D printed semi-cryogenic engine, utilizing aviation turbine fuel and liquid oxygen, developed and launched by Indian startup Agnikul Cosmos.',
      category: 'startups',
      source_url: 'https://agnikul.in/',
      as_of: '2024-05-30'
    },
    {
      title: 'Skyroot Aerospace Vikram-S Launch',
      body: 'Skyroot Aerospace launched India\'s first privately developed rocket, Vikram-S, under Mission Prarambh on November 18, 2022, reaching an altitude of 89.5 km.',
      category: 'startups',
      source_url: 'https://skyroot.in/',
      as_of: '2022-11-18'
    }
  ];

  const insertFact = db.prepare(`
    INSERT INTO knowledge (title, body, category, source_url, as_of)
    VALUES (@title, @body, @category, @source_url, @as_of)
  `);

  for (const f of facts) {
    const existing = db.prepare('SELECT id FROM knowledge WHERE title = ?').get(f.title);
    if (!existing) {
      insertFact.run(f);
    }
  }

  console.log('✅ Seeding complete! 2 rich multilingual stories and 5 knowledge facts seeded.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(console.error);
}
