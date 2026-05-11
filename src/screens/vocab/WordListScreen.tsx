import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, SectionList, Modal, ScrollView,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { N5Word, VerbConjugationTable, AdjConjugationTable, ConjugationForm, POSCategory } from '../../data/n5types';
import { N5_WORDS, POSFilter } from '../../data/n5words';
import { conjugateVerb, conjugateAdj } from '../../utils/conjugation';
import { kanaRow, KANA_ROW_ORDER } from '../../utils/kana';
import { speakJapanese } from '../../services/speech';
import { AppSettings } from '../../types';
import { BACKEND_URL } from '../../services/aiService';
import { Ionicons } from '@expo/vector-icons';
import { useSavedWords } from '../../hooks/useSavedWords';

interface Props {
  level: string;
  posFilter: POSFilter;
  title: string;
  onBack: () => void;
  settings: AppSettings;
}

const CARD_GAP = 10;
const CARD_PADDING = 14;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

// ── POS metadata ──────────────────────────────────────────────────────────────

const POS_COLORS: Record<string, string> = {
  verb:        '#EF233C',
  'i-adj':     '#06D6A0',
  'na-adj':    '#118AB2',
  noun:        '#9B5DE5',
  adverb:      '#F4A261',
  pronoun:     '#6E7191',
  expression:  '#6E7191',
  conjunction: '#6E7191',
  particle:    '#6E7191',
  counter:     '#6E7191',
  prefix:      '#6E7191',
};

const POS_META: Record<string, { label: string; short: string; color: string }> = {
  'verb':        { label: 'Verb 動詞',       short: '動',   color: '#EF233C' },
  'i-adj':       { label: 'I-Adj い形容詞',  short: 'い形', color: '#06D6A0' },
  'na-adj':      { label: 'Na-Adj な形容詞', short: 'な形', color: '#118AB2' },
  'noun':        { label: 'Noun 名詞',       short: '名',   color: '#9B5DE5' },
  'adverb':      { label: 'Adverb 副詞',     short: '副',   color: '#F4A261' },
  'pronoun':     { label: 'Pronoun 代名詞',  short: '代',   color: '#6E7191' },
  'expression':  { label: 'Expression',      short: '表',   color: '#6E7191' },
  'conjunction': { label: 'Conjunction',     short: '接',   color: '#6E7191' },
  'particle':    { label: 'Particle 助詞',   short: '助',   color: '#6E7191' },
  'counter':     { label: 'Counter 助数詞',  short: '数',   color: '#6E7191' },
  'prefix':      { label: 'Prefix 接頭辞',   short: '接頭', color: '#6E7191' },
};

const VERB_TYPE_LABELS: Record<string, string> = {
  'godan-u':   'Godan (Group 1) — う ending',
  'godan-ku':  'Godan (Group 1) — く ending',
  'godan-gu':  'Godan (Group 1) — ぐ ending',
  'godan-su':  'Godan (Group 1) — す ending',
  'godan-tsu': 'Godan (Group 1) — つ ending',
  'godan-nu':  'Godan (Group 1) — ぬ ending',
  'godan-bu':  'Godan (Group 1) — ぶ ending',
  'godan-mu':  'Godan (Group 1) — む ending',
  'godan-ru':  'Godan (Group 1) — る ending',
  'ichidan':   'Ichidan (Group 2) — RU-verb',
  'suru':      'Irregular — する compound',
  'kuru':      'Irregular — 来る (kuru)',
};

// ── Word card (half-width) ────────────────────────────────────────────────────

