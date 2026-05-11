import React, { useState } from 'react';
import { N5Word } from '../../data/n5types';
import { N5Kanji } from '../../data/n5kanji';
import { N5_KANJI } from '../../data/n5kanji';
import { AppSettings } from '../../types';
import { useStreak } from '../../hooks/useStreak';
import { useXP } from '../../hooks/useXP';
import { useDailyGoal } from '../../hooks/useDailyGoal';
import { submitScore } from '../../services/leaderboardService';
import StudyHomeScreen from './StudyHomeScreen';
import FlashcardScreen from './FlashcardScreen';
import WordQuizScreen from './WordQuizScreen';
import SentenceQuizScreen from './SentenceQuizScreen';
import TranslationScreen from './TranslationScreen';
import ListeningQuizScreen from './ListeningQuizScreen';
import KanaScreen from './KanaScreen';
import KanjiFlashcardScreen from './KanjiFlashcardScreen';
import KanjiQuizScreen from './KanjiQuizScreen';

export type StudyMode =
  | 'flashcard'
  | 'wordquiz'
  | 'sentencequiz'
  | 'translation'
  | 'listening'
  | 'kana'
  | 'kanjiflashcard'
  | 'kanjiquiz';

type Screen =
  | { type: 'home' }
  | { type: 'flashcard';        words: N5Word[] }
  | { type: 'wordquiz';         words: N5Word[] }
  | { type: 'sentencequiz';     words: N5Word[] }
  | { type: 'translation';      words: N5Word[] }
  | { type: 'listening';        words: N5Word[] }
  | { type: 'kana' }
  | { type: 'kanjiflashcard';   kanji: N5Kanji[] }
  | { type: 'kanjiquiz';        kanji: N5Kanji[] };

interface Props { settings: AppSettings }

export default function StudyNavigator({ settings }: Props) {
  const [stack, setStack] = useState<Screen[]>([{ type: 'home' }]);
  const { streak, recordStudy } = useStreak();
  const { xp, weeklyXP, addXP } = useXP();
  const { recordWords } = useDailyGoal();

  const push = (s: Screen) => setStack(prev => [...prev, s]);
  const pop  = () => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  const startSession = (mode: StudyMode, words?: N5Word[]) => {
    recordStudy();
    if (mode === 'kana') { push({ type: 'kana' }); return; }
    if (mode === 'kanjiflashcard') {
      push({ type: 'kanjiflashcard', kanji: [...N5_KANJI].sort(() => Math.random() - 0.5) });
      return;
    }
    if (mode === 'kanjiquiz') {
      push({ type: 'kanjiquiz', kanji: [...N5_KANJI].sort(() => Math.random() - 0.5) });
      return;
    }
    push({ type: mode, words: words! } as Screen);
  };

  const handleXP = async (amount: number, wordsStudied: number) => {
    await addXP(amount);
    recordWords(wordsStudied);
    if (settings.username.trim()) {
      submitScore({
        username: settings.username,
        totalXp: xp + amount,
        weeklyXp: weeklyXP + amount,
        streak,
      }).catch(() => {});
    }
  };

  const current = stack[stack.length - 1];

  switch (current.type) {
    case 'home':
      return <StudyHomeScreen onStart={startSession} />;
    case 'flashcard':
      return <FlashcardScreen words={current.words} onBack={pop} onXPEarned={handleXP} />;
    case 'wordquiz':
      return <WordQuizScreen words={current.words} onBack={pop} onXPEarned={handleXP} />;
    case 'sentencequiz':
      return <SentenceQuizScreen words={current.words} onBack={pop} settings={settings} onXPEarned={handleXP} />;
    case 'translation':
      return <TranslationScreen words={current.words} onBack={pop} onXPEarned={handleXP} />;
    case 'listening':
      return <ListeningQuizScreen words={current.words} onBack={pop} onXPEarned={handleXP} />;
    case 'kana':
      return <KanaScreen onBack={pop} onXPEarned={handleXP} />;
    case 'kanjiflashcard':
      return <KanjiFlashcardScreen kanji={current.kanji} onBack={pop} onXPEarned={handleXP} />;
    case 'kanjiquiz':
      return <KanjiQuizScreen kanji={current.kanji} onBack={pop} onXPEarned={handleXP} />;
  }
}
