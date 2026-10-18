// Dina visheshams: festivals, monthly vrathams and the shraddha / tharpanam days.
// Every observance is a rule over the day's panchangam, written here from the
// traditional definitions (month, tithi or nakshatra, and the part of the day in
// which it must prevail). Ids are keys into the language tables.
//
// Month numbers: lunar (amanta) 0 = Chaitra ... 11 = Phalguna;
//                solar 0 = Mesha (Chithirai) ... 11 = Meena (Panguni).
// Tithi numbers: 1-15 Shukla Prathama..Pournami, 16-29 Krishna Prathama..Chathurdashi, 30 Amavasya.
// Nakshatra numbers: 0 = Ashwini ... 26 = Revati.

import { dayFacts, sampleWindow, lunarMonthAt, yogaAt } from "./panchang.js";
import { addDays, siderealLongitude, findAngleCrossing, sunMoon, norm360 } from "./astro.js";

// kind: "festival" (yearly), "vratham" (monthly), "tharpanam" (shraddha punyakaalam)
const T = (id, tithi, month, kaala = "sunrise", extra = {}) =>
  ({ id, kind: "festival", type: "tithi", tithi, month, kaala, sel: "vyapti", ...extra });
const N = (id, nak, solarMonth, extra = {}) =>
  ({ id, kind: "festival", type: "nakshatra", nak, solarMonth, kaala: "day", ...extra });
const S = (id, solarMonth, day, extra = {}) =>
  ({ id, kind: "festival", type: "solarDay", solarMonth, day, ...extra });

