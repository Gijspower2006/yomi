import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { N5Word } from '../../data/n5types';
import { N5_WORDS } from '../../data/n5words';
import { AppSettings } from '../../types';
import { BACKEND_URL } from '../../services/aiService';
import { useSRS } from '../../hooks/useSRS';

interface Props {
  words: N5Word[];
  onBack: () => void;
  settings: AppSettings;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 8;
type CheckState = 'unanswered' | 'correct' | 'wrong';

interface PoolItem { word: N5Word; wrongCount: number }

interface SentenceQuestion {
  word: N5Word;
  sentence: string;       // Japanese with ＿＿＿
  english: string;
  options: N5Word[];      // 4 words (kana shown)
  correct: number;
}

function buildOptions(word: N5Word): N5Word[] {
  const same = N5_WORDS.filter(w => w.id !== word.id && w.pos === word.pos);
  const diff = N5_WORDS.filter(w => w.id !== word.id && w.pos !== word.pos);
  const distractors = [...same.sort(() => Math.random() - 0.5).slice(0, 2),
                       ...diff.sort(() => Math.random() - 0.5).slice(0, 1)];
  const opts = [...distractors, word].sort(() => Math.random() - 0.5);
  return opts;
}

async function fetchQuestion(word: N5Word, settings: AppSettings): Promise<SentenceQuestion | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/blank-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: word.kanji, kana: word.kana, english: word.meanings[0],
        level: settings.level, provider: settings.provider,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (!data.sentence || !data.english) return null;

    const options = buildOptions(word);
    const correct = options.findIndex(w => w.id === word.id);
    return { word, sentence: data.sentence, english: data.english, options, correct };
  } catch {
    return null;
  }
}

