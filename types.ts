export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  chinese: string;
  example: string;
  exampleChinese: string;
  imageUrl?: string; // Base64 data URI
}

export enum GamePhase {
  WELCOME = 'WELCOME',
  GENERATING = 'GENERATING',
  LEARNING = 'LEARNING',
  GAME_MENU = 'GAME_MENU',
  GAME_MATCHING = 'GAME_MATCHING',
  GAME_SPELLING = 'GAME_SPELLING',
  SUMMARY = 'SUMMARY',
}

export interface GameSession {
  theme: string;
  words: VocabularyWord[];
  currentWordIndex: number;
  score: number;
}