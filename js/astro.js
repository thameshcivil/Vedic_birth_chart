// Astronomy layer: sidereal positions, ayanamsa, rise/set, ascendant and the
// root-finding used for every "ends at" time in the panchangam.
// Relies on Astronomy Engine (js/vendor/astronomy.min.js) loaded as a global.

const A = globalThis.Astronomy;

export const DEG = Math.PI / 180;
export const DAY_MS = 86400000;
export const norm360 = (x) => ((x % 360) + 360) % 360;
export const toRad = (d) => d * DEG;
export const toDeg = (r) => r / DEG;

export const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

// ----------------------------------------------------------------------------
// Settings that change the astronomy (set from the app's settings screen)
// ----------------------------------------------------------------------------
const config = {
  ayanamsa: "lahiri", // lahiri | truechitra | kp | raman | suryasiddhanta
  node: "mean"        // mean | true  (Rahu / Ketu)
};

export function configureAstro(opts) {
  Object.assign(config, opts || {});
  clearCaches();
}
export function getAstroConfig() { return { ...config }; }

// ----------------------------------------------------------------------------
// Ayanamsa
// ----------------------------------------------------------------------------
// Mean ayanamsa at a reference epoch (Julian Day), carried forward with the IAU 2006
// general precession in longitude; nutation is added for the "true" value of date
// because the planet longitudes are referred to the true equinox of date.
// Epoch values follow the Swiss Ephemeris definitions of each mode.
const AYANAMSA_EPOCHS = {
  // Indian Calendar Reform Committee: 23°15'00.658" (true) on 21 Mar 1956, minus nutation
  lahiri: { jd: 2435553.5, ayan: 23.250182778 - 0.004658035 },
  kp: { jd: 2415020.0, ayan: 22.363889 },
  raman: { jd: 2415020.0, ayan: 21.01444 },
  suryasiddhanta: { jd: 1903396.8128654, ayan: 0 }
};

export const AYANAMSA_OPTIONS = ["lahiri", "truechitra", "kp", "raman", "suryasiddhanta"];

function generalPrecessionArcsec(T) {
  return 5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T ** 3 - 0.000023857 * T ** 4;
}

let spicaDefined = false;
function spicaTropicalLongitude(date) {
  if (!spicaDefined) {
    // Spica (alpha Virginis), J2000: RA 13h 25m 11.579s, Dec -11° 09' 40.75"
    A.DefineStar(A.Body.Star1, 13 + 25 / 60 + 11.579 / 3600, -(11 + 9 / 60 + 40.75 / 3600), 250);
    spicaDefined = true;
  }
  return A.Ecliptic(A.GeoVector(A.Body.Star1, date, true)).elon;
}

export function ayanamsa(date) {
  const time = A.MakeTime(date);
  if (config.ayanamsa === "truechitra") {
    // True Chitrapaksha: the zodiac is fixed so that Spica sits at exactly 180°
    return norm360(spicaTropicalLongitude(date) - 180);
  }
  const ep = AYANAMSA_EPOCHS[config.ayanamsa] || AYANAMSA_EPOCHS.lahiri;
  const T = time.tt / 36525;
  const T0 = (ep.jd - 2451545.0) / 36525;
  const mean = ep.ayan + (generalPrecessionArcsec(T) - generalPrecessionArcsec(T0)) / 3600;
  return mean + A.e_tilt(time).dpsi / 3600;
}

// ----------------------------------------------------------------------------
// Positions
// ----------------------------------------------------------------------------
function meanNode(date) {
  const T = A.MakeTime(date).tt / 36525;
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T ** 3 / 450000);
}

// True (osculating) node from the Moon's geocentric position and velocity
function trueNode(date) {
  const st = A.GeoMoonState(date);
  const time = A.MakeTime(date);
  const rot = A.Rotation_EQJ_ECT(time);
  const r = A.RotateVector(rot, new A.Vector(st.x, st.y, st.z, time));
  const v = A.RotateVector(rot, new A.Vector(st.vx, st.vy, st.vz, time));
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  return norm360(toDeg(Math.atan2(hx, -hy)));
}

