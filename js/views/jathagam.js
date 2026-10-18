// Jathagam: birth chart (Rasi, Navamsa, sky view), positions, KP lords, Sudarshana
// chakra, Vimshottari dasha and the horoscope summary — the original app's features.

import { allPositions, ascendantSidereal, siderealLongitude, ayanamsa, addDays, DAY_MS, norm360, sunMoon, toRad, zoned } from "../astro.js";
import { computePanchang, tithiAt, yogaAt, KARANA_KEYS } from "../panchang.js";
import {
  computeVimshottariDasha, NAKSHATRA_LORDS, RASI_LORDS, getDignity, getAspectedRasis, friendshipStatus,
  NAKSHATRA_GANAM, NAKSHATRA_YONI, NAKSHATRA_BIRD, NAKSHATRA_TREE, getKPLords
} from "../jathagam-data.js";
import { t, term, tithiName, karanaName, lang } from "../i18n/index.js";
import { esc, pad2, fmtTime, fmtDate } from "../format.js";
import { getBirth, saveBirth, getSettings } from "../store.js";
import { icon } from "../icons.js";

export const CHART_LAYOUT = {
  11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3], 10: [1, 0], 3: [1, 3],
  9: [2, 0], 4: [2, 3], 8: [3, 0], 7: [3, 1], 6: [3, 2], 5: [3, 3]
};
const TZ_OFFSETS = [-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4.5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5,
  4.85, 5, 5.5, 5.75, 5.8889, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14];
const PLANET_COLOR = {
  Sun: "--planet-sun", Moon: "--planet-moon", Mercury: "--planet-mercury", Venus: "--planet-venus", Mars: "--planet-mars",
  Jupiter: "--planet-jupiter", Saturn: "--planet-saturn", Rahu: "--planet-rahu", Ketu: "--planet-ketu"
};
const PLANET_R = { Sun: 10, Moon: 8.5, Mercury: 5, Venus: 8, Mars: 6, Jupiter: 9.5, Saturn: 8.5, Rahu: 6, Ketu: 6 };
const KALI_YUGA_EPOCH_JD = 588465.5;

const state = { result: null, editing: true, sky: { mode: "here", date: null }, tip: null };

export const nakIndex = (lon) => Math.floor(lon / (360 / 27));
export const padaOf = (lon) => Math.floor((lon % (360 / 27)) / (360 / 108)) + 1;
export const navamsaIndex = (lon) => (Math.floor(lon / 30) * 9 + Math.floor((lon % 30) / (30 / 9))) % 12;

export function dms(deg) {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = Math.round((mF - m) * 60);
  return `${d}° ${pad2(m)}′ ${pad2(s === 60 ? 59 : s)}″`;
}

function offsetZone(off) {
  const sign = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  const h = Math.floor(a);
  const m = Math.round((a - h) * 60);
  return `UTC${sign}${pad2(h)}:${pad2(m)}`;
}

export function positionsAt(date) {
  return allPositions(date).map((p) => ({
    ...p, rasi: Math.floor(p.lon / 30), nak: nakIndex(p.lon), pada: padaOf(p.lon)
  }));
}

// ----------------------------------------------------------------------------
// Computation
// ----------------------------------------------------------------------------
function compute(b) {
  let hour = b.hh % 12;
  if (b.ampm === "PM") hour += 12;
  const zone = offsetZone(b.tz);
  const birthUtc = new Date(Date.UTC(b.yyyy, b.mm - 1, b.dd, hour, b.min, b.ss) - b.tz * 3600000);
  const loc = { lat: b.lat, lon: b.lon, tz: zone };
  const civil = { year: b.yyyy, month: b.mm, day: b.dd };
  const positions = positionsAt(birthUtc);
  const asc = ascendantSidereal(birthUtc, b.lat, b.lon);
  let p = computePanchang(civil, loc);
  let vedic = p;
  let preSunrise = false;
  if (birthUtc < p.sunrise) {
    preSunrise = true;
    vedic = computePanchang(addDays(civil.year, civil.month, civil.day, -1), loc);
  }
  const moon = positions.find((x) => x.key === "Moon");
  const { sun: sunLon, moon: moonLon } = sunMoon(birthUtc);
  return {
    b, birthUtc, loc, civil, positions, asc, ascRasi: Math.floor(asc / 30), p, vedic, preSunrise,
    tithi: tithiAt(birthUtc), yoga: yogaAt(birthUtc), karana: KARANA_KEYS[Math.floor(norm360(moonLon - sunLon) / 6)],
    dasha: computeVimshottariDasha(moon.lon, birthUtc), ayanamsa: ayanamsa(birthUtc)
  };
}

