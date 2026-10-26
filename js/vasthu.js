// Vasthu days: the eight days a year when Vasthu Bhagavan is awake, fixed in the
// Tamil solar calendar, each with a 36-minute pooja window (1.5 nazhigai).
// The window clock times are the traditional ones published every year
// (e.g. AstroVed's 2026 list); they are stored as minutes after 06:00 local time.
// For each day we also check Chandrashtamam for the house owner's rasi.

import { addDays, fromZoned, siderealLongitude } from "./astro.js";
import { dayFacts, computePanchang, tithiAt, nakshatraAt, yogaAt } from "./panchang.js";

export const POOJA_MINUTES = 36;

// m: solar month (0 = Chithirai / Mesha), d: Tamil date, start: minutes after 06:00,
// near: the Gregorian month/day it usually falls on (searched ±4 days).
export const VASTHU_DAYS = [
  { m: 0, d: 10, start: 174, near: [4, 23] },   // Chithirai 10  · 08:54
  { m: 1, d: 21, start: 238, near: [6, 4] },    // Vaikasi 21    · 09:58
  { m: 3, d: 11, start: 104, near: [7, 27] },   // Aadi 11       · 07:44
  { m: 4, d: 6, start: 83, near: [8, 22] },     // Aavani 6      · 07:23
  { m: 6, d: 11, start: 104, near: [10, 28] },  // Aippasi 11    · 07:44
  { m: 7, d: 8, start: 329, near: [11, 24] },   // Karthigai 8   · 11:29
  { m: 9, d: 12, start: 281, near: [1, 25] },   // Thai 12       · 10:41
  { m: 10, d: 22, start: 272, near: [3, 6] }    // Maasi 22      · 10:32
];

const ymdNum = (x) => x.year * 10000 + x.month * 100 + x.day;
const moonRasi = (date) => Math.floor(siderealLongitude("Moon", date) / 30);

/** Rasi whose 8th house the Moon is in, i.e. the rasi that has Chandrashtamam. */
export const chandrashtamaFor = (moonRasiIndex) => (moonRasiIndex + 5) % 12;

function findDate(year, v, loc) {
  for (let off = -4; off <= 4; off++) {
    const ymd = addDays(year, v.near[0], v.near[1], off);
    const f = dayFacts(ymd, loc);
    if (f.solarMonth === v.m && f.solarDay === v.d) return { ymd, facts: f };
  }
  return null;
}

/** The next `count` Vasthu days on or after `from` (a {year, month, day}). */
export function upcomingVasthu(from, loc, count = 8) {
  const out = [];
  for (let y = from.year - 1; y <= from.year + 3 && out.length < count + 8; y++) {
    for (const v of VASTHU_DAYS) {
      const hit = findDate(y, v, loc);
      if (hit && ymdNum(hit.ymd) >= ymdNum(from)) out.push({ ...hit, rule: v });
    }
  }
  out.sort((a, b) => ymdNum(a.ymd) - ymdNum(b.ymd));
  return out.slice(0, count);
}

const overlaps = (a0, a1, r) => r && a0 < r.end && a1 > r.start;

/**
 * Full details for one Vasthu day and the verdict for an owner.
 * owner: { chandra: 0-11 | null, surya: 0-11 | null }
 */
export function vasthuDetails(entry, loc, owner = {}) {
  const { ymd, rule } = entry;
  const start = new Date(+fromZoned(ymd.year, ymd.month, ymd.day, 6, 0, 0, loc.tz) + rule.start * 60000);
  const end = new Date(+start + POOJA_MINUTES * 60000);
  const p = computePanchang(ymd, loc);
  const moonAtStart = moonRasi(start), moonAtEnd = moonRasi(end);
  // Rasis in Chandrashtamam at any moment of the pooja window
  const ashtama = [...new Set([chandrashtamaFor(moonAtStart), chandrashtamaFor(moonAtEnd)])];

  const check = (r) => (r == null || r === "" ? null : ashtama.includes(Number(r)));
  const chandraHit = check(owner.chandra);
  const suryaHit = check(owner.surya);
  const clash = {
    rahu: overlaps(start, end, p.rahuKaalam),
    yama: overlaps(start, end, p.yamagandam),
    gulikai: overlaps(start, end, p.gulikai)
  };

  // Traditional reckoning is from the Moon sign; the Sun-sign check is an extra caution.
  let verdict = "unknown";
  if (chandraHit === true) verdict = "avoid";
  else if (suryaHit === true || clash.rahu || clash.yama) verdict = "caution";
  else if (chandraHit === false || suryaHit === false) verdict = "safe";

  return {
    ymd, rule, start, end, p,
    tithi: tithiAt(start), nakshatra: nakshatraAt(start), yoga: yogaAt(start),
    moonAtStart, moonAtEnd, ashtama, chandraHit, suryaHit, clash, verdict
  };
}
