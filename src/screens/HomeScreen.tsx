import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { AppSettings } from '../types';
import { N5_WORDS } from '../data/n5words';
import { useSavedWords } from '../hooks/useSavedWords';
import { useStreak } from '../hooks/useStreak';
import { useXP } from '../hooks/useXP';
import { useDailyGoal } from '../hooks/useDailyGoal';

interface Props {
  settings: AppSettings;
  onNavigate: (tab: string) => void;
}

const LEVEL_NAMES = [
  'Beginner', 'Novice', 'Apprentice', 'Student',
  'Scholar', 'Adept', 'Expert', 'Master', 'Sensei', 'Legend',
];

// Shibuya crossing at night — vibrant, iconic Tokyo
const HERO_IMAGE = { uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&h=500&fit=crop&q=85' };

export default function HomeScreen({ settings, onNavigate }: Props) {
  const { savedIds } = useSavedWords();
  const { streak } = useStreak();
  const { xp, level, xpInLevel, xpForNext, progress } = useXP();
  const { wordsStudied, goal, progress: goalProgress, completed: goalDone } = useDailyGoal();

  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? 'Legend';
  const greeting = getGreeting();
  const displayName = settings.username?.trim() || null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero image banner ── */}
        <ImageBackground source={HERO_IMAGE} style={styles.hero} resizeMode="cover">
          <View style={styles.heroOverlay}>
            <View style={styles.heroTop}>
              <View style={styles.jlptBadge}>
                <Text style={styles.jlptText}>JLPT N5</Text>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.greeting}>{greeting}</Text>
              {displayName
                ? <Text style={styles.subGreeting}>{displayName} 👋</Text>
                : <Text style={styles.subGreeting}>Ready to study?</Text>}

              {/* Stats strip inside hero */}
              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statValue}>{streak}</Text>
                  <Text style={styles.statLabel}>streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statChip}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statChip}>
                  <Text style={styles.statIcon}>📖</Text>
                  <Text style={styles.statValue}>{savedIds.size}</Text>
                  <Text style={styles.statLabel}>saved</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* ── XP level card ── */}
        <View style={styles.card}>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>Lv.{level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{levelName}</Text>
              <Text style={styles.levelXP}>
                {xpForNext !== null
                  ? `${xpInLevel} / ${xpForNext} XP to next level`
                  : `${xp} XP · MAX LEVEL`}
              </Text>
            </View>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.min(progress * 100, 100)}%` as any }]} />
          </View>
        </View>

        {/* ── Daily goal card ── */}
        <View style={[styles.card, goalDone && styles.cardDone]}>
          <View style={styles.goalHeader}>
            <Ionicons
              name={goalDone ? 'checkmark-circle' : 'sunny'}
              size={18}
              color={goalDone ? Colors.success : Colors.accent}
            />
            <Text style={[styles.goalTitle, goalDone && styles.goalTitleDone]}>
              {goalDone ? 'Daily goal complete! 🎉' : 'Daily goal'}
            </Text>
            <Text style={styles.goalCount}>{wordsStudied}/{goal} words</Text>
          </View>
          <View style={styles.goalTrack}>
            <View
              style={[
                styles.goalFill,
                { width: `${Math.min(goalProgress * 100, 100)}%` as any },
                goalDone && styles.goalFillDone,
              ]}
            />
          </View>
        </View>

        {/* ── Primary CTA ── */}
        <TouchableOpacity style={styles.ctaBtn} onPress={() => onNavigate('Study')} activeOpacity={0.88}>
          <Ionicons name="flash" size={22} color={Colors.white} />
          <Text style={styles.ctaBtnText}>Start Studying</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.55)" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* ── Secondary shortcuts ── */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('Vocabulary')} activeOpacity={0.82}>
            <View style={[styles.shortcutIcon, { backgroundColor: Colors.primary + '28' }]}>
              <Text style={[styles.shortcutKanji, { color: Colors.primaryLight }]}>語</Text>
            </View>
            <Text style={styles.shortcutLabel}>Vocabulary</Text>
            <Text style={styles.shortcutSub}>{N5_WORDS.length} words</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('Grammar')} activeOpacity={0.82}>
            <View style={[styles.shortcutIcon, { backgroundColor: '#2DC65328' }]}>
              <Text style={[styles.shortcutKanji, { color: '#2DC653' }]}>文</Text>
            </View>
            <Text style={styles.shortcutLabel}>Grammar</Text>
            <Text style={styles.shortcutSub}>27 patterns</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('Rank')} activeOpacity={0.82}>
            <View style={[styles.shortcutIcon, { backgroundColor: Colors.accent + '28' }]}>
              <Text style={[styles.shortcutKanji, { color: Colors.accent }]}>位</Text>
            </View>
            <Text style={styles.shortcutLabel}>Leaderboard</Text>
            <Text style={styles.shortcutSub}>Global rank</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>Vocabulary from JMdict / EDICT Project (CC BY-SA)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'おはよう！';
  if (h < 17) return 'こんにちは！';
  return 'こんばんは！';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 32, gap: 14 },

  // Hero
  hero: {
    width: '100%',
    height: 260,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,11,26,0.58)',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'flex-end' },
  heroBottom: { gap: 6 },

  greeting: {
    fontSize: 34,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subGreeting: {
    fontSize: 15,
    fontFamily: 'NotoSansJP_500Medium',
    color: 'rgba(255,255,255,0.80)',
    marginBottom: 12,
  },

  jlptBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  jlptText: {
    fontSize: 10,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.white,
    letterSpacing: 1.2,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(12,15,29,0.72)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 0,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 1 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 4 },
  statIcon: { fontSize: 16 },
  statValue: {
    fontSize: 17,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'NotoSansJP_600SemiBold',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Shared card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardDone: {
    borderColor: Colors.success + '55',
  },

  // XP level
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  levelNum: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  levelXP: { fontSize: 12, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },
  xpTrack: { height: 7, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: 7, borderRadius: 4, backgroundColor: Colors.primary },

  // Daily goal
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goalTitle: { flex: 1, fontSize: 14, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  goalTitleDone: { color: Colors.success },
  goalCount: { fontSize: 13, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.textSecondary },
  goalTrack: { height: 7, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  goalFill: { height: 7, borderRadius: 4, backgroundColor: Colors.accent },
  goalFillDone: { backgroundColor: Colors.success },

  // CTA
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    borderRadius: 18, paddingVertical: 18, paddingHorizontal: 22,
    marginHorizontal: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontSize: 17, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.white },

  // Shortcuts
  shortcutRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
  shortcutCard: {
    flex: 1, backgroundColor: Colors.card,
    borderRadius: 16, padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  shortcutIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shortcutKanji: { fontSize: 22, fontFamily: 'NotoSansJP_900Black' },
  shortcutLabel: { fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  shortcutSub: { fontSize: 10, fontFamily: 'NotoSansJP_500Medium', color: Colors.textLight },

  legal: {
    fontSize: 10, fontFamily: 'NotoSansJP_400Regular',
    color: Colors.textLight, textAlign: 'center',
    marginHorizontal: 20, marginTop: 4,
  },
});
