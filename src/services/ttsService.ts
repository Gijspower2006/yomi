import { Platform } from 'react-native';
import { BACKEND_URL } from './aiService';

// ── Web: in-memory blob URL cache + HTML5 Audio ──────────────────────────────

const webCache = new Map<string, string>(); // text → object URL
let currentWebAudio: HTMLAudioElement | null = null;

async function speakWeb(text: string): Promise<void> {
  if (currentWebAudio) {
    currentWebAudio.pause();
    currentWebAudio = null;
  }

  let objectUrl = webCache.get(text);

  if (!objectUrl) {
    const res = await fetch(`${BACKEND_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const blob = await res.blob();
    objectUrl = URL.createObjectURL(blob);
    webCache.set(text, objectUrl);
  }

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(objectUrl);
    currentWebAudio = audio;
    audio.onended = () => { currentWebAudio = null; resolve(); };
    audio.onerror = () => { currentWebAudio = null; reject(new Error('Audio playback failed')); };
    audio.play().catch(reject);
  });
}

// ── Native: file-system cache + expo-av ──────────────────────────────────────

async function speakNative(text: string): Promise<void> {
  const FileSystem = require('expo-file-system/legacy');
  const { Audio } = require('expo-av');

  const CACHE_DIR = `${FileSystem.cacheDirectory}tts/`;

  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

  const hash = text.split('').reduce((a: number, c: string) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 0);
  const filePath = `${CACHE_DIR}${hash}.mp3`;
  const cached = await FileSystem.getInfoAsync(filePath);

  if (!cached.exists) {
    const res = await fetch(`${BACKEND_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    await FileSystem.writeAsStringAsync(filePath, btoa(binary), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const { sound } = await Audio.Sound.createAsync({ uri: filePath });
  await sound.playAsync();
  sound.setOnPlaybackStatusUpdate((status: any) => {
    if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function speak(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    return speakWeb(text);
  }
  return speakNative(text);
}
