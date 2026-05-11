export interface KanaChar {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  group: 'basic' | 'dakuten';
}

export const KANA: KanaChar[] = [
  // ── Basic Hiragana ────────────────────────────────────────────────
  { kana: 'あ', romaji: 'a',   type: 'hiragana', group: 'basic' },
  { kana: 'い', romaji: 'i',   type: 'hiragana', group: 'basic' },
  { kana: 'う', romaji: 'u',   type: 'hiragana', group: 'basic' },
  { kana: 'え', romaji: 'e',   type: 'hiragana', group: 'basic' },
  { kana: 'お', romaji: 'o',   type: 'hiragana', group: 'basic' },

  { kana: 'か', romaji: 'ka',  type: 'hiragana', group: 'basic' },
  { kana: 'き', romaji: 'ki',  type: 'hiragana', group: 'basic' },
  { kana: 'く', romaji: 'ku',  type: 'hiragana', group: 'basic' },
  { kana: 'け', romaji: 'ke',  type: 'hiragana', group: 'basic' },
  { kana: 'こ', romaji: 'ko',  type: 'hiragana', group: 'basic' },

  { kana: 'さ', romaji: 'sa',  type: 'hiragana', group: 'basic' },
  { kana: 'し', romaji: 'shi', type: 'hiragana', group: 'basic' },
  { kana: 'す', romaji: 'su',  type: 'hiragana', group: 'basic' },
  { kana: 'せ', romaji: 'se',  type: 'hiragana', group: 'basic' },
  { kana: 'そ', romaji: 'so',  type: 'hiragana', group: 'basic' },

  { kana: 'た', romaji: 'ta',  type: 'hiragana', group: 'basic' },
  { kana: 'ち', romaji: 'chi', type: 'hiragana', group: 'basic' },
  { kana: 'つ', romaji: 'tsu', type: 'hiragana', group: 'basic' },
  { kana: 'て', romaji: 'te',  type: 'hiragana', group: 'basic' },
  { kana: 'と', romaji: 'to',  type: 'hiragana', group: 'basic' },

  { kana: 'な', romaji: 'na',  type: 'hiragana', group: 'basic' },
  { kana: 'に', romaji: 'ni',  type: 'hiragana', group: 'basic' },
  { kana: 'ぬ', romaji: 'nu',  type: 'hiragana', group: 'basic' },
  { kana: 'ね', romaji: 'ne',  type: 'hiragana', group: 'basic' },
  { kana: 'の', romaji: 'no',  type: 'hiragana', group: 'basic' },

  { kana: 'は', romaji: 'ha',  type: 'hiragana', group: 'basic' },
  { kana: 'ひ', romaji: 'hi',  type: 'hiragana', group: 'basic' },
  { kana: 'ふ', romaji: 'fu',  type: 'hiragana', group: 'basic' },
  { kana: 'へ', romaji: 'he',  type: 'hiragana', group: 'basic' },
  { kana: 'ほ', romaji: 'ho',  type: 'hiragana', group: 'basic' },

  { kana: 'ま', romaji: 'ma',  type: 'hiragana', group: 'basic' },
  { kana: 'み', romaji: 'mi',  type: 'hiragana', group: 'basic' },
  { kana: 'む', romaji: 'mu',  type: 'hiragana', group: 'basic' },
  { kana: 'め', romaji: 'me',  type: 'hiragana', group: 'basic' },
  { kana: 'も', romaji: 'mo',  type: 'hiragana', group: 'basic' },

  { kana: 'や', romaji: 'ya',  type: 'hiragana', group: 'basic' },
  { kana: 'ゆ', romaji: 'yu',  type: 'hiragana', group: 'basic' },
  { kana: 'よ', romaji: 'yo',  type: 'hiragana', group: 'basic' },

  { kana: 'ら', romaji: 'ra',  type: 'hiragana', group: 'basic' },
  { kana: 'り', romaji: 'ri',  type: 'hiragana', group: 'basic' },
  { kana: 'る', romaji: 'ru',  type: 'hiragana', group: 'basic' },
  { kana: 'れ', romaji: 're',  type: 'hiragana', group: 'basic' },
  { kana: 'ろ', romaji: 'ro',  type: 'hiragana', group: 'basic' },

  { kana: 'わ', romaji: 'wa',  type: 'hiragana', group: 'basic' },
  { kana: 'を', romaji: 'wo',  type: 'hiragana', group: 'basic' },
  { kana: 'ん', romaji: 'n',   type: 'hiragana', group: 'basic' },

  // ── Dakuten Hiragana ──────────────────────────────────────────────
  { kana: 'が', romaji: 'ga',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぎ', romaji: 'gi',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぐ', romaji: 'gu',  type: 'hiragana', group: 'dakuten' },
  { kana: 'げ', romaji: 'ge',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ご', romaji: 'go',  type: 'hiragana', group: 'dakuten' },

  { kana: 'ざ', romaji: 'za',  type: 'hiragana', group: 'dakuten' },
  { kana: 'じ', romaji: 'ji',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ず', romaji: 'zu',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぜ', romaji: 'ze',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぞ', romaji: 'zo',  type: 'hiragana', group: 'dakuten' },

  { kana: 'だ', romaji: 'da',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぢ', romaji: 'ji',  type: 'hiragana', group: 'dakuten' },
  { kana: 'づ', romaji: 'zu',  type: 'hiragana', group: 'dakuten' },
  { kana: 'で', romaji: 'de',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ど', romaji: 'do',  type: 'hiragana', group: 'dakuten' },

  { kana: 'ば', romaji: 'ba',  type: 'hiragana', group: 'dakuten' },
  { kana: 'び', romaji: 'bi',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぶ', romaji: 'bu',  type: 'hiragana', group: 'dakuten' },
  { kana: 'べ', romaji: 'be',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぼ', romaji: 'bo',  type: 'hiragana', group: 'dakuten' },

  { kana: 'ぱ', romaji: 'pa',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぴ', romaji: 'pi',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぷ', romaji: 'pu',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぺ', romaji: 'pe',  type: 'hiragana', group: 'dakuten' },
  { kana: 'ぽ', romaji: 'po',  type: 'hiragana', group: 'dakuten' },

  // ── Basic Katakana ────────────────────────────────────────────────
  { kana: 'ア', romaji: 'a',   type: 'katakana', group: 'basic' },
  { kana: 'イ', romaji: 'i',   type: 'katakana', group: 'basic' },
  { kana: 'ウ', romaji: 'u',   type: 'katakana', group: 'basic' },
  { kana: 'エ', romaji: 'e',   type: 'katakana', group: 'basic' },
  { kana: 'オ', romaji: 'o',   type: 'katakana', group: 'basic' },

  { kana: 'カ', romaji: 'ka',  type: 'katakana', group: 'basic' },
  { kana: 'キ', romaji: 'ki',  type: 'katakana', group: 'basic' },
  { kana: 'ク', romaji: 'ku',  type: 'katakana', group: 'basic' },
  { kana: 'ケ', romaji: 'ke',  type: 'katakana', group: 'basic' },
  { kana: 'コ', romaji: 'ko',  type: 'katakana', group: 'basic' },

  { kana: 'サ', romaji: 'sa',  type: 'katakana', group: 'basic' },
  { kana: 'シ', romaji: 'shi', type: 'katakana', group: 'basic' },
  { kana: 'ス', romaji: 'su',  type: 'katakana', group: 'basic' },
  { kana: 'セ', romaji: 'se',  type: 'katakana', group: 'basic' },
  { kana: 'ソ', romaji: 'so',  type: 'katakana', group: 'basic' },

  { kana: 'タ', romaji: 'ta',  type: 'katakana', group: 'basic' },
  { kana: 'チ', romaji: 'chi', type: 'katakana', group: 'basic' },
  { kana: 'ツ', romaji: 'tsu', type: 'katakana', group: 'basic' },
  { kana: 'テ', romaji: 'te',  type: 'katakana', group: 'basic' },
  { kana: 'ト', romaji: 'to',  type: 'katakana', group: 'basic' },

  { kana: 'ナ', romaji: 'na',  type: 'katakana', group: 'basic' },
  { kana: 'ニ', romaji: 'ni',  type: 'katakana', group: 'basic' },
  { kana: 'ヌ', romaji: 'nu',  type: 'katakana', group: 'basic' },
  { kana: 'ネ', romaji: 'ne',  type: 'katakana', group: 'basic' },
  { kana: 'ノ', romaji: 'no',  type: 'katakana', group: 'basic' },

  { kana: 'ハ', romaji: 'ha',  type: 'katakana', group: 'basic' },
  { kana: 'ヒ', romaji: 'hi',  type: 'katakana', group: 'basic' },
  { kana: 'フ', romaji: 'fu',  type: 'katakana', group: 'basic' },
  { kana: 'ヘ', romaji: 'he',  type: 'katakana', group: 'basic' },
  { kana: 'ホ', romaji: 'ho',  type: 'katakana', group: 'basic' },

  { kana: 'マ', romaji: 'ma',  type: 'katakana', group: 'basic' },
  { kana: 'ミ', romaji: 'mi',  type: 'katakana', group: 'basic' },
  { kana: 'ム', romaji: 'mu',  type: 'katakana', group: 'basic' },
  { kana: 'メ', romaji: 'me',  type: 'katakana', group: 'basic' },
  { kana: 'モ', romaji: 'mo',  type: 'katakana', group: 'basic' },

  { kana: 'ヤ', romaji: 'ya',  type: 'katakana', group: 'basic' },
  { kana: 'ユ', romaji: 'yu',  type: 'katakana', group: 'basic' },
  { kana: 'ヨ', romaji: 'yo',  type: 'katakana', group: 'basic' },

  { kana: 'ラ', romaji: 'ra',  type: 'katakana', group: 'basic' },
  { kana: 'リ', romaji: 'ri',  type: 'katakana', group: 'basic' },
  { kana: 'ル', romaji: 'ru',  type: 'katakana', group: 'basic' },
  { kana: 'レ', romaji: 're',  type: 'katakana', group: 'basic' },
  { kana: 'ロ', romaji: 'ro',  type: 'katakana', group: 'basic' },

  { kana: 'ワ', romaji: 'wa',  type: 'katakana', group: 'basic' },
  { kana: 'ヲ', romaji: 'wo',  type: 'katakana', group: 'basic' },
  { kana: 'ン', romaji: 'n',   type: 'katakana', group: 'basic' },

  // ── Dakuten Katakana ──────────────────────────────────────────────
  { kana: 'ガ', romaji: 'ga',  type: 'katakana', group: 'dakuten' },
  { kana: 'ギ', romaji: 'gi',  type: 'katakana', group: 'dakuten' },
  { kana: 'グ', romaji: 'gu',  type: 'katakana', group: 'dakuten' },
  { kana: 'ゲ', romaji: 'ge',  type: 'katakana', group: 'dakuten' },
  { kana: 'ゴ', romaji: 'go',  type: 'katakana', group: 'dakuten' },

  { kana: 'ザ', romaji: 'za',  type: 'katakana', group: 'dakuten' },
  { kana: 'ジ', romaji: 'ji',  type: 'katakana', group: 'dakuten' },
  { kana: 'ズ', romaji: 'zu',  type: 'katakana', group: 'dakuten' },
  { kana: 'ゼ', romaji: 'ze',  type: 'katakana', group: 'dakuten' },
  { kana: 'ゾ', romaji: 'zo',  type: 'katakana', group: 'dakuten' },

  { kana: 'ダ', romaji: 'da',  type: 'katakana', group: 'dakuten' },
  { kana: 'ヂ', romaji: 'ji',  type: 'katakana', group: 'dakuten' },
  { kana: 'ヅ', romaji: 'zu',  type: 'katakana', group: 'dakuten' },
  { kana: 'デ', romaji: 'de',  type: 'katakana', group: 'dakuten' },
  { kana: 'ド', romaji: 'do',  type: 'katakana', group: 'dakuten' },

  { kana: 'バ', romaji: 'ba',  type: 'katakana', group: 'dakuten' },
  { kana: 'ビ', romaji: 'bi',  type: 'katakana', group: 'dakuten' },
  { kana: 'ブ', romaji: 'bu',  type: 'katakana', group: 'dakuten' },
  { kana: 'ベ', romaji: 'be',  type: 'katakana', group: 'dakuten' },
  { kana: 'ボ', romaji: 'bo',  type: 'katakana', group: 'dakuten' },

  { kana: 'パ', romaji: 'pa',  type: 'katakana', group: 'dakuten' },
  { kana: 'ピ', romaji: 'pi',  type: 'katakana', group: 'dakuten' },
  { kana: 'プ', romaji: 'pu',  type: 'katakana', group: 'dakuten' },
  { kana: 'ペ', romaji: 'pe',  type: 'katakana', group: 'dakuten' },
  { kana: 'ポ', romaji: 'po',  type: 'katakana', group: 'dakuten' },
];
