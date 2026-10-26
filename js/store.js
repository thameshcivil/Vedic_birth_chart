// Persistent app state: settings, saved location, alarms and reminders.
// Everything lives in localStorage (inside the APK it is the app's private storage).

const SETTINGS_KEY = "aarush.settings.v1";
const ALARMS_KEY = "aarush.alarms.v1";
const REMINDERS_KEY = "aarush.reminders.v1";
const BIRTH_KEY = "aarush.birth.v1";

export const DEFAULT_LOCATION = { name: "Chennai", lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata", source: "default" };

function guessLanguage() {
  const nav = (typeof navigator !== "undefined" && navigator.language) || "en";
  const code = nav.slice(0, 2).toLowerCase();
  return ["ta", "te", "kn", "ml", "hi", "sa"].includes(code) ? code : "ta";
}

function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch (e) {
    return "Asia/Kolkata";
  }
}

export const DEFAULT_SETTINGS = {
  lang: guessLanguage(),
  calendar: "tamil",        // tamil (solar months) | telugu | kannada (lunar months)
  lunar: "amanta",          // amanta | purnimanta
  ayanamsa: "lahiri",       // lahiri | truechitra | kp | raman | suryasiddhanta
  node: "mean",             // mean | true
  timeFormat: "24h",        // 12h | 24h | nazhigai
  theme: "light",           // system | light | dark
  location: null,           // { name, lat, lon, tz, source: gps|search|manual|default }
  sankalpam: { type: "shubham", name: "", gothram: "", salutation: "", region: "auto", tharpanam: "tila", script: "native" },
  vasthuOwner: { chandra: null, surya: null },
  onboarded: false
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage unavailable (private mode): the app keeps working for this session
  }
}

let settings = { ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) };
settings.sankalpam = { ...DEFAULT_SETTINGS.sankalpam, ...(settings.sankalpam || {}) };
const listeners = new Set();

export function getSettings() { return settings; }

export function updateSettings(patch) {
  settings = { ...settings, ...patch };
  write(SETTINGS_KEY, settings);
  for (const fn of listeners) fn(settings, patch);
}

export function onSettingsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function currentLocation() {
  return settings.location || { ...DEFAULT_LOCATION, tz: DEFAULT_LOCATION.tz || deviceTimeZone() };
}

export { deviceTimeZone };

// ----- Alarms & reminders -----
export function getAlarms() { return read(ALARMS_KEY, []); }
export function saveAlarms(list) { write(ALARMS_KEY, list); }
export function getReminders() { return read(REMINDERS_KEY, []); }
export function saveReminders(list) { write(REMINDERS_KEY, list); }

// ----- Birth details (Jathagam form) -----
export function getBirth() { return read(BIRTH_KEY, null); }
export function saveBirth(b) { write(BIRTH_KEY, b); }

export function newId() {
  return Math.floor(Math.random() * 0x3fffffff) + 1;
}
