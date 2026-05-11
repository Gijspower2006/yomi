import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Dimensions, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5_WORDS } from '../../data/n5words';
import { N5Word } from '../../data/n5types';
import { SCENARIOS, Scenario } from '../../data/scenarios';
import { useSavedWords } from '../../hooks/useSavedWords';
import { StudyMode } from './StudyNavigator';

const GAP = 14;
const PAD = 16;
const TILE_W = (Dimensions.get('window').width - PAD * 2 - GAP) / 2;

interface Props {
  onStart: (mode: StudyMode, words?: N5Word[]) => void;
}

const WORD_SETS: { key: string; label: string; filter: (w: N5Word) => boolean }[] = [
  { key: 'all',    label: 'All',     filter: () => true },
  { key: 'verb',   label: 'Verbs',   filter: w => w.pos === 'verb' },
  { key: 'i-adj',  label: 'I-Adj',   filter: w => w.pos === 'i-adj' },
  { key: 'na-adj', label: 'Na-Adj',  filter: w => w.pos === 'na-adj' },
  { key: 'noun',   label: 'Nouns',   filter: w => w.pos === 'noun' },
  { key: 'adverb', label: 'Adverbs', filter: w => !['verb','i-adj','na-adj','noun'].includes(w.pos) },
  { key: 'saved',  label: 'Saved',   filter: () => false },
];