export function tropicalLongitude(key, date) {
  switch (key) {
    case "Sun": return A.SunPosition(date).elon;
    case "Moon": return A.EclipticGeoMoon(date).lon;
    case "Rahu": return config.node === "true" ? trueNode(date) : meanNode(date);
    case "Ketu": return norm360((config.node === "true" ? trueNode(date) : meanNode(date)) + 180);
    default: return A.Ecliptic(A.GeoVector(A.Body[key], date, true)).elon;
  }
}

export function siderealLongitude(key, date) {
  return norm360(tropicalLongitude(key, date) - ayanamsa(date));
}

export function sunMoon(date) {
  const ay = ayanamsa(date);
  return {
    sun: norm360(A.SunPosition(date).elon - ay),
    moon: norm360(A.EclipticGeoMoon(date).lon - ay)
  };
}

/** Sidereal longitude and daily motion (negative = retrograde) for every graha. */
export function allPositions(date) {
  const ay = ayanamsa(date);
  const before = new Date(date.getTime() - DAY_MS / 4);
  const after = new Date(date.getTime() + DAY_MS / 4);
  return PLANETS.map((key) => {
    const lon = norm360(tropicalLongitude(key, date) - ay);
    let speed;
    if (key === "Rahu" || key === "Ketu") {
      speed = config.node === "true" ? angleDiff(tropicalLongitude(key, after), tropicalLongitude(key, before)) * 2 : -0.053;
    } else {
      speed = angleDiff(tropicalLongitude(key, after), tropicalLongitude(key, before)) * 2;
    }
    return { key, lon, speed, retro: speed < 0 && key !== "Rahu" && key !== "Ketu" };
  });
}

/** Signed smallest difference a - b in degrees, in (-180, 180] */
export function angleDiff(a, b) {
  let d = norm360(a - b);
  if (d > 180) d -= 360;
  return d;
}

// ----------------------------------------------------------------------------
// Ascendant (Lagna): the ecliptic point rising on the eastern horizon
// ----------------------------------------------------------------------------
export function ascendantTropical(date, lat, lon) {
  const time = A.MakeTime(date);
  const ramc = toRad(norm360(A.SiderealTime(time) * 15 + lon));
  const eps = toRad(A.e_tilt(time).tobl);
  const phi = toRad(lat);
  // Closed form, then pick the branch that is east of the meridian
  let asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  asc = norm360(toDeg(asc));
  // Check the hour angle: the rising point has a negative hour angle (east)
  const lam = toRad(asc);
  const alpha = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  let H = ramc - alpha;
  H = Math.atan2(Math.sin(H), Math.cos(H));
  if (H > 0) asc = norm360(asc + 180);
  return asc;
}

export function ascendantSidereal(date, lat, lon) {
  return norm360(ascendantTropical(date, lat, lon) - ayanamsa(date));
}

// ----------------------------------------------------------------------------
// Rise and set
// ----------------------------------------------------------------------------
// Sunrise / sunset follow the traditional panchangam convention: the centre of the
// Sun's disc on the true (geometric) horizon, with no allowance for refraction.
// Moonrise / moonset use the usual visible-rim convention.
export function riseSet(bodyName, lat, lon, start, direction, limitDays = 1.1) {
  const obs = new A.Observer(lat, lon, 0);
  const t = bodyName === "Sun"
    ? A.SearchAltitude(A.Body.Sun, obs, direction, start, limitDays, 0)
    : A.SearchRiseSet(A.Body[bodyName], obs, direction, start, limitDays);
  return t ? t.date : null;
}

export function newMoonsBetween(start, end) {
  const out = [];
  let t = A.SearchMoonPhase(0, start, (end - start) / DAY_MS + 1);
  while (t && t.date < end) {
    out.push(t.date);
    t = A.SearchMoonPhase(0, new Date(t.date.getTime() + DAY_MS), 40);
  }
  return out;
}

export function previousNewMoon(date) {
  const t = A.SearchMoonPhase(0, new Date(date.getTime() - 31 * DAY_MS), 32);
  let best = t ? t.date : null;
  // There can be two new moons in a 31-day window: walk forward to the last one <= date
  while (best) {
    const next = A.SearchMoonPhase(0, new Date(best.getTime() + DAY_MS), 31);
    if (next && next.date <= date) best = next.date; else break;
  }
  return best;
}

