import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, SectionList, Modal, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { N5Word, VerbConjugationTable, AdjConjugationTable, ConjugationForm, POSCategory } from '../data/n5types';
import { N5_WORDS, POSFilter } from '../data/n5words';
import { conjugateVerb, conjugateAdj } from '../utils/conjugation';
import { kanaRow, KANA_ROW_ORDER } from '../utils/kana';
import { speakJapanese } from '../services/speech';
import { AppSettings } from '../types';
import { BACKEND_URL } from '../services/aiService';

interface Props { settings: AppSettings }

// ── POS metadata ──────────────────────────────────────────────────────────────

const POS_META: Record<string, { label: string; short: string; color: string }> = {
  'verb':   { label: 'Verb 動詞',      short: '動',  color: '#D4622A' },
  'i-adj':  { label: 'I-Adj い形容詞', short: 'い形', color: '#2E7D5A' },
  'na-adj': { label: 'Na-Adj な形容詞',short: 'な形', color: '#1565C0' },
  'noun':   { label: 'Noun 名詞',      short: '名',  color: '#6A1B9A' },
  'adverb': { label: 'Adverb 副詞',    short: '副',  color: '#C77800' },
  'pronoun':{ label: 'Pronoun 代名詞', short: '代',  color: '#37474F' },
  'expression':{ label: 'Expression',  short: '表',  color: '#546E7A' },
  'conjunction':{ label: 'Conjunction',short: '接',  color: '#546E7A' },
  'particle':{ label: 'Particle 助詞', short: '助',  color: '#546E7A' },
  'counter':{ label: 'Counter 助数詞', short: '数',  color: '#546E7A' },
  'prefix': { label: 'Prefix 接頭辞',  short: '接頭', color: '#546E7A' },
};

const FILTERS: { key: POSFilter; label: string }[] = [
  { key:'all',    label:'All' },
  { key:'verb',   label:'Verbs' },
  { key:'i-adj',  label:'い-Adj' },
  { key:'na-adj', label:'な-Adj' },
  { key:'noun',   label:'Nouns' },
  { key:'adverb', label:'Adverbs' },
];

// ── Word list row ─────────────────────────────────────────────────────────────

const WordRow = React.memo(({ word, onPress }: { word: N5Word; onPress: () => void }) => {
  const pm = POS_META[word.pos] ?? POS_META['noun'];
  const showKanji = word.kanji !== word.kana;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowKanji}>{word.kanji}</Text>
        {showKanji && <Text style={styles.rowKana}>【{word.kana}】</Text>}
        <Text style={styles.rowRomaji}>{word.romaji}</Text>
      </View>
      <View style={styles.rowRight}>
        <View style={[styles.posBadge, { backgroundColor: pm.color + '20', borderColor: pm.color + '60' }]}>
          <Text style={[styles.posShort, { color: pm.color }]}>{pm.short}</Text>
        </View>
        <Text style={styles.rowMeaning} numberOfLines={1}>{word.meanings[0]}</Text>
      </View>
    </TouchableOpacity>
  );
});

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
        body: JSON.stringify({ word: word.kanji, kana: word.kana, english: word.meanings[0], level: settings.level, provider: settings.provider }),
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

  const verbForms: ConjugationForm[] = verbConj ? Object.values(verbConj) : [];
  const adjForms: ConjugationForm[]  = adjConj  ? Object.values(adjConj)  : [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.posBadge, { backgroundColor: pm.color + '20', borderColor: pm.color + '60' }]}>
            <Text style={[styles.posShort, { color: pm.color }]}>{pm.label}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: pm.color }]}>
          <Text style={styles.heroKanji}>{word.kanji}</Text>
          {word.kanji !== word.kana && <Text style={styles.heroKana}>{word.kana}</Text>}
          <Text style={styles.heroRomaji}>{word.romaji}</Text>
          <TouchableOpacity style={styles.heroSpeak} onPress={() => speakJapanese(word.kana)}>
            <Text style={styles.heroSpeakText}>🔊  Hear pronunciation</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['info', ...(hasConj ? ['conjugation'] : []), 'examples'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t as any)}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'info' ? 'Info' : t === 'conjugation' ? 'Conjugation' : 'Examples'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Info tab */}
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
              {/* Jisho data */}
              {jishoData && (
                <>
                  <Text style={styles.infoSection}>From Jisho (JMdict)</Text>
                  <View style={styles.jishoBox}>
                    {jishoData.is_common && <View style={styles.commonBadge}><Text style={styles.commonText}>★ Common word</Text></View>}
                    {jishoData.jlpt?.length > 0 && <Text style={styles.jishoMeta}>JLPT: {jishoData.jlpt.join(', ')}</Text>}
                    {jishoData.tags?.length > 0 && <Text style={styles.jishoMeta}>Tags: {jishoData.tags.join(', ')}</Text>}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Conjugation tab */}
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

          {/* Examples tab */}
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
      </SafeAreaView>
    </Modal>
  );
}

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

