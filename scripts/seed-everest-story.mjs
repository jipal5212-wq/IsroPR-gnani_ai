import { getDb } from '../server/db/db.js';
import fs from 'node:fs';

const db = getDb();

// 1. Insert Story
const story = {
  id: 'everest-indian-ffsc',
  title: 'EVEREST: The Indian FFSC',
  summary: "How Indian deep-tech startup Astrobase is engineering India's first Full-Flow Staged Combustion (FFSC) methalox rocket engine — placing India alongside the US, Russia, and China in heavy reusable rocketry.",
  category: 'startup',
  facts_as_of: '2026-08-07',
  sources: JSON.stringify(['https://astrobase.space', 'https://www.inspace.gov.in']),
  cover_path: 'everest-ffsc-cover.jpg',
  duration_hint_min: 10,
  published: 1,
  pinned: 1
};

db.prepare(`
  INSERT INTO stories (id, title, summary, category, facts_as_of, sources, cover_path, duration_hint_min, published, pinned, updated_at)
  VALUES (@id, @title, @summary, @category, @facts_as_of, @sources, @cover_path, @duration_hint_min, @published, @pinned, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    summary = excluded.summary,
    category = excluded.category,
    facts_as_of = excluded.facts_as_of,
    sources = excluded.sources,
    cover_path = excluded.cover_path,
    duration_hint_min = excluded.duration_hint_min,
    published = excluded.published,
    pinned = excluded.pinned,
    updated_at = CURRENT_TIMESTAMP
`).run(story);

console.log('✅ Inserted/Updated story: everest-indian-ffsc');

