// Birth-chart reference data and calculations carried over from the original app:
// Vimshottari dasha, graha friendship, dignity, aspects, nakshatra attributes, KP lords.
export const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
export const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
export const DASHA_YEAR_DAYS = 365.25; // standard fixed-year convention used for Vimshottari calculations

// Nakshatra lords repeat the same 9-planet sequence three times across the 27 nakshatras
export const NAKSHATRA_LORDS = Array.from({ length: 27 }, (_, i) => DASHA_SEQUENCE[i % 9]);


export function addYears(date, years) {
  return new Date(date.getTime() + years * DASHA_YEAR_DAYS * 86400000);
}

// Computes the 9 Mahadasha (main) periods from the birth moment, each with its 9 Bhukti
// (sub-period) breakdown. The first Mahadasha - and the first Bhukti within it - are
// naturally partial, since birth falls partway through both, based on how far the Moon
// has already moved through its birth Nakshatra.
export function computeVimshottariDasha(moonSidLon, birthUtcDate) {
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSidLon / (360 / 27));
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


export const NATURAL_FRIENDSHIP = {
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

export function friendshipStatus(fromKey, towardKey) {
  if (fromKey === towardKey) return null;
  const rel = NATURAL_FRIENDSHIP[fromKey];
  if (!rel) return "neutral";
  if (rel.friends.includes(towardKey)) return "friend";
  if (rel.enemies.includes(towardKey)) return "enemy";
  return "neutral";
}

// Rasi rulership (0=Mesha...11=Meena)
export const RASI_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

// Exaltation sign per planet; debilitation is always the exact opposite sign
export const EXALTATION_SIGN = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
export const OWN_SIGNS = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11],
  Venus: [1, 6], Saturn: [9, 10], Rahu: [], Ketu: []
};

// "Power" / dignity: exalted, debilitated, own sign, or the natural-friendship status
// toward whichever planet rules the sign it currently occupies.
export function getDignity(planetKey, rasiIdx) {
  if (EXALTATION_SIGN[planetKey] === rasiIdx) return "exalted";
  if ((EXALTATION_SIGN[planetKey] + 6) % 12 === rasiIdx) return "debilitated";
  if ((OWN_SIGNS[planetKey] || []).includes(rasiIdx)) return "own";
  const lord = RASI_LORDS[rasiIdx];
  return friendshipStatus(planetKey, lord) || "own";
}

// Drishti/Parvai (Vedic aspects): every planet aspects the 7th sign from itself; Mars, Jupiter
// and Saturn additionally cast special aspects onto further signs.
export function getAspectedRasis(planetKey, rasiIdx) {
  const offsets = [6];
  if (planetKey === "Mars") offsets.push(3, 7);
  if (planetKey === "Jupiter") offsets.push(4, 8);
  if (planetKey === "Saturn") offsets.push(2, 9);
  return offsets.map(o => (rasiIdx + o) % 12);
}


export const NAKSHATRA_GANAM = ["Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva",
  "Rakshasa", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Deva", "Deva", "Rakshasa",
  "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa", "Deva",
  "Manushya", "Deva"];
export const NAKSHATRA_YONI = ["Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep",
  "Cat", "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer", "Dog",
  "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant"];
export const NAKSHATRA_BIRD = ["Vulture", "Vulture", "Cock", "Owl", "Owl", "Dog", "Crow", "Crow", "Crow",
  "Cock", "Cock", "Cock", "Dog", "Dog", "Peacock", "Peacock", "Cock", "Cock", "Cock", "Vulture",
  "Vulture", "Vulture", "Peacock", "Owl", "Owl", "Cock", "Crow"];
export const NAKSHATRA_TREE = ["Kuchela", "Amalaki", "Khadira", "Devadaru", "Khadira", "LongMango", "Palasha",
  "Udumbara", "Peepal", "Banyan", "Palasha", "Peepal", "Mango", "Jackfruit", "Bael", "Arjuna",
  "Bamboo", "Kadamba", "Kadamba", "Ashoka", "Jackfruit", "Mango", "Madhuca", "Kadamba", "Mango",
  "Kadamba", "Mango"];
export const WESTERN_ZODIAC_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra",
  "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];


export function getKPLords(sidLon) {
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


