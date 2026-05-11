import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SRSCard, SRSRating } from '../data/srsTypes';

const KEY = 'srs_cards_v1';
const NEW_CARDS_PER_SESSION = 20;
const DEFAULT_EASE = 2.5;

// ── SM-2 algorithm ────────────────────────────────────────────────────────────

function nextInterval(card: SRSCard, rating: SRSRating): SRSCard {
  const now = Date.now();
  let { repetitions, interval, easeFactor } = card;

  // Map rating to SM-2 quality score (0–5)
  const q = rating === 'again' ? 0 : rating === 'hard' ? 2 : rating === 'good' ? 4 : 5;

  if (q < 3) {
    // Failed: restart repetitions, short interval
    repetitions = 0;
    interval = rating === 'again' ? 1 : 3;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (clamp to minimum 1.3)
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return { ...card, repetitions, interval, easeFactor, nextReview, lastReview: now };
}

function makeNewCard(wordId: string): SRSCard {
  return {
    wordId,
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE,
    nextReview: 0,
    lastReview: 0,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSRS(wordIds: string[]) {
  const [cards, setCards] = useState<Map<string, SRSCard>>(new Map());
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      const stored: SRSCard[] = val ? JSON.parse(val) : [];
      const map = new Map(stored.map(c => [c.wordId, c]));
      // Ensure every wordId has an entry
      for (const id of wordIds) {
        if (!map.has(id)) map.set(id, makeNewCard(id));
      }
      setCards(map);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((map: Map<string, SRSCard>) => {
    AsyncStorage.setItem(KEY, JSON.stringify([...map.values()]));
  }, []);

  const review = useCallback((wordId: string, rating: SRSRating) => {
    setCards(prev => {
      const card = prev.get(wordId) ?? makeNewCard(wordId);
      const updated = nextInterval(card, rating);
      const next = new Map(prev);
      next.set(wordId, updated);
      persist(next);
      return next;
    });
  }, [persist]);

  const resetAll = useCallback(() => {
    const fresh = new Map(wordIds.map(id => [id, makeNewCard(id)]));
    setCards(fresh);
    persist(fresh);
  }, [wordIds, persist]);

  // Partition into due / new / learning (for stats)
  const now = Date.now();
  const dueCards    = loaded ? wordIds.filter(id => { const c = cards.get(id); return c && c.lastReview > 0 && c.nextReview <= now; }) : [];
  const newCardIds  = loaded ? wordIds.filter(id => { const c = cards.get(id); return c && c.lastReview === 0; }) : [];
  const learnCards  = loaded ? wordIds.filter(id => { const c = cards.get(id); return c && c.lastReview > 0 && c.nextReview > now; }) : [];

  // Session queue: due first, then new (capped)
  const sessionIds  = [...dueCards, ...newCardIds.slice(0, Math.max(0, NEW_CARDS_PER_SESSION - dueCards.length))];

  const getCard = useCallback((wordId: string) => cards.get(wordId), [cards]);

  return { loaded, review, resetAll, getCard, dueCards, newCardIds, learnCards, sessionIds };
}