// Load chunk texts
// We can reconstruct the full bodies:
const HINDI_BODY = `अंतरिक्ष में जाना हो, satellite भेजना हो, या इंसान को किसी दूसरे planet पर बसाना हो, एक चीज़ सबसे पहले चाहिए। एक powerful और reliable rocket engine। बाकी सब उसके बाद की बात है। Satellite है, payload है, mission plan है, पर अगर engine नहीं चला तो कुछ नहीं होगा। यही वजह है कि जो देश या company सबसे advanced rocket engine बनाती है, वही space में सबसे आगे होती है। और आज हम बात करेंगे एक ऐसी Indian startup की, जो उस engine को बनाने में लगी है जिसे दुनिया में सिर्फ़ चार देश ही अब तक बना पाए हैं।

Rocket engines को roughly तीन बड़े categories में समझा जा सकता है। पहले generation के engines simple थे, fuel burn करो, thrust लो, काम हो गया। पर उनकी efficiency कम थी। दूसरे generation में staged combustion आया। इसमें fuel और oxidiser को पहले एक preburner में partially जलाया जाता है, उससे turbopump चलती है, फिर वो gas main chamber में जाती है। ये ज़्यादा efficient था। और तीसरा, सबसे advanced है full-flow staged combustion, यानी FFSC। इसमें fuel का अपना preburner, oxidiser का अपना preburner, दोनों अलग-अलग, और दोनों का output main chamber में जाता है। कुछ भी waste नहीं होता।

FFSC को rocket propulsion का holy grail क्यों कहा जाता है? क्योंकि ये सबसे ज़्यादा efficient है, सबसे ज़्यादा chamber pressure देता है, और इसीलिए सबसे ज़्यादा thrust per kilogram of fuel मिलता है। इसे एक example से समझते हैं। एक normal car engine में जितना petrol डालो उसका कुछ हिस्सा heat और exhaust में बर्बाद होता है। अब सोचो एक ऐसा engine जो उस exhaust को भी वापस engine में डालकर काम में लेता है। FFSC कुछ ऐसा ही करता है। और सबसे बड़ी बात, methane fuel से चलने वाले FFSC engines में soot यानी काला धुआँ नहीं बनता। इसका मतलब engine को land करने के बाद बिना ज़्यादा cleaning के फिर से launch किया जा सकता है। Same day re-flight possible है।

अब सवाल ये है कि अगर FFSC इतना powerful है, तो सब क्यों नहीं बनाते? क्योंकि ये बनाना बेहद मुश्किल है। इसमें दो separate preburners होते हैं, दो turbopumps, दोनों को sub-millisecond precision के साथ sync करना होता है। Pumps tens of thousands RPM पर spin करती हैं। Flow rate होती है hundreds of kilograms per second। Temperature और pressure दोनों extreme levels पर होते हैं। एक छोटी सी गड़बड़ी और पूरा system fail। यही वजह है कि पूरी दुनिया में आज तक सिर्फ़ तीन देशों ने ये technology सफलतापूर्वक develop की है। पहला, Soviet Union ने 1960s-70s में। दूसरा, America में SpaceX ने Raptor engine के साथ। तीसरा, China ने LandSpace startup के ज़रिए। और अब, 2026 में, भारत इस list में चौथे नंबर पर आने की कोशिश में है।

2024 में Bengaluru में एक startup की नींव रखी गई। नाम रखा Astrobase Space Technologies। इसके दो co-founders हैं। पहले हैं Devakumar Thammisetty, IIT Bombay alumnus और ex-ISRO scientist जिनके पास 13 साल का experience है cryogenic rocket propulsion में। वो GSLV Mk2, Mk3 upper stages, Chandrayaan, और India के human spaceflight program में काम कर चुके हैं। दूसरे हैं Neeraj Khandelwal, IIT Bombay से ही, जो CoinDCX के co-founder हैं जिसे उन्होंने 15 million users और 2.1 billion dollar valuation तक scale किया। एक के पास rocket की depth है, दूसरे के पास company build करने की expertise। और दोनों का एक ही goal है, भारत में large reusable rockets बनाना।

Astrobase का पहला product है EVEREST engine। ये एक FFSC engine है जो liquid oxygen और liquid methane पर चलता है। इसीलिए इसे methalox engine भी कहते हैं। Thrust है 800 kilonewtons, यानी करीब 80 tonnes। इसे perspective में रखें तो एक fully loaded Boeing 737 का weight होता है करीब 70-80 tonnes। तो EVEREST की thrust उतनी है जितनी एक भरा हुआ passenger plane उठाने के लिए चाहिए। और Astrobase के rocket में ऐसे चार engines होंगे booster stage में, और एक upper stage में। इसकी specific impulse है करीब 340 seconds, जो इस class के engines के लिए बहुत अच्छी है। और इसे design किया गया है 60 से ज़्यादा flights के लिए। Reusable।

2024 में company शुरू हुई और manufacturing facility set up की Bengaluru के Dobbaspet में। 46,000 square feet की facility, जहाँ machining, material processing, और engine integration सब एक ही छत के नीचे होता है। वहाँ दुनिया के सबसे बड़े 3D printers में से एक भी है, जो complex aerospace parts directly print करता है। 2025 में sub-scale hot fire tests complete हुए। मतलब engine का छोटा version fire किया गया। उसी साल turbopump trials भी हुए, जनवरी 2026 में। ये वो rotating part होती है जो fuel और oxidiser को extreme pressure पर engine में push करती है। और फिर 7 अगस्त 2026 को Astrobase ने EVEREST को officially unveil किया। India का पहला fully integrated FFSC engine जो private company ने बनाया है।

Engine बनाना एक बात है, उसे test करना दूसरी बात। इसके लिए Astrobase ने Andhra Pradesh के Anantapur ज़िले में अपनी ख़ुद की 21 acre की engine test facility बनाई है। ये India की पहली private high-thrust engine test facility है। ये facility 200 tonnes से ज़्यादा thrust और 3000 degrees celsius से ज़्यादा temperature के exhaust flames को handle कर सकती है। इसे record time में build किया गया। इस facility का होना इसलिए important है क्योंकि हर test के बाद जो data मिलता है, उससे अगले iteration में improvement होती है। अगर test facility किसी और की होती तो हर test के लिए permission, waiting, scheduling। अपनी facility है तो speed है।

यहाँ एक ज़रूरी बात clear करना ज़रूरी है। EVEREST engine बन गया है, integrate हो गया है, और sub-scale tests हो गए हैं। पर अभी full-scale integrated hot fire test बाकी है। ये वो test होता है जब पूरा engine, पूरे size में, full thrust पर fire किया जाता है। SpaceX का Raptor engine hundreds of hot fire tests और multiple flight campaigns से गुज़र चुका है। Astrobase अभी उस journey की शुरुआत में है। Company का plan है कि पहले orbital flight से पहले करीब 20 engines बनाकर test करेंगे। ये approach smart है क्योंकि हर test में कुछ नया सीखने को मिलता है। पर इसका मतलब ये भी है कि अभी काफ़ी काम बाकी है।

Astrobase की timeline कुछ ऐसी है। 2026 में full scale hot fire test होना है Anantapur facility में। 2027 में launch pad development और full system testing का plan है। 2028 में पहला orbital launch target है, December 2028 specifically। Rocket का design है two-stage to orbit। Diameter है 4 meters। Stainless steel से बना है, जो cryogenic temperatures पर भी काम करता है। Payload capacity होगी 8 tonnes expendable और 3 tonnes reusable। मतलब अगर rocket वापस land करेगा तो 3 tonnes payload orbit में छोड़ सकता है।

June 2026 में IN-SPACe, यानी Indian National Space Promotion and Authorization Center, ने Astrobase को अपने Technology Adoption Fund में select किया। ये वो government mechanism है जो private space startups को funding और support देता है। मई 2026 में Astrobase ने Venice में हुई Space Meetings Veneto में Italian company Impulso Space के साथ strategic partnership framework sign किया। ये international recognition है कि दुनिया India की space startups को seriously ले रही है। Business Today, Outlook Business, जैसे mainstream publications ने EVEREST को cover किया। और globally, Astrobase को उन चार commercial companies में गिना जा रहा है जिन्होंने high-thrust FFSC engine बनाया है।

India अभी commercially भारी payloads के लिए foreign rockets पर depend करता है। ISRO का LVM3 है, पर वो reusable नहीं है। और reusability ही वो चीज़ है जो launch cost को dramatically कम करती है। SpaceX इसीलिए market dominate कर रहा है क्योंकि Falcon 9 reusable है। अगर Astrobase अपना rocket successfully launch और recover करता है, तो India के पास एक indigenous, reusable, heavy-lift launch option होगा। इसका मतलब India के satellites, international customers के commercial payloads, और future deep space missions के लिए India को किसी और की rocket पर depend नहीं करना होगा।

Astrobase अभी building phase में है। Engine बन गया है। Test facility तैयार है। Full hot fire होना बाकी है। और उसके बाद stage integration, vehicle integration, launch pad, और फिर actual launch। हर step में नई challenges हैं। पर जो काम 2024 में शुरू होकर 2026 तक आ गया है, वो pace impressive है। एक FFSC engine को design करना, manufacture करना, और integrate करना, दो साल में, एक नई company ने, यह India के private space sector की capability दिखाता है। SpaceX को Raptor तक पहुँचने में एक दशक लगा था। Astrobase की journey अभी शुरू हुई है। पर direction सही है, technology सही है, और team सही है।

Astrobase का tagline है, 'Helping civilization thrive in space।' ये सिर्फ़ marketing नहीं है। इसके पीछे एक real engineering vision है। हर satellite जो orbit में जाएगा, हर mission जो deep space में जाएगा, उसे पहले धरती की gravity को overcome करना होगा। और उसके लिए एक powerful, reusable, affordable rocket चाहिए। अगर Astrobase अपना plan execute कर पाई, तो 2028 के बाद India के पास एक ऐसी private launch capability होगी जो आज सिर्फ़ SpaceX के पास है। अभी engine बना है। Test बाकी है। Launch बाकी है। पर पहला कदम उठ गया है। और वो कदम India की धरती पर, India के इंजीनियरों के हाथों से उठा है।`;

