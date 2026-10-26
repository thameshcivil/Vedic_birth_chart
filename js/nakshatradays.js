// Upcoming periods of chosen nakshatras (the ones marked + or * in the printed
// panchangam's 27-nakshatra table), with a Chandrashtamam check for the person.

import { siderealLongitude, findAngleCrossing, zoned, norm360, DAY_MS } from "./astro.js";
import { computePanchang, tithiAt, yogaAt } from "./panchang.js";
import { chandrashtamaFor } from "./vasthu.js";
import { moonDays } from "./muhurtham.js";

const UNIT = 360 / 27;

// Marks as printed in the panchangam table (0 = Ashwini … 26 = Revati).
// No mark: Krittika (2), Punarvasu (6), Chitra (13), Vishakha (15), Purva Bhadrapada (24).
export const PLUS = new Set([0, 1, 3, 5, 7, 8, 9, 10, 12, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26]);
export const STAR = new Set([3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26]);   // the classical marriage stars
export const marksOf = (i) => `${PLUS.has(i) ? "+" : ""}${STAR.has(i) ? "*" : ""}`;

const moonLon = (d) => siderealLongitude("Moon", d);
const moonRasi = (d) => Math.floor(moonLon(d) / 30);

/** Moon nakshatra periods [{ index, start, end }] covering from → from + days. */
function periods(from, days) {
  const out = [];
  let idx = Math.floor(moonLon(from) / UNIT);
  // Start of the nakshatra running now
  let start = findAngleCrossing(moonLon, norm360(idx * UNIT), new Date(+from - 1.6 * DAY_MS), 1.7, 0.2);
  if (!start || start > from) start = new Date(+from - DAY_MS);
  let t = from;
  const stop = +from + days * DAY_MS;
  for (let guard = 0; guard < days * 2 + 4 && +t < stop; guard++) {
    const end = findAngleCrossing(moonLon, norm360((idx + 1) * UNIT), t, 1.7, 0.2);
    if (!end) break;
    out.push({ index: idx % 27, start, end });
    start = end;
    t = new Date(+end + 60000);
    idx = (idx + 1) % 27;
  }
  return out;
}

/**
 * Next `count` periods of marked nakshatras that have not yet ended.
 * filter: "all" (+ or *), "plus", "star".
 */
export function upcomingStars(now, count, filter = "all") {
  const want = (i) => (filter === "plus" ? PLUS.has(i) : filter === "star" ? STAR.has(i) : PLUS.has(i) || STAR.has(i));
  const out = [];
  let from = now;
  for (let chunk = 0; chunk < 12 && out.length < count; chunk++) {
    const list = periods(from, 30);
    for (const p of list) if (p.end > now && want(p.index) && !out.some((o) => +o.start === +p.start)) out.push(p);
    from = new Date(+list[list.length - 1].end + 60000);
  }
  return out.slice(0, count);
}

const ymdOf = (d, tz) => { const z = zoned(d, tz); return { year: z.year, month: z.month, day: z.day }; };

/** Card details for one nakshatra period, in the shape the shared day card expects. */
export function starDetails(period, loc, owner = {}) {
  const { start, end } = period;
  const ymd = ymdOf(start, loc.tz);
  const p = computePanchang(ymd, loc);
  const moonAtStart = moonRasi(new Date(+start + 60000));
  const moonAtEnd = moonRasi(new Date(+end - 60000));
  const ashtama = [...new Set([chandrashtamaFor(moonAtStart), chandrashtamaFor(moonAtEnd)])];
  const check = (r) => (r == null || r === "" ? null : ashtama.includes(Number(r)));
  const chandraHit = check(owner.chandra);
  const suryaHit = check(owner.surya);
  let verdict = "unknown";
  if (chandraHit === true) verdict = "avoid";
  else if (suryaHit === true) verdict = "caution";
  else if (chandraHit === false || suryaHit === false) verdict = "safe";
  return {
    ymd, p, start, end, index: period.index, marks: marksOf(period.index),
    tithi: tithiAt(start), nakshatra: period.index, yoga: yogaAt(start),
    moonAtStart, moonAtEnd, ashtama, chandraHit, suryaHit,
    clash: { rahu: false, yama: false, gulikai: false }, verdict,
    moon: moonDays(start, loc)
  };
}
