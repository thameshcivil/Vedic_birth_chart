// Subha muhurtham days and the "days from Pournami / Amavasai" count shared by
// the Vasthu and Muhurtham tabs.

import { addDays, zoned, siderealLongitude, DAY_MS } from "./astro.js";
import { dayFacts, computePanchang, tithiAt, nakshatraAt, yogaAt } from "./panchang.js";
import { isShubhaMuhurtaDay } from "./festivals.js";
import { chandrashtamaFor } from "./vasthu.js";

const A = globalThis.Astronomy;
const ymdOf = (d, tz) => { const z = zoned(d, tz); return { year: z.year, month: z.month, day: z.day }; };
const dayDiff = (a, b) => Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS);
const moonRasi = (date) => Math.floor(siderealLongitude("Moon", date) / 30);

// Every new moon (0°) and full moon (180°) between from and to
function phasesBetween(from, to) {
  const out = [];
  for (const lon of [0, 180]) {
    let t = A.SearchMoonPhase(lon, from, (to - from) / DAY_MS + 1);
    while (t && t.date < to) {
      out.push({ kind: lon === 0 ? "amavasai" : "pournami", time: t.date });
      t = A.SearchMoonPhase(lon, new Date(t.date.getTime() + DAY_MS), 31);
    }
  }
  return out.sort((a, b) => a.time - b.time);
}

/**
 * Where a moment sits between Amavasai and Pournami.
 * last/next: { kind: "amavasai" | "pournami", time, ymd, days } — days counted on the
 * local calendar (the day after Pournami is day 1).
 */
export function moonDays(at, loc) {
  const list = phasesBetween(new Date(+at - 20 * DAY_MS), new Date(+at + 20 * DAY_MS));
  const here = ymdOf(at, loc.tz);
  const last = [...list].reverse().find((p) => p.time <= at);
  const next = list.find((p) => p.time > at);
  const wrap = (p, sign) => p && { ...p, ymd: ymdOf(p.time, loc.tz), days: sign * dayDiff(ymdOf(p.time, loc.tz), here) };
  return { last: wrap(last, 1), next: wrap(next, -1) };
}

/** Next `count` subha muhurtham days on or after `from`. */
export function upcomingMuhurtham(from, loc, count = 10, skip = 0) {
  const out = [];
  for (let i = 0; i < 500 && out.length < skip + count; i++) {
    const ymd = addDays(from.year, from.month, from.day, i);
    const facts = dayFacts(ymd, loc);
    if (isShubhaMuhurtaDay(facts)) out.push({ ymd, facts });
  }
  return out.slice(skip);
}

const overlaps = (a0, a1, r) => r && a0 < r.end && a1 > r.start;

/** Details for one muhurtham day: suggested time, lagnam, Chandrashtamam for the person. */
export function muhurthamDetails(entry, loc, owner = {}) {
  const p = computePanchang(entry.ymd, loc);
  // Suggested time: the first good (Gowri) daytime window, which already leaves out
  // Rahu kalam, Yamagandam and Gulikai; Abhijit muhurtham if there is none.
  const day = p.nallaNeram.find(([s, e]) => s >= +p.sunrise - 60000 && e <= +p.sunset + 60000);
  const abhijit = p.kaalam.find((k) => k.key === "abhijit");
  const start = new Date(day ? day[0] : abhijit.start);
  const end = new Date(day ? day[1] : abhijit.end);
  const lagnas = p.lagnas.filter((l) => (l.start == null || l.start < end) && (!l.end || l.end > start)).map((l) => l.index);
  const moonAtStart = moonRasi(start), moonAtEnd = moonRasi(end);
  const ashtama = [...new Set([chandrashtamaFor(moonAtStart), chandrashtamaFor(moonAtEnd)])];
  const check = (r) => (r == null || r === "" ? null : ashtama.includes(Number(r)));
  const chandraHit = check(owner.chandra);
  const suryaHit = check(owner.surya);
  const clash = { rahu: overlaps(start, end, p.rahuKaalam), yama: overlaps(start, end, p.yamagandam), gulikai: overlaps(start, end, p.gulikai) };
  let verdict = "unknown";
  if (chandraHit === true) verdict = "avoid";
  else if (suryaHit === true || clash.rahu || clash.yama) verdict = "caution";
  else if (chandraHit === false || suryaHit === false) verdict = "safe";
  return {
    ymd: entry.ymd, p, start, end, usedAbhijit: !day, lagnas,
    tithi: tithiAt(start), nakshatra: nakshatraAt(start), yoga: yogaAt(start),
    moonAtStart, moonAtEnd, ashtama, chandraHit, suryaHit, clash, verdict,
    moon: moonDays(start, loc)
  };
}