const ENGLISH_BODY = `Whether we want to venture into deep space, launch sovereign satellites, or settle humanity on another planet, one fundamental technology is non-negotiable: a powerful and ultra-reliable rocket engine. You can have the payload, the satellite, and the flight plan, but without the engine igniting, nothing leaves the launchpad. This is why nations and companies mastering advanced propulsion lead the global space race. Today, we uncover the story of an Indian startup building an engine class that only three nations in human history have ever mastered.

Rocket engines broadly evolve across three generations. First-generation engines were straightforward: mix fuel, ignite, and generate raw thrust, but with limited efficiency. The second generation brought staged combustion, burning propellants partially in a preburner to drive the turbopump before exhausting into the main chamber. And the third, most advanced frontier is Full-Flow Staged Combustion, or FFSC. Here, fuel has its own dedicated preburner, and oxidiser has its own preburner. Both outputs feed completely into the main combustion chamber. Zero fuel is wasted.

Why is Full-Flow Staged Combustion crowned the holy grail of rocket propulsion? Because it delivers the highest thermodynamic efficiency, unprecedented chamber pressures, and maximum thrust per kilogram of propellant. Think of a car engine where exhaust heat is normally lost; in FFSC, every molecule of exhaust is recycled directly into work. Furthermore, burning clean liquid methane eliminates soot buildup, allowing rockets to land and relaunch rapidly with minimal refurbishment. Same-day re-flight becomes a reality.

If FFSC is so powerful, why doesn't everyone build it? Because the engineering complexity is staggering. It requires synchronizing dual preburners and independent turbopumps with sub-millisecond precision. Pumps spin at tens of thousands of RPM, funneling hundreds of kilograms of propellant every second under extreme temperature gradients. In history, only three nations ever achieved this: the Soviet Union, the United States via SpaceX's Raptor, and China via LandSpace. And now, in 2026, India is rising to claim the fourth spot.

In 2024, Bengaluru witnessed the birth of Astrobase Space Technologies, founded by two visionary IIT Bombay alumni. First is Devakumar Thammisetty, an ex-ISRO cryogenic scientist with 13 years of expertise spanning GSLV upper stages, Chandrayaan, and human spaceflight. Alongside him is Neeraj Khandelwal, co-founder of CoinDCX, who scaled platforms to 15 million users and a 2.1 billion dollar valuation. One brings deep cryogenic physics; the other brings world-class execution scale. Their shared mission: building India's heavy, rapidly reusable orbital rockets.

Astrobase's flagship breakthrough is the EVEREST engine: an 800-kilonewton, roughly 80-tonne thrust Full-Flow Staged Combustion engine powered by liquid oxygen and liquid methane. To put 80 tonnes of thrust into perspective, that is equivalent to lifting a fully loaded Boeing 737 passenger jet straight into the air. Four EVEREST engines will propel the booster stage, with one vacuum-optimized engine powering the upper stage, boasting an impressive 340-second specific impulse designed for over 60 reusable flights.

Founded in 2024, Astrobase rapidly established a 46,000 square foot integrated manufacturing facility in Dobbaspet, Bengaluru, housing advanced precision machining, material processing, and one of the world's largest metal 3D printers. By 2025, successful sub-scale hot fire tests were conducted, followed by milestone turbopump trials in January 2026. On August 7, 2026, Astrobase officially unveiled EVEREST: India's first privately developed, fully integrated Full-Flow Staged Combustion engine.

Building an advanced rocket engine is one feat; testing it under operational fury is another. In Andhra Pradesh's Anantapur district, Astrobase erected India's first private 21-acre high-thrust propulsion test facility in record time. Capable of absorbing over 200 tonnes of dynamic thrust and 3,000-degree exhaust plumes, owning this standalone test ground grants Astrobase unmatched development speed, iterating rapidly without reliance on external institutional scheduling.

To be completely honest, while sub-scale and turbopump milestones are verified, the full-scale integrated hot fire test remains ahead. SpaceX's Raptor underwent hundreds of test firings before orbital reliability was proven. Astrobase plans to fabricate and fire roughly 20 test engines before their inaugural flight, ensuring that every engineering edge case is proven through hard empirical data.

Looking at Astrobase's ambitious roadmap: 2026 brings full-scale hot fire testing in Anantapur; 2027 will see launchpad construction and stage testing; with the maiden orbital launch slated for December 2028. The launch vehicle features a 4-meter diameter stainless-steel architecture resilient to cryogenic extremes, capable of placing 8 tonnes expendable or 3 tonnes in fully reusable configuration into Low Earth Orbit.

In June 2026, IN-SPACe selected Astrobase under its Technology Adoption Fund, recognizing its strategic national importance. Internationally, Astrobase signed a strategic partnership with Italy's Impulso Space at Venice Space Meetings, alongside extensive coverage in Business Today and Outlook Business, placing Astrobase among the world's elite four commercial entities engineering high-thrust FFSC systems.

Why is this a monumental leap for India? Today, India relies heavily on foreign vehicles for heavy commercial payloads. ISRO's robust LVM3 is expendable, whereas reusability is the decisive factor that slashes launch economics. An indigenous reusable heavy-lift rocket guarantees sovereign access to orbit, commercial leadership, and cost-effective lunar and deep-space missions.

Astrobase is currently in its defining building phase. The hardware is real, the test stands are built, and the pace achieved in two years is breathtaking. While SpaceX took a decade to mature Raptor, Astrobase has established the foundations with clarity, conviction, and top-tier aerospace talent.

Astrobase's guiding motto is 'Helping civilization thrive in space.' Overcoming Earth's gravity demands reusable, reliable, and affordable heavy propulsion. If Astrobase executes its vision by 2028, India will hold a sovereign private launch capability rivaled only by global giants. The journey has begun, crafted by Indian engineers on Indian soil.`;

