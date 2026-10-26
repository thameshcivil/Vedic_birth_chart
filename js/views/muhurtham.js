// Subha Muhurtham tab: upcoming muhurtham days, each with a suggested time (the
// first good Gowri window of the day, clear of Rahu kalam, Yamagandam and Gulikai),
// the lagnam during it, the count from Pournami / Amavasai, and a Chandrashtamam
// check for the person's Chandra rasi and Surya rasi.

import { upcomingMuhurtham, muhurthamDetails } from "../muhurtham.js";
import { t, term, solarMonthName } from "../i18n/index.js";
import { esc, todayYmd } from "../format.js";
import { ownerForm, ownerOf, dayCard, bindDayCards } from "./daycards.js";

const state = { count: 10 };

export function renderMuhurtham(root, app) {
  const loc = app.state.loc;
  const today = todayYmd(loc.tz);
  const owner = ownerOf();
  const cards = upcomingMuhurtham(today, loc, state.count).map((e) => {
    const d = muhurthamDetails(e, loc, owner);
    return dayCard(d, today, loc, {
      timeLabelKey: d.usedAbhijit ? "abhijit" : "muhurthamTime",
      sub: `${solarMonthName(e.facts.solarMonth)} ${e.facts.solarDay}`,
      alarmLabelKey: "muhurthamAlarmLabel", moonLabelKey: "moonDuringM", safeKey: "vSafeP",
      extraRows: [[t("lagnam"), d.lagnas.map((i) => term("rasi")[i]).join(" → ")]]
    });
  });
  root.innerHTML = `
    <section class="vhead">
      <h2 class="vhead__title">${esc(t("muhurthamTitle"))}</h2>
      <p class="vhead__intro">${esc(t("muhurthamIntro"))}</p>
      ${ownerForm("personRasi")}
    </section>
    <div class="vlist">${cards.length ? cards.join("") : `<p class="empty">${esc(t("noEventsMonth"))}</p>`}</div>
    <div class="actions"><button class="btn btn--ghost" data-cards-more>${esc(t("showMore10"))}</button></div>
    <p class="muted small vnote">${esc(t("muhurthamNote"))}</p>`;
}

export function bindMuhurtham(root, app) {
  bindDayCards(root, app, () => { state.count += 10; });
}
