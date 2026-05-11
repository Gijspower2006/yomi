import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5Kanji } from '../../data/n5kanji';
import { useSRS } from '../../hooks/useSRS';
import { SRSRating } from '../../data/srsTypes';
import { speakJapanese } from '../../services/speech';

interface Props {
  kanji: N5Kanji[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const { width: SW } = Dimensions.get('window');

const RATINGS: { key: SRSRating; label: string; sublabel: string; color: string }[] = [
  { key: 'again', label: 'Again', sublabel: '< 1d', color: '#EF233C' },
  { key: 'hard',  label: 'Hard',  sublabel: '3d',   color: '#F4A261' },
  { key: 'good',  label: 'Good',  sublabel: '~1wk', color: '#4361EE' },
  { key: 'easy',  label: 'Easy',  sublabel: '~2wk', color: '#06D6A0' },
];

function formatInterval(days: number) {
  if (days <= 1)  return '1 day';
  if (days < 30)  return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}yr`;
}

// kanji use prefixed IDs so they don't collide with word SRS data
const toId = (k: N5Kanji) => `kanji_${k.char}`;

export default function KanjiFlashcardScreen({ kanji, onBack, onXPEarned }: Props) {
  const kanjiIds = useMemo(() => kanji.map(toId), [kanji]);
  const kanjiMap = useMemo(() => new Map(kanji.map(k => [toId(k), k])), [kanji]);

  const { loaded, review, resetAll, getCard, dueCards, newCardIds, learnCards, sessionIds } = useSRS(kanjiIds);

  const [queueIndex, setQueueIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentId = sessionIds[queueIndex];
  const item      = currentId ? kanjiMap.get(currentId) : null;
  const card      = currentId ? getCard(currentId) : null;

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
  }, [currentId, queueIndex, sessionIds.length, review, reviewed, flipAnim, slideAnim, onXPEarned]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  // ── No cards ─────────────────────────────────────────────────────────────

  if (loaded && sessionIds.length === 0) {
    const nextDue = learnCards.length > 0
      ? [...learnCards].map(id => getCard(id)?.nextReview ?? Infinity).sort((a, b) => a - b)[0]
      : null;
    const hoursUntil = nextDue ? Math.ceil((nextDue - Date.now()) / 3600000) : null;

    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} right="" />
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>🎌</Text>
          <Text style={styles.doneTitle}>All caught up!</Text>
          <Text style={styles.doneSub}>{hoursUntil ? `Next review in ${hoursUntil}h` : `${newCardIds.length} kanji coming soon`}</Text>
          <View style={styles.statsRow}>
            <StatBox label="Due"      value={dueCards.length}  color={Colors.primary} />
            <StatBox label="Learning" value={learnCards.length} color="#F4A261" />
            <StatBox label="New"      value={newCardIds.length} color="#06D6A0" />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onBack}>
              <Text style={styles.btnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => { resetAll(); setQueueIndex(0); setReviewed(0); setSessionDone(false); setFlipped(false); }}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Session done ──────────────────────────────────────────────────────────

  if (sessionDone) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} right="" />
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.doneTitle}>Session complete</Text>
          <Text style={styles.doneSub}>You reviewed {reviewed} kanji.</Text>
          <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>+{reviewed * 10 + 20} XP</Text></View>
          <View style={styles.statsRow}>
            <StatBox label="Due"      value={dueCards.length}  color={Colors.primary} />
            <StatBox label="Learning" value={learnCards.length} color="#F4A261" />
            <StatBox label="New"      value={newCardIds.length} color="#06D6A0" />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onBack}>
              <Text style={styles.btnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => { setQueueIndex(0); setReviewed(0); setSessionDone(false); setFlipped(false); flipAnim.setValue(0); slideAnim.setValue(0); }}>
              <Text style={styles.btnText}>Study Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!loaded || !item) return null;

  const isNew    = card?.lastReview === 0;
  const total    = sessionIds.length;
  const progress = queueIndex / total;

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={onBack} right={`${queueIndex}/${total}`} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.counters}>
        <Pill label="Due"  value={dueCards.length}  color={Colors.primary} />
        <Pill label="New"  value={newCardIds.length} color="#06D6A0" />
        <Pill label="Done" value={reviewed}          color={Colors.textSecondary} />
      </View>

      {/* Flip card */}
      <View style={styles.cardArea}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
          {/* Front */}
          <Animated.View style={[styles.card, { transform: [{ rotateY: frontRotate }] }]}>
            <View style={styles.cardTopRow}>
              {isNew
                ? <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
                : card && <Text style={styles.intervalText}>interval: {formatInterval(card.interval)}</Text>}
            </View>
            <TouchableOpacity style={styles.cardTouch} onPress={flip} activeOpacity={0.9}>
              <Text style={styles.kanjiChar}>{item.char}</Text>
              <Text style={styles.onyomiHint}>{item.onyomi[0] ?? ''}</Text>
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakJapanese(item.char)}>
                <Ionicons name="volume-medium" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.tapHint}>Tap to reveal</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
            <ScrollView contentContainerStyle={styles.backContent} showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={flip} activeOpacity={0.9}>
                <Text style={styles.kanjiCharSmall}>{item.char}</Text>

                <View style={styles.divider} />

                {/* Meanings */}
                <Text style={styles.meaningsText}>{item.meanings.join(' · ')}</Text>

                {/* Readings */}
                <View style={styles.readingsRow}>
                  {item.onyomi.length > 0 && (
                    <View style={styles.readingGroup}>
                      <Text style={styles.readingType}>音</Text>
                      <Text style={styles.readingValues}>{item.onyomi.join('  ')}</Text>
                    </View>
                  )}
                  {item.kunyomi.length > 0 && (
                    <View style={styles.readingGroup}>
                      <Text style={[styles.readingType, { color: Colors.accent }]}>訓</Text>
                      <Text style={styles.readingValues}>{item.kunyomi.join('  ')}</Text>
                    </View>
                  )}
                </View>

                {/* Example */}
                {item.examples[0] && (
                  <View style={styles.exampleBox}>
                    <View style={styles.exampleTop}>
                      <Text style={styles.exampleWord}>{item.examples[0].word}</Text>
                      <TouchableOpacity onPress={() => speakJapanese(item.examples[0].word)} style={styles.speakBtnSmall}>
                        <Ionicons name="volume-medium-outline" size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.exampleReading}>{item.examples[0].reading}</Text>
                    <Text style={styles.exampleMeaning}>{item.examples[0].meaning}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Rating */}
      <View style={styles.ratingArea}>
        {!flipped ? (
          <TouchableOpacity style={styles.showBtn} onPress={flip}>
            <Text style={styles.showBtnText}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.ratingLabel}>How well did you know this?</Text>
            <View style={styles.ratingRow}>
              {RATINGS.map(r => (
                <TouchableOpacity key={r.key} style={[styles.ratingBtn, { backgroundColor: r.color }]} onPress={() => advance(r.key)} activeOpacity={0.8}>
                  <Text style={styles.ratingLabel2}>{r.label}</Text>
                  <Text style={styles.ratingSub}>{r.sublabel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Header({ onBack, right }: { onBack: () => void; right: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerLeft}>
        <Text style={styles.headerLeftText}>‹  Study</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Kanji Flashcards</Text>
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

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + '40', backgroundColor: color + '12' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: color + 'BB' }]}>{label}</Text>
    </View>
  );
}

const CARD_HEIGHT = 320;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  headerLeft: { width: 80 },
  headerLeftText: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  headerRight: { width: 80, textAlign: 'right', fontSize: 13, color: Colors.textSecondary },

  progressTrack: { height: 5, backgroundColor: Colors.border },
  progressFill:  { height: 5, backgroundColor: Colors.primary },

  counters: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  pillValue: { fontSize: 14, fontFamily: 'NotoSansJP_800ExtraBold' },
  pillLabel: { fontSize: 11, fontFamily: 'NotoSansJP_600SemiBold' },

  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  cardWrapper: { width: '100%' },
  card: {
    width: '100%', height: CARD_HEIGHT,
    backgroundColor: Colors.card, borderRadius: 24,
    borderTopWidth: 5, borderTopColor: Colors.primary,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 16, elevation: 8,
    backfaceVisibility: 'hidden', overflow: 'hidden',
  },
  cardBack: { position: 'absolute', top: 0, left: 0, right: 0 },
  cardTopRow: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  newBadge: { backgroundColor: '#06D6A020', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#06D6A060' },
  newBadgeText: { fontSize: 10, fontFamily: 'NotoSansJP_800ExtraBold', color: '#06D6A0' },
  intervalText: { fontSize: 11, color: Colors.textLight },

  cardTouch: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  kanjiChar: { fontSize: 90, fontFamily: 'NotoSansJP_900Black', color: Colors.text, lineHeight: 100 },
  onyomiHint: { fontSize: 16, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium', marginTop: 4 },
  speakBtn: { marginTop: 14, padding: 8 },
  speakBtnSmall: { padding: 4 },
  tapHint: { position: 'absolute', bottom: 16, fontSize: 11, color: Colors.textLight },

  backContent: { padding: 24, alignItems: 'center' },
  kanjiCharSmall: { fontSize: 48, fontFamily: 'NotoSansJP_900Black', color: Colors.text, textAlign: 'center' },
  divider: { width: 48, height: 2, backgroundColor: Colors.border, marginVertical: 12, alignSelf: 'center' },
  meaningsText: { fontSize: 18, color: Colors.text, textAlign: 'center', fontFamily: 'NotoSansJP_600SemiBold', marginBottom: 14 },

  readingsRow: { flexDirection: 'row', gap: 20, marginBottom: 14 },
  readingGroup: { alignItems: 'center', gap: 4 },
  readingType: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.primary },
  readingValues: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },

  exampleBox: {
    backgroundColor: Colors.inputBg, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', width: '100%',
  },
  exampleTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exampleWord: { fontSize: 20, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  exampleReading: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  exampleMeaning: { fontSize: 13, color: Colors.textLight, marginTop: 2 },

  ratingArea: { padding: 16, paddingBottom: 8 },
  showBtn: { backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  showBtnText: { color: '#fff', fontSize: 17, fontFamily: 'NotoSansJP_700Bold' },
  ratingLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginBottom: 10, fontFamily: 'NotoSansJP_600SemiBold' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 100 },
  ratingLabel2: { fontSize: 14, fontFamily: 'NotoSansJP_800ExtraBold', color: '#fff' },
  ratingSub: { fontSize: 10, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 2, color: 'rgba(255,255,255,0.8)' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  doneSub:   { fontSize: 15, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  xpBadge: { marginTop: 16, backgroundColor: Colors.accent + '22', borderWidth: 1, borderColor: Colors.accent + '55', borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8 },
  xpBadgeText: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.accent },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 28 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 32, fontFamily: 'NotoSansJP_900Black' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 36 },
  btn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },
  btnSecondary: { backgroundColor: Colors.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  btnSecondaryText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
});
