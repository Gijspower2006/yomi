import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'daily_goal_v1';
const DEFAULT_GOAL = 20;

interface DailyData {
  date: string;       // YYYY-MM-DD
  wordsStudied: number;
  goal: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT: DailyData = { date: today(), wordsStudied: 0, goal: DEFAULT_GOAL };

export function useDailyGoal() {
  const [data, setData] = useState<DailyData>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      const stored: DailyData = JSON.parse(raw);
      if (stored.date !== today()) {
        // New day — reset count, keep goal setting
        const reset: DailyData = { date: today(), wordsStudied: 0, goal: stored.goal };
        setData(reset);
        AsyncStorage.setItem(KEY, JSON.stringify(reset));
      } else {
        setData(stored);
      }
    });
  }, []);

  const recordWords = useCallback((count: number) => {
    setData(prev => {
      const next: DailyData = {
        ...prev,
        date: today(),
        wordsStudied: prev.date === today() ? prev.wordsStudied + count : count,
      };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setGoal = useCallback((goal: number) => {
    setData(prev => {
      const next = { ...prev, goal };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const progress = Math.min(data.wordsStudied / data.goal, 1);
  const completed = data.wordsStudied >= data.goal;

  return { wordsStudied: data.wordsStudied, goal: data.goal, progress, completed, recordWords, setGoal };
}
