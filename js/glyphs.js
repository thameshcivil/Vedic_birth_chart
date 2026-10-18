// Small filled glyphs that mark observances in calendar cells. Drawn for this app.

const G = {
  newmoon: '<circle cx="12" cy="12" r="8.5" fill="var(--glyph-dark)"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="var(--glyph-line)" stroke-width="1"/>',
  fullmoon: '<circle cx="12" cy="12" r="8.5" fill="var(--glyph-moon)" stroke="var(--glyph-line)" stroke-width="1"/><circle cx="9" cy="10" r="1.6" fill="var(--glyph-line)" opacity=".35"/><circle cx="14.5" cy="14" r="2.1" fill="var(--glyph-line)" opacity=".28"/>',
  namam: '<path d="M7 4v8a5 5 0 0 0 10 0V4" fill="none" stroke="var(--glyph-line)" stroke-width="2.4" stroke-linecap="round"/><path d="M12 5v12" stroke="var(--glyph-red)" stroke-width="2.6" stroke-linecap="round"/><path d="M8 21h8" stroke="var(--glyph-gold)" stroke-width="2" stroke-linecap="round"/>',
  linga: '<ellipse cx="12" cy="17.5" rx="9" ry="3" fill="var(--glyph-dark)"/><path d="M8 17V9.5a4 4 0 0 1 8 0V17z" fill="var(--glyph-dark)"/><path d="M9 9.5h6M9 11h6" stroke="var(--glyph-ash)" stroke-width=".9"/><circle cx="12" cy="13.2" r=".9" fill="var(--glyph-red)"/>',
  vel: '<path d="M12 2.5c2.6 3 3.6 5.3 3.6 7.3 0 1.8-1.5 3-3.6 3s-3.6-1.2-3.6-3c0-2 1-4.3 3.6-7.3z" fill="var(--glyph-gold)" stroke="var(--glyph-line)" stroke-width=".8"/><path d="M12 12.5v9" stroke="var(--glyph-line)" stroke-width="1.6" stroke-linecap="round"/><path d="M10 14.5h4" stroke="var(--glyph-line)" stroke-width="1.4" stroke-linecap="round"/>',
  modak: '<path d="M12 3.5c1.6 2.6 6.5 7 6.5 10.5a6.5 6.5 0 0 1-13 0C5.5 10.5 10.4 6.1 12 3.5z" fill="var(--glyph-sweet)" stroke="var(--glyph-line)" stroke-width=".8"/><path d="M12 6v13M8.6 10.5 12 19l3.4-8.5" fill="none" stroke="var(--glyph-line)" stroke-width=".8" opacity=".6"/>',
  lamp: '<path d="M12 3c1.5 2 2.3 3.3 2.3 4.5a2.3 2.3 0 0 1-4.6 0C9.7 6.3 10.5 5 12 3z" fill="var(--glyph-flame)"/><path d="M3.5 12.5h17c0 3.4-3.8 6-8.5 6s-8.5-2.6-8.5-6z" fill="var(--glyph-gold)" stroke="var(--glyph-line)" stroke-width=".8"/><path d="M9 21h6" stroke="var(--glyph-line)" stroke-width="1.4" stroke-linecap="round"/>',
  lotus: '<path d="M12 4c2 2.3 3 4.8 3 7.2S13.6 16 12 17c-1.6-1-3-3.4-3-5.8S10 6.3 12 4z" fill="var(--glyph-pink)"/><path d="M3.5 10c3 .2 5.6 2 7 4.6.6 1 1 1.6 1.5 2.4-3.7.4-7.2-2-8.5-7z" fill="var(--glyph-pink)" opacity=".8"/><path d="M20.5 10c-3 .2-5.6 2-7 4.6-.6 1-1 1.6-1.5 2.4 3.7.4 7.2-2 8.5-7z" fill="var(--glyph-pink)" opacity=".8"/><path d="M5 19.5h14" stroke="var(--glyph-good)" stroke-width="1.6" stroke-linecap="round"/>',
  sun: '<circle cx="12" cy="12" r="4.6" fill="var(--glyph-flame)"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="var(--glyph-gold)" stroke-width="1.8" stroke-linecap="round"/>',
  flower: '<g fill="var(--glyph-gold)"><circle cx="12" cy="6.5" r="3.3"/><circle cx="17.2" cy="10.3" r="3.3"/><circle cx="15.2" cy="16.4" r="3.3"/><circle cx="8.8" cy="16.4" r="3.3"/><circle cx="6.8" cy="10.3" r="3.3"/></g><circle cx="12" cy="12" r="2.6" fill="var(--glyph-red)"/>',
  pot: '<path d="M8.5 8h7l-.6 2.2c2.6 1.1 4.1 3.2 4.1 5.6C19 19 16 21 12 21s-7-2-7-5.2c0-2.4 1.5-4.5 4.1-5.6z" fill="var(--glyph-copper)" stroke="var(--glyph-line)" stroke-width=".8"/><path d="M8 8h8" stroke="var(--glyph-line)" stroke-width="1.6" stroke-linecap="round"/><path d="M12 3.5c-1 1.4-1.4 2.3-1.4 3a1.4 1.4 0 0 0 2.8 0c0-.7-.4-1.6-1.4-3z" fill="var(--glyph-water)"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="var(--glyph-good)"/>'
};

const BY_ID = [
  [/amavasya|poorvedyu|ashtaka|anvashtaka/, "newmoon"],
  [/pournami|purnima/, "fullmoon"],
  [/ekadashi|dvadashi|ramanuja|hayagreeva|narasimha|vamana|koodaravalli|gokulashtami|sri_jayanthi|sri_rama|balarama|sita_navami|aadi_pooram|ranga/, "namam"],
  [/pradosham|shivarath|annabhishekam|arudhra|uma_maheswara|kaala_bhairava|aani_thiru|maasi_magam/, "linga"],
  [/sashti|krithigai_vratham|soora|thai_poosam|vaikasi_visakam|panguni_uthiram|kantha/, "vel"],
  [/chathurthi|chaturthi/, "modak"],
  [/deepavali|deepam/, "lamp"],
  [/navarathiri|durgashtami|saraswathi|vijaya_dasami|varalakshmi|aadi_|karadaiyan|gopashtami|onam|garuda|rishi|doorva/, "lotus"],
  [/sankramana|sankaranthi|puthandu|ugadi|saptami|bhogi|pongal|agni/, "sun"]
];

export function glyphFor(fests, muhurtham) {
  const ordered = [...fests.filter((f) => f.kind === "festival"), ...fests.filter((f) => f.kind === "vratham"), ...fests.filter((f) => f.kind !== "festival" && f.kind !== "vratham")];
  for (const f of ordered) {
    for (const [re, g] of BY_ID) if (re.test(f.id)) return g;
  }
  if (ordered.length) return ordered[0].kind === "tharpanam" ? "pot" : "flower";
  return muhurtham ? "star" : null;
}

export function glyph(name) {
  if (!name || !G[name]) return "";
  return `<svg class="glyph" viewBox="2 2 20 20" aria-hidden="true">${G[name]}</svg>`;
}
