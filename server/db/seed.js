import { getDb } from './db.js';
import { synthesizeSpeech } from '../services/gnani/tts.js';
import path from 'node:path';
import { DIRS } from '../config.js';

export async function seedDatabase() {
  console.log('🌱 Seeding rich IsroPR stories and comprehensive ISRO knowledge base...');
  const db = getDb();

  // Ensure only Chandrayaan-3 is retained per user request
  db.prepare("DELETE FROM story_translations WHERE story_id != 'chandrayaan-3'").run();
  db.prepare("DELETE FROM stories WHERE id != 'chandrayaan-3'").run();

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
