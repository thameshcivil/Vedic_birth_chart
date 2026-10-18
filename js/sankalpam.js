// Builds the Shubham and Sraardham sankalpam (Sanskrit, Devanagari) from the day's
// panchangam. The text is shown in the reader's script through translit.js.

import { SA } from "./i18n/sanskrit.js";
import { festivalsOn } from "./festivals.js";
import { KARANA_KEYS } from "./panchang.js";

// Region (dvipa) phrase by where the person lives. Outside Bharat this follows the
// widely used convention mapping continents to the puranic dvipas.
const REGION_PHRASE = {
  bharat: "जम्बूद्वीपे भारतवर्षे भरतखण्डे मेरोः दक्षिणे पार्श्वे",
  asia: "जम्बूद्वीपे मेरोः दक्षिणे पार्श्वे",
  europe: "शाकद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे",
  africa: "पुष्करद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे",
  northAmerica: "क्रौञ्चद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे",
  southAmerica: "प्लक्षद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे",
  australia: "शाल्मलीद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे",
  oceania: "कुशद्वीपे रमणकवर्षे ऐन्द्रखण्डे मेरोः पश्चिमे पार्श्वे"
};
export const REGIONS = ["bharat", "asia", "europe", "africa", "northAmerica", "southAmerica", "australia", "oceania"];

export function regionFromLocation(lat, lon) {
  if (lat >= 6 && lat <= 37.5 && lon >= 68 && lon <= 97.5) return "bharat";
  if (lat <= -10 && lat >= -45 && lon >= 112 && lon <= 155) return "australia";
  if (lon >= -170 && lon <= -50 && lat >= 7) return "northAmerica";
  if (lon >= -92 && lon <= -30 && lat < 13) return "southAmerica";
  if (lat >= 35 && lon >= -25 && lon <= 45) return "europe";
  if (lat < 37 && lat > -36 && lon >= -20 && lon <= 52) return "africa";
  if (lon >= 25 && lon <= 180 && lat > -11) return "asia";
  return "oceania";
}

// Tharpanam occasion phrase (…पुण्यकाले) for each shraddha day
const SANKRAMANA_KIND = {
  mesha_vishu: [0, "विषु"], vrishabha_vishnupathi: [1, "विष्णुपदी"], mithuna_shadasheethi: [2, "षडशीति"],
  kataka_dakshinayana: [3, "दक्षिणायन"], simha_vishnupathi: [4, "विष्णुपदी"], kanya_shadasheethi: [5, "षडशीति"],
  thula_vishu: [6, "विषु"], vruchika_vishnupathi: [7, "विष्णुपदी"], dhanur_shadasheethi: [8, "षडशीति"],
  makara_uttarayana: [9, "उत्तरायण"], kumbha_vishnupathi: [10, "विष्णुपदी"], meena_shadasheethi: [11, "षडशीति"]
};

function occasionFor(id) {
  if (id.startsWith("sankramana_")) {
    const [sign, kind] = SANKRAMANA_KIND[id.slice(11)];
    return `${SA.rasi[sign]} रविसङ्क्रमण ${kind}`;
  }
  if (id.startsWith("manvadi_")) return "मन्वादि";
  const map = {
    amavasya_tharpanam: "दर्श", yugadi_krita: "कृतयुगादि", yugadi_treta: "त्रेतायुगादि",
    yugadi_dvapara: "द्वापरयुगादि", yugadi_kali: "कलियुगादि", vyathipaada: "व्यतीपात", vaidhruthi: "वैधृति",
    mahalaya_paksham: "महालय", poorvedyu: "अष्टकापूर्वेद्युः", ashtaka: "अष्टका", anvashtaka: "अन्वष्टका"
  };
  return map[id] || null;
}

export function tharpanamOccasions(ymd, loc) {
  return festivalsOn(ymd, loc).filter((f) => f.kind === "tharpanam")
    .map((f) => ({ id: f.id, phrase: occasionFor(f.id) })).filter((o) => o.phrase);
}

function tithiLoc(index) {
  if (index === 14) return SA.tithiLocative[14];
  if (index === 29) return SA.tithiLocative[15];
  return SA.tithiLocative[index % 15];
}

/**
 * opts: { type: "shubham"|"sraardham", calendar, lunar ("amanta"|"purnimanta"),
 *         name, gothram, salutation ("", "chi", "sow"), region, tharpanam ("tila"|"hiranya"),
 *         occasion (Sanskrit phrase or null) }
 * p: the day's panchangam (computePanchang)
 */
