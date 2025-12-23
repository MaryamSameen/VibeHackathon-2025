import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar?: string;
  created_at: string;
}

export interface DbQuiz {
  id: string;
  user_id: string;
  title: string;
  questions: any; // JSON
  document_name: string;
  created_at: string;
}

export interface DbFlashcardSet {
  id: string;
  user_id: string;
  title: string;
  flashcards: any; // JSON
  document_name: string;
  created_at: string;
}

export interface DbQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_title: string;
  answers: any; // JSON
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface DbActivity {
  id: string;
  user_id: string;
  type: 'quiz' | 'flashcard' | 'upload';
  title: string;
  description: string;
  score?: number;
  timestamp: string;
}
