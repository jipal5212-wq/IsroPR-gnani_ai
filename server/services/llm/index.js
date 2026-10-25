import { ENV } from '../../config.js';

export async function generateReply({ system, messages, maxTokens = 250, detectedLang = 'en-IN', contextData = null }) {
  // If no API key is configured, provide an intelligent local fallback
  if (!ENV.LLM_API_KEY) {
    return generateLocalFallback(messages, system, detectedLang, contextData);
  }

  let endpoint = ENV.LLM_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
  }

  const body = {
    model: ENV.LLM_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      ...messages
    ],
    max_tokens: maxTokens,
    temperature: 0.3
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per spec

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.LLM_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LLM API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (!text) {
      throw new Error('LLM returned empty reply');
    }

    return {
      text,
      usage: data.usage || null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutMsg = detectedLang === 'hi-IN'
        ? "प्रतिक्रिया में थोड़ा अधिक समय लग गया। कृपया कुछ पलों में पुनः प्रयास करें!"
        : "I took a bit too long to process. Please ask again in a moment!";
      return { text: timeoutMsg };
    }
    console.warn('LLM API error (falling back to verified RAG answer):', err.message);
    return generateLocalFallback(messages, system, detectedLang, contextData);
  }
}

function generateLocalFallback(messages, system, detectedLang = 'en-IN', contextData = null) {
  const lastUserMsg = messages && messages.length > 0 
    ? messages[messages.length - 1].content.toLowerCase() 
    : '';

  const knowledge = contextData?.knowledge || [];
  const stories = contextData?.stories || [];
  const topFact = knowledge[0] || null;
  const topFactTitle = (topFact?.title || '').toLowerCase();
  const topFactBody = (topFact?.body || '').toLowerCase();

  // If no knowledge or stories found in context
  if (knowledge.length === 0 && stories.length === 0 && system.includes('Context:\nNo relevant entries found')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "नमस्ते! इस विषय पर हमारे ज्ञानकोष में अभी सत्यापित जानकारी उपलब्ध नहीं है। इसरो के आधिकारिक मिशन शेड्यूल और अपडेट के लिए कृपया isro.gov.in देखें।"
      };
    }
    if (detectedLang === 'ta-IN') {
      return {
        text: "வணக்கம்! இது குறித்த சரிபார்க்கப்பட்ட தகவல் தற்போது எங்களிடம் இல்லை. அதிகாரப்பூர்வ விவரங்களுக்கு isro.gov.in தளத்தைப் பார்க்கவும்."
      };
    }
    if (detectedLang === 'te-IN') {
      return {
        text: "నమస్కారం! ఈ అంశంపై ధృవీకరించబడిన సమాచారం ప్రస్తుతం మా వద్ద లేదు. అధికారిక వివరాల కోసం isro.gov.in ని సందర్శించండి."
      };
    }
    if (detectedLang === 'bn-IN') {
      return {
        text: "নমস্কার! এই বিষয়ে আমাদের জ্ঞানভাণ্ডারে এখনও নিশ্চিত তথ্য নেই। আনুষ্ঠানিক আপডেটের জন্য অনুগ্রহ করে isro.gov.in দেখুন।"
      };
    }
    return {
      text: "I do not have verified details on that yet in our knowledge base. For official mission schedules and technical updates, please check isro.gov.in."
    };
  }

  // 1. Agnikul Cosmos & Agnibaan
  if (lastUserMsg.includes('अग्निकुल') || lastUserMsg.includes('agnikul') || lastUserMsg.includes('agnibaan') || lastUserMsg.includes('अग्निबाण') || lastUserMsg.includes('agnilet') || topFactTitle.includes('agnikul')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: चेन्नई के स्टार्टअप अग्निकुल कॉस्मॉस ने दुनिया का पहला सिंगल-पीस 3D प्रिंटेड सेमी-क्रायोजेनिक रॉकेट इंजन 'अग्निलेट' विकसित किया। 30 मई 2024 को श्रीहरिकोटा के पहले निजी लॉन्चपैड धनुष से उनके अग्निबाण रॉकेट का सफल प्रक्षेपण हुआ।"
      };
    }
    if (detectedLang === 'ta-IN') {
      return {
        text: "சரிபார்க்கப்பட்ட தகவலின்படி: சென்னை அக்னிகுல் காஸ்மாஸ் உலகின் முதல் 3D பிரிண்ட் செய்யப்பட்ட அக்னிலெட் என்ஜினை உருவாக்கியது. மே 30, 2024 அன்று ஸ்ரீஹரிகோட்டாவின் தனியார் ஏவுதளத்திலிருந்து அக்னிபான் ராக்கெட் வெற்றிகரமாக ஏவப்பட்டது."
      };
    }
    return {
      text: "According to verified records: Agnikul Cosmos developed Agnilet, the world's first single-piece 3D-printed semi-cryogenic engine. On May 30, 2024, their Agnibaan rocket achieved a successful suborbital launch from India's first private launchpad, Dhanush, at Sriharikota."
    };
  }

  // 2. LVM3 Heavy Lifter / Bahubali / Launch Vehicles
  if (lastUserMsg.includes('lvm') || lastUserMsg.includes('एलवीएम') || lastUserMsg.includes('बाहुबली') || lastUserMsg.includes('bahubali') || topFactTitle.includes('lvm3')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: एलवीएम-3 (LVM3) इसरो का 640 टन वजनी भारी लिफ्टर रॉकेट है, जिसकी ऊंचाई 43.5 मीटर है। यह जियोसिंक्रोनस ट्रांसफर ऑर्बिट (GTO) में 4,000 किग्रा और लो अर्थ ऑर्बिट (LEO) में 8,000 किग्रा तक उपग्रह ले जाने में सक्षम है। यह गगनयान मिशन के लिए भी प्रमाणित है।"
      };
    }
    if (detectedLang === 'ta-IN') {
      return {
        text: "சரிபார்க்கப்பட்ட தகவலின்படி: எல்விஎம்-3 இஸ்ரோவின் 640 டன் எடை கொண்ட பிரம்மாண்ட ராக்கெட். இது ஜிடிஓ சுற்றுப்பாதைக்கு 4,000 கிலோ மற்றும் எல்இஓ சுற்றுப்பாதைக்கு 8,000 கிலோ எடையைச் சுமந்து செல்லும் திறன் கொண்டது."
      };
    }
    return {
      text: "According to verified records: LVM3 is ISRO's 640-tonne, 43.5-meter tall heavy-lift launch vehicle. It can carry up to 4,000 kg into Geosynchronous Transfer Orbit (GTO) and 8,000 kg into Low Earth Orbit (LEO). It carried Chandrayaan-3 and is human-rated for Gaganyaan."
    };
  }

  // 3. NVS-01 Navigation Satellite & NavIC
  if (lastUserMsg.includes('nvs') || lastUserMsg.includes('एनवीएस') || lastUserMsg.includes('navic') || lastUserMsg.includes('नाविक') || topFactTitle.includes('nvs') || topFactTitle.includes('navic')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: एनवीएस-01 (NVS-01) इसरो का दूसरी पीढ़ी का नेविगेशन उपग्रह है, जिसे 29 मई 2023 को जीएसएलवी-एफ12 द्वारा लॉन्च किया गया था। इसका वजन 2,232 किग्रा है और इसमें स्वदेशी रूबिडियम परमाणु घड़ी और नागरिक L1 बैंड सिग्नल शामिल हैं जो आम स्मार्टफ़ोन के अनुकूल हैं।"
      };
    }
    return {
      text: "According to verified records: NVS-01 is ISRO's second-generation NavIC satellite launched on May 29, 2023, aboard GSLV-F12. Weighing 2,232 kg, it features an indigenous Rubidium atomic clock and civilian L1 frequency band compatible with consumer smartphones."
    };
  }

  // 4. Gaganyaan Human Spaceflight & Vyommitra
  if (lastUserMsg.includes('gaganyaan') || lastUserMsg.includes('गगनयान') || lastUserMsg.includes('व्योममित्र') || lastUserMsg.includes('vyommitra') || lastUserMsg.includes('astronaut') || topFactTitle.includes('gaganyaan') || topFactTitle.includes('vyommitra')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: गगनयान भारत का पहला मानव अंतरिक्ष मिशन है। इसमें 3 सदस्यीय दल को 400 किमी की निचली कक्षा में 3 दिनों के मिशन पर भेजा जाएगा। चार नामित अंतरिक्ष यात्री प्रशांत नायर, अजीत कृष्णन, अंगद प्रताप और शुभांशु शुक्ला हैं। परीक्षण उड़ानों में व्योममित्र रोबोट शामिल है।"
      };
    }
    return {
      text: "According to verified records: Mission Gaganyaan will demonstrate Indian human spaceflight by launching a 3-member crew to a 400 km orbit for 3 days. The four astronaut-designates are Prashanth Nair, Ajit Krishnan, Angad Prathap, and Shubhanshu Shukla, with the Vyommitra robot flying test flights."
    };
  }

  // 5. Aditya-L1 Solar Mission
  if (lastUserMsg.includes('aditya') || lastUserMsg.includes('आदित्य') || lastUserMsg.includes('solar') || lastUserMsg.includes('सूर्य') || topFactTitle.includes('aditya')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: आदित्य-एल1 भारत की पहली सौर वेधशाला है, जिसे 6 जनवरी 2024 को पृथ्वी से लगभग 15 लाख किमी दूर सूर्य-पृथ्वी के एल1 लैग्रेंज बिंदु के चारों ओर हेलो कक्षा में सफलतापूर्वक स्थापित किया गया था।"
      };
    }
    return {
      text: "According to verified records: Aditya-L1 was inserted into a halo orbit around the Sun-Earth L1 Lagrange point on January 6, 2024, roughly 1.5 million km from Earth, continuously observing solar activity without eclipses."
    };
  }

  // 6. Skyroot Aerospace & Vikram-S / Vikram-1
  if (lastUserMsg.includes('skyroot') || lastUserMsg.includes('स्काईरूट') || lastUserMsg.includes('vikram-s') || lastUserMsg.includes('vikram-1') || topFactTitle.includes('skyroot')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: हैदराबाद के स्टार्टअप स्काईरूट एयरोस्पेस ने 18 नवंबर 2022 को मिशन प्रारंभ के तहत भारत का पहला निजी रॉकेट विक्रम-एस (Vikram-S) लॉन्च किया था। वे अब अपने विक्रम-1 कक्षीय रॉकेट पर कार्य कर रहे हैं।"
      };
    }
    return {
      text: "According to verified records: Skyroot Aerospace launched India's first privately developed rocket, Vikram-S, under Mission Prarambh on November 18, 2022, reaching an altitude of 89.5 km."
    };
  }

  // 7. Chandrayaan-4 Lunar Sample Return
  if (lastUserMsg.includes('chandrayaan-4') || lastUserMsg.includes('चंद्रयान 4') || lastUserMsg.includes('chandrayaan 4') || topFactTitle.includes('chandrayaan-4')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: चंद्रयान-4 इसरो का नियोजित चंद्र नमूना वापसी (लूनर सैंपल रिटर्न) मिशन है, जो चंद्रमा के दक्षिणी ध्रुव से मिट्टी के नमूने एकत्र कर सुरक्षित रूप से पृथ्वी पर वापस लाएगा।"
      };
    }
    return {
      text: "According to verified records: Chandrayaan-4 is ISRO's planned lunar sample return mission, designed to collect and return lunar South Pole soil samples safely to Earth."
    };
  }

  // 8. Chandrayaan-3 Landing, Date, Time, Rover
  if (lastUserMsg.includes('चंद्रयान') || lastUserMsg.includes('chandrayaan') || lastUserMsg.includes('landing') || lastUserMsg.includes('लैंडिंग') || lastUserMsg.includes('pragyan') || lastUserMsg.includes('प्रज्ञान') || topFactTitle.includes('chandrayaan-3')) {
    if (detectedLang === 'hi-IN') {
      return {
        text: "सत्यापित रिकॉर्ड के अनुसार: चंद्रयान-3 ने 23 अगस्त 2023 को शाम 6:04 बजे (IST) चंद्रमा के दक्षिणी ध्रुव पर सफल सॉफ्ट लैंडिंग की थी। इसके बाद प्रज्ञान रोवर ने चंद्रमा की सतह पर उतरकर सल्फर और अन्य महत्वपूर्ण खनिजों की उपस्थिति की पुष्टि की।"
      };
    }
    if (detectedLang === 'ta-IN') {
      return {
        text: "சரிபார்க்கப்பட்ட தகவலின்படி: சந்திரயான்-3 விண்கலத்தின் விக்ரம் லேண்டர் ஆகஸ்ட் 23, 2023 அன்று மாலை 6:04 மணிக்கு (IST) நிலவின் தென் துருவத்தில் வெற்றிகரமாகத் தரை இறங்கியது. பிரக்யான் ரோவர் கந்தகத்தின் இருப்பை உறுதி செய்தது."
      };
    }
    if (detectedLang === 'te-IN') {
      return {
        text: "ధృవీకరించబడిన సమాచారం ప్రకారం: చంద్రయాన్-3 విక్రమ్ ల్యాండర్ ఆగస్టు 23, 2023న సాయంత్రం 6:04 గంటలకు (IST) చంద్రుని దక్షిణ ధ్రువంపై విజయవంతంగా ల్యాండ్ అయింది. ప్రగ్యాన్ రోవర్ సల్ఫర్ ఉనికిని నిర్ధారించింది."
      };
    }
    if (detectedLang === 'bn-IN') {
      return {
        text: "যাচাইকৃত তথ্য অনুসারে: চন্দ্রযান-৩ এর বিক্রম ল্যান্ডার ২৩ আগস্ট ২০২৩ তারিখে সন্ধ্যা ৬:০৪ মিনিটে (IST) চাঁদের দক্ষিণ মেরুতে সফল সফট ল্যান্ডিং করে। প্রজ্ঞান রোভার চাঁদের মাটিতে সালফারের উপস্থিতি নিশ্চিত করে।"
      };
    }
    return {
      text: "According to verified records: Chandrayaan-3 successfully soft-landed near the lunar South Pole on August 23, 2023, at 18:04 IST. The Pragyan rover deployed shortly after, confirming the presence of sulphur and lunar minerals."
    };
  }

  // 9. If story with regional transcript is matched
  if (stories.length > 0 && stories[0].trans_body && detectedLang === 'hi-IN') {
    const firstSentence = stories[0].trans_body.split(/[।.\n]/)[0].trim();
    if (firstSentence) {
      return {
        text: `सत्यापित रिकॉर्ड के अनुसार: ${firstSentence}। आधिकारिक अपडेट के लिए isro.gov.in देखें।`
      };
    }
  }

  // 10. Default extraction from top knowledge entry
  if (topFact && topFact.body) {
    if (detectedLang === 'hi-IN') {
      return {
        text: `सत्यापित रिकॉर्ड के अनुसार: ${topFact.title} — ${topFact.body.slice(0, 200)}। अधिक विवरण के लिए isro.gov.in देखें।`
      };
    }
    return {
      text: `Based on verified records: ${topFact.body.slice(0, 220)}. For full details, check isro.gov.in.`
    };
  }

  // Generic fallback
  if (detectedLang === 'hi-IN') {
    return {
      text: "भारत का अंतरिक्ष कार्यक्रम लगातार ऐतिहासिक उपलब्धियां हासिल कर रहा है। 23 अगस्त 2023 को चंद्रयान-3 ने चंद्रमा के दक्षिणी ध्रुव पर सफल लैंडिंग की थी। आधिकारिक जानकारी के लिए isro.gov.in देखें।"
    };
  }

  return {
    text: "India's space program continues to reach historic milestones. Chandrayaan-3 successfully soft-landed near the lunar South Pole on 23 August 2023. For official updates, visit isro.gov.in."
  };
}

