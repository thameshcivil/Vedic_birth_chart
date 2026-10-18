// Settings screen and the location picker sheet.

import { t, LANGUAGES, LANGUAGE_ORDER, brand } from "../i18n/index.js";
import { esc } from "../format.js";
import { getSettings, updateSettings, currentLocation, deviceTimeZone } from "../store.js";
import { appInfo } from "../native.js";
import { icon } from "../icons.js";

const OPTIONS = {
  lang: () => LANGUAGE_ORDER.map((c) => [c, LANGUAGES[c].name]),
  calendar: () => [["tamil", t("typeTamil")], ["telugu", t("typeTelugu")], ["kannada", t("typeKannada")], ["vakyam", t("typeVakyam"), true]],
  lunar: () => [["amanta", t("amanta")], ["purnimanta", t("purnimanta")]],
  ayanamsa: () => [["lahiri", t("ayLahiri")], ["truechitra", t("ayTrueChitra")], ["kp", t("ayKp")], ["raman", t("ayRaman")], ["suryasiddhanta", t("aySurya")]],
  node: () => [["mean", t("nodeMean")], ["true", t("nodeTrue")]],
  timeFormat: () => [["12h", t("time12")], ["24h", t("time24")], ["nazhigai", t("timeNazhigai")]],
  theme: () => [["system", t("themeSystem")], ["light", t("themeLight")], ["dark", t("themeDark")]]
};
const LABEL = {
  lang: "language", calendar: "panchangamType", lunar: "lunarSystem", ayanamsa: "ayanamsa",
  node: "nodeType", timeFormat: "timeFormat", theme: "theme"
};

export function renderSettings(root) {
  const s = getSettings();
  const loc = currentLocation();
  const info = appInfo();
  const rows = Object.keys(OPTIONS).map((key) => `
    <label class="field">
      <span>${esc(t(LABEL[key]))}</span>
      <select data-setting="${key}">
        ${OPTIONS[key]().map(([v, label, disabled]) =>
          `<option value="${v}" ${s[key] === v ? "selected" : ""} ${disabled ? "disabled" : ""}>${esc(label)}</option>`).join("")}
      </select>
    </label>`).join("");

  root.innerHTML = `
    <h2 class="screen-title">${esc(t("settings"))}</h2>
    <section class="tile">
      <h3 class="tile__title">${icon("pin")}${esc(t("location"))}</h3>
      <p class="loc-line"><strong>${esc(loc.name)}</strong></p>
      <p class="muted small">${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)} · ${esc(loc.tz)}</p>
      <div class="actions actions--left"><button class="btn btn--small" data-action="set-location">${esc(t("changeLocation"))}</button></div>
    </section>
    <section class="tile form">${rows}
      <p class="muted small">${esc(t("vakyamNote"))}</p>
    </section>
    <section class="tile">
      <h3 class="tile__title">${esc(t("about"))}</h3>
      <p><strong>${esc(brand())}</strong></p>
      <p class="small">${esc(t("aboutText"))}</p>
      <p class="muted small">${esc(t("version"))} ${esc(info.version || "web")}</p>
    </section>`;
}

export function bindSettings(root, app) {
  root.addEventListener("change", (e) => {
    const el = e.target.closest("[data-setting]");
    if (!el) return;
    app.applySettings({ [el.dataset.setting]: el.value });
  });
}

// ----------------------------------------------------------------------------
// Location sheet
// ----------------------------------------------------------------------------

// Primary time zone for single-zone countries; multi-zone countries use longitude below
const COUNTRY_TZ = {
  in: "Asia/Kolkata", lk: "Asia/Colombo", np: "Asia/Kathmandu", bd: "Asia/Dhaka", pk: "Asia/Karachi",
  sg: "Asia/Singapore", my: "Asia/Kuala_Lumpur", ae: "Asia/Dubai", om: "Asia/Muscat", qa: "Asia/Qatar",
  kw: "Asia/Kuwait", bh: "Asia/Bahrain", sa: "Asia/Riyadh", jp: "Asia/Tokyo", hk: "Asia/Hong_Kong",
  cn: "Asia/Shanghai", th: "Asia/Bangkok", mm: "Asia/Yangon", gb: "Europe/London", ie: "Europe/Dublin",
  de: "Europe/Berlin", fr: "Europe/Paris", nl: "Europe/Amsterdam", be: "Europe/Brussels", ch: "Europe/Zurich",
  it: "Europe/Rome", es: "Europe/Madrid", se: "Europe/Stockholm", no: "Europe/Oslo", dk: "Europe/Copenhagen",
  fi: "Europe/Helsinki", pl: "Europe/Warsaw", at: "Europe/Vienna", za: "Africa/Johannesburg", ke: "Africa/Nairobi",
  ng: "Africa/Lagos", mu: "Indian/Mauritius", fj: "Pacific/Fiji", nz: "Pacific/Auckland", tt: "America/Port_of_Spain",
  gy: "America/Guyana", sr: "America/Paramaribo"
};

