import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { KANA, KanaChar } from '../../data/kana';

interface Props {
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 20;
const CORRECT_DELAY = 800;
const WRONG_DELAY = 1200;

type KanaType = 'hiragana' | 'katakana';
type GroupFilter = 'basic' | 'all';
type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface Question {
  char: KanaChar;
  options: string[];
  correct: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(kanaType: KanaType, groupFilter: GroupFilter): Question[] {
  const pool = KANA.filter(k =>
    k.type === kanaType && (groupFilter === 'all' || k.group === 'basic'),
  );
  const session = shuffle(pool).slice(0, SESSION_SIZE);

  return session.map(char => {
    const distractorPool = pool.filter(k => k.kana !== char.kana && k.romaji !== char.romaji);
    const distractors = shuffle(distractorPool)
      .slice(0, 3)
      .map(k => k.romaji);
    const options = shuffle([...distractors, char.romaji]);
    return { char, options, correct: options.indexOf(char.romaji) };
  });
}

export default function KanaScreen({ onBack, onXPEarned }: Props) {
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('basic');
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions('hiragana', 'basic'));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [done, setDone] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const total = questions.length;
  const q = questions[index];

  const restart = useCallback((type?: KanaType, group?: GroupFilter) => {
    const t = type ?? kanaType;
    const g = group ?? groupFilter;
    const newQuestions = buildQuestions(t, g);
    setQuestions(newQuestions);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswerState('unanswered');
    setDone(false);
    progressAnim.setValue(0);
  }, [kanaType, groupFilter, progressAnim]);

  const switchType = (t: KanaType) => {
    setKanaType(t);
    restart(t, groupFilter);
  };

  const switchGroup = (g: GroupFilter) => {
    setGroupFilter(g);
    restart(kanaType, g);
  };

  const advance = useCallback((currentIndex: number, currentScore: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      setDone(true);
      onXPEarned?.(currentScore * 5 + 10, 20);
      return;
    }
    Animated.timing(progressAnim, {
      toValue: nextIndex / total,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIndex(nextIndex);
    setSelected(null);
    setAnswerState('unanswered');
  }, [total, progressAnim, onXPEarned]);

  const pickAnswer = (i: number) => {
    if (answerState !== 'unanswered') return;

    setSelected(i);
    const isCorrect = i === q.correct;
    const newState: AnswerState = isCorrect ? 'correct' : 'wrong';
    setAnswerState(newState);

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    Animated.sequence([
      Animated.timing(cardScale, { toValue: isCorrect ? 1.04 : 0.97, duration: 120, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      advance(index, newScore);
    }, isCorrect ? CORRECT_DELAY : WRONG_DELAY);
  };

  const progressWidth = useMemo(() => {
    return progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
  }, [progressAnim]);

  const xp = score * 5 + 10;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} score={null} />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsBig}>{score}/{total}</Text>
          <Text style={styles.resultsEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultsLabel}>
            {pct >= 80 ? 'Great job!' : pct >= 50 ? 'Keep going!' : 'Keep studying!'}
          </Text>
          <Text style={styles.resultsSub}>{pct}% correct</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{xp} XP</Text>
          </View>
          <View style={styles.resultsRow}>
            <TouchableOpacity style={[styles.resultsBtn, styles.resultsBtnSecondary]} onPress={onBack}>
              <Text style={styles.resultsBtnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resultsBtn} onPress={() => restart()}>
              <Text style={styles.resultsBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={onBack} score={`${score}/${index}`} />

      <View style={styles.toggleArea}>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segBtn, kanaType === 'hiragana' && styles.segBtnActive]}
            onPress={() => switchType('hiragana')}
          >
            <Text style={[styles.segText, kanaType === 'hiragana' && styles.segTextActive]}>
              Hiragana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, kanaType === 'katakana' && styles.segBtnActive]}
            onPress={() => switchType('katakana')}
          >
            <Text style={[styles.segText, kanaType === 'katakana' && styles.segTextActive]}>
              Katakana
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.segmentRow, { marginTop: 8 }]}>
          <TouchableOpacity
            style={[styles.segBtn, groupFilter === 'basic' && styles.segBtnActive]}
            onPress={() => switchGroup('basic')}
          >
            <Text style={[styles.segText, groupFilter === 'basic' && styles.segTextActive]}>
              Basic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, groupFilter === 'all' && styles.segBtnActive]}
            onPress={() => switchGroup('all')}
          >
            <Text style={[styles.segText, groupFilter === 'all' && styles.segTextActive]}>
              Basic + Dakuten
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <Text style={styles.questionNum}>Question {index + 1} of {total}</Text>

        <Animated.View style={[styles.questionCard, { transform: [{ scale: cardScale }] }]}>
          <Text style={styles.kanaChar}>{q.char.kana}</Text>
          <Text style={styles.kanaTypeLabel}>
            {q.char.type === 'hiragana' ? 'Hiragana' : 'Katakana'}
            {q.char.group === 'dakuten' ? ' · Dakuten' : ''}
          </Text>
        </Animated.View>

        <Text style={styles.chooseLabel}>CHOOSE THE CORRECT READING</Text>

        {q.options.map((opt, i) => {
          const isAnswered = answerState !== 'unanswered';
          const isCorrect = i === q.correct;
          const isWrongSelected = i === selected && !isCorrect;
          return (
            <TouchableOpacity
              key={`${index}-${i}`}
              style={[
                styles.optionBtn,
                isAnswered && isCorrect && styles.optionCorrect,
                isAnswered && isWrongSelected && styles.optionWrong,
              ]}
              onPress={() => pickAnswer(i)}
              activeOpacity={0.75}
              disabled={answerState !== 'unanswered'}
            >
              <View style={[
                styles.optionLetterBox,
                isAnswered && isCorrect && styles.optionLetterCorrect,
                isAnswered && isWrongSelected && styles.optionLetterWrong,
              ]}>
                <Text style={[
                  styles.optionLetter,
                  isAnswered && isCorrect && styles.optionLetterTextCorrect,
                  isAnswered && isWrongSelected && styles.optionLetterTextWrong,
                ]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                isAnswered && isCorrect && { color: Colors.success },
                isAnswered && isWrongSelected && { color: Colors.error },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, score }: { onBack: () => void; score: string | null }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backChevron}>‹</Text>
        <Text style={styles.backLabel}>Study</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Kana Quiz</Text>
      <View style={styles.scoreBox}>
        {score !== null && <Text style={styles.scoreText}>{score}</Text>}
      </View>
    </View>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.text,
  },
  scoreBox: { width: 70, alignItems: 'flex-end' },
  scoreText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },

  toggleArea: {
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: 100,
    padding: 3,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: Colors.primary },
  segText: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  segTextActive: { color: Colors.white },

  progressTrack: { height: 6, backgroundColor: Colors.border },
  progressFill: { height: 6, backgroundColor: Colors.primary },

  scroll: { padding: 16, paddingBottom: 48 },

  questionNum: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  questionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  kanaChar: {
    fontSize: 96,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    lineHeight: 112,
  },
  kanaTypeLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_500Medium',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    letterSpacing: 0.5,
  },

  chooseLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '44',
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionWrong: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error + '44',
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLetterBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionLetterCorrect: { backgroundColor: Colors.success + '26' },
  optionLetterWrong: { backgroundColor: Colors.error + '26' },
  optionLetter: {
    fontSize: 13,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.primary,
  },
  optionLetterTextCorrect: { color: Colors.success },
  optionLetterTextWrong: { color: Colors.error },
  optionText: {
    fontSize: 20,
    fontFamily: 'NotoSansJP_600SemiBold',
    color: Colors.text,
    flex: 1,
  },

  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultsBig: {
    fontSize: 72,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.primary,
  },
  resultsEmoji: { fontSize: 40, marginTop: 8 },
  resultsLabel: {
    fontSize: 22,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.text,
    marginTop: 8,
  },
  resultsSub: {
    fontSize: 15,
    fontFamily: 'NotoSansJP_400Regular',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  xpBadge: {
    marginTop: 20,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  xpBadgeText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.accent,
  },
  resultsRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  resultsBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultsBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'NotoSansJP_700Bold',
  },
  resultsBtnSecondary: {
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  resultsBtnSecondaryText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.text,
  },
});
