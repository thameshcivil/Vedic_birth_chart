// Alarms, reminders and stopwatch.

import { t, term, festivalName } from "../i18n/index.js";
import { esc, fmtTime, pad2, fmtDate } from "../format.js";
import { getAlarms, saveAlarms, getReminders, saveReminders, newId } from "../store.js";
import { ANCHORS, ANCHOR_LABEL, nextRing, refreshSchedule } from "../alarms.js";
import { RULES, nextOccurrence } from "../festivals.js";
import { isAndroid, canScheduleExact, openExactAlarmSettings, requestNotificationPermission } from "../native.js";
import { fromZoned, zoned } from "../astro.js";
import { todayYmd } from "../format.js";
import { icon } from "../icons.js";

// ----- Stopwatch (kept in memory while the app runs) -----
const sw = { running: false, start: 0, elapsed: 0, laps: [], raf: 0 };
function swNow() { return sw.elapsed + (sw.running ? performance.now() - sw.start : 0); }
function fmtSw(ms) {
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  return `${h ? h + ":" : ""}${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

function repeatText(a) {
  if (a.repeat === "once") return t("repeatOnce");
  if (a.repeat === "daily") return t("repeatDaily");
  return (a.days || []).map((d) => term("weekdayShort")[d]).join(" ");
}

function alarmWhen(a) {
  if (a.anchor === "clock") return `${pad2(a.hour)}:${pad2(a.minute)}`;
  const off = a.offset ? ` − ${a.offset} ${t("minutes")}` : "";
  return `${t(ANCHOR_LABEL[a.anchor])}${off}`;
}

export function renderAlarms(root, app) {
  const tab = app.state.alarmTab || "alarms";
  const loc = app.state.loc;
  const tabs = ["alarms", "reminders", "stopwatch"].map((k) =>
    `<button role="tab" aria-selected="${tab === k}" class="${tab === k ? "is-on" : ""}" data-action="alarm-tab" data-tab="${k}">${esc(t(k))}</button>`).join("");

  let body = "";
  let banner = "";
  if (!isAndroid) banner = `<p class="notice">${esc(t("webAlarmNote"))}</p>`;
  else if (!canScheduleExact()) banner = `<div class="notice"><span>${esc(t("exactNeeded"))}</span><button class="btn btn--small" data-action="exact-settings">${esc(t("allow"))}</button></div>`;

  if (tab === "alarms") {
    const list = getAlarms();
    body = list.length ? `<ul class="alist">${list.map((a) => {
      const nr = a.enabled ? nextRing(a, loc) : null;
      return `<li class="aitem ${a.enabled ? "" : "is-off"}">
        <button class="aitem__main" data-action="edit-alarm" data-id="${a.id}">
          <span class="aitem__when">${esc(alarmWhen(a))}</span>
          <span class="aitem__label">${esc(a.label || t("alarmTitle"))} · ${esc(repeatText(a))}</span>
          ${nr ? `<span class="aitem__next">${esc(t("nextRing"))}: ${esc(fmtDate(zonedYmd(nr, loc.tz), { day: "numeric", month: "short" }))} ${esc(fmtTime(nr, loc.tz, { clock: true }))}</span>` : ""}
        </button>
        <label class="switch"><input type="checkbox" data-action="toggle-alarm" data-id="${a.id}" ${a.enabled ? "checked" : ""}><span aria-hidden="true"></span><span class="sr-only">${esc(t("enabled"))}</span></label>
      </li>`;
    }).join("")}</ul>` : `<p class="empty">${esc(t("noAlarms"))}</p>`;
    body += `<div class="actions"><button class="btn" data-action="add-alarm">${icon("plus")}${esc(t("addAlarm"))}</button></div>`;
  } else if (tab === "reminders") {
    const list = getReminders();
    body = list.length ? `<ul class="alist">${list.map((r) => {
      const occ = r.enabled ? nextOccurrence(r.observance, todayYmd(loc.tz), loc, 400) : null;
      return `<li class="aitem ${r.enabled ? "" : "is-off"}">
        <button class="aitem__main" data-action="edit-reminder" data-id="${r.id}">
          <span class="aitem__when">${esc(festivalName(r.observance))}</span>
          <span class="aitem__label">${esc(r.when === "dayBefore" ? t("dayBefore") : t("sameDay"))}, ${pad2(r.hour)}:${pad2(r.minute)} · ${esc(r.repeat === "once" ? t("onceOnly") : t("everyOccurrence"))}</span>
          ${occ ? `<span class="aitem__next">${esc(t("nextRing"))}: ${esc(fmtDate(occ))}</span>` : ""}
        </button>
        <label class="switch"><input type="checkbox" data-action="toggle-reminder" data-id="${r.id}" ${r.enabled ? "checked" : ""}><span aria-hidden="true"></span><span class="sr-only">${esc(t("enabled"))}</span></label>
      </li>`;
    }).join("")}</ul>` : `<p class="empty">${esc(t("noReminders"))}</p>`;
    body += `<div class="actions"><button class="btn" data-action="add-reminder">${icon("plus")}${esc(t("addReminder"))}</button></div>`;
  } else {
    body = `
      <div class="stopwatch">
        <p class="stopwatch__time" data-sw-time>${fmtSw(swNow())}</p>
        <div class="actions">
          <button class="btn" data-action="sw-toggle">${icon(sw.running ? "pause" : "play")}${esc(sw.running ? t("stop") : t("start"))}</button>
          <button class="btn btn--ghost" data-action="${sw.running ? "sw-lap" : "sw-reset"}">${icon(sw.running ? "flag" : "close")}${esc(sw.running ? t("lap") : t("reset"))}</button>
        </div>
        <ol class="laps">${sw.laps.map((l, i) => `<li><span>${esc(t("lapN"))} ${sw.laps.length - i}</span><span>${fmtSw(l)}</span></li>`).join("")}</ol>
      </div>`;
  }

  root.innerHTML = `
    <div class="segmented" role="tablist">${tabs}</div>
    ${tab !== "stopwatch" ? banner : ""}
    ${body}`;
  if (tab === "stopwatch" && sw.running) tickStopwatch(root);
}

function zonedYmd(date, tz) { const z = zoned(date, tz); return { year: z.year, month: z.month, day: z.day }; }

function tickStopwatch(root) {
  cancelAnimationFrame(sw.raf);
  const el = root.querySelector("[data-sw-time]");
  const step = () => {
    if (!sw.running || !el.isConnected) return;
    el.textContent = fmtSw(swNow());
    sw.raf = requestAnimationFrame(step);
  };
  sw.raf = requestAnimationFrame(step);
}

// ----- Editors (bottom sheets) -----
function alarmForm(a) {
  const isClock = a.anchor === "clock";
  const days = term("weekdayShort").map((d, i) =>
    `<label class="daychip"><input type="checkbox" name="days" value="${i}" ${(a.days || []).includes(i) ? "checked" : ""}><span>${esc(d)}</span></label>`).join("");
  return `
    <form class="form" data-form="alarm">
      <label class="field"><span>${esc(t("label"))}</span><input name="label" type="text" value="${esc(a.label || "")}"></label>
      <label class="field"><span>${esc(t("alarmAt"))}</span>
        <select name="anchor">${ANCHORS.map((k) => `<option value="${k}" ${a.anchor === k ? "selected" : ""}>${esc(t(ANCHOR_LABEL[k]))}</option>`).join("")}</select></label>
      <label class="field" data-show="clock" ${isClock ? "" : "hidden"}><span>${esc(t("time"))}</span>
        <input name="time" type="time" value="${pad2(a.hour ?? 5)}:${pad2(a.minute ?? 0)}"></label>
      <label class="field" data-show="vedic" ${isClock ? "hidden" : ""}><span>${esc(t("minutesBefore"))}</span>
        <input name="offset" type="number" inputmode="numeric" min="0" max="240" value="${a.offset || 0}"></label>
      <label class="field"><span>${esc(t("repeat"))}</span>
        <select name="repeat">
          <option value="once" ${a.repeat === "once" ? "selected" : ""}>${esc(t("repeatOnce"))}</option>
          <option value="daily" ${a.repeat === "daily" ? "selected" : ""}>${esc(t("repeatDaily"))}</option>
          <option value="custom" ${a.repeat === "custom" ? "selected" : ""}>${esc(t("repeatCustom"))}</option>
        </select></label>
      <fieldset class="days" data-show="custom" ${a.repeat === "custom" ? "" : "hidden"}><legend class="sr-only">${esc(t("repeatCustom"))}</legend>${days}</fieldset>
      <label class="check"><input type="checkbox" name="vibrate" ${a.vibrate !== false ? "checked" : ""}><span>${esc(t("vibrate"))}</span></label>
      <div class="actions">
        ${a.id ? `<button type="button" class="btn btn--danger" data-action="delete-alarm" data-id="${a.id}">${icon("trash")}${esc(t("delete"))}</button>` : ""}
        <button type="submit" class="btn">${esc(t("save"))}</button>
      </div>
    </form>`;
}

function reminderForm(r) {
  const groups = { festival: [], vratham: [], tharpanam: [] };
  const seen = new Set();
  for (const rule of RULES) {
    if (seen.has(rule.id)) continue;
    seen.add(rule.id);
    groups[rule.kind].push(rule.id);
  }
  const opts = Object.entries(groups).map(([k, ids]) => `
    <optgroup label="${esc(t(k === "festival" ? "legendFestival" : k === "vratham" ? "legendVratham" : "legendTharpanam"))}">
      ${ids.map((id) => `<option value="${id}" ${r.observance === id ? "selected" : ""}>${esc(festivalName(id))}</option>`).join("")}
    </optgroup>`).join("");
  return `
    <form class="form" data-form="reminder">
      <label class="field"><span>${esc(t("observance"))}</span><select name="observance">${opts}</select></label>
      <label class="field"><span>${esc(t("remindWhen"))}</span>
        <select name="when">
          <option value="sameDay" ${r.when !== "dayBefore" ? "selected" : ""}>${esc(t("sameDay"))}</option>
          <option value="dayBefore" ${r.when === "dayBefore" ? "selected" : ""}>${esc(t("dayBefore"))}</option>
        </select></label>
      <label class="field"><span>${esc(t("time"))}</span><input name="time" type="time" value="${pad2(r.hour ?? 6)}:${pad2(r.minute ?? 0)}"></label>
      <label class="field"><span>${esc(t("repeat"))}</span>
        <select name="repeat">
          <option value="every" ${r.repeat !== "once" ? "selected" : ""}>${esc(t("everyOccurrence"))}</option>
          <option value="once" ${r.repeat === "once" ? "selected" : ""}>${esc(t("onceOnly"))}</option>
        </select></label>
      <div class="actions">
        ${r.id ? `<button type="button" class="btn btn--danger" data-action="delete-reminder" data-id="${r.id}">${icon("trash")}${esc(t("delete"))}</button>` : ""}
        <button type="submit" class="btn">${esc(t("save"))}</button>
      </div>
    </form>`;
}

export function openAlarmEditor(app, id) {
  const existing = getAlarms().find((a) => a.id === id);
  const a = existing || { anchor: "clock", hour: 5, minute: 0, repeat: "daily", days: [], vibrate: true, enabled: true, offset: 0 };
  app.openSheet(existing ? t("edit") : t("addAlarm"), alarmForm(a), (sheet) => {
    const form = sheet.querySelector("form");
    const sync = () => {
      const anchor = form.anchor.value;
      form.querySelector('[data-show="clock"]').hidden = anchor !== "clock";
      form.querySelector('[data-show="vedic"]').hidden = anchor === "clock";
      form.querySelector('[data-show="custom"]').hidden = form.repeat.value !== "custom";
    };
    form.addEventListener("change", sync);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const [hh, mm] = (form.time.value || "05:00").split(":").map(Number);
      const next = {
        ...a, id: a.id || newId(), label: form.label.value.trim(), anchor: form.anchor.value,
        hour: hh, minute: mm, offset: Math.max(0, Math.min(240, Number(form.offset.value) || 0)),
        repeat: form.repeat.value, days: [...form.querySelectorAll('input[name="days"]:checked')].map((x) => Number(x.value)),
        vibrate: form.vibrate.checked, enabled: true
      };
      if (next.repeat === "custom" && !next.days.length) next.repeat = "daily";
      if (next.anchor === "clock" && next.repeat === "once") {
        const loc = app.state.loc;
        const today = todayYmd(loc.tz);
        let t0 = +fromZoned(today.year, today.month, today.day, hh, mm, 0, loc.tz);
        if (t0 <= Date.now()) t0 += 86400000;
        next.onceTime = t0;
      }
      const list = getAlarms().filter((x) => x.id !== next.id);
      list.push(next);
      saveAlarms(list);
      requestNotificationPermission();
      refreshSchedule(app.state.loc);
      app.closeSheet();
      app.render();
    });
  });
}

export function openReminderEditor(app, id) {
  const existing = getReminders().find((r) => r.id === id);
  const r = existing || { observance: "pradosham_shukla", when: "sameDay", hour: 6, minute: 0, repeat: "every", enabled: true };
  app.openSheet(existing ? t("edit") : t("addReminder"), reminderForm(r), (sheet) => {
    const form = sheet.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const [hh, mm] = (form.time.value || "06:00").split(":").map(Number);
      const next = { ...r, id: r.id || newId(), observance: form.observance.value, when: form.when.value,
        hour: hh, minute: mm, repeat: form.repeat.value, enabled: true };
      const list = getReminders().filter((x) => x.id !== next.id);
      list.push(next);
      saveReminders(list);
      requestNotificationPermission();
      refreshSchedule(app.state.loc);
      app.closeSheet();
      app.render();
    });
  });
}

export function handleAlarmAction(app, action, el) {
  const id = Number(el.dataset.id);
  switch (action) {
    case "alarm-tab": app.state.alarmTab = el.dataset.tab; app.render(); return true;
    case "add-alarm": openAlarmEditor(app); return true;
    case "edit-alarm": openAlarmEditor(app, id); return true;
    case "add-reminder": openReminderEditor(app); return true;
    case "edit-reminder": openReminderEditor(app, id); return true;
    case "exact-settings": openExactAlarmSettings(); return true;
    case "delete-alarm":
      saveAlarms(getAlarms().filter((a) => a.id !== id));
      refreshSchedule(app.state.loc); app.closeSheet(); app.render(); return true;
    case "delete-reminder":
      saveReminders(getReminders().filter((r) => r.id !== id));
      refreshSchedule(app.state.loc); app.closeSheet(); app.render(); return true;
    case "sw-toggle":
      if (sw.running) { sw.elapsed = swNow(); sw.running = false; }
      else { sw.start = performance.now(); sw.running = true; }
      app.render(); return true;
    case "sw-lap": sw.laps.unshift(swNow()); app.render(); return true;
    case "sw-reset": sw.elapsed = 0; sw.laps = []; app.render(); return true;
    default: return false;
  }
}

export function handleAlarmToggle(app, el) {
  const id = Number(el.dataset.id);
  if (el.dataset.action === "toggle-alarm") {
    const list = getAlarms().map((a) => (a.id === id ? { ...a, enabled: el.checked } : a));
    const a = list.find((x) => x.id === id);
    if (a && el.checked && a.anchor === "clock" && a.repeat === "once" && (!a.onceTime || a.onceTime <= Date.now())) {
      const loc = app.state.loc;
      const today = todayYmd(loc.tz);
      let t0 = +fromZoned(today.year, today.month, today.day, a.hour, a.minute, 0, loc.tz);
      if (t0 <= Date.now()) t0 += 86400000;
      a.onceTime = t0;
    }
    saveAlarms(list);
  } else {
    saveReminders(getReminders().map((r) => (r.id === id ? { ...r, enabled: el.checked } : r)));
  }
  refreshSchedule(app.state.loc);
  app.render();
}