const MALAYALAM_BODY = `ബഹിരാകാശത്തേക്ക് കുതിക്കാനോ, ഉപഗ്രഹങ്ങൾ വിക്ഷേപിക്കാനോ, മനുഷ്യനെ മറ്റൊരു ഗ്രഹത്തിൽ എത്തിക്കാനോ ഏറ്റവും ആദ്യം വേണ്ടത് ഒന്നാണ്: കരുത്തുറ്റതും വിശ്വസനീയവുമായ ഒരു റോക്കറ്റ് എഞ്ചിൻ. പേലോഡും മിഷൻ പ്ലാനും എത്ര മികച്ചതായാലും എഞ്ചിൻ പ്രവർത്തിച്ചില്ലെങ്കിൽ ഒന്നും സാധ്യമല്ല. ലോകത്ത് ഏറ്റവും നൂതനമായ റോക്കറ്റ് എഞ്ചിനുകൾ നിർമ്മിക്കുന്നവരാണ് ബഹിരാകാശ രംഗത്ത് മുൻപന്തിയിൽ നിൽക്കുന്നത്. ഇന്ന് നാം പരിചയപ്പെടുന്നത്, ലോകത്ത് നാല് രാജ്യങ്ങൾക്ക് മാത്രം നിർമ്മിക്കാൻ കഴിഞ്ഞിട്ടുള്ള ഒരു വിപ്ലവകരമായ എഞ്ചിൻ വികസിപ്പിക്കുന്ന ഒരു ഇന്ത്യൻ സ്റ്റാർട്ടപ്പിനെക്കുറിച്ചാണ്.

റോക്കറ്റ് എഞ്ചിനുകളെ പ്രധാനമായും മൂന്ന് തലമുറകളായി തിരിക്കാം. ഒന്നാം തലമുറ ലളിതമായിരുന്നു: ഇന്ധനം കത്തിച്ച് ത്രസ്റ്റ് ഉണ്ടാക്കുന്നു, എന്നാൽ കാര്യക്ഷമത കുറവായിരുന്നു. രണ്ടാം തലമുറയിൽ സ്റ്റേജ്ഡ് കംബസ്റ്റൻ വന്നു, ഇതിൽ ഇന്ധനവും ഓക്സിഡൈസറും പ്രീ-ബേണറിൽ ഭാഗികമായി കത്തിച്ച് ടർബോപമ്പ് പ്രവർത്തിപ്പിക്കുന്നു. എന്നാൽ മൂന്നാമത്തെതും ഏറ്റവും നൂതനവുമായ സാങ്കേതികവിദ്യയാണ് ഫുൾ-ഫ്ലോ സ്റ്റേജ്ഡ് കംബസ്റ്റൻ അഥവാ എഫ്.എഫ്.എസ്.സി (FFSC). ഇതിൽ ഇന്ധനത്തിനും ഓക്സിഡൈസറിനും പ്രത്യേക പ്രീ-ബേണറുകളുണ്ട്. ഒന്നും പാഴാകുന്നില്ല, എല്ലാം പ്രധാന ചേമ്പറിലേക്ക് പോകുന്നു.

എന്തുകൊണ്ടാണ് എഫ്.എഫ്.എസ്.സി റോക്കറ്റ് സാങ്കേതികവിദ്യയിലെ വിശുദ്ധ ഗ്രന്ഥമായി അറിയപ്പെടുന്നത്? കാരണം ഇത് ഏറ്റവും ഉയർന്ന കാര്യക്ഷമതയും ചേമ്പർ മർദ്ദവും നൽകുന്നു. കുറഞ്ഞ ഇന്ധനത്തിൽ കൂടുതൽ കരുത്ത്. സാധാരണ എൻജിനുകളിൽ പുകയിലൂടെ ഊർജ്ജം നഷ്ടപ്പെടുമ്പോൾ, എഫ്.എഫ്.എസ്.സിയിൽ ആ വാതകങ്ങൾ വീണ്ടും ഉപയോഗിക്കപ്പെടുന്നു. കൂടാതെ ലിക്വിഡ് മീഥെയ്ൻ ഉപയോഗിക്കുന്നതിനാൽ കരിയോ പുകയോ ഉണ്ടാകുന്നില്ല. അതുകൊണ്ട് റോക്കറ്റ് തിരിച്ചിറങ്ങിയ ഉടൻ തന്നെ വൃത്തിയാക്കാതെ വീണ്ടും വിക്ഷേപിക്കാൻ സാധിക്കുന്നു.

ഇത്രയും മികച്ചതാണെങ്കിൽ എന്തുകൊണ്ട് എല്ലാവരും ഇത് നിർമ്മിക്കുന്നില്ല? കാരണം ഇത് നിർമ്മിക്കുക അത്യന്തം ദുഷ്കരമാണ്. രണ്ട് പ്രീ-ബേണറുകളും ടർബോപമ്പുകളും മൈക്രോ-സെക്കൻഡ് കൃത്യതയിൽ സമന്വയിപ്പിക്കണം. പതിനായിരക്കണക്കിന് ആർ.പി.എമ്മിലാണ് പമ്പുകൾ കറങ്ങുന്നത്. ചെറിയൊരു പിഴവുപോലും വൻ തകർച്ചയ്ക്ക് കാരണമാകും. അതുകൊണ്ടാണ് ചരിത്രത്തിൽ മൂന്ന് രാജ്യങ്ങൾക്ക് മാത്രം ഇത് സാധ്യമായത്: സോവിയറ്റ് യൂണിയൻ, സ്പേസ് എക്സിന്റെ റാപ്റ്റർ വഴി അമേരിക്ക, ലാൻഡ് സ്പേസ് വഴി ചൈന. ഇപ്പോൾ 2026-ൽ ഇന്ത്യ നാലാമത്തെ രാജ്യമാകാൻ ഒരുങ്ങുന്നു.

2024-ൽ ബെംഗളൂരുവിൽ ആസ്ട്രോബേസ് സ്പേസ് ടെക്നോളജീസ് സ്ഥാപിതമായി. ഐ.ഐ.ടി ബോംബെ പൂർവ്വവിദ്യാർത്ഥികളായ രണ്ട് പേരാണ് ഇതിന് പിന്നിൽ. ആദ്യത്തെയാൾ ദേവകുമാർ തമ്മീസെട്ടി, ക്രയോജനിക് പ്രൊപ്പൽഷനിൽ 13 വർഷത്തെ പരിചയസമ്പത്തുള്ള മുൻ ഐ.എസ്.ആർ.ഒ ശാസ്ത്രജ്ഞൻ. ജി.എസ്.എൽ.വി, ചന്ദ്രയാൻ, ഗഗൻയാൻ എന്നിവയിൽ അദ്ദേഹം പ്രവർത്തിച്ചിട്ടുണ്ട്. രണ്ടാമത്തെയാൾ കോയിൻ ഡി.സി.എക്സ് സഹസ്ഥാപകനായ നീരജ് ഖണ്ഡേൽവാൾ. ഒരാൾക്ക് റോക്കറ്റ് സാങ്കേതികവിദ്യയും മറ്റൊരാൾക്ക് ബിസിനസ്സ് വൈദഗ്ധ്യവുമുണ്ട്. ലക്ഷ്യം ഒന്നുമാത്രം: ഇന്ത്യയിൽ പുനരുപയോഗിക്കാവുന്ന വലിയ റോക്കറ്റുകൾ നിർമ്മിക്കുക.

ആസ്ട്രോബേസിന്റെ ആദ്യ ഉൽപ്പന്നമാണ് എവറസ്റ്റ് (EVEREST) എഞ്ചിൻ. ലിക്വിഡ് ഓക്സിജനും ലിക്വിഡ് മീഥെയ്നും ഉപയോഗിക്കുന്ന ഒരു എഫ്.എഫ്.എസ്.സി എഞ്ചിനാണിത്. 800 കിലോന്യൂട്ടൺ, അതായത് ഏകദേശം 80 ടൺ ത്രസ്റ്റ് ആണ് ഇതിന്റെ കരുത്ത്. പൂർണ്ണമായി നിറച്ച ഒരു ബോയിംഗ് 737 വിമാനത്തിന്റെ ഭാരം ഉയർത്താൻ ഇതിന് സാധിക്കും. നാല് എഞ്ചിനുകൾ ബൂസ്റ്റർ സ്റ്റേജിലും ഒന്ന് അപ്പർ സ്റ്റേജിലും ഉണ്ടാകും. 60-ലധികം തവണ വീണ്ടും ഉപയോഗിക്കാൻ കഴിയുന്ന രീതിയിലാണ് എവറസ്റ്റ് രൂപകൽപ്പന ചെയ്തിരിക്കുന്നത്.

ബെംഗളൂരുവിലെ ദൊബ്ബാസ്പേട്ടിൽ 46,000 ചതുരശ്രയടി വിസ്തീർണ്ണമുള്ള അത്യാധുനിക നിർമ്മാണ കേന്ദ്രം കമ്പനി സ്ഥാപിച്ചു. ലോകത്തിലെ ഏറ്റവും വലിയ മെറ്റൽ 3D പ്രിന്ററുകളിൽ ഒന്നവിടെയുണ്ട്. 2025-ൽ സബ്-സ്കെയിൽ ഹോട്ട് ഫയർ ടെസ്റ്റുകളും, 2026 ജനുവരിയിൽ നിർണായകമായ ടർബോപമ്പ് പരീക്ഷണങ്ങളും വിജയകരമായി പൂർത്തിയായി. തുടർന്ന് 2026 ഓഗസ്റ്റ് 7-ന് ഇന്ത്യയിലെ ആദ്യത്തെ സ്വകാര്യ എഫ്.എഫ്.എസ്.സി എഞ്ചിനായ എവറസ്റ്റ് ഔദ്യോഗികമായി അനാവരണം ചെയ്യപ്പെട്ടു.

ആന്ധ്രാപ്രദേശിലെ അനന്തപൂരിൽ 21 ഏക്കർ വിസ്തൃതിയിൽ സ്വന്തമായി റോക്കറ്റ് എഞ്ചിൻ ടെസ്റ്റ് ഫെസിലിറ്റി ആസ്ട്രോബേസ് സ്ഥാപിച്ചു. ഇന്ത്യയിലെ ആദ്യത്തെ സ്വകാര്യ ഹൈ-ത്രസ്റ്റ് ടെസ്റ്റിംഗ് കേന്ദ്രമാണിത്. 200 ടണ്ണിലധികം ത്രസ്റ്റും 3000 ഡിഗ്രി സെൽഷ്യസ് താപനിലയും താങ്ങാൻ ഇതിന് ശേഷിയുണ്ട്. സ്വന്തമായി ടെസ്റ്റിംഗ് കേന്ദ്രമുള്ളത് പരീക്ഷണങ്ങൾ വേഗത്തിലാക്കാൻ സഹായിക്കുന്നു.

എന്നാൽ ഇനിയുമൊരു പ്രധാന പരീക്ഷണം ബാക്കിയുണ്ട്: ഫുൾ-സ്കെയിൽ ഇന്റഗ്രേറ്റഡ് ഹോട്ട് ഫയർ ടെസ്റ്റ്. മുഴുവൻ എഞ്ചിനും പൂർണ്ണ കരുത്തിൽ പ്രവർത്തിപ്പിക്കുന്ന നിർണായക പരീക്ഷണമാണിത്. ആദ്യ വിക്ഷേപണത്തിന് മുൻപായി 20-ഓളം എഞ്ചിനുകൾ നിർമ്മിച്ച് പരീക്ഷിക്കാനാണ് ആസ്ട്രോബേസ് പദ്ധതിയിടുന്നത്.

ആസ്ട്രോബേസിന്റെ ഭാവി പദ്ധതികൾ വ്യക്തമാണ്: 2026-ൽ അനന്തപൂരിൽ ഫുൾ-സ്കെയിൽ ഹോട്ട് ഫയർ ടെസ്റ്റ്, 2027-ൽ ലോഞ്ച് പാഡ് നിർമ്മാണം, 2028 ഡിസംബറിൽ ആദ്യ ഭ്രമണപഥ വിക്ഷേപണം. സ്റ്റെയിൻലെസ് സ്റ്റീലിൽ നിർമ്മിക്കുന്ന 4 മീറ്റർ വ്യാസമുള്ള റോക്കറ്റിന് 8 ടൺ പേലോഡ് ഓർബിറ്റിലെത്തിക്കാൻ ശേഷിയുണ്ടാകും.

2026 ജൂണിൽ ഇൻ-സ്പേസ് (IN-SPACe) ടെക്നോളജി അഡോപ്ഷൻ ഫണ്ടിലേക്ക് ആസ്ട്രോബേസിനെ തിരഞ്ഞെടുത്തു. കൂടാതെ ഇറ്റാലിയൻ കമ്പനിയായ ഇംപൾസോ സ്പേസുമായി തന്ത്രപരമായ പങ്കാളിത്തവും ഒപ്പുവെച്ചു. ആഗോളതലത്തിൽ ഹൈ-ത്രസ്റ്റ് എഫ്.എഫ്.എസ്.സി എഞ്ചിൻ നിർമ്മിക്കുന്ന മുൻനിര നാല് വാണിജ്യ കമ്പനികളിലൊന്നായി ആസ്ട്രോബേസ് ഇന്ന് അംഗീകരിക്കപ്പെടുന്നു.

എന്തുകൊണ്ടാണ് ഇത് ഇന്ത്യക്ക് നിർണായകമാകുന്നത്? വലിയ ഉപഗ്രഹങ്ങൾ വിക്ഷേപിക്കാൻ ഇന്ത്യ ഇപ്പോഴും വിദേശ റോക്കറ്റുകളെ ആശ്രയിക്കുന്നു. ഐ.എസ്.ആർ.ഒയുടെ എൽ.വി.എം-3 വീണ്ടും ഉപയോഗിക്കാൻ കഴിയില്ല. പുനരുപയോഗിക്കാവുന്ന റോക്കറ്റുകൾ വിക്ഷേപണ ചെലവ് ഗണ്യമായി കുറയ്ക്കുന്നു. ആസ്ട്രോബേസ് വിജയിച്ചാൽ ഇന്ത്യക്ക് പൂർണ്ണമായ തദ്ദേശീയ വിക്ഷേപണ സ്വാശ്രയത്വം ലഭിക്കും.

ആസ്ട്രോബേസ് ഇപ്പോഴും വികസന ഘട്ടത്തിലാണ്. എഞ്ചിൻ തയ്യാറായി, ടെസ്റ്റ് കേന്ദ്രം നിർമ്മിച്ചു. പൂർണ്ണ പരീക്ഷണവും വിക്ഷേപണവും ഇനി നടക്കണം. എങ്കിലും വെറും രണ്ട് വർഷത്തിനുള്ളിൽ ഇത്രയും വലിയ നേട്ടങ്ങൾ കൈവരിച്ചത് ഇന്ത്യയുടെ സ്വകാര്യ ബഹിരാകാശ മേഖലയുടെ കരുത്ത് വിളിച്ചോതുന്നു.

'ബഹിരാകാശത്ത് മനുഷ്യ സംസ്കാരത്തിന് ചിറകുകൾ നൽകുക' എന്നതാണ് ആസ്ട്രോബേസിന്റെ മുദ്രാവാക്യം. 2028-ഓടെ സ്പേസ് എക്സിനൊപ്പം നിൽക്കുന്ന ഒരു ഇന്ത്യൻ വിക്ഷേപണ ശേഷി യാഥാർത്ഥ്യമാകും. ആദ്യ പടി ഉറച്ചുകഴിഞ്ഞു, അത് ഇന്ത്യയുടെ മണ്ണിൽ നമ്മുടെ എൻജിനീയർമാരുടെ കൈകളാൽ കുറിക്കപ്പെട്ടതാണ്.`;

