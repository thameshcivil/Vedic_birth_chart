// Daily panchangam: everything shown on the "Today" screen and in the calendar,
// computed for a civil date at a location. All names are returned as keys
// (indexes into the language tables), never as display text.

import {
  DAY_MS, norm360, sunMoon, siderealLongitude, ascendantSidereal, riseSet,
  previousNewMoon, nextNewMoon, sankrantiBefore, findAngleCrossing,
  fromZoned, zoned, addDays, weekdayOf
} from "./astro.js";

// ----------------------------------------------------------------------------
// Fixed tables
// ----------------------------------------------------------------------------
export const WEEKDAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const NAKSHATRA_LORDS = Array.from({ length: 27 }, (_, i) =>
  ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"][i % 9]);
export const RASI_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

// Raahu Kaalam, Yamagandam, Gulikai: which eighth of the daytime (1-8), Sunday first
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

// Vaara Shoolam: direction to avoid travelling, and the traditional remedy (parihaaram)
const SHOOLAM = [
  { dir: "west", remedy: "jaggery" },     // Sunday
  { dir: "east", remedy: "curd" },        // Monday
  { dir: "north", remedy: "milk" },       // Tuesday
  { dir: "north", remedy: "milk" },       // Wednesday
  { dir: "south", remedy: "oil" },        // Thursday
  { dir: "west", remedy: "jaggery" },     // Friday
  { dir: "east", remedy: "curd" }         // Saturday
];

// Amirthathi yogam (Tamil): weekday x nakshatra -> amirtha / siddha / marana / prabalarishta.
// Rows Sunday..Saturday; every nakshatra not listed for a weekday is Siddha.
const AMIRTHATHI_TABLE = (() => {
  const N = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
    "Ashlesha", "Magha", "PurvaPhalguni", "UttaraPhalguni", "Hasta", "Chitra", "Swati", "Vishakha",
    "Anuradha", "Jyeshtha", "Mula", "PurvaAshadha", "UttaraAshadha", "Shravana", "Dhanishta",
    "Shatabhisha", "PurvaBhadrapada", "UttaraBhadrapada", "Revati"];
  const rows = [
    { a: ["UttaraPhalguni", "Mula", "UttaraAshadha", "Shravana", "UttaraBhadrapada", "Revati"],
      m: ["Magha", "Vishakha", "Anuradha", "Jyeshtha", "Dhanishta"], p: ["Bharani"] },
    { a: ["Rohini", "Punarvasu", "Swati", "Shravana"],
      m: ["Krittika", "Magha", "Vishakha", "PurvaAshadha", "UttaraAshadha", "PurvaBhadrapada"], p: ["Chitra"] },
    { a: ["Rohini", "UttaraPhalguni", "Mula", "UttaraBhadrapada"],
      m: ["Ardra", "Vishakha", "Jyeshtha", "Shatabhisha", "PurvaBhadrapada"], p: ["UttaraAshadha"] },
    { a: ["Krittika", "PurvaPhalguni", "UttaraPhalguni", "PurvaAshadha", "UttaraAshadha", "PurvaBhadrapada"],
      m: ["Ashwini", "Hasta", "Mula", "Revati"], p: ["Dhanishta"] },
    { a: ["Ashwini", "Punarvasu", "Magha", "Swati"],
      m: ["Krittika", "Rohini", "Mrigashira", "Ardra", "UttaraPhalguni", "Shatabhisha"], p: ["Jyeshtha"] },
    { a: ["Ashwini", "Hasta", "Mula"],
      m: ["Rohini", "Pushya", "Ashlesha", "Magha", "Jyeshtha", "Shravana"], p: ["PurvaAshadha"] },
    { a: ["Rohini", "Magha", "Shatabhisha"],
      m: ["Ashlesha", "UttaraPhalguni", "Hasta", "Chitra", "PurvaBhadrapada"], p: ["Revati"] }
  ];
  return rows.map((r) => N.map((n) =>
    r.a.includes(n) ? "amirtha" : r.m.includes(n) ? "marana" : r.p.includes(n) ? "prabalarishta" : "siddha"));
})();

