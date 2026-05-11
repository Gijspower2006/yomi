import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5Word } from '../../data/n5types';
import { speakJapanese } from '../../services/speech';
import { useSRS } from '../../hooks/useSRS';

interface Props {
  words: N5Word[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 10;
type Direction = 'jp-en' | 'en-jp';
type CheckState = 'unanswered' | 'correct' | 'wrong';

interface QueueItem { word: N5Word; wrongCount: number }

export default function TranslationScreen({ words, onBack, onXPEarned }: Props) {
  const total = Math.min(words.length, SESSION_SIZE);
  const wordIds = useMemo(() => words.map(w => w.id), [words]);
  const { review } = useSRS(wordIds);

  const [direction, setDirection] = useState<Direction>('jp-en');
  const [queue, setQueue] = useState<QueueItem[]>(() =>
    words.slice(0, SESSION_SIZE).map(w => ({ word: w, wrongCount: 0 }))
  );
  const [queueIndex, setQueueIndex] = useState(0);
  const [mastered, setMastered]     = useState(0);
  const [score, setScore]           = useState(0);
  const [input, setInput]           = useState('');
  const [check, setCheck]           = useState<CheckState>('unanswered');
  const [done, setDone]             = useState(false);
  const inputRef = useRef<TextInput>(null);

  const current = queue[queueIndex];
  const word = current.word;

  const restart = (dir?: Direction) => {
    setDirection(dir ?? direction);
    setQueue(words.slice(0, SESSION_SIZE).map(w => ({ word: w, wrongCount: 0 })));
    setQueueIndex(0); setScore(0); setMastered(0); setInput('');
    setCheck('unanswered'); setDone(false);
  };

  const switchDir = (d: Direction) => { setDirection(d); restart(d); };

  const checkAnswer = useCallback(() => {
    const ans = input.trim().toLowerCase();
    if (!ans) return;

    let correct = false;
    if (direction === 'jp-en') {
      correct = word.meanings.some(m => m.toLowerCase().includes(ans) || ans.includes(m.toLowerCase().split(' ')[0]));
    } else {
      correct =
        ans === word.kanji.toLowerCase() ||
        ans === word.kana ||
        ans === word.romaji.toLowerCase() ||
        (word.altKanji ? ans === word.altKanji.toLowerCase() : false);
    }

    if (correct) {
      setScore(s => s + 1);
      setMastered(m => m + 1);
      review(word.id, 'good');
    } else {
      review(word.id, 'again');
      if (current.wrongCount < 1) {
        setQueue(prev => {
          const updated = [...prev];
          const insertAt = Math.min(queueIndex + 3, updated.length);
          updated.splice(insertAt, 0, { ...current, wrongCount: current.wrongCount + 1 });
          return updated;
        });
      }
    }
    setCheck(correct ? 'correct' : 'wrong');
  }, [input, word, direction, current, queueIndex, review]);

  const next = () => {
    if (queueIndex + 1 >= queue.length) {
      setDone(true);
      onXPEarned?.(score * 10 + 20, total);
      return;
    }
    setQueueIndex(i => i + 1);
    setInput('');
    setCheck('unanswered');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const pct = Math.round((score / total) * 100);
  // pct based on original session size for fair scoring

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <QuizHeader onBack={onBack} title="Translation Test" right={null} />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsBig}>{score}/{total}</Text>
          <Text style={styles.resultsEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultsLabel}>{pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}</Text>
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

  const isAnswered = check !== 'unanswered';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <QuizHeader onBack={onBack} title="Translation Test" right={`${score}/${queueIndex}`} />

        {/* Direction toggle — pill segmented control */}
        <View style={styles.dirRow}>
          <View style={styles.dirSegment}>
            <TouchableOpacity
              style={[styles.dirBtn, direction === 'jp-en' && styles.dirBtnActive]}
              onPress={() => switchDir('jp-en')}
            >
              <Text style={[styles.dirText, direction === 'jp-en' && styles.dirTextActive]}>JP → EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dirBtn, direction === 'en-jp' && styles.dirBtnActive]}
              onPress={() => switchDir('en-jp')}
            >
              <Text style={[styles.dirText, direction === 'en-jp' && styles.dirTextActive]}>EN → JP</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(mastered / total) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Prompt card — PRIMARY BLUE background */}
          <View style={styles.promptCard}>
            <Text style={styles.questionNum}>Question {queueIndex + 1} · {mastered}/{total} mastered</Text>
            {direction === 'jp-en' ? (
              <>
                <Text style={styles.promptMain}>{word.kanji}</Text>
                {word.kanji !== word.kana && (
                  <Text style={styles.promptKana}>{word.kana}</Text>
                )}
                <Text style={styles.promptRomaji}>{word.romaji}</Text>
                <TouchableOpacity style={styles.speakBtn} onPress={() => speakJapanese(word.kana)}>
                  <Ionicons name="volume-medium" size={16} color={Colors.white} />
                  <Text style={styles.speakBtnText}>Listen</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.promptEnglish}>{word.meanings.join(', ')}</Text>
                <Text style={styles.promptHint}>Type in Japanese (kana or romaji)</Text>
              </>
            )}
          </View>

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              isAnswered && (check === 'correct' ? styles.inputCorrect : styles.inputWrong),
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={direction === 'jp-en' ? 'Type the English meaning…' : 'Type Japanese (kana or romaji)…'}
            placeholderTextColor={Colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isAnswered}
            onSubmitEditing={check === 'unanswered' ? checkAnswer : next}
            returnKeyType={isAnswered ? 'next' : 'done'}
          />

          {/* Feedback */}
          {isAnswered && (
            <View style={[styles.feedback, check === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={[styles.feedbackIcon, { color: check === 'correct' ? Colors.success : Colors.error }]}>
                {check === 'correct' ? '✓' : '✗'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackTitle}>
                  {check === 'correct' ? 'Correct!' : 'Not quite'}
                </Text>
                {check === 'wrong' && (
                  <Text style={styles.feedbackAnswer}>
                    {direction === 'jp-en'
                      ? `Correct: ${word.meanings.join(' / ')}`
                      : `Correct: ${word.kanji}  ${word.kana !== word.kanji ? `(${word.kana})` : ''}  ${word.romaji}`}
                  </Text>
                )}
              </View>
            </View>
          )}

          {!isAnswered ? (
            <TouchableOpacity style={styles.submitBtn} onPress={checkAnswer}>
              <Text style={styles.submitBtnText}>Check Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextBtnText}>
                {queueIndex + 1 >= queue.length ? 'See Results' : 'Next →'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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

  // Direction toggle
  dirRow: {
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dirSegment: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: 100,
    padding: 3,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
  },
  dirBtnActive: { backgroundColor: Colors.primary },
  dirText: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  dirTextActive: { color: Colors.white },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  scroll: { padding: 16, paddingBottom: 60 },

  // Prompt card — PRIMARY BLUE
  promptCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 8,
  },
  questionNum: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  promptMain: { fontSize: 52, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.white, textAlign: 'center' },
  promptKana: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  promptRomaji: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  speakBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  speakBtnText: { fontSize: 14, color: Colors.white, fontFamily: 'NotoSansJP_600SemiBold' },
  promptEnglish: { fontSize: 28, fontFamily: 'NotoSansJP_700Bold', color: Colors.white, textAlign: 'center' },
  promptHint: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },

  input: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 14,
  },
  inputCorrect: { borderColor: Colors.success, backgroundColor: Colors.successLight },
  inputWrong:   { borderColor: Colors.error,   backgroundColor: Colors.errorLight },

  feedback: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
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
  feedbackIcon: { fontSize: 20, fontFamily: 'NotoSansJP_800ExtraBold' },
  feedbackTitle: { fontSize: 15, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  feedbackAnswer: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.white, fontSize: 17, fontFamily: 'NotoSansJP_700Bold' },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: Colors.white, fontSize: 17, fontFamily: 'NotoSansJP_700Bold' },

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
