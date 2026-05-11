import { AIProvider, Message, ProficiencyLevel } from '../types';

// Set this to your deployed backend URL.
// During local dev, use your machine's LAN IP so Expo Go on a phone can reach it.
// e.g. http://192.168.1.x:3000
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data?.error ?? `Server error ${res.status}`);
  return data as T;
}

export async function sendMessage(
  messages: Message[],
  userMessage: string,
  level: ProficiencyLevel,
  provider?: AIProvider
): Promise<string> {
  const { text } = await post<{ text: string }>('/chat', {
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    userMessage,
    level,
    provider,
  });
  return text;
}

export async function getWordExplanation(
  word: string,
  romaji: string,
  english: string,
  level: ProficiencyLevel,
  provider?: AIProvider
): Promise<string> {
  const { text } = await post<{ text: string }>('/explain', { word, romaji, english, level, provider });
  return text;
}

export async function fetchAvailableProviders(): Promise<{ providers: AIProvider[]; default: AIProvider }> {
  const res = await fetch(`${BACKEND_URL}/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json() as any;
}

// No-op — kept so App.tsx import doesn't break during transition
export function initAIService(_config: object) {}