// Nokku naal (direction the day "faces"), by nakshatra
const NOKKU = (() => {
  const up = [20, 3, 7, 5, 22, 21, 23, 25, 11]; // Uttarashadha, Rohini, Pushya, Ardra, Dhanishta, Shravana, Shatabhisha, U.Bhadra, U.Phalguni
  const down = [2, 1, 10, 8, 15, 9, 18, 19, 24]; // Krittika, Bharani, P.Phalguni, Ashlesha, Vishakha, Magha, Mula, P.Ashadha, P.Bhadra
  return Array.from({ length: 27 }, (_, i) => up.includes(i) ? "up" : down.includes(i) ? "down" : "level");
})();

// Kari naal: Tamil solar month (0 = Chithirai) -> day numbers
const KARI_NAAL = [[6, 15], [7, 16, 17], [1, 6], [2, 10, 20], [2, 9, 28], [16, 29], [6, 20], [1, 10, 17],
  [6, 9, 11], [1, 2, 3, 11, 17], [15, 16, 17], [6, 15, 19]];

// Gowri panchangam, daytime order from sunrise, Sunday..Saturday (common Tamil table).
// Night segments continue the same day's order starting from its 6th segment.
const GOWRI_DAY = [
  ["uthi", "amirtham", "rogam", "laabam", "dhanam", "sugam", "visham", "soram"],
  ["amirtham", "visham", "rogam", "laabam", "dhanam", "sugam", "soram", "uthi"],
  ["rogam", "laabam", "dhanam", "sugam", "visham", "uthi", "soram", "amirtham"],
  ["laabam", "dhanam", "sugam", "visham", "soram", "amirtham", "uthi", "rogam"],
  ["dhanam", "sugam", "soram", "amirtham", "uthi", "visham", "rogam", "laabam"],
  ["sugam", "soram", "uthi", "visham", "amirtham", "dhanam", "laabam", "rogam"],
  ["soram", "uthi", "visham", "amirtham", "rogam", "laabam", "dhanam", "sugam"]
];
export const GOWRI_GOOD = new Set(["amirtham", "uthi", "laabam", "dhanam", "sugam"]);

// Planetary hours: each hour's lord follows the weekday-lord order Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
const HORAI_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

export const KARANA_KEYS = (() => {
  const movable = ["bava", "balava", "kaulava", "taitila", "gara", "vanija", "vishti"];
  const out = ["kimstughna"];
  for (let k = 1; k <= 56; k++) out.push(movable[(k - 1) % 7]);
  out.push("shakuni", "chatushpada", "naga");
  return out;
})();

// ----------------------------------------------------------------------------
// Instant values
// ----------------------------------------------------------------------------
export function tithiAt(date) {
  const { sun, moon } = sunMoon(date);
  return Math.floor(norm360(moon - sun) / 12); // 0..29
}
export function nakshatraAt(date) {
  return Math.floor(sunMoon(date).moon / (360 / 27));
}
export function yogaAt(date) {
  const { sun, moon } = sunMoon(date);
  return Math.floor(norm360(sun + moon) / (360 / 27));
}

const VALUE_FNS = {
  tithi: { fn: (d) => { const p = sunMoon(d); return norm360(p.moon - p.sun); }, unit: 12 },
  karana: { fn: (d) => { const p = sunMoon(d); return norm360(p.moon - p.sun); }, unit: 6 },
  nakshatra: { fn: (d) => sunMoon(d).moon, unit: 360 / 27 },
  yoga: { fn: (d) => { const p = sunMoon(d); return norm360(p.sun + p.moon); }, unit: 360 / 27 },
  moonRasi: { fn: (d) => sunMoon(d).moon, unit: 30 },
  sunNakshatra: { fn: (d) => sunMoon(d).sun, unit: 360 / 27 }
};