// Sign entry / exit for the tap tooltip
function boundaryCrossing(fn, signStart, from, dir, stepDays, maxSteps) {
  const inside = (d) => norm360(fn(d) - signStart) < 30;
  let prev = from;
  for (let i = 1; i <= maxSteps; i++) {
    const cur = new Date(+from + dir * i * stepDays * DAY_MS);
    if (!inside(cur)) {
      let lo = dir < 0 ? cur : prev, hi = dir < 0 ? prev : cur;
      const loIn = inside(lo);
      for (let k = 0; k < 30; k++) {
        const mid = new Date((+lo + +hi) / 2);
        if (inside(mid) === loIn) lo = mid; else hi = mid;
      }
      return new Date((+lo + +hi) / 2);
    }
    prev = cur;
  }
  return null;
}
const SEARCH = { Sun: [1, 40], Moon: [0.1, 40], Mercury: [1, 100], Venus: [1, 200], Mars: [2, 200],
  Jupiter: [6, 220], Saturn: [12, 220], Rahu: [12, 220], Ketu: [12, 220] };

// ----------------------------------------------------------------------------
// Rendering helpers
// ----------------------------------------------------------------------------
function gridChart(positions, ascRasi, opts = {}) {
  const byRasi = {};
  for (const p of positions) (byRasi[opts.navamsa ? navamsaIndex(p.lon) : p.rasi] ||= []).push(p);
  const cells = [];
  for (let r = 0; r < 12; r++) {
    const [row, col] = CHART_LAYOUT[r];
    const tags = (byRasi[r] || []).map((p) =>
      `<button class="ptag" data-tip="${p.key}" data-ctx="${opts.ctx || ""}">${esc(term("planetShort")[p.key])}${p.retro ? `<sup>${esc(t("retro"))}</sup>` : ""}</button>`).join("");
    cells.push(`<div class="ccell ${r === ascRasi ? "is-lagna" : ""}" style="grid-row:${row + 1};grid-column:${col + 1}" data-rasi="${r}">
      <span class="ccell__name">${esc(term("rasi")[r])}</span><span class="ccell__tags">${tags}</span></div>`);
  }
  cells.push(`<div class="ccell ccell--center" style="grid-row:2/span 2;grid-column:2/span 2">
    <span>${esc(opts.title || t("lagnaTag"))}</span><strong>${esc(term("rasi")[ascRasi])}</strong></div>`);
  return `<div class="chartgrid" role="img" aria-label="${esc(opts.title || t("rasiChart"))}">${cells.join("")}</div>`;
}