// ── Main screen ───────────────────────────────────────────────────────────────

export default function VocabIndexScreen({ settings }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<POSFilter>('all');
  const [selectedWord, setSelectedWord] = useState<N5Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return N5_WORDS.filter((w) => {
      const matchesFilter = filter === 'all' || w.pos === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        w.kana.includes(q) ||
        w.kanji.includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meanings.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const sections = useMemo(() => {
    // Search: flat results
    if (query) return [{ title: `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`, data: filtered }];

    // All: group by part of speech
    if (filter === 'all') {
      const POS_ORDER: POSCategory[] = ['verb', 'i-adj', 'na-adj', 'noun', 'adverb', 'pronoun', 'expression', 'conjunction', 'particle', 'counter', 'prefix'];
      const groups: Partial<Record<POSCategory, N5Word[]>> = {};
      for (const w of filtered) (groups[w.pos] ??= []).push(w);
      return POS_ORDER
        .filter((p) => groups[p]?.length)
        .map((p) => ({
          title: `${POS_META[p]?.label ?? p}  ·  ${groups[p]!.length}`,
          data: groups[p]!,
        }));
    }

    // Verbs: group by verb type
    if (filter === 'verb') {
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
        .filter((k) => groups[k]?.length)
        .map((k) => ({
          title: `${VERB_GROUP_LABELS[k]}  ·  ${groups[k]!.length}`,
          data: groups[k]!,
        }));
    }

    // Other filters: group by kana row
    const groups: Record<string, N5Word[]> = {};
    for (const w of filtered) (groups[kanaRow(w.kana)] ??= []).push(w);
    return KANA_ROW_ORDER
      .filter((r) => groups[r]?.length)
      .map((r) => ({ title: `${r}  ·  ${groups[r].length}`, data: groups[r] }));
  }, [filtered, query, filter]);

  const openWord = useCallback((word: N5Word) => {
    setSelectedWord(word);
    setModalVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>N5 Vocabulary</Text>
          <Text style={styles.headerSub}>{N5_WORDS.length} words · Genki / Jisho / JMdict</Text>
        </View>
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

      {/* POS filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filter === item.key && styles.chipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      />

      {/* Word list */}
      <SectionList
        sections={sections}
        keyExtractor={(w) => w.id}
        renderItem={({ item }) => <WordRow word={item} onPress={() => openWord(item)} />}
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
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  searchRow: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.card },
  searchInput: { backgroundColor: Colors.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text },
  chipList: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },
  chipTextActive: { color: Colors.white, fontFamily: 'NotoSansJP_700Bold' },
  sectionHeader: { backgroundColor: Colors.background, paddingHorizontal: 16, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionHeaderText: { fontSize: 12, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary, letterSpacing: 0.5 },
  listContent: { paddingBottom: 32 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flex: 1 },
  rowKanji: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  rowKana: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  rowRomaji: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  rowRight: { alignItems: 'flex-end', maxWidth: '45%', gap: 4 },
  posBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  posShort: { fontSize: 11, fontFamily: 'NotoSansJP_700Bold' },
  rowMeaning: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSansJP_700Bold' },
  hero: { padding: 28, alignItems: 'center' },
  heroKanji: { fontSize: 56, fontFamily: 'NotoSansJP_800ExtraBold', color: '#fff' },
  heroKana: { fontSize: 22, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroRomaji: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  heroSpeak: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  heroSpeakText: { color: '#fff', fontFamily: 'NotoSansJP_600SemiBold', fontSize: 13 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },
  tabTextActive: { color: Colors.primary, fontFamily: 'NotoSansJP_700Bold' },
  modalScroll: { flex: 1 },
  tabContent: { padding: 16 },
  infoSection: { fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 6 },
  meaningItem: { fontSize: 15, color: Colors.text, marginBottom: 4 },
  infoValue: { fontSize: 15, color: Colors.text },
  notesBox: { backgroundColor: Colors.inputBg, borderRadius: 10, padding: 12 },
  notesText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  jishoBox: { backgroundColor: Colors.inputBg, borderRadius: 10, padding: 12, gap: 4 },
  jishoMeta: { fontSize: 13, color: Colors.textSecondary },
  commonBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  commonText: { fontSize: 12, color: Colors.success, fontFamily: 'NotoSansJP_700Bold' },

  // Conjugation table
  conjTable: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  conjRow: { padding: 12, backgroundColor: Colors.card },
  conjRowAlt: { backgroundColor: Colors.background },
  conjLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold', marginBottom: 4 },
  conjRight: { gap: 2 },
  conjKana: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  conjRomaji: { fontSize: 12, color: Colors.primary },
  conjEnglish: { fontSize: 12, color: Colors.textSecondary },

  // Examples
  loadingBox: { alignItems: 'center', padding: 32, gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  examplesText: { fontSize: 15, color: Colors.text, lineHeight: 26 },
});