/** Consecutive segments of a quantity between two instants: [{index, start, end}] */
export function segments(kind, from, to) {
  const { fn, unit } = VALUE_FNS[kind];
  const slow = kind === "sunNakshatra";
  const out = [];
  let t = from;
  let v = fn(t);
  let idx = Math.floor(v / unit);
  let start = null;
  for (let guard = 0; guard < 8; guard++) {
    const target = norm360((idx + 1) * unit);
    const end = slow
      ? findAngleCrossing(fn, target, t, 16, 1)
      : findAngleCrossing(fn, target, t, unit / 9 + 0.15, 0.2);
    out.push({ index: idx % Math.round(360 / unit), start, end });
    if (!end || end >= to) break;
    t = end;
    start = end;
    idx = (idx + 1) % Math.round(360 / unit);
  }
  return out;
}

// ----------------------------------------------------------------------------
// Sunrise-based day facts (cheap: no end-time searches). Used by the calendar
// and the festival rules; the Today screen adds the detailed timings on top.
// ----------------------------------------------------------------------------
const factsCache = new Map();

export function clearPanchangCache() {
  factsCache.clear();
  yearStartCache.clear();
}

function locKey(loc) {
  return `${loc.lat.toFixed(3)},${loc.lon.toFixed(3)},${loc.tz}`;
}

export function dayFacts(ymd, loc) {
  const key = `${ymd.year}-${ymd.month}-${ymd.day}@${locKey(loc)}`;
  if (factsCache.has(key)) return factsCache.get(key);

  const midnight = fromZoned(ymd.year, ymd.month, ymd.day, 0, 0, 0, loc.tz);
  let sunrise = riseSet("Sun", loc.lat, loc.lon, midnight, +1, 1);
  let polar = false;
  if (!sunrise) { sunrise = new Date(midnight.getTime() + 6 * 3600000); polar = true; }
  let sunset = riseSet("Sun", loc.lat, loc.lon, sunrise, -1, 1);
  if (!sunset) { sunset = new Date(midnight.getTime() + 18 * 3600000); polar = true; }
  let nextSunrise = riseSet("Sun", loc.lat, loc.lon, sunset, +1, 1.2);
  if (!nextSunrise) { nextSunrise = new Date(sunrise.getTime() + DAY_MS); polar = true; }
  const prevMidnight = fromZoned(...ymdArr(addDays(ymd.year, ymd.month, ymd.day, -1)), 0, 0, 0, loc.tz);
  let prevSunset = riseSet("Sun", loc.lat, loc.lon, prevMidnight, -1, 1.2);
  if (!prevSunset || prevSunset > sunrise) prevSunset = new Date(sunrise.getTime() - 12 * 3600000);

  const dayLen = sunset - sunrise;
  const nightLen = nextSunrise - sunset;
  const prevNightLen = sunrise - prevSunset;
  const muhurtaNight = nightLen / 15;
  const at = (t) => new Date(t);

  // Kaala windows used by observance rules (classical divisions of day and night)
  const windows = {
    arunodaya: [at(sunrise - 4 * 24 * 60000), sunrise],
    brahma: [at(sunrise - 2 * prevNightLen / 15), at(sunrise - prevNightLen / 15)],
    sunrise: [sunrise, sunrise],
    pratah: [sunrise, at(+sunrise + dayLen / 5)],
    sangava: [at(+sunrise + dayLen / 5), at(+sunrise + 2 * dayLen / 5)],
    madhyahna: [at(+sunrise + 2 * dayLen / 5), at(+sunrise + 3 * dayLen / 5)],
    aparahna: [at(+sunrise + 3 * dayLen / 5), at(+sunrise + 4 * dayLen / 5)],
    sayahna: [at(+sunrise + 4 * dayLen / 5), sunset],
    pradosha: [sunset, at(+sunset + 3 * muhurtaNight)],
    nishitha: [at(+sunset + 7 * muhurtaNight), at(+sunset + 8 * muhurtaNight)],
    abhijit: [at(+sunrise + 7 * dayLen / 15), at(+sunrise + 8 * dayLen / 15)],
    day: [sunrise, sunset]
  };

  const weekday = weekdayOf(ymd.year, ymd.month, ymd.day);
  const tithiSunrise = tithiAt(sunrise);
  const nakSunrise = nakshatraAt(sunrise);

  const facts = {
    ymd, loc, sunrise, sunset, nextSunrise, prevSunset, dayLen, nightLen, polar, windows, weekday,
    tithiSunrise, nakSunrise, yogaSunrise: yogaAt(sunrise),
    paksha: tithiSunrise < 15 ? "shukla" : "krishna",
    _samples: {}
  };
  Object.assign(facts, solarDate(ymd, loc, sunset));
  Object.assign(facts, lunarMonth(sunrise, tithiSunrise));
  facts.sunSignSunrise = Math.floor(siderealLongitude("Sun", sunrise) / 30);
  facts.ayana = [9, 10, 11, 0, 1, 2].includes(facts.sunSignSunrise) ? "uttarayana" : "dakshinayana";
  facts.solarRithu = Math.floor(facts.solarMonth / 2);
  facts.lunarRithu = Math.floor(facts.lunarMonthAmanta / 2);
  facts.kariNaal = KARI_NAAL[facts.solarMonth].includes(facts.solarDay);
  facts.yogamSunrise = AMIRTHATHI_TABLE[weekday][nakSunrise];
  facts.careful = facts.kariNaal || facts.yogamSunrise === "marana" || facts.yogamSunrise === "prabalarishta";
  // Tamil year: Mesha sankranti before sunset makes that day New Year's day
  facts.samvatsaraSolar = samvatsaraIndex(ymd, loc, "solar", sunset);
  facts.samvatsaraLunar = samvatsaraIndex(ymd, loc, "lunar", sunrise);

  factsCache.set(key, facts);
  if (factsCache.size > 800) factsCache.delete(factsCache.keys().next().value);
  return facts;
}

