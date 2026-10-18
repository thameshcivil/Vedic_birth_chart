// App shell: routing between the five screens, shared state (date, location),
// bottom sheets, Android back button, swipe between days, settings changes.

import { configureAstro } from "./astro.js";
import { clearPanchangCache } from "./panchang.js";
import { clearFestivalCache } from "./festivals.js";
import { setLanguage, t, brand, clearTermCache, lang } from "./i18n/index.js";
import { getSettings, updateSettings, currentLocation } from "./store.js";
import { esc, todayYmd, parseYmd, ymdKey } from "./format.js";
import { icon } from "./icons.js";
import { isAndroid, takeLaunchAction, share, copyText, printPage } from "./native.js";
import { refreshSchedule } from "./alarms.js";
import { renderToday, dayShareText, shiftDate } from "./views/today.js";
import { renderCalendar, monthShareText } from "./views/calendar.js";
import { renderSankalpam, bindSankalpamInputs, sankalpamText } from "./views/sankalpam.js";
import { renderAlarms, handleAlarmAction, handleAlarmToggle } from "./views/alarms.js";
import { renderSettings, bindSettings, openLocationSheet } from "./views/settings.js";
import { renderJathagam, bindJathagam, hideTip, resetJathagamCache } from "./views/jathagam.js";

const ROUTES = ["today", "calendar", "jathagam", "sankalpam", "alarms", "settings"];
const NAV = [
  ["today", "navToday", "today"], ["calendar", "navCalendar", "calendar"], ["jathagam", "navJathagam", "chart"],
  ["sankalpam", "navSankalpam", "lamp"], ["alarms", "navAlarms", "bell"]
];

