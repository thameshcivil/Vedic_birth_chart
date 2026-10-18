// "Today": the daily panchangam for the selected date and location, as bento tiles.

import { computePanchang, KARANA_KEYS } from "../panchang.js";
import { festivalsOn, isShubhaMuhurtaDay } from "../festivals.js";
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

export function renderToday(root, app) {
  const { date, loc } = app.state;
  const settings = getSettings();
  const tz = loc.tz;
  const p = computePanchang(date, loc);
  const fests = festivalsOn(date, loc);
  const muhurtham = isShubhaMuhurtaDay(p);
  const L = panchangLabels(p, settings);
  const ref = date;
  const sr = p.sunrise;
  const opt = { ref, sunrise: sr };
  const isToday = sameYmd(date, todayYmd(tz));

  const chips = fests.map((f) =>
    `<li class="chip chip--${f.kind}">${esc(festivalName(f.id))}</li>`).join("") +
    (muhurtham ? `<li class="chip chip--muhurtham">${esc(t("shubhaMuhurtam"))}</li>` : "");

  const kaalamRow = (key, range, cls) => `
    <div class="kaalam ${cls}">
      <span class="kaalam__label">${esc(t(key))}</span>
      <span class="kaalam__time">${esc(fmtTime(range.start, tz, opt))}</span>
      <span class="kaalam__to">${esc(fmtTime(range.end, tz, opt))}</span>
    </div>`;

  const nalla = p.nallaNeram.length
    ? p.nallaNeram.map(([s, e]) => `<li>${esc(fmtRange(s, e, tz, opt))}</li>`).join("")
    : `<li>—</li>`;

  const gowriRows = (list) => list.map((g) => `
    <li class="gowri ${g.good ? "is-good" : "is-bad"}">
      <span>${esc(term("gowri")[g.name])}</span>
      <span class="gowri__time">${esc(fmtRange(g.start, g.end, tz, opt))}</span>
    </li>`).join("");

  const horaiRows = p.horai.map((h) => `
    <li class="${h.day ? "" : "is-night"}"><span>${esc(term("planets")[h.lord])}</span>
    <span class="gowri__time">${esc(fmtRange(h.start, h.end, tz, opt))}</span></li>`).join("");

  const lagnaRows = p.lagnas.map((l) => `
    <li><span>${esc(term("rasi")[l.index])}</span>
    <span class="gowri__time">${l.end ? `${esc(t("until"))} ${esc(fmtTime(l.end, tz, opt))}` : ""}</span></li>`).join("");

  const kaalaRows = p.kaalam.map((k) => `
    <li><span>${esc(term("kaala")[k.key])}</span>
    <span class="gowri__time">${esc(fmtRange(k.start, k.end, tz, opt))}</span></li>`).join("");

  const shoolam = p.shoolam;
  const amirthathi = p.amirthathi.map((a) => `${term("amirthathi")[a.value]}${a.end ? ` ${t("until")} ${fmtTime(a.end, tz, opt)}` : ""}`);
  const chandrashtama = p.chandrashtama.map((c) => `${term("rasi")[c.index]}${c.end ? ` ${t("until")} ${fmtTime(c.end, tz, opt)}` : ""}`);

  root.innerHTML = `
    ${loc.source === "default" ? `
      <div class="notice" role="status">
        <span>${esc(t("locationDefaultNote"))}</span>
        <button class="btn btn--small" data-action="set-location">${esc(t("setNow"))}</button>
      </div>` : ""}

    <div class="datebar">
      <button class="iconbtn" data-action="prev-day" aria-label="${esc(t("prevDay"))}">${icon("chevronLeft")}</button>
      <button class="datebar__date" data-action="pick-date" aria-label="${esc(t("pickDate"))}">
        <span class="datebar__weekday">${esc(term("weekday")[p.weekday])}</span>
        <span class="datebar__full">${esc(fmtDate(date))}</span>
      </button>
      <button class="iconbtn" data-action="next-day" aria-label="${esc(t("nextDay"))}">${icon("chevronRight")}</button>
    </div>
    ${isToday ? "" : `<div class="center"><button class="btn btn--ghost btn--small" data-action="go-today">${esc(t("today"))}</button></div>`}

    <div class="bento" data-swipe="day">
      <article class="tile tile--hero span-2">
        <div class="hero">
          <div class="hero__num" aria-hidden="true">${L.isSolar ? p.solarDay : (p.tithiSunrise % 15) + 1}</div>
          <div class="hero__meta">
            <p class="hero__primary">${esc(L.isSolar ? L.solar : `${L.lunar}, ${tithiName(p.tithiSunrise, false)}`)}</p>
            <p class="hero__secondary">${esc(L.isSolar ? `${L.lunar}, ${tithiName(p.tithiSunrise, false)}` : L.solar)}</p>
            <p class="hero__year">${esc(L.samvatsara)} · ${esc(term("ayana")[p.ayana])}</p>
          </div>
        </div>
        ${chips ? `<ul class="chips" aria-label="${esc(t("daysEvents"))}">${chips}</ul>` : `<p class="muted small">${esc(t("nothingSpecial"))}</p>`}
        ${p.polar ? `<p class="muted small">${esc(t("polarNote"))}</p>` : ""}
      </article>

      <article class="tile tile--sun">
        <h3 class="tile__title">${icon("sun")}${esc(t("sunrise"))}</h3>
        <p class="bigtime">${esc(fmtTime(p.sunrise, tz, { ref, clock: true }))}</p>
        <p class="tile__sub">${esc(t("sunset"))} <strong>${esc(fmtTime(p.sunset, tz, { ref, clock: true }))}</strong></p>
        <p class="tile__sub">${esc(t("dayLength"))} ${esc(fmtDuration(p.dayLen))}</p>
      </article>

      <article class="tile tile--moon">
        <h3 class="tile__title">${icon("moon")}${esc(t("moonrise"))}</h3>
        <p class="bigtime">${p.moonrise ? esc(fmtTime(p.moonrise, tz, { ref, clock: true })) : `<span class="muted">${esc(t("noMoonrise"))}</span>`}</p>
        <p class="tile__sub">${esc(t("moonset"))} <strong>${p.moonset ? esc(fmtTime(p.moonset, tz, { ref, clock: true })) : "—"}</strong></p>
        <p class="tile__sub">${esc(t("moonIn"))} ${esc(term("rasi")[p.moonRasis[0].index])}</p>
      </article>

      <article class="tile tile--avoid span-2">
        <h3 class="tile__title">${esc(t("avoidTimes"))}</h3>
        <div class="kaalams">
          ${kaalamRow("rahuKaalam", p.rahuKaalam, "is-rahu")}
          ${kaalamRow("yamagandam", p.yamagandam, "")}
          ${kaalamRow("gulikai", p.gulikai, "")}
        </div>
      </article>

      <article class="tile tile--good span-2">
        <h3 class="tile__title">${esc(t("nallaNeram"))}</h3>
        <ul class="timelist">${nalla}</ul>
        <p class="tile__sub">${esc(t("abhijit"))}: <strong>${esc(fmtRange(p.kaalam.find((k) => k.key === "abhijit").start, p.kaalam.find((k) => k.key === "abhijit").end, tz, opt))}</strong></p>
      </article>

      <article class="tile span-2">
        <h3 class="tile__title">${esc(t("pancha"))}</h3>
        <dl class="facts">
          <div><dt>${esc(t("vaasaram"))}</dt><dd>${esc(term("vaasaram")[p.weekday])}</dd></div>
          <div><dt>${esc(t("tithi"))}</dt><dd><ul class="segs">${segmentRows(p.tithis, (s) => tithiName(s.index), tz, ref, sr)}</ul></dd></div>
          <div><dt>${esc(t("nakshatram"))}</dt><dd><ul class="segs">${segmentRows(p.nakshatras, (s) => term("nakshatra")[s.index], tz, ref, sr)}</ul></dd></div>
          <div><dt>${esc(t("yogam"))}</dt><dd><ul class="segs">${segmentRows(p.yogas, (s) => term("yoga")[s.index], tz, ref, sr)}</ul></dd></div>
          <div><dt>${esc(t("karanam"))}</dt><dd><ul class="segs">${segmentRows(p.karanas, (s) => karanaName(keyOfKarana(s.index)), tz, ref, sr)}</ul></dd></div>
          <div><dt>${esc(t("moonIn"))}</dt><dd><ul class="segs">${segmentRows(p.moonRasis, (s) => term("rasi")[s.index], tz, ref, sr)}</ul></dd></div>
          <div><dt>${esc(t("sunIn"))}</dt><dd>${esc(term("rasi")[p.sunRasi])} · ${esc(term("nakshatra")[p.sunNakshatra])}</dd></div>
        </dl>
      </article>

      <article class="tile span-2">
        <h3 class="tile__title">${esc(t("yearAndMonth"))}</h3>
        <dl class="facts facts--two">
          <div><dt>${esc(t("samvatsaram"))}</dt><dd>${esc(L.samvatsara)}</dd></div>
          <div><dt>${esc(t("ayanam"))}</dt><dd>${esc(term("ayana")[p.ayana])}</dd></div>
          <div><dt>${esc(t("rithu"))}</dt><dd>${esc(term("rithu")[L.isSolar ? p.solarRithu : p.lunarRithu])}</dd></div>
          <div><dt>${esc(t("paksham"))}</dt><dd>${esc(term("paksha")[p.paksha])}</dd></div>
          <div><dt>${esc(t("solarMonth"))}</dt><dd>${esc(L.solar)}</dd></div>
          <div><dt>${esc(t("lunarMonth"))}</dt><dd>${esc(lunarMonthName(L.lunarIndex, p.adhika))}</dd></div>
        </dl>
      </article>

      <article class="tile span-2">
        <h3 class="tile__title">${esc(t("dayQualities"))}</h3>
        <dl class="facts">
          <div><dt>${esc(t("amirthathi"))}</dt><dd>${amirthathi.map((s) => `<span class="block">${esc(s)}</span>`).join("")}</dd></div>
          <div><dt>${esc(t("nokku"))}</dt><dd>${esc(term("nokku")[p.nokku])}</dd></div>
          <div><dt>${esc(t("shoolam"))}</dt><dd>${esc(term("direction")[shoolam.dir])} · ${esc(t("parihaaram"))}: ${esc(term("remedy")[shoolam.remedy])}</dd></div>
          <div><dt>${esc(t("chandrashtamam"))}</dt><dd>${chandrashtama.map((s) => `<span class="block">${esc(s)}</span>`).join("")}</dd></div>
          <div><dt>${esc(t("shraddhaTithi"))}</dt><dd>${esc(tithiName(p.shraddhaTithi))}</dd></div>
          <div><dt>${esc(t("kariNaal"))}</dt><dd>${esc(p.kariNaal ? t("yes") : t("no"))}</dd></div>
          <div><dt>${esc(t("dinaDrishti"))}</dt><dd class="${p.careful ? "is-careful" : ""}">${esc(p.careful ? t("careful") : t("normalDay"))}</dd></div>
        </dl>
      </article>

      <details class="tile span-2 fold">
        <summary class="tile__title">${esc(t("gowri"))}</summary>
        <h4 class="fold__sub">${esc(t("day"))}</h4>
        <ul class="gowris">${gowriRows(p.gowriDay)}</ul>
        <h4 class="fold__sub">${esc(t("night"))}</h4>
        <ul class="gowris">${gowriRows(p.gowriNight)}</ul>
      </details>

      <details class="tile span-2 fold">
        <summary class="tile__title">${esc(t("horai"))}</summary>
        <ul class="gowris">${horaiRows}</ul>
      </details>

      <details class="tile span-2 fold">
        <summary class="tile__title">${esc(t("lagnam"))}</summary>
        <ul class="gowris">${lagnaRows}</ul>
      </details>

      <details class="tile span-2 fold">
        <summary class="tile__title">${esc(t("kaalam"))}</summary>
        <ul class="gowris">${kaalaRows}</ul>
      </details>
    </div>

    <div class="actions">
      <button class="btn" data-action="share-day">${icon("share")}${esc(t("share"))}</button>
    </div>
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
