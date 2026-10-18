// Raasi chart (gochara) page: the sky at a chosen date and time for the current
// location, drawn as a South Indian square chart. Menu toggles Navamsa; links
// open the planet details and the Vimshottari dasa from that moment.

import { ascendantSidereal, zoned, fromZoned } from "../astro.js";
import { tithiAt } from "../panchang.js";
import { computeVimshottariDasha } from "../jathagam-data.js";
import { t, term } from "../i18n/index.js";
import { esc, pad2, fmtTime, fmtDate } from "../format.js";
import { icon } from "../icons.js";
import { CHART_LAYOUT, positionsAt, navamsaIndex, dms, dashaHtml, nakIndex, padaOf } from "./jathagam.js";

export const rasiState = { date: null, navamsa: false };

function snapshot(app) {
  const loc = app.state.loc;
  const when = rasiState.date || new Date();
  const positions = positionsAt(when);
  const asc = ascendantSidereal(when, loc.lat, loc.lon);
  const moon = positions.find((x) => x.key === "Moon");
  return { loc, when, positions, asc, moon, paksha: tithiAt(when) < 15 ? "shukla" : "krishna" };
}

function squareChart(positions, asc, navamsa) {
  const where = (lon) => (navamsa ? navamsaIndex(lon) : Math.floor(lon / 30));
  const ascR = where(asc);
  const by = {};
  for (const p of positions) (by[where(p.lon)] ||= []).push(`${esc(term("planetShort")[p.key])}${p.retro ? `<sup>${esc(t("retro"))}</sup>` : ""}`);
  let html = "";
  for (let r = 0; r < 12; r++) {
    const [row, col] = CHART_LAYOUT[r];
    const items = [...(r === ascR ? [`<span class="sq__lagna">${esc(t("lagnaShort"))}</span>`] : []), ...(by[r] || []).map((x) => `<span>${x}</span>`)];
    html += `<div class="sq__cell ${r === ascR ? "is-lagna" : ""}" style="grid-row:${row + 1};grid-column:${col + 1}" aria-label="${esc(term("rasi")[r])}">${items.join(" ")}</div>`;
  }
  html += `<div class="sq__center" style="grid-row:2/span 2;grid-column:2/span 2">${esc(navamsa ? t("navamsa") : t("rasiCenter"))}</div>`;
  return `<div class="sq" role="img" aria-label="${esc(navamsa ? t("navamsa") : t("rasiChartMenu"))}">${html}</div>`;
}

export function renderRasi(root, app) {
  const s = snapshot(app);
  const z = zoned(s.when, s.loc.tz);
  const latStr = `${Math.abs(s.loc.lat).toFixed(4)}°${s.loc.lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(s.loc.lon).toFixed(3)}°${s.loc.lon >= 0 ? "E" : "W"}`;
  root.innerHTML = `
    <button class="rasi__loc" data-action="set-location">
      <span>${esc(s.loc.name)}<br><span class="rasi__coords">(${latStr}, ${lonStr})</span></span>${icon("chevronDown")}
    </button>
    <p class="rasi__line">${esc(term("paksha")[s.paksha])}, ${esc(term("rasi")[s.moon.rasi])}, ${esc(term("nakshatra")[s.moon.nak])}, ${esc(t("padaN", { n: s.moon.pada }))}</p>
    <div class="rasi__when">
      <label class="rasi__pick"><span class="sr-only">${esc(t("pickDate"))}</span>
        <input type="date" data-rasi="date" value="${z.year}-${pad2(z.month)}-${pad2(z.day)}"></label>
      <label class="rasi__pick"><span class="sr-only">${esc(t("time"))}</span>
        <input type="time" data-rasi="time" value="${pad2(z.hour)}:${pad2(z.minute)}"></label>
      <button class="iconbtn" data-rasi-now aria-label="${esc(t("now"))}">${icon("refresh")}</button>
    </div>
    ${squareChart(s.positions, s.asc, rasiState.navamsa)}
    <div class="rasi__links">
      <button class="linkbtn" data-action="rasi-details">${esc(t("rasiDetails"))}${icon("external")}</button>
      <button class="linkbtn" data-action="rasi-dasha">${esc(t("dashaBhukti"))}${icon("external")}</button>
    </div>`;
}

