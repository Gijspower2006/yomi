import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'streak_v1';

function today() {
  return new Date().toISOString().split('T')[0];
}

function yesterday() {
  return new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
}

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      if (!val) return;
      const data: { count: number; lastDate: string } = JSON.parse(val);
      const t = today();
      const y = yesterday();
      if (data.lastDate === t || data.lastDate === y) {
        setStreak(data.count);
      } else {
        // Streak broken — reset silently (don't overwrite until next session)
        setStreak(0);
      }
    });
  }, []);

  const recordStudy = useCallback(async () => {
    const t = today();
    const y = yesterday();
    const val = await AsyncStorage.getItem(KEY);
    const data: { count: number; lastDate: string } = val
      ? JSON.parse(val)
      : { count: 0, lastDate: '' };

    let newCount: number;
    if (data.lastDate === t) {
      newCount = data.count;           // already studied today
    } else if (data.lastDate === y) {
      newCount = data.count + 1;       // extend streak
    } else {
      newCount = 1;                    // start fresh
    }

    await AsyncStorage.setItem(KEY, JSON.stringify({ count: newCount, lastDate: t }));
    setStreak(newCount);
    return newCount;
  }, []);

  return { streak, recordStudy };
}