function ymdArr(o) { return [o.year, o.month, o.day]; }

/** Value of a quantity sampled at the start, middle and end of a kaala window (memoised). */
export function sampleWindow(facts, kind, windowName) {
  const k = `${kind}:${windowName}`;
  if (facts._samples[k]) return facts._samples[k];
  const [s, e] = facts.windows[windowName];
  const pts = s.getTime() === e.getTime() ? [s] : [s, new Date((+s + +e) / 2), new Date(+e - 1000)];
  const f = kind === "tithi" ? tithiAt : kind === "nakshatra" ? nakshatraAt : yogaAt;
  const vals = pts.map(f);
  facts._samples[k] = vals;
  return vals;
}

// ----------------------------------------------------------------------------
// Solar month and day (Tamil rule: a sankranti before sunset makes that day the 1st)
// ----------------------------------------------------------------------------
function solarDate(ymd, loc, sunset) {
  const sk = sankrantiBefore(sunset);
  const z = zoned(sk.time, loc.tz);
  let first = { year: z.year, month: z.month, day: z.day };
  const firstMidnight = fromZoned(first.year, first.month, first.day, 0, 0, 0, loc.tz);
  const firstSunrise = riseSet("Sun", loc.lat, loc.lon, firstMidnight, +1, 1) || firstMidnight;
  const firstSunset = riseSet("Sun", loc.lat, loc.lon, firstSunrise, -1, 1) || new Date(+firstMidnight + 18 * 3600000);
  if (sk.time > firstSunset) first = addDays(first.year, first.month, first.day, 1);
  const dayNum = Math.round((Date.UTC(ymd.year, ymd.month - 1, ymd.day) -
    Date.UTC(first.year, first.month - 1, first.day)) / DAY_MS) + 1;
  return { solarMonth: sk.sign, solarDay: dayNum, sankrantiTime: sk.time };
}

// ----------------------------------------------------------------------------
// Lunar month: named by the sidereal sign the Sun is in at the new moon that starts
// it (Sun in Meena -> Chaitra). No sankranti in the month makes it Adhika.
// ----------------------------------------------------------------------------
const lunationCache = new Map();
function lunationAround(date) {
  const nm = previousNewMoon(date);
  const key = Math.round(nm.getTime() / 60000);
  if (lunationCache.has(key)) return lunationCache.get(key);
  const next = nextNewMoon(new Date(nm.getTime() + 2 * DAY_MS));
  const s1 = Math.floor(siderealLongitude("Sun", nm) / 30);
  const s2 = Math.floor(siderealLongitude("Sun", next) / 30);
  const res = { start: nm, end: next, index: (s1 + 1) % 12, adhika: s1 === s2 };
  lunationCache.set(key, res);
  return res;
}

