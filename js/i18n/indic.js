// Sanskrit (Devanagari) names shared by the Indic languages: used as-is for Sanskrit,
// and converted to Telugu, Kannada and Malayalam script (each language file then
// overrides the names that are native rather than Sanskrit).

import { transliterate } from "../translit.js";
import { SA } from "./sanskrit.js";

const devanagariTerms = {
  rasiWestern: ["एरीज्", "टॉरस्", "जेमिनी", "कैन्सर्", "लियो", "वर्गो", "लिब्रा", "स्कॉर्पियो", "सैजिटेरियस्", "कैप्रिकॉर्न्", "अक्वेरियस्", "पाइसीज्"],
  gowri: { amirtham: "अमृतम्", uthi: "उद्योगम्", rogam: "रोगम्", laabam: "लाभम्", dhanam: "धनम्", sugam: "सुखम्", soram: "चोरम्", visham: "विषम्" },
  amirthathi: { amirtha: "अमृतयोगः", siddha: "सिद्धयोगः", marana: "मरणयोगः", prabalarishta: "प्रबलारिष्टयोगः" },
  nokku: { up: "ऊर्ध्वमुखदिनम्", down: "अधोमुखदिनम्", level: "तिर्यङ्मुखदिनम्" },
  kaala: { brahma: "ब्राह्ममुहूर्तः", arunodaya: "अरुणोदयः", pratah: "प्रातःकालः", sangava: "सङ्गवः", madhyahna: "मध्याह्नः",
    aparahna: "अपराह्णः", sayahna: "सायाह्नः", abhijit: "अभिजित्", pradosha: "प्रदोषः", nishitha: "निशीथः" },
  ganam: { Deva: "देवगणः", Manushya: "मनुष्यगणः", Rakshasa: "राक्षसगणः" },
  yoni: { Horse: "अश्वः", Elephant: "गजः", Sheep: "मेषः", Serpent: "सर्पः", Dog: "श्वा", Cat: "मार्जारः", Rat: "मूषकः",
    Cow: "गौः", Buffalo: "महिषः", Tiger: "व्याघ्रः", Deer: "मृगः", Monkey: "वानरः", Mongoose: "नकुलः", Lion: "सिंहः" },
  bird: { Vulture: "गृध्रः", Cock: "कुक्कुटः", Owl: "उलूकः", Dog: "श्वा", Crow: "काकः", Peacock: "मयूरः" },
  tree: { Kuchela: "कारस्करः", Amalaki: "आमलकी", Khadira: "खदिरः", Devadaru: "देवदारुः", LongMango: "दीर्घाम्रः", Palasha: "पलाशः",
    Udumbara: "उदुम्बरः", Peepal: "अश्वत्थः", Banyan: "वटः", Mango: "आम्रः", Jackfruit: "पनसः", Bael: "बिल्वः", Arjuna: "अर्जुनः",
    Bamboo: "वेणुः", Kadamba: "कदम्बः", Ashoka: "अशोकः", Madhuca: "मधूकः" }
};

