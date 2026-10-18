// Month calendar: Tamil date or tithi under each day, observance marks, and the
// month's observances listed below the grid.

import { dayFacts } from "../panchang.js";
import { festivalsOn, isShubhaMuhurtaDay } from "../festivals.js";
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

  const head = term("weekdayShort").map((w, i) =>
    `<div class="cal__dow ${i === 0 ? "is-sun" : ""}" role="columnheader">${esc(w)}</div>`).join("");
  const blanks = Array.from({ length: firstDow }, () => `<div class="cal__cell is-blank" aria-hidden="true"></div>`).join("");

  const cells = days.map(({ ymd, f, fests, muhurtham }) => {
    const sub = isSolar
      ? (f.solarDay === 1 ? solarMonthName(f.solarMonth) : String(f.solarDay))
      : `${(f.tithiSunrise % 15) + 1}${f.tithiSunrise === 14 ? "●" : f.tithiSunrise === 29 ? "○" : ""}`;
    const kinds = [...new Set(fests.map((x) => x.kind))];
    const marks = kinds.map((k) => `<i class="dot dot--${k}"></i>`).join("") + (muhurtham ? `<i class="dot dot--muhurtham"></i>` : "");
    const major = fests.find((x) => x.kind === "festival");
    const cls = [
      "cal__cell",
      f.weekday === 0 ? "is-sun" : "",
      sameYmd(ymd, today) ? "is-today" : "",
      sameYmd(ymd, date) ? "is-selected" : "",
      f.careful ? "is-careful" : "",
      major ? "has-festival" : ""
    ].join(" ");
    const label = `${fmtDate(ymd)}${fests.length ? ": " + fests.map((x) => festivalName(x.id)).join(", ") : ""}`;
    return `<button class="${cls}" data-action="open-day" data-ymd="${ymdKey(ymd)}" aria-label="${esc(label)}">
      <span class="cal__num">${ymd.day}</span>
      <span class="cal__sub">${esc(sub)}</span>
      <span class="cal__marks">${marks}</span>
    </button>`;
  }).join("");

  const list = days.filter((d) => d.fests.length || d.muhurtham).map(({ ymd, f, fests, muhurtham }) => {
    const names = fests.map((x) => `<li class="evt evt--${x.kind}">${esc(festivalName(x.id))}</li>`).join("") +
      (muhurtham ? `<li class="evt evt--muhurtham">${esc(t("shubhaMuhurtam"))}</li>` : "");
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

  const yearOptions = [];
  for (let y = year - 60; y <= year + 60; y++) yearOptions.push(`<option value="${y}" ${y === year ? "selected" : ""}>${y}</option>`);

  root.innerHTML = `
    <div class="calhead">
      <button class="iconbtn" data-action="prev-month" aria-label="${esc(t("prevMonth"))}">${icon("chevronLeft")}</button>
      <div class="calhead__title">
        <h2>${esc(monthYear(year, month))}</h2>
        <p class="calhead__span">${esc(isSolar ? span.solar : span.lunar)}</p>
        <p class="calhead__span muted">${esc(isSolar ? span.lunar : span.solar)}</p>
      </div>
      <button class="iconbtn" data-action="next-month" aria-label="${esc(t("nextMonth"))}">${icon("chevronRight")}</button>
    </div>
    <div class="caltools no-print">
      <label class="field field--inline"><span>${esc(t("selectYear"))}</span>
        <select data-action="pick-year">${yearOptions.join("")}</select></label>
      <button class="btn btn--small btn--ghost" data-action="cal-today">${esc(t("today"))}</button>
    </div>

    <div class="cal" role="grid" data-swipe="month">
      ${head}${blanks}${cells}
    </div>

    <ul class="legend">
      <li><i class="dot dot--festival"></i>${esc(t("legendFestival"))}</li>
      <li><i class="dot dot--vratham"></i>${esc(t("legendVratham"))}</li>
      <li><i class="dot dot--tharpanam"></i>${esc(t("legendTharpanam"))}</li>
      <li><i class="dot dot--muhurtham"></i>${esc(t("legendMuhurtham"))}</li>
      <li><i class="swatch swatch--careful"></i>${esc(t("legendKari"))}</li>
    </ul>

    <section class="monthlist">
      <h3 class="section-title">${esc(t("monthEvents"))}</h3>
      ${list ? `<ul class="evrows">${list}</ul>` : `<p class="muted">${esc(t("noEventsMonth"))}</p>`}
    </section>

    <div class="actions no-print">
      <button class="btn" data-action="share-month">${icon("share")}${esc(t("shareMonth"))}</button>
      <button class="btn btn--ghost" data-action="print-month">${icon("print")}${esc(t("exportPdf"))}</button>
    </div>
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
