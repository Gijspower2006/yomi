// Hiragana → romaji mapping (JMdict/Jisho-compatible romanization)
const TABLE: Record<string, string> = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','ゐ':'wi','ゑ':'we','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
};

export function kanaToRomaji(kana: string): string {
  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (kana[i] === 'っ') {
      // Double the first consonant of the next mora
      const peek = kana[i + 1];
      if (peek) {
        const next2 = TABLE[kana[i + 1] + kana[i + 2]] ?? TABLE[peek] ?? '';
        result += next2[0] ?? '';
      }
      i++;
      continue;
    }
    if (kana[i] === 'ー') { i++; continue; } // long vowel mark — skip
    // Try 2-char combo (e.g. きゃ)
    if (i + 1 < kana.length) {
      const two = kana[i] + kana[i + 1];
      if (TABLE[two]) { result += TABLE[two]; i += 2; continue; }
    }
    result += TABLE[kana[i]] ?? kana[i];
    i++;
  }
  return result;
}

/** Heuristic: does this string contain Japanese script? */
export function hasJapanese(s: string): boolean {
  return /[぀-ゟ゠-ヿ一-龯]/.test(s);
}

/** First character of kana for grouping (returns the row character) */
export function kanaRow(kana: string): string {
  const first = kana[0];
  const rows: Record<string, string> = {
    'あ':'あ行','い':'あ行','う':'あ行','え':'あ行','お':'あ行',
    'か':'か行','き':'か行','く':'か行','け':'か行','こ':'か行',
    'が':'か行','ぎ':'か行','ぐ':'か行','げ':'か行','ご':'か行',
    'さ':'さ行','し':'さ行','す':'さ行','せ':'さ行','そ':'さ行',
    'ざ':'さ行','じ':'さ行','ず':'さ行','ぜ':'さ行','ぞ':'さ行',
    'た':'た行','ち':'た行','つ':'た行','て':'た行','と':'た行',
    'だ':'た行','で':'た行','ど':'た行',
    'な':'な行','に':'な行','ぬ':'な行','ね':'な行','の':'な行',
    'は':'は行','ひ':'は行','ふ':'は行','へ':'は行','ほ':'は行',
    'ば':'は行','び':'は行','ぶ':'は行','べ':'は行','ぼ':'は行',
    'ぱ':'は行','ぴ':'は行','ぷ':'は行','ぺ':'は行','ぽ':'は行',
    'ま':'ま行','み':'ま行','む':'ま行','め':'ま行','も':'ま行',
    'や':'や行','ゆ':'や行','よ':'や行',
    'ら':'ら行','り':'ら行','る':'ら行','れ':'ら行','ろ':'ら行',
    'わ':'わ行','を':'わ行','ん':'ん',
  };
  return rows[first] ?? '他';
}

export const KANA_ROW_ORDER = ['あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行','わ行','ん','他'];
