// ===== Language data =====
// Each array is indexed identically across languages so lookups stay simple.
const LANG = {
  en: {
    langLabel: "English",
    rasi: ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
      "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
      "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"],
    rasiShort: ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
      "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"],
    nakshatra: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
      "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
      "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
      "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
      "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
    planets: { Sun: "Surya (Sun)", Moon: "Chandra (Moon)", Mercury: "Budha (Mercury)",
      Venus: "Shukra (Venus)", Mars: "Kuja (Mars)", Jupiter: "Guru (Jupiter)",
      Saturn: "Shani (Saturn)", Rahu: "Rahu", Ketu: "Ketu" },
    planetAbbrev: { Sun: "Su", Moon: "Mo", Mercury: "Me", Venus: "Ve", Mars: "Ma",
      Jupiter: "Ju", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" },
    ui: {
      title: "🪐 Vedic Birth Chart Generator",
      subtitle: "Enter birth details to generate the Rasi chart with Nakshatra & Pada",
      dob: "Date of Birth", tob: "Time of Birth", tz: "Timezone Offset (from UTC)",
      place: "Birth Place (city name)", placeholder: "e.g. Chennai, India",
      lookupBtn: "Find Coordinates", lat: "Latitude", lon: "Longitude",
      generateBtn: "Generate Birth Chart", chartHeading: "Rasi Chart (South Indian Style)",
      cosmicHeading: "Cosmic View",
      janmaHeading: "Janma Details (Moon-based)", tableHeading: "Planetary Positions",
      moonRasi: "Rasi (Moon Sign)", nakshatraLbl: "Nakshatra", padaLbl: "Nakshatra Pada",
      lagna: "Lagna (Ascendant)", thGraha: "Graha", thLon: "Sidereal Longitude",
      thRasi: "Rasi", thNak: "Nakshatra", thPada: "Pada",
      note: "Ayanamsa used: Lahiri (approximate). Ascendant calculated from local sidereal time.",
      lagnaTag: "Lagna", langLabel: "Language",
      tipRasi: "Currently in", tipDegree: "Degree", tipNakshatra: "Nakshatra",
      tipEnters: "Entered sign", tipExits: "Leaves sign",
      tipPower: "Power (Dignity)", tipAspects: "Aspects (Parvai)", tipAspectsNone: "none",
      tipSameHouse: "Same House", relFriend: "Friend", relEnemy: "Enemy", relNeutral: "Neutral",
      panchangaHeading: "Horoscope Summary", weekdayBlurbHeading: "About the Weekday",
      starBlurbHeading: "About the Birth Star", thidhiBlurbHeading: "About the Thidhi (Lunar Day)",
      kpHeading: "Star Lord / Sub-Lord / Sub-Sub-Lord", kpThGraha: "Graha", kpThStar: "Star Lord",
      kpThSub: "Sub-Lord", kpThSubSub: "Sub-Sub-Lord", sudarshanaHeading: "Sudarshana Chakra",
      sudarshanaHint: "Three D1 charts, each read starting from a different reference point: Lagna, Moon, and Sun",
      sudarshanaLagna: "Lagna Chart", sudarshanaMoon: "Chandra Chart", sudarshanaSun: "Surya Chart",
      myLocationHeading: "🌍 Current Sky, From Your Location",
      myLocationSubtitle: "See where the planets are right now, using your device's current location - no birth details needed.",
      useMyLocationLabel: "Use My Current Location",
      secPanchanga: "Horoscope Summary", secKp: "Star/Sub/Sub-Sub Lord", secSudarshana: "Sudarshana Chakra",
      sumName: "Name", sumSex: "Sex", sumDob: "Date of Birth", sumTob: "Time of Birth (Hr.Min.Sec)",
      sumTz: "Time Zone (Hrs.Mins)", sumPlace: "Place of Birth - Longitude & Latitude",
      sumAyanamsa: "Ayanamsa", sumBirthStarPada: "Birth Star - Pada (Quarter)",
      sumBirthRasiLord: "Birth Rasi - Rasi Lord", sumLagnaLord: "Lagna (Ascendant) - Lagna Lord",
      sumThidhi: "Thidhi (Lunar Day)", sumSunrise: "Sunrise (Hrs.Mins)", sumSunset: "Sunset (Hrs.Mins)",
      sumDinamanaHM: "Dinamana (Hrs.Mins)", sumDinamanaNazhika: "Dinamana (Nazhika.Vinazhika)",
      sumLmt: "Local Mean Time (LMT)", sumAstroDay: "Astrological Day of Birth",
      sumKalidina: "Kalidina Sankhya", sumDasaSystem: "Dasa System", sumStarLord: "Star Lord",
      sumGanamYoni: "Ganam, Yoni (Animal Symbol)", sumBirdTree: "Guardian Bird, Tree",
      sumSunRasiStar: "Rasi of Sun - Star Position", sumZodiacWestern: "Zodiac Sign (Western System)",
      sumKpMoon: "KP Star Lord / Sub-Lord (Moon)", sumStandardTime: "Standard Time",
      sumEastGreenwich: "East of Greenwich", sumEast: "East", sumWest: "West", sumNorth: "North",
      sumSouth: "South", sumMin: "Min.",
      geoLocating: "Locating you... (look for a permission popup and tap Allow)", geoFoundAt: "Showing sky for",
      geoDenied: "Location access denied. Please allow location access and try again.",
      geoUnavailable: "Location unavailable right now. Please try again.",
      geoTimeout: "Location request timed out. Please try again.",
      geoError: "Could not get your location.", geoNotSupported: "Geolocation isn't supported by this browser.",
      geoStuck: "Still waiting after 15s - check that Location is turned on for this device/app, then try again.",
      dignityExalted: "Exalted", dignityDebilitated: "Debilitated", dignityOwn: "Own Sign",
      dignityFriend: "Friend's Sign", dignityEnemy: "Enemy's Sign", dignityNeutral: "Neutral Sign",
      dashaHeading: "Dasha & Bhukti Periods", dashaHint: "Tap a period to see its Bhukti sub-periods",
      dashaCurrent: "current",
      navamsaHeading: "Navamsa Chart (D9)", editDetails: "Edit Details",
      sectionsTitle: "Jump to Section", secCosmic: "Cosmic View", secRasi: "Rasi Chart",
      secNavamsa: "Navamsa Chart", secJanma: "Janma Details", secTable: "Planetary Positions",
      secDasha: "Dasha & Bhukti", secCurrent: "Current Date & Time",
      currentHeading: "Current Date & Time", nameLabel: "Name", genderLabel: "Gender",
      genderOptNone: "Prefer not to say", genderOpt_female: "Female", genderOpt_male: "Male", genderOpt_other: "Other"
    }
  },
  ta: {
    langLabel: "தமிழ்",
    rasi: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
      "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
    rasiShort: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
      "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
    nakshatra: ["அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
      "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
      "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்",
      "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
      "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"],
    planets: { Sun: "சூரியன்", Moon: "சந்திரன்", Mercury: "புதன்",
      Venus: "சுக்கிரன்", Mars: "செவ்வாய்", Jupiter: "குரு",
      Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது" },
    planetAbbrev: { Sun: "சூ", Moon: "சந்", Mercury: "புத", Venus: "சுக்",
      Mars: "செவ்", Jupiter: "குரு", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது" },
    ui: {
      title: "🪐 ஜாதக கட்டம் (ராசி சக்கரம்)",
      subtitle: "நட்சத்திரம், ராசி மற்றும் பாதம் அறிய பிறந்த விவரங்களை உள்ளிடவும்",
      dob: "பிறந்த தேதி", tob: "பிறந்த நேரம்", tz: "நேர மண்டல வேறுபாடு (UTC அடிப்படையில்)",
      place: "பிறந்த ஊர்", placeholder: "எ.கா. சென்னை, இந்தியா",
      lookupBtn: "இடத்தை கண்டறியவும்", lat: "அட்சரேகை", lon: "தீர்க்கரேகை",
      generateBtn: "ஜாதகம் உருவாக்கு", chartHeading: "ராசி சக்கரம் (தென்னிந்திய முறை)",
      cosmicHeading: "பிரபஞ்ச காட்சி",
      janmaHeading: "ஜென்ம விவரங்கள் (சந்திரன் அடிப்படையில்)", tableHeading: "கிரக நிலைகள்",
      moonRasi: "ராசி (சந்திர ராசி)", nakshatraLbl: "நட்சத்திரம்", padaLbl: "நட்சத்திர பாதம்",
      lagna: "லக்னம்", thGraha: "கிரகம்", thLon: "நட்சத்திர தீர்க்கம்",
      thRasi: "ராசி", thNak: "நட்சத்திரம்", thPada: "பாதம்",
      note: "பயன்படுத்தப்பட்ட அயனாம்சம்: லாஹிரி (தோராயம்). லக்னம் உள்ளூர் நட்சத்திர நேரத்தில் இருந்து கணக்கிடப்பட்டது.",
      lagnaTag: "லக்னம்", langLabel: "மொழி",
      tipRasi: "தற்போது", tipDegree: "பாகை", tipNakshatra: "நட்சத்திரம்",
      tipEnters: "ராசியில் நுழைந்தது", tipExits: "ராசியை விடும் நேரம்",
      tipPower: "பலம் (அந்தஸ்து)", tipAspects: "பார்வை", tipAspectsNone: "இல்லை",
      tipSameHouse: "அதே வீடு", relFriend: "நண்பன்", relEnemy: "எதிரி", relNeutral: "சமன்",
      panchangaHeading: "ஜாதக சுருக்கம்", weekdayBlurbHeading: "கிழமை பற்றி",
      starBlurbHeading: "நட்சத்திரம் பற்றி", thidhiBlurbHeading: "திதி பற்றி",
      kpHeading: "நட்சத்திர அதிபதி / உப அதிபதி", kpThGraha: "கிரகம்", kpThStar: "நட்சத்திர அதிபதி",
      kpThSub: "உப அதிபதி", kpThSubSub: "உப-உப அதிபதி", sudarshanaHeading: "சுதர்சன சக்கரம்",
      sudarshanaHint: "லக்னம், சந்திரன், சூரியன் என மூன்று வெவ்வேறு தொடக்கப் புள்ளிகளில் இருந்து படிக்கப்படும் மூன்று D1 சக்கரங்கள்",
      sudarshanaLagna: "லக்ன சக்கரம்", sudarshanaMoon: "சந்திர சக்கரம்", sudarshanaSun: "சூரிய சக்கரம்",
      myLocationHeading: "🌍 நடப்பு வானம், உங்கள் இருப்பிடத்தில் இருந்து",
      myLocationSubtitle: "பிறந்த விவரங்கள் தேவையில்லை - உங்கள் சாதனத்தின் நடப்பு இருப்பிடத்தைப் பயன்படுத்தி இப்போது கிரகங்கள் எங்கே உள்ளன எனப் பாருங்கள்.",
      useMyLocationLabel: "எனது நடப்பு இருப்பிடத்தைப் பயன்படுத்து",
      secPanchanga: "ஜாதக சுருக்கம்", secKp: "நட்சத்திர/உப அதிபதி", secSudarshana: "சுதர்சன சக்கரம்",
      sumName: "பெயர்", sumSex: "பாலினம்", sumDob: "பிறந்த தேதி", sumTob: "பிறந்த நேரம் (மணி.நிமி.வினா)",
      sumTz: "நேர மண்டலம் (மணி.நிமி)", sumPlace: "பிறந்த இடம் - தீர்க்கரேகை & அட்சரேகை",
      sumAyanamsa: "அயனாம்சம்", sumBirthStarPada: "பிறப்பு நட்சத்திரம் - பாதம்",
      sumBirthRasiLord: "பிறப்பு ராசி - ராசி அதிபதி", sumLagnaLord: "லக்னம் - லக்ன அதிபதி",
      sumThidhi: "திதி", sumSunrise: "சூரிய உதயம் (மணி.நிமி)", sumSunset: "சூரிய அஸ்தமனம் (மணி.நிமி)",
      sumDinamanaHM: "தினமானம் (மணி.நிமி)", sumDinamanaNazhika: "தினமானம் (நாழிகை.விநாழிகை)",
      sumLmt: "உள்ளூர் சராசரி நேரம் (LMT)", sumAstroDay: "சோதிட கிழமை",
      sumKalidina: "காலதின சங்கியை", sumDasaSystem: "தசா முறை", sumStarLord: "நட்சத்திர அதிபதி",
      sumGanamYoni: "கணம், யோனி", sumBirdTree: "பறவை, மரம்",
      sumSunRasiStar: "சூரிய ராசி - நட்சத்திரம்", sumZodiacWestern: "மேற்கத்திய ராசி",
      sumKpMoon: "KP நட்சத்திர/உப அதிபதி (சந்திரன்)", sumStandardTime: "நிலையான நேரம்",
      sumEastGreenwich: "கிரீன்விச்சிலிருந்து கிழக்கு", sumEast: "கிழக்கு", sumWest: "மேற்கு", sumNorth: "வடக்கு",
      sumSouth: "தெற்கு", sumMin: "நிமி.",
      geoLocating: "உங்கள் இருப்பிடத்தைக் கண்டறிகிறது... (அனுமதி பாப்-அப் வந்தால் 'அனுமதி' அழுத்தவும்)", geoFoundAt: "வானம் காட்டப்படுகிறது",
      geoDenied: "இருப்பிட அணுகல் மறுக்கப்பட்டது. மீண்டும் அனுமதி வழங்கி முயற்சிக்கவும்.",
      geoUnavailable: "இருப்பிடம் தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
      geoTimeout: "இருப்பிடக் கோரிக்கை நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.",
      geoError: "உங்கள் இருப்பிடத்தைப் பெற முடியவில்லை.", geoNotSupported: "இந்த உலாவியில் இருப்பிடச் சேவை கிடைக்கவில்லை.",
      geoStuck: "15 வினாடிகளாகக் காத்திருக்கிறது - இந்தச் சாதனத்தில்/ஆப்பில் இருப்பிடம் (Location) இயக்கப்பட்டுள்ளதா எனச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      dignityExalted: "உச்சம்", dignityDebilitated: "நீசம்", dignityOwn: "சொந்த வீடு",
      dignityFriend: "நண்பர் வீடு", dignityEnemy: "பகைவர் வீடு", dignityNeutral: "சம வீடு",
      dashaHeading: "தசா & புத்தி காலங்கள்", dashaHint: "புத்தி காலங்களைக் காண ஒரு காலத்தைத் தொடவும்",
      dashaCurrent: "தற்போதைய",
      navamsaHeading: "நவாம்சம் (D9)", editDetails: "விவரங்களைத் திருத்து",
      sectionsTitle: "பிரிவுக்குச் செல்ல", secCosmic: "பிரபஞ்ச காட்சி", secRasi: "ராசி சக்கரம்",
      secNavamsa: "நவாம்சம்", secJanma: "ஜென்ம விவரங்கள்", secTable: "கிரக நிலைகள்",
      secDasha: "தசா & புத்தி", secCurrent: "நடப்பு தேதி & நேரம்",
      currentHeading: "நடப்பு தேதி & நேரம்", nameLabel: "பெயர்", genderLabel: "பாலினம்",
      genderOptNone: "தெரிவிக்க விரும்பவில்லை", genderOpt_female: "பெண்", genderOpt_male: "ஆண்", genderOpt_other: "மற்றவை"
    }
  }
};

let currentLang = "en";
let lastGeneratedUtcDate = null;
let lastGeneratedTzOffset = 5.5;
let lastGeneratedLat = null;
let lastGeneratedLon = null;
let lastGeneratedPlanetPositions = [];
let formEverCollapsed = false;

const PLANET_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

// mean node formula constant note: see getMeanNodeTropical() below

// Fixed South Indian chart layout: [row, col] for each rasi index (0=Mesha...11=Meena)
const CHART_LAYOUT = {
  11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
  10: [1, 0],                                3: [1, 3],
  9:  [2, 0],                                4: [2, 3],
  8:  [3, 0], 7: [3, 1], 6: [3, 2], 5: [3, 3]
};

// ===== Populate timezone dropdown =====
const tzSelect = document.getElementById("tz");
for (let m = -12; m <= 14; m++) {
  // build common half/quarter hour offsets in a simple way
}
const commonOffsets = [
  -12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4.5, -4, -3.5, -3, -2, -1, 0,
  1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14
];
commonOffsets.forEach(off => {
  const opt = document.createElement("option");
  opt.value = off;
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  opt.textContent = `UTC ${sign}${hh}:${mm.toString().padStart(2, "0")}`;
  if (off === 5.5) opt.selected = true; // default IST
  tzSelect.appendChild(opt);
});

// ===== Location lookup (OpenStreetMap Nominatim) =====
document.getElementById("lookupBtn").addEventListener("click", async () => {
  const place = document.getElementById("place").value.trim();
  const status = document.getElementById("lookupStatus");
  if (!place) {
    status.textContent = "Type a place name first.";
    return;
  }
  status.textContent = "Searching...";
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    if (data.length === 0) {
      status.textContent = "No match found. Enter latitude/longitude manually.";
      return;
    }
    document.getElementById("lat").value = parseFloat(data[0].lat).toFixed(4);
    document.getElementById("lon").value = parseFloat(data[0].lon).toFixed(4);
    status.textContent = `Found: ${data[0].display_name}`;
  } catch (err) {
    status.textContent = "Lookup failed (no internet?). Enter coordinates manually.";
  }
});

