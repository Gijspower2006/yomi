import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { N5Word } from '../../data/n5types';
import { N5_WORDS } from '../../data/n5words';
import { useSRS } from '../../hooks/useSRS';

interface Props {
  words: N5Word[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 10;

type Direction = 'jp-en' | 'en-jp';
type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface Question {
  word: N5Word;
  options: string[];
  correct: number;
  wrongCount: number;
}

function buildQuestions(words: N5Word[], direction: Direction): Question[] {
  return words.slice(0, SESSION_SIZE).map(word => {
    const distractors = N5_WORDS
      .filter(w => w.id !== word.id && w.pos === word.pos)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (direction === 'jp-en') {
      const correctAnswer = word.meanings[0];
      const wrongAnswers = distractors.map(w => w.meanings[0]);
      const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
      return { word, options, correct: options.indexOf(correctAnswer), wrongCount: 0 };
    } else {
      const correctAnswer = word.kanji;
      const wrongAnswers = distractors.map(w => w.kanji);
      const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
      return { word, options, correct: options.indexOf(correctAnswer), wrongCount: 0 };
    }
  });
}

export default function WordQuizScreen({ words, onBack, onXPEarned }: Props) {
  const total = Math.min(words.length, SESSION_SIZE);
  const wordIds = useMemo(() => words.map(w => w.id), [words]);
  const { review } = useSRS(wordIds);

  const [direction, setDirection] = useState<Direction>('jp-en');
  const [queue, setQueue] = useState<Question[]>(() =>
    buildQuestions([...words].sort(() => Math.random() - 0.5), 'jp-en')
  );
  const [queueIndex, setQueueIndex] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [done, setDone] = useState(false);

  const q = queue[queueIndex];

  const restart = useCallback((dir?: Direction) => {
    const d = dir ?? direction;
    setQueue(buildQuestions([...words].sort(() => Math.random() - 0.5), d));
    setQueueIndex(0); setScore(0); setMastered(0);
    setSelected(null); setAnswerState('unanswered'); setDone(false);
  }, [words, direction]);

  const switchDirection = (d: Direction) => {
    setDirection(d);
    restart(d);
  };

  const pickAnswer = (i: number) => {
    if (answerState !== 'unanswered') return;
    setSelected(i);
    const isCorrect = i === q.correct;
    setAnswerState(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(s => s + 1);
      setMastered(m => m + 1);
      review(q.word.id, 'good');
    } else {
      review(q.word.id, 'again');
      if (q.wrongCount < 1) {
        setQueue(prev => {
          const updated = [...prev];
          const insertAt = Math.min(queueIndex + 3, updated.length);
          updated.splice(insertAt, 0, { ...q, wrongCount: q.wrongCount + 1 });
          return updated;
        });
      }
    }
  };

  const next = () => {
    if (queueIndex + 1 >= queue.length) {
      setDone(true);
      onXPEarned?.(score * 10 + 20, total);
      return;
    }
    setQueueIndex(i => i + 1);
    setSelected(null);
    setAnswerState('unanswered');
  };

  const pct = Math.round((score / total) * 100);

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} title="Word Quiz" right={null} />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsBig}>{score}/{total}</Text>
          <Text style={styles.resultsEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultsLabel}>{pct >= 80 ? 'Great job!' : pct >= 50 ? 'Keep going!' : 'Keep studying!'}</Text>
          <Text style={styles.resultsSub}>{pct}% correct</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{score * 10 + 20} XP</Text>
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
      <Header onBack={onBack} title="Word Quiz" right={`${score}/${queueIndex}`} />

