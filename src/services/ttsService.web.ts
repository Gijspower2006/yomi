import { BACKEND_URL } from './aiService';

const webCache = new Map<string, string>();
let currentWebAudio: HTMLAudioElement | null = null;

export async function speak(text: string): Promise<void> {
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
    const audio = new Audio(objectUrl!);
    currentWebAudio = audio;
    audio.onended = () => { currentWebAudio = null; resolve(); };
    audio.onerror = () => { currentWebAudio = null; reject(new Error('Audio playback failed')); };
    audio.play().catch(reject);
  });
}