/** Amanta lunar month index (0 = Chaitra) and adhika flag at any instant. */
export function lunarMonthAt(date) {
  const lun = lunationAround(date);
  return { index: lun.index, adhika: lun.adhika };
}

function lunarMonth(sunrise, tithiSunrise) {
  const lun = lunationAround(sunrise);
  const amanta = lun.index;
  // Purnimanta months run full moon to full moon: the dark fortnight belongs to the next
  // month. An adhika month is the same new-moon-to-new-moon span in both systems.
  const purnimanta = tithiSunrise >= 15 && !lun.adhika ? (amanta + 1) % 12 : amanta;
  return {
    lunarMonthAmanta: amanta, lunarMonthPurnimanta: purnimanta, adhika: lun.adhika,
    lunationStart: lun.start, lunationEnd: lun.end
  };
}

// ----------------------------------------------------------------------------
// Samvatsara (60-year cycle): Prabhava began in April 1987. The solar year starts
// at Mesha sankranti (Tamil), the lunar year at the new moon that starts Chaitra.
// ----------------------------------------------------------------------------
const yearStartCache = new Map();
function yearStart(year, kind) {
  const k = `${year}:${kind}`;
  if (yearStartCache.has(k)) return yearStartCache.get(k);
  let t;
  if (kind === "solar") {
    t = findAngleCrossing((d) => siderealLongitude("Sun", d), 0, new Date(Date.UTC(year, 2, 25)), 40, 1);
  } else {
    // First new moon of the year with the Sun in Meena
    let nm = nextNewMoon(new Date(Date.UTC(year, 1, 10)));
    for (let i = 0; i < 4 && nm; i++) {
      if (Math.floor(siderealLongitude("Sun", nm) / 30) === 11) break;
      nm = nextNewMoon(new Date(nm.getTime() + 2 * DAY_MS));
    }
    t = nm;
  }
  yearStartCache.set(k, t);
  return t;
}

function samvatsaraIndex(ymd, loc, kind, instant) {
  const start = yearStart(ymd.year, kind);
  const startYear = start && instant >= start ? ymd.year : ymd.year - 1;
  return (((startYear - 1987) % 60) + 60) % 60;
}