export function buildSankalpam(p, opts) {
  const isSolar = opts.calendar === "tamil";
  const samv = SA.samvatsara[isSolar ? p.samvatsaraSolar : p.samvatsaraLunar];
  const month = isSolar
    ? SA.rasi[p.solarMonth]
    : SA.lunarMonth[opts.lunar === "purnimanta" ? p.lunarMonthPurnimanta : p.lunarMonthAmanta];
  const adhika = !isSolar && p.adhika ? "अधिक " : "";
  const rithu = SA.rithuLocative[isSolar ? p.solarRithu : p.lunarRithu];
  const tithi = p.tithiSunrise;
  const nak = SA.nakshatra[p.nakSunrise];
  const yoga = SA.yoga[p.yogaSunrise];
  const karana = SA.karana[KARANA_KEYS[p.karanas && p.karanas[0] ? p.karanas[0].index : 1]];
  const region = REGION_PHRASE[opts.region] || REGION_PHRASE.bharat;

  const common =
    `शुभे शोभने मुहूर्ते आद्यब्रह्मणः द्वितीयपरार्धे श्वेतवराहकल्पे वैवस्वतमन्वन्तरे ` +
    `अष्टाविंशतितमे कलियुगे प्रथमे पादे ${region} ` +
    `शालिवाहनशकाब्दे अस्मिन् वर्तमाने व्यावहारिके प्रभवादीनां षष्ट्याः संवत्सराणां मध्ये ` +
    `${samv} नाम संवत्सरे ${SA.ayanaLocative[p.ayana]} ${rithu} ${adhika}${month} मासे ` +
    `${SA.paksha[p.paksha]} पक्षे ${tithiLoc(tithi)} शुभतिथौ ${SA.vaasara[p.weekday]} वासरयुक्तायां ` +
    `${nak} नक्षत्रयुक्तायां ${yoga} योग ${karana} करणयुक्तायां च एवंगुण विशेषण विशिष्टायां ` +
    `अस्यां ${tithiLoc(tithi)}`;

  const gothram = (opts.gothram || "").trim();
  const name = (opts.name || "").trim();

  if (opts.type === "sraardham") {
    const g = gothram ? `${gothram} गोत्राणां` : "………… गोत्राणां";
    const occasion = opts.occasion ? `${opts.occasion} पुण्यकाले ` : "";
    const rite = opts.tharpanam === "hiranya"
      ? "हिरण्यरूपेण श्राद्धं अद्य करिष्ये। तदङ्गं तिलतर्पणं च करिष्ये॥"
      : "तिलतर्पणं करिष्ये॥";
    return [
      "(प्राचीनावीती)",
      `${common} पुण्यतिथौ`,
      `${g} वसुरुद्रादित्यस्वरूपाणां अस्मत् पितृपितामहप्रपितामहानां,`,
      `${g} वसुरुद्रादित्यस्वरूपाणां अस्मत् मातामहमातुःपितामहमातुःप्रपितामहानां`,
      `उभयवंशपितॄणां अक्षय्यतृप्त्यर्थं ${occasion}${rite}`
    ].join("\n");
  }

  let person = "";
  if (name || gothram) {
    const fem = opts.salutation === "sow";
    const sal = opts.salutation === "chi" ? "चिरञ्जीविनः " : fem ? "सौभाग्यवत्याः " : "";
    const g = gothram ? `${gothram} ${fem ? "गोत्रोद्भवायाः" : "गोत्रोद्भवस्य"} ` : "";
    person = `${g}${sal}${name ? `${name} नामधेय${fem ? "ायाः" : "स्य"} ` : ""}`;
  }
  return [
    "ममोपात्त समस्त दुरितक्षयद्वारा श्रीपरमेश्वरप्रीत्यर्थं",
    `${common} शुभतिथौ`,
    `${person}${person ? "" : "मम "}सकुटुम्बस्य क्षेमस्थैर्य वीर्य विजय आयुरारोग्य ऐश्वर्याणां अभिवृद्ध्यर्थं`,
    "धर्मार्थकाममोक्ष चतुर्विध फलपुरुषार्थ सिद्ध्यर्थं ………… करिष्ये॥"
  ].join("\n");
}
