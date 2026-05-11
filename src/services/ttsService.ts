import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { BACKEND_URL } from './aiService';

const CACHE_DIR = `${FileSystem.cacheDirectory}tts/`;

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
}

function cacheKey(text: string): string {
  const hash = text.split('').reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 0);
  return `${hash}.mp3`;
}

let currentSound: Audio.Sound | null = null;

export async function speak(text: string): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {});
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }

  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  await ensureCacheDir();

  const filePath = CACHE_DIR + cacheKey(text);
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

  const { sound } = await Audio.Sound.createAsync({ uri: filePath });
  currentSound = sound;
  await sound.playAsync();
  sound.setOnPlaybackStatusUpdate(status => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
      if (currentSound === sound) currentSound = null;
    }
  });
}