const translations = [
  {
    lang: 'hi-IN',
    body: HINDI_BODY,
    voice: 'Shivani',
    audio_path: '/media/audio/stories/everest-ffsc/hi-IN.mp3',
    audio_duration_sec: 624
  },
  {
    lang: 'en-IN',
    body: ENGLISH_BODY,
    voice: 'Shivani',
    audio_path: '/media/audio/stories/everest-ffsc/en-IN.mp3',
    audio_duration_sec: 436
  },
  {
    lang: 'ml-IN',
    body: MALAYALAM_BODY,
    voice: 'Shivani',
    audio_path: '/media/audio/stories/everest-ffsc/ml-IN.mp3',
    audio_duration_sec: 397
  }
];

const insertTrans = db.prepare(`
  INSERT INTO story_translations (story_id, lang, body, voice, reviewed, audio_status, audio_path, audio_duration_sec, updated_at)
  VALUES (?, ?, ?, ?, 1, 'ready', ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(story_id, lang) DO UPDATE SET
    body = excluded.body,
    voice = excluded.voice,
    reviewed = 1,
    audio_status = 'ready',
    audio_path = excluded.audio_path,
    audio_duration_sec = excluded.audio_duration_sec,
    updated_at = CURRENT_TIMESTAMP
`);

for (const t of translations) {
  insertTrans.run('everest-indian-ffsc', t.lang, t.body, t.voice, t.audio_path, t.audio_duration_sec);
  console.log(`✅ Seeded translation for ${t.lang} (${t.audio_duration_sec}s)`);
}

