import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'savedWordIds_v1';

export function useSavedWords() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      if (val) setSavedIds(new Set(JSON.parse(val)));
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return { savedIds, isSaved, toggle, loaded };
}
