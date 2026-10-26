// App shell. Layout follows a classic Tamil panchangam app: a top bar with the
// calendar button and a ⋮ menu, a strip of tabs (Panchangam, Sankalpam,
// Reminders, Alarm, Stopwatch, Jathagam), and sub-pages (month calendar,
// Raasi chart, settings) that open with a back arrow.

import { configureAstro } from "./astro.js";
import { clearPanchangCache } from "./panchang.js";
import { clearFestivalCache } from "./festivals.js";
import { setLanguage, t, brand, clearTermCache, lang } from "./i18n/index.js";
import { getSettings, updateSettings, currentLocation } from "./store.js";
import { esc, todayYmd, parseYmd, ymdKey } from "./format.js";
import { icon } from "./icons.js";
import { isAndroid, takeLaunchAction, share, copyText, printPage, appInfo } from "./native.js";
import { refreshSchedule } from "./alarms.js";
import { checkForUpdate } from "./update.js";
import { renderToday, dayShareText, shiftDate } from "./views/today.js";
import { renderCalendar, monthShareText } from "./views/calendar.js";
import { renderSankalpam, bindSankalpamInputs, sankalpamText } from "./views/sankalpam.js";
import { renderAlarms, handleAlarmAction, handleAlarmToggle } from "./views/alarms.js";
import { renderSettings, bindSettings, openLocationSheet } from "./views/settings.js";
import { renderJathagam, bindJathagam, hideTip, resetJathagamCache } from "./views/jathagam.js";
import { renderVasthu, bindVasthu } from "./views/vasthu.js";
import { renderMuhurtham, bindMuhurtham } from "./views/muhurtham.js";
import { renderStars, bindStars } from "./views/stars.js";
import { renderRasi, bindRasi, rasiShareText, rasiState, openRasiDetails, openRasiDasha } from "./views/rasi.js";

const TABS = [
  ["today", "panchangam"], ["vasthu", "vasthu"], ["muhurtham", "muhurtham"], ["stars", "stars"], ["sankalpam", "sankalpam"], ["reminders", "reminders"],
  ["alarms", "alarms"], ["stopwatch", "stopwatch"], ["jathagam", "jathagam"]
];
const SUBPAGES = { calendar: null, rasi: "rasiChartMenu", settings: "settings" };
const ROUTES = [...TABS.map(([r]) => r), ...Object.keys(SUBPAGES)];

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
    closeMenu();
    const isTab = (r) => TABS.some(([x]) => x === r);
    // Tabs replace each other; sub-pages stack on top
    if (push && route !== this.state.route) {
      if (isTab(route) && isTab(this.state.route)) this.history = [];
      else this.history.push(this.state.route);
    }
    this.state.route = route;
    try { history.replaceState(null, "", `#${route}`); } catch (e) { /* file:// */ }
    this.renderShell();
    this.render();
    window.scrollTo(0, 0);
  },

  back() {
    if (this.history.length) { this.go(this.history.pop(), false); return true; }
    if (this.state.route !== "today") { this.go("today", false); return true; }
    return false;
  },

  render() {
    const route = this.state.route;
    for (const r of ROUTES) this.views[r].hidden = r !== route;
    document.querySelector("[data-fabs]").hidden = route !== "today";
    const root = this.views[route];
    try {
      if (route === "today") renderToday(root, this);
      else if (route === "calendar") renderCalendar(root, this);
      else if (route === "sankalpam") renderSankalpam(root, this);
      else if (route === "reminders" || route === "alarms" || route === "stopwatch") renderAlarms(root, this, route);
      else if (route === "settings") renderSettings(root, this);
      else if (route === "jathagam") renderJathagam(root, this);
      else if (route === "rasi") renderRasi(root, this);
      else if (route === "vasthu") renderVasthu(root, this);
      else if (route === "muhurtham") renderMuhurtham(root, this);
      else if (route === "stars") renderStars(root, this);
    } catch (e) {
      root.innerHTML = `<p class="notice">${esc(String(e && e.message || e))}</p>`;
      console.error(e);
    }
  },

  renderShell() {
    const route = this.state.route;
    const sub = route in SUBPAGES;
    document.title = brand();
    document.documentElement.lang = lang();
    const title = sub && SUBPAGES[route] ? t(SUBPAGES[route]) : brand();
    document.querySelector(".appbar__title").textContent = title;
    const back = document.querySelector('[data-action="nav-back"]');
    back.hidden = !sub;
    back.innerHTML = icon("back");
    back.setAttribute("aria-label", t("back"));
    document.querySelector(".appbar__logo").hidden = sub;
    const cal = document.querySelector('[data-action="open-calendar"]');
    cal.innerHTML = icon(route === "calendar" ? "today" : "calendar");
    cal.setAttribute("aria-label", route === "calendar" ? t("panchangam") : t("calendar"));
    cal.hidden = route === "rasi" || route === "settings";
    const more = document.querySelector('[data-action="open-menu"]');
    more.innerHTML = icon("more");
    more.setAttribute("aria-label", t("menu"));
    more.hidden = route === "settings";
    const tabs = document.querySelector(".toptabs");
    tabs.hidden = sub;
    tabs.innerHTML = TABS.map(([r, label]) =>
      `<button data-route="${r}" class="${route === r ? "is-on" : ""}" ${route === r ? 'aria-current="page"' : ""}>${esc(t(label))}</button>`).join("");
    const on = tabs.querySelector(".is-on");
    if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
    const fabs = document.querySelectorAll("[data-fabs] .fab");
    fabs[0].innerHTML = icon("dblLeft"); fabs[0].setAttribute("aria-label", t("prevDay"));
    fabs[1].innerHTML = icon("dblRight"); fabs[1].setAttribute("aria-label", t("nextDay"));
  },

  // ----- Bottom sheet -----
  openSheet(title, html, onMount) {
    closeMenu();
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
  if (meta) meta.content = dark ? "#310e4d" : "#591771";
}

