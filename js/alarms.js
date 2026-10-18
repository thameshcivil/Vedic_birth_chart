// Turns the saved alarms and reminders into the concrete schedule Android rings.
// Clock alarms that repeat are handed over as repeat rules (Android reschedules them
// itself). Alarms tied to panchangam times, and festival reminders, are expanded into
// individual times for the coming weeks; the app refreshes this whenever it opens.

import { dayFacts } from "./panchang.js";
import { nextOccurrence } from "./festivals.js";
import { addDays, fromZoned, weekdayOf } from "./astro.js";
import { getAlarms, getReminders, saveAlarms } from "./store.js";
import { setSchedule } from "./native.js";
import { t, festivalName } from "./i18n/index.js";
import { todayYmd, fmtDate } from "./format.js";

const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

export const ANCHORS = ["clock", "sunrise", "sunset", "rahu", "yama", "gulikai", "brahma", "abhijit"];
export const ANCHOR_LABEL = {
  clock: "clockTime", sunrise: "atSunrise", sunset: "atSunset", rahu: "atRahu", yama: "atYama",
  gulikai: "atGulikai", brahma: "atBrahma", abhijit: "atAbhijit"
};

const VEDIC_DAYS_AHEAD = 45;
const REMINDER_OCCURRENCES = 12;
const MAX_ENTRIES = 450;

/** Time of an anchor on a given day. */
export function anchorTime(anchor, ymd, loc) {
  const f = dayFacts(ymd, loc);
  const part = (n) => new Date(+f.sunrise + (n - 1) * f.dayLen / 8);
  switch (anchor) {
    case "sunrise": return f.sunrise;
    case "sunset": return f.sunset;
    case "rahu": return part(RAHU_PART[f.weekday]);
    case "yama": return part(YAMA_PART[f.weekday]);
    case "gulikai": return part(GULIKA_PART[f.weekday]);
    case "brahma": return f.windows.brahma[0];
    case "abhijit": return f.windows.abhijit[0];
    default: return null;
  }
}

function occurrenceId(baseId, n) {
  return ((baseId % 0x100000) * 512 + n) & 0x3fffffff;
}

function dayMatches(alarm, ymd) {
  if (alarm.repeat === "custom") return (alarm.days || []).includes(weekdayOf(ymd.year, ymd.month, ymd.day));
  return true;
}

export function buildSchedule(loc) {
  const entries = [];
  const now = Date.now();
  const today = todayYmd(loc.tz);
  const alarms = getAlarms();
  let alarmsChanged = false;

  for (const a of alarms) {
    if (!a.enabled) continue;
    const title = a.label || t(ANCHOR_LABEL[a.anchor] || "alarmTitle");
    const base = { title, kind: "alarm", vibrate: a.vibrate !== false };

    if (a.anchor === "clock") {
      if (a.repeat === "once") {
        if (a.onceTime && a.onceTime > now) entries.push({ ...base, id: occurrenceId(a.id, 511), time: a.onceTime, body: t("alarmTitle") });
        else if (a.onceTime && a.onceTime <= now) { a.enabled = false; alarmsChanged = true; }
      } else {
        entries.push({
          ...base, id: occurrenceId(a.id, 511), body: t("alarmTitle"),
          repeat: { type: a.repeat === "custom" ? "weekly" : "daily", days: a.days || [], hour: a.hour, minute: a.minute }
        });
      }
      continue;
    }

    // Panchangam-based alarm: expand day by day
    let n = 0;
    for (let i = 0; i < VEDIC_DAYS_AHEAD && n < 60; i++) {
      const ymd = addDays(today.year, today.month, today.day, i);
      if (!dayMatches(a, ymd)) continue;
      const at = anchorTime(a.anchor, ymd, loc);
      if (!at) continue;
      const time = +at - (a.offset || 0) * 60000;
      if (time <= now) continue;
      entries.push({ ...base, id: occurrenceId(a.id, n), time, body: `${t(ANCHOR_LABEL[a.anchor])} · ${fmtDate(ymd)}` });
      n++;
      if (a.repeat === "once") break;
    }
    if (a.repeat === "once" && n === 0) { a.enabled = false; alarmsChanged = true; }
  }
  if (alarmsChanged) saveAlarms(alarms);

  for (const r of getReminders()) {
    if (!r.enabled) continue;
    let from = today;
    for (let k = 0; k < (r.repeat === "once" ? 1 : REMINDER_OCCURRENCES); k++) {
      const occ = nextOccurrence(r.observance, from, loc, 400);
      if (!occ) break;
      const fireDay = r.when === "dayBefore" ? addDays(occ.year, occ.month, occ.day, -1) : occ;
      const time = +fromZoned(fireDay.year, fireDay.month, fireDay.day, r.hour, r.minute, 0, loc.tz);
      if (time > now) {
        entries.push({
          id: occurrenceId(r.id, k), kind: "reminder", time, vibrate: true,
          title: festivalName(r.observance),
          body: `${r.when === "dayBefore" ? t("dayBefore") : t("sameDay")} · ${fmtDate(occ)}`
        });
      }
      from = addDays(occ.year, occ.month, occ.day, 1);
    }
  }

  entries.sort((x, y) => (x.time || 0) - (y.time || 0));
  return entries.slice(0, MAX_ENTRIES);
}

let pending = null;
/** Rebuilds and hands over the schedule (debounced, off the main render path). */
export function refreshSchedule(loc) {
  clearTimeout(pending);
  pending = setTimeout(() => {
    try { setSchedule(buildSchedule(loc)); } catch (e) { /* keep the old schedule */ }
  }, 400);
}

/** The next time an alarm will ring, for display. */
export function nextRing(a, loc) {
  const now = Date.now();
  const today = todayYmd(loc.tz);
  for (let i = 0; i < 8; i++) {
    const ymd = addDays(today.year, today.month, today.day, i);
    if (!dayMatches(a, ymd)) continue;
    let time;
    if (a.anchor === "clock") {
      if (a.repeat === "once") return a.onceTime && a.onceTime > now ? new Date(a.onceTime) : null;
      time = +fromZoned(ymd.year, ymd.month, ymd.day, a.hour, a.minute, 0, loc.tz);
    } else {
      const at = anchorTime(a.anchor, ymd, loc);
      time = at ? +at - (a.offset || 0) * 60000 : 0;
    }
    if (time > now) return new Date(time);
  }
  return null;
}
