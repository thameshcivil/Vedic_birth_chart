// Formatting of times and dates in the chosen language, time zone and time format.

import { zoned, tzOffsetMinutes } from "./astro.js";
import { t, locale, term } from "./i18n/index.js";
import { getSettings } from "./store.js";

export const pad2 = (n) => String(n).padStart(2, "0");

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const fmtCache = new Map();
function timeFormatter(tz, hour12) {
  const key = `${locale()}|${tz}|${hour12}`;
  if (!fmtCache.has(key)) {
    let f;
    try {
      f = new Intl.DateTimeFormat(locale(), { timeZone: tz, hour: "numeric", minute: "2-digit", hour12 });
    } catch (e) {
      f = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12 });
    }
    fmtCache.set(key, f);
  }
  return fmtCache.get(key);
}

/**
 * A time of day. opts.ref = civil date {year,month,day} the time belongs to (adds a "+1"
 * mark when it falls on the next day); opts.sunrise enables Nazhigai format;
 * opts.clock forces clock time even in Nazhigai mode.
 */
export function fmtTime(date, tz, opts = {}) {
  if (!date) return "—";
  const fmt = getSettings().timeFormat;
  let out;
  if (fmt === "nazhigai" && opts.sunrise && !opts.clock) {
    const mins = (date - opts.sunrise) / 60000;
    const sign = mins < 0 ? "-" : "";
    const m = Math.abs(mins);
    const n = Math.floor(m / 24);
    const v = Math.floor(((m - n * 24) * 60) / 24);
    out = `${sign}${n}.${pad2(v)}`;
    return out;
  }
  if (/^UTC[+-]/.test(tz)) {
    // Fixed-offset zones (used for birth times) aren't IANA names: shift and format as UTC
    out = timeFormatter("UTC", fmt !== "24h").format(new Date(+date + tzOffsetMinutes(tz, date) * 60000));
  } else {
    out = timeFormatter(tz, fmt !== "24h").format(date);
  }
  if (opts.ref) {
    const z = zoned(date, tz);
    const refT = Date.UTC(opts.ref.year, opts.ref.month - 1, opts.ref.day);
    const dayDiff = Math.round((Date.UTC(z.year, z.month - 1, z.day) - refT) / 86400000);
    if (dayDiff === 1) out += ` ${t("nextDayMark")}`;
    else if (dayDiff > 1) out += ` +${dayDiff}`;
    else if (dayDiff < 0) out += ` −${-dayDiff}`;
  }
  return out;
}

export function fmtRange(a, b, tz, opts = {}) {
  return `${fmtTime(a, tz, opts)} – ${fmtTime(b, tz, opts)}`;
}

/** Duration in h:mm, or nazhigai.vinaadi in that mode */
export function fmtDuration(ms) {
  const fmt = getSettings().timeFormat;
  if (fmt === "nazhigai") {
    const m = ms / 60000;
    const n = Math.floor(m / 24);
    return `${n}.${pad2(Math.floor(((m - n * 24) * 60) / 24))}`;
  }
  const mins = Math.round(ms / 60000);
  return `${Math.floor(mins / 60)}:${pad2(mins % 60)}`;
}

function dateFormatter(opts) {
  const key = `${locale()}|${JSON.stringify(opts)}`;
  if (!fmtCache.has(key)) {
    let f;
    try { f = new Intl.DateTimeFormat(locale(), { timeZone: "UTC", ...opts }); }
    catch (e) { f = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...opts }); }
    fmtCache.set(key, f);
  }
  return fmtCache.get(key);
}

export function fmtDate(ymd, opts = { day: "numeric", month: "long", year: "numeric" }) {
  return dateFormatter(opts).format(new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day)));
}

export function monthYear(year, month) {
  return dateFormatter({ month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function weekdayName(index) { return term("weekday")[index]; }

export function sameYmd(a, b) {
  return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function todayYmd(tz) {
  const z = zoned(new Date(), tz);
  return { year: z.year, month: z.month, day: z.day };
}

export function ymdKey(ymd) {
  return `${ymd.year}-${pad2(ymd.month)}-${pad2(ymd.day)}`;
}

export function parseYmd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
}

export function fmtNumberLocale(n) {
  try { return new Intl.NumberFormat(locale()).format(n); } catch (e) { return String(n); }
}
