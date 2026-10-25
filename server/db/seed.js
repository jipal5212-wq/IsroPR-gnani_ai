import { getDb } from './db.js';
import { synthesizeSpeech } from '../services/gnani/tts.js';
import path from 'node:path';
import { DIRS } from '../config.js';

export async function seedDatabase() {
  console.log('🌱 Seeding rich IsroPR stories and comprehensive ISRO knowledge base...');
  const db = getDb();

  // ============================================================
  // 1. STORY: Chandrayaan-3 (ISRO Mission)
  // ============================================================
  const story1 = {
    id: 'chandrayaan-3',
    title: 'Chandrayaan-3: 15 Minutes of Terror & The South Pole Triumph',
    summary: 'On August 23, 2023, India captivated the world as the Vikram lander descended through 15 heart-stopping minutes of autonomous braking to soft-land near the Moon\'s South Pole.',
    category: 'isro',
    facts_as_of: '2023-08-23',
    sources: JSON.stringify(['https://www.isro.gov.in/Chandrayaan3.html']),
    duration_hint_min: 4,
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
      facts_as_of = excluded.facts_as_of,
      sources = excluded.sources,
      duration_hint_min = excluded.duration_hint_min,
      pinned = excluded.pinned,
      published = excluded.published
  `).run(story1);

  const story1Translations = [
    {
      lang: 'en-IN',
      voice: 'Pranav',
      body: `Picture this: August 23, 2023. In the mission operations complex in Bengaluru, scientists sat in pin-drop silence. Millions across the nation held their breath. Four years earlier, Chandrayaan-2 had crashed into the lunar surface at the final second. This time, there was zero room for error.

At exactly 17:44 Indian Standard Time, the Vikram lander fired its four throttleable engines 30 kilometers above the Moon. This was the famous fifteen minutes of terror. Vikram was flying completely on its own, guided by laser Doppler velocimeters and hazard avoidance cameras. Step by step, it killed horizontal velocity, transitioned to vertical descent, hovered gently over cratered shadows, and touched down like a feather on the lunar South Pole!

Within hours, the ramp slid open. Pragyan, the six-wheeled rover, rolled down onto the lunar dust, permanently stamping the Ashoka Lion and ISRO's logo into the regolith. Its lasers beamed back scientific proof of sulphur, aluminum, calcium, and iron. India had not just reached the Moon; India was the very first nation to touch down at the lunar South Pole!`
    },
    {
      lang: 'hi-IN',
      voice: 'Nalini',
      body: `23 अगस्त 2023 की वो ऐतिहासिक शाम, जिसे कोई भी भारतवासी कभी नहीं भूल सकता। बेंगलुरु के मिशन कंट्रोल रूम में सुई गिरने जैसी शांति थी। चार साल पहले चंद्रयान-2 की लैंडिंग में आई रुकावट के बाद, इस बार वैज्ञानिकों ने लैंडर के पैरों से लेकर सॉफ्टवेयर तक हर चीज को अभेद्य बनाया था।

शाम 5 बजकर 44 मिनट पर चंद्रमा से 30 किलोमीटर ऊपर विक्रम लैंडर के इंजनों ने फायर किया। यह वही दिल की धड़कनें थाम देने वाले '15 मिनट्स ऑफ टेरर' थे। लैंडर पूरी तरह अपने ऑन-बोर्ड कंप्यूटर के दम पर नीचे आ रहा था। उसने एक-एक करके अपनी रफ्तार कम की, गड्ढों से बचते हुए जगह चुनी, और 6 बजकर 4 मिनट पर चंद्रमा के दक्षिणी ध्रुव पर तिरंगा लहरा दिया!

इसके बाद जब प्रज्ञान रोवर बाहर निकला, तो उसने चांद की धूल पर भारत के राष्ट्रीय प्रतीक अशोक स्तंभ और इसरो का निशान हमेशा-हमेशा के लिए अंकित कर दिया। चंद्रयान-3 ने साबित कर दिया कि जब हौसले बुलंद हों, तो चांद भी दूर नहीं होता!`
    },
    {
      lang: 'ta-IN',
      voice: 'Asmita',
      body: `ஆகஸ்ட் 23, 2023 அன்று, இந்திய விண்வெளி வரலாற்றில் பொன்னெழுத்துக்களால் பொறிக்கப்பட்ட ஒரு நாள். பெங்களூரு கட்டுப்பாட்டு மையத்தில் விஞ்ஞானிகள் தீவிர அமைதியுடன் திரையை உற்று நோக்கிக் கொண்டிருந்தனர். 

சந்திரயான்-3 விண்கலத்தின் விக்ரம் லேண்டர், நிலவின் தென் துருவத்தில் மிகவும் துல்லியமாக மென்மையாகத் தரை இறங்கியது. லேண்டரிலிருந்து வெளியே வந்த பிரக்யான் ரோவர், நிலவின் மேற்பரப்பில் இஸ்ரோவின் சின்னத்தையும் இந்தியாவின் தேசிய சின்னத்தையும் பதித்தது. நிலவின் தென் துருவத்தில் கால் பதித்த முதல் நாடு என்ற பெருமையை இந்தியா உலகுக்கு உணர்த்தியது!`
    },
    {
      lang: 'te-IN',
      voice: 'Suhana',
      body: `ఆగస్టు 23, 2023న భారతదేశం సగర్వంగా తలెత్తుకున్న క్షణం. చంద్రయాన్-3 ద్వారా విక్రమ్ ల్యాండర్ చంద్రుని దక్షిణ ధ్రువంపై అత్యంత సురక్షితంగా కాలుమోపింది. 

ల్యాండింగ్ సమయంలోని ఉత్కంఠభరితమైన 15 నిమిషాలను తట్టుకుని, విక్రమ్ ల్యాండర్ చారిత్రక ఘనత సాధించింది. ప్రగ్యాన్ రోవర్ బయటకు వచ్చి చంద్రుడి నేలపై మన మువ్వన్నెల జెండా గౌరవాన్ని నిలిపింది. చంద్రుని దక్షిణ ధ్రువానికి చేరుకున్న తొలి దేశంగా భారత్ చరిత్రకెక్కింది!`
    },
    {
      lang: 'bn-IN',
      voice: 'Kirra',
      body: `২৩ আগস্ট ২০২৩, এক অবিস্মরণীয় ঐতিহাসিক দিন। ইসরোর চন্দ্রযান-৩ চাঁদের দক্ষিণ মেরুতে সফল সফট ল্যান্ডিং করে বিশ্বকে তাক লাগিয়ে দেয়। 

সেই উত্তেজনাকর ১৫ মিনিটের ব্র্যাকিং ধাপ পেরিয়ে বিক্রম ল্যান্ডার আলতো করে চাঁদের মাটি স্পর্শ করে। তারপর প্রজ্ঞান রোভার চাঁদের মাটিতে অশোক চক্রের ছাপ এঁকে প্রমাণ করে দিল ভারতীয় বিজ্ঞানের অপার শক্তি!`
    }
  ];

  // ============================================================
  // 2. STORY: Agnikul Cosmos (Startups)
  // ============================================================
  const story2 = {
    id: 'agnikul-cosmos-suborbital',
    title: 'Agnikul Cosmos: 3D-Printing Rocket Engines in Days',
    summary: 'From an incubation room at IIT Madras to a private launchpad at Sriharikota, Agnikul Cosmos stunned the global space industry by 3D-printing an entire cryogenic rocket engine in one single piece.',
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
      facts_as_of = excluded.facts_as_of,
      sources = excluded.sources,
      duration_hint_min = excluded.duration_hint_min,
      pinned = excluded.pinned,
      published = excluded.published
  `).run(story2);

  const story2Translations = [
    {
      lang: 'en-IN',
      voice: 'Pranav',
      body: `Traditional rocket engines are engineering nightmares: thousands of intricate pipes, welds, and valves that take months of skilled machining. But young aerospace engineers at Chennai's Agnikul Cosmos asked a daring question: Why assemble hundreds of pieces when you can print the entire engine in one single continuous block of metal?

That audacity gave birth to Agnilet, the world's very first single-piece 3D-printed semi-cryogenic engine. And on May 30, 2024, their Agnibaan rocket lifted off from India's first-ever private launchpad, Dhanush, at Sriharikota. Agnikul proved that Indian startups aren't just following global trends; they are reinventing how rockets are made, making satellite launches rapid, customizable, and remarkably affordable!`
    },
    {
      lang: 'hi-IN',
      voice: 'Nalini',
      body: `पारंपरिक रॉकेट इंजन बनाना बेहद जटिल काम माना जाता है, जिसमें सैकड़ों पुर्जों और महीनों की वेल्डिंग लगती है। लेकिन आईआईटी मद्रास के स्टार्टअप अग्निकुल कॉस्मॉस ने इस सोच को पूरी तरह बदल दिया।

उन्होंने बनाया 'अग्निलेट'—दुनिया का पहला सिंगल-पीस 3डी प्रिंटेड सेमी-क्रायोजेनिक रॉकेट इंजन! और 30 मई 2024 को श्रीहरिकोटा के भारत के पहले निजी लॉन्चपैड से अग्निबाण रॉकेट ने आसमान को चीरते हुए उड़ान भरी। अग्निकुल ने साबित कर दिया कि भारत का युवा स्पेस इकोसिस्टम दुनिया को नई दिशा दिखाने के लिए पूरी तरह तैयार है!`
    },
    {
      lang: 'ta-IN',
      voice: 'Asmita',
      body: `சென்னை ஐஐடியில் உருவான அக்னிகுல் காஸ்மாஸ், விண்வெளித் துறையில் ஒரு புதிய புரட்சியை உருவாக்கியுள்ளது. நூற்றுக்கணக்கான உதிரிபாகங்களைக் கொண்ட ராக்கெட் என்ஜின்களை மாற்றி, ஒற்றைத் துண்டில் 3D பிரிண்ட் செய்யப்பட்ட அக்னிலெட் என்ஜினை உருவாக்கியது. 

ஸ்ரீஹரிகோட்டாவில் உள்ள தனியார் ஏவுதளத்திலிருந்து ஏவப்பட்ட அக்னிபான் ராக்கெட், இந்திய விண்வெளி ஸ்டார்ட்-அப்களின் அபார திறனை உலகிற்குப் பறைசாற்றியுள்ளது!`
    },
    {
      lang: 'te-IN',
      voice: 'Suhana',
      body: `చెన్నైకి చెందిన అగ్నికుల్ కాస్మోస్ ప్రపంచంలోనే మొట్టమొదటి సింగిల్ పీస్ 3D ప్రింటెడ్ సెమీ క్రయోజెనిక్ రాకెట్ ఇంజిన్ 'అగ్నిలెట్' రూపొందించి చరిత్ర సృష్టించింది. శ్రీహరికోటలోని ప్రైవేట్ లాంచ్‌ప్యాడ్ నుండి జరిగిన అగ్నిబాణ్ ప్రయోగం భారత ప్రైవేట్ అంతరిక్ష రంగానికి నూతన జవసత్వాలను అందించింది!`
    },
    {
      lang: 'bn-IN',
      voice: 'Kirra',
      body: `আইআইটি মাদ্রাজে তৈরি স্টার্টআপ অগ্নিকুল কসমস রকেট প্রযুক্তিতে এক যুগান্তকারী পরিবর্তন এনেছে। তারা একক টুকরো থ্রি-ডি প্রিন্টেড ইঞ্জিন তৈরি করে অগ্নিবাণ রকেট উৎক্ষেপণ করেছে, যা প্রমাণ করে ভারতের বেসরকারি মহাকাশ সংস্থাগুলি কতটা অগ্রগামী!`
    }
  ];

  // ============================================================
  // 3. STORY: LVM3 (Heavy Lifter)
  // ============================================================
  const story3 = {
    id: 'lvm3-heavy-lifter',
    title: 'LVM3: The "Bahubali" Heavy Lifter That Conquered Orbit',
    summary: 'Standing 43.5 meters tall with twin solid boosters and an indigenous cryogenic upper stage, LVM3 is India\'s heavy-lift workhorse that carried Chandrayaan-3 and is human-rated for Gaganyaan.',
    category: 'isro',
    facts_as_of: '2024-03-15',
    sources: JSON.stringify(['https://www.isro.gov.in/LaunchVehicles.html']),
    duration_hint_min: 4,
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
      facts_as_of = excluded.facts_as_of,
      sources = excluded.sources,
      duration_hint_min = excluded.duration_hint_min,
      pinned = excluded.pinned,
      published = excluded.published
  `).run(story3);

  const story3Translations = [
    {
      lang: 'en-IN',
      voice: 'Pranav',
      body: `Affectionately called 'Fat Boy' and 'Bahubali' by space enthusiasts, the Launch Vehicle Mark-3, or LVM3, is ISRO's most powerful operational launch vehicle. Standing 43.5 meters tall with a liftoff mass of 640 tonnes, it is an absolute marvel of propulsion engineering.

At liftoff, two gigantic S200 solid strap-on boosters ignite, generating tremendous thrust to punch through Earth's dense lower atmosphere. Next, the twin liquid-fueled Vikas engines of the L110 core stage take over. But the crowning jewel is the C25 cryogenic upper stage, powered by India's home-grown CE-20 engine burning liquid hydrogen at minus 253 degrees Celsius with liquid oxygen. LVM3 carried Chandrayaan-2 and Chandrayaan-3, placed 72 commercial OneWeb satellites into orbit, and is now human-rated to fly Indian astronauts into space under Mission Gaganyaan!`
    },
    {
      lang: 'hi-IN',
      voice: 'Nalini',
      body: `इसरो का सबसे ताकतवर रॉकेट एलवीएम-3, जिसे प्यार से लोग 'बाहुबली' कहते हैं, भारत की अंतरिक्ष शक्ति का सच्चा प्रतीक है। 43.5 मीटर ऊंचे और 640 टन वजनी इस महाबली रॉकेट में दो विशाल सॉलिड बूस्टर और कोर लिक्विड स्टेज लगी है।

इसकी सबसे बड़ी ताकत है इसका क्रायोजेनिक अपर स्टेज C25, जो माइनस 253 डिग्री सेल्सियस पर लिक्विड हाइड्रोजन जलाकर प्रचंड थ्रस्ट पैदा करता है। चंद्रयान-2, चंद्रयान-3 और वनवेब के 72 सैटेलाइट्स को सफलतापूर्वक कक्षा में स्थापित करने वाला एलवीएम-3 अब भारत के पहले मानव अंतरिक्ष मिशन 'गगनयान' के लिए तैयार है!`
    },
    {
      lang: 'ta-IN',
      voice: 'Asmita',
      body: `இஸ்ரோவின் மிகவும் சக்திவாய்ந்த எல்விஎம்-3 ராக்கெட், 'பாகுபலி' என்று அன்போடு அழைக்கப்படுகிறது. 640 டன் எடை கொண்ட இந்த பிரம்மாண்ட ராக்கெட், உள்நாட்டு கிரையோஜெனிக் என்ஜின் மூலம் இயங்குகிறது. சந்திரயான்-3 விண்கலத்தை வெற்றிகரமாக விண்ணில் செலுத்திய இந்த ராக்கெட், ககன்யான் மனித விண்வெளி பயணத்திற்கும் தேர்வாகியுள்ளது.`
    },
    {
      lang: 'te-IN',
      voice: 'Suhana',
      body: `ఇస్రో అత్యంత శక్తివంతమైన రాకెట్ ఎల్‌విఎమ్-3, బాహుబలిగా ప్రసిద్ధి చెందింది. 640 టన్నుల బరువున్న ఈ రాకెట్ చంద్రయాన్-3 ని విజయవంతంగా రోదసిలోకి చేర్చింది. ఇప్పుడు గగన్‌యాన్ మానవ సహిత యాత్ర కోసం సిద్ధమవుతోంది.`
    },
    {
      lang: 'bn-IN',
      voice: 'Kirra',
      body: `ইসরোর সর্বাপেক্ষা শক্তিশালী রকেট এলভিএম-৩, যা জনপ্রিয়ভাবে 'বাহুবলী' নামে পরিচিত। চন্দ্রযান-৩ উৎক্ষেপণে প্রধান ভূমিকা পালন করা এই দৈত্যাকার রকেটটিই এখন গগনযানের মহাকাশচারীদের মহাকাশে নিয়ে যেতে প্রস্তুত!`
    }
  ];

  // Helper to upsert translations and generate mock/real MP3 files
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
    insertTrans.run('chandrayaan-3', t.lang, t.body, t.voice, `/media/audio/stories/chandrayaan-3/${t.lang}.mp3`, 160);
  }

  for (const t of story2Translations) {
    const audioFilePath = path.join(DIRS.AUDIO_STORIES, 'agnikul-cosmos-suborbital', `${t.lang}.mp3`);
    await synthesizeSpeech({ text: t.body, lang: t.lang, voice: t.voice, targetPath: audioFilePath });
    insertTrans.run('agnikul-cosmos-suborbital', t.lang, t.body, t.voice, `/media/audio/stories/agnikul-cosmos-suborbital/${t.lang}.mp3`, 140);
  }

  for (const t of story3Translations) {
    const audioFilePath = path.join(DIRS.AUDIO_STORIES, 'lvm3-heavy-lifter', `${t.lang}.mp3`);
    await synthesizeSpeech({ text: t.body, lang: t.lang, voice: t.voice, targetPath: audioFilePath });
    insertTrans.run('lvm3-heavy-lifter', t.lang, t.body, t.voice, `/media/audio/stories/lvm3-heavy-lifter/${t.lang}.mp3`, 170);
  }

  // ============================================================
  // 4. VERIFIED KNOWLEDGE BASE (FTS5 RAG)
  // ============================================================
  const facts = [
    {
      title: 'LVM3 Launch Vehicle Specifications & Capacity',
      body: 'LVM3 (Launch Vehicle Mark-3, formerly GSLV Mk III) is a three-stage heavy lift vehicle developed by ISRO. It has a lift-off mass of 640 tonnes, height of 43.5 meters, and can launch up to 4,000 kg satellites into Geosynchronous Transfer Orbit (GTO) and 8,000 kg into Low Earth Orbit (LEO). It features two solid S200 strap-on boosters, an L110 twin-Vikas liquid stage, and a cryogenic C25 stage with the CE-20 engine.',
      category: 'launch-vehicles',
      source_url: 'https://www.isro.gov.in/LaunchVehicles.html',
      as_of: '2024-03-15'
    },
    {
      title: 'LVM3 Commercial Track Record & Human Rating (HLVM3)',
      body: 'LVM3 achieved a 100% mission success rate including launching Chandrayaan-2, Chandrayaan-3, and 72 commercial OneWeb satellites across two dedicated commercial launches. A human-rated variant, HLVM3, featuring enhanced safety margins and a Crew Escape System, is designated to carry the Gaganyaan crew module into orbit.',
      category: 'launch-vehicles',
      source_url: 'https://www.isro.gov.in/LVM3_Overview.html',
      as_of: '2024-03-15'
    },
    {
      title: 'NVS-01 Second Generation Navigation Satellite Specifications',
      body: 'NVS-01 is the first of ISRO\'s second-generation NavIC (Navigation with Indian Constellation) satellites, successfully launched on May 29, 2023, aboard GSLV-F12. Weighing 2,232 kg, it operates in Geosynchronous transfer orbit and incorporates an indigenous Rubidium atomic clock developed by Space Applications Centre (SAC), Ahmedabad, as well as the civilian L1 frequency band (1575.42 MHz) compatible with consumer smartphones.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/GSLV-F12_NVS-01_Mission.html',
      as_of: '2023-05-29'
    },
    {
      title: 'NavIC Constellation Architecture & Civil L1 Signals',
      body: 'NavIC is India\'s independent regional navigation satellite system providing accurate position information service to users across India and up to 1,500 km around its borders. The NVS constellation replaces older IRNSS satellites and broadcasts interoperable signals in L1, L5, and S bands with real-time positioning accuracy under 5 meters for civil users.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/NavIC.html',
      as_of: '2024-01-15'
    },
    {
      title: 'Gaganyaan Human Spaceflight Timeline & Mission Profile',
      body: 'Gaganyaan will demonstrate human spaceflight capability by launching a 3-member crew to a 400 km circular low Earth orbit for a 3-day mission, followed by safe re-entry and splashing down in Indian waters. In October 2023, ISRO successfully conducted the TV-D1 mission validating the Crew Escape System at Mach 1.2. The four astronaut-designates are Group Captains Prashanth Balakrishnan Nair, Ajit Krishnan, Angad Prathap, and Wing Commander Shubhanshu Shukla.',
      category: 'human-spaceflight',
      source_url: 'https://www.isro.gov.in/Gaganyaan.html',
      as_of: '2024-02-27'
    },
    {
      title: 'Vyommitra Spacefaring Humanoid Robot',
      body: 'Vyommitra is a female half-humanoid robot developed by ISRO for uncrewed Gaganyaan test flights. Equipped to monitor environmental control life support systems, operate switch panels, and simulate human physiological parameters, she provides telemetry to ensure crew module safety before crewed flights.',
      category: 'human-spaceflight',
      source_url: 'https://www.isro.gov.in/Vyommitra.html',
      as_of: '2024-02-27'
    },
    {
      title: 'Chandrayaan-3 Touchdown Coordinates & Rover Discoveries',
      body: 'Chandrayaan-3 soft-landed on August 23, 2023, at 18:04 IST near the lunar South Pole (69.37 S, 32.35 E). The Pragyan rover\'s LIBS (Laser Induced Breakdown Spectroscope) confirmed the unambiguous presence of Sulphur on the lunar surface, along with Al, Ca, Fe, Cr, Ti, Mn, and Si.',
      category: 'lunar-missions',
      source_url: 'https://www.isro.gov.in/Chandrayaan3.html',
      as_of: '2023-08-23'
    },
    {
      title: 'Chandrayaan-4 Lunar Sample Return Mission Profile',
      body: 'Chandrayaan-4 is ISRO\'s planned lunar sample return mission. It involves two separate launch vehicles and five modular spacecraft elements (propulsion, descender, ascender, transfer, and re-entry modules) to collect and return lunar South Pole soil samples safely to Earth.',
      category: 'lunar-missions',
      source_url: 'https://www.isro.gov.in/',
      as_of: '2024-09-18'
    },
    {
      title: 'Aditya-L1 Halo Orbit & Solar Science Payloads',
      body: 'Aditya-L1 was inserted into a halo orbit around the Sun-Earth L1 Lagrange point on January 6, 2024, approximately 1.5 million km from Earth. Carrying seven payloads including the Visible Emission Line Coronagraph (VELC) and Solar Ultraviolet Imaging Telescope (SUIT), it provides continuous views of solar flares, coronal mass ejections, and space weather without eclipses.',
      category: 'solar-missions',
      source_url: 'https://www.isro.gov.in/Aditya_L1.html',
      as_of: '2024-01-06'
    },
    {
      title: 'Skyroot Aerospace Vikram-1 Rocket & Private Launch Records',
      body: 'Hyderabad-based startup Skyroot Aerospace launched India\'s first privately made suborbital rocket, Vikram-S, under Mission Prarambh on November 18, 2022. They are developing Vikram-1, a multi-stage orbital rocket with solid propulsion stages and the 3D-printed liquid upper stage engine named Raman.',
      category: 'startups',
      source_url: 'https://skyroot.in/',
      as_of: '2024-04-10'
    },
    {
      title: 'Pixxel Hyperspectral Satellite Constellation',
      body: 'Bengaluru and Los Angeles-based startup Pixxel builds commercial hyperspectral imaging satellites. Their satellites (including Shakuntala and Anand) capture over 50 narrow spectral bands across electromagnetic wavelengths, diagnosing crop health, soil biodiversity, greenhouse gas emissions, and mining reserves.',
      category: 'startups',
      source_url: 'https://www.pixxel.space/',
      as_of: '2024-05-12'
    }
  ];

  const insertFact = db.prepare(`
    INSERT INTO knowledge (title, body, category, source_url, as_of)
    VALUES (@title, @body, @category, @source_url, @as_of)
    ON CONFLICT DO NOTHING
  `);

  for (const f of facts) {
    const existing = db.prepare('SELECT id FROM knowledge WHERE title = ?').get(f.title);
    if (!existing) {
      insertFact.run(f);
    }
  }

  console.log(`✅ Seeding complete! 3 rich multilingual podcast stories and ${facts.length} verified ISRO/startup knowledge facts ready.`);
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(console.error);
}
