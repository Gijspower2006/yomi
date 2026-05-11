export type VerbType =
  | 'godan-u'   // 会う, 歌う, 言う
  | 'godan-ku'  // 書く, 聞く, 歩く
  | 'godan-gu'  // 泳ぐ, 急ぐ
  | 'godan-su'  // 話す, 貸す, 出す
  | 'godan-tsu' // 待つ, 立つ, 持つ
  | 'godan-nu'  // 死ぬ
  | 'godan-bu'  // 遊ぶ, 飛ぶ
  | 'godan-mu'  // 読む, 住む, 飲む
  | 'godan-ru'  // 帰る, 走る, 分かる — godan verbs ending in る
  | 'ichidan'   // 食べる, 見る, 起きる — ichidan (RU-verbs)
  | 'suru'      // 勉強する, 電話する — suru compounds
  | 'kuru';     // 来る (irregular)

export type POSCategory =
  | 'verb'
  | 'i-adj'
  | 'na-adj'
  | 'noun'
  | 'adverb'
  | 'particle'
  | 'conjunction'
  | 'expression'
  | 'pronoun'
  | 'counter'
  | 'prefix';

export interface N5Word {
  id: string;
  kanji: string;      // Main written form (kanji if standard, else kana)
  kana: string;       // Hiragana/katakana reading
  romaji: string;
  pos: POSCategory;
  verbType?: VerbType;
  meanings: string[]; // English meanings, most common first
  altKanji?: string;  // Alternative kanji form
  notes?: string;     // Disambiguation, usage notes, Genki lesson ref
}

export interface ConjugationForm {
  label: string;     // Display name
  kana: string;      // Conjugated kana form
  romaji: string;
  english: string;   // Rough English equivalent
}

export interface VerbConjugationTable {
  dictionary:   ConjugationForm;
  masu:         ConjugationForm;
  masen:        ConjugationForm;
  mashita:      ConjugationForm;
  masendeshita: ConjugationForm;
  te:           ConjugationForm;
  nai:          ConjugationForm;
  nakatta:      ConjugationForm;
  ta:           ConjugationForm;
  potential:    ConjugationForm;
  volitional:   ConjugationForm;
  conditional:  ConjugationForm;
}

export interface AdjConjugationTable {
  dictionary:   ConjugationForm;
  past:         ConjugationForm;
  negative:     ConjugationForm;
  pastNegative: ConjugationForm;
  te:           ConjugationForm;
  adverb:       ConjugationForm;
}