function skyChart(positions, ascSid, ctx) {
  const size = 500, cx = 250, cy = 250, ringOuter = 188, ringInner = 148, base = 100;
  const at = (deg, r) => { const a = toRad(deg - 90); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  let rnd = 42;
  const rand = () => ((rnd = (rnd * 1103515245 + 12345) & 0x7fffffff) % 10000) / 10000;
  let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(t("cosmicView"))}">`;
  for (let i = 0; i < 110; i++) {
    svg += `<circle class="star" cx="${(rand() * size).toFixed(1)}" cy="${(rand() * size).toFixed(1)}" r="${(0.4 + rand() * 1.1).toFixed(2)}" style="animation-delay:${(rand() * 3).toFixed(2)}s"/>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${ringOuter}" class="ring"/><circle cx="${cx}" cy="${cy}" r="${ringInner}" class="ring ring--inner"/>`;
  for (let r = 0; r < 12; r++) {
    const [x1, y1] = at(r * 30, ringInner), [x2, y2] = at(r * 30, ringOuter);
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="ring"/>`;
    const [lx, ly] = at(r * 30 + 15, ringOuter + 16);
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="sky-label">${esc(term("rasi")[r])}</text>`;
  }
  for (let n = 0; n < 27; n++) {
    const [x1, y1] = at(n * 360 / 27, ringInner), [x2, y2] = at(n * 360 / 27, ringInner + 10);
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="tick"/>`;
  }
  const [ax1, ay1] = at(ascSid + 180, ringOuter + 18), [ax2, ay2] = at(ascSid, ringOuter + 18);
  const [alx, aly] = at(ascSid, ringOuter + 40);
  svg += `<line x1="${ax1.toFixed(1)}" y1="${ay1.toFixed(1)}" x2="${ax2.toFixed(1)}" y2="${ay2.toFixed(1)}" class="asc-line"/>`;
  svg += `<text x="${alx.toFixed(1)}" y="${aly.toFixed(1)}" class="sky-label sky-label--asc">${esc(t("lagnaTag"))}</text>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="4.5" class="earth"/>`;
  const sorted = [...positions].sort((a, b) => a.lon - b.lon);
  let stack = 0;
  sorted.forEach((p, i) => {
    if (i > 0) {
      let d = p.lon - sorted[i - 1].lon;
      if (d > 180) d -= 360;
      stack = d < 8 ? stack + 1 : 0;
    }
    const r = base + stack * 15;
    const [px, py] = at(p.lon, r);
    const [sx, sy] = at(p.lon, 15);
    const [lx, ly] = at(p.lon, r + PLANET_R[p.key] + 11);
    const node = p.key === "Rahu" || p.key === "Ketu";
    svg += `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" class="spoke"/>`;
    svg += `<g class="sky-planet" data-tip="${p.key}" data-ctx="${ctx}" tabindex="0" role="button" aria-label="${esc(term("planets")[p.key])}">`;
    if (p.key === "Saturn") svg += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="14" ry="4.6" transform="rotate(-20 ${px.toFixed(1)} ${py.toFixed(1)})" style="fill:none;stroke:var(${PLANET_COLOR[p.key]})" stroke-width="1.1" opacity=".7"/>`;
    svg += node
      ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${PLANET_R[p.key]}" class="node" style="stroke:var(${PLANET_COLOR[p.key]})"/>`
      : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${PLANET_R[p.key]}" style="fill:var(${PLANET_COLOR[p.key]})" class="glow"/>`;
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="sky-label sky-label--planet">${esc(term("planetShort")[p.key])}</text></g>`;
  });
  return `<div class="skychart">${svg}</svg></div>`;
}

function tipHtml(p, positions, refDate, tz) {
  const dignity = getDignity(p.key, p.rasi);
  const dKey = { exalted: "dignityExalted", debilitated: "dignityDebilitated", own: "dignityOwn",
    friend: "dignityFriend", enemy: "dignityEnemy", neutral: "dignityNeutral" }[dignity];
  const aspected = getAspectedRasis(p.key, p.rasi);
  const aspects = positions.filter((o) => o.key !== p.key && aspected.includes(o.rasi)).map((o) => term("planetShort")[o.key]);
  const REL = { friend: "relFriend", enemy: "relEnemy", neutral: "relNeutral" };
  const same = positions.filter((o) => o.key !== p.key && o.rasi === p.rasi)
    .map((o) => `${term("planetShort")[o.key]} (${t(REL[friendshipStatus(p.key, o.key) || "neutral"])})`);
  const [step, max] = SEARCH[p.key];
  const fn = (d) => siderealLongitude(p.key, d);
  const entry = boundaryCrossing(fn, p.rasi * 30, refDate, -1, step, max);
  const exit = boundaryCrossing(fn, p.rasi * 30, refDate, 1, step, max);
  const when = (d) => (d ? `${fmtDate(zonedYmd(d, tz), { day: "numeric", month: "short", year: "numeric" })}, ${fmtTime(d, tz, { clock: true })}` : "—");
  return `
    <p class="tip__title">${esc(term("planets")[p.key])}${p.retro ? ` · ${esc(t("retrograde"))}` : ""}</p>
    <dl class="tip__rows">
      <div><dt>${esc(t("tipIn"))}</dt><dd>${esc(term("rasi")[p.rasi])}</dd></div>
      <div><dt>${esc(t("tipDegree"))}</dt><dd>${esc(dms(p.lon % 30))}</dd></div>
      <div><dt>${esc(t("nakshatram"))}</dt><dd>${esc(term("nakshatra")[p.nak])} (${p.pada})</dd></div>
      <div><dt>${esc(t("tipPower"))}</dt><dd>${esc(t(dKey))}</dd></div>
      <div><dt>${esc(t("tipSameHouse"))}</dt><dd>${esc(same.join(", ") || t("none"))}</dd></div>
      <div><dt>${esc(t("tipAspects"))}</dt><dd>${esc(aspects.join(", ") || t("none"))}</dd></div>
      <div><dt>${esc(t("tipEnters"))}</dt><dd>${esc(when(entry))}</dd></div>
      <div><dt>${esc(t("tipExits"))}</dt><dd>${esc(when(exit))}</dd></div>
    </dl>`;
}

function zonedYmd(d, tz) { const z = zoned(d, tz); return { year: z.year, month: z.month, day: z.day }; }

function fmtDashaDate(d, tz) {
  return `${fmtDate(zonedYmd(d, tz), { day: "numeric", month: "short", year: "numeric" })}`;
}

export function dashaHtml(dasha, tz) {
  const now = new Date();
  return dasha.map((md, i) => {
    const cur = now >= md.start && now < md.end;
    const bh = md.bhuktis.map((b) => {
      const bc = now >= b.start && now < b.end;
      return `<li class="${bc ? "is-current" : ""}"><span>${esc(term("planets")[b.lord])}${bc ? ` <em>${esc(t("dashaCurrent"))}</em>` : ""}</span>
        <span class="mono">${esc(fmtDashaDate(b.start, tz))} → ${esc(fmtDashaDate(b.end, tz))}</span></li>`;
    }).join("");
    return `<details class="dasha ${cur ? "is-current" : ""}" ${cur ? "open" : ""}>
      <summary><span class="dasha__lord">${esc(term("planets")[md.lord])}${cur ? ` <em>${esc(t("dashaCurrent"))}</em>` : ""}</span>
        <span class="mono">${esc(fmtDashaDate(md.start, tz))} → ${esc(fmtDashaDate(md.end, tz))}</span></summary>
      <ul class="bhuktis">${bh}</ul></details>`;
  }).join("");
}

function summaryHtml(r) {
  const { b, p, vedic, positions, asc, ascRasi, loc, civil } = r;
  const tz = loc.tz;
  const moon = positions.find((x) => x.key === "Moon");
  const sun = positions.find((x) => x.key === "Sun");
  const jup = positions.find((x) => x.key === "Jupiter");
  const sat = positions.find((x) => x.key === "Saturn");
  const kp = getKPLords(moon.lon);
  const tithiIdx = r.tithi;
  const paksha = tithiIdx < 15 ? "shukla" : "krishna";
  const nInPaksha = (tithiIdx % 15) + 1;
  const elapsed = r.birthUtc - vedic.sunrise;
  const nazh = elapsed >= 0 ? { n: Math.floor(elapsed / 1440000), v: Math.floor((elapsed % 1440000) / 24000) } : null;
  const weekdayName = term("weekday")[vedic.weekday];
  const civilWeekday = term("weekday")[new Date(Date.UTC(civil.year, civil.month - 1, civil.day)).getUTCDay()];
  const lmt = Math.round((b.lon - b.tz * 15) * 4);
  const jd = r.birthUtc.getTime() / DAY_MS + 2440587.5;
  const drek = Math.floor((asc % 30) / 10);
  const tStr = `${pad2(b.hh)}:${pad2(b.min)}:${pad2(b.ss)} ${b.ampm}`;

  const narrative = t("narrative", {
    ayana: term("ayana")[vedic.ayana], jupiter: term("rasi")[jup.rasi], saturn: term("rasi")[sat.rasi],
    weekday: weekdayName, date: fmtDate(civil),
    nazhigai: nazh ? t("narrativeNazhigai", { n: nazh.n, v: nazh.v }) : "",
    pada: moon.pada, star: term("nakshatra")[moon.nak], paksha: term("paksha")[paksha], tithi: tithiName(tithiIdx, false),
    karana: karanaName(r.karana), yoga: term("yoga")[r.yoga], moonRasi: term("rasi")[moon.rasi],
    navamsa: term("rasi")[navamsaIndex(moon.lon)], lagna: term("rasi")[ascRasi], drekkana: (t("drekkana") || [])[drek] || drek + 1
  });

  const rows = [
    [t("sumName"), b.name || "—"],
    [t("sumSex"), b.gender ? t({ female: "genderFemale", male: "genderMale", other: "genderOther" }[b.gender]) : "—"],
    [t("sumDob"), `${fmtDate(civil)} · ${civilWeekday}`],
    [t("sumTob"), tStr],
    [t("sumTz"), loc.tz],
    [t("sumPlace"), `${Math.abs(b.lon).toFixed(2)}° ${b.lon >= 0 ? t("east") : t("west")}, ${Math.abs(b.lat).toFixed(2)}° ${b.lat >= 0 ? t("north") : t("south")}`],
    [t("sumAyanamsa"), dms(r.ayanamsa)],
    [t("sumBirthStar"), `${term("nakshatra")[moon.nak]} – ${moon.pada}`],
    [t("sumRasiLord"), `${term("rasi")[moon.rasi]} – ${term("planets")[RASI_LORDS[moon.rasi]]}`],
    [t("sumLagnaLord"), `${term("rasi")[ascRasi]} – ${term("planets")[RASI_LORDS[ascRasi]]}`],
    [t("sumThidhi"), tithiName(tithiIdx)],
    [t("sumYoga"), term("yoga")[r.yoga]],
    [t("sumKarana"), karanaName(r.karana)],
    [t("sumSunrise"), fmtTime(vedic.sunrise, tz, { clock: true })],
    [t("sumSunset"), fmtTime(vedic.sunset, tz, { clock: true })],
    [t("sumDinamana"), fmtDurationClock(vedic.dayLen)],
    [t("sumDinamanaNazhigai"), `${Math.floor(vedic.dayLen / 1440000)}.${pad2(Math.floor((vedic.dayLen % 1440000) / 24000))}`],
    [t("sumLmt"), `${lmt >= 0 ? "+" : "−"}${Math.abs(lmt)} ${t("minutes")}`],
    [t("sumAstroDay"), r.preSunrise ? `${weekdayName} (${t("preSunrise")})` : weekdayName],
    [t("sumKalidina"), String(Math.floor(jd - KALI_YUGA_EPOCH_JD))],
    [t("sumDasaSystem"), t("dasaSystemValue")],
    [t("sumStarLord"), term("planets")[NAKSHATRA_LORDS[moon.nak]]],
    [t("sumGanamYoni"), `${term("ganam")[NAKSHATRA_GANAM[moon.nak]]}, ${term("yoni")[NAKSHATRA_YONI[moon.nak]]}`],
    [t("sumBirdTree"), `${term("bird")[NAKSHATRA_BIRD[moon.nak]]}, ${term("tree")[NAKSHATRA_TREE[moon.nak]]}`],
    [t("sumSunStar"), `${term("rasi")[sun.rasi]} – ${term("nakshatra")[sun.nak]}`],
    [t("sumWestern"), term("rasiWestern")[Math.floor(norm360(sun.lon + r.ayanamsa) / 30)]],
    [t("sumKpMoon"), `${term("planets")[kp.starLord]} / ${term("planets")[kp.subLord]}`]
  ];

  return `
    <p class="narrative">${esc(narrative)}</p>
    <h4 class="fold__sub">${esc(t("aboutWeekday"))}</h4>
    <p>${esc(t("weekdayBlurb", { weekday: weekdayName, lord: term("planets")[["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][vedic.weekday]] }))}</p>
    <h4 class="fold__sub">${esc(t("aboutStar"))}</h4>
    <p>${esc(t("starBlurb", { star: term("nakshatra")[moon.nak], pada: moon.pada, lord: term("planets")[NAKSHATRA_LORDS[moon.nak]],
      ganam: term("ganam")[NAKSHATRA_GANAM[moon.nak]], yoni: term("yoni")[NAKSHATRA_YONI[moon.nak]] }))}</p>
    <h4 class="fold__sub">${esc(t("aboutTithi"))}</h4>
    <p>${esc(t("tithiBlurb", { tithi: tithiName(tithiIdx, false), paksha: term("paksha")[paksha], phase: t(paksha === "shukla" ? "waxing" : "waning"), n: nInPaksha }))}</p>
    <table class="kv"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`;
}

function fmtDurationClock(ms) {
  const mins = Math.round(ms / 60000);
  return `${Math.floor(mins / 60)}:${pad2(mins % 60)}`;
}

// ----------------------------------------------------------------------------
// Screen
// ----------------------------------------------------------------------------
function formHtml(b) {
  const tzOpts = TZ_OFFSETS.map((o) => {
    const sign = o >= 0 ? "+" : "−";
    const a = Math.abs(o), h = Math.floor(a), m = Math.round((a - h) * 60);
    return `<option value="${o}" ${Math.abs(o - b.tz) < 1e-6 ? "selected" : ""}>UTC ${sign}${h}:${pad2(m)}</option>`;
  }).join("");
  return `
    <form class="tile form" data-form="birth" novalidate>
      <h3 class="tile__title">${esc(t("birthDetails"))}</h3>
      <div class="grid2">
        <label class="field"><span>${esc(t("nameLabel"))}</span><input name="name" type="text" value="${esc(b.name || "")}"></label>
        <label class="field"><span>${esc(t("genderLabel"))}</span>
          <select name="gender">
            <option value="" ${!b.gender ? "selected" : ""}>${esc(t("genderNone"))}</option>
            <option value="female" ${b.gender === "female" ? "selected" : ""}>${esc(t("genderFemale"))}</option>
            <option value="male" ${b.gender === "male" ? "selected" : ""}>${esc(t("genderMale"))}</option>
            <option value="other" ${b.gender === "other" ? "selected" : ""}>${esc(t("genderOther"))}</option>
          </select></label>
      </div>
      <fieldset class="field"><legend>${esc(t("dob"))}</legend>
        <div class="seg3">
          <input name="dd" inputmode="numeric" maxlength="2" placeholder="DD" aria-label="DD" value="${b.dd ?? ""}">
          <input name="mm" inputmode="numeric" maxlength="2" placeholder="MM" aria-label="MM" value="${b.mm ?? ""}">
          <input name="yyyy" inputmode="numeric" maxlength="4" placeholder="YYYY" aria-label="YYYY" value="${b.yyyy ?? ""}" class="wide">
        </div></fieldset>
      <fieldset class="field"><legend>${esc(t("tob"))}</legend>
        <div class="seg3">
          <input name="hh" inputmode="numeric" maxlength="2" placeholder="HH" aria-label="HH" value="${b.hh ?? ""}">
          <input name="min" inputmode="numeric" maxlength="2" placeholder="MM" aria-label="MM" value="${b.min ?? ""}">
          <input name="ss" inputmode="numeric" maxlength="2" placeholder="SS" aria-label="SS" value="${b.ss ?? "0"}">
          <select name="ampm" aria-label="AM/PM"><option ${b.ampm !== "PM" ? "selected" : ""}>AM</option><option ${b.ampm === "PM" ? "selected" : ""}>PM</option></select>
        </div></fieldset>
      <label class="field"><span>${esc(t("tzLabel"))}</span><select name="tz">${tzOpts}</select>
        <small class="muted">${esc(t("tzHint"))}</small></label>
      <div class="searchrow">
        <label class="field"><span>${esc(t("birthPlace"))}</span><input name="place" type="text" value="${esc(b.place || "")}" placeholder="${esc(t("searchPlaceholder"))}"></label>
        <button type="button" class="btn" data-action="birth-lookup">${icon("search")}<span class="sr-only">${esc(t("findCoordinates"))}</span></button>
      </div>
      <p class="status" data-birth-status role="status"></p>
      <div class="grid2">
        <label class="field"><span>${esc(t("latitude"))}</span><input name="lat" type="number" step="0.0001" value="${b.lat ?? ""}"></label>
        <label class="field"><span>${esc(t("longitude"))}</span><input name="lon" type="number" step="0.0001" value="${b.lon ?? ""}"></label>
      </div>
      <p class="form-error" data-birth-error role="alert" hidden></p>
      <button type="submit" class="btn btn--wide">${esc(t("generate"))}</button>
    </form>`;
}

function skySection(app) {
  const mode = state.sky.mode;
  const r = state.result;
  const loc = mode === "birth" && r ? r.loc : app.state.loc;
  const when = state.sky.date || new Date();
  const pos = positionsAt(when);
  const asc = ascendantSidereal(when, loc.lat, loc.lon);
  state.skyCtx = { positions: pos, date: when, tz: loc.tz };
  const z = zoned(when, loc.tz);
  const dayOffset = Math.round((Date.UTC(z.year, z.month - 1, z.day) - Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())) / DAY_MS);
  return `
    <section class="tile span-2">
      <h3 class="tile__title">${esc(t("skyNow"))}</h3>
      ${r ? `<div class="segmented segmented--small">
        <button class="${mode === "here" ? "is-on" : ""}" data-action="sky-mode" data-mode="here">${esc(app.state.loc.name)}</button>
        <button class="${mode === "birth" ? "is-on" : ""}" data-action="sky-mode" data-mode="birth">${esc(t("birthPlace"))}</button>
      </div>` : ""}
      <p class="muted small">${esc(fmtDate({ year: z.year, month: z.month, day: z.day }))} · ${esc(fmtTime(when, loc.tz, { clock: true }))}</p>
      <div class="charts2">${gridChart(pos, Math.floor(asc / 30), { ctx: "sky" })}${skyChart(pos, asc, "sky")}</div>
      <label class="field"><span>${esc(t("pickDate"))}</span>
        <input type="range" min="-3650" max="3650" step="1" value="${dayOffset}" data-action="sky-day"></label>
      <label class="field"><span>${esc(t("time"))}</span>
        <input type="range" min="0" max="1439" step="1" value="${z.hour * 60 + z.minute}" data-action="sky-time"></label>
      <div class="actions actions--left"><button class="btn btn--small btn--ghost" data-action="sky-reset">${esc(t("today"))}</button></div>
    </section>`;
}

export function renderJathagam(root, app) {
  const saved = getBirth() || { tz: 5.5, ampm: "AM", ss: 0 };
  if (!state.result && saved && saved.lat != null && saved.yyyy && !state.editingTouched) {
    try { state.result = compute(saved); state.editing = false; } catch (e) { state.result = null; }
  }
  const r = state.result;
  let html = "";
  if (state.editing || !r) html += formHtml(saved);
  else html += `<div class="actions actions--left"><button class="btn btn--small btn--ghost" data-action="birth-edit">${esc(t("editDetails"))}</button></div>`;

  if (r) {
    const tz = r.loc.tz;
    const posRows = r.positions.map((p) => `<tr>
      <th scope="row">${esc(term("planets")[p.key])}${p.retro ? ` <sup>${esc(t("retro"))}</sup>` : ""}</th>
      <td class="mono">${esc(dms(p.lon % 30))}</td><td>${esc(term("rasi")[p.rasi])}</td>
      <td>${esc(term("nakshatra")[p.nak])}</td><td>${p.pada}</td></tr>`).join("");
    const ascRow = `<tr class="is-lagna"><th scope="row">${esc(t("lagnaTag"))}</th><td class="mono">${esc(dms(r.asc % 30))}</td>
      <td>${esc(term("rasi")[r.ascRasi])}</td><td>${esc(term("nakshatra")[nakIndex(r.asc)])}</td><td>${padaOf(r.asc)}</td></tr>`;
    const kpRows = [...r.positions, { key: "Lagna", lon: r.asc }].map((p) => {
      const kp = getKPLords(p.lon);
      return `<tr><th scope="row">${esc(p.key === "Lagna" ? t("lagnaTag") : term("planets")[p.key])}</th>
        <td>${esc(term("planets")[kp.starLord])}</td><td>${esc(term("planets")[kp.subLord])}</td><td>${esc(term("planets")[kp.subSubLord])}</td></tr>`;
    }).join("");
    const moon = r.positions.find((x) => x.key === "Moon");
    const sun = r.positions.find((x) => x.key === "Sun");
    state.birthCtx = { positions: r.positions, date: r.birthUtc, tz };

    html += `
      ${r.b.name ? `<p class="person">${esc(r.b.name)}</p>` : ""}
      <div class="bento">
        <section class="tile span-2"><h3 class="tile__title">${esc(t("rasiChart"))}</h3>
          <div class="charts2">${gridChart(r.positions, r.ascRasi, { ctx: "birth" })}${skyChart(r.positions, r.asc, "birth")}</div></section>
        <section class="tile span-2"><h3 class="tile__title">${esc(t("navamsaChart"))}</h3>
          ${gridChart(r.positions, navamsaIndex(r.asc), { navamsa: true, title: t("navamsaChart") })}</section>
        <details class="tile span-2 fold" open><summary class="tile__title">${esc(t("horoscopeSummary"))}</summary>${summaryHtml(r)}</details>
        <details class="tile span-2 fold" open><summary class="tile__title">${esc(t("planetaryPositions"))}</summary>
          <div class="table-scroll"><table class="data"><thead><tr><th>${esc(t("thGraha"))}</th><th>${esc(t("thLon"))}</th><th>${esc(t("thRasi"))}</th><th>${esc(t("thNak"))}</th><th>${esc(t("thPada"))}</th></tr></thead>
          <tbody>${ascRow}${posRows}</tbody></table></div></details>
        <details class="tile span-2 fold"><summary class="tile__title">${esc(t("kpLords"))}</summary>
          <div class="table-scroll"><table class="data"><thead><tr><th>${esc(t("thGraha"))}</th><th>${esc(t("thStar"))}</th><th>${esc(t("thSub"))}</th><th>${esc(t("thSubSub"))}</th></tr></thead>
          <tbody>${kpRows}</tbody></table></div></details>
        <details class="tile span-2 fold"><summary class="tile__title">${esc(t("sudarshana"))}</summary>
          <p class="muted small">${esc(t("sudarshanaHint"))}</p>
          <div class="charts3">
            <div><p class="chart-label">${esc(t("lagnaChart"))}</p>${gridChart(r.positions, r.ascRasi, { title: t("lagnaChart") })}</div>
            <div><p class="chart-label">${esc(t("chandraChart"))}</p>${gridChart(r.positions, moon.rasi, { title: t("chandraChart") })}</div>
            <div><p class="chart-label">${esc(t("suryaChart"))}</p>${gridChart(r.positions, sun.rasi, { title: t("suryaChart") })}</div>
          </div></details>
        <details class="tile span-2 fold" open><summary class="tile__title">${esc(t("dasha"))}</summary>
          <p class="muted small">${esc(t("dashaHint"))}</p>${dashaHtml(r.dasha, tz)}</details>
        ${skySection(app)}
      </div>
      <p class="muted small">${esc(t("note"))}</p>`;
  } else {
    html += `<div class="bento">${skySection(app)}</div>`;
  }
  root.innerHTML = html + `<div class="tip" data-tip-box hidden role="dialog"></div>`;
}

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------
function readForm(form) {
  const n = (v) => (v === "" || v == null ? NaN : Number(v));
  return {
    name: form.name.value.trim(), gender: form.gender.value,
    dd: n(form.dd.value), mm: n(form.mm.value), yyyy: n(form.yyyy.value),
    hh: n(form.hh.value), min: n(form.min.value), ss: form.ss.value === "" ? 0 : n(form.ss.value), ampm: form.ampm.value,
    tz: Number(form.tz.value), place: form.place.value.trim(), lat: n(form.lat.value), lon: n(form.lon.value)
  };
}

function validate(b) {
  if ([b.dd, b.mm, b.yyyy, b.hh, b.min, b.lat, b.lon].some((v) => !Number.isFinite(v))) return t("errMissing");
  const d = new Date(Date.UTC(b.yyyy, b.mm - 1, b.dd));
  d.setUTCFullYear(b.yyyy);
  if (b.mm < 1 || b.mm > 12 || b.dd < 1 || d.getUTCMonth() !== b.mm - 1 || d.getUTCDate() !== b.dd) return t("errBadDate");
  if (b.hh < 1 || b.hh > 12 || b.min < 0 || b.min > 59 || b.ss < 0 || b.ss > 59) return t("errBadTime");
  if (b.lat < -90 || b.lat > 90 || b.lon < -180 || b.lon > 180) return t("errBadCoords");
  return null;
}

function showTip(root, target) {
  const box = root.querySelector("[data-tip-box]");
  const ctx = target.dataset.ctx === "sky" ? state.skyCtx : state.birthCtx;
  if (!ctx) return;
  const p = ctx.positions.find((x) => x.key === target.dataset.tip);
  if (!p) return;
  if (state.tip === target) { hideTip(root); return; }
  box.innerHTML = tipHtml(p, ctx.positions, ctx.date, ctx.tz) +
    `<button class="iconbtn tip__close" data-action="tip-close" aria-label="${esc(t("close"))}">${icon("close")}</button>`;
  box.hidden = false;
  const rect = target.getBoundingClientRect();
  const bw = Math.min(300, window.innerWidth - 24);
  box.style.width = `${bw}px`;
  let left = rect.left + rect.width / 2 - bw / 2;
  left = Math.max(12, Math.min(window.innerWidth - bw - 12, left));
  const below = rect.bottom + 8;
  box.style.left = `${left}px`;
  box.style.top = `${Math.min(below, window.innerHeight - box.offsetHeight - 12)}px`;
  state.tip = target;
  root.querySelectorAll(".ccell.is-aspect, .ccell.is-source").forEach((c) => c.classList.remove("is-aspect", "is-source"));
  const grid = target.closest(".chartgrid");
  if (grid) {
    grid.querySelector(`[data-rasi="${p.rasi}"]`)?.classList.add("is-source");
    for (const r of getAspectedRasis(p.key, p.rasi)) grid.querySelector(`[data-rasi="${r}"]`)?.classList.add("is-aspect");
  }
}

export function hideTip(root) {
  const box = root.querySelector("[data-tip-box]");
  if (box) box.hidden = true;
  root.querySelectorAll(".ccell.is-aspect, .ccell.is-source").forEach((c) => c.classList.remove("is-aspect", "is-source"));
  const had = !!state.tip;
  state.tip = null;
  return had;
}

export function bindJathagam(root, app) {
  root.addEventListener("submit", (e) => {
    const form = e.target.closest('[data-form="birth"]');
    if (!form) return;
    e.preventDefault();
    const b = readForm(form);
    const err = validate(b);
    const errEl = form.querySelector("[data-birth-error]");
    if (err) { errEl.textContent = err; errEl.hidden = false; return; }
    saveBirth(b);
    state.result = compute(b);
    state.editing = false;
    app.render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  root.addEventListener("click", async (e) => {
    const tip = e.target.closest("[data-tip]");
    if (tip) { e.preventDefault(); showTip(root, tip); return; }
    const a = e.target.closest("[data-action]");
    if (!a) { if (!e.target.closest("[data-tip-box]")) hideTip(root); return; }
    switch (a.dataset.action) {
      case "tip-close": hideTip(root); break;
      case "birth-edit": state.editing = true; state.editingTouched = true; app.render(); break;
      case "sky-mode": state.sky.mode = a.dataset.mode; app.render(); break;
      case "sky-reset": state.sky.date = null; app.render(); break;
      case "birth-lookup": {
        const form = root.querySelector('[data-form="birth"]');
        const status = root.querySelector("[data-birth-status]");
        const q = form.place.value.trim();
        if (!q) return;
        status.textContent = t("searching");
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=${lang()}&q=${encodeURIComponent(q)}`);
          const items = await res.json();
          if (!items.length) { status.textContent = t("noMatch"); return; }
          form.lat.value = Number(items[0].lat).toFixed(4);
          form.lon.value = Number(items[0].lon).toFixed(4);
          status.textContent = items[0].display_name;
        } catch (err) { status.textContent = t("searchFailed"); }
        break;
      }
      default: break;
    }
  });

  let raf = 0;
  root.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.action === "sky-day" || el.dataset.action === "sky-time") {
      const dayInput = root.querySelector('[data-action="sky-day"]');
      const timeInput = root.querySelector('[data-action="sky-time"]');
      const loc = state.sky.mode === "birth" && state.result ? state.result.loc : app.state.loc;
      const now = new Date();
      const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + Number(dayInput.value) * DAY_MS;
      const d = new Date(base);
      const mins = Number(timeInput.value);
      state.sky.date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), Math.floor(mins / 60), mins % 60)
        - (zoned(d, loc.tz).offset) * 60000);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sec = root.querySelector(".bento > section.tile:last-child");
        if (sec) {
          const tmp = document.createElement("div");
          tmp.innerHTML = skySection(app);
          const fresh = tmp.firstElementChild;
          sec.querySelector(".charts2").replaceWith(fresh.querySelector(".charts2"));
          sec.querySelector("p.muted").replaceWith(fresh.querySelector("p.muted"));
        }
      });
      return;
    }
    // Digit-only date/time boxes that move to the next box when full
    if (el.matches(".seg3 input")) {
      el.value = el.value.replace(/[^0-9]/g, "");
      if (el.value.length >= Number(el.maxLength) && el.nextElementSibling && el.nextElementSibling.matches("input, select")) el.nextElementSibling.focus();
    }
  });
}

export function resetJathagamCache() {
  // Settings (ayanamsa, Rahu node) changed: recompute the chart
  if (state.result) {
    try { state.result = compute(state.result.b); } catch (e) { state.result = null; }
  }
}