const app = {
  state: { route: "today", date: null, calMonth: null, loc: null, alarmTab: "alarms", sankalpamOccasion: null },
  history: [],
  views: {},

  langCode() { return lang(); },

  setDate(ymd) {
    this.state.date = ymd;
    this.state.calMonth = { year: ymd.year, month: ymd.month };
    this.render();
  },

  setLocation(loc) {
    updateSettings({ location: loc });
    this.state.loc = currentLocation();
    clearPanchangCache();
    clearFestivalCache();
    refreshSchedule(this.state.loc);
    this.renderShell();
    this.render();
  },

  applySettings(patch) {
    if (patch.calendar === "vakyam") return;
    updateSettings(patch);
    const s = getSettings();
    if ("ayanamsa" in patch || "node" in patch) {
      configureAstro({ ayanamsa: s.ayanamsa, node: s.node });
      clearPanchangCache();
      clearFestivalCache();
      resetJathagamCache();
    }
    if ("lang" in patch) { setLanguage(s.lang); clearTermCache(); refreshSchedule(this.state.loc); }
    if ("theme" in patch) applyTheme();
    this.renderShell();
    this.render();
  },

  go(route, push = true) {
    if (!ROUTES.includes(route)) route = "today";
    if (push && route !== this.state.route) this.history.push(this.state.route);
    this.state.route = route;
    try { history.replaceState(null, "", `#${route}`); } catch (e) { /* file:// */ }
    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    const route = this.state.route;
    for (const r of ROUTES) this.views[r].hidden = r !== route;
    document.querySelectorAll(".tabbar button").forEach((b) => {
      const on = b.dataset.route === route;
      b.classList.toggle("is-on", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    const root = this.views[route];
    try {
      if (route === "today") renderToday(root, this);
      else if (route === "calendar") renderCalendar(root, this);
      else if (route === "sankalpam") renderSankalpam(root, this);
      else if (route === "alarms") renderAlarms(root, this);
      else if (route === "settings") renderSettings(root, this);
      else if (route === "jathagam") renderJathagam(root, this);
    } catch (e) {
      root.innerHTML = `<p class="notice">${esc(String(e && e.message || e))}</p>`;
      console.error(e);
    }
  },

  renderShell() {
    const loc = this.state.loc;
    document.title = brand();
    document.querySelector(".appbar__brand").textContent = brand();
    const locBtn = document.querySelector('[data-action="set-location"].appbar__loc');
    locBtn.innerHTML = `${icon("pin")}<span>${esc(loc.name)}</span>`;
    locBtn.setAttribute("aria-label", `${t("location")}: ${loc.name}`);
    document.querySelector('[data-action="open-settings"]').setAttribute("aria-label", t("settings"));
    document.querySelector(".tabbar").innerHTML = NAV.map(([route, label, ic]) =>
      `<button data-route="${route}" class="${this.state.route === route ? "is-on" : ""}">${icon(ic)}<span>${esc(t(label))}</span></button>`).join("");
  },

  // ----- Bottom sheet -----
  openSheet(title, html, onMount) {
    const root = document.getElementById("sheet");
    root.innerHTML = `
      <div class="sheet__backdrop" data-action="close-sheet"></div>
      <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="sheet__head"><h2>${esc(title)}</h2>
          <button class="iconbtn" data-action="close-sheet" aria-label="${esc(t("close"))}">${icon("close")}</button></div>
        <div class="sheet__body">${html}</div>
      </div>`;
    root.hidden = false;
    document.body.classList.add("has-sheet");
    if (onMount) onMount(root.querySelector(".sheet__body"));
    const first = root.querySelector("input, select, button:not([data-action='close-sheet'])");
    if (first) first.focus({ preventScroll: true });
  },

  closeSheet() {
    const root = document.getElementById("sheet");
    if (root.hidden) return false;
    root.hidden = true;
    root.innerHTML = "";
    document.body.classList.remove("has-sheet");
    return true;
  },

  toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(this._toast);
    this._toast = setTimeout(() => { el.hidden = true; }, 2200);
  }
};

function applyTheme() {
  const theme = getSettings().theme;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#1d1611" : "#f6efe3";
}

// ----- Global event delegation -----
function onClick(e) {
  const nav = e.target.closest(".tabbar button[data-route]");
  if (nav) { app.go(nav.dataset.route); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (handleAlarmAction(app, action, el)) return;
  switch (action) {
    case "set-location": openLocationSheet(app); break;
    case "open-settings": app.go("settings"); break;
    case "close-sheet": app.closeSheet(); break;
    case "prev-day": shiftDate(app, -1); break;
    case "next-day": shiftDate(app, 1); break;
    case "go-today": app.setDate(todayYmd(app.state.loc.tz)); break;
    case "pick-date": openDatePicker(); break;
    case "open-day": app.state.date = parseYmd(el.dataset.ymd); app.go("today"); break;
    case "prev-month": moveMonth(-1); break;
    case "next-month": moveMonth(1); break;
    case "cal-today": { const d = todayYmd(app.state.loc.tz); app.state.calMonth = { year: d.year, month: d.month }; app.render(); break; }
    case "share-day": share(t("shareTitle"), dayShareText(app)); break;
    case "share-month": share(t("calendar"), monthShareText(app)); break;
    case "print-month": document.body.classList.add("printing-calendar"); printPage(`${brand()} ${app.state.calMonth.year}-${app.state.calMonth.month}`);
      setTimeout(() => document.body.classList.remove("printing-calendar"), 1500); break;
    case "share-sankalpam": share(t("sankalpam"), sankalpamText(app).text); break;
    case "copy-sankalpam": copyText(sankalpamText(app).text).then((ok) => ok && app.toast(t("copied"))); break;
    default: break;
  }
}

function onChange(e) {
  const el = e.target;
  if (el.matches('[data-action="toggle-alarm"], [data-action="toggle-reminder"]')) { handleAlarmToggle(app, el); return; }
  if (el.matches('[data-action="pick-year"]')) { app.state.calMonth = { ...app.state.calMonth, year: Number(el.value) }; app.render(); }
}

function moveMonth(n) {
  let { year, month } = app.state.calMonth;
  month += n;
  if (month < 1) { month = 12; year--; }
  if (month > 12) { month = 1; year++; }
  app.state.calMonth = { year, month };
  app.render();
}

function openDatePicker() {
  const input = document.getElementById("datepicker");
  input.value = ymdKey(app.state.date);
  if (input.showPicker) { try { input.showPicker(); return; } catch (e) { /* fall through */ } }
  input.click();
}

// Horizontal swipe on the day / month view moves by one
function bindSwipe() {
  let x0 = null, y0 = null, target = null;
  document.addEventListener("touchstart", (e) => {
    target = e.target.closest("[data-swipe]");
    if (!target || e.touches.length !== 1) { target = null; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!target) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) {
      if (target.dataset.swipe === "day") shiftDate(app, dx < 0 ? 1 : -1);
      else moveMonth(dx < 0 ? 1 : -1);
    }
    target = null;
  }, { passive: true });
}

// Android back button: close a sheet / tooltip, then step back between screens
window.aarushBack = () => {
  if (app.closeSheet()) return true;
  if (app.state.route === "jathagam" && hideTip(app.views.jathagam)) return true;
  if (app.history.length) { app.go(app.history.pop(), false); return true; }
  if (app.state.route !== "today") { app.go("today", false); return true; }
  return false;
};
window.aarushOpen = (what) => {
  if (what === "alarms") app.go("alarms");
  else if (what === "today") { app.state.date = todayYmd(app.state.loc.tz); app.go("today"); }
};
window.aarushResume = () => {
  // Coming back to the app later: move "today" forward if the date changed, refresh alarms
  const today = todayYmd(app.state.loc.tz);
  if (app._lastToday && ymdKey(app._lastToday) !== ymdKey(today) && ymdKey(app.state.date) === ymdKey(app._lastToday)) {
    app.setDate(today);
  }
  app._lastToday = today;
  refreshSchedule(app.state.loc);
};

function start() {
  const s = getSettings();
  setLanguage(s.lang);
  configureAstro({ ayanamsa: s.ayanamsa, node: s.node });
  applyTheme();
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);
  }

  app.state.loc = currentLocation();
  const today = todayYmd(app.state.loc.tz);
  app._lastToday = today;
  app.state.date = today;
  app.state.calMonth = { year: today.year, month: today.month };
  for (const r of ROUTES) app.views[r] = document.querySelector(`[data-view="${r}"]`);

  const hash = (location.hash || "").slice(1);
  if (ROUTES.includes(hash)) app.state.route = hash;
  const launch = takeLaunchAction();
  if (launch === "alarms") app.state.route = "alarms";

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  bindSankalpamInputs(app.views.sankalpam, app);
  bindSettings(app.views.settings, app);
  bindJathagam(app.views.jathagam, app);
  bindSwipe();
  document.getElementById("datepicker").addEventListener("change", (e) => {
    const d = parseYmd(e.target.value);
    if (d) app.setDate(d);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") app.closeSheet();
  });

  app.renderShell();
  app.render();
  refreshSchedule(app.state.loc);

  // Web only: offline support through the service worker
  if (!isAndroid && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
}

start();
window.__aarush = app;
