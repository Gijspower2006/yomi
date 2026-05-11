import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5_WORDS } from '../../data/n5words';
import { N5_KANJI } from '../../data/n5kanji';
interface Props {
  onSelectLevel: (level: string) => void;
  onOpenKanji: () => void;
}

const COMING_SOON = ['N4', 'N3', 'N2', 'N1'];

export default function LevelScreen({ onSelectLevel, onOpenKanji }: Props) {

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary</Text>
        <Text style={styles.subtitle}>Choose your level</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── N5 Hero card ── */}
        <TouchableOpacity
          style={styles.heroShadow}
          onPress={() => onSelectLevel('N5')}
          activeOpacity={0.88}
        >
          <View style={styles.heroInner}>
            <View style={styles.orbA} />
            <View style={styles.orbB} />
            <Text style={styles.heroBg}>初</Text>

            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>AVAILABLE NOW</Text>
              </View>
              <View style={styles.heroArrow}>
                <Text style={styles.heroArrowText}>›</Text>
              </View>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroLevel}>N5</Text>
              <Text style={styles.heroJa}>初級</Text>
            </View>

            <View style={styles.heroFooter}>
              <View>
                <Text style={styles.heroDesc}>Beginner · Basic vocabulary & grammar</Text>
              </View>
              <View style={styles.heroCountPill}>
                <Text style={styles.heroCountText}>~{N5_WORDS.length} words</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Kanji Index ── */}
        <TouchableOpacity
          style={styles.kanjiCard}
          onPress={onOpenKanji}
          activeOpacity={0.85}
        >
          <View style={styles.kanjiLeft}>
            <Text style={styles.kanjiIcon}>漢</Text>
            <View>
              <Text style={styles.kanjiTitle}>N5 Kanji Index</Text>
              <Text style={styles.kanjiSub}>{N5_KANJI.length} characters · readings & examples</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Coming soon ── */}
        <Text style={styles.soonLabel}>COMING SOON</Text>
        <View style={styles.soonRow}>
          {COMING_SOON.map(lvl => (
            <View key={lvl} style={styles.soonChip}>
              <Text style={styles.soonText}>{lvl}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.attribution}>
          Vocabulary from Genki, Jisho, JMdict / EDICT Project (CC BY-SA)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  title: { fontSize: 26, fontFamily: 'NotoSansJP_900Black', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },

  scroll: { padding: 16, paddingBottom: 48 },

  heroShadow: {
    borderRadius: 26, marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.50,
    shadowRadius: 28,
    elevation: 14,
  },
  heroInner: {
    borderRadius: 26, backgroundColor: Colors.primary,
    overflow: 'hidden', minHeight: 260,
  },

  orbA: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbB: {
    position: 'absolute', bottom: 30, left: -50,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroBg: {
    position: 'absolute', right: -10, top: 10,
    fontSize: 180, fontFamily: 'NotoSansJP_900Black',
    color: 'rgba(0,0,0,0.10)', lineHeight: 200,
  },

  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.20)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
  },
  heroBadgeText: { fontSize: 10, fontFamily: 'NotoSansJP_700Bold', color: '#fff', letterSpacing: 1.5 },
  heroArrow: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroArrowText: { fontSize: 22, color: '#fff', fontFamily: 'NotoSansJP_400Regular', lineHeight: 28 },

  heroContent: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'flex-end', gap: 12,
  },
  heroLevel: {
    fontSize: 80, fontFamily: 'NotoSansJP_900Black', color: '#fff',
    letterSpacing: -3, lineHeight: 84,
  },
  heroJa: {
    fontSize: 22, fontFamily: 'NotoSansJP_700Bold', color: 'rgba(255,255,255,0.65)',
    marginBottom: 10,
  },

  heroFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  heroDesc: { fontSize: 13, fontFamily: 'NotoSansJP_600SemiBold', color: 'rgba(255,255,255,0.80)' },
  heroCountPill: {
    backgroundColor: 'rgba(0,0,0,0.20)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100,
  },
  heroCountText: { fontSize: 12, fontFamily: 'NotoSansJP_700Bold', color: '#fff' },

  kanjiCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 3,
  },
  kanjiLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  kanjiIcon: {
    fontSize: 32, fontFamily: 'NotoSansJP_900Black', color: Colors.primary,
    width: 48, textAlign: 'center',
  },
  kanjiTitle: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  kanjiSub: { fontSize: 12, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },

  soonLabel: {
    fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.textLight,
    letterSpacing: 2, marginBottom: 12, marginLeft: 4,
  },
  soonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  soonChip: {
    paddingHorizontal: 22, paddingVertical: 11, borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  soonText: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.textLight },

  attribution: {
    fontSize: 11, fontFamily: 'NotoSansJP_400Regular', color: Colors.textLight,
    textAlign: 'center', marginTop: 32, lineHeight: 17,
  },
});
