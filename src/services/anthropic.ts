import { Message, ProficiencyLevel } from '../types';
import { SYSTEM_PROMPTS } from '../constants/vocabulary';

const API_URL = 'https://api.anthropic.com/v1/messages';

let apiKey = '';

export function initAnthropicClient(key: string) {
  apiKey = key;
}

async function callAnthropic(body: object): Promise<string> {
  if (!apiKey) throw new Error('API key not set. Please add your Anthropic API key in Settings.');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  if (!textBlock) throw new Error('No response received.');
  return textBlock.text;
}

export async function sendMessage(
  messages: Message[],
  userMessage: string,
  level: ProficiencyLevel
): Promise<string> {
  return callAnthropic({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPTS[level],
    messages: [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
  });
}

export async function getWordExplanation(
  word: string,
  romaji: string,
  english: string,
  level: ProficiencyLevel
): Promise<string> {
  const prompt =
    level === 'beginner'
      ? `Explain the Japanese word "${word}" (${romaji}, meaning "${english}") to a beginner. Include: 1) how to remember it (mnemonic), 2) a simple example sentence with romaji and English translation, 3) one related word. Keep it brief and encouraging.`
      : `Provide a detailed explanation of "${word}" (${romaji}/${english}) including: etymology or kanji breakdown if applicable, usage nuances, 2 example sentences at ${level} level, and common mistakes to avoid.`;

  return callAnthropic({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });
}
