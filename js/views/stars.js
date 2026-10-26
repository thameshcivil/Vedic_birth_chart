// Nakshatra tab: upcoming periods of the nakshatras marked + or * in the printed
// panchangam table, with the Chandrashtamam check for the person's rasis.

import { upcomingStars, starDetails } from "../nakshatradays.js";
import { t, term, solarMonthName } from "../i18n/index.js";
import { esc, todayYmd } from "../format.js";
import { dayFacts } from "../panchang.js";
import { ownerForm, ownerOf, dayCard, bindDayCards } from "./daycards.js";

const state = { count: 15, filter: "all" };

export function renderStars(root, app) {
  const loc = app.state.loc;
  const today = todayYmd(loc.tz);
  const owner = ownerOf();
  const cards = upcomingStars(new Date(), state.count, state.filter).map((period) => {
    const d = starDetails(period, loc, owner);
    const f = dayFacts(d.ymd, loc);
    return dayCard(d, today, loc, {
      timeLabelKey: "starTime",
      sub: `${term("nakshatra")[d.index]} ${d.marks} · ${solarMonthName(f.solarMonth)} ${f.solarDay}`,
      alarmLabelKey: "starAlarmLabel", moonLabelKey: "moonDuringStar", safeKey: "vSafeP"
    });
  });
  const seg = [["all", "filterAll"], ["plus", "filterPlus"], ["star", "filterStar"]].map(([k, label]) =>
    `<button class="${state.filter === k ? "is-on" : ""}" data-star-filter="${k}" aria-pressed="${state.filter === k}">${esc(t(label))}</button>`).join("");
  root.innerHTML = `
    <section class="vhead">
      <h2 class="vhead__title">${esc(t("starTitle"))}</h2>
      <p class="vhead__intro">${esc(t("starIntro"))}</p>
      <div class="segmented segmented--small">${seg}</div>
      ${ownerForm("personRasi")}
    </section>
    <div class="vlist">${cards.join("")}</div>
    <div class="actions"><button class="btn btn--ghost" data-cards-more>${esc(t("showMore15"))}</button></div>
    <p class="muted small vnote">${esc(t("starNote"))}</p>`;
}

export function bindStars(root, app) {
  bindDayCards(root, app, () => { state.count += 15; });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-star-filter]");
    if (!b) return;
    state.filter = b.dataset.starFilter;
    state.count = 15;
    app.render();
  });
}