export const RULES = [
  // ----- Monthly observances -----
  T("amavasya", 30, null, "aparahna", { kind: "vratham", sel: "poorva" }),
  T("pournami", 15, null, "pradosha", { kind: "vratham", sel: "poorva" }),
  T("ekadashi_shukla", 11, null, "sunrise", { kind: "vratham" }),
  T("ekadashi_krishna", 26, null, "sunrise", { kind: "vratham" }),
  T("pradosham_shukla", 13, null, "pradosha", { kind: "vratham" }),
  T("pradosham_krishna", 28, null, "pradosha", { kind: "vratham" }),
  T("sankata_hara_chathurthi", 19, null, "pradosha", { kind: "vratham", sel: "poorva" }),
  T("sashti_vratham", 6, null, "pratah", { kind: "vratham", sel: "poorva" }),
  T("maatha_shivarathri", 29, null, "nishitha", { kind: "vratham" }),
  { id: "krithigai_vratham", kind: "vratham", type: "nakshatra", nak: 2, kaala: "day" },
  T("bhanu_saptami", 7, null, "sunrise", { kind: "vratham", weekday: 0 }),
  T("angaraka_chathurthi", 19, null, "pradosha", { kind: "vratham", weekday: 2, sel: "poorva" }),
  T("angaraka_chathurdashi", 29, null, "sunrise", { kind: "vratham", weekday: 2 }),

  // ----- Chaitra / Chithirai -----
  T("ugadi", 1, 0, "sunrise"),
  S("tamil_puthandu", 0, 1),
  T("ashoka_ashtami", 8, 0, "pratah"),
  T("sri_rama_navami", 9, 0, "madhyahna"),
  { ...T("chithra_pournami", 15, null, "sunrise"), solarMonth: 0 },
  N("ramanuja_jayanthi", 5, 0),
  // ----- Vaishakha / Vaikasi -----
  T("akshaya_thrithiyai", 3, 1, "pratah"),
  T("sankara_jayanthi", 5, 1, "madhyahna"),
  T("sita_navami", 9, 1, "madhyahna"),
  T("narasimha_jayanthi", 14, 1, "sayahna"),
  N("vaikasi_visakam", 15, 1),
  N("chandrasekharendra_jayanthi", 16, 1),
  { id: "agni_nakshathiram_begin", kind: "festival", type: "sunDegree", deg: 20 },
  { id: "agni_nakshathiram_end", kind: "festival", type: "sunDegree", deg: 40 + 10 / 3 },
  // ----- Jyeshtha / Aani -----
  T("ganga_dasami", 10, 2, "sunrise"),
  N("aani_thirumanjanam", 11, 2),
  // ----- Ashadha / Aadi -----
  T("jagannatha_ratha_yatra", 2, 3, "sunrise"),
  T("guru_purnima", 15, 3, "sunrise"),
  S("aadi_pandigai", 3, 1),
  S("aadi_perukku", 3, 18),
  N("aadi_pooram", 10, 3),
  N("jayendra_jayanthi", 22, 3),
  // ----- Shravana / Avani -----
  T("garuda_panchami", 5, 4, "pratah"),
  { id: "varalakshmi_vratham", kind: "festival", type: "weekdayBefore", weekday: 5, before: "yajur_upakarma", within: 7 },
  T("yajur_upakarma", 15, 4, "sunrise"),
  { id: "gayathri_japam", kind: "festival", type: "offset", of: "yajur_upakarma", days: 1 },
  T("hayagreeva_jayanthi", 15, 4, "sunrise"),
  T("balarama_jayanthi", 15, 4, "sunrise"),
  N("rig_upakarma", 21, 4),
  N("onam", 21, 4),
  T("maha_sankata_hara_chaturthi", 19, 4, "pradosha", { sel: "poorva" }),
  T("gokulashtami", 23, 4, "nishitha"),
  N("sri_jayanthi", 3, 4),
  // ----- Bhadrapada / Purattasi -----
  T("vinayagar_chaturthi", 4, 5, "madhyahna"),
  T("rishi_panchami", 5, 5, "madhyahna"),
  { id: "sama_upakarma", kind: "festival", type: "nakshatra", nak: 12, month: 5, paksha: "shukla", kaala: "day" },
  T("doorvashtami", 8, 5, "sunrise"),
  T("vamana_jayanthi", 12, 5, "madhyahna"),
  T("uma_maheswara_vratham", 15, 5, "sunrise"),
  T("mahalayam_start", 16, 5, "aparahna"),
  { id: "mahabharani", kind: "festival", type: "nakshatra", nak: 1, month: 5, paksha: "krishna", kaala: "aparahna" },
  T("madhyashtami", 23, 5, "aparahna"),
  T("yathi_mahalayam", 27, 5, "aparahna"),
  T("mahalaya_amavasya", 30, 5, "aparahna", { sel: "poorva" }),
  S("vishwakarma_jayanthi", 5, 1),
  // ----- Ashvina / Aippasi -----
  T("navarathiri", 1, 6, "pratah"),
  T("durgashtami", 8, 6, "sunrise"),
  T("saraswathi_pooja", 9, 6, "sunrise"),
  T("vijaya_dasami", 10, 6, "aparahna"),
  T("deepavali", 29, 6, "arunodaya"),
  S("thula_snanam", 6, 1),
  { ...T("annabhishekam", 15, null, "sunrise"), solarMonth: 6 },
  // ----- Kartika / Karthigai -----
  T("kantha_sashti_begins", 1, 7, "pratah"),
  T("soora_samharam", 6, 7, "aparahna"),
  T("gopashtami", 8, 7, "pratah"),
  T("kaala_bhairava_ashtami", 23, 7, "nishitha"),
  N("karthigai_deepam", 2, 7),
  { id: "bharani_deepam", kind: "festival", type: "offset", of: "karthigai_deepam", days: -1 },
  // ----- Margashirsha / Margazhi -----
  T("dattatreya_jayanthi", 15, 8, "pradosha"),
  { ...T("vaikunta_ekadashi", 11, null, "sunrise"), solarMonth: 8 },
  N("arudhra_darshan", 5, 8),
  { ...T("hanumath_jayanthi", 30, null, "sunrise"), solarMonth: 8 },
  S("koodaravalli", 8, 27),
  // ----- Pausha / Thai -----
  { id: "bhogi", kind: "festival", type: "offset", of: "makara_sankaranthi", days: -1 },
  S("makara_sankaranthi", 9, 1),
  S("mattu_pongal", 9, 2),
  S("kaanum_pongal", 9, 3),
  N("thai_poosam", 7, 9),
  T("thyaga_brahma_aradhanai", 20, 9, "sunrise"),
  // ----- Magha / Maasi -----
  T("vasantha_panchami", 5, 10, "pratah"),
  T("ratha_saptami", 7, 10, "arunodaya"),
  T("bheeshmashtami", 8, 10, "madhyahna"),
  T("maha_shivarathiri", 29, 10, "nishitha"),
  N("maasi_magam", 9, 10),
  S("karadaiyan_nombu", 11, 1),
  // ----- Phalguna / Panguni -----
  T("narasimha_dvadashi", 12, 11, "sunrise"),
  T("ranga_panchami", 20, 11, "sunrise"),
  N("panguni_uthiram", 11, 11),

  // ----- Shraddha / tharpanam days (the 96 "Shannavathi") -----
  ...[["mesha_vishu", 0], ["vrishabha_vishnupathi", 1], ["mithuna_shadasheethi", 2], ["kataka_dakshinayana", 3],
    ["simha_vishnupathi", 4], ["kanya_shadasheethi", 5], ["thula_vishu", 6], ["vruchika_vishnupathi", 7],
    ["dhanur_shadasheethi", 8], ["makara_uttarayana", 9], ["kumbha_vishnupathi", 10], ["meena_shadasheethi", 11]]
    .map(([id, sign]) => ({ id: `sankramana_${id}`, kind: "tharpanam", type: "solarDay", solarMonth: sign, day: 1 })),
  ...[[0, 3], [0, 15], [2, 15], [3, 10], [3, 15], [4, 23], [5, 3], [6, 9], [7, 12], [7, 15], [10, 7], [9, 11], [11, 15], [11, 30]]
    .map(([month, tithi], i) => T(`manvadi_${i + 1}`, tithi, month, "aparahna", { kind: "tharpanam" })),
  T("yugadi_krita", 3, 1, "aparahna", { kind: "tharpanam" }),
  T("yugadi_treta", 9, 7, "aparahna", { kind: "tharpanam" }),
  T("yugadi_dvapara", 28, 5, "aparahna", { kind: "tharpanam" }),
  T("yugadi_kali", 30, 10, "aparahna", { kind: "tharpanam" }),
  { id: "vyathipaada", kind: "tharpanam", type: "yoga", yoga: 16 },
  { id: "vaidhruthi", kind: "tharpanam", type: "yoga", yoga: 26 },
  { id: "mahalaya_paksham", kind: "tharpanam", type: "mahalaya" },
  ...[8, 9, 10, 11].flatMap((month) => [
    T("poorvedyu", 22, month, "aparahna", { kind: "tharpanam" }),
    T("ashtaka", 23, month, "aparahna", { kind: "tharpanam" }),
    T("anvashtaka", 24, month, "aparahna", { kind: "tharpanam" })
  ]),
  T("amavasya_tharpanam", 30, null, "aparahna", { kind: "tharpanam", sel: "poorva" })
];

