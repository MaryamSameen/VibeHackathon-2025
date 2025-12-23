import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build errors when env vars are not set
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
}

// For backwards compatibility
export const supabase = {
  from: (table: string) => {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase is not configured');
    }
    return client.from(table);
  }
};

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
