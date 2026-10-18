// Sankalpam screen: Shubham / Sraardham text for the selected date.

import { computePanchang } from "../panchang.js";
import { buildSankalpam, regionFromLocation, tharpanamOccasions, REGIONS } from "../sankalpam.js";
import { transliterate } from "../translit.js";
import { t, term, lang, festivalName } from "../i18n/index.js";
import { esc, fmtDate } from "../format.js";
import { getSettings, updateSettings } from "../store.js";
import { icon } from "../icons.js";

const REGION_LABEL = {
  bharat: "regionBharat", asia: "regionAsia", europe: "regionEurope", africa: "regionAfrica",
  northAmerica: "regionNorthAmerica", southAmerica: "regionSouthAmerica", australia: "regionAustralia", oceania: "regionOceania"
};

function scriptFor(choice) {
  if (choice === "devanagari") return "sa";
  if (choice === "latin") return "en";
  return lang();
}

export function sankalpamText(app) {
  const { date, loc } = app.state;
  const s = getSettings();
  const sk = s.sankalpam;
  const p = computePanchang(date, loc);
  const region = sk.region === "auto" ? regionFromLocation(loc.lat, loc.lon) : sk.region;
  const occasions = tharpanamOccasions(date, loc);
  const occ = occasions.find((o) => o.id === app.state.sankalpamOccasion) || occasions[0];
  const devanagari = buildSankalpam(p, {
    type: sk.type, calendar: s.calendar, lunar: s.lunar, name: sk.name, gothram: sk.gothram,
    salutation: sk.salutation, region, tharpanam: sk.tharpanam, occasion: occ ? occ.phrase : null
  });
  const script = scriptFor(sk.script);
  return { text: transliterate(devanagari, script), script, occasions, occ, region };
}

export function renderSankalpam(root, app) {
  const { date } = app.state;
  const sk = getSettings().sankalpam;
  const { text, script, occasions, occ, region } = sankalpamText(app);
  const isSraardham = sk.type === "sraardham";
  const htmlLang = script === "en" ? "sa-Latn" : script === "sa" || script === "hi" ? "sa" : script;

  const regionOptions = ["auto", ...REGIONS].map((r) =>
    `<option value="${r}" ${sk.region === r ? "selected" : ""}>${esc(r === "auto" ? `${t("regionAuto")} — ${t(REGION_LABEL[region])}` : t(REGION_LABEL[r]))}</option>`).join("");

  root.innerHTML = `
    <div class="datebar">
      <button class="iconbtn" data-action="prev-day" aria-label="${esc(t("prevDay"))}">${icon("chevronLeft")}</button>
      <button class="datebar__date" data-action="pick-date">
        <span class="datebar__weekday">${esc(t("sankalpamFor"))}</span>
        <span class="datebar__full">${esc(fmtDate(date))} · ${esc(term("weekday")[new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()])}</span>
      </button>
      <button class="iconbtn" data-action="next-day" aria-label="${esc(t("nextDay"))}">${icon("chevronRight")}</button>
    </div>

    <div class="segmented" role="radiogroup" aria-label="${esc(t("sankalpamType"))}">
      <button role="radio" aria-checked="${!isSraardham}" class="${!isSraardham ? "is-on" : ""}" data-sk="type" data-value="shubham">${esc(t("shubham"))}</button>
      <button role="radio" aria-checked="${isSraardham}" class="${isSraardham ? "is-on" : ""}" data-sk="type" data-value="sraardham">${esc(t("sraardham"))}</button>
    </div>

    <form class="tile form" data-form="sankalpam" onsubmit="return false">
      <div class="grid2">
        <label class="field"><span>${esc(t("personName"))}</span>
          <input type="text" data-sk="name" value="${esc(sk.name)}" autocomplete="name"></label>
        <label class="field"><span>${esc(t("gothram"))}</span>
          <input type="text" data-sk="gothram" value="${esc(sk.gothram)}"></label>
      </div>
      ${isSraardham ? `
        <div class="grid2">
          <label class="field"><span>${esc(t("tharpanamMode"))}</span>
            <select data-sk="tharpanam">
              <option value="tila" ${sk.tharpanam === "tila" ? "selected" : ""}>${esc(t("tila"))}</option>
              <option value="hiranya" ${sk.tharpanam === "hiranya" ? "selected" : ""}>${esc(t("hiranya"))}</option>
            </select></label>
          <label class="field"><span>${esc(t("occasion"))}</span>
            <select data-sk="occasion">
              ${occasions.length ? occasions.map((o) => `<option value="${o.id}" ${occ && occ.id === o.id ? "selected" : ""}>${esc(festivalName(o.id))}</option>`).join("")
                : `<option value="">${esc(t("occasionNone"))}</option>`}
            </select></label>
        </div>` : `
        <label class="field"><span>${esc(t("salutation"))}</span>
          <select data-sk="salutation">
            <option value="" ${!sk.salutation ? "selected" : ""}>${esc(t("salutationNone"))}</option>
            <option value="chi" ${sk.salutation === "chi" ? "selected" : ""}>${esc(t("salutationChi"))}</option>
            <option value="sow" ${sk.salutation === "sow" ? "selected" : ""}>${esc(t("salutationSow"))}</option>
          </select></label>`}
      <label class="field"><span>${esc(t("region"))}</span>
        <select data-sk="region">${regionOptions}</select></label>
      <div class="grid2">
        <label class="field"><span>${esc(t("script"))}</span>
          <select data-sk="script">
            <option value="native" ${sk.script === "native" ? "selected" : ""}>${esc(t("scriptNative"))}</option>
            <option value="devanagari" ${sk.script === "devanagari" ? "selected" : ""}>${esc(t("scriptDevanagari"))}</option>
            <option value="latin" ${sk.script === "latin" ? "selected" : ""}>${esc(t("scriptLatin"))}</option>
          </select></label>
      </div>
    </form>

    <article class="tile sankalpam" lang="${htmlLang}">
      ${text.split("\n").map((line) => `<p>${esc(line)}</p>`).join("")}
    </article>
    <p class="muted small">${esc(t("sankalpamNote"))}</p>

    <div class="actions">
      <button class="btn" data-action="share-sankalpam">${icon("share")}${esc(t("share"))}</button>
      <button class="btn btn--ghost" data-action="copy-sankalpam">${icon("copy")}${esc(t("copy"))}</button>
    </div>
  `;
}

export function bindSankalpamInputs(root, app) {
  root.addEventListener("input", (e) => {
    const el = e.target.closest("[data-sk]");
    if (!el || el.tagName !== "INPUT") return;
    const sk = { ...getSettings().sankalpam, [el.dataset.sk]: el.value };
    updateSettings({ sankalpam: sk });
    // Only refresh the text, so typing isn't interrupted
    const box = root.querySelector(".sankalpam");
    if (box) {
      const { text } = sankalpamText(app);
      box.innerHTML = text.split("\n").map((line) => `<p>${esc(line)}</p>`).join("");
    }
  });
  root.addEventListener("change", (e) => {
    const el = e.target.closest("select[data-sk]");
    if (!el) return;
    if (el.dataset.sk === "occasion") {
      app.state.sankalpamOccasion = el.value;
    } else {
      updateSettings({ sankalpam: { ...getSettings().sankalpam, [el.dataset.sk]: el.value } });
    }
    app.render();
  });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-sk]");
    if (!b) return;
    updateSettings({ sankalpam: { ...getSettings().sankalpam, [b.dataset.sk]: b.dataset.value } });
    app.render();
  });
}