const RULE_BY_ID = new Map();
for (const r of RULES) if (!RULE_BY_ID.has(r.id)) RULE_BY_ID.set(r.id, r);

// ----------------------------------------------------------------------------
// Evaluation
// ----------------------------------------------------------------------------
const memo = new Map();
export function clearFestivalCache() { memo.clear(); }

function nb(ymd, n) { return addDays(ymd.year, ymd.month, ymd.day, n); }

// How many of the kaala samples have the target tithi / nakshatra
function coverage(ymd, loc, kind, kaala, target) {
  const f = dayFacts(ymd, loc);
  return sampleWindow(f, kind, kaala).filter((v) => v === target).length;
}

function midSample(ymd, loc, kind, kaala) {
  const s = sampleWindow(dayFacts(ymd, loc), kind, kaala);
  return s[Math.floor(s.length / 2)];
}

/** Does a tithi / nakshatra occurrence get observed on this day, under the selection rule? */
function selectedForDay(ymd, loc, kind, kaala, target, sel) {
  const c0 = coverage(ymd, loc, kind, kaala, target);
  const cNext = coverage(nb(ymd, 1), loc, kind, kaala, target);
  if (c0 === 0) {
    // Kshaya: it began after this day's kaala and was over before the next day's,
    // so it is observed on the day it began
    if (cNext > 0) return false;
    const m0 = midSample(ymd, loc, kind, kaala);
    const m1 = midSample(nb(ymd, 1), loc, kind, kaala);
    const cycle = kind === "tithi" ? 30 : 27;
    const d = (target - m0 + cycle) % cycle;
    return d > 0 && d < (m1 - m0 + cycle) % cycle;
  }
  const cPrev = coverage(nb(ymd, -1), loc, kind, kaala, target);
  if (cPrev > 0) {
    // Also prevailed yesterday: today wins only under para, or with more coverage under vyapti
    if (sel === "para") return true;
    if (sel === "vyapti") return c0 > cPrev;
    return false;
  }
  if (cNext > 0) {
    if (sel === "para") return false;
    if (sel === "vyapti") return c0 >= cNext;
    return true;
  }
  return true;
}

