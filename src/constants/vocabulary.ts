import { VocabWord } from '../types';

export const VOCABULARY: VocabWord[] = [
  // Greetings
  { id: 'g1', english: 'Hello', japanese: 'こんにちは', romaji: 'Konnichiwa', hiragana: 'こんにちは', category: 'greetings', exampleEn: 'Hello, how are you?', exampleJa: 'こんにちは、お元気ですか？' },
  { id: 'g2', english: 'Good morning', japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', hiragana: 'おはようございます', category: 'greetings', exampleEn: 'Good morning!', exampleJa: 'おはようございます！' },
  { id: 'g3', english: 'Good evening', japanese: 'こんばんは', romaji: 'Konbanwa', hiragana: 'こんばんは', category: 'greetings', exampleEn: 'Good evening, everyone.', exampleJa: 'こんばんは、みなさん。' },
  { id: 'g4', english: 'Goodbye', japanese: 'さようなら', romaji: 'Sayounara', hiragana: 'さようなら', category: 'greetings' },
  { id: 'g5', english: 'See you later', japanese: 'またね', romaji: 'Mata ne', hiragana: 'またね', category: 'greetings' },
  { id: 'g6', english: 'Thank you', japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', hiragana: 'ありがとうございます', category: 'greetings', exampleEn: 'Thank you very much!', exampleJa: 'どうもありがとうございます！' },
  { id: 'g7', english: 'Please', japanese: 'おねがいします', romaji: 'Onegaishimasu', hiragana: 'おねがいします', category: 'greetings' },
  { id: 'g8', english: 'Excuse me / Sorry', japanese: 'すみません', romaji: 'Sumimasen', hiragana: 'すみません', category: 'greetings', exampleEn: 'Excuse me, where is the station?', exampleJa: 'すみません、駅はどこですか？' },
  { id: 'g9', english: 'Yes', japanese: 'はい', romaji: 'Hai', hiragana: 'はい', category: 'greetings' },
  { id: 'g10', english: 'No', japanese: 'いいえ', romaji: 'Iie', hiragana: 'いいえ', category: 'greetings' },

  // Numbers
  { id: 'n1', english: 'One', japanese: '一 (いち)', romaji: 'Ichi', hiragana: 'いち', category: 'numbers' },
  { id: 'n2', english: 'Two', japanese: '二 (に)', romaji: 'Ni', hiragana: 'に', category: 'numbers' },
  { id: 'n3', english: 'Three', japanese: '三 (さん)', romaji: 'San', hiragana: 'さん', category: 'numbers' },
  { id: 'n4', english: 'Four', japanese: '四 (よん)', romaji: 'Yon / Shi', hiragana: 'よん', category: 'numbers' },
  { id: 'n5', english: 'Five', japanese: '五 (ご)', romaji: 'Go', hiragana: 'ご', category: 'numbers' },
  { id: 'n6', english: 'Six', japanese: '六 (ろく)', romaji: 'Roku', hiragana: 'ろく', category: 'numbers' },
  { id: 'n7', english: 'Seven', japanese: '七 (なな)', romaji: 'Nana / Shichi', hiragana: 'なな', category: 'numbers' },
  { id: 'n8', english: 'Eight', japanese: '八 (はち)', romaji: 'Hachi', hiragana: 'はち', category: 'numbers' },
  { id: 'n9', english: 'Nine', japanese: '九 (きゅう)', romaji: 'Kyuu', hiragana: 'きゅう', category: 'numbers' },
  { id: 'n10', english: 'Ten', japanese: '十 (じゅう)', romaji: 'Juu', hiragana: 'じゅう', category: 'numbers' },

  // Food
  { id: 'f1', english: 'Rice / Meal', japanese: 'ごはん', romaji: 'Gohan', hiragana: 'ごはん', category: 'food', exampleEn: 'I eat rice every day.', exampleJa: 'まいにちごはんをたべます。' },
  { id: 'f2', english: 'Water', japanese: 'みず', romaji: 'Mizu', hiragana: 'みず', category: 'food' },
  { id: 'f3', english: 'Sushi', japanese: 'すし', romaji: 'Sushi', hiragana: 'すし', category: 'food', exampleEn: 'I love sushi!', exampleJa: 'すしがだいすきです！' },
  { id: 'f4', english: 'Ramen', japanese: 'ラーメン', romaji: 'Raamen', hiragana: 'らーめん', category: 'food' },
  { id: 'f5', english: 'Tea', japanese: 'おちゃ', romaji: 'Ocha', hiragana: 'おちゃ', category: 'food', exampleEn: 'Would you like some tea?', exampleJa: 'おちゃはいかがですか？' },
  { id: 'f6', english: 'Delicious', japanese: 'おいしい', romaji: 'Oishii', hiragana: 'おいしい', category: 'food', exampleEn: 'This is delicious!', exampleJa: 'これはおいしいです！' },
  { id: 'f7', english: 'Bread', japanese: 'パン', romaji: 'Pan', hiragana: 'ぱん', category: 'food' },
  { id: 'f8', english: 'Meat', japanese: 'にく', romaji: 'Niku', hiragana: 'にく', category: 'food' },

  // Travel
  { id: 't1', english: 'Station', japanese: 'えき', romaji: 'Eki', hiragana: 'えき', category: 'travel', exampleEn: 'Where is the station?', exampleJa: 'えきはどこですか？' },
  { id: 't2', english: 'Hotel', japanese: 'ホテル', romaji: 'Hoteru', hiragana: 'ほてる', category: 'travel' },
  { id: 't3', english: 'Airport', japanese: 'くうこう', romaji: 'Kuukou', hiragana: 'くうこう', category: 'travel' },
  { id: 't4', english: 'Ticket', japanese: 'きっぷ', romaji: 'Kippu', hiragana: 'きっぷ', category: 'travel' },
  { id: 't5', english: 'Right', japanese: 'みぎ', romaji: 'Migi', hiragana: 'みぎ', category: 'travel' },
  { id: 't6', english: 'Left', japanese: 'ひだり', romaji: 'Hidari', hiragana: 'ひだり', category: 'travel' },
  { id: 't7', english: 'Straight ahead', japanese: 'まっすぐ', romaji: 'Massugu', hiragana: 'まっすぐ', category: 'travel' },
  { id: 't8', english: 'Toilet / Restroom', japanese: 'トイレ', romaji: 'Toire', hiragana: 'といれ', category: 'travel' },

  // Family
  { id: 'fam1', english: 'Mother', japanese: 'おかあさん', romaji: 'Okaasan', hiragana: 'おかあさん', category: 'family' },
  { id: 'fam2', english: 'Father', japanese: 'おとうさん', romaji: 'Otousan', hiragana: 'おとうさん', category: 'family' },
  { id: 'fam3', english: 'Older sister', japanese: 'おねえさん', romaji: 'Oneesan', hiragana: 'おねえさん', category: 'family' },
  { id: 'fam4', english: 'Older brother', japanese: 'おにいさん', romaji: 'Oniisan', hiragana: 'おにいさん', category: 'family' },
  { id: 'fam5', english: 'Friend', japanese: 'ともだち', romaji: 'Tomodachi', hiragana: 'ともだち', category: 'family' },

  // Time
  { id: 'tm1', english: 'Today', japanese: 'きょう', romaji: 'Kyou', hiragana: 'きょう', category: 'time', exampleEn: 'What are you doing today?', exampleJa: 'きょうはなにをしますか？' },
  { id: 'tm2', english: 'Tomorrow', japanese: 'あした', romaji: 'Ashita', hiragana: 'あした', category: 'time' },
  { id: 'tm3', english: 'Yesterday', japanese: 'きのう', romaji: 'Kinou', hiragana: 'きのう', category: 'time' },
  { id: 'tm4', english: 'Now', japanese: 'いま', romaji: 'Ima', hiragana: 'いま', category: 'time' },
  { id: 'tm5', english: 'Morning', japanese: 'あさ', romaji: 'Asa', hiragana: 'あさ', category: 'time' },
  { id: 'tm6', english: 'Evening', japanese: 'よる', romaji: 'Yoru', hiragana: 'よる', category: 'time' },

  // Colors
  { id: 'c1', english: 'Red', japanese: 'あか', romaji: 'Aka', hiragana: 'あか', category: 'colors' },
  { id: 'c2', english: 'Blue', japanese: 'あお', romaji: 'Ao', hiragana: 'あお', category: 'colors' },
  { id: 'c3', english: 'White', japanese: 'しろ', romaji: 'Shiro', hiragana: 'しろ', category: 'colors' },
  { id: 'c4', english: 'Black', japanese: 'くろ', romaji: 'Kuro', hiragana: 'くろ', category: 'colors' },
  { id: 'c5', english: 'Yellow', japanese: 'きいろ', romaji: 'Kiiro', hiragana: 'きいろ', category: 'colors' },
  { id: 'c6', english: 'Green', japanese: 'みどり', romaji: 'Midori', hiragana: 'みどり', category: 'colors' },

  // Verbs
  { id: 'v1', english: 'To eat', japanese: 'たべる', romaji: 'Taberu', hiragana: 'たべる', category: 'verbs', exampleEn: 'I eat sushi.', exampleJa: 'すしをたべます。' },
  { id: 'v2', english: 'To drink', japanese: 'のむ', romaji: 'Nomu', hiragana: 'のむ', category: 'verbs', exampleEn: 'I drink tea.', exampleJa: 'おちゃをのみます。' },
  { id: 'v3', english: 'To go', japanese: 'いく', romaji: 'Iku', hiragana: 'いく', category: 'verbs', exampleEn: 'I go to school.', exampleJa: 'がっこうにいきます。' },
  { id: 'v4', english: 'To come', japanese: 'くる', romaji: 'Kuru', hiragana: 'くる', category: 'verbs' },
  { id: 'v5', english: 'To see / watch', japanese: 'みる', romaji: 'Miru', hiragana: 'みる', category: 'verbs' },
  { id: 'v6', english: 'To listen / hear', japanese: 'きく', romaji: 'Kiku', hiragana: 'きく', category: 'verbs' },
  { id: 'v7', english: 'To speak', japanese: 'はなす', romaji: 'Hanasu', hiragana: 'はなす', category: 'verbs' },
  { id: 'v8', english: 'To understand', japanese: 'わかる', romaji: 'Wakaru', hiragana: 'わかる', category: 'verbs', exampleEn: 'I understand.', exampleJa: 'わかります。' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  greetings: 'Greetings 挨拶',
  numbers: 'Numbers 数字',
  food: 'Food 食べ物',
  travel: 'Travel 旅行',
  family: 'Family 家族',
  time: 'Time 時間',
  colors: 'Colors 色',
  verbs: 'Verbs 動詞',
};

export const SYSTEM_PROMPTS: Record<string, string> = {
  beginner: `You are Yuki (ゆき), a friendly and encouraging Japanese language tutor. The student is a complete beginner.

Guidelines:
- Keep responses SHORT and focused (2-4 sentences max per turn)
- Always include Japanese text with romaji and English translation in parentheses
- Format: Japanese (romaji) = English meaning
- Gently correct mistakes, then show the correct form
- Use simple vocabulary and short sentences
- Celebrate small wins enthusiastically
- Suggest short practice phrases the student can try
- Focus on practical, everyday Japanese
- Use hiragana primarily, introduce kanji slowly with furigana`,

  intermediate: `You are Yuki (ゆき), a knowledgeable Japanese tutor for intermediate learners.

Guidelines:
- Responses can be moderate length but stay focused
- Mix Japanese and English naturally; include kanji with furigana when introducing new words
- Correct grammar mistakes with explanations of the rule
- Introduce grammar patterns (e.g., て-form, potential form, conditionals)
- Encourage natural conversation flow
- Point out nuances between similar words/expressions
- Include cultural context when relevant`,

  advanced: `You are Yuki (ゆき), a sophisticated Japanese language coach for advanced learners.

Guidelines:
- Primarily respond in Japanese with English only when needed for clarity
- Discuss complex grammar patterns, keigo (polite language), and nuances
- Correct subtle mistakes in natural speech patterns
- Introduce idioms, proverbs (ことわざ), and cultural expressions
- Encourage use of advanced structures and varied sentence patterns
- Discuss cultural context and regional dialects when relevant`,
};
