import { speak as aiSpeak } from './ttsService';

const JAPANESE_RE = /[぀-ゟ゠-ヿ一-龯ｦ-ﾟ]/;

type Lang = 'ja' | 'en';
interface Segment { text: string; lang: Lang; }

function splitByLanguage(text: string): Segment[] {
  const segments: Segment[] = [];
  let current = '';
  let currentLang: Lang | null = null;
  for (const char of text) {
    const lang: Lang = JAPANESE_RE.test(char) ? 'ja' : 'en';
    if (currentLang === null) { currentLang = lang; current = char; }
    else if (lang === currentLang) { current += char; }
    else {
      const trimmed = current.trim();
      if (trimmed) segments.push({ text: trimmed, lang: currentLang });
      current = char; currentLang = lang;
    }
  }
  const trimmed = current.trim();
  if (trimmed && currentLang) segments.push({ text: trimmed, lang: currentLang });
  return segments;
}

function speakSegment(segment: Segment): Promise<void> {
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

export async function speakMixed(text: string): Promise<void> {
  for (const segment of splitByLanguage(text)) {
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
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isSpeaking(): Promise<boolean> {
  return Promise.resolve('speechSynthesis' in window && window.speechSynthesis.speaking);
}