// An instant at which the tithi is actually in effect for this day's observance:
// inside the kaala if it prevails there, otherwise just after it begins.
function tithiInstant(ymd, loc, kaala, target) {
  const f = dayFacts(ymd, loc);
  const [s, e] = f.windows[kaala];
  const mid = new Date((+s + +e) / 2);
  const pts = +s === +e ? [s] : [s, mid, new Date(+e - 1000)];
  const vals = sampleWindow(f, "tithi", kaala);
  const i = vals.indexOf(target);
  if (i >= 0) return pts[i];
  const fn = (d) => { const p = sunMoon(d); return norm360(p.moon - p.sun); };
  const start = findAngleCrossing(fn, target * 12, s, 1.5, 0.2);
  return start ? new Date(+start + 60000) : mid;
}

function monthMatches(rule, ymd, loc) {
  const f = dayFacts(ymd, loc);
  if (rule.solarMonth != null && f.solarMonth !== rule.solarMonth) return false;
  if (rule.month != null) {
    const kaala = rule.kaala || "sunrise";
    const when = rule.type === "tithi"
      ? tithiInstant(ymd, loc, kaala, rule.tithi - 1)
      : new Date((+f.windows[kaala][0] + +f.windows[kaala][1]) / 2);
    const lm = lunarMonthAt(when);
    if (lm.adhika || lm.index !== rule.month) return false;
  }
  if (rule.paksha && f.paksha !== rule.paksha) return false;
  return true;
}

