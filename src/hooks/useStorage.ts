import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@nihongo_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  level: 'beginner',
  scriptPreference: 'mixed',
  provider: 'anthropic',
  showRomaji: true,
  username: '',
  onboarded: false,
  theme: 'dark',
  fontSize: 'medium',
  autoPlayAudio: false,
  newCardsPerSession: 20,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }

  async function saveSettings(next: Partial<AppSettings>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  }

  return { settings, saveSettings, loaded };
}
