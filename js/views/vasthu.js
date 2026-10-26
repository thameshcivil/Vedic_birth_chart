// Vasthu tab: upcoming Vasthu days with the pooja time, the day's panchangam, and
// a Chandrashtamam check against the house owner's Chandra rasi and Surya rasi.

import { upcomingVasthu, vasthuDetails } from "../vasthu.js";
import { t, term, tithiName, solarMonthName } from "../i18n/index.js";
import { esc, fmtTime, fmtRange, fmtDate, todayYmd, ymdKey, pad2 } from "../format.js";
import { getSettings, updateSettings, getAlarms, saveAlarms, newId } from "../store.js";
import { requestNotificationPermission } from "../native.js";
import { refreshSchedule } from "../alarms.js";
import { zoned } from "../astro.js";
import { icon } from "../icons.js";

const state = { count: 8 };

const ownerOf = () => getSettings().vasthuOwner || { chandra: null, surya: null };
const daysBetween = (a, b) => Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86400000);

function rasiSelect(name, value) {
  const opts = term("rasi").map((r, i) => `<option value="${i}" ${String(value) === String(i) ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<select name="${name}" data-vasthu-owner><option value="" ${value == null || value === "" ? "selected" : ""}>${esc(t("notSet"))}</option>${opts}</select>`;
}

function ownerCheck(label, hit) {
  if (hit == null) return "";
  return `<li class="vcheck ${hit ? "is-bad" : "is-good"}"><span>${esc(label)}</span><strong>${esc(hit ? t("hasAshtama") : t("noAshtama"))}</strong></li>`;
}

function card(d, owner, loc, today) {
  const tz = loc.tz;
  const opt = { ref: d.ymd, sunrise: d.p.sunrise };
  const n = daysBetween(today, d.ymd);
  const when = n === 0 ? t("today") : n === 1 ? t("tomorrowLbl") : t("inDays", { n });
  const verdictKey = { safe: "vSafe", caution: "vCaution", avoid: "vAvoid", unknown: "vUnknown" }[d.verdict];
  const moonText = d.moonAtStart === d.moonAtEnd
    ? term("rasi")[d.moonAtStart]
    : `${term("rasi")[d.moonAtStart]} → ${term("rasi")[d.moonAtEnd]}`;
  const clashes = [d.clash.rahu && "clashRahu", d.clash.yama && "clashYama", d.clash.gulikai && "clashGulikai"].filter(Boolean);
  const rows = [
    [t("tithi"), tithiName(d.tithi)],
    [t("nakshatram"), term("nakshatra")[d.nakshatra]],
    [t("yogam"), term("yoga")[d.yoga]],
    [t("moonDuring"), moonText],
    [t("ashtamaToday"), d.ashtama.map((i) => term("rasi")[i]).join(", ")],
    [t("rahuKaalam"), fmtRange(d.p.rahuKaalam.start, d.p.rahuKaalam.end, tz, opt)],
    [t("yamagandam"), fmtRange(d.p.yamagandam.start, d.p.yamagandam.end, tz, opt)]
  ];
  return `
    <article class="vcard vcard--${d.verdict}">
      <header class="vcard__head">
        <div>
          <p class="vcard__date">${esc(fmtDate(d.ymd))}</p>
          <p class="vcard__sub">${esc(term("weekday")[d.p.weekday])} · ${esc(solarMonthName(d.rule.m))} ${d.rule.d}</p>
        </div>
        <span class="vcard__when">${esc(when)}</span>
      </header>
      <div class="vcard__time">
        <span class="vcard__label">${esc(t("poojaTime"))}</span>
        <span class="vcard__clock">${esc(fmtTime(d.start, tz, { ref: d.ymd, clock: true }))} – ${esc(fmtTime(d.end, tz, { ref: d.ymd, clock: true }))}</span>
      </div>
      <p class="vcard__verdict">${esc(t(verdictKey))}</p>
      <ul class="vchecks">
        ${ownerCheck(t("forChandra", { rasi: term("rasi")[owner.chandra] }), d.chandraHit)}
        ${ownerCheck(t("forSurya", { rasi: term("rasi")[owner.surya] }), d.suryaHit)}
        ${clashes.map((k) => `<li class="vcheck is-warn"><span>${esc(t(k))}</span></li>`).join("")}
      </ul>
      <dl class="vrows">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="vcard__actions">
        <button class="btn btn--small btn--ghost" data-action="open-day" data-ymd="${ymdKey(d.ymd)}">${icon("today")}${esc(t("panchangam"))}</button>
        <button class="btn btn--small" data-vasthu-alarm="${+d.start}">${icon("bell")}${esc(t("setAlarm"))}</button>
      </div>
    </article>`;
}

export function renderVasthu(root, app) {
  const loc = app.state.loc;
  const owner = ownerOf();
  const today = todayYmd(loc.tz);
  const list = upcomingVasthu(today, loc, state.count).map((e) => vasthuDetails(e, loc, owner));
  root.innerHTML = `
    <section class="vhead">
      <h2 class="vhead__title">${esc(t("vasthuTitle"))}</h2>
      <p class="vhead__intro">${esc(t("vasthuIntro"))}</p>
      <form class="vowner" onsubmit="return false">
        <p class="vowner__title">${esc(t("ownerRasi"))}</p>
        <label class="field"><span>${esc(t("chandraRasi"))}</span>${rasiSelect("chandra", owner.chandra)}</label>
        <label class="field"><span>${esc(t("suryaRasi"))}</span>${rasiSelect("surya", owner.surya)}</label>
        <p class="muted small">${esc(t("suryaNote"))}</p>
      </form>
    </section>
    <div class="vlist">${list.map((d) => card(d, owner, loc, today)).join("")}</div>
    <div class="actions"><button class="btn btn--ghost" data-vasthu-more>${esc(t("showMoreVasthu"))}</button></div>
    <p class="muted small vnote">${esc(t("vakyaNote"))}</p>`;
}

export function bindVasthu(root, app) {
  root.addEventListener("change", (e) => {
    if (!e.target.matches("[data-vasthu-owner]")) return;
    const form = e.target.form;
    const val = (x) => (x.value === "" ? null : Number(x.value));
    updateSettings({ vasthuOwner: { chandra: val(form.chandra), surya: val(form.surya) } });
    app.render();
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-vasthu-more]")) { state.count += 8; app.render(); return; }
    const b = e.target.closest("[data-vasthu-alarm]");
    if (!b) return;
    const at = Number(b.dataset.vasthuAlarm) - 15 * 60000;
    if (at <= Date.now()) return;
    const z = zoned(new Date(at), app.state.loc.tz);
    const alarms = getAlarms();
    if (!alarms.some((a) => a.onceTime === at)) {
      alarms.push({ id: newId(), label: t("vasthuAlarmLabel"), anchor: "clock", hour: z.hour, minute: z.minute, offset: 0,
        repeat: "once", days: [], vibrate: true, enabled: true, onceTime: at });
      saveAlarms(alarms);
      requestNotificationPermission();
      refreshSchedule(app.state.loc);
    }
    app.toast(t("alarmAdded", { time: `${fmtDate({ year: z.year, month: z.month, day: z.day }, { day: "numeric", month: "short" })} ${pad2(z.hour)}:${pad2(z.minute)}` }));
  });
}
