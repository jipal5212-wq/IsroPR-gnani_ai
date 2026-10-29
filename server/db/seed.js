import { getDb } from './db.js';
import { synthesizeSpeech } from '../services/gnani/tts.js';
import path from 'node:path';
import fs from 'node:fs';
import { DIRS } from '../config.js';

export async function seedDatabase() {
  console.log('🌱 Seeding rich IsroPR stories and comprehensive ISRO knowledge base...');
  const db = getDb();

  // Retain Chandrayaan-3, Mangalyaan, and NVS-03 per user request
  db.prepare("DELETE FROM story_translations WHERE story_id NOT IN ('chandrayaan-3','mangalyaan','nvs-03')").run();
  db.prepare("DELETE FROM stories WHERE id NOT IN ('chandrayaan-3','mangalyaan','nvs-03')").run();

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
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `क्या आपने कभी रात के आसमान को देखकर सोचा है, कि उसके उस पार क्या होगा? इंसान सदियों से यही सवाल पूछता आया है। पहले लोग तारों को देखकर रास्ता ढूँढते थे, फिर दूरबीन आई, और आज हम दूसरे ग्रहों तक अपने यान भेज रहे हैं।

इंसान की असली फ़ितरत यही है, कि वो एक ही जगह बैठकर संतुष्ट नहीं होता। वो हमेशा आगे देखना चाहता है, और नए रास्ते खोजना चाहता है। इसी सोच से निकली है Chandrayaan-3 की कहानी। जुलाई 2023 की बात है। श्रीहरिकोटा के launch pad से एक rocket ने उड़ान भरी। उसके अंदर था Chandrayaan-3, और उसके साथ थे करोड़ों लोगों के सपने।

वहाँ बैठे scientists में से शायद ही किसी को उस रात ठीक से नींद आई हो। सबके मन में बस एक सवाल था: क्या हम वहाँ land कर पाएँगे, जहाँ अब तक कोई नहीं पहुँचा? सफ़र आसान नहीं था। यान कई हफ़्तों तक धीरे-धीरे अपना orbit बदलता रहा, जैसे कोई धीरे-धीरे किसी अपने के करीब आ रहा हो। और ज़मीन पर बैठी team हर पल उसकी खबर लेती रही।

फिर आया वो पल। 23 अगस्त 2023, शाम का वक़्त। Vikram नाम का lander चाँद की surface की तरफ़ बढ़ रहा था। उसके engine चले, और उसने अपनी speed धीरे-धीरे कम की। हर second एक फ़ैसला था। एक भी गलती, और सब कुछ खत्म हो सकता था। और फिर... lander ने चाँद को छू लिया। भारत चाँद के south pole के पास उतरने वाला पहला देश बन गया।

ये सिर्फ़ एक machine की जीत नहीं थी। ये उन हाथों की जीत थी, जिन्होंने सालों तक मेहनत की थी। Lander खुलने के बाद उसके अंदर से निकला Pragyan। एक छोटा सा rover, जो अपने six wheels के सहारे धीरे-धीरे चाँद की मिट्टी पर चला। उसने वहाँ की मिट्टी को परखा, और उसमें sulphur की मौजूदगी पकड़ी। ऐसी जानकारियाँ भेजीं, जो आने वाली पीढ़ियों के काम आएँगी।

ये कदम सिर्फ़ चाँद तक का नहीं है। ये इंसान के उस बड़े सपने का हिस्सा है, कि हम अपने ग्रह से बाहर जाकर ब्रह्मांड को समझें। धरती हमारा घर है, पर इंसान को सिर्फ़ इसी एक जगह तक सीमित नहीं रहना है। आज चाँद, कल मंगल, और उसके आगे न जाने कितने ग्रह और तारे। हर नई मंज़िल एक नया सवाल लेकर आती है।

Mission हमें एक बात सिखाता है। सपने बड़े हों, पर कदम सोच-समझकर रखे जाएँ। Chandrayaan-2 की कमियों से सीखकर ही team ने वो कर दिखाया, जो पहले नहीं हुआ था। Failure भी एक teacher होता है, अगर हम उससे सीखने को तैयार हों। और सबसे खूबसूरत बात? इस mission ने लाखों बच्चों की आँखों में सवाल जगा दिए। किसी ने पूछा, "चाँद की मिट्टी तक ये सब कैसे पहुँचा?" किसी ने सोचा, "मैं भी एक दिन scientist बनूँगा।" शायद यही असली कामयाबी है।

तो अगली बार जब रात को चाँद दिखे, तो उसे सिर्फ़ एक खूबसूरत नज़ारा मत समझिएगा। वो एक दरवाज़ा है, जो बताता है कि इंसान का सफ़र अभी शुरू हुआ है। और वो सफ़र हम सबका है।`
    },
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `Have you ever looked up at the night sky and wondered what lies beyond? For centuries, humanity has asked this very question. First, our ancestors navigated by the stars, then came the telescope, and today we send our spacecraft to other worlds.

The true nature of humanity is that we are never content to stand still in one place. We always yearn to look further, to discover new pathways. From this restless longing was born the story of Chandrayaan-3. It was July 2023. A rocket lifted off from the launchpad at Sriharikota. Inside rested Chandrayaan-3, and with it, the hopes and dreams of over a billion people.

Hardly any of the scientists gathered there that night could sleep. A single question echoed in every mind: could we land where no nation had ever set foot before? The journey was anything but simple. For weeks, the spacecraft gently adjusted its orbit, drawing closer and closer like someone reuniting with a loved one. Down on Earth, the team watched over its every move day and night.

And then came that moment. The evening of 23 August 2023. The lander named Vikram began its descent toward the lunar surface. Its engines roared to life, slowly bleeding away velocity. Every second was a crucial verdict. A single misjudgment, and everything could be lost. And then... the lander touched the lunar dust. India became the very first country to land near the Moon's south pole.

This was not merely the victory of a machine. It was the triumph of countless human hands that had laboured for years. Once the ramp lowered, out rolled Pragyan — a small six-wheeled rover gliding across the soft lunar soil. It examined the ground and confirmed the presence of sulphur. It sent back knowledge that will serve generations yet to come.

This step is not just about the Moon. It is part of humanity's grandest aspiration — to step beyond our home world and comprehend the cosmos. Earth is our home, but humanity cannot stay forever confined to a single haven. Today the Moon, tomorrow Mars, and beyond that, unfathomable worlds and stars.

Every new horizon brings a new question. This mission teaches us an enduring lesson: dream boldly, but tread with wisdom and precision. By learning from the setbacks of Chandrayaan-2, the team accomplished what had never been done before. Failure too is a great mentor, if only we have the courage to learn from it.

And the most beautiful thing of all? This mission ignited wonder in millions of young hearts. A child asked, "How did all this reach the lunar soil?" Another thought, "I too will become a scientist one day." Perhaps that is the truest triumph of all. So the next time you gaze upon the Moon in the night sky, do not see it as merely a luminous view. It is an open doorway, whispering that humanity's voyage has only just begun. And that voyage belongs to every single one of us.`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `இரவு வானை அண்ணாந்து பார்த்து, அதற்கு அப்பால் என்ன இருக்கும் என்று நீங்கள் எப்போதாவது யோசித்ததுண்டா? பல நூற்றாண்டுகளாக மனித இனம் இந்தக் கேள்வியை தொடர்ந்து கேட்டுக் கொண்டே இருக்கிறது. ஆரம்பத்தில் மனிதர்கள் நட்சத்திரங்களை வழிகாட்டிகளாகப் பார்த்தார்கள், பின்னர் தொலைநோக்கிகள் வந்தன, இன்றோ நாம் பிற உலகங்களுக்கு விண்கலங்களை அனுப்புகிறோம்.

ஒரே இடத்தில் திருப்தியடைந்து நின்றுவிடாமல் இருப்பதுதான் மனிதனின் இயல்பு. அவன் எப்போதும் தொலைநோக்குடன் பார்க்க விரும்புகிறான், புதிய பாதைகளைத் தேடுகிறான். இந்தத் தேடலிலிருந்தே சந்திரயான்-3 கதை பிறந்தது. அது 2023 ஜூலை மாதம். ஸ்ரீஹரிகோட்டாவின் ஏவுதளத்திலிருந்து ஒரு ராக்கெட் வானை நோக்கிப் பாய்ந்தது. அதனுள் இருந்தது சந்திரயான்-3, அதனோடு நூறு கோடிக்கும் அதிகமான மக்களின் கனவுகள்.

கட்டுப்பாட்டு அறையில் அமர்ந்திருந்த விஞ்ஞானிகளில் யாருக்கும் அந்த இரவில் தூக்கமே வரவில்லை. அனைவரின் மனதிலும் ஒரே ஒரு கேள்வி: இதுவரையில் எவரும் செல்லாத அந்த நிலவின் தென் துருவத்தில் நாம் தரை இறங்க முடியுமா? பயணம் எளிதானதாக இருக்கவில்லை. பல வாரங்களாக விண்கலம் தனது சுற்றுப்பாதையை படிப்படியாக மாற்றிக்கொண்டே நிலவை நெருங்கியது, ஒரு பிரியமானவரை நோக்கிச் செல்வது போல. பூமியில் இருந்த குழுவினர் ஒவ்வொரு கணமும் அதன் துடிப்பைக் கவனித்துக் கொண்டே இருந்தனர்.

பிறகு அந்தத் தருணம் வந்தது. 2023 ஆகஸ்ட் 23, மாலை நேரம். விக்ரம் என்ற லேண்டர் நிலவின் மேற்பரப்பை நோக்கி இறங்கத் தொடங்கியது. அதன் என்ஜின்கள் இயங்கி, வேகத்தை மெதுவாகக் குறைத்தன. ஒவ்வொரு விநாடியும் ஒரு முக்கியமான தீர்மானம். ஒரு சிறு தவறு நேர்ந்தாலும் எல்லாம் பாழாகிவிடும். அப்போது... லேண்டர் நிலவின் மண்ணைத் தொட்டது! நிலவின் தென் துருவத்தில் கால் பதித்த உலகின் முதல் நாடு என்ற பெருமையை இந்தியா பெற்றது.

இது வெறும் ஒரு இயந்திரத்தின் வெற்றி மட்டுமல்ல. பல ஆண்டுகள் அரும்பாடுபட்ட விஞ்ஞானிகளின் கைகளுக்குக் கிடைத்த மாபெரும் வெற்றி. லேண்டரின் கதவு திறந்து பிரக்யான் வெளியே வந்தது. ஆறு சக்கரங்களைக் கொண்ட அந்தச் சிறிய ரோவர் நிலவின் புழுதியில் மெதுவாக நகர்ந்தது. நிலவின் மண்ணை ஆராய்ந்து சல்பர் இருப்பதை உறுதி செய்தது. அது அனுப்பிய தகவல்கள் வரும் தலைமுறைகளுக்கும் வழிகாட்டும்.

இந்தப் பயணம் நிலவோடு முடிந்துவிடப் போவதில்லை. பூமியைத் தாண்டிப் பிரபஞ்சத்தைப் புரிந்துகொள்ள வேண்டும் என்ற மனிதனின் மாபெரும் கனவின் ஒரு பகுதி இது. பூமி நமது வீடு, ஆனால் மனிதன் இந்த ஒரு இடத்திலேயே அடங்கிப் போய்விட முடியாது. இன்று நிலவு, நாளை செவ்வாய், அதற்கும் அப்பால் எண்ணற்ற கிரகங்களும் நட்சத்திரங்களும்.

ஒவ்வொரு புதிய இலக்கும் ஒரு புதிய கேள்வியைக் கொண்டுவருகிறது. சந்திரயான்-3 நமக்கு ஒரு பாடம் கற்பிக்கிறது: பெரிய கனவுகளைக் காணுங்கள், ஆனால் கவனத்துடனும் நிதானத்துடனும் முன்னேறுங்கள். சந்திரயான்-2ன் பின்னடைவுகளிலிருந்து கற்றுக்கொண்டதால்தான் இந்த வரலாற்று வெற்றியைப் பெற முடிந்தது. தோல்வியும் ஒரு நல்ல ஆசான்தான், நாம் அதிலிருந்து கற்றுக்கொள்ளத் துணிந்தால்.

அனைத்திலும் அழகான விஷயம் என்ன தெரியுமா? இந்தத் திட்டம் கோடிக்கணக்கான குழந்தைகளின் கண்களில் புதிய வெளிச்சத்தை ஏற்றியுள்ளது. "நிலவின் மண்ணில் எப்படி இறங்குவது?" என்று ஒரு குழந்தை கேட்கிறது. "நானும் ஒரு நாள் விண்வெளி விஞ்ஞானி ஆவேன்" என்று இன்னொரு குழந்தை கனவு காண்கிறது. ஒருவேளை அதுதான் உண்மையான வெற்றியாக இருக்கும். எனவே அடுத்த முறை இரவு வானில் நிலவைப் பார்க்கும்போது, அதை வெறும் அழகிய காட்சியாக மட்டும் பார்க்காதீர்கள். அது ஒரு திறந்த வாசல், மனிதனின் மாபெரும் பயணம் இப்போதுதான் தொடங்கியுள்ளது என்பதை நமக்கு நினைவூட்டுகிறது. அந்தப் பயணம் நம் அனைவருக்கும் உரியது.`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `రాత్రి వేళ ఆకాశం వైపు చూసి, ఆ అవతల ఏముంటుందో అని మీరు ఎప్పుడైనా ఆలోచించారా? శతాబ్దాలుగా మానవజాతి ఇదే ప్రశ్న అడుగుతూ ఉంది. పూర్వం నక్షత్రాలను చూసి దారులు వెతుక్కునేవారు, ఆ తర్వాత టెలిస్కోప్ వచ్చింది, నేడు మనం ఇతర గ్రహాలకు నౌకలను పంపుతున్నాం.

ఒకే చోట ఆగిపోకుండా ఉండటమే మనిషి నిజమైన నైజం. ఎల్లప్పుడూ ముందుకు చూడాలని, సరికొత్త దారులు వెతకాలని తపిస్తుంటాడు. ఈ ఆలోచన నుండే చంద్రయాన్-3 కథ పుట్టింది. 2023 జూలై నెల. శ్రీహరికోట లాంచ్‌ప్యాడ్ నుండి ఒక రాకెట్ ఆకాశంలోకి దూసుకెళ్ళింది. దాని లోపల చంద్రయాన్-3 ఉంది, దానితో పాటు వంద కోట్ల మంది ప్రజల ఆశలు, కలలు ఉన్నాయి.

ఆ రాత్రి కంట్రోల్ రూమ్‌లో ఉన్న శాస్త్రవేత్తలలో ఎవరికీ నిద్ర పట్టలేదు. అందరి మనసుల్లో ఒకటే ప్రశ్న: ఇప్పటివరకు ఏ దేశమూ చేరని చోట మనం దిగగలమా? ప్రయాణం అంత సులువేమీ కాదు. వారాల తరబడి అంతరిక్ష నౌక నిదానంగా కక్ష్యను మార్చుకుంటూ చంద్రుని వైపు సాగింది, తన వారిని చేరుకోవడానికి వెళ్తున్నట్లుగా. భూమిపై ఉన్న బృందం ప్రతి క్షణం దాని గమనాన్ని గమనిస్తూనే ఉంది.

ఇక ఆ క్షణం రానే వచ్చింది. 23 ఆగస్టు 2023, సాయంత్రం వేళ. విక్రమ్ అనే ల్యాండర్ చంద్రుని ఉపరితలం వైపు దిగడం ప్రారంభించింది. ఇంజన్లు మండి, వేగాన్ని క్రమంగా తగ్గించాయి. ప్రతి సెకను ఒక కీలక పరీక్ష. ఒక్క చిన్న పొరపాటు జరిగినా సర్వం నాశనమయ్యేది. కానీ... ల్యాండర్ చంద్రుడి నేలను ముద్దాడింది! చంద్రుని దక్షిణ ధ్రువానికి చేరుకున్న ప్రపంచంలోనే తొలి దేశంగా భారతదేశం చరిత్ర సృష్టించింది.

ఇది కేవలం ఒక యంత్రం విజయం మాత్రమే కాదు. ఏళ్ల తరబడి శ్రమించిన వేలాది శాస్త్రవేత్తల చేతుల విజయం. ల్యాండర్ తలుపులు తెరుచుకున్నాక లోపలి నుండి ప్రగ్యాన్ రోవర్ బయటకు వచ్చింది. ఆరు చక్రాల ఆ చిన్న రోవర్ చంద్రుని నేలపై నెమ్మదిగా కదిలింది. అక్కడి మట్టిని పరీక్షించి సల్ఫర్ ఉనికిని నిర్ధారించింది. రాబోయే తరాలకు ఉపయోగపడే అద్భుతమైన సమాచారాన్ని పంపింది.

ఈ అడుగు కేవలం చంద్రుని వరకే కాదు. మన భూమిని దాటి విశ్వాన్ని అర్థం చేసుకోవాలనే మానవాళి గొప్ప సంకల్పంలో ఇది ఒక భాగం. భూమి మన నివాసం, కానీ మనిషి ఒక్కచోటే పరిమితమై ఉండిపోలేడు. నేడు చంద్రుడు, రేపు అంగారకుడు, ఆపై ఎన్నో కొత్త లోకాలు మరియు నక్షత్రాలు. ప్రతి కొత్త గమ్యమూ సరికొత్త ప్రశ్నను తెస్తుంది.

చంద్రయాన్-3 మనకు ఒక గొప్ప పాఠం నేర్పుతుంది: కలలు పెద్దవిగా ఉండాలి, కానీ అడుగులు ఆలోచించి వేయాలి. చంద్రయాన్-2 అనుభవాల నుండి నేర్చుకున్నందునే ఈ చారిత్రక విజయం సాధ్యమైంది. మనం నేర్చుకోవడానికి సిద్ధంగా ఉంటే ఓటమి కూడా ఒక ఉత్తమ గురువుగా మారుతుంది.

అన్నింటికంటే అందమైన విషయమేమిటంటే? ఈ మిషన్ కోట్లాది మంది పిల్లల కళ్లలో ఆశలు రేకెత్తించింది. "చంద్రుడి నేల మీదకి ఇవన్నీ ఎలా వెళ్లాయి?" అని ఒకరు అడిగారు. "నేను కూడా ఒక రోజు శాస్త్రవేత్త అవుతాను" అని మరొకరు భావించారు. బహుశా అదే నిజమైన విజయం. అందుకే తదుపరిసారి రాత్రి ఆకాశంలో చంద్రుడిని చూసినప్పుడు, అతన్ని కేవలం ఒక అందమైన దృశ్యంగా భావించకండి. మానవుడి ప్రయాణం ఇప్పుడే మొదలైందని గుర్తుచేసే తెరిచిన ద్వారం అది. ఆ ప్రయాణం మనందరిదీ.`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `রাতের আকাশের দিকে তাকিয়ে কখনো কি ভেবেছেন, এর ওপারে ঠিক কী আছে? মানুষ শতাব্দীর পর শতাব্দী ধরে এই একটাই প্রশ্ন করে আসছে। আগে মানুষ তারাদের দেখে দিক নির্ণয় করত, তারপর এলো দূরবীন, আর আজ আমরা ভিনগ্রহে মহাকাশযান পাঠাচ্ছি।

মানুষের আসল স্বভাবই হলো এক জায়গায় থমকে না থাকা। সে সবসময় আরও দূরে দেখতে চায়, নতুন পথের সন্ধান পেতে চায়। ঠিক এই ভাবনা থেকেই জন্ম নিয়েছে চন্দ্রযান-৩ এর গল্প। ২০২৩ সালের জুলাই মাসের কথা। শ্রীহরিকোটার উৎক্ষেপণ কেন্দ্র থেকে একটি রকেট মেঘ চিরে উড়ে গেল। তার ভেতরে ছিল চন্দ্রযান-৩, আর তার সাথে ছিল একশো কোটিরও বেশি মানুষের স্বপ্ন।

কন্ট্রোল রুমে বসা বিজ্ঞানীদের মধ্যে বোধহয় সেদিন রাতে কারো চোখেই ঘুম ছিল না। সবার মনে শুধু একটাই প্রশ্ন ঘুরছিল: যেখানে আজ পর্যন্ত কোনো দেশ পৌঁছাতে পারেনি, সেখানে কি আমরা নামতে পারব? যাত্রাটা মোটেও সহজ ছিল না। কয়েক সপ্তাহ ধরে মহাকাশযানটি ধীরে ধীরে তার কক্ষপথ বদলাতে বদলাতে চাঁদের কাছে এগিয়ে গেল, যেন ভালোবাসার মানুষের কাছে কোনো প্রিয়জন এগিয়ে চলেছে। আর পৃথিবীর মাটিতে বসে থাকা দলটা প্রতিটি মুহূর্তের খবর রাখছিল।

তারপর এলো সেই অবিস্মরণীয় ক্ষণ। ২৩ আগস্ট ২০২৩, বিকেলবেলা। বিক্রম নামের ল্যান্ডারটি চাঁদের পৃষ্ঠের দিকে নামতে শুরু করল। তার ইঞ্জিনগুলো জ্বলে উঠল, আর ধীরে ধীরে গতি কমিয়ে আনতে লাগল। প্রতিটি সেকেন্ড ছিল একেকটা কঠিন সিদ্ধান্ত। একটাই ভুল, আর চোখের নিমেষে সব শেষ হয়ে যেতে পারত। আর তারপর... ল্যান্ডারটি চাঁদের মাটি স্পর্শ করল! চাঁদের দক্ষিণ মেরুতে পৌঁছানো পৃথিবীর প্রথম দেশ হিসেবে ভারত ইতিহাস তৈরি করল।

এটা শুধু একটা যন্ত্রের জয় ছিল না। এটা ছিল সেই অগুনতি হাতের জয়, যারা বছরের পর বছর অক্লান্ত পরিশ্রম করেছিলেন। ল্যান্ডার খোলার পর ভেতর থেকে বেরিয়ে এলো প্রজ্ঞান। ছয় চাকার ছোট্ট একটি রোভার, যা চাঁদের ধুলোয় ধীরে ধীরে পথ চলতে শুরু করল। সেখানের মাটির পরীক্ষা করে সে সালফারের অস্তিত্ব আবিষ্কার করল। এমন সব বৈজ্ঞানিক তথ্য পাঠাল, যা আগামী বহু প্রজন্মের গবেষণার কাজে লাগবে।

এই পদক্ষেপটি শুধু চাঁদে পৌঁছানোর নয়। এটা মানুষের সেই বিশাল স্বপ্নের অংশ, যা আমাদের পৃথিবীর বাইরে নিয়ে গিয়ে এই মহাবিশ্বকে বুঝতে শেখায়। পৃথিবী আমাদের ঘর, কিন্তু মানুষ কেবল একটা সীমানার ভেতর বন্দি হয়ে থাকতে পারে না। আজ চাঁদ, কাল মঙ্গল, আর তারও পরে কত অজানা গ্রহ আর নক্ষত্র! প্রতিটি নতুন গন্তব্য একেকটা নতুন প্রশ্ন নিয়ে আসে।

এই অভিযান আমাদের একটা গভীর শিক্ষা দেয়: স্বপ্ন বড় হওয়া উচিত, কিন্তু পথ চলতে হবে ভেবেচিন্তে ও নিখুঁত পদক্ষেপে। চন্দ্রযান-২ এর ব্যর্থতা থেকে শিক্ষা নিয়েই বিজ্ঞানীরা এমন এক ইতিহাস গড়লেন যা আগে কখনো ঘটেনি। ব্যর্থতাও একজন মহান শিক্ষক, যদি আমরা তার কাছ থেকে শিখতে প্রস্তুত থাকি।

আর সবচেয়ে সুন্দর কথা কী জানেন? এই অভিযান কোটি কোটি শিশুর চোখে নতুন স্বপ্ন এঁকে দিয়েছে। কেউ জানতে চেয়েছে, "চাঁদের মাটিতে ওটা কেমন করে পৌঁছাল?" কেউ ভেবেছে, "আমিও একদিন বিজ্ঞানী হব।" এটাই বোধহয় সবচেয়ে বড় সার্থকতা। তাই পরের বার যখন রাতের আকাশে চাঁদের দিকে তাকাবেন, তাকে কেবল সুন্দর একটা দৃশ্য ভাববেন না। ওটা একটা খোলা দরজা, যা আমাদের মনে করিয়ে দেয় মানুষের এই অনন্ত যাত্রা সবেমাত্র শুরু হয়েছে। আর এই যাত্রা আমাদের সবার।`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `ರಾತ್ರಿ ಆಕಾಶವನ್ನು ನೋಡಿ, ಅದರ ಆಚೆಗೆ ಏನಿರಬಹುದು ಎಂದು ನೀವು ಎಂದಾದರೂ ಯೋಚಿಸಿದ್ದೀರಾ? ಶತಮಾನಗಳಿಂದಲೂ ಮಾನವ ಇದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳುತ್ತಲೇ ಬಂದಿದ್ದಾನೆ. ಮೊದಲು ನಕ್ಷತ್ರಗಳನ್ನು ನೋಡಿ ದಾರಿ ಹುಡುಕುತ್ತಿದ್ದೆವು, ಆಮೇಲೆ ದೂರದರ್ಶಕ ಬಂತು, ಮತ್ತು ಇಂದು ನಾವು ಇತರ ಗ್ರಹಗಳಿಗೇ ಗಗನನೌಕೆಗಳನ್ನು ಕಳುಹಿಸುತ್ತಿದ್ದೇವೆ.

ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಕುಳಿತು ತೃಪ್ತಿಪಡದಿರುವುದೇ ಮಾನವನ ನೈಜ ಸ್ವಭಾವ. ಅವನು ಯಾವಾಗಲೂ ಮುಂದೆ ನೋಡಲು ಮತ್ತು ಹೊಸ ಮಾರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಹಂಬಲಿಸುತ್ತಾನೆ. ಇದೇ ಚಿಂತನೆಯಿಂದ ಚಂದ್ರಯಾನ-3 ಕಥೆ ಹುಟ್ಟಿಕೊಂಡಿತು. ಅದು ಜುಲೈ 2023. ಶ್ರೀಹರಿಕೋಟಾದ ಉಡಾವಣಾ ವೇದಿಕೆಯಿಂದ ಒಂದು ಬೃಹತ್ ರಾಕೆಟ್ ನಭಕ್ಕೆ ನೆಗೆಯಿತು. ಅದರೊಳಗೆ ಚಂದ್ರಯಾನ-3 ಇತ್ತು, ಮತ್ತು ಅದರೊಂದಿಗೆ ಕೋಟ್ಯಂತರ ಭಾರತೀಯರ ನಂಬಿಕೆ ಮತ್ತು ಕನಸುಗಳಿದ್ದವು.

ನಿಯಂತ್ರಣ ಕೊಠಡಿಯಲ್ಲಿದ್ದ ವಿಜ್ಞಾನಿಗಳಲ್ಲಿ ಆ ರಾತ್ರಿ ಯಾರೊಬ್ಬರಿಗೂ ಸರಿಯಾಗಿ ನಿದ್ದೆಯೇ ಬರಲಿಲ್ಲ. ಪ್ರತಿಯೊಬ್ಬರ ಮನಸ್ಸಿನಲ್ಲೂ ಒಂದೇ ಪ್ರಶ್ನೆ: ಇದುವರೆಗೆ ಯಾವ ದೇಶವೂ ತಲುಪದ ಸ್ಥಳದಲ್ಲಿ ನಾವು ಯಶಸ್ವಿಯಾಗಿ ಇಳಿಯಲು ಸಾಧ್ಯವೇ? ಪ್ರಯಾಣ ಸುಲಭವಾಗಿರಲಿಲ್ಲ. ವಾರಗಳ ಕಾಲ ಗಗನನೌಕೆ ನಿಧಾನವಾಗಿ ತನ್ನ ಕಕ್ಷೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತಾ ಚಂದ್ರನ ಸನಿಹಕ್ಕೆ ಸಾಗಿತು, ಪ್ರೀತಿಯ ವ್ಯಕ್ತಿಯನ್ನು ಭೇಟಿಯಾಗಲು ಹೋಗುವಂತೆ. ನೆಲದ ಮೇಲಿದ್ದ ಇಡೀ ತಂಡ ಪ್ರತಿಯೊಂದು ಕ್ಷಣವೂ ಅದರ ಚಲನವಲನವನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸುತ್ತಿತ್ತು.

ಅಂತಿಮವಾಗಿ ಆ ನಿರ್ಣಾಯಕ ಕ್ಷಣ ಬಂದೇ ಬಿಟ್ಟಿತು. 23 ಆಗಸ್ಟ್ 2023, ಸಂಜೆಯ ಸಮಯ. ವಿಕ್ರಮ್ ಹೆಸರಿನ ಲ್ಯಾಂಡರ್ ಚಂದ್ರನ ಮೇಲ್ಮೈ ಕಡೆಗೆ ಇಳಿಯಲಾರಂಭಿಸಿತು. ಅದರ ಎಂಜಿನ್‌ಗಳು ಉರಿದು ವೇಗವನ್ನು ನಿಧಾನವಾಗಿ ಕಡಿಮೆ ಮಾಡಿದವು. ಪ್ರತಿಯೊಂದು ಸೆಕೆಂಡೂ ಒಂದು ಅಗ್ನಿಪರೀಕ್ಷೆಯಾಗಿತ್ತು. ಒಂದೇ ಒಂದು ಸಣ್ಣ ತಪ್ಪು ನಡೆದರೂ ಎಲ್ಲವೂ ನಾಶವಾಗಬಹುದಿತ್ತು. ಮತ್ತು ಕೊನೆಗೆ... ಲ್ಯಾಂಡರ್ ಚಂದ್ರನ ಮಣ್ಣನ್ನು ಮೃದುವಾಗಿ ಸ್ಪರ್ಶಿಸಿತು! ಚಂದ್ರನ ದಕ್ಷಿಣ ಧ್ರುವದ ಬಳಿ ಇಳಿದ ವಿಶ್ವದ ಮೊದಲ ರಾಷ್ಟ್ರವಾಗಿ ಭಾರತ ಇತಿಹಾಸ ಸೃಷ್ಟಿಸಿತು.

ಇದು ಕೇವಲ ಒಂದು ಯಂತ್ರದ ವಿಜಯವಾಗಿರಲಿಲ್ಲ. ವರ್ಷಗಟ್ಟಲೆ ಶ್ರಮಿಸಿದ ವಿಜ್ಞಾನಿಗಳ ಕೈಗಳ ವಿಜಯವಾಗಿತ್ತು. ಲ್ಯಾಂಡರ್ ತೆರೆದ ನಂತರ ಅದರೊಳಗಿಂದ ಹೊರಬಂದದ್ದು ಪ್ರಜ್ಞಾನ್. ಆರು ಚಕ್ರಗಳ ಆ ಪುಟ್ಟ ರೋವರ್ ಚಂದ್ರನ ಮಣ್ಣಿನ ಮೇಲೆ ನಿಧಾನವಾಗಿ ಹೆಜ್ಜೆ ಇಟ್ಟಿತು. ಅಲ್ಲಿನ ಮಣ್ಣನ್ನು ಪರೀಕ್ಷಿಸಿ ಗಂಧಕದ (ಸಲ್ಫರ್) ಇರುವಿಕೆಯನ್ನು ದೃಢಪಡಿಸಿತು. ಭವಿಷ್ಯದ ಪೀಳಿಗೆಗೆ ಮಾರ್ಗದರ್ಶಿಯಾಗುವಂತಹ ಅಮೂಲ್ಯ ಮಾಹಿತಿಯನ್ನು ಅದು ಭೂಮಿಗೆ ರವಾನಿಸಿತು.

ಈ ಹೆಜ್ಜೆ ಕೇವಲ ಚಂದ್ರನಿಗೆ ಸೀಮಿತವಲ್ಲ. ಇದು ನಮ್ಮ ಗ್ರಹದ ಆಚೆಗೆ ಸಾಗಿ ಇಡೀ ಬ್ರಹ್ಮಾಂಡವನ್ನು ಅರ್ಥೈಸಿಕೊಳ್ಳಬೇಕೆಂಬ ಮಾನವನ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಭಾಗವಾಗಿದೆ. ಭೂಮಿ ನಮ್ಮ ನೆಲೆ ನಿಜ, ಆದರೆ ಮಾನವ ಒಂದೇ ಕಡೆ ಸೀಮಿತವಾಗಿ ಉಳಿಯಲು ಸಾಧ್ಯವಿಲ್ಲ. ಇಂದು ಚಂದ್ರ, ನಾಳೆ ಮಂಗಳ, ಮತ್ತು ಅದರ ಆಚೆಗೂ ಅಗಣಿತ ಲೋಕಗಳು ಮತ್ತು ತಾರೆಗಳು. ಪ್ರತಿಯೊಂದು ಹೊಸ ಗಮ್ಯವೂ ಹೊಸ ಪ್ರಶ್ನೆಗಳನ್ನು ಹೊತ್ತು ತರುತ್ತದೆ.

ಚಂದ್ರಯಾನ-3 ನಮಗೊಂದು ಶಾಶ್ವತ ಪಾಠ ಕಲಿಸುತ್ತದೆ: ಕನಸುಗಳು ದೊಡ್ಡದಾಗಿರಲಿ, ಆದರೆ ಹೆಜ್ಜೆಗಳನ್ನು ಯೋಚಿಸಿ ಮತ್ತು ಜಾಗರೂಕತೆಯಿಂದ ಇಡಿ. ಚಂದ್ರಯಾನ-2 ರ ಹಿನ್ನಡೆಗಳಿಂದ ಕಲಿತ ಪಾಠವೇ ಈ ಐತಿಹಾಸಿಕ ಸಾಧನೆಗೆ ದಾರಿ ಮಾಡಿಕೊಟ್ಟಿತು. ನಾವು ಕಲಿಯಲು ಸಿದ್ಧರಿದ್ದರೆ ಸೋಲು ಕೂಡ ಅದ್ಭುತ ಗುರುವಾಗುತ್ತದೆ.

ಎಲ್ಲಕ್ಕಿಂತ ಸುಂದರವಾದ ವಿಷಯವೇನೆಂದರೆ? ಈ ಮಿಷನ್ ಕೋಟ್ಯಂತರ ಮಕ್ಕಳ ಮನಸ್ಸಿನಲ್ಲಿ ಹೊಸ ಜಿಜ್ಞಾಸೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕಿತು. "ಚಂದ್ರನ ಮಣ್ಣಿಗೆ ಇದೆಲ್ಲ ಹೇಗೆ ತಲುಪಿತು?" ಎಂದು ಮಗುವೊಂದು ಕೇಳಿತು. "ನಾನೂ ಒಂದು ದಿನ ಬಾಹ್ಯಾಕಾಶ ವಿಜ್ಞಾನಿ ಆಗುತ್ತೇನೆ" ಎಂದು ಮತ್ತೊಂದು ಮಗು ಕನಸು ಕಂಡಿತು. ಪ್ರಾಯಶಃ ಅದೇ ನಿಜವಾದ ಗೆಲುವು. ಆದ್ದರಿಂದ ಮುಂದಿನ ಬಾರಿ ರಾತ್ರಿ ಆಕಾಶದಲ್ಲಿ ಚಂದ್ರನನ್ನು ನೋಡಿದಾಗ, ಅದನ್ನು ಕೇವಲ ಒಂದು ಸುಂದರ ದೃಶ್ಯವೆಂದು ಭಾವಿಸಬೇಡಿ. ಅದು ಒಂದು ತೆರೆದ ಬಾಗಿಲು, ಮಾನವನ ಮಹಾಯಾತ್ರೆ ಈಗಷ್ಟೇ ಪ್ರಾರಂಭವಾಗಿದೆ ಎಂದು ನೆನಪಿಸುವ ಬಾಗಿಲು. ಮತ್ತು ಆ ಯಾತ್ರೆ ನಮ್ಮೆಲ್ಲರದ್ದು.`
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

  // ============================================================
  // STORY: NVS-03 (NavIC Constellation & Pyro Valve Gambit)
  // ============================================================
  const storyNvs03 = {
    id: 'nvs-03',
    title: 'NVS-03: NavIC Constellation & The Pyro Valve Gambit',
    summary: 'How ISRO took a daring 51-year first gamble on GSLV-F18 to secure India\'s sovereign navigation system after the heartbreak of NVS-02.',
    category: 'upcoming-ongoing',
    facts_as_of: '2026-10-30',
    sources: JSON.stringify(['https://www.isro.gov.in/NVS-03.html', 'https://www.indianspaceflight.in/']),
    cover_path: 'nvs-03-cover.jpg',
    duration_hint_min: 9,
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
  `).run(storyNvs03);

  const nvs03Translations = [
    {
      lang: 'hi-IN',
      voice: 'Shivani',
      body: `1999 का साल था। कारगिल की पहाड़ियों पर भारतीय सेना लड़ रही थी। उस वक़्त commanders को ज़रूरत थी exact location की, दुश्मन कहाँ है, हमारे जवान कहाँ हैं। उन्होंने America के GPS system से मदद माँगी। और America ने मना कर दिया। उस दिन भारत के decision makers को एहसास हुआ कि technology में दूसरों पर depend रहना कितना ख़तरनाक है। किसी और का system, किसी और की शर्तों पर चलता है। उसी दिन एक सपना बोया गया। भारत का अपना navigation system बनाने का सपना। जो किसी की इजाज़त पर न चले।

उसी सपने से निकला NavIC, यानी Navigation with Indian Constellation। सीधे शब्दों में कहें तो भारत का अपना GPS। ये system India और उसके आसपास 1,500 किलोमीटर तक की exact location बता सकता है। चाहे वो एक जवान हो border पर, एक किसान हो खेत में, या एक ship हो समुद्र में। NavIC सिर्फ़ रास्ता नहीं दिखाता। ये भारत की strategic independence का एक हिस्सा है। Defence से लेकर disaster management तक, fishing boats से लेकर आपके phone तक, सबमें इसका इस्तेमाल हो सकता है।

पर NavIC की राह आसान नहीं रही। इस system को ठीक से चलाने के लिए कम से कम सात satellites की ज़रूरत है। कुछ पुराने satellites ने अपनी उम्र पूरी कर ली। IRNSS-1H को PSLV से launch किया गया था, पर rocket का protective heat shield अलग नहीं हुआ और वो mission fail हो गया। फिर NVS-02 की बारी आई, जिसके बारे में हम आगे बात करेंगे। आज की तारीख़ में parliament में सरकार ने माना कि NavIC में सिर्फ़ तीन satellites ही काम कर रहे हैं। और independent positioning के लिए चार चाहिए। यानी अभी भारत अपने GPS पर पूरी तरह depend नहीं कर सकता।

अब थोड़ा उस rocket के बारे में जानते हैं जो NVS-03 को अंतरिक्ष में ले जाएगा। इसका नाम है GSLV, यानी Geosynchronous Satellite Launch Vehicle। ये तीन stages वाला rocket है, लगभग 50 मीटर लंबा, और lift-off के वक़्त इसका वज़न होता है करीब 420 tonnes। सोचिए, एक भरी हुई passenger train जितना वज़न, और वो सब आसमान में उठाना होता है। इसकी 20वीं flight होगी ये। GSLV का काम है heavy navigation और communication satellites को geosynchronous transfer orbit तक पहुँचाना, जहाँ से satellite खुद अपने engine से अपनी final जगह पर जाता है।

29 जनवरी 2025। GSLV-F15 rocket Sriharikota से उड़ा। उसमें था NVS-02, करीब 2,235 किलोग्राम का navigation satellite। Rocket ने अपना काम बेहतरीन तरीक़े से किया। NVS-02 को geosynchronous transfer orbit में सही जगह छोड़ दिया। सब ठीक था। Team ख़ुश थी। पर उसके बाद satellite को अपनी final orbit तक जाने के लिए खुद अपना engine चलाना था। और वो engine कभी नहीं चला। NVS-02 वहीं अटक गया, एक अधूरे सफ़र में, बेकार। करोड़ों रुपये का satellite, orbit में घूमता रहा, पर किसी काम का नहीं।

ISRO ने जाँच बैठाई। Apex Committee बनाई। हफ़्तों की जाँच के बाद पता चला असली वजह। Satellite के engine तक oxidiser, यानी एक ज़रूरी chemical, पहुँचाने का रास्ता एक special valve से बंद था। इसे कहते हैं pyro valve। ये valve एक electrical signal मिलने पर खुलता है। वो signal satellite को गया। पर valve तक पहुँचा ही नहीं। क्योंकि बीच में एक connector के contacts अलग हो गए थे। Main path भी fail, backup path भी fail। बस इतनी सी बात। एक connector, कुछ loose contacts। और पूरा mission बर्बाद।

थोड़ा समझते हैं ये pyro valve क्या होता है। सोचिए आपके घर में gas cylinder का valve। जब तक बंद है, gas नहीं निकलती। खोलो तो gas बहती है। Satellite में भी कुछ ऐसा ही होता है। Fuel और oxidiser tanks में बंद रहते हैं launch के दौरान, ताकि कोई leak न हो। जब सही वक़्त आए, एक electrical signal भेजा जाता है। उस signal से एक tiny explosive जलती है, जो valve को एक बार के लिए खोल देती है। और ये valve एक बार खुल जाए तो बंद नहीं होता। Single-use होता है। NVS-02 में यही signal कभी valve तक पहुँचा ही नहीं।

अब सवाल था, NVS-03 के साथ क्या करें। वही पुराना तरीका अपनाएँ, और risk लें कि शायद फिर वही failure हो? ISRO ने एक ऐसा फ़ैसला लिया जो उसकी 51 साल की satellite launch history में पहली बार हो रहा है। NVS-03 के pyro valves को launch से पहले ही खुली अवस्था में fire कर दिया गया है। मतलब वो signal जो NVS-02 में fail हुआ था, उसकी ज़रूरत ही अब नहीं पड़ेगी। Valve पहले से ही open है। ये decision आसान नहीं था। ये एक engineer का वो जवाब है जो वो तब देता है जब वो पूरी रात सो नहीं पाता और बार-बार एक ही सवाल पूछता है, कि इस बार क्या अलग करें।

पर इस फ़ैसले के साथ एक नई चुनौती भी आई। कुछ experts ने concern जताया। जब valve पहले से खुला है, तो fuel और oxidiser एक downstream valve, जिसे latch valve कहते हैं, उस तक पहुँच जाते हैं। अब सारा दारोमदार उस latch valve पर है। अगर वो space में नहीं खुला, तो mission फिर fail। और एक और concern है। Launch के दौरान rocket में बहुत तेज़ vibration होती है। उस vibration में open valve से propellant लीक होने का छोटा सा risk रहता है। ISRO की team ने ground पर endless tests किए, vibration withstand tests, shock tests, seal verification। तब जाकर green light मिली।

अब थोड़ा जानते हैं NVS-03 के बारे में। इसका वज़न है करीब 2,250 किलोग्राम। इसमें लगा है एक indigenous Rubidium atomic clock। ये clock Ahmedabad के Space Applications Centre ने खुद बनाई है। Navigation satellite के लिए clock उसकी धड़कन होती है। जितनी accurate घड़ी, उतनी accurate location। अगर घड़ी में एक microsecond का फ़र्क आया, तो ज़मीन पर 300 मीटर का error हो सकता है। इसके अलावा इसमें L1, L5 और S-band signals हैं, जो civilian GPS receivers और high-security military devices दोनों के लिए काम करेंगे।

इस सब के बीच एक और मुश्किल आई, Cyclone Arnab। अक्टूबर के आखिरी हफ़्ते में Bay of Bengal में एक deep depression बना जो Cyclone Arnab में बदल गया। Sriharikota के तट पर तेज़ हवाएँ और भारी बारिश शुरू हो गई। Launch vehicle और satellite Mobile Service Tower के अंदर सुरक्षित थे, पर launch campaign का schedule tight था। Team ने दिन-रात एक करके humidity control, electrical shielding और launch pad preparations को maintain किया। मौसम ने परीक्षा ली, पर engineers पीछे नहीं हटे।

जब GSLV-F18 Sriharikota से उड़ेगा, तो वो NVS-03 को geosynchronous transfer orbit में छोड़ देगा। असली खेल वहाँ से शुरू होगा। Satellite के Liquid Apogee Motor यानी LAM engine को तीन बार fire किया जाएगा। इस बार pyro valve का कोई डर नहीं, वो पहले से खुला है। Latch valve खुलेगा, fuel बहेगा, और engine satellite को circular geostationary orbit में पहुँचाएगा, ज़मीन से करीब 36,000 किलोमीटर ऊपर। उस ऊंचाई पर पहुँचकर satellite के solar panels खुलेंगे और Indian Space Research Organisation का signal धरती पर आएगा।

अगर NVS-03 सफल होता है, तो इसका असर सिर्फ़ एक satellite तक नहीं रहेगा। NavIC constellation में working satellites की संख्या चार हो जाएगी, जो independent positioning के लिए minimum requirement है। इसके बाद NVS-04, 05 और 06 planned हैं। ये mission साबित करेगा कि ISRO एक failure के बाद रुकता नहीं है, बल्कि deeper engineering solutions निकालता है। ये launch भारत के हर नागरिक के phone, हर aircraft के navigation, और border पर खड़े हर जवान की safety से जुड़ा है।

30 अक्टूबर की रात जब वो rocket उड़ेगा, तो उसमें सिर्फ़ एक satellite नहीं होगा। उसमें होंगे उन engineers के सालों के effort, जो NVS-02 की failure के बाद टूटे नहीं, बल्कि और मज़बूती से वापस आए। उसमें होगी उन scientists की लगन, जिन्होंने हर गलती को ध्यान से पढ़ा और उससे सीखा। उसमें होगा भारत का वो सपना, जो 1999 में एक ज़रूरत से पैदा हुआ था। रात के उस एक पल में, Sriharikota के आसमान में एक रोशनी उठेगी। और उस रोशनी के साथ उठेगी करोड़ों लोगों की उम्मीद। क्योंकि ये सिर्फ़ एक launch नहीं है। ये भारत का अपने आप पर भरोसा है।`
    },
    {
      lang: 'en-IN',
      voice: 'Shivani',
      body: `The story begins in 1999. In the treacherous heights of Kargil, the Indian armed forces were fighting a fierce battle. Military commanders critically required precision satellite coordinates to pinpoint enemy positions and track our advancing troops. India approached the United States for access to GPS satellite data. The United States refused. On that defining day, Indian leaders realized the perilous danger of depending on foreign technology. Someone else's system will always run on someone else's terms. Right then, a dream was conceived: India must build its own satellite navigation constellation, independent of anyone's permission.

From that resolute conviction rose NavIC — Navigation with Indian Constellation, or in simple words, India's sovereign GPS. The system provides real-time positional accuracy across India and extends 1,500 kilometers beyond its borders. Whether for a soldier guarding the frozen frontiers, a farmer surveying fields, or a commercial vessel sailing the high seas, NavIC delivers precision. Beyond navigation, NavIC embodies India's strategic self-reliance across national defence, disaster management, maritime safety, and mobile consumer technology.

Yet the road for NavIC has faced daunting hurdles. To function effectively, the constellation requires at least seven operational satellites. Over the years, early spacecraft completed their lifespans. IRNSS-1H was lost when the PSLV payload fairing failed to separate. And then came NVS-02. Recently, the government acknowledged in Parliament that only three satellites remain operational, whereas a minimum of four is necessary for an independent position fix. India cannot yet rely fully on its indigenous constellation.

The heavy lifter tasked with carrying NVS-03 into space is the GSLV — Geosynchronous Satellite Launch Vehicle. Standing 50 meters tall with three stages and a lift-off mass of 420 tonnes, it equals the sheer mass of a fully loaded passenger train ascending toward the sky. Marked as GSLV's 20th flight, its mandate is delivering heavy navigation satellites into Geosynchronous Transfer Orbit (GTO), where the satellite's internal propulsion takes over.

On 29 January 2025, GSLV-F15 lifted off from Sriharikota carrying NVS-02, a 2,235-kilogram navigation satellite. The rocket executed its trajectory flawlessly, deploying NVS-02 exactly into its designated transfer orbit. Cheers erupted in mission control. But when the satellite attempted to ignite its onboard Liquid Apogee Motor to climb into circular orbit, the engine remained dead. NVS-02 was marooned in transfer orbit, powerless and unusable. A ₹300-crore asset circled the Earth in silence.

ISRO constituted a high-level Apex Committee. Weeks of meticulous forensic analysis uncovered the root cause: oxidiser flow to the engine was blocked by a single-use pyro valve. Designed to trigger open via an electrical pulse, the signal left the onboard computer but never reached the pyrotechnic charge because connector pins had mechanically separated. Both primary and redundant paths were severed. A few loose connector contacts doomed the entire mission.

A pyro valve is analogous to a sealed valve on a gas cylinder. Prior to launch, high-pressure propellants are hermetically sealed inside storage tanks to avoid leaks. Once in space, an electrical impulse detonates a miniature explosive charge, shearing a metal diaphragm and permanently opening the fluid path. In NVS-02, that electrical signal was lost at the disconnected junction.

Confronting NVS-03, ISRO engineers refused to accept repeat risk. Breaking with 51 years of launch precedent, ISRO made an unprecedented decision: pre-firing all pyro valves on the ground before launch. The valve is already open on the launchpad, permanently eliminating the failure mode that crippled NVS-02. This daring decision represents engineering ownership at its peak — sleepless nights distilled into radical clarity.

However, pre-actuating the valve introduced new physics. With pyro valves permanently open, propellants rest against downstream latch valves. Mission success hinges entirely on these latch valves opening reliably in space. Additionally, extreme launch acoustics and vibration posed potential risk to seals. To ensure absolute flightworthiness, ISRO subjected the plumbing to exhaustive shock, vibration, and seal integrity trials before granting flight clearance.

Weighing 2,250 kilograms, NVS-03 carries a sovereign technological milestone: an indigenous Rubidium atomic clock engineered by SAC Ahmedabad. The atomic clock is the heartbeat of navigation; an error of even a single microsecond translates to a 300-meter ground deviation. Accompanied by civilian L1 signals alongside L5 and S-band military channels, NVS-03 equips both consumer smartphones and national defence units.

Late October posed an atmospheric challenge: Cyclone Arnab intensified in the Bay of Bengal, battering Sriharikota with torrential rain and high coastal gusts. Encased inside the Mobile Service Tower, the rocket remained safe while technicians worked around the clock maintaining humidity controls, electrical isolation, and pad readiness under severe weather.

Upon GSLV-F18 liftoff, the vehicle will deliver NVS-03 into GTO. The satellite's Liquid Apogee Motor will perform three burns to circularize into geostationary orbit 36,000 kilometers above Earth. Once on station, its solar arrays will deploy, and telemetry will establish communication with ISTRAC.

A successful NVS-03 restores NavIC to four operational satellites, meeting the baseline threshold for independent positioning and clearing the runway for NVS-04, 05, and 06. When the rocket ascends into the night sky, it carries far more than a navigation payload: it carries years of resilience, scientific grit, and India's unshakeable faith in self-reliance.`
    },
    {
      lang: 'ta-IN',
      voice: 'Shivani',
      body: `1999 கார்கில் போரின் போது அமெரிக்கா ஜிபிஎஸ் தரவுகளை வழங்க மறுத்த நாளில் இந்தியாவின் சொந்த நாவிக் (NavIC) செயற்கைக்கோள் கட்டமைப்பு கனவு பிறந்தது. என்விஎஸ்-02 பயணத்தின் பைரோ வால்வு பின்னடைவை வெற்றியாக மாற்ற, இஸ்ரோ தனது 51 ஆண்டு வரலாற்றில் முதன்முறையாக ஏவுவதற்கு முன்பே தரையிலேயே பைரோ வால்வை திறந்து சாதனை படைத்து என்விஎஸ்-03 மூலம் விண்வெளிக்கு பாய்கிறது.`
    },
    {
      lang: 'te-IN',
      voice: 'Shivani',
      body: `1999 కార్గిల్ యుద్ధంలో జీపీఎస్ సమాచారం నిరాకరించబడినప్పుడు స్వదేశీ నావిక్ వ్యవస్థ పుట్టింది. ఎన్‌వీఎస్-02 వైఫల్యాన్ని సవాలుగా తీసుకుని, 51 ఏళ్ల చరిత్రలో తొలిసారిగా భూమిపైనే పైరో వాల్వ్‌ను యాక్టివేట్ చేసి జీఎస్‌ఎల్‌వీ-ఎఫ్‌18 రాకెట్ ద్వారా ఎన్‌వీఎస్-03 ఉపగ్రహాన్ని ప్రయోగిస్తోంది ఇస్రో.`
    },
    {
      lang: 'bn-IN',
      voice: 'Shivani',
      body: `১৯৯৯ কার্গিল যুদ্ধের সময় জিপিএস প্রযুক্তি না পাওয়ার তিক্ত অভিজ্ঞতা থেকেই ভারতের নিজস্ব নেভিগেশন ব্যবস্থা নাভিকের জন্ম। এনভিএস-০২ এর পাইরো ভালভ ব্যর্থতা কাটিয়ে ইসরো ৫১ বছরের ইতিহাসে প্রথমবার উৎক্ষেপণের আগেই ভালভ উন্মুক্ত করে এনভিএস-০৩ উপগ্রহ মহাকাশে পাঠাচ্ছে।`
    },
    {
      lang: 'kn-IN',
      voice: 'Shivani',
      body: `1999 ರ ಕಾರ್ಗಿಲ್ ಯುದ್ಧದಲ್ಲಿ ಜಿಪಿಎಸ್ ನೆರವು ನಿರಾಕರಿಸಲ್ಪಟ್ಟಾಗ ಭಾರತದ ನಾವಿಕ್ ವ್ಯವಸ್ಥೆಯ ಕನಸು ಹುಟ್ಟಿಕೊಂಡಿತು. ಎನ್‌ವಿಎಸ್-02 ರ ಪೈರೋ ವಾಲ್ವ್ ವೈಫಲ್ಯದಿಂದ ಪಾಠ ಕಲಿತ ಇಸ್ರೋ, 51 ವರ್ಷಗಳ ಇತಿಹಾಸದಲ್ಲೇ ಮೊದಲ ಬಾರಿಗೆ ಉಡಾವಣೆಗೆ ಮುನ್ನವೇ ವಾಲ್ವ್ ತೆರೆದು ಜಿಎಸ್‌ಎಲ್‌ವಿ-ಎಫ್18 ಮೂಲಕ ಎನ್‌ವಿಎಸ್-03 ಉಪಗ್ರಹವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನಭಕ್ಕೆ ಕಳುಹಿಸುತ್ತಿದೆ.`
    }
  ];

  for (const t of nvs03Translations) {
    const audioUrl = `/media/audio/stories/nvs-03/${t.lang}.wav`;
    insertTrans.run('nvs-03', t.lang, t.body, t.voice, audioUrl, 540);
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
