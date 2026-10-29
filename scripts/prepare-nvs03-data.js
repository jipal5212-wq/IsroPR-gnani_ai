import fs from 'node:fs';

const rawChunks = [
  {
    num: 1,
    title: "कारगिल से शुरू होती है ये कहानी",
    text: "<exhales> 1999 का साल था। कारगिल की पहाड़ियों पर भारतीय सेना लड़ रही थी। उस वक़्त commanders को ज़रूरत थी exact location की, दुश्मन कहाँ है, हमारे जवान कहाँ हैं। <slow> उन्होंने America के GPS system से मदद माँगी। और America ने मना कर दिया। <sniffles> उस दिन भारत के decision makers को एहसास हुआ कि technology में दूसरों पर depend रहना कितना ख़तरनाक है। किसी और का system, किसी और की शर्तों पर चलता है। <slow> उसी दिन एक सपना बोया गया। भारत का अपना navigation system बनाने का सपना। जो किसी की इजाज़त पर न चले।"
  },
  {
    num: 2,
    title: "NavIC क्या है, और क्यों ज़रूरी है",
    text: "<slow> उसी सपने से निकला NavIC, यानी Navigation with Indian Constellation। सीधे शब्दों में कहें तो भारत का अपना GPS। <exhales> ये system India और उसके आसपास 1,500 किलोमीटर तक की exact location बता सकता है। चाहे वो एक जवान हो border पर, एक किसान हो खेत में, या एक ship हो समुद्र में। <slow> NavIC सिर्फ़ रास्ता नहीं दिखाता। ये भारत की strategic independence का एक हिस्सा है। Defence से लेकर disaster management तक, fishing boats से लेकर आपके phone तक, सबमें इसका इस्तेमाल हो सकता है।"
  },
  {
    num: 3,
    title: "NavIC की मुश्किल, कम होते satellites",
    text: "<exhales> पर NavIC की राह आसान नहीं रही। इस system को ठीक से चलाने के लिए कम से कम सात satellites की ज़रूरत है। <slow> कुछ पुराने satellites ने अपनी उम्र पूरी कर ली। IRNSS-1H को PSLV से launch किया गया था, पर rocket का protective heat shield अलग नहीं हुआ और वो mission fail हो गया। <sniffles> फिर NVS-02 की बारी आई, जिसके बारे में हम आगे बात करेंगे। आज की तारीख़ में parliament में सरकार ने माना कि NavIC में सिर्फ़ तीन satellites ही काम कर रहे हैं। <slow> और independent positioning के लिए चार चाहिए। यानी अभी भारत अपने GPS पर पूरी तरह depend नहीं कर सकता।"
  },
  {
    num: 4,
    title: "GSLV rocket को समझते हैं",
    text: "<slow> अब थोड़ा उस rocket के बारे में जानते हैं जो NVS-03 को अंतरिक्ष में ले जाएगा। इसका नाम है GSLV, यानी Geosynchronous Satellite Launch Vehicle। <exhales> ये तीन stages वाला rocket है, लगभग 50 मीटर लंबा, और lift-off के वक़्त इसका वज़न होता है करीब 420 tonnes। सोचिए, एक भरी हुई passenger train जितना वज़न, और वो सब आसमान में उठाना होता है। <slow> इसकी 20वीं flight होगी ये। GSLV का काम है heavy navigation और communication satellites को geosynchronous transfer orbit तक पहुँचाना, जहाँ से satellite खुद अपने engine से अपनी final जगह पर जाता है।"
  },
  {
    num: 5,
    title: "NVS-02 की कहानी, जब सब ठीक था फिर भी हार गए",
    text: "<exhales> 29 जनवरी 2025। GSLV-F15 rocket Sriharikota से उड़ा। उसमें था NVS-02, करीब 2,235 किलोग्राम का navigation satellite। <slow> Rocket ने अपना काम बेहतरीन तरीक़े से किया। NVS-02 को geosynchronous transfer orbit में सही जगह छोड़ दिया। सब ठीक था। Team ख़ुश थी। <sniffles> पर उसके बाद satellite को अपनी final orbit तक जाने के लिए खुद अपना engine चलाना था। और वो engine कभी नहीं चला। NVS-02 वहीं अटक गया, एक अधूरे सफ़र में, बेकार। करोड़ों रुपये का satellite, orbit में घूमता रहा, पर किसी काम का नहीं।"
  },
  {
    num: 6,
    title: "क्या हुआ था असल में NVS-02 में",
    text: "<slow> ISRO ने जाँच बैठाई। Apex Committee बनाई। हफ़्तों की जाँच के बाद पता चला असली वजह। <exhales> Satellite के engine तक oxidiser, यानी एक ज़रूरी chemical, पहुँचाने का रास्ता एक special valve से बंद था। इसे कहते हैं pyro valve। ये valve एक electrical signal मिलने पर खुलता है। <slow> वो signal satellite को गया। पर valve तक पहुँचा ही नहीं। क्योंकि बीच में एक connector के contacts अलग हो गए थे। Main path भी fail, backup path भी fail। <sniffles> बस इतनी सी बात। एक connector, कुछ loose contacts। और पूरा mission बर्बाद।"
  },
  {
    num: 7,
    title: "Pyro Valve क्या होता है, आसान भाषा में",
    text: "<exhales> थोड़ा समझते हैं ये pyro valve क्या होता है। सोचिए आपके घर में gas cylinder का valve। जब तक बंद है, gas नहीं निकलती। खोलो तो gas बहती है। <slow> Satellite में भी कुछ ऐसा ही होता है। Fuel और oxidiser tanks में बंद रहते हैं launch के दौरान, ताकि कोई leak न हो। जब सही वक़्त आए, एक electrical signal भेजा जाता है। उस signal से एक tiny explosive जलती है, जो valve को एक बार के लिए खोल देती है। <exhales> और ये valve एक बार खुल जाए तो बंद नहीं होता। Single-use होता है। <slow> NVS-02 में यही signal कभी valve तक पहुँचा ही नहीं।"
  },
  {
    num: 8,
    title: "ISRO का बड़ा फ़ैसला, 51 साल में पहली बार",
    text: "<slow> अब सवाल था, NVS-03 के साथ क्या करें। वही पुराना तरीका अपनाएँ, और risk लें कि शायद फिर वही failure हो? <exhales> ISRO ने एक ऐसा फ़ैसला लिया जो उसकी 51 साल की satellite launch history में पहली बार हो रहा है। <slow> NVS-03 के pyro valves को launch से पहले ही खुली अवस्था में fire कर दिया गया है। मतलब वो signal जो NVS-02 में fail हुआ था, उसकी ज़रूरत ही अब नहीं पड़ेगी। Valve पहले से ही open है। <sniffles> ये decision आसान नहीं था। ये एक engineer का वो जवाब है जो वो तब देता है जब वो पूरी रात सो नहीं पाता और बार-बार एक ही सवाल पूछता है, कि इस बार क्या अलग करें।"
  },
  {
    num: 9,
    title: "Open Valve का नया ख़तरा",
    text: "<exhales> पर इस फ़ैसले के साथ एक नई चुनौती भी आई। कुछ experts ने concern जताया। <slow> जब valve पहले से खुला है, तो fuel और oxidiser एक downstream valve, जिसे latch valve कहते हैं, उस तक पहुँच जाते हैं। अब सारा दारोमदार उस latch valve पर है। अगर वो space में नहीं खुला, तो mission फिर fail। <exhales> और एक और concern है। Launch के दौरान rocket में बहुत तेज़ vibration होती है। उस vibration में open valve से propellant लीक होने का छोटा सा risk रहता है। <slow> ISRO की team ने ground पर endless tests किए, vibration withstand tests, shock tests, seal verification। तब जाकर green light मिली।"
  },
  {
    num: 10,
    title: "NVS-03 satellite के बारे में जानते हैं",
    text: "<slow> अब थोड़ा जानते हैं NVS-03 के बारे में। इसका वज़न है करीब 2,250 किलोग्राम। <exhales> इसमें लगा है एक indigenous Rubidium atomic clock। ये clock Ahmedabad के Space Applications Centre ने खुद बनाई है। <slow> Navigation satellite के लिए clock उसकी धड़कन होती है। जितनी accurate घड़ी, उतनी accurate location। अगर घड़ी में एक microsecond का फ़र्क आया, तो ज़मीन पर 300 मीटर का error हो सकता है। <slow> इसके अलावा इसमें L1, L5 और S-band signals हैं, जो civilian GPS receivers और high-security military devices दोनों के लिए काम करेंगे।"
  },
  {
    num: 11,
    title: "Cyclone Arnab और ISRO की challenge",
    text: "<slow> इस सब के बीच एक और मुश्किल आई, Cyclone Arnab। <exhales> अक्टूबर के आखिरी हफ़्ते में Bay of Bengal में एक deep depression बना जो Cyclone Arnab में बदल गया। Sriharikota के तट पर तेज़ हवाएँ और भारी बारिश शुरू हो गई। <sniffles> Launch vehicle और satellite Mobile Service Tower के अंदर सुरक्षित थे, पर launch campaign का schedule tight था। Team ने दिन-रात एक करके humidity control, electrical shielding और launch pad preparations को maintain किया। मौसम ने परीक्षा ली, पर engineers पीछे नहीं हटे।"
  },
  {
    num: 12,
    title: "Launch के बाद क्या होगा",
    text: "<exhales> जब GSLV-F18 Sriharikota से उड़ेगा, तो वो NVS-03 को geosynchronous transfer orbit में छोड़ देगा। <slow> असली खेल वहाँ से शुरू होगा। Satellite के Liquid Apogee Motor यानी LAM engine को तीन बार fire किया जाएगा। इस बार pyro valve का कोई डर नहीं, वो पहले से खुला है। Latch valve खुलेगा, fuel बहेगा, और engine satellite को circular geostationary orbit में पहुँचाएगा, ज़मीन से करीब 36,000 किलोमीटर ऊपर। <slow> उस ऊंचाई पर पहुँचकर satellite के solar panels खुलेंगे और Indian Space Research Organisation का signal धरती पर आएगा।"
  },
  {
    num: 13,
    title: "इस mission का असर आगे तक जाएगा",
    text: "<slow> अगर NVS-03 सफल होता है, तो इसका असर सिर्फ़ एक satellite तक नहीं रहेगा। <exhales> NavIC constellation में working satellites की संख्या चार हो जाएगी, जो independent positioning के लिए minimum requirement है। इसके बाद NVS-04, 05 और 06 planned हैं। <slow> ये mission साबित करेगा कि ISRO एक failure के बाद रुकता नहीं है, बल्कि deeper engineering solutions निकालता है। ये launch भारत के हर नागरिक के phone, हर aircraft के navigation, और border पर खड़े हर जवान की safety से जुड़ा है।"
  },
  {
    num: 14,
    title: "आख़िरी बात, एक देश की उम्मीद",
    text: "<exhales> 30 अक्टूबर की रात जब वो rocket उड़ेगा, तो उसमें सिर्फ़ एक satellite नहीं होगा। <slow> उसमें होंगे उन engineers के सालों के effort, जो NVS-02 की failure के बाद टूटे नहीं, बल्कि और मज़बूती से वापस आए। उसमें होगी उन scientists की लगन, जिन्होंने हर गलती को ध्यान से पढ़ा और उससे सीखा। <sniffles> उसमें होगा भारत का वो सपना, जो 1999 में एक ज़रूरत से पैदा हुआ था। <slow> रात के उस एक पल में, Sriharikota के आसमान में एक रोशनी उठेगी। और उस रोशनी के साथ उठेगी करोड़ों लोगों की उम्मीद। <soft> क्योंकि ये सिर्फ़ एक launch नहीं है। ये भारत का अपने आप पर भरोसा है।"
  }
];

fs.writeFileSync('scripts/nvs03-chunks.json', JSON.stringify(rawChunks, null, 2), 'utf8');
console.log('Saved 14 chunks to scripts/nvs03-chunks.json');
rawChunks.forEach(c => {
  console.log(`Chunk ${c.num}: "${c.title}" (${c.text.length} chars)`);
});