// ===== "Current Sky, From Your Location" - a standalone home-page feature that needs no
// birth details at all: uses the browser's Geolocation API + the current moment. =====
document.getElementById("useMyLocationBtn").addEventListener("click", () => {
  const btn = document.getElementById("useMyLocationBtn");
  const status = document.getElementById("myLocationStatus");
  const t = LANG[currentLang];

  if (!navigator.geolocation) {
    status.textContent = t.ui.geoNotSupported;
    return;
  }

  btn.disabled = true;
  status.textContent = t.ui.geoLocating;

  // A few browsers/WebViews have had bugs where getCurrentPosition never calls back at
  // all (e.g. if its own permission prompt gets dismissed in an unusual way). This
  // watchdog guarantees the button always re-enables and the person always gets a
  // message, even if the browser's own callbacks never fire.
  let settled = false;
  const watchdog = setTimeout(() => {
    if (settled) return;
    settled = true;
    btn.disabled = false;
    status.textContent = t.ui.geoStuck;
  }, 15000);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      btn.disabled = false;
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const now = new Date();
      const browserTzOffset = -now.getTimezoneOffset() / 60; // hours ahead of UTC

      const { planetPositions, ascSid, ascRasi } = computeChartData(now, lat, lon);
      const context = { refDate: now, tzOffset: browserTzOffset, positions: planetPositions, lat, lon };

      renderChart("myLocationChartGrid", planetPositions, ascRasi, context);
      renderCosmicChart("myLocationCosmicChart", planetPositions, ascSid, t, context);

      document.getElementById("myLocationResult").classList.remove("hidden");
      status.textContent = `${t.ui.geoFoundAt} ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
    },
    (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      btn.disabled = false;
      if (error.code === error.PERMISSION_DENIED) status.textContent = t.ui.geoDenied;
      else if (error.code === error.POSITION_UNAVAILABLE) status.textContent = t.ui.geoUnavailable;
      else if (error.code === error.TIMEOUT) status.textContent = t.ui.geoTimeout;
      else status.textContent = t.ui.geoError;
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
  );
});

// ===== Astronomy helpers =====
function toRad(d) { return (d * Math.PI) / 180; }
function toDeg(r) { return (r * 180) / Math.PI; }

function getMeanNodeTropical(date) {
  // Mean Lunar Node (Rahu) - standard astronomical formula, T = Julian centuries from J2000
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  let node = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  node = ((node % 360) + 360) % 360;
  return node;
}

function getTropicalLongitude(bodyKey, date) {
  if (bodyKey === "Sun") {
    return Astronomy.SunPosition(date).elon;
  }
  if (bodyKey === "Moon") {
    const vec = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
    return Astronomy.Ecliptic(vec).elon;
  }
  if (bodyKey === "Rahu") {
    return getMeanNodeTropical(date);
  }
  if (bodyKey === "Ketu") {
    return (getMeanNodeTropical(date) + 180) % 360;
  }
  const vec = Astronomy.GeoVector(Astronomy.Body[bodyKey], date, false);
  return Astronomy.Ecliptic(vec).elon;
}

// Lahiri (Chitra Paksha) ayanamsa - IAU precession-based formula, anchored to the
// standard J2000.0 value of 23°51'11" (23.85300 deg). This is the same approach
// used by Swiss Ephemeris and most professional Vedic astrology software, and is
// accurate to well under 1 arcsecond, far tighter than a straight-line approximation.
function getAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525; // Julian centuries from J2000.0 (TT)
  const accumulatedPrecessionArcsec =
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T * T * T -
    0.000023857 * T * T * T * T;
  return 23.85300 + accumulatedPrecessionArcsec / 3600;
}

function getSiderealLongitude(tropicalLon, ayanamsa) {
  let sid = tropicalLon - ayanamsa;
  if (sid < 0) sid += 360;
  return sid;
}

// Ascendant (Lagna) computed numerically: for each candidate ecliptic longitude
// where the horizon altitude crosses zero, we determine which one is actually
// rising (east of the meridian, i.e. negative hour angle) rather than setting.
// This avoids relying on a closed-form formula's sign convention, which is easy
// to get subtly wrong and produce the Descendant (180 deg off) instead.
function getAscendantTropical(date, lat, lon) {
  const time = Astronomy.MakeTime(date); // explicit AstroTime, so e_tilt() is always valid
  const gstHours = Astronomy.SiderealTime(time);
  let ramc = gstHours * 15 + lon; // right ascension of the midheaven, in degrees
  ramc = ((ramc % 360) + 360) % 360;

  const eps = toRad(Astronomy.e_tilt(time).tobl); // true obliquity (includes nutation)
  const phi = toRad(lat);
  const ramcRad = toRad(ramc);

  function altitudeAndHourAngle(lambdaDeg) {
    const lam = toRad(lambdaDeg);
    // Ecliptic point (beta = 0) converted to equatorial RA/Dec
    const alpha = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    const delta = Math.asin(Math.sin(eps) * Math.sin(lam));
    let H = ramcRad - alpha;
    H = Math.atan2(Math.sin(H), Math.cos(H)); // normalize to (-180, 180]
    const alt = Math.asin(Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H));
    return { alt, H };
  }

  // Scan the ecliptic for where altitude crosses zero (the horizon)
  const STEPS = 720; // half-degree resolution, refined by interpolation - accurate to well under 1 arcminute, and fast enough for smooth live dragging
  let prevLambda = 0;
  let prev = altitudeAndHourAngle(0);
  const candidates = [];
  for (let i = 1; i <= STEPS; i++) {
    const lambda = (i / STEPS) * 360;
    const cur = altitudeAndHourAngle(lambda);
    if ((prev.alt < 0 && cur.alt >= 0) || (prev.alt >= 0 && cur.alt < 0)) {
      const frac = -prev.alt / (cur.alt - prev.alt);
      const rootLambda = prevLambda + frac * (lambda - prevLambda);
      const rootInfo = altitudeAndHourAngle(rootLambda);
      candidates.push({ lambda: ((rootLambda % 360) + 360) % 360, hourAngleDeg: toDeg(rootInfo.H) });
    }
    prevLambda = lambda;
    prev = cur;
  }

  // The Ascendant is the horizon point east of the meridian: negative hour angle
  const ascCandidate = candidates.find(c => c.hourAngleDeg < 0) || candidates[0];
  return ((ascCandidate.lambda % 360) + 360) % 360;
}

function rasiIndex(sidLon) { return Math.floor(sidLon / 30); }

// Navamsa (D9): each 30-degree sign is split into nine 3°20' padas. The classical rule
// (movable signs start their navamsa from themselves, fixed signs from the 9th sign,
// dual signs from the 5th) collapses to this single formula for all twelve signs.
function navamsaIndex(sidLon) {
  const signIdx = Math.floor(sidLon / 30);
  const posInSign = sidLon % 30;
  const pada = Math.floor(posInSign / (30 / 9));
  return (signIdx * 9 + pada) % 12;
}

function nakshatraIndex(sidLon) { return Math.floor(sidLon / (360 / 27)); }
function padaIndex(sidLon) {
  const nakSpan = 360 / 27;
  const posInNak = sidLon % nakSpan;
  return Math.floor(posInNak / (nakSpan / 4)) + 1;
}

// ===== Vimshottari Dasha & Bhukti (Tasha & Buthi) =====
// The standard 120-year Vedic planetary period system, derived from the Moon's exact
// position within its birth Nakshatra. Sequence and each lord's period length (years)
// are fixed and always total 120 years across one full cycle.
const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_YEAR_DAYS = 365.25; // standard fixed-year convention used for Vimshottari calculations

// Nakshatra lords repeat the same 9-planet sequence three times across the 27 nakshatras
const NAKSHATRA_LORDS = [];
for (let i = 0; i < 27; i++) NAKSHATRA_LORDS.push(DASHA_SEQUENCE[i % 9]);

function addYears(date, years) {
  return new Date(date.getTime() + years * DASHA_YEAR_DAYS * 86400000);
}

// Computes the 9 Mahadasha (main) periods from the birth moment, each with its 9 Bhukti
// (sub-period) breakdown. The first Mahadasha - and the first Bhukti within it - are
// naturally partial, since birth falls partway through both, based on how far the Moon
// has already moved through its birth Nakshatra.
function computeVimshottariDasha(moonSidLon, birthUtcDate) {
  const nakSpan = 360 / 27;
  const nakIdx = nakshatraIndex(moonSidLon);
  const posInNak = moonSidLon % nakSpan;
  const fractionElapsed = posInNak / nakSpan;

  const startLord = NAKSHATRA_LORDS[nakIdx];
  const startIdx = DASHA_SEQUENCE.indexOf(startLord);
  const elapsedYearsIntoStartDasha = DASHA_YEARS[startLord] * fractionElapsed;

  // True start of the first (birth) Mahadasha, projected backward from birth
  const firstMahadashaTrueStart = addYears(birthUtcDate, -elapsedYearsIntoStartDasha);

  const mahadashas = [];
  let cursor = firstMahadashaTrueStart;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const fullYears = DASHA_YEARS[lord];
    const start = cursor;
    const end = addYears(start, fullYears);

    // Bhuktis within this Mahadasha follow the same 9-sequence, starting from the
    // Mahadasha's own lord, each lasting (mahadashaYears * bhuktiLordYears / 120)
    const bhuktiStartIdx = DASHA_SEQUENCE.indexOf(lord);
    const bhuktis = [];
    let bCursor = start;
    for (let j = 0; j < 9; j++) {
      const bLord = DASHA_SEQUENCE[(bhuktiStartIdx + j) % 9];
      const bYears = (fullYears * DASHA_YEARS[bLord]) / 120;
      const bStart = bCursor;
      const bEnd = addYears(bStart, bYears);
      bhuktis.push({ lord: bLord, start: bStart, end: bEnd });
      bCursor = bEnd;
    }

    mahadashas.push({ lord, start, end, bhuktis });
    cursor = end;
  }

  // Eliminate everything before birth: the first Mahadasha's true start (and however many
  // of its leading Bhuktis) fall before birth mathematically, but only the portion from
  // birth onward should actually be shown.
  const firstMd = mahadashas[0];
  let birthBhuktiIdx = firstMd.bhuktis.findIndex(b => birthUtcDate >= b.start && birthUtcDate < b.end);
  if (birthBhuktiIdx === -1) birthBhuktiIdx = 0; // safety fallback, shouldn't normally happen
  firstMd.bhuktis = firstMd.bhuktis.slice(birthBhuktiIdx);
  firstMd.bhuktis[0].start = birthUtcDate;
  firstMd.start = birthUtcDate;

  return mahadashas;
}

// ===== Graha Maitri (planetary friendship), Dignity ("Power"), and Drishti/Parvai (aspects) =====
// Classical Naisargika (natural) friendship table from Brihat Parashara Hora Shastra.
// Note this is intentionally asymmetric (e.g. Mercury treats the Moon as an enemy, but the
// Moon treats Mercury as a friend) - that asymmetry is a genuine, well-known feature of the
// classical system, not an error. Rahu/Ketu aren't covered by the classical texts (which
// only address the 7 physical grahas); the values used here follow a commonly cited modern
// convention for them.
const NATURAL_FRIENDSHIP = {
  Sun:     { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutral: ["Mercury"] },
  Moon:    { friends: ["Sun", "Mercury"], enemies: [], neutral: ["Mars", "Jupiter", "Venus", "Saturn"] },
  Mars:    { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutral: ["Venus", "Saturn"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"], neutral: ["Mars", "Jupiter", "Saturn"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutral: ["Saturn"] },
  Venus:   { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutral: ["Mars", "Jupiter"] },
  Saturn:  { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutral: ["Jupiter"] },
  Rahu:    { friends: ["Venus", "Saturn", "Mercury"], enemies: ["Sun", "Moon", "Mars"], neutral: ["Jupiter"] },
  Ketu:    { friends: ["Mars", "Venus", "Saturn"], enemies: ["Sun", "Moon"], neutral: ["Mercury", "Jupiter"] }
};

function friendshipStatus(fromKey, towardKey) {
  if (fromKey === towardKey) return null;
  const rel = NATURAL_FRIENDSHIP[fromKey];
  if (!rel) return "neutral";
  if (rel.friends.includes(towardKey)) return "friend";
  if (rel.enemies.includes(towardKey)) return "enemy";
  return "neutral";
}

// Rasi rulership (0=Mesha...11=Meena)
const RASI_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

// Exaltation sign per planet; debilitation is always the exact opposite sign
const EXALTATION_SIGN = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
const OWN_SIGNS = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11],
  Venus: [1, 6], Saturn: [9, 10], Rahu: [], Ketu: []
};

// "Power" / dignity: exalted, debilitated, own sign, or the natural-friendship status
// toward whichever planet rules the sign it currently occupies.
function getDignity(planetKey, rasiIdx) {
  if (EXALTATION_SIGN[planetKey] === rasiIdx) return "exalted";
  if ((EXALTATION_SIGN[planetKey] + 6) % 12 === rasiIdx) return "debilitated";
  if ((OWN_SIGNS[planetKey] || []).includes(rasiIdx)) return "own";
  const lord = RASI_LORDS[rasiIdx];
  return friendshipStatus(planetKey, lord) || "own";
}

// Drishti/Parvai (Vedic aspects): every planet aspects the 7th sign from itself; Mars, Jupiter
// and Saturn additionally cast special aspects onto further signs.
function getAspectedRasis(planetKey, rasiIdx) {
  const offsets = [6];
  if (planetKey === "Mars") offsets.push(3, 7);
  if (planetKey === "Jupiter") offsets.push(4, 8);
  if (planetKey === "Saturn") offsets.push(2, 9);
  return offsets.map(o => (rasiIdx + o) % 12);
}

// ===== Panchanga (Tithi, Karana, Nithya Yoga, Weekday), sunrise/sunset, and related
// classical horoscope-summary computations - all language-aware via PANCHANGA_I18N =====
const PANCHANGA_I18N = {
  en: {
    tithiNames: ["Prathama", "Dwitiya", "Thritiya", "Chaturthi", "Panchami", "Shashti",
      "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"],
    tithiPurnima: "Purnima", tithiAmavasya: "Amavasya",
    pakshaShukla: "Shukla", pakshaKrishna: "Krishna",
    karanaMovable: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"],
    karanaKimstughna: "Kimstughna", karanaShakuni: "Shakuni", karanaChatushpada: "Chatushpada", karanaNaga: "Naga",
    karanaBhadra: "Bhadra",
    yogaNames: ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
      "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
      "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
      "Brahma", "Indra", "Vaidhriti"],
    weekdayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    ganam: { Deva: "Deva", Manushya: "Manushya", Rakshasa: "Rakshasa" },
    yoni: { Horse: "Horse", Elephant: "Elephant", Sheep: "Sheep", Serpent: "Serpent", Dog: "Dog",
      Cat: "Cat", Rat: "Rat", Cow: "Cow", Buffalo: "Buffalo", Tiger: "Tiger", Deer: "Deer",
      Monkey: "Monkey", Mongoose: "Mongoose", Lion: "Lion" },
    bird: { Vulture: "Vulture", Cock: "Cock", Owl: "Owl", Dog: "Dog", Crow: "Crow", Peacock: "Peacock" },
    tree: { Kuchela: "Kuchela (Milkweed)", Amalaki: "Amalaki (Gooseberry)", Khadira: "Khadira (Acacia)",
      Devadaru: "Devadaru (Deodar)", LongMango: "Long Mango Tree", Palasha: "Palasha (Flame of Forest)",
      Udumbara: "Udumbara (Cluster Fig)", Peepal: "Peepal Tree", Banyan: "Banyan Tree",
      Mango: "Mango Tree", Jackfruit: "Jackfruit Tree", Bael: "Bael (Wood Apple)", Arjuna: "Arjuna Tree",
      Bamboo: "Bamboo", Kadamba: "Kadamba Tree", Ashoka: "Ashoka Tree", Madhuca: "Madhuca (Mahua)" },
    ordinalWords: ["", "First", "Second", "Third", "Fourth"],
    drekkanaWords: ["", "Beginning", "Middle", "End"],
    childBoy: "Boy", childGirl: "Girl", childNative: "native",
    monthNames: ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"],
    omSri: "Om Sri", pakshaSuffix: "paksha"
  },
  ta: {
    tithiNames: ["பிரதமை", "துவிதியை", "திரிதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி",
      "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி"],
    tithiPurnima: "பௌர்ணமி", tithiAmavasya: "அமாவாசை",
    pakshaShukla: "சுக்ல", pakshaKrishna: "கிருஷ்ண",
    karanaMovable: ["பவ", "பாலவ", "கௌலவ", "தைதிலை", "கரசை", "வணிசை", "விஷ்டி"],
    karanaKimstughna: "கிம்ஸ்துக்னை", karanaShakuni: "சகுனி", karanaChatushpada: "சதுஷ்பாதம்", karanaNaga: "நாகவம்",
    karanaBhadra: "பத்திரை",
    yogaNames: ["விஷ்கம்பம்", "பிரீதி", "ஆயுஷ்மான்", "சௌபாக்கியம்", "சோபனம்", "அதிகண்டம்", "சுகர்மா",
      "திருதி", "சூலம்", "கண்டம்", "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி",
      "வியதீபாதம்", "வரீயான்", "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுக்லம்",
      "பிரம்மம்", "இந்திரம்", "வைதிருதி"],
    weekdayNames: ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"],
    ganam: { Deva: "தேவ கணம்", Manushya: "மனுஷ்ய கணம்", Rakshasa: "ராட்சத கணம்" },
    yoni: { Horse: "குதிரை", Elephant: "யானை", Sheep: "ஆடு", Serpent: "பாம்பு", Dog: "நாய்",
      Cat: "பூனை", Rat: "எலி", Cow: "பசு", Buffalo: "எருமை", Tiger: "புலி", Deer: "மான்",
      Monkey: "குரங்கு", Mongoose: "கீரி", Lion: "சிங்கம்" },
    bird: { Vulture: "கழுகு", Cock: "சேவல்", Owl: "ஆந்தை", Dog: "நாய்", Crow: "காகம்", Peacock: "மயில்" },
    tree: { Kuchela: "எருக்கு", Amalaki: "நெல்லி", Khadira: "கருவேலம்",
      Devadaru: "தேவதாரு", LongMango: "நீள மாமரம்", Palasha: "புரசு",
      Udumbara: "அத்தி", Peepal: "அரசமரம்", Banyan: "ஆலமரம்",
      Mango: "மாமரம்", Jackfruit: "பலா மரம்", Bael: "வில்வம்", Arjuna: "மருதமரம்",
      Bamboo: "மூங்கில்", Kadamba: "கடம்ப மரம்", Ashoka: "அசோக மரம்", Madhuca: "இலுப்பை" },
    ordinalWords: ["", "முதல்", "இரண்டாம்", "மூன்றாம்", "நான்காம்"],
    drekkanaWords: ["", "ஆரம்ப", "மத்திய", "இறுதி"],
    childBoy: "ஆண் குழந்தை", childGirl: "பெண் குழந்தை", childNative: "குழந்தை",
    monthNames: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை",
      "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
    omSri: "ஓம் ஸ்ரீ", pakshaSuffix: "பக்ஷம்"
  }
};

function getPanchangaI18n() {
  return PANCHANGA_I18N[currentLang] || PANCHANGA_I18N.en;
}

function getTithiInfo(sunLon, moonLon) {
  const pi = getPanchangaI18n();
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  const tithiIndex = Math.floor(diff / 12); // 0-29
  const paksha = tithiIndex < 15 ? pi.pakshaShukla : pi.pakshaKrishna;
  const numberInPaksha = (tithiIndex % 15) + 1; // 1-15
  const name = numberInPaksha === 15
    ? (tithiIndex < 15 ? pi.tithiPurnima : pi.tithiAmavasya)
    : pi.tithiNames[numberInPaksha - 1];
  return { name, paksha, numberInPaksha, isShukla: tithiIndex < 15 };
}

// The 7 "movable" karanas repeat through the lunar month; Kimstughna, Shakuni,
// Chatushpada and Naga are fixed, occurring only once each per month.
function getKaranaInfo(sunLon, moonLon) {
  const pi = getPanchangaI18n();
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  const karanaIndex = Math.floor(diff / 6); // 0-59
  let name, isVishti = false;
  if (karanaIndex === 0) name = pi.karanaKimstughna;
  else if (karanaIndex >= 57) name = [pi.karanaShakuni, pi.karanaChatushpada, pi.karanaNaga][karanaIndex - 57];
  else {
    const techIndex = (karanaIndex - 1) % 7;
    isVishti = techIndex === 6; // Vishti is the 7th movable karana
    name = isVishti ? pi.karanaBhadra : pi.karanaMovable[techIndex];
  }
  return { name, isVishti };
}

function getYogaInfo(sunSidLon, moonSidLon) {
  // Note: unlike Tithi/Karana (which use the Sun-Moon difference, so ayanamsa cancels out),
  // Nithya Yoga uses the SUM of sidereal longitudes, so sidereal (not tropical) values matter here.
  const pi = getPanchangaI18n();
  const sum = (sunSidLon + moonSidLon) % 360;
  const yogaIndex = Math.floor(sum / (360 / 27));
  return { name: pi.yogaNames[yogaIndex] };
}

const WEEKDAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// Sunrise/sunset for the given local calendar date at this location. Searches from local
// midnight so it reliably returns that specific day's sunrise/sunset regardless of birth time.
function getSunriseSunset(yyyy, mm, dd, tzOffset, lat, lon) {
  const localMidnightUtc = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0) - tzOffset * 3600000);
  const observer = new Astronomy.Observer(lat, lon, 0);
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, localMidnightUtc, 1.2);
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, localMidnightUtc, 1.2);
  return {
    sunrise: sunrise ? sunrise.date : null,
    sunset: sunset ? sunset.date : null
  };
}

// Nazhika/Vinazhika: the traditional Indian time units where a full day = 60 Nazhika,
// 1 Nazhika = 24 minutes = 60 Vinazhika (so 1 Vinazhika = 24 seconds).
function toNazhikaVinazhika(elapsedMs) {
  const totalSeconds = elapsedMs / 1000;
  const nazhika = Math.floor(totalSeconds / 1440);
  const remainderSeconds = totalSeconds - nazhika * 1440;
  const vinazhika = Math.floor(remainderSeconds / 24);
  return { nazhika, vinazhika };
}

// Kalidina Sankhya: elapsed days since the start of Kali Yuga (18 Feb 3102 BCE, proleptic
// Julian calendar), a standard reference point used throughout traditional Panchanga.
const KALI_YUGA_EPOCH_JD = 588465.5;
function getKalidinaSankhya(utcDate) {
  const time = Astronomy.MakeTime(utcDate);
  const jd = time.ut + 2451545.0; // UT Julian Date (J2000 epoch reference)
  return Math.floor(jd - KALI_YUGA_EPOCH_JD);
}

// Classical per-Nakshatra reference data (Ganam, Yoni/animal, guardian bird, associated tree).
// These index arrays hold canonical (language-neutral) keys; getPanchangaI18n() supplies the
// localized display word for each key via .ganam / .yoni / .bird / .tree.
const NAKSHATRA_GANAM = ["Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva",
  "Rakshasa", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Deva", "Deva", "Rakshasa",
  "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa", "Deva",
  "Manushya", "Deva"];
const NAKSHATRA_YONI = ["Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep",
  "Cat", "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer", "Dog",
  "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant"];
const NAKSHATRA_BIRD = ["Vulture", "Vulture", "Cock", "Owl", "Owl", "Dog", "Crow", "Crow", "Crow",
  "Cock", "Cock", "Cock", "Dog", "Dog", "Peacock", "Peacock", "Cock", "Cock", "Cock", "Vulture",
  "Vulture", "Vulture", "Peacock", "Owl", "Owl", "Cock", "Crow"];
const NAKSHATRA_TREE = ["Kuchela", "Amalaki", "Khadira", "Devadaru", "Khadira", "LongMango", "Palasha",
  "Udumbara", "Peepal", "Banyan", "Palasha", "Peepal", "Mango", "Jackfruit", "Bael", "Arjuna",
  "Bamboo", "Kadamba", "Kadamba", "Ashoka", "Jackfruit", "Mango", "Madhuca", "Kadamba", "Mango",
  "Kadamba", "Mango"];
const WESTERN_ZODIAC_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra",
  "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// ===== KP-style Star Lord / Sub-Lord / Sub-Sub-Lord =====
// Each Nakshatra's 13°20' span is divided into 9 unequal parts proportional to the Vimshottari
// years (the same proportions used for the Dasha/Bhukti timeline, applied here spatially
// instead of temporally), starting from that Nakshatra's own lord. The Sub-Lord's own portion
// is further subdivided the same way to get the Sub-Sub-Lord.
function getKPLords(sidLon) {
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(sidLon / nakSpan);
  const posInNak = sidLon % nakSpan;
  const starLord = NAKSHATRA_LORDS[nakIdx];

  function subdivide(startLord, width, pos) {
    const startIdx = DASHA_SEQUENCE.indexOf(startLord);
    let cursor = 0;
    for (let j = 0; j < 9; j++) {
      const lord = DASHA_SEQUENCE[(startIdx + j) % 9];
      const segWidth = width * (DASHA_YEARS[lord] / 120);
      if (pos < cursor + segWidth || j === 8) {
        return { lord, segStart: cursor, segWidth };
      }
      cursor += segWidth;
    }
  }

  const sub = subdivide(starLord, nakSpan, posInNak);
  const subSub = subdivide(sub.lord, sub.segWidth, posInNak - sub.segStart);

  return { starLord, subLord: sub.lord, subSubLord: subSub.lord };
}


const PLANET_VISUALS = {
  Sun:     { color: "#ffd452", glow: 3.0, r: 10 },
  Moon:    { color: "#eef1fb", glow: 2.0, r: 8.5 },
  Mercury: { color: "#b9b2a6", glow: 1.0, r: 5 },
  Venus:   { color: "#fff6da", glow: 2.6, r: 8 },
  Mars:    { color: "#e35d3a", glow: 1.6, r: 6 },
  Jupiter: { color: "#e3ab73", glow: 2.0, r: 9.5 },
  Saturn:  { color: "#e0c98a", glow: 1.6, r: 8.5, ring: true },
  Rahu:    { color: "#8f7fc9", glow: 0.6, r: 6, shadow: true },
  Ketu:    { color: "#a97b63", glow: 0.6, r: 6, shadow: true }
};

// ===== Sign ingress/egress: find when a planet entered and will leave its current Rasi =====
// Search step size and range are tuned per planet's typical speed through a 30-degree sign.
const SIGN_SEARCH_PARAMS = {
  Sun:     { stepDays: 1,  maxSteps: 40 },
  Moon:    { stepDays: 0.1, maxSteps: 40 },
  Mercury: { stepDays: 1,  maxSteps: 100 },
  Venus:   { stepDays: 1,  maxSteps: 200 },
  Mars:    { stepDays: 2,  maxSteps: 200 },
  Jupiter: { stepDays: 6,  maxSteps: 220 },
  Saturn:  { stepDays: 12, maxSteps: 220 },
  Rahu:    { stepDays: 12, maxSteps: 220 },
  Ketu:    { stepDays: 12, maxSteps: 220 }
};

function siderealLongitudeAt(planetKey, date) {
  const trop = getTropicalLongitude(planetKey, date);
  const ayan = getAyanamsa(date);
  return getSiderealLongitude(trop, ayan);
}

function siderealAscendantAt(date, lat, lon) {
  const trop = getAscendantTropical(date, lat, lon);
  const ayan = getAyanamsa(date);
  return getSiderealLongitude(trop, ayan);
}

function positionWithinSign(sidLon, signStart) {
  return ((sidLon - signStart) % 360 + 360) % 360; // 0..360; "inside the sign" if < 30
}

// Generic search: finds the moment (before or after fromDate) when longitudeFn crosses out of
// the sign it currently occupies. direction: -1 = search into the past (sign entry), +1 = future (exit).
function findBoundaryCrossingGeneric(longitudeFn, signStart, fromDate, direction, stepDays, maxSteps) {
  let prevDate = fromDate;
  for (let i = 1; i <= maxSteps; i++) {
    const curDate = new Date(fromDate.getTime() + direction * i * stepDays * 86400000);
    const curPos = positionWithinSign(longitudeFn(curDate), signStart);
    if (curPos >= 30) {
      // bracket found between prevDate (inside sign) and curDate (outside) - bisect for the exact moment
      let lo = direction < 0 ? curDate : prevDate;
      let hi = direction < 0 ? prevDate : curDate;
      const loInsideRef = positionWithinSign(longitudeFn(lo), signStart) < 30;
      for (let b = 0; b < 30; b++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midInside = positionWithinSign(longitudeFn(mid), signStart) < 30;
        if (midInside === loInsideRef) lo = mid; else hi = mid;
      }
      return new Date((lo.getTime() + hi.getTime()) / 2);
    }
    prevDate = curDate;
  }
  return null; // not found within the search window (shouldn't normally happen)
}

// Finds the moment (before or after fromDate) when a planet crosses out of the sign it
// currently occupies. direction: -1 to search into the past (sign entry), +1 for the future (sign exit).
function findSignBoundaryCrossing(planetKey, signStart, fromDate, direction) {
  const params = SIGN_SEARCH_PARAMS[planetKey] || { stepDays: 2, maxSteps: 200 };
  return findBoundaryCrossingGeneric(
    (d) => siderealLongitudeAt(planetKey, d),
    signStart, fromDate, direction, params.stepDays, params.maxSteps
  );
}

// Same idea, but for the Ascendant - which moves roughly 1 degree every 4 minutes (a full
// sign in about 2 hours on average), so it needs much finer, faster search parameters.
function findAscendantBoundaryCrossing(signStart, fromDate, direction, lat, lon) {
  return findBoundaryCrossingGeneric(
    (d) => siderealAscendantAt(d, lat, lon),
    signStart, fromDate, direction, 0.04, 60 // ~1hr steps, searches up to ~2.4 days either way
  );
}

function formatLocalDateTime(utcDate, tzOffsetHours) {
  if (!utcDate) return "—";
  const local = new Date(utcDate.getTime() + tzOffsetHours * 3600000);
  const hh24 = local.getUTCHours();
  let hh12 = hh24 % 12;
  if (hh12 === 0) hh12 = 12;
  const ampm = hh24 < 12 ? "AM" : "PM";
  return `${local.getUTCDate()} ${MONTH_ABBR[local.getUTCMonth()]} ${local.getUTCFullYear()}, ${pad2(hh12)}:${pad2(local.getUTCMinutes())} ${ampm}`;
}

// Builds the rich hover tooltip HTML for a planet: current rasi, exact degree, and when it
// enters/exits that rasi. Computed lazily on hover (not for every planet up front) to keep
// chart generation and slider-dragging fast.
const DIGNITY_LABEL_KEY = {
  exalted: "dignityExalted", debilitated: "dignityDebilitated", own: "dignityOwn",
  friend: "dignityFriend", enemy: "dignityEnemy", neutral: "dignityNeutral"
};

function buildPlanetTooltipHtml(p, refUtcDate, tzOffsetHours, t, allPositions) {
  if (!p._tooltipCache) {
    const signStart = p.rasiIdx * 30;
    const entry = findSignBoundaryCrossing(p.key, signStart, refUtcDate, -1);
    const exit = findSignBoundaryCrossing(p.key, signStart, refUtcDate, 1);
    p._tooltipCache = { entry, exit };
  }
  const { entry, exit } = p._tooltipCache;
  const degreeStr = degToDMS(p.sidLon % 30);

  const dignity = getDignity(p.key, p.rasiIdx);
  const dignityLabel = t.ui[DIGNITY_LABEL_KEY[dignity]];

  const positions = allPositions || lastGeneratedPlanetPositions;

  const aspectedRasis = getAspectedRasis(p.key, p.rasiIdx);
  const aspectedPlanets = positions
    .filter(other => other.key !== p.key && aspectedRasis.includes(other.rasiIdx))
    .map(other => other.abbrev);
  const aspectsText = aspectedPlanets.length ? aspectedPlanets.join(", ") : t.ui.tipAspectsNone;

  // Same-house companions, shown with the natural-friendship relationship between the
  // hovered planet and each one (e.g. "Guru (Friend)") rather than just their names.
  const REL_LABEL_KEY = { friend: "relFriend", enemy: "relEnemy", neutral: "relNeutral" };
  const sameHouse = positions
    .filter(other => other.key !== p.key && other.rasiIdx === p.rasiIdx)
    .map(other => {
      const rel = friendshipStatus(p.key, other.key) || "neutral";
      return `${other.abbrev} (${t.ui[REL_LABEL_KEY[rel]]})`;
    });
  const sameHouseText = sameHouse.length ? sameHouse.join(", ") : t.ui.tipAspectsNone;

  return `
    <div class="ptip-title">${p.label}</div>
    <div class="ptip-row"><span>${t.ui.tipRasi}</span><b>${t.rasi[p.rasiIdx]}</b></div>
    <div class="ptip-row"><span>${t.ui.tipDegree}</span><b>${degreeStr}</b></div>
    <div class="ptip-row"><span>${t.ui.tipNakshatra}</span><b>${t.nakshatra[p.nakIdx]} (${p.pada})</b></div>
    <div class="ptip-row"><span>${t.ui.tipPower}</span><b>${dignityLabel}</b></div>
    <div class="ptip-row"><span>${t.ui.tipSameHouse}</span><b>${sameHouseText}</b></div>
    <div class="ptip-row"><span>${t.ui.tipAspects}</span><b>${aspectsText}</b></div>
    <div class="ptip-row"><span>${t.ui.tipEnters}</span><b>${formatLocalDateTime(entry, tzOffsetHours)}</b></div>
    <div class="ptip-row"><span>${t.ui.tipExits}</span><b>${formatLocalDateTime(exit, tzOffsetHours)}</b></div>
  `;
}

// Cache for the Ascendant's own entry/exit lookup, keyed by the rasi it currently occupies
// so it's recomputed whenever a new chart is generated.
let _ascTooltipCache = null;

function buildLagnaTooltipHtml(ascSidDeg, refUtcDate, tzOffsetHours, lat, lon, t) {
  const ascRasiIdx = rasiIndex(ascSidDeg);
  const ascNakIdx = nakshatraIndex(ascSidDeg);
  const ascPada = padaIndex(ascSidDeg);
  const signStart = ascRasiIdx * 30;

  if (!_ascTooltipCache || _ascTooltipCache.signStart !== signStart || _ascTooltipCache.refTime !== refUtcDate.getTime()) {
    const entry = findAscendantBoundaryCrossing(signStart, refUtcDate, -1, lat, lon);
    const exit = findAscendantBoundaryCrossing(signStart, refUtcDate, 1, lat, lon);
    _ascTooltipCache = { signStart, refTime: refUtcDate.getTime(), entry, exit };
  }
  const { entry, exit } = _ascTooltipCache;
  const degreeStr = degToDMS(ascSidDeg % 30);
  return `
    <div class="ptip-title">${t.ui.lagnaTag}</div>
    <div class="ptip-row"><span>${t.ui.tipRasi}</span><b>${t.rasi[ascRasiIdx]}</b></div>
    <div class="ptip-row"><span>${t.ui.tipDegree}</span><b>${degreeStr}</b></div>
    <div class="ptip-row"><span>${t.ui.tipNakshatra}</span><b>${t.nakshatra[ascNakIdx]} (${ascPada})</b></div>
    <div class="ptip-row"><span>${t.ui.tipEnters}</span><b>${formatLocalDateTime(entry, tzOffsetHours)}</b></div>
    <div class="ptip-row"><span>${t.ui.tipExits}</span><b>${formatLocalDateTime(exit, tzOffsetHours)}</b></div>
  `;
}

// Shared tooltip element + show/move/hide helpers, used by both the grid chart and Cosmic View
function getTooltipEl() { return document.getElementById("planetTooltip"); }

function showPlanetTooltip(html, clientX, clientY) {
  const el = getTooltipEl();
  if (!el) return;
  el.innerHTML = html;
  el.classList.add("visible");
  positionPlanetTooltip(clientX, clientY);
}

function positionPlanetTooltip(clientX, clientY) {
  const el = getTooltipEl();
  if (!el) return;
  const margin = 14;
  let left = clientX + margin;
  let top = clientY + margin;
  const rect = el.getBoundingClientRect();
  if (left + rect.width > window.innerWidth - 8) left = clientX - rect.width - margin;
  if (top + rect.height > window.innerHeight - 8) top = clientY - rect.height - margin;
  el.style.left = Math.max(8, left) + "px";
  el.style.top = Math.max(8, top) + "px";
}

function hidePlanetTooltip() {
  const el = getTooltipEl();
  if (el) el.classList.remove("visible");
}

// Attaches hover/tap tooltip behavior to an element for a given planet's data.
// context (optional) lets a caller supply a different reference date/timezone/planet-list
// than the birth chart's - used by the Current Date & Time section.
function attachPlanetTooltip(el, planet, context) {
  el.addEventListener("mouseenter", (e) => {
    const t = LANG[currentLang];
    const refDate = (context && context.refDate) || lastGeneratedUtcDate;
    const tzOffset = (context && context.tzOffset) != null ? context.tzOffset : lastGeneratedTzOffset;
    const positions = (context && context.positions) || lastGeneratedPlanetPositions;
    const html = buildPlanetTooltipHtml(planet, refDate, tzOffset, t, positions);
    showPlanetTooltip(html, e.clientX, e.clientY);
  });
  el.addEventListener("mousemove", (e) => positionPlanetTooltip(e.clientX, e.clientY));
  el.addEventListener("mouseleave", hidePlanetTooltip);
}

// Parvai (Drishti/aspect) visuals: while hovering a planet, highlight the rasi boxes
// it aspects, and mark the planet's own box as the aspect source.
function attachAspectVisual(el, planet, gridEl) {
  el.addEventListener("mouseenter", () => {
    const sourceCell = gridEl.querySelector(`.chart-cell[data-rasi="${planet.rasiIdx}"]`);
    if (sourceCell) sourceCell.classList.add("aspect-source");
    getAspectedRasis(planet.key, planet.rasiIdx).forEach(r => {
      const cell = gridEl.querySelector(`.chart-cell[data-rasi="${r}"]`);
      if (cell) cell.classList.add("aspect-target");
    });
  });
  el.addEventListener("mouseleave", () => {
    gridEl.querySelectorAll(".aspect-source, .aspect-target").forEach(c => {
      c.classList.remove("aspect-source", "aspect-target");
    });
  });
}

// Same idea, specifically for the Ascendant (Lagna) marker/line in the Cosmic View
function attachLagnaTooltip(el, ascSidDeg, context) {
  el.addEventListener("mouseenter", (e) => {
    const t = LANG[currentLang];
    const refDate = (context && context.refDate) || lastGeneratedUtcDate;
    const tzOffset = (context && context.tzOffset) != null ? context.tzOffset : lastGeneratedTzOffset;
    const lat = (context && context.lat) != null ? context.lat : lastGeneratedLat;
    const lon = (context && context.lon) != null ? context.lon : lastGeneratedLon;
    const html = buildLagnaTooltipHtml(ascSidDeg, refDate, tzOffset, lat, lon, t);
    showPlanetTooltip(html, e.clientX, e.clientY);
  });
  el.addEventListener("mousemove", (e) => positionPlanetTooltip(e.clientX, e.clientY));
  el.addEventListener("mouseleave", hidePlanetTooltip);
}

// ===== Chart rendering =====
// containerId lets this same function draw both the Rasi (D1) and Navamsa (D9) charts.
// simpleTooltip skips the rich entry/exit-time tooltip (which is computed against the
// real D1 ephemeris and wouldn't be meaningful for a divisional chart) in favor of a
// plain name + sign tooltip.
// tooltipMode: undefined -> rich tooltip using birth-chart context (default);
// "simple" -> lightweight name+rasi title only (used for Navamsa, where the rich
// entry/exit-time lookup wouldn't be meaningful for a divisional chart);
// an object {refDate, tzOffset, positions} -> rich tooltip using that custom context
// (used by the Current Date & Time section, which has its own reference date).
function renderChart(containerId, planetPositions, ascRasi, tooltipMode) {
  const t = LANG[currentLang];
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";

  const isSimple = tooltipMode === "simple";
  const context = (tooltipMode && typeof tooltipMode === "object") ? tooltipMode : null;

  // group planets by rasi
  const byRasi = {};
  planetPositions.forEach(p => {
    if (!byRasi[p.rasiIdx]) byRasi[p.rasiIdx] = [];
    byRasi[p.rasiIdx].push(p);
  });

  for (let r = 0; r < 12; r++) {
    const [row, col] = CHART_LAYOUT[r];
    const cell = document.createElement("div");
    cell.className = "chart-cell";
    cell.dataset.rasi = r;
    cell.style.gridRow = row + 1;
    cell.style.gridColumn = col + 1;
    if (r === ascRasi) cell.classList.add("lagna-cell");

    const nameEl = document.createElement("div");
    nameEl.className = "rasi-name";
    nameEl.textContent = t.rasiShort[r] + (r === ascRasi ? ` (${t.ui.lagnaTag})` : "");
    cell.appendChild(nameEl);

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "planet-tags";
    (byRasi[r] || []).forEach(p => {
      const tag = document.createElement("div");
      tag.className = "planet-tag";
      tag.textContent = p.abbrev;
      if (isSimple) {
        tag.title = `${p.label} — ${t.rasi[r]}`;
      } else {
        attachPlanetTooltip(tag, p, context); // rich hover details: rasi, degree, sign entry/exit times
        attachAspectVisual(tag, p, grid); // highlight the rasi boxes this planet aspects (Parvai)
      }
      tagsWrap.appendChild(tag);
    });
    cell.appendChild(tagsWrap);

    grid.appendChild(cell);
  }

  // center info cell
  const center = document.createElement("div");
  center.className = "chart-cell center";
  center.style.gridRow = "2 / span 2";
  center.style.gridColumn = "2 / span 2";
  center.innerHTML = `<div>${t.ui.lagnaTag}:<br><b>${t.rasiShort[ascRasi]}</b></div>`;
  grid.appendChild(center);
}

// ===== Cosmic View: a circular starfield chart with planets placed by sidereal degree =====
// Deterministic pseudo-random generator so the starfield looks the same on every render
// instead of jumping around each time the chart regenerates.
function cosmicSeededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s % 10000) / 10000;
  };
}

// Measures actual rendered text width via canvas, so label pills fit correctly
// regardless of script (Tamil glyphs, for example, render wider than a plain
// character-count estimate would assume).
let _measureCanvasCtx = null;
let _measureCanvasFailed = false;
function measureTextWidth(text, fontSize, weight) {
  if (!_measureCanvasFailed) {
    try {
      if (!_measureCanvasCtx) {
        const canvas = document.createElement("canvas");
        _measureCanvasCtx = canvas.getContext("2d");
        if (!_measureCanvasCtx) _measureCanvasFailed = true;
      }
      if (_measureCanvasCtx) {
        _measureCanvasCtx.font = `${weight || 600} ${fontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        return _measureCanvasCtx.measureText(text).width;
      }
    } catch (e) {
      _measureCanvasFailed = true;
    }
  }
  // Fallback if canvas measurement isn't available: a generous per-character estimate
  return text.length * fontSize * 0.85;
}

