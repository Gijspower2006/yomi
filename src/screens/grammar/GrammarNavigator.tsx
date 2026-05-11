import React, { useState } from 'react';
import { GrammarPattern } from '../../data/grammar';
import GrammarScreen from './GrammarScreen';
import GrammarDetailScreen from './GrammarDetailScreen';

type Screen = { type: 'list' } | { type: 'detail'; pattern: GrammarPattern };

export default function GrammarNavigator() {
  const [screen, setScreen] = useState<Screen>({ type: 'list' });

  if (screen.type === 'detail') {
    return (
      <GrammarDetailScreen
        pattern={screen.pattern}
        onBack={() => setScreen({ type: 'list' })}
      />
    );
  }

  return <GrammarScreen onSelect={p => setScreen({ type: 'detail', pattern: p })} />;
}
