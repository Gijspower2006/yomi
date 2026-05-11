export interface AuthUser {
  id: number;
  identifier: string; // email or phone
  displayName: string;
  token: string;
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ScriptPreference = 'romaji' | 'hiragana' | 'mixed' | 'kanji';

export type AIProvider = 'anthropic' | 'openai' | 'gemini';

export type AppTheme = 'dark' | 'light' | 'oled';
export type FontSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  level: ProficiencyLevel;
  scriptPreference: ScriptPreference;
  provider: AIProvider;
  showRomaji: boolean;
  username: string;
  onboarded: boolean;
  theme: AppTheme;
  fontSize: FontSize;
  autoPlayAudio: boolean;
  newCardsPerSession: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioAvailable?: boolean;
}

export interface VocabWord {
  id: string;
  english: string;
  japanese: string;
  romaji: string;
  hiragana: string;
  category: VocabCategory;
  exampleEn?: string;
  exampleJa?: string;
}

export type VocabCategory =
  | 'greetings'
  | 'numbers'
  | 'food'
  | 'travel'
  | 'family'
  | 'time'
  | 'colors'
  | 'body'
  | 'nature'
  | 'verbs';