const WordCard = React.memo(({ word, onPress, side }: {
  word: N5Word; onPress: () => void; side: 'left' | 'right';
}) => {
  const pm = POS_META[word.pos] ?? POS_META['noun'];
  const showKanji = word.kanji !== word.kana;
  return (
    <TouchableOpacity
      style={[styles.card, side === 'right' && styles.cardRight]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Colored top stripe */}
      <View style={[styles.cardAccent, { backgroundColor: pm.color }]} />

      {/* Japanese */}
      <Text style={styles.cardKanji} numberOfLines={1} adjustsFontSizeToFit>
        {word.kanji}
      </Text>
      {showKanji && (
        <Text style={[styles.cardKana, { color: pm.color }]} numberOfLines={1}>
          {word.kana}
        </Text>
      )}
      <Text style={styles.cardRomaji} numberOfLines={1}>{word.romaji}</Text>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Meaning + POS badge */}
      <Text style={styles.cardMeaning} numberOfLines={2}>{word.meanings[0]}</Text>
      <View style={[styles.posBadge, { backgroundColor: pm.color + '18' }]}>
        <Text style={[styles.posShort, { color: pm.color }]}>{pm.short}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ── Card row (pair of words) ──────────────────────────────────────────────────

type CardRowItem = { type: 'row'; left: N5Word; right: N5Word | null };

const CardRow = React.memo(({ item, onPress }: { item: CardRowItem; onPress: (w: N5Word) => void }) => (
  <View style={styles.cardRow}>
    <WordCard word={item.left} onPress={() => onPress(item.left)} side="left" />
    {item.right
      ? <WordCard word={item.right} onPress={() => onPress(item.right!)} side="right" />
      : <View style={[styles.card, styles.cardRight, styles.cardEmpty]} />
    }
  </View>
));

// ── Conjugation table ─────────────────────────────────────────────────────────

function ConjTable({ forms }: { forms: ConjugationForm[] }) {
  return (
    <View style={styles.conjTable}>
      {forms.map((f, i) => (
        <View key={f.label} style={[styles.conjRow, i % 2 === 0 && styles.conjRowAlt]}>
          <Text style={styles.conjLabel}>{f.label}</Text>
          <View style={styles.conjRight}>
            <TouchableOpacity onPress={() => speakJapanese(f.kana)}>
              <Text style={styles.conjKana}>{f.kana}</Text>
            </TouchableOpacity>
            <Text style={styles.conjRomaji}>{f.romaji}</Text>
            <Text style={styles.conjEnglish}>{f.english}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Word detail modal ─────────────────────────────────────────────────────────

function WordDetailModal({ word, visible, onClose, settings }: {
  word: N5Word | null; visible: boolean; onClose: () => void; settings: AppSettings;
}) {
  const { isSaved, toggle } = useSavedWords();
  const [activeTab, setActiveTab] = useState<'info' | 'conjugation' | 'examples'>('info');
  const [examples, setExamples] = useState<string>('');
  const [loadingEx, setLoadingEx] = useState(false);
  const [jishoData, setJishoData] = useState<any>(null);

  const verbConj = word?.pos === 'verb'   ? conjugateVerb(word) : null;
  const adjConj  = (word?.pos === 'i-adj' || word?.pos === 'na-adj') ? conjugateAdj(word) : null;
  const hasConj  = !!(verbConj || adjConj);

  const loadExamples = useCallback(async () => {
    if (!word || examples) return;
    setLoadingEx(true);
    try {
      const res = await fetch(`${BACKEND_URL}/examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.kanji, kana: word.kana, english: word.meanings[0],
          level: settings.level, provider: settings.provider,
        }),
      });
      const data = await res.json() as any;
      setExamples(data.text ?? 'No examples available.');
    } catch {
      setExamples('Could not load examples. Check your connection.');
    } finally {
      setLoadingEx(false);
    }
  }, [word, examples, settings]);

  const loadJisho = useCallback(async () => {
    if (!word || jishoData) return;
    try {
      const res = await fetch(`${BACKEND_URL}/jisho?keyword=${encodeURIComponent(word.kana)}`);
      const data = await res.json() as any;
      setJishoData(data?.data?.[0] ?? null);
    } catch {}
  }, [word, jishoData]);

  React.useEffect(() => {
    if (visible && word) {
      setActiveTab('info');
      setExamples('');
      setJishoData(null);
      loadJisho();
    }
  }, [visible, word?.id]);

  React.useEffect(() => {
    if (activeTab === 'examples') loadExamples();
  }, [activeTab]);

  if (!word) return null;
  const pm = POS_META[word.pos] ?? POS_META['noun'];
  const adjForms: ConjugationForm[] = adjConj ? Object.values(adjConj) : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.sheetHandle} />

          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.posBadge, { backgroundColor: pm.color + '20', flex: 1, marginHorizontal: 8 }]}>
              <Text style={[styles.posShort, { color: pm.color }]}>{pm.label}</Text>
            </View>
            <TouchableOpacity onPress={() => toggle(word.id)} style={styles.closeBtn}>
              <Ionicons
                name={isSaved(word.id) ? 'star' : 'star-outline'}
                size={22}
                color={isSaved(word.id) ? Colors.warning : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Hero — primary blue background */}
          <View style={styles.hero}>
            <Text style={styles.heroKanji}>{word.kanji}</Text>
            {word.kanji !== word.kana && <Text style={styles.heroKana}>{word.kana}</Text>}
            <Text style={styles.heroRomaji}>{word.romaji}</Text>
            <TouchableOpacity style={styles.heroSpeak} onPress={() => speakJapanese(word.kana)}>
              <Ionicons name="volume-medium" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroSpeakText}>Hear pronunciation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {(['info', ...(hasConj ? ['conjugation'] : []), 'examples'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t as any)}
              >
                <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                  {t === 'info' ? 'Info' : t === 'conjugation' ? 'Conjugation' : 'Examples'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' && (
              <View style={styles.tabContent}>
                <Text style={styles.infoSection}>Meanings</Text>
                {word.meanings.map((m, i) => (
                  <Text key={i} style={styles.meaningItem}>{i + 1}. {m}</Text>
                ))}
                {word.altKanji && (
                  <>
                    <Text style={styles.infoSection}>Also written</Text>
                    <Text style={styles.infoValue}>{word.altKanji}</Text>
                  </>
                )}
                {word.notes && (
                  <>
                    <Text style={styles.infoSection}>Notes</Text>
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>{word.notes}</Text>
                    </View>
                  </>
                )}
                {word.pos === 'verb' && word.verbType && (
                  <>
                    <Text style={styles.infoSection}>Verb Type</Text>
                    <Text style={styles.infoValue}>{VERB_TYPE_LABELS[word.verbType] ?? word.verbType}</Text>
                  </>
                )}
                {jishoData && (
                  <>
                    <Text style={styles.infoSection}>From Jisho (JMdict)</Text>
                    <View style={styles.jishoBox}>
                      {jishoData.is_common && (
                        <View style={styles.commonBadge}>
                          <Text style={styles.commonText}>★ Common word</Text>
                        </View>
                      )}
                      {jishoData.jlpt?.length > 0 && <Text style={styles.jishoMeta}>JLPT: {jishoData.jlpt.join(', ')}</Text>}
                      {jishoData.tags?.length > 0 && <Text style={styles.jishoMeta}>Tags: {jishoData.tags.join(', ')}</Text>}
                    </View>
                  </>
                )}
              </View>
            )}

            {activeTab === 'conjugation' && (
              <View style={styles.tabContent}>
                {verbConj && (
                  <>
                    <Text style={styles.infoSection}>Polite Forms (丁寧語)</Text>
                    <ConjTable forms={[verbConj.masu, verbConj.masen, verbConj.mashita, verbConj.masendeshita]} />
                    <Text style={[styles.infoSection, { marginTop: 20 }]}>Plain Forms (普通形)</Text>
                    <ConjTable forms={[verbConj.dictionary, verbConj.nai, verbConj.ta, verbConj.nakatta]} />
                    <Text style={[styles.infoSection, { marginTop: 20 }]}>Other Forms</Text>
                    <ConjTable forms={[verbConj.te, verbConj.potential, verbConj.volitional, verbConj.conditional]} />
                  </>
                )}
                {adjConj && (
                  <>
                    <Text style={styles.infoSection}>Adjective Forms</Text>
                    <ConjTable forms={adjForms} />
                  </>
                )}
              </View>
            )}

            {activeTab === 'examples' && (
              <View style={styles.tabContent}>
                {loadingEx ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={Colors.primary} />
                    <Text style={styles.loadingText}>Generating examples…</Text>
                  </View>
                ) : (
                  <Text style={styles.examplesText}>{examples}</Text>
                )}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function chunkPairs(words: N5Word[]): CardRowItem[] {
  const rows: CardRowItem[] = [];
  for (let i = 0; i < words.length; i += 2) {
    rows.push({ type: 'row', left: words[i], right: words[i + 1] ?? null });
  }
  return rows;
}

const POS_ORDER: POSCategory[] = ['verb','i-adj','na-adj','noun','adverb','pronoun','expression','conjunction','particle','counter','prefix'];

// ── Main screen ───────────────────────────────────────────────────────────────

export default function WordListScreen({ level, posFilter, title, onBack, settings }: Props) {
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<N5Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const baseWords = useMemo(() => {
    if (posFilter === 'all') return N5_WORDS;
    if (posFilter === 'adverb') return N5_WORDS.filter(w => !['verb','i-adj','na-adj','noun'].includes(w.pos));
    return N5_WORDS.filter(w => w.pos === posFilter);
  }, [posFilter]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return baseWords;
    return baseWords.filter(w =>
      w.kana.includes(q) ||
      w.kanji.includes(q) ||
      w.romaji.toLowerCase().includes(q) ||
      w.meanings.some(m => m.toLowerCase().includes(q))
    );
  }, [baseWords, query]);

  const sections = useMemo(() => {
    if (query) {
      return [{
        title: `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`,
        data: chunkPairs(filtered),
      }];
    }

    if (posFilter === 'all') {
      const groups: Partial<Record<POSCategory, N5Word[]>> = {};
      for (const w of filtered) (groups[w.pos] ??= []).push(w);
      return POS_ORDER
        .filter(p => groups[p]?.length)
        .map(p => ({
          title: `${POS_META[p]?.label ?? p}  ·  ${groups[p]!.length}`,
          data: chunkPairs(groups[p]!),
        }));
    }

    if (posFilter === 'verb') {
      type VKey = 'godan' | 'ichidan' | 'suru' | 'kuru';
      const VERB_GROUP_ORDER: VKey[] = ['godan', 'ichidan', 'suru', 'kuru'];
      const VERB_GROUP_LABELS: Record<VKey, string> = {
        godan:   'Group 1 — Godan Verbs 五段動詞',
        ichidan: 'Group 2 — Ichidan Verbs 一段動詞',
        suru:    'する Compound Verbs',
        kuru:    'Irregular — 来る (kuru)',
      };
      const groups: Partial<Record<VKey, N5Word[]>> = {};
      for (const w of filtered) {
        const key: VKey = w.verbType === 'ichidan' ? 'ichidan'
          : w.verbType === 'suru' ? 'suru'
          : w.verbType === 'kuru' ? 'kuru'
          : 'godan';
        (groups[key] ??= []).push(w);
      }
      return VERB_GROUP_ORDER
        .filter(k => groups[k]?.length)
        .map(k => ({
          title: `${VERB_GROUP_LABELS[k]}  ·  ${groups[k]!.length}`,
          data: chunkPairs(groups[k]!),
        }));
    }

    const groups: Record<string, N5Word[]> = {};
    for (const w of filtered) (groups[kanaRow(w.kana)] ??= []).push(w);
    return KANA_ROW_ORDER
      .filter(r => groups[r]?.length)
      .map(r => ({
        title: `${r}  ·  ${groups[r].length}`,
        data: chunkPairs(groups[r]),
      }));
  }, [filtered, query, posFilter]);

  const openWord = useCallback((word: N5Word) => {
    setSelectedWord(word);
    setModalVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>JLPT {level}  ·  {baseWords.length} words</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search kana, kanji, romaji, or meaning…"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Grid */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.left.id}-${index}`}
        renderItem={({ item }) => <CardRow item={item} onPress={openWord} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
      />

      <WordDetailModal
        word={selectedWord}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        settings={settings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 70 },
  backChevron: { fontSize: 26, color: Colors.primary, lineHeight: 30, marginRight: 2 },
  backLabel: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  searchRow: {
    paddingHorizontal: CARD_PADDING,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },

  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: CARD_PADDING,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
  },
  listContent: { padding: CARD_PADDING, paddingBottom: 40 },

  // Card grid
  cardRow: {
    flexDirection: 'row',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    paddingBottom: 12,
  },
  cardRight: { marginLeft: CARD_GAP },
  cardEmpty: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  cardAccent: { height: 4, width: '100%', marginBottom: 12 },
  cardKanji: {
    fontSize: 28,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  cardKana: {
    fontSize: 13,
    fontFamily: 'NotoSansJP_600SemiBold',
    textAlign: 'center',
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  cardRomaji: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  cardMeaning: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
    lineHeight: 17,
  },
  posBadge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  posShort: { fontSize: 10, fontFamily: 'NotoSansJP_700Bold' },

  // Modal / bottom sheet
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    height: '88%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSansJP_700Bold' },
  // Hero uses primary blue background
  hero: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  heroKanji: { fontSize: 56, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.white },
  heroKana: { fontSize: 22, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroRomaji: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  heroSpeak: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  heroSpeakText: { color: Colors.white, fontFamily: 'NotoSansJP_600SemiBold', fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },
  tabTextActive: { color: Colors.primary, fontFamily: 'NotoSansJP_700Bold' },
  modalScroll: { flex: 1 },
  tabContent: { padding: 16 },
  infoSection: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  meaningItem: { fontSize: 15, color: Colors.text, marginBottom: 4 },
  infoValue: { fontSize: 15, color: Colors.text },
  notesBox: { backgroundColor: Colors.inputBg, borderRadius: 10, padding: 12 },
  notesText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  jishoBox: { backgroundColor: Colors.inputBg, borderRadius: 10, padding: 12, gap: 4 },
  jishoMeta: { fontSize: 13, color: Colors.textSecondary },
  commonBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  commonText: { fontSize: 12, color: Colors.success, fontFamily: 'NotoSansJP_700Bold' },
  conjTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  conjRow: { padding: 12, backgroundColor: Colors.card },
  conjRowAlt: { backgroundColor: Colors.background },
  conjLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold', marginBottom: 4 },
  conjRight: { gap: 2 },
  conjKana: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  conjRomaji: { fontSize: 12, color: Colors.primary },
  conjEnglish: { fontSize: 12, color: Colors.textSecondary },
  loadingBox: { alignItems: 'center', padding: 32, gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  examplesText: { fontSize: 15, color: Colors.text, lineHeight: 26 },
});
