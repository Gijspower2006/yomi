import { N5Word, VerbConjugationTable, AdjConjugationTable, ConjugationForm } from '../data/n5types';
import { kanaToRomaji } from './kana';

// ── Godan stem transformations ────────────────────────────────────────────────
// For each godan ending character, maps to:
//   masu_i  = i-row char (masu stem)
//   te      = te-form suffix added to dictionary stem (without last char)
//   ta      = ta-form suffix
//   nai_a   = a-row char (nai stem, + ない)
//   pot_e   = e-row char (potential, + る)
//   vol_o   = o-row char (volitional, + う)
const G: Record<string, { i: string; te: string; ta: string; a: string; e: string; o: string }> = {
  'う': { i:'い', te:'って', ta:'った', a:'わ', e:'え', o:'お' },
  'く': { i:'き', te:'いて', ta:'いた', a:'か', e:'け', o:'こ' },
  'ぐ': { i:'ぎ', te:'いで', ta:'いだ', a:'が', e:'げ', o:'ご' },
  'す': { i:'し', te:'して', ta:'した', a:'さ', e:'せ', o:'そ' },
  'つ': { i:'ち', te:'って', ta:'った', a:'た', e:'て', o:'と' },
  'ぬ': { i:'に', te:'んで', ta:'んだ', a:'な', e:'ね', o:'の' },
  'ぶ': { i:'び', te:'んで', ta:'んだ', a:'ば', e:'べ', o:'ぼ' },
  'む': { i:'み', te:'んで', ta:'んだ', a:'ま', e:'め', o:'も' },
  'る': { i:'り', te:'って', ta:'った', a:'ら', e:'れ', o:'ろ' },
};

function f(label: string, kana: string, english: string): ConjugationForm {
  return { label, kana, romaji: kanaToRomaji(kana), english };
}

// ── Verb conjugation ──────────────────────────────────────────────────────────