export default function SentenceQuizScreen({ words, onBack, settings, onXPEarned }: Props) {
  const [pool, setPool] = useState<PoolItem[]>(() =>
    words.filter(w => w.pos !== 'expression' && w.pos !== 'conjunction')
      .slice(0, SESSION_SIZE)
      .map(w => ({ word: w, wrongCount: 0 }))
  );
  const total = useMemo(() => Math.min(
    words.filter(w => w.pos !== 'expression' && w.pos !== 'conjunction').length,
    SESSION_SIZE
  ), [words]);
  const wordIds = useMemo(() => words.map(w => w.id), [words]);
  const { review } = useSRS(wordIds);

  const [index, setIndex]     = useState(0);
  const [mastered, setMastered] = useState(0);
  const [score, setScore]     = useState(0);
  const [question, setQuestion] = useState<SentenceQuestion | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [check, setCheck]       = useState<CheckState>('unanswered');
  const [done, setDone]         = useState(false);

  const loadQuestion = useCallback(async (i: number) => {
    if (i >= pool.length) {
      setDone(true);
      onXPEarned?.(score * 10 + 20, total);
      return;
    }
    setLoading(true); setError(false);
    setSelected(null); setCheck('unanswered');
    const q = await fetchQuestion(pool[i].word, settings);
    if (q) { setQuestion(q); setLoading(false); }
    else { setError(true); setLoading(false); }
  }, [pool, settings, score, total]);

  useEffect(() => { loadQuestion(0); }, []);

  const pick = (i: number) => {
    if (check !== 'unanswered' || !question) return;
    setSelected(i);
    const isCorrect = i === question.correct;
    setCheck(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 1);
      setMastered(m => m + 1);
      review(question.word.id, 'good');
    } else {
      review(question.word.id, 'again');
      const item = pool[index];
      if (item.wrongCount < 1) {
        setPool(prev => {
          const updated = [...prev];
          const insertAt = Math.min(index + 3, updated.length);
          updated.splice(insertAt, 0, { ...item, wrongCount: item.wrongCount + 1 });
          return updated;
        });
      }
    }
  };

  const next = () => {
    const ni = index + 1;
    setIndex(ni);
    loadQuestion(ni);
  };

  const restart = () => {
    setPool(words.filter(w => w.pos !== 'expression' && w.pos !== 'conjunction')
      .slice(0, SESSION_SIZE).map(w => ({ word: w, wrongCount: 0 })));
    setIndex(0); setScore(0); setMastered(0); setDone(false);
    loadQuestion(0);
  };
  const pct = Math.round((score / total) * 100);

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <QuizHeader onBack={onBack} title="Sentence Quiz" right={null} />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsBig}>{score}/{total}</Text>
          <Text style={styles.resultsEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultsLabel}>{pct >= 80 ? 'Outstanding!' : pct >= 50 ? 'Nice work!' : 'Keep at it!'}</Text>
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
      <QuizHeader onBack={onBack} title="Sentence Quiz" right={`${score}/${index}`} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(mastered / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.questionNum}>Question {index + 1} · {mastered}/{total} mastered</Text>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.white} size="large" />
            <Text style={styles.loadingText}>Generating sentence…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Could not load sentence. Check your backend connection.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadQuestion(index)}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && question && (
          <>
            {/* Sentence card — PRIMARY BLUE background */}
            <View style={styles.sentenceCard}>
              <Text style={styles.sentenceJp}>{question.sentence}</Text>
              <View style={styles.divider} />
              <Text style={styles.sentenceEn}>{question.english}</Text>
            </View>

            <Text style={styles.chooseLabel}>Choose the word that fills the blank:</Text>

            {question.options.map((opt, i) => {
              const isAnswered = check !== 'unanswered';
              const isCorrect = i === question.correct;
              const isWrong = i === selected && !isCorrect;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionBtn,
                    isAnswered && isCorrect && styles.optionCorrect,
                    isAnswered && isWrong && styles.optionWrong,
                  ]}
                  onPress={() => pick(i)}
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
                  <View>
                    <Text style={[
                      styles.optionKanji,
                      isAnswered && isCorrect && { color: Colors.success },
                      isAnswered && isWrong && { color: Colors.error },
                    ]}>{opt.kanji}</Text>
                    {opt.kanji !== opt.kana && (
                      <Text style={[
                        styles.optionKana,
                        isAnswered && isCorrect && { color: Colors.success },
                        isAnswered && isWrong && { color: Colors.error },
                      ]}>{opt.kana}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {check !== 'unanswered' && (
              <>
                <View style={[styles.feedback, check === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
                  <Text style={[styles.feedbackIcon, { color: check === 'correct' ? Colors.success : Colors.error }]}>
                    {check === 'correct' ? '✓' : '✗'}
                  </Text>
                  <Text style={styles.feedbackText}>
                    {check === 'correct' ? 'Correct!' : `The answer was: ${question.word.kanji} (${question.word.meanings[0]})`}
                  </Text>
                </View>
                <TouchableOpacity style={styles.nextBtn} onPress={next}>
                  <Text style={styles.nextBtnText}>
                    {index + 1 >= total ? 'See Results' : 'Next Question →'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuizHeader({ onBack, title, right }: { onBack: () => void; title: string; right: string | null }) {
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  scoreText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', width: 70 },

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

  loadingBox: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginBottom: 20,
  },
  loadingText: { fontSize: 15, color: Colors.white },
  errorBox: { alignItems: 'center', padding: 40, gap: 16 },
  errorText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryBtnText: { color: Colors.white, fontFamily: 'NotoSansJP_700Bold' },

  // Sentence card — PRIMARY BLUE
  sentenceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 8,
  },
  sentenceJp: {
    fontSize: 22,
    color: Colors.white,
    fontFamily: 'NotoSansJP_700Bold',
    lineHeight: 34,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  sentenceEn: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
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
    gap: 12,
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
  optionCorrect: { backgroundColor: Colors.successLight },
  optionWrong:   { backgroundColor: Colors.errorLight },
  optionLetterBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterCorrect: { backgroundColor: Colors.success + '26' },
  optionLetterWrong:   { backgroundColor: Colors.error + '26' },
  optionLetter: {
    fontSize: 13,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.primary,
  },
  optionLetterTextCorrect: { color: Colors.success },
  optionLetterTextWrong:   { color: Colors.error },
  optionKanji: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  optionKana:  { fontSize: 12, color: Colors.primary },

  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  feedbackCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '50',
  },
  feedbackWrong: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error + '50',
  },
  feedbackIcon: { fontSize: 18, fontFamily: 'NotoSansJP_800ExtraBold' },
  feedbackText: { fontSize: 14, color: Colors.text, flex: 1 },

  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },

  resultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultsBig: { fontSize: 72, fontFamily: 'NotoSansJP_900Black', color: Colors.primary },
  resultsEmoji: { fontSize: 40, marginTop: 8 },
  resultsLabel: { fontSize: 22, fontFamily: 'NotoSansJP_700Bold', color: Colors.text, marginTop: 8 },
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
