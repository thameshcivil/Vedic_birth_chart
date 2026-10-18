// Panchangam tab: the day's panchangam as a list of label → value rows.

import { computePanchang, KARANA_KEYS } from "../panchang.js";
import { festivalsOn, dayType } from "../festivals.js";
import { addDays } from "../astro.js";
import {
  t, term, festivalName, tithiName, karanaName, solarMonthName, lunarMonthName
} from "../i18n/index.js";
import { fmtTime, fmtRange, fmtDuration, fmtDate, esc, sameYmd, todayYmd } from "../format.js";
import { getSettings } from "../store.js";
import { icon } from "../icons.js";

export function panchangLabels(p, settings) {
  const lunarIndex = settings.lunar === "purnimanta" ? p.lunarMonthPurnimanta : p.lunarMonthAmanta;
  const solar = `${solarMonthName(p.solarMonth)} ${p.solarDay}`;
  const lunar = `${lunarMonthName(lunarIndex, p.adhika)} ${term("paksha")[p.paksha]}`;
  const isSolar = settings.calendar === "tamil";
  const samvatsara = term("samvatsara")[isSolar ? p.samvatsaraSolar : p.samvatsaraLunar];
  return { solar, lunar, lunarIndex, samvatsara, isSolar };
}

function segmentRows(segs, nameFn, tz, ref, sunrise) {
  return segs.map((s) => `
    <li class="seg">
      <span class="seg__name">${esc(nameFn(s))}</span>
      <span class="seg__time">${s.end ? `${esc(t("until"))} ${esc(fmtTime(s.end, tz, { ref, sunrise }))}` : ""}</span>
    </li>`).join("");
}

const KAALA_DAY = ["pratah", "sangava", "madhyahna", "aparahna", "sayahna"];