const MODES: {
  key: StudyMode; label: string; icon: keyof typeof Ionicons.glyphMap; decor: string; color: string; sub: string; noWords?: boolean;
  image: { uri: string };
}[] = [
  { key: 'flashcard',    label: 'Flashcards',    icon: 'albums',          decor: '繰', color: '#E0284A', sub: 'SRS spaced review',
    image: { uri: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=400&fit=crop&q=80' } },
  { key: 'wordquiz',     label: 'Word Quiz',      icon: 'radio-button-on', decor: '択', color: '#2D45D4', sub: '4-choice quiz',
    image: { uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=80' } },
  { key: 'sentencequiz', label: 'Sentence Quiz',  icon: 'document-text',   decor: '文', color: '#059669', sub: 'Fill the blank',
    image: { uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=80' } },
  { key: 'translation',  label: 'Translation',    icon: 'pencil',          decor: '訳', color: '#7C3AED', sub: 'Type the answer',
    image: { uri: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop&q=80' } },
  { key: 'listening',    label: 'Listening Quiz', icon: 'headset',         decor: '聴', color: '#C2621A', sub: 'Hear & identify',
    image: { uri: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop&q=80' } },
  { key: 'kana',            label: 'Kana Trainer',   icon: 'text',            decor: 'あ', color: '#0E7490', sub: 'Hiragana & katakana', noWords: true,
    image: { uri: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=400&fit=crop&crop=bottom&q=80' } },
  { key: 'kanjiflashcard', label: 'Kanji Cards',    icon: 'albums',          decor: '漢', color: '#B45309', sub: 'SRS kanji review', noWords: true,
    image: { uri: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=400&fit=crop&q=80' } },
  { key: 'kanjiquiz',      label: 'Kanji Quiz',     icon: 'radio-button-on', decor: '字', color: '#6D28D9', sub: '4-choice kanji quiz', noWords: true,
    image: { uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=80' } },
];

type Source = 'grammar' | 'scenario';

export default function StudyHomeScreen({ onStart }: Props) {
  const [source, setSource] = useState<Source>('grammar');
  const [selectedSet, setSelectedSet] = useState('all');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const { savedIds } = useSavedWords();

  const wordPool = useMemo(() => {
    if (source === 'scenario' && selectedScenario) {
      const idSet = new Set(selectedScenario.wordIds);
      return N5_WORDS.filter(w => idSet.has(w.id));
    }
    if (selectedSet === 'saved') return N5_WORDS.filter(w => savedIds.has(w.id));
    const set = WORD_SETS.find(s => s.key === selectedSet);
    return set ? N5_WORDS.filter(set.filter) : N5_WORDS;
  }, [source, selectedScenario, selectedSet, savedIds]);

  const handleStart = (mode: StudyMode) => {
    const m = MODES.find(x => x.key === mode);
    if (m?.noWords) { onStart(mode); return; }
    if (wordPool.length === 0) return;
    onStart(mode, [...wordPool].sort(() => Math.random() - 0.5));
  };

  const pickGrammar = (key: string) => {
    setSource('grammar');
    setSelectedScenario(null);
    setSelectedSet(key);
  };

  const pickScenario = (s: Scenario) => {
    setSource('scenario');
    setSelectedScenario(s);
  };

  const getCount = (key: string) => {
    if (key === 'saved') return savedIds.size;
    const set = WORD_SETS.find(s => s.key === key);
    return set ? N5_WORDS.filter(set.filter).length : 0;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study</Text>
        <Text style={styles.headerSub}>Practice your N5 vocabulary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Scenarios ── */}
        <Text style={styles.sectionLabel}>SCENARIOS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SCENARIOS.map(s => {
            const active = source === 'scenario' && selectedScenario?.key === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.scenarioChip, active && { backgroundColor: s.color, borderColor: s.color }]}
                onPress={() => pickScenario(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.scenarioJa, active && styles.scenarioJaActive]}>{s.titleJa}</Text>
                <Text style={[styles.scenarioEn, active && styles.scenarioEnActive]}>{s.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Scenario sentence preview */}
        {source === 'scenario' && selectedScenario && (
          <View style={[styles.sentenceCard, { borderColor: selectedScenario.color + '44' }]}>
            <View style={styles.sentenceCardHeader}>
              <View style={[styles.sentenceDot, { backgroundColor: selectedScenario.color }]} />
              <Text style={styles.sentenceCardTitle}>Model Sentences</Text>
              <Text style={styles.sentenceWordCount}>{wordPool.length} words</Text>
            </View>
            {selectedScenario.sentences.map((sent, i) => (
              <View key={i} style={[styles.sentenceRow, i < selectedScenario.sentences.length - 1 && styles.sentenceRowBorder]}>
                <Text style={styles.sentenceJp}>{sent.japanese}</Text>
                <Text style={styles.sentenceRomaji}>{sent.romaji}</Text>
                <Text style={styles.sentenceEn}>{sent.english}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Grammar word sets ── */}
        <Text style={[styles.sectionLabel, { marginTop: source === 'scenario' ? 20 : 14 }]}>WORD SET</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {WORD_SETS.map(s => {
            const active = source === 'grammar' && selectedSet === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => pickGrammar(s.key)}
                activeOpacity={0.75}
              >
                {s.key === 'saved' && (
                  <Ionicons
                    name="star"
                    size={12}
                    color={active ? 'rgba(255,255,255,0.9)' : Colors.accent}
                  />
                )}
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{s.label}</Text>
                <Text style={[styles.chipCount, active && styles.chipCountActive]}>{getCount(s.key)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {wordPool.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {selectedSet === 'saved' && source === 'grammar'
                ? 'No saved words yet.\nTap the star on any word to save it.'
                : 'No words in this set.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.countLine}>{wordPool.length} words selected</Text>
        )}

        {/* ── Study modes ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>STUDY MODE</Text>

        <View style={styles.modeGrid}>
          {MODES.map((mode, index) => {
            const enabled = mode.noWords ? true : wordPool.length > 0;
            const color = enabled ? mode.color : Colors.textLight;
            return (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.tileShadow,
                  { shadowColor: color },
                  index % 2 === 1 && styles.tileRight,
                ]}
                onPress={() => handleStart(mode.key)}
                activeOpacity={enabled ? 0.88 : 1}
                disabled={!enabled}
              >
                <ImageBackground
                  source={mode.image}
                  style={styles.tileInner}
                  imageStyle={styles.tileImage}
                  resizeMode="cover"
                >
                  {/* dark base overlay */}
                  <View style={styles.tileDarkOverlay} />
                  {/* colored tint overlay, dimmed if disabled */}
                  <View style={[styles.tileColorOverlay, { backgroundColor: color + (enabled ? 'AA' : 'DD') }]} />
                  <Text style={styles.tileGhost}>{mode.decor}</Text>
                  <View style={styles.tileCenter}>
                    <Ionicons name={mode.icon} size={38} color="rgba(255,255,255,0.95)" />
                  </View>
                  <View style={styles.tileFooter}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tileName}>{mode.label}</Text>
                      <Text style={styles.tileSub}>{mode.sub}</Text>
                    </View>
                    <Text style={styles.tileArrow}>›</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 26, fontFamily: 'NotoSansJP_900Black', color: Colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },

  scroll: { padding: PAD, paddingBottom: 48 },

  sectionLabel: {
    fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.textLight,
    letterSpacing: 2, marginBottom: 12, marginLeft: 2,
  },

  // Scenario chips
  chipRow: { gap: 8, paddingBottom: 4 },
  scenarioChip: {
    alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: Colors.card,
    borderWidth: 1.5, borderColor: Colors.border,
    minWidth: 72,
  },
  scenarioJa: { fontSize: 15, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.textSecondary },
  scenarioJaActive: { color: '#fff' },
  scenarioEn: { fontSize: 9, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textLight, marginTop: 2, letterSpacing: 0.3 },
  scenarioEnActive: { color: 'rgba(255,255,255,0.75)' },

  // Sentence preview card
  sentenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
    overflow: 'hidden',
  },
  sentenceCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  sentenceDot: { width: 8, height: 8, borderRadius: 4 },
  sentenceCardTitle: { flex: 1, fontSize: 12, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary, letterSpacing: 1 },
  sentenceWordCount: { fontSize: 11, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textLight },

  sentenceRow: { paddingHorizontal: 16, paddingVertical: 14 },
  sentenceRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight },
  sentenceJp: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text, lineHeight: 26, marginBottom: 3 },
  sentenceRomaji: { fontSize: 11, fontFamily: 'NotoSansJP_500Medium', color: Colors.primary, marginBottom: 2 },
  sentenceEn: { fontSize: 12, fontFamily: 'NotoSansJP_400Regular', color: Colors.textSecondary },

  // Grammar chips
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 100, backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipLabel: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  chipLabelActive: { color: '#fff' },
  chipCount: { fontSize: 11, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textLight },
  chipCountActive: { color: 'rgba(255,255,255,0.7)' },

  countLine: {
    marginTop: 10, fontSize: 12, fontFamily: 'NotoSansJP_600SemiBold',
    color: Colors.primary, textAlign: 'right', marginRight: 2,
  },
  emptyBox: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 22, marginTop: 10, alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  emptyText: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Mode tiles
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tileShadow: {
    width: TILE_W, borderRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55, shadowRadius: 20, elevation: 12,
  },
  tileRight: { marginLeft: 0 },
  tileInner: { width: '100%', height: 180, borderRadius: 22, overflow: 'hidden' },
  tileImage: { borderRadius: 22 },
  tileDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  tileColorOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tileGhost: {
    position: 'absolute', right: -8, bottom: 44,
    fontSize: 88, fontFamily: 'NotoSansJP_900Black',
    color: 'rgba(255,255,255,0.10)', lineHeight: 96,
  },
  tileCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  tileFooter: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.30)',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  tileName: { fontSize: 13, fontFamily: 'NotoSansJP_800ExtraBold', color: '#fff', marginBottom: 2 },
  tileSub: { fontSize: 10, fontFamily: 'NotoSansJP_500Medium', color: 'rgba(255,255,255,0.70)' },
  tileArrow: { fontSize: 20, color: 'rgba(255,255,255,0.55)', marginLeft: 4 },
});