// ----- ⋮ menu -----
function menuItems() {
  const route = app.state.route;
  if (route === "rasi") {
    return [
      ["rasi-toggle-navamsa", rasiState.navamsa ? t("rasiCenter") : t("navamsa")],
      ["menu-share", t("share")], ["menu-pdf", t("print")]
    ];
  }
  return [
    ["menu-rasi", t("rasiChartMenu")], ["menu-share", t("share")], ["menu-pdf", t("print")],
    ["open-settings", t("settings")], ["menu-about", t("about")]
  ];
}

function openMenu() {
  const m = document.getElementById("menu");
  m.innerHTML = `<div class="menu__backdrop" data-action="close-menu"></div>
    <div class="menu__panel" role="menu">${menuItems().map(([a, label]) =>
      `<button role="menuitem" data-action="${a}">${esc(label)}</button>`).join("")}</div>`;
  m.hidden = false;
  m.querySelector("[role=menuitem]")?.focus({ preventScroll: true });
}
function closeMenu() {
  const m = document.getElementById("menu");
  if (!m || m.hidden) return false;
  m.hidden = true; m.innerHTML = "";
  return true;
}

function shareCurrent() {
  const r = app.state.route;
  if (r === "calendar") share(t("calendar"), monthShareText(app));
  else if (r === "sankalpam") share(t("sankalpam"), sankalpamText(app).text);
  else if (r === "rasi") share(t("rasiChartMenu"), rasiShareText(app));
  else share(t("shareTitle"), dayShareText(app));
}

function printCurrent() {
  const r = app.state.route;
  const cls = `printing-${r}`;
  document.body.classList.add(cls);
  const title = r === "calendar" ? `${brand()} ${app.state.calMonth.year}-${app.state.calMonth.month}` : `${brand()} ${ymdKey(app.state.date)}`;
  printPage(title);
  setTimeout(() => document.body.classList.remove(cls), 1500);
}

function openAbout() {
  const info = appInfo();
  app.openSheet(t("about"), `
    <div class="about">
      <span class="appbar__logo appbar__logo--big" aria-hidden="true">${document.querySelector(".appbar__logo").innerHTML}</span>
      <p class="about__name">${esc(brand())}</p>
      <p class="muted small">${esc(t("version"))} ${esc((info && info.version) || "1.0")}</p>
      <p>${esc(t("aboutText"))}</p>
      <p class="muted small">${esc(t("vakyamNote"))}</p>
      <button class="btn btn--small btn--ghost" data-action="check-update">${esc(t("checkUpdates"))}</button>
    </div>`);
}

