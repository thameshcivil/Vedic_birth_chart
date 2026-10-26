// Vasthu tab: upcoming Vasthu days with the pooja time, the day's panchangam, the
// count from Pournami / Amavasai, and a Chandrashtamam check for the house owner's
// Chandra rasi and Surya rasi.

import { upcomingVasthu, vasthuDetails } from "../vasthu.js";
import { moonDays } from "../muhurtham.js";
import { t, solarMonthName } from "../i18n/index.js";
import { esc, todayYmd } from "../format.js";
import { ownerForm, ownerOf, dayCard, bindDayCards } from "./daycards.js";

const state = { count: 8 };

export function renderVasthu(root, app) {
  const loc = app.state.loc;
  const today = todayYmd(loc.tz);
  const owner = ownerOf();
  const cards = upcomingVasthu(today, loc, state.count).map((e) => {
    const d = vasthuDetails(e, loc, owner);
    d.moon = moonDays(d.start, loc);
    return dayCard(d, today, loc, { timeLabelKey: "poojaTime", sub: `${solarMonthName(e.rule.m)} ${e.rule.d}`, alarmLabelKey: "vasthuAlarmLabel" });
  });
  root.innerHTML = `
    <section class="vhead">
      <h2 class="vhead__title">${esc(t("vasthuTitle"))}</h2>
      <p class="vhead__intro">${esc(t("vasthuIntro"))}</p>
      ${ownerForm("ownerRasi")}
    </section>
    <div class="vlist">${cards.join("")}</div>
    <div class="actions"><button class="btn btn--ghost" data-cards-more>${esc(t("showMoreVasthu"))}</button></div>
    <p class="muted small vnote">${esc(t("vakyaNote"))}</p>`;
}

export function bindVasthu(root, app) {
  bindDayCards(root, app, () => { state.count += 8; });
}
