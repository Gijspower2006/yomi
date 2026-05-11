import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5Kanji, KanjiCategory } from '../../data/n5kanji';
import StrokeOrderView from '../../components/StrokeOrderView';
import SpeakerButton from '../../components/SpeakerButton';

const CATEGORY_LABELS: Record<KanjiCategory, string> = {
  numbers: 'Numbers',
  time: 'Time',
  nature: 'Nature',
  people: 'People',
  direction: 'Direction',
  actions: 'Actions',
  things: 'Things',
  body: 'Body',
};

interface Props {
  kanji: N5Kanji;
  onBack: () => void;
}

export default function KanjiDetailScreen({ kanji, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kanji</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroOrb} />

          {/* Stroke order animation */}
          <StrokeOrderView char={kanji.char} size={200} />

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{CATEGORY_LABELS[kanji.category]}</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaValue}>{kanji.strokes}</Text>
              <Text style={styles.heroMetaLabel}>strokes</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaValue}>N5</Text>
              <Text style={styles.heroMetaLabel}>level</Text>
            </View>
          </View>
        </View>

        {/* Meanings */}
        <Section title="MEANING">
          <View style={styles.meaningRow}>
            {kanji.meanings.map((m, i) => (
              <View key={i} style={styles.meaningChip}>
                <Text style={styles.meaningChipText}>{m}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Readings */}
        <Section title="READINGS">
          <View style={styles.readingsCard}>
            {kanji.onyomi.length > 0 && (
              <View style={styles.readingRow}>
                <View style={styles.readingLabel}>
                  <Text style={styles.readingLabelText}>音</Text>
                </View>
                <View style={styles.readingChips}>
                  {kanji.onyomi.map((r, i) => (
                    <View key={i} style={styles.onyomiChip}>
                      <Text style={styles.onyomiChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {kanji.kunyomi.length > 0 && kanji.onyomi.length > 0 && (
              <View style={styles.readingDivider} />
            )}
            {kanji.kunyomi.length > 0 && (
              <View style={styles.readingRow}>
                <View style={[styles.readingLabel, styles.kunyomiLabel]}>
                  <Text style={styles.readingLabelText}>訓</Text>
                </View>
                <View style={styles.readingChips}>
                  {kanji.kunyomi.map((r, i) => (
                    <View key={i} style={styles.kunyomiChip}>
                      <Text style={styles.kunyomiChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Section>

        {/* Examples */}
        <Section title="EXAMPLE WORDS">
          <View style={styles.examplesCard}>
            {kanji.examples.map((ex, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.exDivider} />}
                <View style={styles.exRow}>
                  <View style={styles.exLeft}>
                    <Text style={styles.exWord}>{ex.word}</Text>
                    <Text style={styles.exReading}>{ex.reading}</Text>
                  </View>
                  <Text style={styles.exMeaning}>{ex.meaning}</Text>
                  <SpeakerButton text={ex.word} size={16} color={Colors.textSecondary} />
                </View>
              </React.Fragment>
            ))}
          </View>
        </Section>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.inputBg,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text,
  },
  headerRight: { width: 38 },

  scroll: { paddingHorizontal: 20, paddingTop: 24 },

  hero: {
    alignItems: 'center', marginBottom: 28,
    backgroundColor: Colors.card,
    borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', top: -40, right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.primary + '18',
  },
  heroBadge: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.primary + '44',
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 11, fontFamily: 'NotoSansJP_700Bold',
    color: Colors.primary, letterSpacing: 0.8,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  heroMetaItem: { alignItems: 'center' },
  heroMetaValue: { fontSize: 22, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  heroMetaLabel: { fontSize: 11, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },
  heroMetaDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight, letterSpacing: 1.5, marginBottom: 10, marginLeft: 4,
  },

  meaningRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meaningChip: {
    backgroundColor: Colors.card, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  meaningChipText: { fontSize: 15, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.text },

  readingsCard: {
    backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  readingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  readingLabel: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  kunyomiLabel: { backgroundColor: Colors.accent + '22' },
  readingLabelText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  readingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  readingDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: 14 },
  onyomiChip: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  onyomiChipText: { fontSize: 13, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.primary },
  kunyomiChip: {
    backgroundColor: Colors.accent + '18',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  kunyomiChipText: { fontSize: 13, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.accent },

  examplesCard: {
    backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  exDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: 16 },
  exRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, gap: 12,
  },
  exLeft: { gap: 2 },
  exWord: { fontSize: 20, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  exReading: { fontSize: 12, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary },
  exMeaning: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, flex: 1, textAlign: 'right' },
});