export function conjugateVerb(word: N5Word): VerbConjugationTable | null {
  if (word.pos !== 'verb') return null;
  const { verbType, kana } = word;
  const meaning = word.meanings[0];

  // Suru compounds (勉強する → 勉強し…)
  if (verbType === 'suru') {
    const stem = kana.slice(0, -2); // drop "する"
    return {
      dictionary:   f('Dictionary', kana,          `to ${meaning}`),
      masu:         f('ます (polite pres.)',  stem+'します',      `[I/we] ${meaning}`),
      masen:        f('ません (polite neg.)', stem+'しません',    `don't ${meaning}`),
      mashita:      f('ました (polite past)', stem+'しました',    `did ${meaning}`),
      masendeshita: f('ませんでした (polite past neg.)', stem+'しませんでした', `didn't ${meaning}`),
      te:           f('て-form',             stem+'して',        `${meaning} (and…)`),
      nai:          f('ない (plain neg.)',   stem+'しない',      `don't ${meaning}`),
      nakatta:      f('なかった (plain past neg.)', stem+'しなかった', `didn't ${meaning}`),
      ta:           f('た (plain past)',     stem+'した',        `did ${meaning}`),
      potential:    f('できる (potential)',  stem+'できる',      `can ${meaning}`),
      volitional:   f('しよう (volitional)', stem+'しよう',     `let's ${meaning}`),
      conditional:  f('したら (conditional)', stem+'したら',    `if [I] ${meaning}`),
    };
  }

  // くる (来る)
  if (verbType === 'kuru') {
    return {
      dictionary:   f('Dictionary',          'くる',        'to come'),
      masu:         f('ます',                'きます',      'come / will come'),
      masen:        f('ません',              'きません',    "don't come"),
      mashita:      f('ました',              'きました',    'came'),
      masendeshita: f('ませんでした',        'きませんでした', "didn't come"),
      te:           f('て-form',             'きて',        'come (and…)'),
      nai:          f('ない',               'こない',      "don't come"),
      nakatta:      f('なかった',           'こなかった',  "didn't come"),
      ta:           f('た',                 'きた',        'came'),
      potential:    f('こられる (potential)','こられる',   'can come'),
      volitional:   f('こよう (volitional)', 'こよう',     "let's come"),
      conditional:  f('きたら (conditional)', 'きたら',    'if [I] come'),
    };
  }

  // Ichidan (RU-verbs): drop る, add endings
  if (verbType === 'ichidan') {
    const stem = kana.slice(0, -1); // drop る
    // Special: いる has negative "いない" not "いない" — already correct
    return {
      dictionary:   f('Dictionary',          kana,             `to ${meaning}`),
      masu:         f('ます',                stem+'ます',      `[I/we] ${meaning}`),
      masen:        f('ません',              stem+'ません',    `don't ${meaning}`),
      mashita:      f('ました',              stem+'ました',    `did ${meaning}`),
      masendeshita: f('ませんでした',        stem+'ませんでした', `didn't ${meaning}`),
      te:           f('て-form',             stem+'て',        `${meaning} (and…)`),
      nai:          f('ない',               stem+'ない',      `don't ${meaning}`),
      nakatta:      f('なかった',           stem+'なかった',  `didn't ${meaning}`),
      ta:           f('た',                 stem+'た',        `did ${meaning}`),
      potential:    f('られる (potential)',  stem+'られる',    `can ${meaning}`),
      volitional:   f('よう (volitional)',   stem+'よう',      `let's ${meaning}`),
      conditional:  f('たら (conditional)', stem+'たら',      `if [I] ${meaning}`),
    };
  }

  // Godan verbs
  const ending = kana.slice(-1);
  const stemKana = kana.slice(0, -1);
  const g = G[ending];
  if (!g) return null;

  // 行く special case: te/ta form is いって/いった not いいて/いいた
  const isIku = kana === 'いく';
  const te = isIku ? 'いって' : stemKana + g.te;
  const ta = isIku ? 'いった' : stemKana + g.ta;

  // ある special case: nai form is ない (not あらない)
  const isAru = kana === 'ある';

  return {
    dictionary:   f('Dictionary',          kana,                    `to ${meaning}`),
    masu:         f('ます',                stemKana+g.i+'ます',     `[I/we] ${meaning}`),
    masen:        f('ません',              stemKana+g.i+'ません',   `don't ${meaning}`),
    mashita:      f('ました',              stemKana+g.i+'ました',   `did ${meaning}`),
    masendeshita: f('ませんでした',        stemKana+g.i+'ませんでした', `didn't ${meaning}`),
    te:           f('て-form',             te,                      `${meaning} (and…)`),
    nai:          f('ない',               isAru ? 'ない' : stemKana+g.a+'ない', `don't ${meaning}`),
    nakatta:      f('なかった',           isAru ? 'なかった' : stemKana+g.a+'なかった', `didn't ${meaning}`),
    ta:           f('た',                 ta,                      `did ${meaning}`),
    potential:    f('える (potential)',    stemKana+g.e+'る',       `can ${meaning}`),
    volitional:   f('おう (volitional)',   stemKana+g.o+'う',       `let's ${meaning}`),
    conditional:  f('たら (conditional)', ta+'ら',                 `if [I] ${meaning}`),
  };
}

// ── Adjective conjugation ─────────────────────────────────────────────────────

export function conjugateAdj(word: N5Word): AdjConjugationTable | null {
  const meaning = word.meanings[0];

  if (word.pos === 'i-adj') {
    // いい is irregular
    const isIi = word.kana === 'いい' || word.kana === 'よい';
    const stem = isIi ? 'よ' : word.kana.slice(0, -1); // drop い

    return {
      dictionary:   f('Dictionary (plain pres.)', word.kana,         `${meaning}`),
      past:         f('かった (plain past)',       stem+'かった',     `was ${meaning}`),
      negative:     f('くない (plain neg.)',       stem+'くない',     `not ${meaning}`),
      pastNegative: f('くなかった (past neg.)',    stem+'くなかった', `was not ${meaning}`),
      te:           f('くて (て-form)',            stem+'くて',       `${meaning} and…`),
      adverb:       f('く (adverb)',               stem+'く',         `${meaning}-ly`),
    };
  }

  if (word.pos === 'na-adj') {
    const stem = word.kana;
    return {
      dictionary:   f('Dictionary (＋だ)',  stem+'だ',       `is ${meaning}`),
      past:         f('だった (past)',      stem+'だった',   `was ${meaning}`),
      negative:     f('じゃない (neg.)',   stem+'じゃない', `not ${meaning}`),
      pastNegative: f('じゃなかった',      stem+'じゃなかった', `was not ${meaning}`),
      te:           f('で (て-form)',       stem+'で',        `${meaning} and…`),
      adverb:       f('に (adverb)',        stem+'に',        `${meaning}-ly`),
    };
  }

  return null;
}
