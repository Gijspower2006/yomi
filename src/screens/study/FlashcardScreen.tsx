import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5Word } from '../../data/n5types';
import { speakJapanese } from '../../services/speech';
import { useSRS } from '../../hooks/useSRS';
import { SRSRating } from '../../data/srsTypes';

interface Props {
  words: N5Word[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const { width: SW } = Dimensions.get('window');

const POS_COLORS: Record<string, string> = {
  verb: '#EF233C', 'i-adj': '#06D6A0', 'na-adj': '#118AB2',
  noun: '#9B5DE5', adverb: '#F4A261',
};

const RATINGS: { key: SRSRating; label: string; sublabel: string; color: string }[] = [
  { key: 'again', label: 'Again', sublabel: '< 1d',  color: '#EF233C' },
  { key: 'hard',  label: 'Hard',  sublabel: '3d',    color: '#F4A261' },
  { key: 'good',  label: 'Good',  sublabel: '~1wk',  color: '#4361EE' },
  { key: 'easy',  label: 'Easy',  sublabel: '~2wk',  color: '#06D6A0' },
];

function formatInterval(days: number): string {
  if (days <= 1)  return '1 day';
  if (days < 30)  return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}yr`;
}

export default function FlashcardScreen({ words, onBack, onXPEarned }: Props) {
  const wordIds = useMemo(() => words.map(w => w.id), [words]);
  const wordMap = useMemo(() => new Map(words.map(w => [w.id, w])), [words]);

  const { loaded, review, resetAll, getCard, dueCards, newCardIds, learnCards, sessionIds } = useSRS(wordIds);

  const [queueIndex, setQueueIndex] = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed]     = useState(0);

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentId = sessionIds[queueIndex];
  const word      = currentId ? wordMap.get(currentId) : null;
  const card      = currentId ? getCard(currentId) : null;
  const posColor  = word ? (POS_COLORS[word.pos] ?? Colors.primary) : Colors.primary;

  const flip = useCallback(() => {
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 40 }).start();
    setFlipped(f => !f);
  }, [flipped, flipAnim]);

  const advance = useCallback((rating: SRSRating) => {
    if (!currentId) return;
    review(currentId, rating);
    setReviewed(r => r + 1);

    const nextIndex = queueIndex + 1;
    if (nextIndex >= sessionIds.length) {
      setSessionDone(true);
      onXPEarned?.(reviewed * 10 + 20, reviewed);
      return;
    }

    Animated.timing(slideAnim, { toValue: -SW, duration: 160, useNativeDriver: true }).start(() => {
      flipAnim.setValue(0);
      slideAnim.setValue(SW);
      setFlipped(false);
      setQueueIndex(nextIndex);
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }).start();
    });
  }, [currentId, queueIndex, sessionIds.length, review, flipAnim, slideAnim]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  // ── No cards due screen ───────────────────────────────────────────────────

  if (loaded && sessionIds.length === 0) {
    const nextDue = learnCards.length > 0
      ? [...learnCards].map(id => getCard(id)?.nextReview ?? Infinity).sort((a, b) => a - b)[0]
      : null;
    const hoursUntil = nextDue ? Math.ceil((nextDue - Date.now()) / (1000 * 60 * 60)) : null;

    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} left="‹  Study" right="" />
        <View style={styles.centerContent}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All caught up!</Text>
          <Text style={styles.doneSub}>
            {newCardIds.length === 0 && learnCards.length > 0
              ? `Next review in ${hoursUntil}h`
              : newCardIds.length > 0
              ? `${newCardIds.length} new cards will appear in your next session`
              : 'No cards to review right now'}
          </Text>
          <View style={styles.statsRow}>
            <StatBox label="Due"      value={dueCards.length}  color={Colors.primary} />
            <StatBox label="Learning" value={learnCards.length} color='#F4A261' />
            <StatBox label="New"      value={newCardIds.length} color='#06D6A0' />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={onBack}>
              <Text style={styles.actionBtnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { resetAll(); setQueueIndex(0); setReviewed(0); setSessionDone(false); setFlipped(false); }}>
              <Text style={styles.actionBtnText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Session done screen ───────────────────────────────────────────────────

  if (sessionDone) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} left="‹  Study" right="" />
        <View style={styles.centerContent}>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.doneTitle}>Session complete</Text>
          <Text style={styles.doneSub}>You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''}.</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{reviewed * 10 + 20} XP</Text>
          </View>
          <View style={styles.statsRow}>
            <StatBox label="Due"      value={dueCards.length}  color={Colors.primary} />
            <StatBox label="Learning" value={learnCards.length} color='#F4A261' />
            <StatBox label="New"      value={newCardIds.length} color='#06D6A0' />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={onBack}>
              <Text style={styles.actionBtnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setQueueIndex(0); setReviewed(0); setSessionDone(false); setFlipped(false); flipAnim.setValue(0); slideAnim.setValue(0); }}>
              <Text style={styles.actionBtnText}>Study Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Study screen ──────────────────────────────────────────────────────────

  if (!loaded || !word) return null;

  const isNew   = card?.lastReview === 0;
  const total   = sessionIds.length;
  const progress = queueIndex / total;

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={onBack} left="‹  Study" right={`${queueIndex}/${total}`} />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Queue counters */}
      <View style={styles.counters}>
        <CounterPill label="Due"  value={dueCards.length}   color={Colors.primary} />
        <CounterPill label="New"  value={newCardIds.length}  color='#06D6A0' />
        <CounterPill label="Done" value={reviewed}           color={Colors.textSecondary} />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
          {/* Front */}
          <Animated.View style={[styles.card, { transform: [{ rotateY: frontRotate }], borderTopColor: posColor }]}>
            <View style={styles.cardTopRow}>
              {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
              {!isNew && card && <Text style={styles.intervalBadge}>interval: {formatInterval(card.interval)}</Text>}
            </View>
            <TouchableOpacity style={styles.cardTouchable} onPress={flip} activeOpacity={0.9}>
              <Text style={styles.cardKanji}>{word.kanji}</Text>
              {word.kanji !== word.kana && (
                <Text style={[styles.cardKana, { color: posColor }]}>{word.kana}</Text>
              )}
              <Text style={styles.cardRomaji}>{word.romaji}</Text>
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakJapanese(word.kana)}>
                <Ionicons name="volume-medium" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.tapHint}>Tap to reveal answer</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }], borderTopColor: posColor }]}>
            <TouchableOpacity style={styles.cardTouchable} onPress={flip} activeOpacity={0.9}>
              <Text style={styles.cardKanjiSmall}>{word.kanji}</Text>
              <View style={styles.divider} />
              {word.meanings.map((m, i) => (
                <Text key={i} style={styles.meaning}>{i + 1}. {m}</Text>
              ))}
              {word.notes && <Text style={styles.notes}>{word.notes}</Text>}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Rating buttons */}
      <View style={styles.ratingArea}>
        {!flipped ? (
          <TouchableOpacity style={styles.showAnswerBtn} onPress={flip}>
            <Text style={styles.showAnswerText}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.ratingLabel}>How well did you know this?</Text>
            <View style={styles.ratingRow}>
              {RATINGS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.ratingBtn, { backgroundColor: r.color }]}
                  onPress={() => advance(r.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ratingBtnLabel}>{r.label}</Text>
                  <Text style={styles.ratingBtnSub}>{r.sublabel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function Header({ onBack, left, right }: { onBack: () => void; left: string; right: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerLeft}>
        <Text style={styles.headerLeftText}>{left}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Flashcards</Text>
      <Text style={styles.headerRight}>{right}</Text>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CounterPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + '40', backgroundColor: color + '12' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: color + 'BB' }]}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 300;

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
  headerLeft: { width: 90 },
  headerLeftText: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  headerRight: { width: 90, textAlign: 'right', fontSize: 13, color: Colors.textSecondary },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill:  { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  counters: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    backgroundColor: Colors.card,
  },
  pillValue: { fontSize: 14, fontFamily: 'NotoSansJP_800ExtraBold' },
  pillLabel: { fontSize: 11, fontFamily: 'NotoSansJP_600SemiBold' },

  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  cardWrapper: { width: '100%' },

  card: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderTopWidth: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardBack: { position: 'absolute', top: 0, left: 0, right: 0 },
  cardTopRow: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  newBadge: {
    backgroundColor: '#06D6A020',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#06D6A060',
  },
  newBadgeText: { fontSize: 10, fontFamily: 'NotoSansJP_800ExtraBold', color: '#06D6A0' },
  intervalBadge: { fontSize: 11, color: Colors.textLight },

  cardTouchable: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  cardKanji: { fontSize: 60, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text, textAlign: 'center' },
  cardKanjiSmall: { fontSize: 32, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text, textAlign: 'center', marginBottom: 4 },
  cardKana: { fontSize: 20, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 8 },
  cardRomaji: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },
  speakBtn: { marginTop: 16, padding: 8 },
  speakText: { fontSize: 26 },
  tapHint: { position: 'absolute', bottom: 16, fontSize: 11, color: Colors.textLight },
  divider: { width: 48, height: 2, backgroundColor: Colors.border, marginVertical: 14 },
  meaning: { fontSize: 18, color: Colors.text, textAlign: 'center', marginBottom: 4 },
  notes: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },

  ratingArea: { padding: 16, paddingBottom: 8 },
  showAnswerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  showAnswerText: { color: Colors.white, fontSize: 17, fontFamily: 'NotoSansJP_700Bold' },
  ratingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'NotoSansJP_600SemiBold',
  },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 100,
  },
  ratingBtnLabel: { fontSize: 14, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.white },
  ratingBtnSub:   { fontSize: 10, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 2, color: 'rgba(255,255,255,0.8)' },

  // Screens
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  doneSub:   { fontSize: 15, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  xpBadge: {
    marginTop: 16,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  xpBadgeText: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.accent },
  statsRow:  { flexDirection: 'row', gap: 20, marginTop: 28 },
  statBox:   { alignItems: 'center' },
  statValue: { fontSize: 32, fontFamily: 'NotoSansJP_900Black' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 36 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },
  actionBtnSecondary: {
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  actionBtnSecondaryText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
});