const festivalsDevanagari = {
  amavasya: "अमावास्या", pournami: "पौर्णमी", ekadashi_shukla: "शुक्ल एकादशी", ekadashi_krishna: "कृष्ण एकादशी",
  pradosham_shukla: "प्रदोषः", pradosham_krishna: "प्रदोषः", sankata_hara_chathurthi: "सङ्कटहर चतुर्थी",
  sashti_vratham: "षष्ठी व्रतम्", maatha_shivarathri: "मास शिवरात्रिः", krithigai_vratham: "कृत्तिका व्रतम्",
  bhanu_saptami: "भानु सप्तमी", angaraka_chathurthi: "अङ्गारक चतुर्थी", angaraka_chathurdashi: "अङ्गारक चतुर्दशी",
  ugadi: "युगादिः", tamil_puthandu: "तमिळ् नववर्षम्", ashoka_ashtami: "अशोकाष्टमी",
  sri_rama_navami: "श्रीराम नवमी", chithra_pournami: "चित्रा पौर्णमी", ramanuja_jayanthi: "श्री रामानुज जयन्ती",
  akshaya_thrithiyai: "अक्षय तृतीया", sankara_jayanthi: "श्री शङ्कर जयन्ती", sita_navami: "सीता नवमी",
  narasimha_jayanthi: "श्री नृसिंह जयन्ती", vaikasi_visakam: "वैशाख विशाखा",
  chandrasekharendra_jayanthi: "श्री चन्द्रशेखरेन्द्र सरस्वती जयन्ती", agni_nakshathiram_begin: "अग्निनक्षत्रारम्भः",
  agni_nakshathiram_end: "अग्निनक्षत्रसमाप्तिः", ganga_dasami: "गङ्गा दशमी (पापहर दशमी)", aani_thirumanjanam: "ज्येष्ठ उत्तरफल्गुनी अभिषेकः",
  jagannatha_ratha_yatra: "जगन्नाथ रथयात्रा", guru_purnima: "गुरुपूर्णिमा (व्यासपूजा)", aadi_pandigai: "आषाढ उत्सवः",
  aadi_perukku: "आषाढ अष्टादशी", aadi_pooram: "आषाढ पूर्वफल्गुनी (आण्डाळ् जयन्ती)", jayendra_jayanthi: "श्री जयेन्द्र सरस्वती जयन्ती",
  garuda_panchami: "गरुड पञ्चमी (नाग पञ्चमी)", varalakshmi_vratham: "वरलक्ष्मी व्रतम्", yajur_upakarma: "यजुरुपाकर्म",
  gayathri_japam: "गायत्री जपः", hayagreeva_jayanthi: "हयग्रीव जयन्ती", balarama_jayanthi: "बलराम जयन्ती",
  rig_upakarma: "ऋगुपाकर्म", onam: "श्रवण महोत्सवः (ओणम्)", maha_sankata_hara_chaturthi: "महासङ्कटहर चतुर्थी",
  gokulashtami: "कृष्ण जन्माष्टमी", sri_jayanthi: "श्री जयन्ती", vinayagar_chaturthi: "विनायक चतुर्थी",
  rishi_panchami: "ऋषि पञ्चमी", sama_upakarma: "सामोपाकर्म", doorvashtami: "दूर्वाष्टमी (राधाष्टमी)",
  vamana_jayanthi: "वामन जयन्ती", uma_maheswara_vratham: "उमामहेश्वर व्रतम् (चातुर्मास्यपूर्तिः)",
  mahalayam_start: "महालय पक्षारम्भः", mahabharani: "महाभरणी", madhyashtami: "मध्याष्टमी",
  yathi_mahalayam: "यति महालयः", mahalaya_amavasya: "महालय अमावास्या", vishwakarma_jayanthi: "विश्वकर्म जयन्ती",
  navarathiri: "नवरात्र्यारम्भः", durgashtami: "दुर्गाष्टमी", saraswathi_pooja: "सरस्वती पूजा, आयुधपूजा",
  vijaya_dasami: "विजयदशमी", deepavali: "दीपावली (नरक चतुर्दशी)", thula_snanam: "तुला स्नानारम्भः",
  annabhishekam: "अन्नाभिषेकः", kantha_sashti_begins: "स्कन्द षष्ठ्यारम्भः", soora_samharam: "शूरसंहारः (स्कन्द षष्ठी)",
  gopashtami: "गोपाष्टमी", kaala_bhairava_ashtami: "कालभैरवाष्टमी", karthigai_deepam: "कार्तिक दीपम्",
  bharani_deepam: "भरणी दीपम्", dattatreya_jayanthi: "दत्तात्रेय जयन्ती, सर्वालय दीपम्",
  vaikunta_ekadashi: "वैकुण्ठ एकादशी", arudhra_darshan: "आर्द्रा दर्शनम्", hanumath_jayanthi: "श्री हनुमज्जयन्ती",
  koodaravalli: "कूडारवल्ली", bhogi: "भोगी", makara_sankaranthi: "मकर सङ्क्रान्तिः",
  mattu_pongal: "गो पूजा (कनुमा)", kaanum_pongal: "काणुम् पोङ्गल्", thai_poosam: "पौष पुष्यम्",
  thyaga_brahma_aradhanai: "त्यागराज आराधना", vasantha_panchami: "वसन्त पञ्चमी", ratha_saptami: "रथ सप्तमी",
  bheeshmashtami: "भीष्माष्टमी", maha_shivarathiri: "महाशिवरात्रिः", maasi_magam: "माघ मघा",
  karadaiyan_nombu: "सावित्री व्रतम् (कारडैयान् नोम्बु)", narasimha_dvadashi: "नृसिंह द्वादशी", ranga_panchami: "रङ्ग पञ्चमी",
  panguni_uthiram: "फाल्गुन उत्तरफल्गुनी",
  sankramana_mesha_vishu: "मेष विषु पुण्यकालः", sankramana_vrishabha_vishnupathi: "वृषभ विष्णुपदी पुण्यकालः",
  sankramana_mithuna_shadasheethi: "मिथुन षडशीति पुण्यकालः", sankramana_kataka_dakshinayana: "दक्षिणायन पुण्यकालः",
  sankramana_simha_vishnupathi: "सिंह विष्णुपदी पुण्यकालः", sankramana_kanya_shadasheethi: "कन्या षडशीति पुण्यकालः",
  sankramana_thula_vishu: "तुला विषु पुण्यकालः", sankramana_vruchika_vishnupathi: "वृश्चिक विष्णुपदी पुण्यकालः",
  sankramana_dhanur_shadasheethi: "धनुः षडशीति पुण्यकालः", sankramana_makara_uttarayana: "उत्तरायण पुण्यकालः",
  sankramana_kumbha_vishnupathi: "कुम्भ विष्णुपदी पुण्यकालः", sankramana_meena_shadasheethi: "मीन षडशीति पुण्यकालः",
  manvadi_1: "मन्वादिः (उत्तमः)", manvadi_2: "मन्वादिः (रौच्यः)", manvadi_3: "मन्वादिः (भौत्यः)", manvadi_4: "मन्वादिः (चाक्षुषः)",
  manvadi_5: "मन्वादिः (अग्निसावर्णिः)", manvadi_6: "मन्वादिः (सूर्यसावर्णिः)", manvadi_7: "मन्वादिः (तामसः)", manvadi_8: "मन्वादिः (स्वारोचिषः)",
  manvadi_9: "मन्वादिः (स्वायम्भुवः)", manvadi_10: "मन्वादिः (इन्द्रसावर्णिः)", manvadi_11: "मन्वादिः (वैवस्वतः)", manvadi_12: "मन्वादिः (रैवतः)",
  manvadi_13: "मन्वादिः (ब्रह्मसावर्णिः)", manvadi_14: "मन्वादिः (दक्षसावर्णिः)",
  yugadi_krita: "कृतयुगादिः", yugadi_treta: "त्रेतायुगादिः", yugadi_dvapara: "द्वापरयुगादिः", yugadi_kali: "कलियुगादिः",
  vyathipaada: "व्यतीपातः", vaidhruthi: "वैधृतिः", mahalaya_paksham: "महालयपक्षः",
  poorvedyu: "अष्टकापूर्वेद्युः", ashtaka: "अष्टका", anvashtaka: "अन्वष्टका", amavasya_tharpanam: "दर्श तर्पणम्",
  shubha_muhurtam: "मुहूर्तदिनम्"
};

// Telugu, Kannada and Malayalam write Sanskrit loanwords with a short final -i / -a and
// without the nominative visarga, so soften the Sanskrit forms before converting.
function vernacular(s) {
  return s
    .replace(/ः(?=$|[\s,()])/g, "")
    .replace(/ी(?=$|[\s,()])/g, "ि")
    .replace(/म्(?=$|[\s,()])/g, "ं");
}

function convertObj(obj, lang, soften) {
  if (Array.isArray(obj)) return obj.map((v) => transliterate(soften ? vernacular(v) : v, lang));
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, transliterate(soften ? vernacular(v) : v, lang)]));
}

export const INDIC = {
  devanagariTerms,
  festivalsDevanagari,
  /** Terms and festival names in a Brahmic script (te / kn / ml) */
  forScript(lang) {
    const terms = {};
    for (const [k, v] of Object.entries(devanagariTerms)) terms[k] = convertObj(v, lang, true);
    for (const k of ["rasi", "nakshatra", "tithi", "yoga", "karana", "lunarMonth", "samvatsara", "rithu", "ayana", "paksha"]) {
      terms[k] = convertObj(SA[k], lang, true);
    }
    return { terms, festivals: convertObj(festivalsDevanagari, lang, true) };
  }
};