// ----- Global event delegation -----
function onClick(e) {
  const tab = e.target.closest(".toptabs button[data-route]");
  if (tab) { app.go(tab.dataset.route); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (handleAlarmAction(app, action, el)) return;
  switch (action) {
    case "nav-back": app.back(); break;
    case "open-menu": openMenu(); break;
    case "close-menu": closeMenu(); break;
    case "open-calendar":
      if (app.state.route === "calendar") app.go("today");
      else { app.state.calMonth = { year: app.state.date.year, month: app.state.date.month }; app.go("calendar"); }
      break;
    case "menu-rasi": app.go("rasi"); break;
    case "menu-share": closeMenu(); shareCurrent(); break;
    case "menu-pdf": closeMenu(); printCurrent(); break;
    case "menu-about": closeMenu(); openAbout(); break;
    case "check-update": app.closeSheet(); checkForUpdate(app, true); break;
    case "rasi-toggle-navamsa": closeMenu(); rasiState.navamsa = !rasiState.navamsa; app.render(); break;
    case "rasi-details": openRasiDetails(app); break;
    case "rasi-dasha": openRasiDasha(app); break;
    case "set-location": openLocationSheet(app); break;
    case "open-settings": app.go("settings"); break;
    case "close-sheet": app.closeSheet(); break;
    case "prev-day": shiftDate(app, -1); break;
    case "next-day": shiftDate(app, 1); break;
    case "go-today": app.setDate(todayYmd(app.state.loc.tz)); break;
    case "pick-date": openPicker("datepicker", ymdKey(app.state.date)); break;
    case "pick-month": openPicker("monthpicker", `${app.state.calMonth.year}-${String(app.state.calMonth.month).padStart(2, "0")}`); break;
    case "open-day": app.state.date = parseYmd(el.dataset.ymd); app.history = []; app.go("today", false); break;
    case "prev-month": moveMonth(-1); break;
    case "next-month": moveMonth(1); break;
    case "prev-year": moveMonth(-12); break;
    case "next-year": moveMonth(12); break;
    case "cal-today": { const d = todayYmd(app.state.loc.tz); app.state.calMonth = { year: d.year, month: d.month }; app.render(); break; }
    case "share-day": share(t("shareTitle"), dayShareText(app)); break;
    case "share-month": share(t("calendar"), monthShareText(app)); break;
    case "print-month": printCurrent(); break;
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
  const idx = year * 12 + (month - 1) + n;
  year = Math.floor(idx / 12);
  month = (idx % 12) + 1;
  app.state.calMonth = { year, month };
  app.render();
}

function openPicker(id, value) {
  const input = document.getElementById(id);
  input.value = value;
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

// Android back button: close the menu / a sheet / a tooltip, then step back between screens
window.aarushBack = () => {
  if (closeMenu()) return true;
  if (app.closeSheet()) return true;
  if (app.state.route === "jathagam" && hideTip(app.views.jathagam)) return true;
  return app.back();
};
window.aarushOpen = (what) => {
  if (what === "alarms") app.go("alarms");
  else if (what === "today") { app.state.date = todayYmd(app.state.loc.tz); app.go("today"); }
};
window.aarushResume = () => {
  const today = todayYmd(app.state.loc.tz);
  if (app._lastToday && ymdKey(app._lastToday) !== ymdKey(today) && ymdKey(app.state.date) === ymdKey(app._lastToday)) {
    app.setDate(today);
  }
  app._lastToday = today;
  refreshSchedule(app.state.loc);
  checkForUpdate(app);
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
  bindRasi(app.views.rasi, app);
  bindVasthu(app.views.vasthu, app);
  bindMuhurtham(app.views.muhurtham, app);
  bindStars(app.views.stars, app);
  bindSwipe();
  document.getElementById("datepicker").addEventListener("change", (e) => {
    const d = parseYmd(e.target.value);
    if (d) app.setDate(d);
  });
  document.getElementById("monthpicker").addEventListener("change", (e) => {
    const m = /^(\d{4})-(\d{2})$/.exec(e.target.value);
    if (m) { app.state.calMonth = { year: Number(m[1]), month: Number(m[2]) }; app.render(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeMenu() || app.closeSheet(); }
  });

  app.renderShell();
  app.render();
  refreshSchedule(app.state.loc);
  setTimeout(() => checkForUpdate(app), 2500);

  if (!isAndroid && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
}

start();
window.__aarush = app;
