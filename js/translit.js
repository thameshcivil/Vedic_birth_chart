// Converts Sanskrit written in Devanagari into the other scripts the app supports.
// Telugu, Kannada and Malayalam share Devanagari's Unicode layout, so most letters map
// by a fixed offset. Tamil has no letters for aspirated / voiced stops, so it follows
// the convention of printed Sanskrit books: the base letter plus a superscript number
// (க க² க³ க⁴). Latin output uses IAST.

const OFFSET = { te: 0x300, kn: 0x380, ml: 0x400 };
const BLOCK_START = { te: 0x0c00, kn: 0x0c80, ml: 0x0d00 };
const OM = { te: "ఓం", kn: "ಓಂ", ml: "ഓം", ta: "ஓம்", latin: "oṃ" };

function toBrahmic(text, lang) {
  const off = OFFSET[lang];
  let out = "";
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c === 0x0950) { out += OM[lang]; continue; }
    if (c === 0x093c) continue; // nukta
    if (c >= 0x0900 && c <= 0x0963) {
      const t = c + off;
      // keep characters that have no counterpart in the target block
      out += t >= BLOCK_START[lang] && t < BLOCK_START[lang] + 0x80 ? String.fromCodePoint(t) : ch;
    } else {
      out += ch;
    }
  }
  return out;
}

// ----- Tamil -----
const TA_CONS = {
  "क": ["க", ""], "ख": ["க", "²"], "ग": ["க", "³"], "घ": ["க", "⁴"], "ङ": ["ங", ""],
  "च": ["ச", ""], "छ": ["ச", "²"], "ज": ["ஜ", ""], "झ": ["ஜ", "²"], "ञ": ["ஞ", ""],
  "ट": ["ட", ""], "ठ": ["ட", "²"], "ड": ["ட", "³"], "ढ": ["ட", "⁴"], "ण": ["ண", ""],
  "त": ["த", ""], "थ": ["த", "²"], "द": ["த", "³"], "ध": ["த", "⁴"], "न": ["ந", ""],
  "प": ["ப", ""], "फ": ["ப", "²"], "ब": ["ப", "³"], "भ": ["ப", "⁴"], "म": ["ம", ""],
  "य": ["ய", ""], "र": ["ர", ""], "ल": ["ல", ""], "व": ["வ", ""], "श": ["ஶ", ""],
  "ष": ["ஷ", ""], "स": ["ஸ", ""], "ह": ["ஹ", ""], "ळ": ["ள", ""]
};
const TA_VOWEL = {
  "अ": "அ", "आ": "ஆ", "इ": "இ", "ई": "ஈ", "उ": "உ", "ऊ": "ஊ", "ऋ": "ரு", "ॠ": "ரூ",
  "ऌ": "லு", "ए": "ஏ", "ऐ": "ஐ", "ओ": "ஓ", "औ": "ஔ"
};
const TA_MATRA = {
  "ा": "ா", "ि": "ி", "ी": "ீ", "ु": "ு", "ू": "ூ", "ृ": "்ரு", "ॄ": "்ரூ",
  "े": "ே", "ै": "ை", "ो": "ோ", "ौ": "ௌ", "्": "்"
};
const DENTALS = new Set(["त", "थ", "द", "ध"]);
const isDevaLetter = (ch) => /[ऀ-ॿ]/.test(ch);

function toTamil(text) {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (TA_CONS[ch]) {
      let [base, sup] = TA_CONS[ch];
      if (ch === "न") {
        const prev = chars[i - 1];
        const next2 = chars[i + 2];
        const wordStart = !prev || !isDevaLetter(prev);
        const beforeDental = chars[i + 1] === "्" && DENTALS.has(next2);
        base = wordStart || beforeDental ? "ந" : "ன";
      }
      const next = chars[i + 1];
      if (next === "ृ" || next === "ॄ") {
        // vocalic r is written as consonant + pulli + ரு, the number staying with the consonant
        out += base + "்" + sup + (next === "ृ" ? "ரு" : "ரூ");
        i++;
      } else if (TA_MATRA[next]) {
        out += base + TA_MATRA[next] + sup;
        i++;
      } else {
        out += base + sup;
      }
    } else if (TA_VOWEL[ch]) {
      out += TA_VOWEL[ch];
    } else if (ch === "ं") {
      out += "ம்";
    } else if (ch === "ः") {
      out += "꞉";
    } else if (ch === "ँ") {
      out += "ம்";
    } else if (ch === "ऽ") {
      out += "'";
    } else if (ch === "ॐ") {
      out += OM.ta;
    } else if (ch === "़") {
      // nukta: ignore
    } else {
      out += ch;
    }
  }
  return out;
}

// ----- Latin (IAST) -----
const LA_CONS = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ṅ", "च": "c", "छ": "ch", "ज": "j", "झ": "jh", "ञ": "ñ",
  "ट": "ṭ", "ठ": "ṭh", "ड": "ḍ", "ढ": "ḍh", "ण": "ṇ", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "ś", "ष": "ṣ", "स": "s", "ह": "h", "ळ": "ḻ"
};
const LA_VOWEL = {
  "अ": "a", "आ": "ā", "इ": "i", "ई": "ī", "उ": "u", "ऊ": "ū", "ऋ": "ṛ", "ॠ": "ṝ", "ऌ": "ḷ",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au"
};
const LA_MATRA = {
  "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au"
};

function toLatin(text) {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (LA_CONS[ch]) {
      out += LA_CONS[ch];
      const next = chars[i + 1];
      if (next === "्") { i++; }
      else if (LA_MATRA[next]) { out += LA_MATRA[next]; i++; }
      else if (next === "़") { out += "a"; i++; }
      else out += "a";
    } else if (LA_VOWEL[ch]) out += LA_VOWEL[ch];
    else if (ch === "ं") out += "ṃ";
    else if (ch === "ः") out += "ḥ";
    else if (ch === "ँ") out += "m̐";
    else if (ch === "ऽ") out += "'";
    else if (ch === "ॐ") out += OM.latin;
    else if (ch === "।") out += "|";
    else if (ch === "॥") out += "||";
    else out += ch;
  }
  return out;
}

/** Devanagari Sanskrit -> the script used by a display language. */
export function transliterate(text, lang) {
  if (!text) return "";
  switch (lang) {
    case "sa": case "hi": return text;
    case "te": case "kn": case "ml": return toBrahmic(text, lang);
    case "ta": return toTamil(text);
    default: return toLatin(text);
  }
}

/** Plain-English rendering without diacritics, for compact labels. */
export function toPlainLatin(text) {
  return toLatin(text)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ś|ṣ/g, "sh").replace(/ṃ/g, "m").replace(/ḥ/g, "h");
}
