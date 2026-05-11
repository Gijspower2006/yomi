import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5Word } from '../../data/n5types';
import { N5_WORDS } from '../../data/n5words';
import { speakJapanese } from '../../services/speech';

interface Props {
  words: N5Word[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 10;

type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface Question {
  word: N5Word;
  options: string[];
  correct: number;
}

function buildInitialQueue(words: N5Word[]): Question[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, SESSION_SIZE);
  return shuffled.map(word => makeQuestion(word));
}

function makeQuestion(word: N5Word): Question {
  const distractors = N5_WORDS
    .filter(w => w.id !== word.id && w.pos === word.pos)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const fallback = distractors.length < 3
    ? N5_WORDS
        .filter(w => w.id !== word.id && !distractors.some(d => d.id === w.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - distractors.length)
    : [];

  const allDistractors = [...distractors, ...fallback].slice(0, 3);
  const correctAnswer = word.meanings[0];
  const wrongAnswers = allDistractors.map(w => w.meanings[0]);
  const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
  return { word, options, correct: options.indexOf(correctAnswer) };
}

export default function ListeningQuizScreen({ words, onBack, onXPEarned }: Props) {
  const [queue, setQueue] = useState<Question[]>(() => buildInitialQueue(words));
  const [total] = useState(SESSION_SIZE);
  const [queueIndex, setQueueIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [done, setDone] = useState(false);
  const spokenRef = useRef<string | null>(null);

  const currentQuestion = queue[queueIndex];

  const playAudio = useCallback((kana: string) => {
    speakJapanese(kana);
  }, []);

  useEffect(() => {
    if (!currentQuestion || done) return;
    const key = `${queueIndex}-${currentQuestion.word.id}`;
    if (spokenRef.current === key) return;
    spokenRef.current = key;
    playAudio(currentQuestion.word.kana);
  }, [queueIndex, currentQuestion, done, playAudio]);

  const pickAnswer = (i: number) => {
    if (answerState !== 'unanswered') return;
    setSelected(i);
    const isCorrect = i === currentQuestion.correct;

    if (isCorrect) {
      setAnswerState('correct');
      setScore(s => s + 1);
      setMasteredCount(m => m + 1);
    } else {
      setAnswerState('wrong');
      setQueue(prev => {
        const next = [...prev];
        const requeueAt = Math.min(queueIndex + 3, next.length);
        next.splice(requeueAt, 0, makeQuestion(currentQuestion.word));
        return next;
      });
    }
  };

  const next = () => {
    const nextIndex = queueIndex + 1;
    if (masteredCount >= total || nextIndex >= queue.length) {
      setDone(true);
      onXPEarned?.(score * 10 + 20, SESSION_SIZE);
      return;
    }
    setQueueIndex(nextIndex);
    setSelected(null);
    setAnswerState('unanswered');
  };

  const restart = useCallback(() => {
    const newQueue = buildInitialQueue(words);
    setQueue(newQueue);
    setQueueIndex(0);
    setScore(0);
    setMasteredCount(0);
    setSelected(null);
    setAnswerState('unanswered');
    setDone(false);
    spokenRef.current = null;
  }, [words]);

  const progressPct = (masteredCount / total) * 100;
  const pct = Math.round((score / total) * 100);

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <QuizHeader onBack={onBack} title="Listening Quiz" right={null} />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsBig}>{score}/{total}</Text>
          <Text style={styles.resultsEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultsLabel}>
            {pct >= 80 ? 'Excellent listening!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
          </Text>
          <Text style={styles.resultsSub}>{pct}% correct</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{score * 10 + 20} XP</Text>
          </View>
          <View style={styles.resultsRow}>
            <TouchableOpacity style={[styles.resultsBtn, styles.resultsBtnSecondary]} onPress={onBack}>
              <Text style={styles.resultsBtnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resultsBtn} onPress={restart}>
              <Text style={styles.resultsBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <QuizHeader onBack={onBack} title="Listening Quiz" right={`${score}/${masteredCount}`} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.questionNum}>
          Word {masteredCount + 1} of {total}
        </Text>

        <View style={styles.speakerCard}>
          <Text style={styles.listenSubtitle}>Listen carefully</Text>
          <TouchableOpacity
            style={styles.speakerIconBtn}
            onPress={() => playAudio(currentQuestion.word.kana)}
            activeOpacity={0.7}
          >
            <Ionicons name="volume-high" size={56} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.replayHint}>Tap to replay</Text>
        </View>

        <Text style={styles.chooseLabel}>Choose the correct meaning:</Text>

        {currentQuestion.options.map((opt, i) => {
          const isAnswered = answerState !== 'unanswered';
          const isCorrect = i === currentQuestion.correct;
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
                ]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                isAnswered && isCorrect && { color: Colors.success },
                isAnswered && isWrong && { color: Colors.error },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}

        {answerState !== 'unanswered' && (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>
              {masteredCount >= total || queueIndex + 1 >= queue.length
                ? 'See Results'
                : 'Next →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuizHeader({
  onBack,
  title,
  right,
}: {
  onBack: () => void;
  title: string;
  right: string | null;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backChevron}>‹</Text>
        <Text style={styles.backLabel}>Study</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.scoreContainer}>
        {right !== null && <Text style={styles.scoreText}>{right}</Text>}
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
  scoreContainer: { width: 70, alignItems: 'flex-end' },
  scoreText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  scroll: { padding: 16, paddingBottom: 40 },

  questionNum: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  speakerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 8,
  },
  listenSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    fontFamily: 'NotoSansJP_500Medium',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  speakerIconBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  replayHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'NotoSansJP_400Regular',
    letterSpacing: 0.3,
  },

  chooseLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
    marginBottom: 10,
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
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 16,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.text,
    flex: 1,
  },

  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },

  resultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultsBig: { fontSize: 72, fontFamily: 'NotoSansJP_900Black', color: Colors.primary },
  resultsEmoji: { fontSize: 40, marginTop: 8 },
  resultsLabel: {
    fontSize: 22,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.text,
    marginTop: 8,
  },
  resultsSub: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },
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
  resultsRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  resultsBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultsBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },
  resultsBtnSecondary: {
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  resultsBtnSecondaryText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
});
