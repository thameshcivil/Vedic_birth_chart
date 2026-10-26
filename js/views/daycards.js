// Shared pieces of the Vasthu and Subha Muhurtham tabs: the person's rasi form,
// one day card (time, verdict, Chandrashtamam checks, panchangam rows, moon-phase
// count), and the one-tap alarm.

import { t, term, tithiName } from "../i18n/index.js";
import { esc, fmtTime, fmtRange, fmtDate, ymdKey, pad2 } from "../format.js";
import { getSettings, updateSettings, getAlarms, saveAlarms, newId } from "../store.js";
import { requestNotificationPermission } from "../native.js";
import { refreshSchedule } from "../alarms.js";
import { zoned } from "../astro.js";
import { icon } from "../icons.js";

export const ownerOf = () => getSettings().vasthuOwner || { chandra: null, surya: null };
export const daysBetween = (a, b) => Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86400000);

function rasiSelect(name, value) {
  const opts = term("rasi").map((r, i) => `<option value="${i}" ${String(value) === String(i) ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<select name="${name}" data-owner-rasi><option value="" ${value == null || value === "" ? "selected" : ""}>${esc(t("notSet"))}</option>${opts}</select>`;
}

export function ownerForm(titleKey) {
  const owner = ownerOf();
  return `<form class="vowner" onsubmit="return false">
    <p class="vowner__title">${esc(t(titleKey))}</p>
    <label class="field"><span>${esc(t("chandraRasi"))}</span>${rasiSelect("chandra", owner.chandra)}</label>
    <label class="field"><span>${esc(t("suryaRasi"))}</span>${rasiSelect("surya", owner.surya)}</label>
    <p class="muted small">${esc(t("suryaNote"))}</p>
  </form>`;
}

function ownerCheck(label, hit) {
  if (hit == null) return "";
  return `<li class="vcheck ${hit ? "is-bad" : "is-good"}"><span>${esc(label)}</span><strong>${esc(hit ? t("hasAshtama") : t("noAshtama"))}</strong></li>`;
}

/** "3rd day after Pournami · Amavasai in 12 days (9 Nov)" */
export function moonDaysText(moon) {
  const name = (k) => t(k === "amavasai" ? "phaseNew" : "phaseFull");
  const parts = [];
  if (moon.last) parts.push(moon.last.days === 0 ? t("onPhase", { phase: name(moon.last.kind) }) : t("afterPhase", { phase: name(moon.last.kind), n: moon.last.days }));
  if (moon.next) parts.push(t("beforePhase", { phase: name(moon.next.kind), n: moon.next.days,
    date: fmtDate(moon.next.ymd, { day: "numeric", month: "short" }) }));
  return parts;
}

/**
 * d: details from vasthuDetails / muhurthamDetails
 * opts: { timeLabelKey, sub, extraRows, alarmLabelKey }
 */
export function dayCard(d, today, loc, opts) {
  const owner = ownerOf();
  const tz = loc.tz;
  const ref = { ref: d.ymd, sunrise: d.p.sunrise };
  const n = daysBetween(today, d.ymd);
  const when = n === 0 ? t("today") : n === 1 ? t("tomorrowLbl") : t("inDays", { n });
  const verdictKey = { safe: opts.safeKey || "vSafe", caution: "vCaution", avoid: "vAvoid", unknown: "vUnknown" }[d.verdict];
  const moonText = d.moonAtStart === d.moonAtEnd ? term("rasi")[d.moonAtStart] : `${term("rasi")[d.moonAtStart]} → ${term("rasi")[d.moonAtEnd]}`;
  const clashes = [d.clash.rahu && "clashRahu", d.clash.yama && "clashYama", d.clash.gulikai && "clashGulikai"].filter(Boolean);
  const paksha = d.tithi < 15 ? "waxingDay" : "waningDay";
  const rows = [
    [t("moonPhaseDays"), moonDaysText(d.moon).map((s) => `<span class="pline">${esc(s)}</span>`).join(""), true, "is-wide"],
    [t("tithi"), `${tithiName(d.tithi)} · ${t(paksha)}`],
    [t("nakshatram"), term("nakshatra")[d.nakshatra]],
    [t("yogam"), term("yoga")[d.yoga]],
    ...(opts.extraRows || []),
    [t(opts.moonLabelKey || "moonDuring"), moonText],
    [t("ashtamaToday"), d.ashtama.map((i) => term("rasi")[i]).join(", ")],
    [t("rahuKaalam"), fmtRange(d.p.rahuKaalam.start, d.p.rahuKaalam.end, tz, ref)],
    [t("yamagandam"), fmtRange(d.p.yamagandam.start, d.p.yamagandam.end, tz, ref)]
  ];
  return `
    <article class="vcard vcard--${d.verdict}">
      <header class="vcard__head">
        <div>
          <p class="vcard__date">${esc(fmtDate(d.ymd))}</p>
          <p class="vcard__sub">${esc(term("weekday")[d.p.weekday])} · ${esc(opts.sub)}</p>
        </div>
        <span class="vcard__when">${esc(when)}</span>
      </header>
      <div class="vcard__time">
        <span class="vcard__label">${esc(t(opts.timeLabelKey))}</span>
        <span class="vcard__clock">${esc(fmtTime(d.start, tz, { ref: d.ymd, clock: true }))} – ${esc(fmtTime(d.end, tz, { ref: d.ymd, clock: true }))}</span>
      </div>
      <p class="vcard__verdict">${esc(t(verdictKey))}</p>
      <ul class="vchecks">
        ${ownerCheck(t("forChandra", { rasi: term("rasi")[owner.chandra] }), d.chandraHit)}
        ${ownerCheck(t("forSurya", { rasi: term("rasi")[owner.surya] }), d.suryaHit)}
        ${clashes.map((k) => `<li class="vcheck is-warn"><span>${esc(t(k))}</span></li>`).join("")}
      </ul>
      <dl class="vrows">${rows.map(([k, v, html, cls]) => `<div class="${cls || ""}"><dt>${esc(k)}</dt><dd>${html ? v : esc(v)}</dd></div>`).join("")}</dl>
      <div class="vcard__actions">
        <button class="btn btn--small btn--ghost" data-action="open-day" data-ymd="${ymdKey(d.ymd)}">${icon("today")}${esc(t("panchangam"))}</button>
        <button class="btn btn--small" data-card-alarm="${+d.start}" data-alarm-label="${esc(t(opts.alarmLabelKey))}">${icon("bell")}${esc(t("setAlarm"))}</button>
      </div>
    </article>`;
}

/** Owner rasi changes, "show more" and alarm buttons for a tab root. */
export function bindDayCards(root, app, onMore) {
  root.addEventListener("change", (e) => {
    if (!e.target.matches("[data-owner-rasi]")) return;
    const form = e.target.form;
    const val = (x) => (x.value === "" ? null : Number(x.value));
    updateSettings({ vasthuOwner: { chandra: val(form.chandra), surya: val(form.surya) } });
    app.render();
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-cards-more]")) { onMore(); app.render(); return; }
    const b = e.target.closest("[data-card-alarm]");
    if (!b) return;
    const at = Number(b.dataset.cardAlarm) - 15 * 60000;
    if (at <= Date.now()) return;
    const z = zoned(new Date(at), app.state.loc.tz);
    const alarms = getAlarms();
    if (!alarms.some((a) => a.onceTime === at)) {
      alarms.push({ id: newId(), label: b.dataset.alarmLabel, anchor: "clock", hour: z.hour, minute: z.minute, offset: 0,
        repeat: "once", days: [], vibrate: true, enabled: true, onceTime: at });
      saveAlarms(alarms);
      requestNotificationPermission();
      refreshSchedule(app.state.loc);
    }
    app.toast(t("alarmAdded", { time: `${fmtDate({ year: z.year, month: z.month, day: z.day }, { day: "numeric", month: "short" })} ${pad2(z.hour)}:${pad2(z.minute)}` }));
  });
}
