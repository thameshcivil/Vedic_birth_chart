// Month calendar: English date with the Tamil date (or tithi) in the corner, an
// observance glyph, cells coloured by day type, and the month's observances below.

import { dayFacts } from "../panchang.js";
import { festivalsOn, isShubhaMuhurtaDay, dayType } from "../festivals.js";
import { glyph, glyphFor } from "../glyphs.js";
import { t, term, festivalName, solarMonthName, lunarMonthName, tithiName } from "../i18n/index.js";
import { esc, monthYear, sameYmd, todayYmd, fmtDate, ymdKey } from "../format.js";
import { getSettings } from "../store.js";
import { icon } from "../icons.js";

function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

export function monthData(year, month, loc) {
  const n = daysInMonth(year, month);
  const days = [];
  for (let d = 1; d <= n; d++) {
    const ymd = { year, month, day: d };
    const f = dayFacts(ymd, loc);
    days.push({ ymd, f, fests: festivalsOn(ymd, loc), muhurtham: isShubhaMuhurtaDay(f) });
  }
  return days;
}

function monthSpanLabel(days, settings) {
  const solar = [...new Set(days.map((d) => d.f.solarMonth))].map((i) => solarMonthName(i));
  const lunar = [];
  for (const d of days) {
    const idx = settings.lunar === "purnimanta" ? d.f.lunarMonthPurnimanta : d.f.lunarMonthAmanta;
    const name = lunarMonthName(idx, d.f.adhika);
    if (!lunar.includes(name)) lunar.push(name);
  }
  return { solar: solar.join(" – "), lunar: lunar.join(" – ") };
}

export function renderCalendar(root, app) {
  const { calMonth, loc, date } = app.state;
  const settings = getSettings();
  const { year, month } = calMonth;
  const days = monthData(year, month, loc);
  const span = monthSpanLabel(days, settings);
  const firstDow = days[0].f.weekday;
  const today = todayYmd(loc.tz);
  const isSolar = settings.calendar === "tamil";
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

  const head = term("weekdayShort").map((w, i) =>
    `<div class="mcal__dow ${i === 0 ? "is-sun" : ""}" role="columnheader">${esc(w)}</div>`).join("");
  const blanks = Array.from({ length: firstDow }, () => `<div class="mcal__cell is-blank" aria-hidden="true"></div>`).join("");
  const trailing = (7 - ((firstDow + days.length) % 7)) % 7;
  const tail = Array.from({ length: trailing }, () => `<div class="mcal__cell is-blank" aria-hidden="true"></div>`).join("");

  const cells = days.map(({ ymd, f, fests, muhurtham }) => {
    const small = isSolar ? f.solarDay : (f.tithiSunrise % 15) + 1;
    const kind = dayType(f);
    const g = glyphFor(fests, muhurtham);
    const cls = [
      "mcal__cell", `is-${kind}`,
      sameYmd(ymd, today) ? "is-today" : "",
      sameYmd(ymd, date) ? "is-selected" : ""
    ].join(" ");
    const label = `${fmtDate(ymd)}${isSolar ? ` · ${solarMonthName(f.solarMonth)} ${f.solarDay}` : ""}${fests.length ? ": " + fests.map((x) => festivalName(x.id)).join(", ") : ""}`;
    return `<button class="${cls}" data-action="open-day" data-ymd="${ymdKey(ymd)}" aria-label="${esc(label)}">
      <span class="mcal__glyph">${glyph(g)}</span>
      <span class="mcal__small">${small}</span>
      <span class="mcal__num">${ymd.day}</span>
    </button>`;
  }).join("");

  const list = days.filter((d) => d.fests.length).map(({ ymd, f, fests }) => {
    const names = fests.map((x) => `<li class="evt evt--${x.kind}">${esc(festivalName(x.id))}</li>`).join("");
    return `<li class="evrow">
      <button class="evrow__date" data-action="open-day" data-ymd="${ymdKey(ymd)}">
        <span class="evrow__num">${ymd.day}</span>
        <span class="evrow__dow">${esc(term("weekdayShort")[f.weekday])}</span>
      </button>
      <div class="evrow__body">
        <p class="evrow__meta">${esc(isSolar ? `${solarMonthName(f.solarMonth)} ${f.solarDay}` : tithiName(f.tithiSunrise))}</p>
        <ul class="evrow__list">${names}</ul>
      </div>
    </li>`;
  }).join("");

  root.innerHTML = `
    <div class="mhead">
      <button class="iconbtn mhead__arrow" data-action="prev-year" aria-label="${esc(t("prevYear"))}">${icon("dblLeft")}</button>
      <button class="iconbtn mhead__arrow" data-action="prev-month" aria-label="${esc(t("prevMonth"))}">${icon("chevronLeft")}</button>
      <button class="mhead__title" data-action="pick-month">${esc(monthName)} ${year}</button>
      <button class="iconbtn mhead__arrow" data-action="next-month" aria-label="${esc(t("nextMonth"))}">${icon("chevronRight")}</button>
      <button class="iconbtn mhead__arrow" data-action="next-year" aria-label="${esc(t("nextYear"))}">${icon("dblRight")}</button>
    </div>
    <p class="mhead__span">${esc(isSolar ? span.solar : span.lunar)} <span class="muted">· ${esc(isSolar ? span.lunar : span.solar)}</span></p>

    <div class="mcal" role="grid" data-swipe="month">
      ${head}${blanks}${cells}${tail}
    </div>

    <ul class="mlegend">
      <li class="is-selected">${esc(t("dtSelected"))}</li>
      <li class="is-kari">${esc(t("dtKari"))}</li>
      <li class="is-kavanam">${esc(t("dtKavanam"))}</li>
      <li class="is-sadharana">${esc(t("dtSadharana"))}</li>
      <li class="is-muhurtham">${esc(t("dtMuhurtham"))}</li>
    </ul>

    <section class="monthlist">
      <h3 class="section-title">${esc(t("monthEvents"))}</h3>
      ${list ? `<ul class="evrows">${list}</ul>` : `<p class="muted">${esc(t("noEventsMonth"))}</p>`}
    </section>
  `;
}

export function monthShareText(app) {
  const { calMonth, loc } = app.state;
  const settings = getSettings();
  const days = monthData(calMonth.year, calMonth.month, loc);
  const lines = [`${monthYear(calMonth.year, calMonth.month)} · ${loc.name}`, ""];
  for (const { ymd, f, fests } of days) {
    if (!fests.length) continue;
    const solar = settings.calendar === "tamil" ? ` (${solarMonthName(f.solarMonth)} ${f.solarDay})` : "";
    lines.push(`${ymd.day} ${term("weekdayShort")[f.weekday]}${solar}: ${fests.map((x) => festivalName(x.id)).join(", ")}`);
  }
  lines.push("", "— Aarush Panchangam");
  return lines.join("\n");
}