export function guessTimeZone(countryCode, lat, lon) {
  const cc = (countryCode || "").toLowerCase();
  if (COUNTRY_TZ[cc]) return COUNTRY_TZ[cc];
  if (cc === "us") {
    if (lon < -150) return "Pacific/Honolulu";
    if (lon < -140 || lat > 55) return "America/Anchorage";
    if (lon < -115) return "America/Los_Angeles";
    if (lon < -102) return "America/Denver";
    if (lon < -86) return "America/Chicago";
    return "America/New_York";
  }
  if (cc === "ca") {
    if (lon < -120) return "America/Vancouver";
    if (lon < -102) return "America/Edmonton";
    if (lon < -90) return "America/Winnipeg";
    if (lon < -64) return "America/Toronto";
    return "America/Halifax";
  }
  if (cc === "au") {
    if (lon < 129) return "Australia/Perth";
    if (lon < 138) return lat > -26 ? "Australia/Darwin" : "Australia/Adelaide";
    return lat > -29 ? "Australia/Brisbane" : "Australia/Sydney";
  }
  return deviceTimeZone();
}

function zoneOptions(selected) {
  let zones = [];
  try { zones = Intl.supportedValuesOf("timeZone"); } catch (e) { zones = []; }
  if (!zones.includes(selected)) zones = [selected, ...zones];
  return zones.map((z) => `<option value="${esc(z)}" ${z === selected ? "selected" : ""}>${esc(z)}</option>`).join("");
}

export function openLocationSheet(app) {
  const loc = currentLocation();
  const html = `
    <div class="form">
      <button type="button" class="btn btn--wide" data-loc="gps">${icon("gps")}${esc(t("useGps"))}</button>
      <p class="status" data-loc-status role="status"></p>
      <form data-loc-form="search" class="searchrow">
        <label class="field"><span>${esc(t("searchPlace"))}</span>
          <input name="q" type="search" placeholder="${esc(t("searchPlaceholder"))}" autocomplete="off"></label>
        <button class="btn" type="submit">${icon("search")}<span class="sr-only">${esc(t("search"))}</span></button>
      </form>
      <ul class="results" data-loc-results></ul>
      <form data-loc-form="manual" class="manual">
        <label class="field"><span>${esc(t("placeName"))}</span><input name="name" type="text" value="${esc(loc.name)}"></label>
        <div class="grid2">
          <label class="field"><span>${esc(t("latitude"))}</span><input name="lat" type="number" step="0.0001" value="${loc.lat}"></label>
          <label class="field"><span>${esc(t("longitude"))}</span><input name="lon" type="number" step="0.0001" value="${loc.lon}"></label>
        </div>
        <label class="field"><span>${esc(t("timeZone"))}</span><select name="tz">${zoneOptions(loc.tz)}</select></label>
        <button class="btn btn--wide" type="submit">${esc(t("setLocation"))}</button>
      </form>
    </div>`;

  app.openSheet(t("location"), html, (sheet) => {
    const status = sheet.querySelector("[data-loc-status]");
    const manual = sheet.querySelector('[data-loc-form="manual"]');
    const fill = (name, lat, lon, tz) => {
      manual.name.value = name;
      manual.lat.value = Number(lat).toFixed(4);
      manual.lon.value = Number(lon).toFixed(4);
      if (![...manual.tz.options].some((o) => o.value === tz)) manual.tz.insertAdjacentHTML("afterbegin", `<option value="${esc(tz)}">${esc(tz)}</option>`);
      manual.tz.value = tz;
    };

    sheet.querySelector('[data-loc="gps"]').addEventListener("click", () => {
      if (!navigator.geolocation) { status.textContent = t("gpsFailed"); return; }
      status.textContent = t("locating");
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let name = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${lat}&lon=${lon}&accept-language=${app.langCode()}`);
          const j = await r.json();
          const a = j.address || {};
          name = a.city || a.town || a.village || a.county || a.state || name;
        } catch (e) { /* offline: keep coordinates as the name */ }
        app.setLocation({ name, lat, lon, tz: deviceTimeZone(), source: "gps" });
        app.closeSheet();
      }, (err) => {
        status.textContent = err.code === 1 ? t("gpsDenied") : t("gpsFailed");
      }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    });

    sheet.querySelector('[data-loc-form="search"]').addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim();
      const list = sheet.querySelector("[data-loc-results]");
      if (!q) return;
      status.textContent = t("searching");
      list.innerHTML = "";
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=${app.langCode()}&q=${encodeURIComponent(q)}`);
        const items = await r.json();
        status.textContent = items.length ? "" : t("noMatch");
        list.innerHTML = items.map((it, i) => `<li><button type="button" class="result" data-i="${i}">${esc(it.display_name)}</button></li>`).join("");
        list.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
          const it = items[Number(b.dataset.i)];
          const a = it.address || {};
          const name = a.city || a.town || a.village || a.county || it.display_name.split(",")[0];
          fill(name, it.lat, it.lon, guessTimeZone(a.country_code, Number(it.lat), Number(it.lon)));
          list.innerHTML = "";
          manual.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }));
      } catch (err) {
        status.textContent = t("searchFailed");
      }
    });

    manual.addEventListener("submit", (e) => {
      e.preventDefault();
      const lat = Number(manual.lat.value), lon = Number(manual.lon.value);
      if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) { status.textContent = t("errBadCoords"); return; }
      app.setLocation({ name: manual.name.value.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon, tz: manual.tz.value, source: "manual" });
      app.closeSheet();
    });
  });
}