function renderCosmicChart(containerId, planetPositions, ascSidDeg, t, tooltipMode) {
  const container = document.getElementById(containerId);
  const size = 500;
  const cx = size / 2, cy = size / 2;
  // Geometry sized with generous margin so nothing (labels included) gets clipped by the
  // circular card edge - everything stays well inside the 250-unit half-width.
  const ringOuter = 188, ringInner = 148, planetBaseR = 100;

  // Convert a sidereal ecliptic degree to a canvas angle: 0 deg (Mesha start) at the top,
  // increasing clockwise around the circle.
  function angleFor(deg) {
    return toRad(deg - 90);
  }
  function pointAt(deg, r) {
    const a = angleFor(deg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }
  // A small rounded rect behind text so labels stay legible over rings/stars/other labels.
  // Width is based on real measured text width (not a character-count guess), so labels
  // in any language/script - Tamil included - never overflow their background pill.
  function labelPill(x, y, text, fontSize, fill, weight) {
    const measured = measureTextWidth(text, fontSize, weight);
    const w = Math.max(18, measured + 12);
    const h = fontSize + 8;
    return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="#05060f" opacity="0.72"/>` +
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${fill}" font-size="${fontSize}" font-weight="${weight || 600}" text-anchor="middle" dominant-baseline="middle">${esc(text)}</text>`;
  }

  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>
    <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bfe6ff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#8fd3ff" stop-opacity="0"/>
    </radialGradient>`;
  // A dedicated soft-glow filter per planet, tuned to its brightness
  Object.keys(PLANET_VISUALS).forEach(key => {
    const v = PLANET_VISUALS[key];
    svg += `<filter id="glow_${key}" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="${v.glow}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  });
  svg += `</defs>`;

  // Starfield background - deterministic so it doesn't flicker/reshuffle on every regenerate
  const rand = cosmicSeededRandom(42);
  svg += `<g class="cosmic-stars">`;
  for (let i = 0; i < 110; i++) {
    const sx = rand() * size;
    const sy = rand() * size;
    const r = 0.4 + rand() * 1.1;
    const delay = (rand() * 3).toFixed(2);
    svg += `<circle class="cosmic-star" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${r.toFixed(2)}" fill="#ffffff" style="animation-delay:${delay}s"/>`;
  }
  svg += `</g>`;

  // Outer zodiac ring with 12 rasi divisions
  svg += `<circle cx="${cx}" cy="${cy}" r="${ringOuter}" fill="none" stroke="#4a4f7a" stroke-width="1.5" opacity="0.8"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${ringInner}" fill="none" stroke="#3a3f66" stroke-width="1" opacity="0.6"/>`;

  for (let r = 0; r < 12; r++) {
    const deg = r * 30;
    const p1 = pointAt(deg, ringInner);
    const p2 = pointAt(deg, ringOuter);
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#4a4f7a" stroke-width="1" opacity="0.7"/>`;

    const labelPt = pointAt(deg + 15, ringOuter + 14);
    svg += labelPill(labelPt.x, labelPt.y, t.rasiShort[r], 11, "#d6daf5");
  }

  // Fine nakshatra ticks (27 divisions) for a bit of extra texture
  for (let n = 0; n < 27; n++) {
    const deg = n * (360 / 27);
    const p1 = pointAt(deg, ringInner);
    const p2 = pointAt(deg, ringInner + 10);
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#5a5f8a" stroke-width="0.6" opacity="0.5"/>`;
  }

  // Ascendant (Lagna) line - drawn across the full circle to mark the horizon axis.
  // Wrapped in its own hoverable group, with a wide invisible stroke as the hit-area
  // (the visible dashed line is too thin to hover reliably on its own).
  const ascOuter = pointAt(ascSidDeg, ringOuter + 20);
  const ascInner = pointAt(ascSidDeg + 180, ringOuter + 20);
  svg += `<g class="cosmic-asc" data-asc="1">`;
  svg += `<line x1="${ascInner.x.toFixed(1)}" y1="${ascInner.y.toFixed(1)}" x2="${ascOuter.x.toFixed(1)}" y2="${ascOuter.y.toFixed(1)}" stroke="transparent" stroke-width="16"/>`;
  svg += `<line x1="${ascInner.x.toFixed(1)}" y1="${ascInner.y.toFixed(1)}" x2="${ascOuter.x.toFixed(1)}" y2="${ascOuter.y.toFixed(1)}" stroke="#f4c95d" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.85"/>`;
  // Placed further out than the rasi labels (ringOuter+14) so the two never overlap,
  // even when the Ascendant falls in the middle of a sign right where its label sits.
  const ascLabelPt = pointAt(ascSidDeg, ringOuter + 44);
  svg += labelPill(ascLabelPt.x, ascLabelPt.y, t.ui.lagnaTag, 11, "#f4c95d", 700);
  svg += `</g>`;

  // Center "Earth" marker (this is a geocentric chart)
  svg += `<circle cx="${cx}" cy="${cy}" r="11" fill="url(#earthGlow)" opacity="0.9"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="#8fd3ff" stroke="#c9ecff" stroke-width="0.6"/>`;

  // Planets: spoke line from center + realistic glowing marker + abbreviation label.
  // Planets that cluster close together in the same stretch of sky are staggered outward
  // in ranked order (rather than a simple pairwise threshold) so labels stay readable
  // even when 3+ planets fall within a few degrees of each other.
  const sorted = [...planetPositions].sort((a, b) => a.sidLon - b.sidLon);
  let stack = 0;
  sorted.forEach((p, i) => {
    if (i > 0) {
      let diff = p.sidLon - sorted[i - 1].sidLon;
      if (diff > 180) diff -= 360;
      if (diff < 8) stack += 1; else stack = 0;
    }
    p._cosmicR = planetBaseR + stack * 15;
  });

  sorted.forEach(p => {
    const visual = PLANET_VISUALS[p.key] || { color: "#f4c95d", glow: 1.4, r: 6 };
    const pt = pointAt(p.sidLon, p._cosmicR);
    const spokeStart = pointAt(p.sidLon, 15);
    svg += `<line x1="${spokeStart.x.toFixed(1)}" y1="${spokeStart.y.toFixed(1)}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="#6a6fa0" stroke-width="0.6" opacity="0.5"/>`;
    svg += `<g class="cosmic-planet" data-planet-key="${p.key}">`;

    if (visual.shadow) {
      // Rahu/Ketu are shadow points, not luminous bodies - render as a dim ringed marker instead of a bright glow
      svg += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${visual.r}" fill="#141428" stroke="${visual.color}" stroke-width="1.4" opacity="0.9"/>`;
    } else {
      if (visual.ring) {
        // Saturn: a simple tilted ellipse suggests its rings
        svg += `<ellipse cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" rx="${(visual.r * 1.7).toFixed(1)}" ry="${(visual.r * 0.55).toFixed(1)}" fill="none" stroke="${visual.color}" stroke-width="1.1" opacity="0.65" transform="rotate(-20 ${pt.x.toFixed(1)} ${pt.y.toFixed(1)})"/>`;
      }
      svg += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${visual.r}" fill="${visual.color}" filter="url(#glow_${p.key})"/>`;
    }

    const labelPt = pointAt(p.sidLon, p._cosmicR + visual.r + 11);
    svg += labelPill(labelPt.x, labelPt.y, p.abbrev, 10, "#ffe9b0");
    svg += `</g>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;

  const isSimple = tooltipMode === "simple";
  const context = (tooltipMode && typeof tooltipMode === "object") ? tooltipMode : null;

  if (isSimple) {
    // Lightweight tooltip only (name + rasi) - used where the rich entry/exit-time
    // lookup wouldn't be meaningful (e.g. the Navamsa chart, a divisional chart the
    // rich tooltip's real-time entry/exit search doesn't apply to).
    container.querySelectorAll(".cosmic-planet").forEach(g => {
      const key = g.getAttribute("data-planet-key");
      const planet = planetPositions.find(p => p.key === key);
      if (planet) g.setAttribute("title", `${planet.label} — ${t.rasi[planet.rasiIdx]}`);
    });
    const ascGroupSimple = container.querySelector(".cosmic-asc");
    if (ascGroupSimple) ascGroupSimple.setAttribute("title", `${t.ui.lagnaTag} — ${t.rasi[rasiIndex(ascSidDeg)]}`);
    return;
  }

  // Attach rich hover tooltips now that the SVG is in the DOM
  container.querySelectorAll(".cosmic-planet").forEach(g => {
    const key = g.getAttribute("data-planet-key");
    const planet = planetPositions.find(p => p.key === key);
    if (planet) attachPlanetTooltip(g, planet, context);
  });
  const ascGroup = container.querySelector(".cosmic-asc");
  if (ascGroup) attachLagnaTooltip(ascGroup, ascSidDeg, context);
}

function degToDMS(deg) {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

function formatHMS12(date) {
  let h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  const ampm = h < 12 ? "AM" : "PM";
  h = h % 12; if (h === 0) h = 12;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)} ${ampm}`;
}
function formatHM24(date) {
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}
function ordinal(n) {
  const pi = getPanchangaI18n();
  return pi.ordinalWords[n] || String(n);
}
function drekkanaName(n) {
  const pi = getPanchangaI18n();
  return pi.drekkanaWords[n] || String(n);
}

// ===== Horoscope Summary: Panchanga narrative, descriptive blurbs, and the full
// traditional tabular summary =====
function renderPanchangaSummary(ctx) {
  const { utcDate, dd, mm, yyyy, hour, min, ss, tzOffset, lat, lon, lon_disp, planetPositions, ascRasi, ascSid, moon, sun, ayanamsa, personName, personGender, t } = ctx;

  const pi = getPanchangaI18n();
  const localDate = new Date(yyyy, mm - 1, dd, hour, min, ss);
  const weekdayIdx = new Date(yyyy, mm - 1, dd).getDay();
  const weekdayName = pi.weekdayNames[weekdayIdx];
  const weekdayLordKey = WEEKDAY_LORDS[weekdayIdx];

  const tithi = getTithiInfo(
    (getTropicalLongitude("Sun", utcDate) - ayanamsa + 360) % 360,
    (getTropicalLongitude("Moon", utcDate) - ayanamsa + 360) % 360
  );
  const karana = getKaranaInfo(
    (getTropicalLongitude("Sun", utcDate) - ayanamsa + 360) % 360,
    (getTropicalLongitude("Moon", utcDate) - ayanamsa + 360) % 360
  );
  const yoga = getYogaInfo(sun.sidLon, moon.sidLon);

  const { sunrise, sunset } = getSunriseSunset(yyyy, mm, dd, tzOffset, lat, lon);
  const localBirth = new Date(Date.UTC(yyyy, mm - 1, dd, hour, min, ss) - tzOffset * 3600000);

  let dinamanaText = "—", dinamanaNazhikaText = "—", nazhikaAfterSunrise = null, sunriseLocalDisp = "—", sunsetLocalDisp = "—";
  if (sunrise && sunset) {
    const sunriseLocal = new Date(sunrise.getTime() + tzOffset * 3600000);
    const sunsetLocal = new Date(sunset.getTime() + tzOffset * 3600000);
    sunriseLocalDisp = formatHMS12(sunriseLocal).replace(/:\d\d( [AP]M)$/, "$1"); // trim seconds for display
    sunsetLocalDisp = formatHMS12(sunsetLocal).replace(/:\d\d( [AP]M)$/, "$1");

    const dayLenMs = sunset - sunrise;
    const dayLenHrs = dayLenMs / 3600000;
    const dhh = Math.floor(dayLenHrs);
    const dmm = Math.round((dayLenHrs - dhh) * 60);
    dinamanaText = `${dhh}.${pad2(dmm)}`;
    const { nazhika: dn, vinazhika: dv } = toNazhikaVinazhika(dayLenMs);
    dinamanaNazhikaText = `${dn}.${pad2(dv)}`;

    const elapsedSinceSunrise = localBirth - sunrise;
    if (elapsedSinceSunrise >= 0) {
      nazhikaAfterSunrise = toNazhikaVinazhika(elapsedSinceSunrise);
    }
  }

  const lmtCorrectionMin = Math.round((lon - tzOffset * 15) * 4);
  const kalidina = getKalidinaSankhya(utcDate);

  const ascRasiLord = RASI_LORDS[ascRasi];
  const moonRasiLord = RASI_LORDS[moon.rasiIdx];
  const navamsaMoonRasi = navamsaIndex(moon.sidLon);
  const drekkanaNum = Math.floor((ascSid % 30) / 10) + 1;
  const isDakshinayana = [3, 4, 5, 6, 7, 8].includes(sun.rasiIdx);
  const jupiter = planetPositions.find(p => p.key === "Jupiter");
  const saturn = planetPositions.find(p => p.key === "Saturn");
  const westernSign = WESTERN_ZODIAC_NAMES[Math.floor(getTropicalLongitude("Sun", utcDate) / 30)];
  const kpLordsMoon = getKPLords(moon.sidLon);

  const ganamWord = pi.ganam[NAKSHATRA_GANAM[moon.nakIdx]];
  const yoniWord = pi.yoni[NAKSHATRA_YONI[moon.nakIdx]];
  const birdWord = pi.bird[NAKSHATRA_BIRD[moon.nakIdx]];
  const treeWord = pi.tree[NAKSHATRA_TREE[moon.nakIdx]];

  // ----- Narrative paragraph (composed separately per language - Tamil word order
  // differs too much from English for a simple word-substitution template) -----
  let narrative;
  if (currentLang === "ta") {
    const childWord = personGender === "male" ? pi.childBoy : personGender === "female" ? pi.childGirl : pi.childNative;
    const ayanaWord = isDakshinayana ? "தக்ஷிணாயன" : "உத்தராயண";
    narrative = `${ayanaWord} காலத்தில்; குரு ${t.rasiShort[jupiter.rasiIdx]} ராசியிலும் சனி ${t.rasiShort[saturn.rasiIdx]} ராசியிலும் இருக்க; ` +
      `${yyyy} ${pi.monthNames[mm - 1]} ${dd} ${weekdayName}கிழமை அன்று` +
      (nazhikaAfterSunrise ? ` சூரிய உதயத்திற்குப் பின் ${nazhikaAfterSunrise.nazhika} காலி (நாழிகை) ${nazhikaAfterSunrise.vinazhika} விநாழிகையில்` : "") +
      `; ${t.nakshatra[moon.nakIdx]} நட்சத்திரத்தின் ${ordinal(moon.pada)} பாதத்தில்; ${tithi.paksha} பக்ஷ ${tithi.name} திதி, ${karana.name}${karana.isVishti ? "(விஷ்டி)" : ""} கரணம் மற்றும் ${yoga.name} நித்திய யோகத்துடன்; ` +
      `சந்திரன் ${t.rasiShort[moon.rasiIdx]} ராசியிலும் ${t.rasiShort[navamsaMoonRasi]} நவாம்சத்திலும்; ${t.rasiShort[ascRasi]} லக்னத்திலும் ${drekkanaName(drekkanaNum)} திரேக்காணத்திலும் இருக்க; ${childWord} பிறந்துள்ளார்.`;
  } else {
    const childWord = personGender === "male" ? pi.childBoy : personGender === "female" ? pi.childGirl : pi.childNative;
    const ayanaWord = isDakshinayana ? "Dakshinayana" : "Uttarayana";
    narrative = `During ${ayanaWord} period; with Jupiter in ${t.rasiShort[jupiter.rasiIdx]} rasi and Saturn in ${t.rasiShort[saturn.rasiIdx]} rasi; ` +
      `on ${yyyy} ${pi.monthNames[mm - 1]} ${dd} ${weekdayName}` +
      (nazhikaAfterSunrise ? ` at ${nazhikaAfterSunrise.nazhika} Ghati (Nazhika) ${nazhikaAfterSunrise.vinazhika} Vinazhika After sunrise` : "") +
      `; in ${ordinal(moon.pada)} Pada of Star ${t.nakshatra[moon.nakIdx]}; ${tithi.paksha}paksha ${tithi.name} Thidhi, ${karana.name}${karana.isVishti ? "(Vishti)" : ""} Karana and ${yoga.name} Nithya Yoga; ` +
      `with Moon in ${t.rasiShort[moon.rasiIdx]} rasi and ${t.rasiShort[navamsaMoonRasi]} Navamsa; in ${t.rasiShort[ascRasi]} Lagna and ${drekkanaName(drekkanaNum)} Drekkana; the ${childWord} is born.`;
  }

  document.getElementById("panchangaNarrative").textContent = pi.omSri + "\n" + narrative;

  if (currentLang === "ta") {
    document.getElementById("weekdayBlurb").textContent =
      `${weekdayName}கிழமையில் பிறந்தவர், இதன் அதிபதி ${t.planets[weekdayLordKey]}. ஒவ்வொரு கிழமையும் அதன் அதிபதி கிரகத்தின் தாக்கத்தைக் கொண்டுள்ளது.`;
    document.getElementById("starBlurb").textContent =
      `${t.nakshatra[moon.nakIdx]} நட்சத்திரம், பாதம் ${moon.pada}-இல் பிறந்தவர், இதன் அதிபதி ${t.planets[NAKSHATRA_LORDS[moon.nakIdx]]}. ` +
      `கணம்: ${ganamWord}, யோனி: ${yoniWord}.`;
    document.getElementById("thidhiBlurb").textContent =
      `${tithi.paksha} பக்ஷத்தில் ${tithi.name} திதி (${tithi.paksha === pi.pakshaShukla ? "வளர்பிறை" : "தேய்பிறை"} பக்ஷத்தின் ${tithi.numberInPaksha}-வது திதி).`;
  } else {
    document.getElementById("weekdayBlurb").textContent =
      `Born on a ${weekdayName}, ruled by ${t.planets[weekdayLordKey]}. Each weekday carries the classical influence of its ruling graha.`;
    document.getElementById("starBlurb").textContent =
      `Born under ${t.nakshatra[moon.nakIdx]} nakshatra, Pada ${moon.pada}, ruled by ${t.planets[NAKSHATRA_LORDS[moon.nakIdx]]}. ` +
      `Ganam: ${ganamWord}, Yoni (animal symbol): ${yoniWord}.`;
    document.getElementById("thidhiBlurb").textContent =
      `${tithi.name} Thidhi in ${tithi.paksha}paksha (the ${tithi.paksha === "Shukla" ? "waxing" : "waning"} lunar fortnight), the ${tithi.numberInPaksha}${["th","st","nd","rd"][(tithi.numberInPaksha%10<4 && Math.floor(tithi.numberInPaksha/10)!==1)?tithi.numberInPaksha%10:0]} tithi of the fortnight.`;
  }

  // ----- Full tabular summary -----
  const u = t.ui;
  const rows = [
    [u.sumName, personName || "—"],
    [u.sumSex, personGender ? t.ui[`genderOpt_${personGender}`] : "—"],
    [u.sumDob, `${dd} ${pi.monthNames[mm - 1]}, ${yyyy} ${weekdayName}`],
    [u.sumTob, `${formatHMS12(localDate)} ${u.sumStandardTime}`],
    [u.sumTz, `${tzOffset >= 0 ? "" : "-"}${pad2(Math.floor(Math.abs(tzOffset)))}:${pad2(Math.round((Math.abs(tzOffset) % 1) * 60))} ${u.sumEastGreenwich}`],
    [u.sumPlace, `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? u.sumEast : u.sumWest}, ${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? u.sumNorth : u.sumSouth}`],
    [u.sumAyanamsa, `Chitra Paksha (Lahiri) = ${degToDMS(ayanamsa)}`],
    [u.sumBirthStarPada, `${t.nakshatra[moon.nakIdx]} - ${moon.pada}`],
    [u.sumBirthRasiLord, `${t.rasiShort[moon.rasiIdx]} - ${t.planets[moonRasiLord]}`],
    [u.sumLagnaLord, `${t.rasiShort[ascRasi]} - ${t.planets[ascRasiLord]}`],
    [u.sumThidhi, currentLang === "ta" ? `${tithi.name}, ${tithi.paksha} ${pi.pakshaSuffix}` : `${tithi.name}, ${tithi.paksha}${pi.pakshaSuffix}`],
    [u.sumSunrise, sunriseLocalDisp],
    [u.sumSunset, sunsetLocalDisp],
    [u.sumDinamanaHM, dinamanaText],
    [u.sumDinamanaNazhika, dinamanaNazhikaText],
    [u.sumLmt, `${u.sumStandardTime} ${lmtCorrectionMin >= 0 ? "+" : "-"} ${Math.abs(lmtCorrectionMin)} ${u.sumMin}`],
    [u.sumAstroDay, weekdayName],
    [u.sumKalidina, String(kalidina)],
    [u.sumDasaSystem, "Vimshottari, 1 Year = 365.25 Days"],
    [u.sumStarLord, t.planets[NAKSHATRA_LORDS[moon.nakIdx]]],
    [u.sumGanamYoni, `${ganamWord}, ${yoniWord}`],
    [u.sumBirdTree, `${birdWord}, ${treeWord}`],
    [u.sumSunRasiStar, `${t.rasiShort[sun.rasiIdx]} - ${t.nakshatra[sun.nakIdx]}`],
    [u.sumZodiacWestern, westernSign],
    [u.sumKpMoon, `${t.planets[kpLordsMoon.starLord]} / ${t.planets[kpLordsMoon.subLord]}`],
  ];

  const table = document.getElementById("summaryTable");
  table.innerHTML = rows.map(([label, value]) =>
    `<tr><td class="summary-label">${label}</td><td class="summary-value">${value}</td></tr>`
  ).join("");
}

// ===== KP Star / Sub / Sub-Sub Lord table for every graha =====
function renderKPTable(planetPositions, t) {
  const tbody = document.querySelector("#kpTable tbody");
  tbody.innerHTML = planetPositions.map(p => {
    const kp = getKPLords(p.sidLon);
    return `<tr>
      <td>${p.label}</td>
      <td>${t.planets[kp.starLord]}</td>
      <td>${t.planets[kp.subLord]}</td>
      <td>${t.planets[kp.subSubLord]}</td>
    </tr>`;
  }).join("");
}

// ===== Sudarshana Chakra: three D1 charts, referenced from Lagna / Moon / Sun respectively.
// A widely used simplified rendering of the technique (the Lagna, Chandra, and Surya charts
// shown side by side), rather than a single fully merged wheel. =====
function renderSudarshanaChakra(planetPositions, ascRasi, moonRasi, sunRasi) {
  renderChart("sudarshanaLagnaGrid", planetPositions, ascRasi, "simple");
  renderChart("sudarshanaMoonGrid", planetPositions, moonRasi, "simple");
  renderChart("sudarshanaSunGrid", planetPositions, sunRasi, "simple");
}

// ===== Dasha & Bhukti table rendering =====
function renderDashaTable(mahadashas, tzOffsetHours, t) {
  const container = document.getElementById("dashaTable");
  container.innerHTML = "";
  const now = new Date();

  mahadashas.forEach((md, idx) => {
    const isCurrent = now >= md.start && now < md.end;

    const row = document.createElement("div");
    row.className = "dasha-row" + (isCurrent ? " current" : "");

    const main = document.createElement("div");
    main.className = "dasha-main";
    main.innerHTML = `
      <span class="dasha-toggle">▶</span>
      <span class="dasha-lord">${t.planets[md.lord]}${isCurrent ? ` <em>(${t.ui.dashaCurrent})</em>` : ""}</span>
      <span class="dasha-dates">${formatLocalDateTime(md.start, tzOffsetHours)} → ${formatLocalDateTime(md.end, tzOffsetHours)}</span>
    `;

    const bhuktiWrap = document.createElement("div");
    bhuktiWrap.className = "dasha-bhuktis hidden";

    main.addEventListener("click", () => {
      const hidden = bhuktiWrap.classList.contains("hidden");
      if (hidden && !bhuktiWrap.dataset.filled) {
        md.bhuktis.forEach(b => {
          const bRow = document.createElement("div");
          const bIsCurrent = now >= b.start && now < b.end;
          bRow.className = "bhukti-row" + (bIsCurrent ? " current" : "");
          bRow.innerHTML = `
            <span class="bhukti-lord">${t.planets[b.lord]}${bIsCurrent ? ` <em>(${t.ui.dashaCurrent})</em>` : ""}</span>
            <span class="bhukti-dates">${formatLocalDateTime(b.start, tzOffsetHours)} → ${formatLocalDateTime(b.end, tzOffsetHours)}</span>
          `;
          bhuktiWrap.appendChild(bRow);
        });
        bhuktiWrap.dataset.filled = "1";
      }
      bhuktiWrap.classList.toggle("hidden");
      main.querySelector(".dasha-toggle").textContent = bhuktiWrap.classList.contains("hidden") ? "▶" : "▼";
    });

    row.appendChild(main);
    row.appendChild(bhuktiWrap);
    container.appendChild(row);
  });
}

// Computes planetary + Ascendant positions for any date/time and location. Shared by the
// birth chart, the Navamsa remap, and the independent "Current Date & Time" section.
function computeChartData(date, lat, lon) {
  const ayanamsa = getAyanamsa(date);
  const t = LANG[currentLang];

  const planetPositions = PLANET_KEYS.map(key => {
    const trop = getTropicalLongitude(key, date);
    const sid = getSiderealLongitude(trop, ayanamsa);
    return {
      key: key,
      label: t.planets[key],
      abbrev: t.planetAbbrev[key],
      sidLon: sid,
      rasiIdx: rasiIndex(sid),
      nakIdx: nakshatraIndex(sid),
      pada: padaIndex(sid),
    };
  });

  const ascTrop = getAscendantTropical(date, lat, lon);
  const ascSid = getSiderealLongitude(ascTrop, ayanamsa);
  const ascRasi = rasiIndex(ascSid);

  return { planetPositions, ascSid, ascRasi };
}

// ===== Current Date & Time section: an independent, slider-driven exploration chart =====
// Uses the birth location, but its own date/time state - completely separate from the
// birth chart itself, which only changes via the form + Generate button.
let currentSectionDate = new Date();

function renderCurrentSection() {
  if (lastGeneratedLat === null || lastGeneratedLon === null) return; // no birth location yet
  const t = LANG[currentLang];
  const { planetPositions, ascSid, ascRasi } = computeChartData(currentSectionDate, lastGeneratedLat, lastGeneratedLon);
  // Rich tooltips here too (Power, Aspects, Same House, entry/exit) - using this section's
  // own date/time and planet list as the reference, not the birth chart's.
  const context = {
    refDate: currentSectionDate,
    tzOffset: lastGeneratedTzOffset,
    positions: planetPositions,
    lat: lastGeneratedLat,
    lon: lastGeneratedLon
  };
  renderChart("currentChartGrid", planetPositions, ascRasi, context);
  renderCosmicChart("currentCosmicChart", planetPositions, ascSid, t, context);
}

// ===== Form submit =====
function generateChart(silent) {
  const dd = parseInt(document.getElementById("dd").value, 10);
  const mm = parseInt(document.getElementById("mm").value, 10);
  const yyyy = parseInt(document.getElementById("yyyy").value, 10);
  const hh12 = parseInt(document.getElementById("hh").value, 10);
  const min = parseInt(document.getElementById("min").value, 10);
  const ss = parseInt(document.getElementById("ss").value, 10) || 0;
  const ampm = document.getElementById("ampm").value;
  const tzOffset = parseFloat(document.getElementById("tz").value);
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);

  if (!dd || !mm || !yyyy || isNaN(hh12) || isNaN(min) || isNaN(lat) || isNaN(lon)) {
    if (!silent) alert("Please fill in date, time, and coordinates.");
    return;
  }
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || hh12 < 0 || hh12 > 12 || min < 0 || min > 59) {
    if (!silent) alert("Please check the date/time values entered.");
    return;
  }

  // Convert 12-hour clock + AM/PM to 24-hour
  let hour = hh12 % 12;
  if (ampm === "PM") hour += 12;

  // Convert local birth time to UTC using the timezone offset
  const localAsUTCMillis = Date.UTC(yyyy, mm - 1, dd, hour, min, ss);
  const utcMillis = localAsUTCMillis - tzOffset * 3600 * 1000;
  const utcDate = new Date(utcMillis);
  lastGeneratedUtcDate = utcDate;
  lastGeneratedTzOffset = tzOffset;
  lastGeneratedLat = lat;
  lastGeneratedLon = lon;

  const t = LANG[currentLang];

  const { planetPositions, ascSid, ascRasi } = computeChartData(utcDate, lat, lon);
  lastGeneratedPlanetPositions = planetPositions;

  // Name & Gender: purely informational, shown as a small banner above the charts if given
  const personName = document.getElementById("personName").value.trim();
  const personGender = document.getElementById("personGender").value;
  const personBanner = document.getElementById("personBanner");
  if (personName || personGender) {
    const genderLabel = personGender ? t.ui[`genderOpt_${personGender}`] : "";
    personBanner.textContent = [personName, genderLabel].filter(Boolean).join(" • ");
    personBanner.classList.remove("hidden");
  } else {
    personBanner.classList.add("hidden");
  }

  // Render Rasi (D1) chart and the Cosmic View
  renderChart("chartGrid", planetPositions, ascRasi);
  renderCosmicChart("cosmicChart", planetPositions, ascSid, t);

  // Navamsa (D9) chart: same planets, re-mapped to their navamsa sign
  const navamsaPlanetPositions = planetPositions.map(p => ({ ...p, rasiIdx: navamsaIndex(p.sidLon) }));
  const navamsaAscRasi = navamsaIndex(ascSid);
  renderChart("navamsaGrid", navamsaPlanetPositions, navamsaAscRasi, "simple");

  // Moon reference (used below for Dasha, and for the new horoscope summary section)
  const moon = planetPositions.find(p => p.key === "Moon");
  const sun = planetPositions.find(p => p.key === "Sun");

  // Planet table
  const tbody = document.querySelector("#planetTable tbody");
  tbody.innerHTML = "";
  planetPositions.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.label}</td>
      <td>${degToDMS(p.sidLon % 30)} ${t.rasiShort[p.rasiIdx]}</td>
      <td>${t.rasi[p.rasiIdx]}</td>
      <td>${t.nakshatra[p.nakIdx]}</td>
      <td>${p.pada}</td>
    `;
    tbody.appendChild(tr);
  });

  // Dasha & Bhukti (Vimshottari periods), based on the Moon's position
  const mahadashas = computeVimshottariDasha(moon.sidLon, utcDate);
  renderDashaTable(mahadashas, tzOffset, t);

  // Horoscope Summary (Panchanga narrative + full tabular summary), KP lords table,
  // and the Sudarshana Chakra (Lagna/Moon/Sun referenced mini-charts)
  const ayanamsaForSummary = getAyanamsa(utcDate);
  renderPanchangaSummary({
    utcDate, dd, mm, yyyy, hour, min, ss, tzOffset, lat, lon,
    planetPositions, ascRasi, ascSid, moon, sun, ayanamsa: ayanamsaForSummary,
    personName, personGender, t
  });
  renderKPTable(planetPositions, t);
  renderSudarshanaChakra(planetPositions, ascRasi, moon.rasiIdx, sun.rasiIdx);

  // Current Date & Time exploration section - uses the birth location, defaults to "now"
  renderCurrentSection();

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("pageWrap").classList.add("expanded");

  // The first time a chart is successfully generated, automatically collapse the
  // input form to give the charts more room - the "Edit Details" button (now revealed)
  // remains available to keep adjusting things afterward.
  if (!formEverCollapsed) {
    formEverCollapsed = true;
    document.getElementById("formPanel").classList.add("form-collapsed");
    document.getElementById("pageWrap").classList.add("form-collapsed-layout");
    document.getElementById("editDetailsBtn").classList.remove("hidden");
  }

  if (!silent) {
    document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.getElementById("birthForm").addEventListener("submit", (e) => {
  e.preventDefault();
  generateChart();
});

// ===== Language switching =====
function applyLanguageToUI() {
  const t = LANG[currentLang].ui;
  document.getElementById("appTitle").textContent = t.title;
  document.getElementById("appSubtitle").textContent = t.subtitle;
  document.getElementById("dobLabel").textContent = t.dob;
  document.getElementById("tobLabel").textContent = t.tob;
  document.getElementById("tzLabel").textContent = t.tz;
  document.getElementById("placeLabel").textContent = t.place;
  document.getElementById("place").placeholder = t.placeholder;
  document.getElementById("lookupBtn").textContent = t.lookupBtn;
  document.getElementById("latLabel").textContent = t.lat;
  document.getElementById("lonLabel").textContent = t.lon;
  document.getElementById("generateBtn").textContent = t.generateBtn;
  document.getElementById("chartHeadingLabel").textContent = t.chartHeading;
  document.getElementById("cosmicHeadingLabel").textContent = t.cosmicHeading;
  document.getElementById("tableHeadingLabel").textContent = t.tableHeading;
  document.getElementById("thGraha").textContent = t.thGraha;
  document.getElementById("thLon").textContent = t.thLon;
  document.getElementById("thRasi").textContent = t.thRasi;
  document.getElementById("thNak").textContent = t.thNak;
  document.getElementById("thPada").textContent = t.thPada;
  document.getElementById("dashaHeadingLabel").textContent = t.dashaHeading;
  document.getElementById("dashaHint").textContent = t.dashaHint;
  document.getElementById("navamsaHeadingLabel").textContent = t.navamsaHeading;
  document.getElementById("panchangaHeadingLabel").textContent = t.panchangaHeading;
  document.getElementById("weekdayBlurbHeading").textContent = t.weekdayBlurbHeading;
  document.getElementById("starBlurbHeading").textContent = t.starBlurbHeading;
  document.getElementById("thidhiBlurbHeading").textContent = t.thidhiBlurbHeading;
  document.getElementById("kpHeadingLabel").textContent = t.kpHeading;
  document.getElementById("kpThGraha").textContent = t.kpThGraha;
  document.getElementById("kpThStar").textContent = t.kpThStar;
  document.getElementById("kpThSub").textContent = t.kpThSub;
  document.getElementById("kpThSubSub").textContent = t.kpThSubSub;
  document.getElementById("sudarshanaHeadingLabel").textContent = t.sudarshanaHeading;
  document.getElementById("sudarshanaHint").textContent = t.sudarshanaHint;
  document.getElementById("sudarshanaLagnaLabel").textContent = t.sudarshanaLagna;
  document.getElementById("sudarshanaMoonLabel").textContent = t.sudarshanaMoon;
  document.getElementById("sudarshanaSunLabel").textContent = t.sudarshanaSun;
  document.getElementById("myLocationHeading").textContent = t.myLocationHeading;
  document.getElementById("myLocationSubtitle").textContent = t.myLocationSubtitle;
  document.getElementById("useMyLocationLabel").textContent = t.useMyLocationLabel;
  document.getElementById("editDetailsLabel").textContent = t.editDetails;
  document.getElementById("sectionsSidebarTitle").textContent = t.sectionsTitle;
  document.getElementById("secLabelPanchanga").textContent = t.secPanchanga;
  document.getElementById("secLabelTable").textContent = t.secTable;
  document.getElementById("secLabelKp").textContent = t.secKp;
  document.getElementById("secLabelRasi").textContent = t.secRasi;
  document.getElementById("secLabelCurrent").textContent = t.secCurrent;
  document.getElementById("secLabelSudarshana").textContent = t.secSudarshana;
  document.getElementById("secLabelDasha").textContent = t.secDasha;
  document.getElementById("currentHeadingLabel").textContent = t.currentHeading;
  document.getElementById("nameLabel").textContent = t.nameLabel;
  document.getElementById("genderLabel").textContent = t.genderLabel;
  document.getElementById("genderOptNone").textContent = t.genderOptNone;
  document.getElementById("genderOptFemale").textContent = t.genderOpt_female;
  document.getElementById("genderOptMale").textContent = t.genderOpt_male;
  document.getElementById("genderOptOther").textContent = t.genderOpt_other;
  document.getElementById("noteText").textContent = t.note;
  document.getElementById("langLabel").textContent = t.langLabel;

  // If a chart was already generated, redraw it in the new language
  if (!document.getElementById("result").classList.contains("hidden")) {
    generateChart();
  }
}

// Populate language dropdown from LANG object and apply default
const langSelect = document.getElementById("langSelect");
Object.keys(LANG).forEach(code => {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = LANG[code].langLabel;
  langSelect.appendChild(opt);
});

// Restore saved language preference, if any
try {
  const savedLang = localStorage.getItem("natalChartLang");
  if (savedLang && LANG[savedLang]) {
    currentLang = savedLang;
    langSelect.value = savedLang;
  }
} catch (e) { /* localStorage unavailable, ignore */ }

document.getElementById("langSelect").addEventListener("change", (e) => {
  currentLang = e.target.value;
  try { localStorage.setItem("natalChartLang", currentLang); } catch (e) {}
  applyLanguageToUI();
});

applyLanguageToUI();

// ===== Dark / Light theme toggle =====
const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
    themeToggleBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("light-theme");
    themeToggleBtn.textContent = "🌙";
  }
}

let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("natalChartTheme") || "dark";
} catch (e) { /* localStorage unavailable, ignore */ }
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-theme");
  const newTheme = isLight ? "dark" : "light";
  applyTheme(newTheme);
  try { localStorage.setItem("natalChartTheme", newTheme); } catch (e) {}
});

// ===== Segmented date/time inputs: auto-advance focus =====
function setupSegmentedAutoAdvance(order) {
  order.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Select elements (AM/PM) use native browser behavior - don't touch their value
    if (el.tagName === "SELECT") return;

    // Only digits allowed, and auto-advance once the field is full
    el.addEventListener("input", () => {
      el.value = el.value.replace(/[^0-9]/g, "");
      const maxLen = parseInt(el.getAttribute("maxlength"), 10) || 2;
      if (el.value.length >= maxLen) {
        const next = document.getElementById(order[idx + 1]);
        if (next) next.focus();
      }
    });

    // Backspace on an empty field moves focus back to the previous one
    el.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && el.value.length === 0 && idx > 0) {
        const prev = document.getElementById(order[idx - 1]);
        if (prev) {
          prev.focus();
        }
      }
    });

    // Select all existing text on focus, so typing overwrites instead of appending
    el.addEventListener("focus", () => el.select());
  });
}

setupSegmentedAutoAdvance(["dd", "mm", "yyyy"]);
setupSegmentedAutoAdvance(["hh", "min", "ss", "ampm"]);

// ===== "Now" button: fill in the current date & time (birth form fields) =====
function pad2(n) { return String(n).padStart(2, "0"); }

function setToNow() {
  const now = new Date();
  document.getElementById("dd").value = pad2(now.getDate());
  document.getElementById("mm").value = pad2(now.getMonth() + 1);
  document.getElementById("yyyy").value = String(now.getFullYear());

  let hours24 = now.getHours();
  let hh12 = hours24 % 12;
  if (hh12 === 0) hh12 = 12;
  document.getElementById("hh").value = pad2(hh12);
  document.getElementById("min").value = pad2(now.getMinutes());
  document.getElementById("ss").value = pad2(now.getSeconds());
  document.getElementById("ampm").value = hours24 < 12 ? "AM" : "PM";
}

document.getElementById("nowBtnDate").addEventListener("click", setToNow);
document.getElementById("nowBtnTime").addEventListener("click", setToNow);

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ===== Current Date & Time sliders: the only sliders in the app now, and they drive
// only the "Current Date & Time" exploration section (currentSectionDate), never the
// birth chart itself. =====
const curDateSliderEl = document.querySelector('.date-slider[data-slider-group="current"]');
const curDateCaptionEl = document.querySelector('.date-slider-caption[data-slider-group="current"]');
const curTimeSliderEl = document.querySelector('.time-slider[data-slider-group="current"]');
const curTimeCaptionEl = document.querySelector('.time-slider-caption[data-slider-group="current"]');

let curDateSliderMin, curDateSliderTotalDays;

function recenterCurrentDateSlider(centerDate) {
  curDateSliderMin = new Date(centerDate.getFullYear() - 30, centerDate.getMonth(), centerDate.getDate());
  const maxDate = new Date(centerDate.getFullYear() + 30, centerDate.getMonth(), centerDate.getDate());
  curDateSliderTotalDays = Math.round((maxDate - curDateSliderMin) / 86400000);
  curDateSliderEl.min = 0;
  curDateSliderEl.max = curDateSliderTotalDays;
}

function dayOffsetToDate(v) {
  return new Date(curDateSliderMin.getTime() + v * 86400000);
}

function updateCurrentDateCaption() {
  const d = dayOffsetToDate(parseInt(curDateSliderEl.value, 10));
  curDateCaptionEl.textContent = `-30y  •  ${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}  •  +30y`;
}

function updateCurrentTimeCaption() {
  const v = parseInt(curTimeSliderEl.value, 10);
  const hours24 = Math.floor(v / 60);
  const mins = v % 60;
  curTimeCaptionEl.textContent = `00:00  •  ${pad2(hours24)}:${pad2(mins)}  •  24:00`;
}

// Throttle live chart regeneration to at most once per animation frame,
// so dragging the slider stays smooth even though the chart recompute is non-trivial.
let liveUpdatePending = false;
function requestCurrentSectionUpdate() {
  if (liveUpdatePending) return;
  liveUpdatePending = true;
  requestAnimationFrame(() => {
    liveUpdatePending = false;
    renderCurrentSection();
  });
}

// Pushes currentSectionDate's date part out to the slider/caption without touching time-of-day
function syncSlidersFromCurrentSectionDate() {
  recenterCurrentDateSlider(currentSectionDate);
  const dayOffset = Math.round((currentSectionDate - curDateSliderMin) / 86400000);
  curDateSliderEl.value = dayOffset;
  updateCurrentDateCaption();

  const minutesOfDay = currentSectionDate.getHours() * 60 + currentSectionDate.getMinutes();
  curTimeSliderEl.value = minutesOfDay;
  updateCurrentTimeCaption();
}

curDateSliderEl.addEventListener("input", () => {
  const dayOffset = parseInt(curDateSliderEl.value, 10);
  const newDate = dayOffsetToDate(dayOffset);
  // keep the existing time-of-day, just move the calendar date
  currentSectionDate = new Date(
    newDate.getFullYear(), newDate.getMonth(), newDate.getDate(),
    currentSectionDate.getHours(), currentSectionDate.getMinutes(), currentSectionDate.getSeconds()
  );
  updateCurrentDateCaption();
  requestCurrentSectionUpdate();
});

curTimeSliderEl.addEventListener("input", () => {
  const v = parseInt(curTimeSliderEl.value, 10);
  const hours = Math.floor(v / 60), mins = v % 60;
  currentSectionDate = new Date(
    currentSectionDate.getFullYear(), currentSectionDate.getMonth(), currentSectionDate.getDate(),
    hours, mins, currentSectionDate.getSeconds()
  );
  updateCurrentTimeCaption();
  requestCurrentSectionUpdate();
});

function stepCurrentDateSlider(deltaDays) {
  const newValue = Math.min(curDateSliderTotalDays, Math.max(0, parseInt(curDateSliderEl.value, 10) + deltaDays));
  curDateSliderEl.value = newValue;
  curDateSliderEl.dispatchEvent(new Event("input"));
}

function stepCurrentTimeSlider(deltaMinutes) {
  let v = parseInt(curTimeSliderEl.value, 10) + deltaMinutes;
  v = ((v % 1440) + 1440) % 1440; // wrap around the 24-hour range
  curTimeSliderEl.value = v;
  curTimeSliderEl.dispatchEvent(new Event("input"));
}

document.getElementById("nowBtnCurrent").addEventListener("click", () => {
  currentSectionDate = new Date();
  syncSlidersFromCurrentSectionDate();
  requestCurrentSectionUpdate();
});

// Initialize the slider range/position to "now" on page load
recenterCurrentDateSlider(currentSectionDate);
syncSlidersFromCurrentSectionDate();

// ===== Arrow buttons: click to step once, press-and-hold to scroll continuously =====
function setupHoldToRepeat(btn, onStep) {
  if (!btn) return;
  let holdTimeout = null;
  let holdInterval = null;

  function stop() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdTimeout = null;
    holdInterval = null;
  }

  function start(e) {
    e.preventDefault();
    onStep(); // immediate single step on click/tap
    holdTimeout = setTimeout(() => {
      holdInterval = setInterval(onStep, 70); // continuous scroll while held
    }, 400);
  }

  btn.addEventListener("mousedown", start);
  btn.addEventListener("touchstart", start, { passive: false });
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt => {
    btn.addEventListener(evt, stop);
  });
}

document.querySelectorAll("[data-date-arrow]").forEach(btn => {
  const dir = parseInt(btn.getAttribute("data-date-arrow"), 10);
  setupHoldToRepeat(btn, () => stepCurrentDateSlider(dir));
});
document.querySelectorAll("[data-time-arrow]").forEach(btn => {
  const dir = parseInt(btn.getAttribute("data-time-arrow"), 10);
  setupHoldToRepeat(btn, () => stepCurrentTimeSlider(dir));
});

// ===== Sections sidebar: expand/collapse panel, navigate + toggle each section =====
const sectionsSidebar = document.getElementById("sectionsSidebar");

function setSidebarOpen(open) {
  sectionsSidebar.classList.toggle("collapsed", !open);
  document.body.classList.toggle("sidebar-open", open);
  if (open) syncSidebarChevrons();
}

// Only the toggle button opens/closes the sidebar now - clicking a nav item inside it
// (to jump to or expand/collapse a section) no longer auto-closes it.
document.getElementById("sectionsToggleBtn").addEventListener("click", () => {
  setSidebarOpen(sectionsSidebar.classList.contains("collapsed"));
});

function isSectionCollapsed(goto) {
  if (goto === "rasi" || goto === "navamsa" || goto === "cosmic") {
    return document.getElementById("mainChartsGroup").classList.contains("group-collapsed");
  }
  const section = document.querySelector(`.output-section[data-section="${goto}"]`);
  return section ? section.classList.contains("collapsed") : false;
}

// Keeps each sidebar item's chevron in sync with whether its section is currently
// expanded or collapsed, since that state can also change from clicking headings
// directly in the main content.
function syncSidebarChevrons() {
  document.querySelectorAll(".sections-nav-item").forEach(btn => {
    const goto = btn.getAttribute("data-goto");
    const chevron = btn.querySelector(".chevron");
    if (chevron) chevron.classList.toggle("collapsed-state", isSectionCollapsed(goto));
  });
}

document.querySelectorAll(".sections-nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const goto = btn.getAttribute("data-goto");
    if (goto === "rasi" || goto === "navamsa" || goto === "cosmic") {
      document.getElementById("mainChartsGroup").classList.toggle("group-collapsed");
    } else {
      const section = document.querySelector(`.output-section[data-section="${goto}"]`);
      if (section) section.classList.toggle("collapsed");
    }
    syncSidebarChevrons();
    if (!isSectionCollapsed(goto)) {
      const target = document.querySelector(`.output-section[data-section="${goto}"]`) ||
                      document.getElementById("mainChartsGroup");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ===== Collapsible section titles =====
// The Rasi / Navamsa / Cosmic View trio share ONE collapse state: clicking any of their
// three headings expands or collapses all three together, not independently.
const mainChartsGroup = document.getElementById("mainChartsGroup");
document.querySelectorAll(".group-toggle").forEach(heading => {
  heading.addEventListener("click", () => {
    mainChartsGroup.classList.toggle("group-collapsed");
    syncSidebarChevrons();
  });
});

// Every other section title (Current Date & Time, Janma, Table, Dasha) still
// collapses independently, one at a time.
document.querySelectorAll(".section-toggle:not(.group-toggle)").forEach(heading => {
  heading.addEventListener("click", () => {
    heading.closest(".output-section").classList.toggle("collapsed");
    syncSidebarChevrons();
  });
});

// ===== Edit Details: hide the input form after generating, with a way back in =====
const editDetailsBtn = document.getElementById("editDetailsBtn");
editDetailsBtn.addEventListener("click", () => {
  document.getElementById("formPanel").classList.toggle("form-collapsed");
  document.getElementById("pageWrap").classList.toggle("form-collapsed-layout");
});