// 3. Add Knowledge Base Facts for RAG
const facts = [
  {
    title: 'Astrobase Space Technologies & EVEREST Engine',
    category: 'startup',
    body: 'Astrobase Space Technologies is an Indian space startup founded in 2024 by IIT Bombay alumni Devakumar Thammisetty (ex-ISRO cryogenic scientist with 13 years experience) and Neeraj Khandelwal (CoinDCX co-founder). Astrobase is developing EVEREST, an 800 kN (~80-tonne thrust) Full-Flow Staged Combustion (FFSC) methalox rocket engine for large reusable launch vehicles. Astrobase has a 46,000 sq ft manufacturing facility in Dobbaspet, Bengaluru, and a 21-acre private engine test facility in Anantapur, Andhra Pradesh.',
    as_of: '2026-08-07',
    source_url: 'https://astrobase.space'
  },
  {
    title: 'Full-Flow Staged Combustion (FFSC) Rocket Technology',
    category: 'explainer',
    body: 'Full-Flow Staged Combustion (FFSC) is the most advanced and thermodynamically efficient liquid rocket engine cycle. It employs two separate preburners (one fuel-rich, one oxidiser-rich) driving independent turbopumps, with all propellant exhaust flowing into the main chamber with zero dump waste. Historically, only the Soviet Union (RD-270 trials), USA (SpaceX Raptor), and China (LandSpace TQ-12/15) have developed FFSC engines. Astrobase EVEREST aims to make India the 4th country to achieve this technology.',
    as_of: '2026-08-07',
    source_url: 'https://astrobase.space'
  }
];

const insertFact = db.prepare(`
  INSERT INTO knowledge (title, category, body, as_of, source_url, updated_at)
  VALUES (@title, @category, @body, @as_of, @source_url, CURRENT_TIMESTAMP)
`);

for (const f of facts) {
  const existing = db.prepare('SELECT id FROM knowledge WHERE title = ?').get(f.title);
  if (!existing) {
    insertFact.run(f);
    console.log(`✅ Seeded knowledge: ${f.title}`);
  }
}

console.log('\n🎉 Astrobase EVEREST FFSC Story & Knowledge successfully seeded into database!');
