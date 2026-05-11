import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'xp_v2';

interface XPData {
  total: number;
  weekly: number;
  weekStart: string; // ISO date of Monday (YYYY-MM-DD)
}

const THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000];

export const LEVEL_NAMES = [
  '初心者', // Beginner
  '入門者', // Entry
  '学習者', // Learner
  '中級者', // Intermediate
  '上級者', // Advanced
  '熟練者', // Skilled
  '達人',   // Expert
  '師匠',   // Master
  '侍',     // Samurai
  '武士',   // Warrior
];

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function computeLevel(xp: number) {
  let level = 1;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (xp >= THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const idx = level - 1;
  const current = THRESHOLDS[idx] ?? 0;
  const next = THRESHOLDS[idx + 1] ?? null;
  return {
    level,
    name: LEVEL_NAMES[idx],
    xpInLevel: xp - current,
    xpForNext: next !== null ? next - current : null,
    progress: next !== null ? (xp - current) / (next - current) : 1,
  };
}

const DEFAULT: XPData = { total: 0, weekly: 0, weekStart: getWeekStart() };

export function useXP() {
  const [data, setData] = useState<XPData>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) {
        // Migrate from old xp_v1 (stored as plain number)
        AsyncStorage.getItem('xp_v1').then(old => {
          if (old) {
            const total = JSON.parse(old);
            const migrated: XPData = { total, weekly: 0, weekStart: getWeekStart() };
            setData(migrated);
            AsyncStorage.setItem(KEY, JSON.stringify(migrated));
          }
        });
        return;
      }
      const stored: XPData = JSON.parse(raw);
      const currentWeek = getWeekStart();
      if (stored.weekStart !== currentWeek) {
        const reset = { ...stored, weekly: 0, weekStart: currentWeek };
        setData(reset);
        AsyncStorage.setItem(KEY, JSON.stringify(reset));
      } else {
        setData(stored);
      }
    });
  }, []);

  const addXP = useCallback(async (amount: number) => {
    const currentWeek = getWeekStart();
    setData(prev => {
      const weekly = prev.weekStart === currentWeek ? prev.weekly + amount : amount;
      const next: XPData = { total: prev.total + amount, weekly, weekStart: currentWeek };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { xp: data.total, weeklyXP: data.weekly, addXP, ...computeLevel(data.total) };
}
