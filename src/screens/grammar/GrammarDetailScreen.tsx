import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { GrammarPattern, GrammarCategory } from '../../data/grammar';

interface Props {
  pattern: GrammarPattern;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<GrammarCategory, string> = {
  'particles':         '#4361EE',
  'verb-forms':        '#FF2D55',
  'expressions':       '#06D6A0',
  'sentence-patterns': '#9B5DE5',
};

const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  'particles':         'Particle',
  'verb-forms':        'Verb Form',
  'expressions':       'Expression',
  'sentence-patterns': 'Sentence Pattern',
};

export default function GrammarDetailScreen({ pattern, onBack }: Props) {
  const color = CATEGORY_COLORS[pattern.category];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Grammar</Text>
        </TouchableOpacity>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={[styles.heroCard, { shadowColor: color }]}>
          <View style={[styles.heroCardInner, { backgroundColor: color }]}>
            <View style={styles.heroOrb} />
            <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[pattern.category]}</Text>
            </View>
            <Text style={styles.heroTitle}>{pattern.title}</Text>
            <Text style={styles.heroSub}>{pattern.subtitle}</Text>
          </View>
        </View>

        {/* Formula */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FORMULA</Text>
          <View style={[styles.formulaBox, { borderColor: color + '44' }]}>
            <Text style={[styles.formulaText, { color }]}>{pattern.formula}</Text>
          </View>
        </View>

        {/* Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXPLANATION</Text>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{pattern.explanation}</Text>
          </View>
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXAMPLES</Text>
          <View style={styles.examplesBox}>
            {pattern.examples.map((ex, i) => (
              <View
                key={i}
                style={[styles.exampleRow, i < pattern.examples.length - 1 && styles.exampleRowBorder]}
              >
                <View style={[styles.exampleNum, { backgroundColor: color + '22' }]}>
                  <Text style={[styles.exampleNumText, { color }]}>{i + 1}</Text>
                </View>
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleJp}>{ex.japanese}</Text>
                  <Text style={styles.exampleRomaji}>{ex.romaji}</Text>
                  <Text style={styles.exampleEn}>{ex.english}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backChevron: { fontSize: 26, color: Colors.primary, lineHeight: 30, marginRight: 2 },
  backLabel: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },

  scroll: { padding: 16, paddingBottom: 48 },

  heroCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  heroCardInner: {
    borderRadius: 20,
    padding: 28,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -30, right: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 40,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 16,
    fontFamily: 'NotoSansJP_500Medium',
    color: 'rgba(255,255,255,0.75)',
  },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 2,
  },

  formulaBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  formulaText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP_700Bold',
    letterSpacing: 0.3,
  },

  explanationBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },

  examplesBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  exampleRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  exampleRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  exampleNum: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  exampleNumText: { fontSize: 12, fontFamily: 'NotoSansJP_800ExtraBold' },
  exampleContent: { flex: 1 },
  exampleJp: {
    fontSize: 17,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 3,
  },
  exampleRomaji: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.primary,
    marginBottom: 3,
  },
  exampleEn: {
    fontSize: 13,
    fontFamily: 'NotoSansJP_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