// ----------------------------------------------------------------------------
// The full daily panchangam
// ----------------------------------------------------------------------------
export function computePanchang(ymd, loc) {
  const f = dayFacts(ymd, loc);
  const { sunrise, sunset, nextSunrise, dayLen, nightLen, weekday } = f;
  const p = { ...f };

  const midnight = fromZoned(ymd.year, ymd.month, ymd.day, 0, 0, 0, loc.tz);
  p.moonrise = riseSet("Moon", loc.lat, loc.lon, midnight, +1, 1);
  p.moonset = riseSet("Moon", loc.lat, loc.lon, midnight, -1, 1);
  const nextMidnight = new Date(midnight.getTime() + DAY_MS + 3600000);
  if (p.moonrise && p.moonrise > nextMidnight) p.moonrise = null;
  if (p.moonset && p.moonset > nextMidnight) p.moonset = null;
  // Panchangam convention: the moonset that follows the day's moonrise (may fall after midnight)
  p.moonsetAfterRise = p.moonrise ? riseSet("Moon", loc.lat, loc.lon, p.moonrise, -1, 1.2) : p.moonset;

  p.tithis = segments("tithi", sunrise, nextSunrise);
  p.nakshatras = segments("nakshatra", sunrise, nextSunrise);
  p.yogas = segments("yoga", sunrise, nextSunrise);
  p.karanas = segments("karana", sunrise, nextSunrise);
  p.moonRasis = segments("moonRasi", sunrise, nextSunrise);
  p.sunNakshatra = Math.floor(siderealLongitude("Sun", sunrise) / (360 / 27));
  p.sunRasi = f.sunSignSunrise;

  p.chandrashtama = p.moonRasis.map((s) => ({ ...s, index: (s.index + 5) % 12 }));

  const eighth = dayLen / 8;
  const part = (n) => ({ start: new Date(+sunrise + (n - 1) * eighth), end: new Date(+sunrise + n * eighth) });
  p.rahuKaalam = part(RAHU_PART[weekday]);
  p.yamagandam = part(YAMA_PART[weekday]);
  p.gulikai = part(GULIKA_PART[weekday]);
  p.shoolam = SHOOLAM[weekday];

  p.amirthathi = p.nakshatras.map((s) => ({ ...s, value: AMIRTHATHI_TABLE[weekday][s.index] }));
  p.nokku = NOKKU[f.nakSunrise];

  const dayOrder = GOWRI_DAY[weekday];
  const nightOrder = [...dayOrder.slice(5), ...dayOrder.slice(0, 5)];
  const nightEighth = nightLen / 8;
  p.gowriDay = dayOrder.map((name, i) => ({
    name, good: GOWRI_GOOD.has(name),
    start: new Date(+sunrise + i * eighth), end: new Date(+sunrise + (i + 1) * eighth)
  }));
  p.gowriNight = nightOrder.map((name, i) => ({
    name, good: GOWRI_GOOD.has(name),
    start: new Date(+sunset + i * nightEighth), end: new Date(+sunset + (i + 1) * nightEighth)
  }));
  // Nalla neram: good Gowri periods with Raahu Kaalam, Yamagandam and Gulikai cut out
  p.nallaNeram = subtractRanges(
    [...p.gowriDay, ...p.gowriNight].filter((g) => g.good).map((g) => [g.start, g.end]),
    [[p.rahuKaalam.start, p.rahuKaalam.end], [p.yamagandam.start, p.yamagandam.end], [p.gulikai.start, p.gulikai.end]]
  ).filter(([s, e]) => e - s >= 20 * 60000);

  const firstLord = HORAI_ORDER.indexOf(WEEKDAY_LORDS[weekday]);
  p.horai = Array.from({ length: 24 }, (_, i) => {
    const isDay = i < 12;
    const len = isDay ? dayLen / 12 : nightLen / 12;
    const base = isDay ? +sunrise + i * len : +sunset + (i - 12) * len;
    return { lord: HORAI_ORDER[(firstLord + i) % 7], start: new Date(base), end: new Date(base + len), day: isDay };
  });

  p.lagnas = lagnaSegments(sunrise, nextSunrise, loc);

  p.kaalam = ["brahma", "arunodaya", "pratah", "sangava", "madhyahna", "aparahna", "sayahna", "abhijit", "pradosha", "nishitha"]
    .map((k) => ({ key: k, start: f.windows[k][0], end: f.windows[k][1] }));

  const aparahna = sampleWindow(f, "tithi", "aparahna");
  p.shraddhaTithi = aparahna[1];

  return p;
}

function lagnaSegments(from, to, loc) {
  const fn = (d) => ascendantSidereal(d, loc.lat, loc.lon);
  const out = [];
  let t = from;
  let sign = Math.floor(fn(t) / 30);
  let start = null;
  for (let guard = 0; guard < 16; guard++) {
    const target = ((sign + 1) % 12) * 30;
    const end = findAngleCrossing(fn, target, t, 0.25, 0.01);
    out.push({ index: sign, start, end });
    if (!end || end >= to) break;
    start = end;
    t = end;
    sign = (sign + 1) % 12;
  }
  return out;
}

function subtractRanges(ranges, cuts) {
  let out = ranges.map(([s, e]) => [+s, +e]);
  for (const [cs, ce] of cuts.map(([s, e]) => [+s, +e])) {
    const next = [];
    for (const [s, e] of out) {
      if (ce <= s || cs >= e) { next.push([s, e]); continue; }
      if (cs > s) next.push([s, cs]);
      if (ce < e) next.push([ce, e]);
    }
    out = next;
  }
  // merge touching ranges
  out.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of out) {
    if (merged.length && r[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
    else merged.push(r);
  }
  return merged.map(([s, e]) => [new Date(s), new Date(e)]);
}