export function nextNewMoon(date) {
  const t = A.SearchMoonPhase(0, date, 32);
  return t ? t.date : null;
}

// ----------------------------------------------------------------------------
// Generic search for the moment an angle function crosses a target value.
// fn(date) -> degrees, assumed to increase (direction = +1) or decrease through the target.
// Returns the first crossing in (start, start + maxDays].
// ----------------------------------------------------------------------------
export function findAngleCrossing(fn, target, start, maxDays, stepDays) {
  let prevT = start.getTime();
  let prevV = angleDiff(fn(start), target);
  const steps = Math.ceil(maxDays / stepDays);
  for (let i = 1; i <= steps; i++) {
    const t = start.getTime() + Math.min(i * stepDays, maxDays) * DAY_MS;
    const v = angleDiff(fn(new Date(t)), target);
    if (prevV < 0 && v >= 0 && v - prevV < 180) {
      let lo = prevT, hi = t;
      for (let k = 0; k < 40 && hi - lo > 500; k++) {
        const mid = (lo + hi) / 2;
        if (angleDiff(fn(new Date(mid)), target) < 0) lo = mid; else hi = mid;
      }
      return new Date((lo + hi) / 2);
    }
    prevT = t;
    prevV = v;
  }
  return null;
}

// ----------------------------------------------------------------------------
// Sankranti (Sun entering each sidereal sign)
// ----------------------------------------------------------------------------
const sankrantiCache = new Map();

/** The moment the sidereal Sun entered its current sign, at or before `date`. */
export function sankrantiBefore(date) {
  const sun = siderealLongitude("Sun", date);
  const sign = Math.floor(sun / 30);
  const key = `${sign}:${Math.floor(date.getTime() / (20 * DAY_MS))}`;
  if (sankrantiCache.has(key)) {
    const c = sankrantiCache.get(key);
    if (c.time <= date) return c;
  }
  const degIntoSign = sun - sign * 30;
  const start = new Date(date.getTime() - (degIntoSign / 0.95 + 1.5) * DAY_MS);
  const time = findAngleCrossing((d) => siderealLongitude("Sun", d), sign * 30, start, 35, 1) || start;
  const res = { sign, time };
  sankrantiCache.set(key, res);
  return res;
}

export function nextSankranti(date) {
  const sun = siderealLongitude("Sun", date);
  const sign = (Math.floor(sun / 30) + 1) % 12;
  const time = findAngleCrossing((d) => siderealLongitude("Sun", d), sign * 30, date, 33, 1);
  return { sign, time };
}

function clearCaches() {
  sankrantiCache.clear();
}

// ----------------------------------------------------------------------------
// Time zones (IANA), without any library
// ----------------------------------------------------------------------------
const dtfCache = new Map();
function partsFormatter(tz) {
  if (!dtfCache.has(tz)) {
    dtfCache.set(tz, new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short"
    }));
  }
  return dtfCache.get(tz);
}

/** Offset of the zone from UTC, in minutes, at the given instant. */
export function tzOffsetMinutes(tz, date) {
  if (!tz || tz === "UTC") return 0;
  if (/^UTC[+-]/.test(tz)) {
    const m = tz.match(/^UTC([+-])(\d+)(?::(\d+))?$/);
    return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  }
  const p = {};
  for (const part of partsFormatter(tz).formatToParts(date)) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** Wall-clock fields of an instant in a zone. */
export function zoned(date, tz) {
  const off = tzOffsetMinutes(tz, date);
  const d = new Date(date.getTime() + off * 60000);
  return {
    year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
    hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(),
    weekday: d.getUTCDay(), offset: off
  };
}

/** The instant of a wall-clock time in a zone (handles DST by re-checking the offset). */
export function fromZoned(y, m, d, hh, mm, ss, tz) {
  const guess = Date.UTC(y, m - 1, d, hh || 0, mm || 0, ss || 0);
  let off = tzOffsetMinutes(tz, new Date(guess));
  let t = guess - off * 60000;
  const off2 = tzOffsetMinutes(tz, new Date(t));
  if (off2 !== off) t = guess - off2 * 60000;
  return new Date(t);
}

export function addDays(y, m, d, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export function weekdayOf(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
