// Language lookup. Each language file supplies UI strings and display names; any name
// it leaves out comes from the Sanskrit lists (converted to its script), then English.

import en from "./en.js";
import ta from "./ta.js";
import te from "./te.js";
import kn from "./kn.js";
import ml from "./ml.js";
import hi from "./hi.js";
import sa from "./sa.js";
import { SA } from "./sanskrit.js";
import { transliterate, toPlainLatin } from "../translit.js";

export const LANGUAGES = { en, ta, te, kn, ml, hi, sa };
export const LANGUAGE_ORDER = ["en", "ta", "te", "kn", "ml", "hi", "sa"];

let current = en;

export function setLanguage(code) {
  current = LANGUAGES[code] || en;
  if (typeof document !== "undefined") {
    document.documentElement.lang = current.code;
  }
}
export function lang() { return current.code; }
export function locale() { return current.locale; }
export function brand() { return current.brand || en.brand; }

/** UI string, with {placeholders} filled from vars. */
export function t(key, vars) {
  let s = current.ui[key];
  if (s == null) s = en.ui[key];
  if (s == null) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}

// Sanskrit-derived list in the current script
function fromSanskrit(listName) {
  const src = SA[listName];
  if (!src) return null;
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const conv = (v) => (current.code === "en" ? cap(toPlainLatin(v)) : transliterate(v, current.code));
  if (Array.isArray(src)) return src.map(conv);
  return Object.fromEntries(Object.entries(src).map(([k, v]) => [k, conv(v)]));
}

const termCache = new Map();
/** A list / map of names, e.g. term("nakshatra")[3] */
export function term(name) {
  const key = `${current.code}:${name}`;
  if (termCache.has(key)) return termCache.get(key);
  const v = (current.terms && current.terms[name]) || fromSanskrit(name) || en.terms[name];
  termCache.set(key, v);
  return v;
}

export function festivalName(id) {
  return (current.festivals && current.festivals[id]) || en.festivals[id] || id;
}

/** Tithi display name, e.g. "Shukla Sapthami"; index 0..29 */
export function tithiName(index, withPaksha = true) {
  const names = term("tithi");
  const pk = term("paksha");
  if (index === 14) return names[14];
  if (index === 29) return names[15];
  const base = names[index % 15];
  return withPaksha ? `${index < 15 ? pk.shukla : pk.krishna} ${base}` : base;
}

export function karanaName(key) { return term("karana")[key] || key; }

/** Solar month name: Tamil month names for the Tamil calendar, otherwise "<Rasi> maasam" style. */
export function solarMonthName(index) {
  const tm = current.terms && current.terms.solarMonthTamil;
  if (tm) return tm[index];
  return term("rasi")[index];
}

export function lunarMonthName(index, adhika) {
  const n = term("lunarMonth")[index];
  return adhika ? `${t("adhika")} ${n}` : n;
}

/** Sanskrit (Devanagari) list straight from the source, for the sankalpam. */
export function sanskrit(name) { return SA[name]; }

export function clearTermCache() { termCache.clear(); }
