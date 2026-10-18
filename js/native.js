// Thin wrapper over the Android bridge (window.AarushNative). In a browser the same
// calls fall back to web APIs, so the app also runs as a plain web page.

const bridge = typeof window !== "undefined" ? window.AarushNative : null;

export const isAndroid = !!bridge;

export function appInfo() {
  if (!bridge) return { platform: "web" };
  try { return JSON.parse(bridge.getInfo()); } catch (e) { return { platform: "android" }; }
}

export function takeLaunchAction() {
  if (!bridge) return "";
  try { return bridge.takeLaunchAction() || ""; } catch (e) { return ""; }
}

export function share(title, text) {
  if (bridge) { bridge.share(title, text); return Promise.resolve(true); }
  if (navigator.share) return navigator.share({ title, text }).then(() => true, () => false);
  return copyText(text);
}

export function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, () => false);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  ta.remove();
  return Promise.resolve(ok);
}

/** Print / save as PDF. The caller sets up the printable view first. */
export function printPage(jobName) {
  if (bridge) bridge.print(jobName);
  else window.print();
}

export function openUrl(url) {
  if (bridge) bridge.openUrl(url);
  else window.open(url, "_blank", "noopener");
}

// ----- Alarms -----
export function canScheduleExact() {
  if (!bridge) return false;
  try { return bridge.canScheduleExactAlarms(); } catch (e) { return false; }
}

export function requestNotificationPermission() {
  if (bridge) { bridge.requestNotificationPermission(); return; }
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}

export function openExactAlarmSettings() {
  if (bridge) bridge.openExactAlarmSettings();
}

let webTimers = [];
/**
 * Hands the full schedule to Android. In a browser, entries in the next 24 hours are
 * shown as notifications while the page stays open (best effort).
 */
export function setSchedule(entries) {
  if (bridge) {
    try { return bridge.setSchedule(JSON.stringify(entries)); } catch (e) { return false; }
  }
  webTimers.forEach(clearTimeout);
  webTimers = [];
  const now = Date.now();
  for (const e of entries) {
    const t = e.time || 0;
    if (t > now && t - now < 86400000) {
      webTimers.push(setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(e.title, { body: e.body });
        }
      }, t - now));
    }
  }
  return true;
}