export function bindRasi(root, app) {
  root.addEventListener("change", (e) => {
    if (!e.target.dataset.rasi) return;
    const d = root.querySelector('[data-rasi="date"]').value;
    const tm = root.querySelector('[data-rasi="time"]').value || "00:00";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (!m) return;
    const [hh, mm] = tm.split(":").map(Number);
    rasiState.date = fromZoned(Number(m[1]), Number(m[2]), Number(m[3]), hh, mm, 0, app.state.loc.tz);
    app.render();
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-rasi-now]")) { rasiState.date = null; app.render(); }
  });
}

export function openRasiDetails(app) {
  const s = snapshot(app);
  const rows = [{ key: "Lagna", lon: s.asc }, ...s.positions].map((p) => {
    const name = p.key === "Lagna" ? t("lagnaTag") : term("planets")[p.key];
    return `<tr><th scope="row">${esc(name)}${p.retro ? ` <sup>${esc(t("retro"))}</sup>` : ""}</th>
      <td>${esc(term("rasi")[Math.floor(p.lon / 30)])}</td><td class="mono">${esc(dms(p.lon % 30))}</td>
      <td>${esc(term("nakshatra")[nakIndex(p.lon)])}</td><td>${padaOf(p.lon)}</td><td>${esc(term("rasi")[navamsaIndex(p.lon)])}</td></tr>`;
  }).join("");
  app.openSheet(t("rasiDetails"), `
    <p class="muted small">${esc(fmtDate(zymd(s.when, s.loc.tz)))} · ${esc(fmtTime(s.when, s.loc.tz, { clock: true }))} · ${esc(s.loc.name)}</p>
    <div class="table-scroll"><table class="data"><thead><tr><th>${esc(t("thGraha"))}</th><th>${esc(t("thRasi"))}</th><th>${esc(t("thLon"))}</th>
      <th>${esc(t("thNak"))}</th><th>${esc(t("thPada"))}</th><th>${esc(t("navamsa"))}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

export function openRasiDasha(app) {
  const s = snapshot(app);
  const dasha = computeVimshottariDasha(s.moon.lon, s.when);
  app.openSheet(t("dashaBhukti"), `
    <p class="muted small">${esc(term("nakshatra")[s.moon.nak])} · ${esc(fmtDate(zymd(s.when, s.loc.tz)))} ${esc(fmtTime(s.when, s.loc.tz, { clock: true }))}</p>
    <p class="muted small">${esc(t("dashaHint"))}</p>${dashaHtml(dasha, s.loc.tz)}`);
}

function zymd(d, tz) { const z = zoned(d, tz); return { year: z.year, month: z.month, day: z.day }; }

export function rasiShareText(app) {
  const s = snapshot(app);
  const where = (lon) => (rasiState.navamsa ? navamsaIndex(lon) : Math.floor(lon / 30));
  const lines = [
    `${rasiState.navamsa ? t("navamsa") : t("rasiChartMenu")} · ${fmtDate(zymd(s.when, s.loc.tz))} ${fmtTime(s.when, s.loc.tz, { clock: true })} · ${s.loc.name}`,
    `${term("paksha")[s.paksha]}, ${term("rasi")[s.moon.rasi]}, ${term("nakshatra")[s.moon.nak]}, ${t("padaN", { n: s.moon.pada })}`,
    `${t("lagnaTag")}: ${term("rasi")[where(s.asc)]}`,
    ...s.positions.map((p) => `${term("planets")[p.key]}: ${term("rasi")[where(p.lon)]}${p.retro ? ` (${t("retrograde")})` : ""}`),
    "", "— Aarush Panchangam"
  ];
  return lines.join("\n");
}