function row(label, value, cls = "") {
  return `<div class="prow ${cls}"><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
}
function foldRow(label, summary, body) {
  return `<details class="prow prow--fold"><summary><span class="prow__label">${esc(label)}</span>
    <span class="prow__value">${summary}</span>${icon("chevronDown", "icon prow__chev")}</summary>
    <div class="prow__body">${body}</div></details>`;
}
function lines(items) { return items.map((s) => `<span class="pline">${s}</span>`).join(""); }

/** "1, Sunday-Aippasi (Sun, 18-Oct-2026)" */
export function dateLine(p, date, settings) {
  const wd = term("weekday")[p.weekday];
  const isSolar = settings.calendar === "tamil";
  const lunarIndex = settings.lunar === "purnimanta" ? p.lunarMonthPurnimanta : p.lunarMonthAmanta;
  const native = isSolar
    ? `${p.solarDay}, ${wd}-${solarMonthName(p.solarMonth)}`
    : `${(p.tithiSunrise % 15) + 1}, ${wd}-${lunarMonthName(lunarIndex, p.adhika)}`;
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const en = `${d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}, ${String(date.day).padStart(2, "0")}-${d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}-${date.year}`;
  return { native, en };
}

export function renderToday(root, app) {
  const { date, loc } = app.state;
  const settings = getSettings();
  const tz = loc.tz;
  const p = computePanchang(date, loc);
  const fests = festivalsOn(date, loc);
  const kind = dayType(p);
  const L = panchangLabels(p, settings);
  const ref = date;
  const opt = { ref, sunrise: p.sunrise };
  const tm = (d) => esc(fmtTime(d, tz, opt));
  const clock = (d) => esc(fmtTime(d, tz, { ref, clock: true }));
  const range = (r) => esc(fmtRange(r.start, r.end, tz, opt));
  const isToday = sameYmd(date, todayYmd(tz));
  const DL = dateLine(p, date, settings);

  const segs = (list, nameFn) => lines(list.map((s) =>
    `<strong>${esc(nameFn(s))}</strong>${s.end ? ` <span class="muted nowrap">${esc(t("until"))} ${tm(s.end)}</span>` : ""}`));

  const vishesham = fests.length
    ? lines(fests.map((f) => `<span class="evt evt--${f.kind}">${esc(festivalName(f.id))}</span>`))
    : `<span class="muted">—</span>`;
  const dtKey = { kari: "dtKari", muhurtham: "dtMuhurtham", kavanam: "dtKavanam", sadharana: "dtSadharana" }[kind];

  // Kaala vibhagam: the part of the day we are in now (or the morning part on other days)
  const now = new Date();
  const dayParts = p.kaalam.filter((k) => KAALA_DAY.includes(k.key));
  let ci = isToday ? dayParts.findIndex((k) => now >= k.start && now < k.end) : 0;
  if (ci < 0) ci = 0;
  const cur = dayParts[ci], nxt = dayParts[ci + 1];
  const kaalaSummary = cur
    ? `${esc(term("kaala")[cur.key])} (${tm(cur.end)})${nxt ? ` ➤ ${esc(term("kaala")[nxt.key])}` : ""}`
    : "—";
  const listRows = (items) => `<ul class="plist">${items.join("")}</ul>`;
  const li = (a, b, cls = "") => `<li class="${cls}"><span>${a}</span><span class="plist__time">${b}</span></li>`;

  const abhijit = p.kaalam.find((k) => k.key === "abhijit");
  const goodGowriNow = p.gowriDay.filter((g) => g.good).map((g) => fmtRange(g.start, g.end, tz, opt));

  root.innerHTML = `
    ${loc.source === "default" ? `
      <div class="notice" role="status">
        <span>${esc(t("locationDefaultNote"))}</span>
        <button class="btn btn--small" data-action="set-location">${esc(t("setNow"))}</button>
      </div>` : ""}

    <div class="dayhead">
      <button class="dayhead__date" data-action="pick-date" aria-label="${esc(t("pickDate"))}">
        <span class="dayhead__native">${esc(DL.native)}</span> <span class="dayhead__en">(${esc(DL.en)})</span>
      </button>
      <button class="dayhead__loc" data-action="set-location" aria-label="${esc(t("changeLocation"))}">${esc(loc.name)}</button>
    </div>
    ${isToday ? "" : `<div class="dayhead__today"><button class="btn btn--ghost btn--small" data-action="go-today">${esc(t("today"))}</button></div>`}
    ${p.polar ? `<p class="notice">${esc(t("polarNote"))}</p>` : ""}

    <dl class="plistcard" data-swipe="day">
      ${row(t("dinaVishesham"), vishesham, "prow--wrap")}
      ${row(t("naalVagai"), `<span class="daytype daytype--${kind}">${esc(t(dtKey))}</span>`)}
      ${row(t("sunrise"), clock(p.sunrise))}
      ${row(t("sunset"), clock(p.sunset))}
      ${row(t("moonrise"), p.moonrise ? clock(p.moonrise) : `<span class="muted">${esc(t("noMoonrise"))}</span>`)}
      ${row(t("moonset"), p.moonsetAfterRise ? tm(p.moonsetAfterRise) : `<span class="muted">${esc(t("noMoonset"))}</span>`)}
      ${foldRow(t("kaalaNow"), kaalaSummary, listRows(p.kaalam.map((k) => li(esc(term("kaala")[k.key]), range(k), cur && k.key === cur.key ? "is-now" : ""))))}
      ${row(t("samvatsaram"), esc(L.samvatsara))}
      ${row(t("ayanam"), esc(term("ayana")[p.ayana]))}
      ${row(t("rithuSolar"), esc(term("rithu")[p.solarRithu]))}
      ${row(t("rithuLunar"), esc(term("rithu")[p.lunarRithu]))}
      ${row(t("solarMonth"), esc(L.solar))}
      ${row(t("lunarMonth"), esc(lunarMonthName(L.lunarIndex, p.adhika)))}
      ${row(t("paksham"), esc(term("paksha")[p.paksha]))}
      ${row(t("vaasaram"), esc(term("vaasaram")[p.weekday]))}
      ${row(t("tithi"), segs(p.tithis, (s) => tithiName(s.index)))}
      ${row(t("nakshatram"), segs(p.nakshatras, (s) => term("nakshatra")[s.index]))}
      ${row(t("yogam"), segs(p.yogas, (s) => term("yoga")[s.index]))}
      ${row(t("karanam"), segs(p.karanas, (s) => karanaName(keyOfKarana(s.index))))}
      ${row(t("moonIn"), segs(p.moonRasis, (s) => term("rasi")[s.index]))}
      ${row(t("sunIn"), `${esc(term("rasi")[p.sunRasi])} · ${esc(term("nakshatra")[p.sunNakshatra])}`)}
      ${row(t("rahuKaalam"), range(p.rahuKaalam), "prow--bad")}
      ${row(t("yamagandam"), range(p.yamagandam), "prow--bad")}
      ${row(t("gulikai"), range(p.gulikai), "prow--bad")}
      ${row(t("nallaNeram"), p.nallaNeram.length ? lines(p.nallaNeram.map(([s, e]) => `<span class="nowrap">${esc(fmtRange(s, e, tz, opt))}</span>`)) : "—", "prow--good")}
      ${row(t("abhijit"), range(abhijit), "prow--good")}
      ${row(t("amirthathi"), lines(p.amirthathi.map((a) => `<strong>${esc(term("amirthathi")[a.value])}</strong>${a.end ? ` <span class="muted nowrap">${esc(t("until"))} ${tm(a.end)}</span>` : ""}`)))}
      ${row(t("nokku"), esc(term("nokku")[p.nokku]))}
      ${row(t("shoolam"), `${esc(term("direction")[p.shoolam.dir])}<span class="pline muted">${esc(t("parihaaram"))}: ${esc(term("remedy")[p.shoolam.remedy])}</span>`)}
      ${row(t("chandrashtamam"), lines(p.chandrashtama.map((c) => `<strong>${esc(term("rasi")[c.index])}</strong>${c.end ? ` <span class="muted nowrap">${esc(t("until"))} ${tm(c.end)}</span>` : ""}`)))}
      ${row(t("shraddhaTithi"), esc(tithiName(p.shraddhaTithi)))}
      ${row(t("lagnamAtSunrise"), esc(term("rasi")[p.lagnas[0].index]))}
      ${foldRow(t("gowri"), esc(goodGowriNow[0] || "—"),
        `<p class="plist__sub">${esc(t("day"))}</p>${listRows(p.gowriDay.map((g) => li(esc(term("gowri")[g.name]), range(g), g.good ? "is-good" : "is-bad")))}
         <p class="plist__sub">${esc(t("night"))}</p>${listRows(p.gowriNight.map((g) => li(esc(term("gowri")[g.name]), range(g), g.good ? "is-good" : "is-bad")))}`)}
      ${foldRow(t("horai"), esc(term("planets")[p.horai[0].lord]),
        listRows(p.horai.map((h) => li(esc(term("planets")[h.lord]), range(h), h.day ? "" : "is-night"))))}
      ${foldRow(t("lagnam"), esc(term("rasi")[p.lagnas[0].index]),
        listRows(p.lagnas.map((l) => li(esc(term("rasi")[l.index]), l.end ? `${esc(t("until"))} ${tm(l.end)}` : ""))))}
    </dl>
  `;
}

function keyOfKarana(index) { return KARANA_KEYS[index]; }

/** Plain-text summary of the day, for sharing. */
export function dayShareText(app) {
  const { date, loc } = app.state;
  const settings = getSettings();
  const tz = loc.tz;
  const p = computePanchang(date, loc);
  const L = panchangLabels(p, settings);
  const opt = { ref: date, sunrise: p.sunrise };
  const fests = festivalsOn(date, loc).map((f) => festivalName(f.id));
  const lines = [
    `${t("shareTitle")} · ${fmtDate(date)} · ${term("weekday")[p.weekday]}`,
    `${loc.name}`,
    `${L.samvatsara} · ${term("ayana")[p.ayana]} · ${term("rithu")[L.isSolar ? p.solarRithu : p.lunarRithu]}`,
    `${t("solarMonth")}: ${L.solar} · ${t("lunarMonth")}: ${lunarMonthName(L.lunarIndex, p.adhika)}`,
    `${t("tithi")}: ${p.tithis.map((s) => `${tithiName(s.index)}${s.end ? ` ${t("until")} ${fmtTime(s.end, tz, opt)}` : ""}`).join(", ")}`,
    `${t("nakshatram")}: ${p.nakshatras.map((s) => `${term("nakshatra")[s.index]}${s.end ? ` ${t("until")} ${fmtTime(s.end, tz, opt)}` : ""}`).join(", ")}`,
    `${t("yogam")}: ${term("yoga")[p.yogas[0].index]} · ${t("karanam")}: ${karanaName(keyOfKarana(p.karanas[0].index))}`,
    `${t("sunrise")} ${fmtTime(p.sunrise, tz, { clock: true })} · ${t("sunset")} ${fmtTime(p.sunset, tz, { clock: true })}`,
    `${t("rahuKaalam")} ${fmtRange(p.rahuKaalam.start, p.rahuKaalam.end, tz, opt)}`,
    `${t("yamagandam")} ${fmtRange(p.yamagandam.start, p.yamagandam.end, tz, opt)}`,
    `${t("gulikai")} ${fmtRange(p.gulikai.start, p.gulikai.end, tz, opt)}`,
    `${t("nallaNeram")}: ${p.nallaNeram.map(([s, e]) => fmtRange(s, e, tz, opt)).join(", ")}`,
    `${t("chandrashtamam")}: ${term("rasi")[p.chandrashtama[0].index]}`
  ];
  if (fests.length) lines.push(`${t("daysEvents")}: ${fests.join(", ")}`);
  lines.push("", `— ${t("navToday")} · Aarush Panchangam`);
  return lines.join("\n");
}

export function shiftDate(app, n) {
  const d = app.state.date;
  app.setDate(addDays(d.year, d.month, d.day, n));
}