      <View style={styles.dirRow}>
        <View style={styles.dirSegment}>
          <TouchableOpacity
            style={[styles.dirBtn, direction === 'jp-en' && styles.dirBtnActive]}
            onPress={() => switchDirection('jp-en')}
          >
            <Text style={[styles.dirText, direction === 'jp-en' && styles.dirTextActive]}>JP → EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dirBtn, direction === 'en-jp' && styles.dirBtnActive]}
            onPress={() => switchDirection('en-jp')}
          >
            <Text style={[styles.dirText, direction === 'en-jp' && styles.dirTextActive]}>EN → JP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(mastered / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNum}>Question {queueIndex + 1} · {mastered}/{total} mastered</Text>
          {direction === 'jp-en' ? (
            <>
              <Text style={styles.questionMain}>{q.word.kanji}</Text>
              {q.word.kanji !== q.word.kana && (
                <Text style={styles.questionSub}>{q.word.kana}</Text>
              )}
              <Text style={styles.questionRomaji}>{q.word.romaji}</Text>
            </>
          ) : (
            <Text style={styles.questionMain}>{q.word.meanings[0]}</Text>
          )}
          {q.wrongCount > 0 && (
            <View style={styles.requeueBadge}>
              <Text style={styles.requeueBadgeText}>Try again</Text>
            </View>
          )}
        </View>

        <Text style={styles.chooseLabel}>Choose the correct answer:</Text>
        {q.options.map((opt, i) => {
          const isAnswered = answerState !== 'unanswered';
          const isCorrect = i === q.correct;
          const isWrong = i === selected && !isCorrect;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                isAnswered && isCorrect && styles.optionCorrect,
                isAnswered && isWrong && styles.optionWrong,
              ]}
              onPress={() => pickAnswer(i)}
              activeOpacity={0.75}
            >
              <View style={[
                styles.optionLetterBox,
                isAnswered && isCorrect && styles.optionLetterCorrect,
                isAnswered && isWrong && styles.optionLetterWrong,
              ]}>
                <Text style={[
                  styles.optionLetter,
                  isAnswered && isCorrect && styles.optionLetterTextCorrect,
                  isAnswered && isWrong && styles.optionLetterTextWrong,
                ]}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[
                styles.optionText,
                isAnswered && isCorrect && { color: Colors.success },
                isAnswered && isWrong && { color: Colors.error },
              ]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {answerState !== 'unanswered' && (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>
              {queueIndex + 1 >= queue.length ? 'See Results' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, title, right }: { onBack: () => void; title: string; right: string | null }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backChevron}>‹</Text>
        <Text style={styles.backLabel}>Study</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.backBtn}>
        {right && <Text style={styles.scoreText}>{right}</Text>}
      </View>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 70 },
  backChevron: { fontSize: 26, color: Colors.primary, lineHeight: 30, marginRight: 2 },
  backLabel: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  scoreText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', width: 70 },

  dirRow: {
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  dirSegment: { flexDirection: 'row', backgroundColor: Colors.inputBg, borderRadius: 100, padding: 3 },
  dirBtn: { flex: 1, paddingVertical: 8, borderRadius: 100, alignItems: 'center' },
  dirBtnActive: { backgroundColor: Colors.primary },
  dirText: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  dirTextActive: { color: Colors.white },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  scroll: { padding: 16, paddingBottom: 40 },

  questionCard: {
    backgroundColor: Colors.primary, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50, shadowRadius: 16, elevation: 8,
  },
  questionNum: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  questionMain: { fontSize: 48, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.white, textAlign: 'center' },
  questionSub: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  questionRomaji: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  requeueBadge: {
    marginTop: 12, backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4,
  },
  requeueBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'NotoSansJP_600SemiBold' },

  chooseLabel: {
    fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.textLight,
    letterSpacing: 1.5, marginBottom: 10,
  },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  optionCorrect: { backgroundColor: Colors.successLight, borderColor: Colors.success + '44', borderWidth: StyleSheet.hairlineWidth },
  optionWrong:   { backgroundColor: Colors.errorLight,   borderColor: Colors.error   + '44', borderWidth: StyleSheet.hairlineWidth },
  optionLetterBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.primary + '26',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  optionLetterCorrect: { backgroundColor: Colors.success + '26' },
  optionLetterWrong:   { backgroundColor: Colors.error + '26' },
  optionLetter: { fontSize: 13, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.primary },
  optionLetterTextCorrect: { color: Colors.success },
  optionLetterTextWrong:   { color: Colors.error },
  optionText: { fontSize: 16, color: Colors.text, flex: 1 },

  nextBtn: {
    backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  nextBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },

  resultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultsBig: { fontSize: 72, fontFamily: 'NotoSansJP_900Black', color: Colors.primary },
  resultsEmoji: { fontSize: 40, marginTop: 8 },
  resultsLabel: { fontSize: 22, fontFamily: 'NotoSansJP_700Bold', color: Colors.text, marginTop: 8 },
  resultsSub: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },
  xpBadge: {
    marginTop: 16, backgroundColor: Colors.accent + '22',
    borderWidth: 1, borderColor: Colors.accent + '55',
    borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8,
  },
  xpBadgeText: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.accent },
  resultsRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  resultsBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 100, paddingVertical: 16, alignItems: 'center',
  },
  resultsBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },
  resultsBtnSecondary: {
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  resultsBtnSecondaryText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
});
