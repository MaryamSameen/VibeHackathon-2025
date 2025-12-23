// Type definitions for FlashQuiz+

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Date;
  documentName: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
  createdAt: Date;
  documentName: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface UserStats {
  totalQuizzes: number;
  totalFlashcards: number;
  averageScore: number;
  quizzesThisWeek: number;
  flashcardsStudied: number;
  streakDays: number;
}

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'flashcard' | 'upload';
  title: string;
  description: string;
  timestamp: Date;
  score?: number;
}

export interface PerformanceData {
  date: string;
  score: number;
  quizzes: number;
}

export interface DocumentFile {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export interface AIGenerationResult {
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}
