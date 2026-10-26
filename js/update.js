// Update check for the Android app. The APK is installed from GitHub, not Google
// Play, so the app itself asks GitHub for the newest build when it opens. When a
// newer build exists it shows a message in the app and a phone notification, both
// with a link that downloads the new APK (which installs over the current one).

import { t } from "./i18n/index.js";
import { esc } from "./format.js";
import { isAndroid, appInfo, openUrl } from "./native.js";

const RELEASES = "https://api.github.com/repos/thameshcivil/Vedic_birth_chart/releases?per_page=10";
const CHECK_KEY = "aarush.update.v1";
const CHECK_EVERY = 6 * 3600 * 1000;      // at most every 6 hours when opening the app
const REMIND_AFTER = 24 * 3600 * 1000;    // "Later" hides the message for a day

const readState = () => { try { return JSON.parse(localStorage.getItem(CHECK_KEY)) || {}; } catch (e) { return {}; } };
const writeState = (s) => { try { localStorage.setItem(CHECK_KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };

/** Build number of the installed APK: "1.0.13" → 13. */
function installedBuild() {
  const v = (appInfo() || {}).version || "";
  const m = /(\d+)\s*$/.exec(v);
  return m ? Number(m[1]) : 0;
}

/** Newest published build: { build, version, url, page } or null. */
async function latestRelease() {
  const res = await fetch(RELEASES, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const list = await res.json();
  let best = null;
  for (const r of list) {
    const m = /^build-(\d+)$/.exec(r.tag_name || "");
    const apk = (r.assets || []).find((a) => /\.apk$/i.test(a.name));
    if (!m || !apk || r.draft) continue;
    const build = Number(m[1]);
    if (!best || build > best.build) best = { build, version: `1.0.${build}`, url: apk.browser_download_url, page: r.html_url };
  }
  return best;
}

function showUpdate(app, latest, current) {
  app.openSheet(t("updateTitle"), `
    <div class="update">
      <p>${esc(t("updateBody", { v: latest.version, cur: current ? `1.0.${current}` : "?" }))}</p>
      <p class="muted small">${esc(t("updateHow"))}</p>
      <div class="actions">
        <button class="btn" data-update-download>${esc(t("updateDownload"))}</button>
        <button class="btn btn--ghost" data-update-later>${esc(t("updateLater"))}</button>
      </div>
    </div>`, (sheet) => {
    sheet.querySelector("[data-update-download]").addEventListener("click", () => { openUrl(latest.url); app.closeSheet(); });
    sheet.querySelector("[data-update-later]").addEventListener("click", () => {
      writeState({ ...readState(), snoozedBuild: latest.build, snoozedAt: Date.now() });
      app.closeSheet();
    });
  });
}

/**
 * Checks GitHub for a newer APK.
 * manual: true when the person tapped "Check for updates" (always checks and always answers).
 */
export async function checkForUpdate(app, manual = false) {
  if (!isAndroid && !manual) return;
  const state = readState();
  if (!manual && state.checkedAt && Date.now() - state.checkedAt < CHECK_EVERY && !state.pending) return;
  let latest;
  try {
    latest = await latestRelease();
  } catch (e) {
    if (manual) app.toast(t("updateFailed"));
    return;
  }
  const current = installedBuild();
  const newer = latest && current && latest.build > current;
  writeState({ ...state, checkedAt: Date.now(), pending: newer ? latest : null });
  if (!isAndroid) { if (manual && latest) openUrl(latest.page); return; }
  if (!newer) { if (manual) app.toast(t("upToDate")); return; }

  const snoozed = state.snoozedBuild === latest.build && Date.now() - (state.snoozedAt || 0) < REMIND_AFTER;
  if (!manual && snoozed) return;
  // Phone notification once per new build, plus the in-app message
  if (state.notifiedBuild !== latest.build && window.AarushNative && window.AarushNative.notifyUpdate) {
    try { window.AarushNative.notifyUpdate(t("updateTitle"), t("updateBody", { v: latest.version, cur: `1.0.${current}` }), latest.url); } catch (e) { /* older app */ }
    writeState({ ...readState(), notifiedBuild: latest.build });
  }
  showUpdate(app, latest, current);
}
