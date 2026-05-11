import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { POSFilter } from '../../data/n5words';
import { N5Kanji } from '../../data/n5kanji';
import LevelScreen from './LevelScreen';
import CategoryScreen from './CategoryScreen';
import WordListScreen from './WordListScreen';
import KanjiScreen from './KanjiScreen';
import KanjiDetailScreen from './KanjiDetailScreen';

type Screen =
  | { type: 'levels' }
  | { type: 'categories'; level: string }
  | { type: 'wordlist'; level: string; posFilter: POSFilter; title: string }
  | { type: 'kanji' }
  | { type: 'kanji-detail'; kanji: N5Kanji };

interface Props { settings: AppSettings }

export default function VocabNavigator({ settings }: Props) {
  const [stack, setStack] = useState<Screen[]>([{ type: 'levels' }]);

  const push = (s: Screen) => setStack(prev => [...prev, s]);
  const pop  = () => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  const current = stack[stack.length - 1];

  switch (current.type) {
    case 'levels':
      return (
        <LevelScreen
          onSelectLevel={(level) => push({ type: 'categories', level })}
          onOpenKanji={() => push({ type: 'kanji' })}
        />
      );

    case 'categories':
      return (
        <CategoryScreen
          level={current.level}
          onBack={pop}
          onSelectCategory={(posFilter, title) =>
            push({ type: 'wordlist', level: current.level, posFilter, title })
          }
        />
      );

    case 'wordlist':
      return (
        <WordListScreen
          level={current.level}
          posFilter={current.posFilter}
          title={current.title}
          onBack={pop}
          settings={settings}
        />
      );

    case 'kanji':
      return (
        <KanjiScreen
          onBack={pop}
          onSelectKanji={(kanji) => push({ type: 'kanji-detail', kanji })}
        />
      );

    case 'kanji-detail':
      return <KanjiDetailScreen kanji={current.kanji} onBack={pop} />;
  }
}
