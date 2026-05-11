import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { N5Kanji } from '../../data/n5kanji';
import { N5_KANJI } from '../../data/n5kanji';
import { useSRS } from '../../hooks/useSRS';
import { speakJapanese } from '../../services/speech';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  kanji: N5Kanji[];
  onBack: () => void;
  onXPEarned?: (xp: number, wordsStudied: number) => void;
}

const SESSION_SIZE = 10;
type Direction = 'kanji-meaning' | 'meaning-kanji';
type AnswerState = 'unanswered' | 'correct' | 'wrong';

const toId = (k: N5Kanji) => `kanji_${k.char}`;

interface Question {
  item: N5Kanji;
  options: string[];
  correctIndex: number;
  direction: Direction;
}

function buildQuestions(pool: N5Kanji[], direction: Direction): Question[] {
  return pool.slice(0, SESSION_SIZE).map(item => {
    const distractors = N5_KANJI
      .filter(k => k.char !== item.char && k.category === item.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // fill with random if same-category distractors are scarce
    const extra = N5_KANJI
      .filter(k => k.char !== item.char && !distractors.includes(k))
      .sort(() => Math.random() - 0.5);
    while (distractors.length < 3) distractors.push(extra[distractors.length]);

    if (direction === 'kanji-meaning') {
      const correct = item.meanings[0];
      const wrong   = distractors.map(d => d.meanings[0]);
      const options = [...wrong, correct].sort(() => Math.random() - 0.5);
      return { item, options, correctIndex: options.indexOf(correct), direction };
    } else {
      const correct = item.char;
      const wrong   = distractors.map(d => d.char);
      const options = [...wrong, correct].sort(() => Math.random() - 0.5);
      return { item, options, correctIndex: options.indexOf(correct), direction };
    }
  });
}

export default function KanjiQuizScreen({ kanji, onBack, onXPEarned }: Props) {
  const kanjiIds = useMemo(() => kanji.map(toId), [kanji]);
  const { review } = useSRS(kanjiIds);

  const [direction, setDirection] = useState<Direction>('kanji-meaning');
  const [queue, setQueue] = useState<Question[]>(() =>
    buildQuestions([...kanji].sort(() => Math.random() - 0.5), 'kanji-meaning')
  );
  const [queueIndex, setQueueIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [done, setDone] = useState(false);

  const q = queue[queueIndex];
  const total = queue.length;

  const restart = useCallback((dir?: Direction) => {
    const d = dir ?? direction;
    setQueue(buildQuestions([...kanji].sort(() => Math.random() - 0.5), d));
    setQueueIndex(0); setScore(0); setSelected(null);
    setAnswerState('unanswered'); setDone(false);
  }, [kanji, direction]);

  const switchDirection = (d: Direction) => { setDirection(d); restart(d); };

  const pickAnswer = (i: number) => {
    if (answerState !== 'unanswered') return;
    setSelected(i);
    const correct = i === q.correctIndex;
    setAnswerState(correct ? 'correct' : 'wrong');
    review(toId(q.item), correct ? 'good' : 'again');
    if (correct) setScore(s => s + 1);
  };

  const next = () => {
    if (queueIndex + 1 >= total) { setDone(true); onXPEarned?.(score * 15 + 10, score); return; }
    setQueueIndex(i => i + 1);
    setSelected(null);
    setAnswerState('unanswered');
  };

  // ── Done ──────────────────────────────────────────────────────────────────

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={onBack} direction={direction} onSwitch={switchDirection} progress={1} />
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>{pct >= 80 ? '🎌' : pct >= 50 ? '📖' : '🔄'}</Text>
          <Text style={styles.doneTitle}>{pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}</Text>
          <Text style={styles.doneSub}>{score}/{total} correct · {pct}%</Text>
          <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>+{score * 15 + 10} XP</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onBack}>
              <Text style={styles.btnSecondaryText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => restart()}>
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!q) return null;

  const optionColor = (i: number) => {
    if (answerState === 'unanswered') return styles.optionDefault;
    if (i === q.correctIndex)        return styles.optionCorrect;
    if (i === selected)              return styles.optionWrong;
    return styles.optionDefault;
  };

  const optionTextColor = (i: number): object => {
    if (answerState === 'unanswered') return {};
    if (i === q.correctIndex)        return { color: '#06D6A0' };
    if (i === selected)              return { color: '#EF233C' };
    return {};
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={onBack} direction={direction} onSwitch={switchDirection} progress={queueIndex / total} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(queueIndex / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Prompt */}
        <View style={styles.promptCard}>
          {q.direction === 'kanji-meaning' ? (
            <>
              <TouchableOpacity onPress={() => speakJapanese(q.item.char)} style={styles.speakBtn}>
                <Ionicons name="volume-medium-outline" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.promptKanji}>{q.item.char}</Text>
              <Text style={styles.promptHint}>{q.item.onyomi[0] ?? q.item.kunyomi[0] ?? ''}</Text>
              <Text style={styles.promptLabel}>What does this kanji mean?</Text>
            </>
          ) : (
            <>
              <Text style={styles.promptMeaning}>{q.item.meanings[0]}</Text>
              {q.item.onyomi[0] && <Text style={styles.promptHint}>On: {q.item.onyomi[0]}</Text>}
              <Text style={styles.promptLabel}>Which kanji is this?</Text>
            </>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, optionColor(i)]}
              onPress={() => pickAnswer(i)}
              activeOpacity={0.8}
            >
              <Text style={[
                q.direction === 'meaning-kanji' ? styles.optionKanji : styles.optionText,
                optionTextColor(i),
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback */}
        {answerState !== 'unanswered' && (
          <View style={[styles.feedback, answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>
              {answerState === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
            </Text>
            <Text style={styles.feedbackSub}>
              {q.item.char} — {q.item.meanings.join(', ')}
            </Text>
            <Text style={styles.feedbackReadings}>
              {q.item.onyomi.length > 0 ? `音: ${q.item.onyomi.join(' · ')}` : ''}
              {q.item.onyomi.length > 0 && q.item.kunyomi.length > 0 ? '   ' : ''}
              {q.item.kunyomi.length > 0 ? `訓: ${q.item.kunyomi.join(' · ')}` : ''}
            </Text>
            <TouchableOpacity style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextBtnText}>{queueIndex + 1 >= total ? 'Finish' : 'Next  ›'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, direction, onSwitch, progress }: {
  onBack: () => void; direction: Direction;
  onSwitch: (d: Direction) => void; progress: number;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerLeft}>
        <Text style={styles.headerLeftText}>‹  Study</Text>
      </TouchableOpacity>
      <View style={styles.dirToggle}>
        <TouchableOpacity
          style={[styles.dirBtn, direction === 'kanji-meaning' && styles.dirBtnActive]}
          onPress={() => onSwitch('kanji-meaning')}
        >
          <Text style={[styles.dirBtnText, direction === 'kanji-meaning' && styles.dirBtnTextActive]}>漢→En</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dirBtn, direction === 'meaning-kanji' && styles.dirBtnActive]}
          onPress={() => onSwitch('meaning-kanji')}
        >
          <Text style={[styles.dirBtnText, direction === 'meaning-kanji' && styles.dirBtnTextActive]}>En→漢</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
    gap: 8,
  },
  headerLeft: { width: 70 },
  headerLeftText: { fontSize: 15, color: Colors.primary, fontFamily: 'NotoSansJP_600SemiBold' },
  headerRight: { width: 70 },
  dirToggle: { flex: 1, flexDirection: 'row', backgroundColor: Colors.inputBg, borderRadius: 10, padding: 3, gap: 2 },
  dirBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  dirBtnActive: { backgroundColor: Colors.primary },
  dirBtnText: { fontSize: 12, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  dirBtnTextActive: { color: '#fff' },

  progressTrack: { height: 4, backgroundColor: Colors.border },
  progressFill:  { height: 4, backgroundColor: Colors.primary },

  scroll: { padding: 20 },

  promptCard: {
    backgroundColor: Colors.card, borderRadius: 24,
    padding: 32, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 180, justifyContent: 'center',
  },
  speakBtn: { position: 'absolute', top: 12, right: 12, padding: 6 },
  promptKanji: { fontSize: 88, fontFamily: 'NotoSansJP_900Black', color: Colors.text, lineHeight: 96 },
  promptMeaning: { fontSize: 28, fontFamily: 'NotoSansJP_700Bold', color: Colors.text, textAlign: 'center' },
  promptHint: { fontSize: 15, color: Colors.textSecondary, marginTop: 4, fontFamily: 'NotoSansJP_500Medium' },
  promptLabel: { fontSize: 12, color: Colors.textLight, marginTop: 10, fontFamily: 'NotoSansJP_500Medium' },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  option: {
    width: '47%', flexGrow: 1,
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, minHeight: 72,
  },
  optionDefault: { backgroundColor: Colors.card, borderColor: Colors.border },
  optionCorrect: { backgroundColor: '#06D6A015', borderColor: '#06D6A0' },
  optionWrong:   { backgroundColor: '#EF233C15', borderColor: '#EF233C' },
  optionText:  { fontSize: 16, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.text, textAlign: 'center' },
  optionKanji: { fontSize: 36, fontFamily: 'NotoSansJP_900Black', color: Colors.text },

  feedback: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, alignItems: 'center', gap: 6,
  },
  feedbackCorrect: { backgroundColor: '#06D6A010', borderColor: '#06D6A040' },
  feedbackWrong:   { backgroundColor: '#EF233C10', borderColor: '#EF233C40' },
  feedbackTitle: { fontSize: 18, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  feedbackSub:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  feedbackReadings: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  nextBtn: {
    marginTop: 10, backgroundColor: Colors.primary,
    borderRadius: 100, paddingHorizontal: 32, paddingVertical: 12,
  },
  nextBtnText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  doneSub: { fontSize: 15, color: Colors.textSecondary, marginTop: 8 },
  xpBadge: { marginTop: 16, backgroundColor: Colors.accent + '22', borderWidth: 1, borderColor: Colors.accent + '55', borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8 },
  xpBadgeText: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.accent },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 36 },
  btn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'NotoSansJP_700Bold' },
  btnSecondary: { backgroundColor: Colors.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  btnSecondaryText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
});
