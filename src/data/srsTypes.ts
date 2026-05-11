export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface SRSCard {
  wordId: string;
  repetitions: number;    // number of successful reviews in a row
  interval: number;       // days until next review
  easeFactor: number;     // multiplier (default 2.5)
  nextReview: number;     // Unix timestamp (ms) when card is next due
  lastReview: number;     // Unix timestamp of last review (0 = never)
}

export interface SRSSession {
  due: SRSCard[];
  newCards: SRSCard[];
}