function evalRule(rule, ymd, loc, depth) {
  const f = dayFacts(ymd, loc);
  if (rule.weekday != null && f.weekday !== rule.weekday) return false;
  switch (rule.type) {
    case "tithi":
      return selectedForDay(ymd, loc, "tithi", rule.kaala, rule.tithi - 1, rule.sel || "vyapti") &&
        monthMatches(rule, ymd, loc);
    case "nakshatra": {
      if (!selectedForDay(ymd, loc, "nakshatra", rule.kaala || "day", rule.nak, rule.sel || "vyapti") ||
        !monthMatches(rule, ymd, loc)) return false;
      // When the star comes round twice in the same Tamil month, the later one is observed
      if (rule.solarMonth != null) {
        for (let k = 24; k <= 30; k++) {
          const f2 = dayFacts(nb(ymd, k), loc);
          if (f2.solarMonth !== rule.solarMonth) break;
          if (sampleWindow(f2, "nakshatra", rule.kaala || "day").includes(rule.nak)) return false;
        }
      }
      return true;
    }
    case "solarDay":
      return f.solarMonth === rule.solarMonth && f.solarDay === rule.day;
    case "sunDegree": {
      const a = siderealLongitude("Sun", f.sunrise), b = siderealLongitude("Sun", f.nextSunrise);
      return a < rule.deg && b >= rule.deg;
    }
    case "yoga":
      return selectedForDay(ymd, loc, "yoga", "aparahna", rule.yoga, "vyapti");
    case "mahalaya": {
      const s = sampleWindow(f, "tithi", "aparahna")[1];
      const [ws, we] = f.windows.aparahna;
      const lm = lunarMonthAt(new Date((+ws + +we) / 2));
      return !lm.adhika && lm.index === 5 && s >= 15;
    }
    case "offset":
      return evalRule(RULE_BY_ID.get(rule.of), nb(ymd, -rule.days), loc, depth + 1);
    case "weekdayBefore":
      for (let i = 1; i <= rule.within; i++) {
        if (evalRule(RULE_BY_ID.get(rule.before), nb(ymd, i), loc, depth + 1)) return true;
      }
      return false;
    default:
      return false;
  }
}

function festivalIdsOn(ymd, loc) {
  const key = `${ymd.year}-${ymd.month}-${ymd.day}@${loc.lat},${loc.lon},${loc.tz}`;
  if (memo.has(key)) return memo.get(key);
  const ids = [];
  for (const rule of RULES) {
    if (ids.includes(rule.id)) continue;
    try {
      if (evalRule(rule, ymd, loc, 0)) ids.push(rule.id);
    } catch (e) {
      // A rule that cannot be evaluated (e.g. polar night) is simply skipped
    }
  }
  memo.set(key, ids);
  if (memo.size > 1500) memo.delete(memo.keys().next().value);
  return ids;
}

/** Observances on a day: [{id, kind}] ordered festival, vratham, tharpanam. */
export function festivalsOn(ymd, loc) {
  const order = { festival: 0, vratham: 1, tharpanam: 2 };
  return festivalIdsOn(ymd, loc)
    .map((id) => ({ id, kind: RULE_BY_ID.get(id).kind }))
    .sort((a, b) => order[a.kind] - order[b.kind]);
}

export function ruleKind(id) {
  const r = RULE_BY_ID.get(id);
  return r ? r.kind : "festival";
}

/** Every observance id, for reminder pickers. */
export function allObservanceIds() {
  return [...RULE_BY_ID.keys()];
}

/** Next date (on or after `from`) on which the observance falls, within `limitDays`. */
export function nextOccurrence(id, from, loc, limitDays = 400) {
  for (let i = 0; i < limitDays; i++) {
    const d = nb(from, i);
    if (festivalIdsOn(d, loc).includes(id)) return d;
  }
  return null;
}

// ----------------------------------------------------------------------------
// General guide to auspicious (muhurtham) days: favourable tithi, nakshatra and
// weekday, not a Kari naal, not Marana / Prabalarishta yogam, outside Aadi,
// Purattasi and Margazhi and outside adhika months.
// ----------------------------------------------------------------------------
const GOOD_TITHI = new Set([2, 3, 5, 7, 10, 11, 13, 17, 18, 20]);
const GOOD_NAK = new Set([3, 4, 9, 11, 12, 14, 16, 18, 20, 21, 25, 26]);
const GOOD_WEEKDAY = new Set([1, 3, 4, 5]);
export function isShubhaMuhurtaDay(p) {
  return GOOD_TITHI.has(p.tithiSunrise + 1) && GOOD_NAK.has(p.nakSunrise) && GOOD_WEEKDAY.has(p.weekday) &&
    !p.kariNaal && !p.adhika && ![3, 5, 8].includes(p.solarMonth) && !p.careful;
}
