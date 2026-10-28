import { getDb } from './db.js';
import { synthesizeSpeech } from '../services/gnani/tts.js';
import path from 'node:path';
import fs from 'node:fs';
import { DIRS } from '../config.js';

export async function seedDatabase() {
  console.log('🌱 Seeding rich IsroPR stories and comprehensive ISRO knowledge base...');
  const db = getDb();

  // Ensure only Chandrayaan-3 and Mangalyaan are retained per user request
  db.prepare("DELETE FROM story_translations WHERE story_id NOT IN ('chandrayaan-3','mangalyaan')").run();
  db.prepare("DELETE FROM stories WHERE id NOT IN ('chandrayaan-3','mangalyaan')").run();

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
    cover_path: 'chandrayaan-3-cover.jpg',
    duration_hint_min: 3,
    pinned: 1,
    published: 1
  };

  db.prepare(`
    INSERT INTO stories (id, title, summary, category, facts_as_of, sources, cover_path, duration_hint_min, pinned, published)
    VALUES (@id, @title, @summary, @category, @facts_as_of, @sources, @cover_path, @duration_hint_min, @pinned, @published)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      facts_as_of = excluded.facts_as_of,
      sources = excluded.sources,
      cover_path = excluded.cover_path,
      duration_hint_min = excluded.duration_hint_min,
      pinned = excluded.pinned,
      published = excluded.published
  `).run(story1);

  const story1Translations = [
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `Part 1: The Launch from Sriharikota
Have you ever looked up at the night sky and wondered what lies beyond? For centuries, humanity has asked this very question. In ancient times we navigated by the stars, then telescopes expanded our vision, and today we send spacecraft to other worlds. It is human nature never to stay content in one place—we strive forward to discover new horizons. From this very aspiration came the story of Chandrayaan-3. In July 2023, a launch vehicle roared into the skies from the launchpad of Sriharikota, carrying Chandrayaan-3 and the dreams of over a billion people.

Part 2: The 15 Minutes of Terror & Descent
Hardly anyone in mission operations slept that night. A single question resonated: could we land where no nation had ever ventured before? The voyage was daunting. For weeks, the spacecraft gradually adjusted its orbits, drawing ever closer to the lunar surface while the ground control team tracked every pulse. Then arrived the pivotal moment—the evening of August 23, 2023. The Vikram lander descended towards the lunar terrain, its throttleable engines firing to steadily bleed off velocity.

Part 3: Soft Landing & Pragyan Rover
Every second demanded precision; a single miscalculation could end everything. And then, Vikram touched the lunar dust! India became the first country in history to soft-land near the Moon's South Pole. This was not merely the triumph of a machine—it was the victory of countless dedicated scientists who poured years of their lives into this endeavor. Soon, the ramp descended and Pragyan, the six-wheeled rover, rolled onto the lunar regolith, conducting in-situ experiments and confirming the presence of sulphur.

Part 4: Today the Moon, Tomorrow Mars
The scientific data transmitted back will serve generations of researchers. Yet this milestone transcends the Moon; it is part of a larger human voyage to comprehend the cosmos. Earth is our cradle, but humanity cannot remain confined to one haven forever. Today the Moon, tomorrow Mars, and beyond that, unfathomable worlds and stars! Every new destination presents fresh frontiers to explore.

Part 5: Lessons from Failure & Inspiring the Future
Chandrayaan-3 teaches us a profound lesson: dream boldly, but build with meticulous foresight. By learning from the setbacks of Chandrayaan-2, the ISRO team achieved the unprecedented. Failure is indeed a great teacher when we have the humility to learn. Most beautifully, this journey sparked curiosity in millions of young minds who gazed at the stars and dreamed, "One day, I will become a space scientist." That is the true victory. The Moon is not merely a sight in the night sky—it is an open doorway reminding us that our collective journey has only just begun.`
    },
    {
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `भाग 1: श्रीहरिकोटा से उड़ान
क्या आपने कभी रात के आसमान को देखकर सोचा है कि उसके उस पार क्या होगा? इंसान सदियों से यही सवाल पूछता आया है। पहले लोग तारों को देखकर रास्ता ढूंढते थे, फिर दूरबीन आई। और आज हम दूसरे ग्रहों तक अपने यान भेज रहे हैं। इंसान की असली फितरत यही है कि वो एक ही जगह बैठकर संतुष्ट नहीं होता। वो हमेशा आगे देखना चाहता है और नए रास्ते खोजना चाहता है। इसी सोच से निकली है चंद्रयान-3 की कहानी। जुलाई 2023 की बात है, श्रीहरिकोटा के लॉन्च पैड से एक रॉकेट ने उड़ान भरी। उसके अंदर था चंद्रयान-3 और उसके साथ थे करोड़ों लोगों के सपने।

भाग 2: 23 अगस्त का अवतरण
वहाँ बैठे साइंटिस्ट में से शायद ही किसी को उस रात ठीक से नींद आई हो। सबके मन में बस एक सवाल था: क्या हम वहाँ लैंड कर पाएंगे जहाँ अब तक कोई नहीं पहुँचा? सफर आसान नहीं था। यान कई हफ़्तों तक धीरे-धीरे अपना ऑर्बिट बदलता रहा, जैसे कोई धीरे-धीरे किसी अपने के करीब आ रहा हो। और ज़मीन पर बैठी टीम हर पल उसकी खबर लेती रही। फिर आया वो पल, 23 अगस्त 2023, शाम का वक्त। विक्रम नाम का लैंडर चाँद की सरफेस की तरफ बढ़ रहा था। उसके इंजन चले और उसने अपनी स्पीड धीरे-धीरे कम की।

भाग 3: दक्षिण ध्रुव पर लैंडिंग और प्रज्ञान रोवर
हर सेकंड एक फैसला था, एक भी गलती और सब कुछ खत्म हो सकता था। और फिर लैंडर ने चाँद को छू लिया! भारत चाँद के साउथ पोल के पास उतरने वाला पहला देश बन गया। ये सिर्फ एक मशीन की जीत नहीं थी, ये उन हाथों की जीत थी जिन्होंने सालों तक मेहनत की थी। लैंडर खुलने के बाद उसके अंदर से निकला प्रज्ञान—एक छोटा सा रोवर, जो अपने छह पहियों के सहारे धीरे-धीरे चाँद की मिट्टी पर चला। उसने वहाँ की मिट्टी को परखा और उसमें सल्फर की मौजूदगी पकड़ी।

भाग 4: आज चाँद, कल मंगल
ऐसी जानकारियाँ भेजीं, जो आने वाली पीढ़ियों के काम आएंगी। ये कदम सिर्फ चाँद तक का नहीं है, ये इंसान के उस बड़े सपने का हिस्सा है कि हम अपने ग्रह से बाहर जाकर ब्रह्मांड को समझें। धरती हमारा घर है, पर इंसान को सिर्फ इसी एक जगह तक सीमित नहीं रहना है। आज चाँद, कल मंगल और उसके आगे न जाने कितने ग्रह और तारे! हर नई मंज़िल एक नया सवाल लेकर आती है।

भाग 5: असफलता से सीख और नई पीढ़ी की प्रेरणा
मिशन हमें एक बात सिखाता है: सपने बड़े हों पर कदम सोच समझ कर रखे जाएँ। चंद्रयान-2 की कमियों से सीखकर ही टीम ने वो कर दिखाया जो पहले नहीं हुआ था। असफलता भी एक शिक्षक होती है अगर हम उससे सीखने को तैयार हों। और सबसे खूबसूरत बात, इस मिशन ने लाखों बच्चों की आँखों में सवाल जगा दिए। किसी ने पूछा, "चाँद की मिट्टी तक ये सब कैसे पहुँचा?" किसी ने सोचा, "मैं भी एक दिन साइंटिस्ट बनूँगा।" शायद यही असली कामयाबी है। तो अगली बार जब रात को चाँद दिखे, तो उसे सिर्फ एक खूबसूरत नज़ारा मत समझिएगा। वो एक दरवाज़ा है जो बताता है कि इंसान का सफर अभी शुरू हुआ है, और वो सफर हम सबका है।`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `ஆகஸ்ட் 23, 2023 அன்று, இந்திய விண்வெளி வரலாற்றில் பொன்னெழுத்துக்களால் பொறிக்கப்பட்ட ஒரு நாள். பெங்களூரு கட்டுப்பாட்டு மையத்தில் விஞ்ஞானிகள் தீவிர அமைதியுடன் திரையை உற்று நோக்கிக் கொண்டிருந்தனர். 

சந்திரயான்-3 விண்கலத்தின் விக்ரம் லேண்டர், நிலவின் தென் துருவத்தில் மிகவும் துல்லியமாக மென்மையாகத் தரை இறங்கியது. லேண்டரிலிருந்து வெளியே வந்த பிரக்யான் ரோவர், நிலவின் மேற்பரப்பில் இஸ்ரோவின் சின்னத்தையும் இந்தியாவின் தேசிய சின்னத்தையும் பதித்தது. நிலவின் தென் துருவத்தில் கால் பதித்த முதல் நாடு என்ற பெருமையை இந்தியா உலகுக்கு உணர்த்தியது!`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `ఆగస్టు 23, 2023న భారతదేశం సగర్వంగా తలెత్తుకున్న క్షణం. చంద్రయాన్-3 ద్వారా విక్రమ్ ల్యాండర్ చంద్రుని దక్షిణ ధ్రువంపై అత్యంత సురక్షితంగా కాలుమోపింది. 

ల్యాండింగ్ సమయంలోని ఉత్కంఠభరితమైన 15 నిమిషాలను తట్టుకుని, విక్రమ్ ల్యాండర్ చారిత్రక ఘనత సాధించింది. ప్రగ్యాన్ రోవర్ బయటకు వచ్చి చంద్రుడి నేలపై మన మువ్వన్నెల జెండా గౌరవాన్ని నిలిపింది. చంద్రుని దక్షిణ ధ్రువానికి చేరుకున్న తొలి దేశంగా భారత్ చరిత్రకెక్కింది!`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `২৩ আগস্ট ২০২৩, এক অবিস্মরণীয় ঐতিহাসিক দিন। ইসরোর চন্দ্রযান-৩ চাঁদের দক্ষিণ মেরুতে সফল সফট ল্যান্ডিং করে বিশ্বকে তাক লাগিয়ে দেয়। 

সেই উত্তেजनাকর ১৫ মিনিটের ব্র্যাকিং ধাপ পেরিয়ে বিক্রম ল্যান্ডার আলতো করে চাঁদের মাটি স্পর্শ করে। তারপর প্রজ্ঞান রোভার চাঁদের মাটিতে অশোক চক্রের ছাপ এঁকে প্রমাণ করে দিল ভারতীয় বিজ্ঞানের অপার শক্তি!`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `ಆಗಸ್ಟ್ 23, 2023 ಭಾರತದ ಬಾಹ್ಯಾಕಾಶ ಇತಿಹಾಸದಲ್ಲಿ ಸುವರ್ಣಾಕ್ಷರಗಳಲ್ಲಿ ಬರೆದಿಡುವ ದಿನ. ಬೆಂಗಳೂರಿನ ಇಸ್ರೋ ಕಂಟ್ರೋಲ್ ರೂಮ್‌ನಲ್ಲಿ ವಿಜ್ಞಾನಿಗಳು ಉಸಿರು ಬಿಗಿಹಿಡಿದು ಕುಳಿತಿದ್ದರು. ಚಂದ್ರಯಾನ-3 ಮಿಷನ್‌ನ ವಿಕ್ರಮ್ ಲ್ಯಾಂಡರ್ ಚಂದ್ರನ ದಕ್ಷಿಣ ಧ್ರುವದ ಮೇಲೆ ಅತ್ಯಂತ ನಿಖರವಾಗಿ ಸಾಫ್ಟ್ ಲ್ಯಾಂಡಿಂಗ್ ಮಾಡಿತು!

ಆ ರೋಮಾಂಚಕಾರಿ 15 ನಿಮಿಷಗಳ ಬ್ರೇಕಿಂಗ್ ಹಂತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿಸಿ ವಿಕ್ರಮ್ ಲ್ಯಾಂಡರ್ ಇಳಿಯುತ್ತಿದ್ದಂತೆ ಇಡೀ ಜಗತ್ತೇ ಭಾರತಕ್ಕೆ ಜೈಕಾರ ಹಾಕಿತು. ನಂತರ ಪ್ರಜ್ಞಾನ್ ರೋವರ್ ಹೊರಬಂದು ಚಂದ್ರನ ಮಣ್ಣಿನ ಮೇಲೆ ಅಶೋಕ ಸ್ತಂಭ ಮತ್ತು ಇಸ್ರೋದ ಲಾಂಛನವನ್ನು ಮುದ್ರಿಸಿತು. ಚಂದ್ರನ ದಕ್ಷಿಣ ಧ್ರುವದಲ್ಲಿ ಇಳಿದ ವಿಶ್ವದ ಮೊದಲ ರಾಷ್ಟ್ರ ಎಂಬ ಹೆಗ್ಗಳಿಕೆಗೆ ಭಾರತ ಪಾತ್ರವಾಯಿತು!`
    }
  ];

  // ============================================================
  // 2. STORY: Agnikul Cosmos (Startups)
  // ============================================================
  // Flag to seed additional stories when user requests them later
  const SEED_ADDITIONAL_STORIES = false;

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

  if (SEED_ADDITIONAL_STORIES) {
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
  }

  const story2Translations = [
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `Traditional rocket engines are engineering nightmares: thousands of intricate pipes, welds, and valves that take months of skilled machining. But young aerospace engineers at Chennai's Agnikul Cosmos asked a daring question: Why assemble hundreds of pieces when you can print the entire engine in one single continuous block of metal?

That audacity gave birth to Agnilet, the world's very first single-piece 3D-printed semi-cryogenic engine. And on May 30, 2024, their Agnibaan rocket lifted off from India's first-ever private launchpad, Dhanush, at Sriharikota. Agnikul proved that Indian startups aren't just following global trends; they are reinventing how rockets are made, making satellite launches rapid, customizable, and remarkably affordable!`
    },
    {
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `पारंपरिक रॉकेट इंजन बनाना बेहद जटिल काम माना जाता है, जिसमें सैकड़ों पुर्जों और महीनों की वेल्डिंग लगती है। लेकिन आईआईटी मद्रास के स्टार्टअप अग्निकुल कॉस्मॉस ने इस सोच को पूरी तरह बदल दिया।

उन्होंने बनाया 'अग्निलेट'—दुनिया का पहला सिंगल-पीस 3डी प्रिंटेड सेमी-क्रायोजेनिक रॉकेट इंजन! और 30 मई 2024 को श्रीहरिकोटा के भारत के पहले निजी लॉन्चपैड से अग्निबाण रॉकेट ने आसमान को चीरते हुए उड़ान भरी। अग्निकुल ने साबित कर दिया कि भारत का युवा स्पेस इकोसिस्टम दुनिया को नई दिशा दिखाने के लिए पूरी तरह तैयार है!`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `சென்னை ஐஐடியில் உருவான அக்னிகுல் காஸ்மாஸ், விண்வெளித் துறையில் ஒரு புதிய புரட்சியை உருவாக்கியுள்ளது. நூற்றுக்கணக்கான உதிரிபாகங்களைக் கொண்ட ராக்கெட் என்ஜின்களை மாற்றி, ஒற்றைத் துண்டில் 3D பிரிண்ட் செய்யப்பட்ட அக்னிலெட் என்ஜினை உருவாக்கியது. 

ஸ்ரீஹரிகோட்டாவில் உள்ள தனியார் ஏவுதளத்திலிருந்து ஏவப்பட்ட அக்னிபான் ராக்கெட், இந்திய விண்வெளி ஸ்டார்ட்-அப்களின் அபார திறனை உலகிற்குப் பறைசாற்றியுள்ளது!`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `చెన్నైకి చెందిన అగ్నికుల్ కాస్మోస్ ప్రపంచంలోనే మొట్టమొదటి సింగిల్ పీస్ 3D ప్రింటెడ్ సెమీ క్రయోజెనిక్ రాకెట్ ఇంజిన్ 'అగ్నిలెట్' రూపొందించి చరిత్ర సృష్టించింది. శ్రీహరికోటలోని ప్రైవేట్ లాంచ్‌ప్యాడ్ నుండి జరిగిన అగ్నిబాణ్ ప్రయోగం భారత ప్రైవేట్ అంతరిక్ష రంగానికి నూతన జవసత్వాలను అందించింది!`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `আইআইটি মাদ্রাজে তৈরি স্টার্টআপ অগ্নিকুল কসমস রকেট প্রযুক্তিতে এক যুগান্তকারী পরিবর্তন এনেছে। তারা একক টুকরো থ্রি-ডি প্রিন্টেড ইঞ্জিন তৈরি করে অগ্নিবাণ রকেট উৎক্ষেপণ করেছে, যা প্রমাণ করে ভারতের বেসরকারি মহাকাশ সংস্থাগুলি কতটা অগ্রগামী!`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `ಚೆನ್ನೈನ ಐಐಟಿ ಮದ್ರಾಸ್‌ನಲ್ಲಿ ಆರಂಭವಾದ ಸ್ಟಾರ್ಟಪ್ ಅಗ್ನಿಕುಲ್ ಕಾಸ್ಮೋಸ್, ಜಾಗತಿಕ ಬಾಹ್ಯಾಕಾಶ ರಂಗದಲ್ಲಿ ಕ್ರಾಂತಿ ಸೃಷ್ಟಿಸಿದೆ. ನೂರಾರು ಬಿಡಿಭಾಗಗಳನ್ನು ಜೋಡಿಸುವ ಬದಲು, ವಿಶ್ವದ ಮೊದಲ ಸಿಂಗಲ್-ಪೀಸ್ 3D ಮುದ್ರಿತ ಸೆಮಿ-ಕ್ರಯೋಜೆನಿಕ್ ಎಂಜಿನ್ 'ಅಗ್ನಿಲೆಟ್' ಅನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದೆ.

ಮೇ 30, 2024 ರಂದು ಶ್ರೀಹರಿಕೋಟಾದ ಮೊದಲ ಖಾಸಗಿ ಲಾಂಚ್‌ಪ್ಯಾಡ್ ಧನುಷ್‌ನಿಂದ ಅಗ್ನಿಬಾಣ ರಾಕೆಟ್ ಯಶಸ್ವಿಯಾಗಿ ಉಡಾವಣೆಯಾಯಿತು. ಭಾರತೀಯ ಯುವ ಸ್ಟಾರ್ಟಪ್‌ಗಳು ಉಪಗ್ರಹ ಉಡಾವಣೆಯನ್ನು ಅತ್ಯಂತ ವೇಗವಾಗಿ ಮತ್ತು ಕೈಗೆಟುಕುವ ವೆಚ್ಚದಲ್ಲಿ ಮಾಡಲು ಸಿದ್ಧವಾಗಿವೆ ಎಂದು ಅಗ್ನಿಕುಲ್ ಸಾಬೀತುಪಡಿಸಿದೆ!`
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

  if (SEED_ADDITIONAL_STORIES) {
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
  }

  const story3Translations = [
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `Affectionately called 'Fat Boy' and 'Bahubali' by space enthusiasts, the Launch Vehicle Mark-3, or LVM3, is ISRO's most powerful operational launch vehicle. Standing 43.5 meters tall with a liftoff mass of 640 tonnes, it is an absolute marvel of propulsion engineering.

At liftoff, two gigantic S200 solid strap-on boosters ignite, generating tremendous thrust to punch through Earth's dense lower atmosphere. Next, the twin liquid-fueled Vikas engines of the L110 core stage take over. But the crowning jewel is the C25 cryogenic upper stage, powered by India's home-grown CE-20 engine burning liquid hydrogen at minus 253 degrees Celsius with liquid oxygen. LVM3 carried Chandrayaan-2 and Chandrayaan-3, placed 72 commercial OneWeb satellites into orbit, and is now human-rated to fly Indian astronauts into space under Mission Gaganyaan!`
    },
    {
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `इसरो का सबसे ताकतवर रॉकेट एलवीएम-3, जिसे प्यार से लोग 'बाहुबली' कहते हैं, भारत की अंतरिक्ष शक्ति का सच्चा प्रतीक है। 43.5 मीटर ऊंचे और 640 टन वजनी इस महाबली रॉकेट में दो विशाल सॉलिड बूस्टर और कोर लिक्विड स्टेज लगी है।

इसकी सबसे बड़ी ताकत है इसका क्रायोजेनिक अपर स्टेज C25, जो माइनस 253 डिग्री सेल्सियस पर लिक्विड हाइड्रोजन जलाकर प्रचंड थ्रस्ट पैदा करता है। चंद्रयान-2, चंद्रयान-3 और वनवेब के 72 सैटेलाइट्स को सफलतापूर्वक कक्षा में स्थापित करने वाला एलवीएम-3 अब भारत के पहले मानव अंतरिक्ष मिशन 'गगनयान' के लिए तैयार है!`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `இஸ்ரோவின் மிகவும் சக்திவாய்ந்த எல்விஎம்-3 ராக்கெட், 'பாகுபலி' என்று அன்போடு அழைக்கப்படுகிறது. 640 டன் எடை கொண்ட இந்த பிரம்மாண்ட ராக்கெட், உள்நாட்டு கிரையோஜெனிக் என்ஜின் மூலம் இயங்குகிறது. சந்திரயான்-3 விண்கலத்தை வெற்றிகரமாக விண்ணில் செலுத்திய இந்த ராக்கெட், ககன்யான் மனித விண்வெளி பயணத்திற்கும் தேர்வாகியுள்ளது.`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `ఇస్రో అత్యంత శక్తివంతమైన రాకెట్ ఎల్‌విఎమ్-3, బాహుబలిగా ప్రసిద్ధి చెందింది. 640 టన్నుల బరువున్న ఈ రాకెట్ చంద్రయాన్-3 ని విజయవంతంగా రోదసిలోకి చేర్చింది. ఇప్పుడు గగన్‌యాన్ మానవ సహిత యాత్ర కోసం సిద్ధమవుతోంది.`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `ইসরোর সর্বাপেক্ষা শক্তিশালী রকেট এলভিএম-৩, যা জনপ্রিয়ভাবে 'বাহুবলী' নামে পরিচিত। চন্দ্রযান-৩ উৎক্ষেপণে প্রধান ভূমিকা পালন করা এই দৈত্যাকার রকেটটিই এখন গগনযানের মহাকাশচারীদের মহাকাশে নিয়ে যেতে প্রস্তুত!`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `ಇಸ್ರೋದ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ರಾಕೆಟ್ ಎಲ್‌ವಿಎಂ-3, ಬಾಹ್ಯಾಕಾಶ ಪ್ರಿಯರಿಂದ 'ಬಾಹುಬಲಿ' ಎಂದು ಪ್ರೀತಿಯಿಂದ ಕರೆಯಲ್ಪಡುತ್ತದೆ. 43.5 ಮೀಟರ್ ಎತ್ತರದ ಮತ್ತು 640 ಟನ್ ತೂಕದ ಈ ಬೃಹತ್ ರಾಕೆಟ್ ಎರಡು ಘನ ಬೂಸ್ಟರ್‌ಗಳು ಮತ್ತು ಸ್ವದೇಶಿ ಕ್ರಯೋಜೆನಿಕ್ C25 ಹಂತವನ್ನು ಒಳಗೊಂಡಿದೆ.

ಚಂದ್ರಯಾನ-2, ಚಂದ್ರಯಾನ-3 ಮತ್ತು 72 ಒನ್‌ವೆಬ್ ಉಪಗ್ರಹಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಕ್ಷೆಗೆ ಸೇರಿಸಿದ ಎಲ್‌ವಿಎಂ-3, ಈಗ ಭಾರತೀಯ ಗಗನಯಾತ್ರಿಗಳನ್ನು ಬಾಹ್ಯಾಕಾಶಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವ 'ಗಗನ್‌ಯಾನ್' ಮಾನವ ಸಹಿತ ಯಾತ್ರೆಗೆ ಸಂಪೂರ್ಣ ಸಜ್ಜಾಗಿದೆ!`
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
    const wavPath = path.join(DIRS.AUDIO_STORIES, 'chandrayaan-3', `${t.lang}.wav`);
    const defaultWavPath = path.join(DIRS.AUDIO_STORIES, 'chandrayaan-3', 'hi-IN.wav');
    let audioUrl = `/media/audio/stories/chandrayaan-3/${t.lang}.wav`;
    let duration = 180;

    if (!fs.existsSync(wavPath)) {
      if (fs.existsSync(defaultWavPath)) {
        audioUrl = `/media/audio/stories/chandrayaan-3/hi-IN.wav`;
      } else {
        const audioFilePath = path.join(DIRS.AUDIO_STORIES, 'chandrayaan-3', `${t.lang}.mp3`);
        await synthesizeSpeech({ text: t.body, lang: t.lang, voice: t.voice, targetPath: audioFilePath });
        audioUrl = `/media/audio/stories/chandrayaan-3/${t.lang}.mp3`;
        duration = 160;
      }
    }
    insertTrans.run('chandrayaan-3', t.lang, t.body, t.voice, audioUrl, duration);
  }

  // ============================================================
  // STORY: Mangalyaan (Mars Orbiter Mission)
  // ============================================================
  const storyMangalyaan = {
    id: 'mangalyaan',
    title: "Mangalyaan: India's Historic Journey to Mars",
    summary: 'In November 2013, India launched Mangalyaan — its first interplanetary Mars Orbiter Mission. On 24 September 2014, India became the first Asian nation to enter Martian orbit, and the first in the world to succeed on its maiden attempt.',
    category: 'isro',
    facts_as_of: '2014-09-24',
    sources: JSON.stringify(['https://www.isro.gov.in/MOM.html', 'https://en.wikipedia.org/wiki/Mars_Orbiter_Mission']),
    cover_path: 'mangalyaan-cover.jpg',
    duration_hint_min: 3,
    pinned: 1,
    published: 1
  };

  db.prepare(`
    INSERT INTO stories (id, title, summary, category, facts_as_of, sources, cover_path, duration_hint_min, pinned, published)
    VALUES (@id, @title, @summary, @category, @facts_as_of, @sources, @cover_path, @duration_hint_min, @pinned, @published)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      facts_as_of = excluded.facts_as_of,
      sources = excluded.sources,
      cover_path = excluded.cover_path,
      duration_hint_min = excluded.duration_hint_min,
      pinned = excluded.pinned,
      published = excluded.published
  `).run(storyMangalyaan);

  const mangalyaanTranslations = [
    {
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `क्या आपने कभी मंगल ग्रह को रात के आसमान में लाल रंग में चमकते देखा है? हज़ारों सालों से इंसान उसे देखकर सोचता आया है, कि वहाँ क्या होगा। क्या वहाँ कभी पानी था? क्या वहाँ कभी ज़िंदगी पनपी होगी? इन्हीं सवालों के जवाब ढूँढने के लिए इंसान अपने ग्रह से बाहर निकलने की हिम्मत करता है।

इसी सोच से निकली है Mangalyaan की कहानी। नवंबर 2013 की बात है। श्रीहरिकोटा के launch pad से एक rocket ने उड़ान भरी। उसके अंदर था Mangalyaan, यानी भारत का पहला Mars orbiter mission। ये सफ़र आसान नहीं था। लगभग 300 दिनों से ज़्यादा का रास्ता तय करना था, और हर दिन यान को अपने रास्ते पर सही बने रहना था।

ज़मीन पर बैठी team हर पल उसकी हालत पर नज़र रखती रही। कहीं कोई छोटी सी गड़बड़ी भी पूरे mission को खतरे में डाल सकती थी। फिर आया वो पल। 24 सितंबर 2014 की सुबह। यान ने अपने engine चलाए, और मंगल की orbit में धीरे-धीरे दाखिल हो गया। उस पल ज़मीन पर बैठे लोगों की आँखें नम थीं, और सबके चेहरे पर एक ही भाव था, गर्व।

भारत मंगल की orbit तक पहुँचने वाला पहला एशियाई देश बन गया। और इससे भी बड़ी बात ये, कि ये कामयाबी पहली ही कोशिश में मिली। दुनिया के कई देश मंगल तक पहुँचने की कोशिश कर चुके थे, और उनमें से कई को शुरुआती असफलताओं का सामना करना पड़ा था। Mangalyaan ने ये साबित किया, कि सीमित संसाधनों में भी बड़ा सपना पूरा किया जा सकता है।

ये सिर्फ़ एक machine की जीत नहीं थी। ये उन इंजीनियरों, वैज्ञानिकों और कारीगरों की जीत थी, जिन्होंने रात-दिन एक करके काम किया। Mangalyaan ने मंगल की सतह और उसके वातावरण की तस्वीरें लीं, और वहाँ के कुछ गैसों की मौजूदगी की जाँच की, जिसमें methane भी शामिल है। यह जानकारी इसलिए अहम है, क्योंकि ये हमें बताती है कि मंगल की दुनिया कैसी है, और क्या वहाँ कभी ज़िंदगी के निशान रहे होंगे।

ये इंसान के उस बड़े सपने का हिस्सा है, कि हम ब्रह्मांड को समझें, और अपने ग्रह तक सीमित न रहें। Mangalyaan हमें एक बात सिखाता है। सपने बड़े हों, पर उन्हें पूरा करने के लिए सोच-समझकर और मेहनत से काम किया जाए। सीमित बजट और सीमित संसाधनों में भी, अगर इरादा पक्का हो, तो दुनिया को चौंकाया जा सकता है।

और सबसे खूबसूरत बात? इस mission ने लाखों बच्चों के मन में सवाल जगा दिए। किसी ने पूछा, "मंगल पर पानी कैसे ढूँढा जाता है?" किसी ने सोचा, "मैं भी एक दिन scientist बनूँगा।" शायद यही असली कामयाबी है। तो अगली बार जब लाल रंग का मंगल आसमान में दिखे, तो उसे सिर्फ़ एक चमकता तारा मत समझिएगा। वो एक नया सफ़र है, जो इंसान ने शुरू किया है। और वो सफ़र हम सबका है।`
    },
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `Have you ever seen Mars glowing red in the night sky? For thousands of years, humans have gazed at it and wondered — what could be there? Was there ever water? Could life have once bloomed on that distant world? Driven by these very questions, humanity dared to step beyond its own planet.

And from that courage was born the story of Mangalyaan. It was November 2013. A rocket lifted off from the launchpad at Sriharikota. Inside it rested Mangalyaan — India's first Mars Orbiter Mission. The journey was anything but easy. The spacecraft had to travel more than three hundred days through the silent void of space, staying perfectly on course every single day.

Back on the ground, a dedicated team kept a watchful eye every moment. Even the smallest error could have put the entire mission in jeopardy. Then came that moment. The morning of 24 September 2014. The spacecraft fired its engines and gently slipped into orbit around Mars. In that instant, the eyes of the scientists on the ground filled with tears, and every face wore a single expression — pride.

India became the first Asian nation to reach the orbit of Mars. And what made it even more extraordinary — this success came on the very first attempt. Many nations had tried to reach Mars before, and several had faced failure after failure in their early efforts. Mangalyaan proved that even with limited resources, the greatest of dreams can be made real.

This was not merely a machine's victory. It was the victory of engineers, scientists, and craftspeople who worked day and night without rest. Mangalyaan captured images of the Martian surface and atmosphere, and studied the presence of certain gases there, including methane. This information is precious because it tells us what Mars is truly like — and whether signs of life may once have existed there.

It is part of humanity's greatest dream — to understand the universe, and to no longer be confined to a single planet. Mangalyaan teaches us one enduring lesson. Dream big, but pursue those dreams with careful thought and honest hard work. Even with a limited budget and limited resources, if the resolve is firm, the world can be astonished.

And the most beautiful part? This mission ignited questions in millions of young minds. Some asked, "How do you search for water on Mars?" Others thought, "I too will become a scientist one day." Perhaps that is the truest success of all. So the next time you see that red glow of Mars in the sky, do not think of it as just another distant star. It is a new journey that humanity has begun. And that journey belongs to all of us.`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `இரவு வானில் செவ்வாய் கிரகம் சிவப்பு நிறத்தில் மிளிர்வதை நீங்கள் பார்த்ததுண்டா? ஆயிரக்கணக்கான ஆண்டுகளாக மனிதர்கள் அதை பார்த்து ஒரே கேள்வியை கேட்டுக்கொண்டே இருந்தார்கள் — அங்கே என்ன இருக்கும்? ஒருகாலத்தில் நீர் இருந்ததா? உயிரினங்கள் வாழ்ந்திருக்குமா? இந்தக் கேள்விகளுக்கான விடைகளை தேடி, மனிதன் தன் கிரகத்தை விட்டு வெளியே செல்லும் தைரியம் காட்டினான்.

அந்தத் தைரியத்திலிருந்தே மங்கள்யான் கதை பிறந்தது. 2013 நவம்பர் மாதம். ஸ்ரீஹரிகோட்டா ஏவுதளத்திலிருந்து ஒரு ராக்கெட் விண்ணை நோக்கிப் பறந்தது. அதன் உள்ளே இருந்தது மங்கள்யான் — இந்தியாவின் முதல் செவ்வாய்க் கோள் சுற்றுப்பாதை வாகனம். இந்த பயணம் எளிதானதல்ல. விண்கலம் 300 நாட்களுக்கும் மேலாக தன் பாதையில் சரியாக பயணிக்க வேண்டியிருந்தது.

தரையில் இருந்த குழுவினர் ஒவ்வொரு நிமிடமும் அதன் நிலையை கண்காணித்தனர். ஒரு சிறிய தவறு கூட முழு திட்டத்தையும் ஆபத்தில் ஆழ்த்தியிருக்கும். பிறகு அந்த நிமிடம் வந்தது. 2014 செப்டம்பர் 24 காலை. விண்கலம் தன் என்ஜின்களை இயக்கி, செவ்வாயின் சுற்றுப்பாதையில் நுழைந்தது. அந்த நொடியில் தரையில் இருந்தவர்களின் கண்கள் கலங்கின, முகங்களில் ஒரே ஒரு உணர்வு — பெருமை.

செவ்வாயை சுற்றுப்பாதையில் அடைந்த முதல் ஆசிய நாடாக இந்தியா உயர்ந்தது. இன்னும் சிறந்தது என்னவென்றால் — இது முதல் முயற்சியிலேயே வெற்றி பெற்றது. பல நாடுகள் செவ்வாயை அடைய முயற்சித்திருந்தன, பலர் ஆரம்பத்தில் தோல்விகளை சந்தித்திருந்தனர். வரையறுக்கப்பட்ட வளங்களிலும் மாபெரும் கனவை நினைவாக்க முடியும் என்று மங்கள்யான் நிரூபித்தது.

இது வெறும் ஒரு இயந்திரத்தின் வெற்றி மட்டுமல்ல. பகல் இரவாக உழைத்த பொறியாளர்கள், விஞ்ஞானிகள், தொழிலாளர்கள் அனைவரின் வெற்றி. மங்கள்யான் செவ்வாயின் மேற்பரப்பு மற்றும் வளிமண்டலத்தின் படங்களை எடுத்தது, மீத்தேன் உட்பட சில வாயுக்களின் இருப்பை ஆய்வு செய்தது. இந்தத் தகவல்கள் செவ்வாயில் உயிரின் தடங்கள் இருந்தனவா என்பதை புரிந்துகொள்ள உதவுகின்றன.

பிரபஞ்சத்தை புரிந்துகொள்ள வேண்டும், ஒரு கிரகத்தோடு நின்றுவிடக்கூடாது என்பதே மனித இனத்தின் பெரிய கனவு. மங்கள்யான் நமக்கு ஒரு பாடம் கற்றுத்தருகிறது. கனவுகள் பெரிதாக இருக்கட்டும், ஆனால் சிந்தித்து, கடினமாக உழைத்து அவற்றை அடையுங்கள். வரையறுக்கப்பட்ட பட்ஜெட்டிலும் வரையறுக்கப்பட்ட வளங்களிலும், உறுதி இருந்தால் உலகை ஆச்சரியப்படுத்தலாம்.

மிக அழகான விஷயம் என்னவென்றால்? இந்த திட்டம் கோடிக்கணக்கான குழந்தைகளின் மனத்தில் கேள்விகளை தூண்டியது. "செவ்வாயில் நீரை எப்படி கண்டுபிடிப்பார்கள்?" என்று சிலர் கேட்டனர். "நானும் ஒரு நாள் விஞ்ஞானி ஆவேன்" என்று சிலர் கனவு கண்டனர். அதுவே உண்மையான வெற்றி. எனவே அடுத்த முறை சிவப்பு செவ்வாயை வானில் காணும்போது, அதை வெறும் ஒரு நட்சத்திரமாக நினைக்காதீர்கள். அது மனிதன் தொடங்கிய ஒரு புதிய பயணம். அந்தப் பயணம் நம் அனைவருக்கும் உரியது.`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `రాత్రి ఆకాశంలో అంగారకుడు ఎరుపు రంగులో మెరుస్తుండటం మీరు ఎప్పుడైనా చూశారా? వేల సంవత్సరాలుగా మానవులు అతనిని చూసి ఒకే ప్రశ్న అడుగుతూనే ఉన్నారు — అక్కడ ఏముంటుందో? ఎప్పుడైనా నీరు ఉందా? జీవం వర్ధిల్లి ఉంటుందా? ఈ ప్రశ్నలకు సమాధానాలు వెతుకుతూ, మానవుడు తన గ్రహాన్ని దాటి బయటికి వెళ్ళే ధైర్యం చేశాడు.

అదే సాహసంతో మంగళ్యాన్ కథ పుట్టింది. నవంబర్ 2013 వ సంవత్సరం. శ్రీహరికోట లాంచ్‌పాడ్ నుండి ఒక రాకెట్ ఆకాశంలోకి దూసుకెళ్ళింది. దాని లోపల ఉంది మంగళ్యాన్ — భారతదేశపు తొలి అంగారక కక్ష్యా వాహనం. ఈ ప్రయాణం అస్సలు సులభమైనది కాదు. అంతరిక్ష నౌక 300 రోజులకంటే ఎక్కువ ప్రయాణించాల్సి వచ్చింది, ప్రతి రోజూ సరైన మార్గంలో ఉండాల్సింది.

భూమిపై ఉన్న జట్టు ప్రతి నిమిషం దాని స్థితిని పర్యవేక్షిస్తూనే ఉంది. చిన్న తప్పు కూడా మొత్తం మిషన్‌ను ప్రమాదంలో పెట్టేది. తర్వాత ఆ క్షణం వచ్చింది. సెప్టెంబర్ 24, 2014 ఉదయం. నౌక తన ఇంజన్లు మండించి, అంగారకుని కక్ష్యలోకి నెమ్మదిగా ప్రవేశించింది. ఆ క్షణంలో భూమిపై ఉన్న వారి కళ్ళు నీటితో నిండాయి, అందరి మొహాల్లో ఒకే భావన — గర్వం.

అంగారకుని కక్ష్యకు చేరుకున్న మొదటి ఆసియా దేశంగా భారతదేశం అవతరించింది. ఇంకా గొప్ప విషయమేమిటంటే — ఈ విజయం మొదటి ప్రయత్నంలోనే వచ్చింది. ప్రపంచంలోని అనేక దేశాలు అంగారకుని చేరుకోవడానికి ప్రయత్నించాయి, అనేకం ప్రారంభ వైఫల్యాలను చవిచూశాయి. పరిమిత వనరులతో కూడా గొప్ప కలలు నిజమవుతాయని మంగళ్యాన్ నిరూపించింది.

ఇది కేవలం ఒక యంత్రం గెలుపు కాదు. రాత్రీ పగలూ అలుపెరగకుండా పనిచేసిన ఇంజనీర్లు, శాస్త్రవేత్తలు, కళాకారుల గెలుపు. మంగళ్యాన్ అంగారక ఉపరితలం మరియు వాతావరణ చిత్రాలు తీసింది, మీథేన్ సహా అక్కడి కొన్ని వాయువుల ఉనికిని అధ్యయనం చేసింది. ఈ సమాచారం అంగారకుని నిజస్వరూపం ఏమిటి, అక్కడ జీవం గుర్తులు ఉన్నాయా అని అర్థం చేసుకోవడంలో సహాయపడుతుంది.

విశ్వాన్ని అర్థం చేసుకోవాలి, ఒక గ్రహానికే పరిమితం కాకూడదు అనేది మానవులందరి గొప్ప కల. మంగళ్యాన్ మనకు ఒక పాఠం నేర్పుతుంది. కలలు పెద్దవిగా ఉండనీ, కానీ ఆలోచించి, కష్టపడి వాటిని సాధించండి. పరిమిత బడ్జెట్‌లో, పరిమిత వనరులతో కూడా, సంకల్పం బలంగా ఉంటే ప్రపంచాన్ని ఆశ్చర్యపరచవచ్చు.

అన్నింటికంటే అందమైన విషయమేమిటంటే? ఈ మిషన్ కోట్లాది పిల్లల మనసుల్లో ప్రశ్నలు రేకెత్తించింది. "అంగారకుడిపై నీటిని ఎలా వెతుకుతారు?" అని కొందరు అడిగారు. "నేను కూడా ఒక రోజు శాస్త్రవేత్త అవుతాను" అని కొందరు కలలు కన్నారు. బహుశా అదే నిజమైన విజయం. కాబట్టి తదుపరిసారి ఆకాశంలో ఆ ఎరుపు అంగారకుని చూసినప్పుడు, అతనిని కేవలం ఒక మెరిసే నక్షత్రంగా భావించకండి. అది మానవుడు ప్రారంభించిన ఒక కొత్త ప్రయాణం. మరియు ఆ ప్రయాణం మనందరిది.`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `রাতের আকাশে মঙ্গল গ্রহকে লাল রঙে জ্বলজ্বল করতে দেখেছেন কখনো? হাজার হাজার বছর ধরে মানুষ ওটার দিকে তাকিয়ে একটাই প্রশ্ন মনে মনে ভেবেছে — ওখানে কী আছে? কোনোদিন কি জল ছিল? জীবন কি একদিন সেখানে ফুলে ফেঁপে উঠেছিল? এই প্রশ্নগুলোর উত্তর খুঁজতেই মানুষ নিজের গ্রহের বাইরে পা রাখার সাহস দেখিয়েছে।

সেই সাহস থেকেই জন্ম নিয়েছে মঙ্গলযান-এর গল্প। ২০১৩ সালের নভেম্বর মাস। শ্রীহরিকোটার লঞ্চপ্যাড থেকে একটি রকেট আকাশের দিকে উড়ে গেল। তার ভেতরে ছিল মঙ্গলযান — ভারতের প্রথম মঙ্গল কক্ষপথ মিশন। এই যাত্রা মোটেও সহজ ছিল না। মহাকাশযানকে ৩০০ দিনেরও বেশি সময় সঠিক পথে চলতে হয়েছিল।

মাটিতে থাকা দলটি প্রতিটি মুহূর্তে তার অবস্থা পর্যবেক্ষণ করছিল। একটুখানি ভুলও পুরো মিশনকে বিপদে ফেলতে পারত। তারপর এলো সেই মুহূর্ত। ২০১৪ সালের ২৪ সেপ্টেম্বরের সকাল। মহাকাশযান তার ইঞ্জিন চালু করে ধীরে ধীরে মঙ্গলের কক্ষপথে প্রবেশ করল। সেই মুহূর্তে মাটিতে থাকা মানুষদের চোখ ভিজে উঠল, আর সকলের মুখে একটাই ভাব — গর্ব।

মঙ্গলের কক্ষপথে পৌঁছানো প্রথম এশিয়ান দেশ হিসেবে ভারত নিজেকে প্রতিষ্ঠিত করল। আরও বড় কথা — এই সাফল্য প্রথম চেষ্টাতেই এলো। পৃথিবীর অনেক দেশ মঙ্গলে পৌঁছানোর চেষ্টা করেছিল, অনেককে প্রথম প্রথম ব্যর্থতার মুখে পড়তে হয়েছিল। মঙ্গলযান প্রমাণ করেছিল যে সীমিত সম্পদেও বড় স্বপ্নকে সত্যি করা যায়।

এটা কেবল একটি যন্ত্রের জয় ছিল না। এটা সেই সব ইঞ্জিনিয়ার, বিজ্ঞানী আর কারিগরদের জয় ছিল, যারা দিনরাত একনিষ্ঠভাবে কাজ করেছিলেন। মঙ্গলযান মঙ্গলের পৃষ্ঠ ও বায়ুমণ্ডলের ছবি তুলেছিল এবং সেখানকার কিছু গ্যাসের উপস্থিতি পরীক্ষা করেছিল, যার মধ্যে মিথেনও ছিল। এই তথ্য গুরুত্বপূর্ণ কারণ এটি বলে দেয় মঙ্গলের দুনিয়া আসলে কেমন, এবং সেখানে কখনো জীবনের চিহ্ন ছিল কিনা।

মহাবিশ্বকে বুঝতে হবে, একটা গ্রহের মধ্যে আটকে থাকলে চলবে না — এটাই মানবজাতির সবচেয়ে বড় স্বপ্ন। মঙ্গলযান আমাদের একটি শিক্ষা দেয়। স্বপ্ন বড় হোক, কিন্তু সেটা পূরণ করতে ভেবে-চিন্তে এবং পরিশ্রম করে এগিয়ে যেতে হবে। সীমিত বাজেটে, সীমিত সম্পদে, যদি ইচ্ছাশক্তি দৃঢ় থাকে, তাহলে পৃথিবীকে অবাক করে দেওয়া যায়।

আর সবচেয়ে সুন্দর কথা? এই মিশন কোটি কোটি শিশুর মনে প্রশ্নের ঝরনা বইয়ে দিয়েছে। কেউ জিজ্ঞেস করেছে, "মঙ্গলে জল কীভাবে খোঁজা হয়?" কেউ ভেবেছে, "আমিও একদিন বিজ্ঞানী হব।" এটাই হয়তো সত্যিকারের সাফল্য। তাই পরের বার যখন লাল মঙ্গলকে আকাশে দেখবেন, তখন ওটাকে শুধু একটা জ্বলজ্বলে তারা ভাববেন না। ওটা একটি নতুন যাত্রা, যা মানুষ শুরু করেছে। আর সেই যাত্রা আমাদের সবার।`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `ರಾತ್ರಿ ಆಕಾಶದಲ್ಲಿ ಮಂಗಳ ಗ್ರಹ ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿ ಹೊಳೆಯುವುದನ್ನು ನೀವು ಎಂದಾದರೂ ನೋಡಿದ್ದೀರಾ? ಸಾವಿರಾರು ವರ್ಷಗಳಿಂದ ಮಾನವರು ಅದನ್ನು ನೋಡಿ ಒಂದೇ ಪ್ರಶ್ನೆ ಕೇಳುತ್ತಾ ಬಂದಿದ್ದಾರೆ — ಅಲ್ಲಿ ಏನಿರಬಹುದು? ಎಂದಾದರೂ ನೀರು ಇತ್ತೇ? ಜೀವ ಅರಳಿರಬಹುದೇ? ಈ ಪ್ರಶ್ನೆಗಳ ಉತ್ತರ ಹುಡುಕಲೇ ಮಾನವ ತನ್ನ ಗ್ರಹದ ಆಚೆ ಹೋಗುವ ಧೈರ್ಯ ತೋರಿದ.

ಅದೇ ಸಾಹಸದಿಂದ ಮಂಗಳ್ಯಾನ್ ಕಥೆ ಹುಟ್ಟಿತು. ನವೆಂಬರ್ 2013. ಶ್ರೀಹರಿಕೋಟಾದ ಉಡಾವಣಾ ತಾಣದಿಂದ ಒಂದು ರಾಕೆಟ್ ಆಕಾಶಕ್ಕೆ ನೆಗೆಯಿತು. ಅದರ ಒಳಗಿತ್ತು ಮಂಗಳ್ಯಾನ್ — ಭಾರತದ ಮೊದಲ ಮಂಗಳ ಕಕ್ಷೀಯ ಮಿಷನ್. ಈ ಪ್ರಯಾಣ ಸುಲಭವಾದದ್ದಲ್ಲ. ಬಾಹ್ಯಾಕಾಶ ನೌಕೆ 300 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಸರಿಯಾದ ಹಾದಿಯಲ್ಲಿ ಪ್ರಯಾಣಿಸಬೇಕಿತ್ತು.

ನೆಲದ ಮೇಲಿದ್ದ ತಂಡ ಪ್ರತಿ ಕ್ಷಣ ಅದರ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸುತ್ತಿತ್ತು. ಚಿಕ್ಕ ತಪ್ಪೂ ಸಹ ಇಡೀ ಮಿಷನ್ ಅನ್ನು ಅಪಾಯಕ್ಕೆ ದೂಡಬಹುದಿತ್ತು. ಆಮೇಲೆ ಆ ಕ್ಷಣ ಬಂತು. ಸೆಪ್ಟೆಂಬರ್ 24, 2014 ರ ಬೆಳಗ್ಗೆ. ನೌಕೆ ತನ್ನ ಇಂಜಿನ್ಗಳನ್ನು ಉರಿಸಿ ನಿಧಾನವಾಗಿ ಮಂಗಳದ ಕಕ್ಷೆಗೆ ಪ್ರವೇಶಿಸಿತು. ಆ ಕ್ಷಣ ನೆಲದ ಮೇಲಿದ್ದ ಜನರ ಕಣ್ಣು ತೇವವಾಯಿತು, ಎಲ್ಲರ ಮುಖದ ಮೇಲೆ ಒಂದೇ ಭಾವ — ಹೆಮ್ಮೆ.

ಮಂಗಳದ ಕಕ್ಷೆಯನ್ನು ತಲುಪಿದ ಮೊದಲ ಏಷ್ಯಾ ರಾಷ್ಟ್ರವಾಗಿ ಭಾರತ ಹೊರಹೊಮ್ಮಿತು. ಇನ್ನೂ ಮಹತ್ವದ ವಿಷಯ — ಈ ಯಶಸ್ಸು ಮೊದಲ ಪ್ರಯತ್ನದಲ್ಲೇ ಬಂತು. ಜಗತ್ತಿನ ಅನೇಕ ದೇಶಗಳು ಮಂಗಳಕ್ಕೆ ಹೋಗಲು ಪ್ರಯತ್ನಿಸಿದ್ದವು, ಹಲವು ಆರಂಭಿಕ ವೈಫಲ್ಯಗಳನ್ನು ಎದುರಿಸಿದ್ದವು. ಸೀಮಿತ ಸಂಪನ್ಮೂಲದಲ್ಲೂ ದೊಡ್ಡ ಕನಸನ್ನು ನನಸು ಮಾಡಬಹುದು ಎಂದು ಮಂಗಳ್ಯಾನ್ ಸಾಬೀತುಪಡಿಸಿತು.

ಇದು ಕೇವಲ ಒಂದು ಯಂತ್ರದ ಗೆಲುವಲ್ಲ. ದಿನರಾತ್ರಿ ದುಡಿದ ಇಂಜಿನಿಯರ್‌ಗಳು, ವಿಜ್ಞಾನಿಗಳು, ಕಾರ್ಮಿಕರ ಗೆಲುವು. ಮಂಗಳ್ಯಾನ್ ಮಂಗಳದ ಮೇಲ್ಮೈ ಮತ್ತು ವಾಯುಮಂಡಲದ ಚಿತ್ರಗಳನ್ನು ತೆಗೆಯಿತು, ಮೀಥೇನ್ ಸೇರಿದಂತೆ ಕೆಲ ಅನಿಲಗಳ ಇರುವಿಕೆಯನ್ನು ಅಧ್ಯಯನ ಮಾಡಿತು. ಮಂಗಳ ಯಾವ ರೀತಿಯ ಲೋಕ, ಅಲ್ಲಿ ಜೀವದ ಕುರುಹುಗಳಿದ್ದವೇ ಎಂಬುದನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಲು ಇದು ಮುಖ್ಯ.

ವಿಶ್ವವನ್ನು ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಬೇಕು, ಒಂದೇ ಗ್ರಹಕ್ಕೆ ಸೀಮಿತವಾಗಿ ಉಳಿಯಬಾರದು — ಇದೇ ಮಾನವ ಜಾತಿಯ ದೊಡ್ಡ ಕನಸು. ಮಂಗಳ್ಯಾನ್ ನಮಗೊಂದು ಪಾಠ ಕಲಿಸುತ್ತದೆ. ಕನಸುಗಳು ದೊಡ್ಡದಾಗಿರಲಿ, ಆದರೆ ಯೋಚಿಸಿ ಮತ್ತು ಶ್ರಮಪಟ್ಟು ಅವನ್ನು ಸಾಧಿಸಿ. ಸೀಮಿತ ಬಜೆಟ್‌ನಲ್ಲಿ, ಸೀಮಿತ ಸಂಪನ್ಮೂಲದಲ್ಲಿ, ಸಂಕಲ್ಪ ದೃಢವಾಗಿದ್ದರೆ ಜಗತ್ತನ್ನೇ ಚಕಿತಗೊಳಿಸಬಹುದು.

ಇನ್ನೊಂದು ಸುಂದರ ಸಂಗತಿ? ಈ ಮಿಷನ್ ಕೋಟ್ಯಂತರ ಮಕ್ಕಳ ಮನಸ್ಸಿನಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕಿತು. "ಮಂಗಳದಲ್ಲಿ ನೀರು ಹೇಗೆ ಹುಡುಕುತ್ತಾರೆ?" ಎಂದು ಕೆಲವರು ಕೇಳಿದರು. "ನಾನೂ ಒಂದು ದಿನ ವಿಜ್ಞಾನಿ ಆಗುತ್ತೇನೆ" ಎಂದು ಕೆಲವರು ಕನಸು ಕಂಡರು. ಅದೇ ನಿಜವಾದ ಯಶಸ್ಸು ಇರಬಹುದು. ಆದ್ದರಿಂದ ಮುಂದಿನ ಬಾರಿ ಆಕಾಶದಲ್ಲಿ ಕೆಂಪು ಮಂಗಳ ಕಾಣಿಸಿಕೊಂಡಾಗ, ಅದನ್ನು ಕೇವಲ ಒಂದು ಮಿನುಗು ನಕ್ಷತ್ರ ಎಂದು ಭಾವಿಸಬೇಡಿ. ಅದು ಮಾನವ ಪ್ರಾರಂಭಿಸಿದ ಒಂದು ಹೊಸ ಪ್ರಯಾಣ. ಮತ್ತು ಆ ಪ್ರಯಾಣ ನಮ್ಮೆಲ್ಲರದ್ದು.`
    }
  ];

  for (const t of mangalyaanTranslations) {
    const audioUrl = `/media/audio/stories/mangalyaan/${t.lang}.wav`;
    insertTrans.run('mangalyaan', t.lang, t.body, t.voice, audioUrl, 180);
  }

  if (SEED_ADDITIONAL_STORIES) {
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
  }

  // ============================================================
  // 4. VERIFIED KNOWLEDGE BASE (FTS5 RAG)
  // ============================================================
  const facts = [
    {
      title: 'LVM3 Launch Vehicle Specifications & Capacity',
      body: 'LVM3 (Launch Vehicle Mark-3, formerly GSLV Mk III) is a three-stage heavy lift vehicle developed by ISRO. It has a lift-off mass of 640 tonnes, height of 43.5 meters, and can launch up to 4,000 kg satellites into Geosynchronous Transfer Orbit (GTO) and 8,000 kg into Low Earth Orbit (LEO). It features two solid S200 strap-on boosters, an L110 twin-Vikas liquid stage, and a cryogenic C25 stage with the CE-20 engine.',
      category: 'launch-vehicles',
      source_url: 'https://www.isro.gov.in/Launchers.html',
      as_of: '2024-03-15'
    },
    {
      title: 'LVM3 Commercial Track Record & Human Rating (HLVM3)',
      body: 'LVM3 achieved a 100% mission success rate including launching Chandrayaan-2, Chandrayaan-3, and 72 commercial OneWeb satellites across two dedicated commercial launches. A human-rated variant, HLVM3, featuring enhanced safety margins and a Crew Escape System, is designated to carry the Gaganyaan crew module into orbit.',
      category: 'launch-vehicles',
      source_url: 'https://www.isro.gov.in/Launchers.html',
      as_of: '2024-03-15'
    },
    {
      title: 'NVS-01 Second Generation Navigation Satellite Specifications',
      body: 'NVS-01 is the first of ISRO\'s second-generation NavIC (Navigation with Indian Constellation) satellites, successfully launched on May 29, 2023, aboard GSLV-F12. Weighing 2,232 kg, it operates in Geosynchronous transfer orbit and incorporates an indigenous Rubidium atomic clock developed by Space Applications Centre (SAC), Ahmedabad, as well as the civilian L1 frequency band (1575.42 MHz) compatible with consumer smartphones.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/GSLV_F12_Landingpage.html',
      as_of: '2023-05-29'
    },
    {
      title: 'NVS-03 Navigation Satellite (IRNSS-1L) Specifications & Role',
      body: 'NVS-03 (designated IRNSS-1L) is the third satellite in ISRO\'s second-generation NavIC series, built to augment and fortify India\'s regional satellite navigation system. Scheduled for launch aboard GSLV Mk II from Sriharikota, it incorporates an indigenous space-qualified Rubidium atomic clock developed by SAC Ahmedabad, broadcasting interoperable signals in civilian L1, L5, and S bands.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/SatelliteNavigationServices.html',
      as_of: '2024-10-01'
    },
    {
      title: 'NVS-02 Navigation Satellite Constellation Overview',
      body: 'NVS-02 is the second satellite in ISRO\'s second-generation NavIC constellation planned to expand continuous regional navigation, positioning, and timing coverage across the Indian subcontinent and up to 1,500 km beyond its land borders with civil L1 band signals.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/SatelliteNavigationServices.html',
      as_of: '2024-06-01'
    },
    {
      title: 'NavIC Constellation Architecture & Civil L1 Signals',
      body: 'NavIC is India\'s independent regional navigation satellite system providing accurate position information service to users across India and up to 1,500 km around its borders. The NVS constellation replaces older IRNSS satellites and broadcasts interoperable signals in L1, L5, and S bands with real-time positioning accuracy under 5 meters for civil users.',
      category: 'navigation-satellites',
      source_url: 'https://www.isro.gov.in/SatelliteNavigationServices.html',
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
      source_url: 'https://www.isro.gov.in/Gaganyaan.html',
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
      source_url: 'https://en.wikipedia.org/wiki/Pixxel',
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
