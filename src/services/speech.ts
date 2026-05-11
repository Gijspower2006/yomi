import { Platform } from 'react-native';
import { speak as aiSpeak } from './ttsService';

const JAPANESE_RE = /[぀-ゟ゠-ヿ一-龯ｦ-ﾟ]/;

type Lang = 'ja' | 'en';

interface Segment {
  text: string;
  lang: Lang;
}

function splitByLanguage(text: string): Segment[] {
  const segments: Segment[] = [];
  let current = '';
  let currentLang: Lang | null = null;

  for (const char of text) {
    const lang: Lang = JAPANESE_RE.test(char) ? 'ja' : 'en';
    if (currentLang === null) {
      currentLang = lang;
      current = char;
    } else if (lang === currentLang) {
      current += char;
    } else {
      const trimmed = current.trim();
      if (trimmed) segments.push({ text: trimmed, lang: currentLang });
      current = char;
      currentLang = lang;
    }
  }

  const trimmed = current.trim();
  if (trimmed && currentLang) segments.push({ text: trimmed, lang: currentLang });
  return segments;
}

// ── Web: Web Speech API ───────────────────────────────────────────────────────

function speakWebSegment(segment: Segment): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    const utt = new SpeechSynthesisUtterance(segment.text);
    utt.lang  = segment.lang === 'ja' ? 'ja-JP' : 'en-US';
    utt.rate  = segment.lang === 'ja' ? 0.85 : 0.9;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}

// ── Native: expo-speech ───────────────────────────────────────────────────────

function speakNativeSegment(segment: Segment): Promise<void> {
  const Speech = require('expo-speech');
  return new Promise((resolve) => {
    Speech.speak(segment.text, {
      language: segment.lang === 'ja' ? 'ja-JP' : 'en-US',
      pitch: 1.0,
      rate: segment.lang === 'ja' ? 0.85 : 0.9,
      onDone: resolve,
      onError: () => resolve(),
      onStopped: () => resolve(),
    });
  });
}

function speakSegment(segment: Segment): Promise<void> {
  return Platform.OS === 'web'
    ? speakWebSegment(segment)
    : speakNativeSegment(segment);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function speakMixed(text: string): Promise<void> {
  const segments = splitByLanguage(text);
  for (const segment of segments) {
    await speakSegment(segment);
  }
}

export async function speakJapanese(text: string): Promise<void> {
  try {
    await aiSpeak(text.trim());
  } catch {
    await speakSegment({ text: text.trim(), lang: 'ja' });
  }
}

export function stopSpeaking(): void {
  if (Platform.OS === 'web') {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } else {
    const Speech = require('expo-speech');
    Speech.stop();
  }
}

export function isSpeaking(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve('speechSynthesis' in window && window.speechSynthesis.speaking);
  }
  const Speech = require('expo-speech');
  return Speech.isSpeakingAsync();
}
