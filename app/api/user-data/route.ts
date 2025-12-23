import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (action === 'save_quiz') {
      const { error } = await supabase
        .from('quizzes')
        .upsert({
          id: data.id,
          user_id: userId,
          title: data.title,
          questions: data.questions,
          document_name: data.documentName,
          created_at: data.createdAt || new Date().toISOString(),
        });

      if (error) {
        console.error('Save quiz error:', error);
        return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'save_flashcard_set') {
      const { error } = await supabase
        .from('flashcard_sets')
        .upsert({
          id: data.id,
          user_id: userId,
          title: data.title,
          flashcards: data.flashcards,
          document_name: data.documentName,
          created_at: data.createdAt || new Date().toISOString(),
        });

      if (error) {
        console.error('Save flashcard set error:', error);
        return NextResponse.json({ error: 'Failed to save flashcard set' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'save_quiz_attempt') {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          id: data.id || generateId(),
          user_id: userId,
          quiz_id: data.quizId,
          quiz_title: data.quizTitle,
          answers: data.answers,
          score: data.score,
          total_questions: data.totalQuestions,
          completed_at: data.completedAt || new Date().toISOString(),
        });

      if (error) {
        console.error('Save attempt error:', error);
        return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'save_activity') {
      const { error } = await supabase
        .from('activities')
        .insert({
          id: data.id || generateId(),
          user_id: userId,
          type: data.type,
          title: data.title,
          description: data.description,
          score: data.score,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Save activity error:', error);
        return NextResponse.json({ error: 'Failed to save activity' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'load_user_data') {
      const [quizzes, flashcardSets, attempts, activities] = await Promise.all([
        supabase.from('quizzes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('flashcard_sets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
        supabase.from('activities').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50),
      ]);

      return NextResponse.json({
        quizzes: (quizzes.data || []).map(q => ({
          id: q.id,
          title: q.title,
          questions: q.questions,
          documentName: q.document_name,
          createdAt: q.created_at,
        })),
        flashcardSets: (flashcardSets.data || []).map(f => ({
          id: f.id,
          title: f.title,
          flashcards: f.flashcards,
          documentName: f.document_name,
          createdAt: f.created_at,
        })),
        quizAttempts: (attempts.data || []).map(a => ({
          id: a.id,
          quizId: a.quiz_id,
          quizTitle: a.quiz_title,
          answers: a.answers,
          score: a.score,
          totalQuestions: a.total_questions,
          completedAt: a.completed_at,
        })),
        activities: (activities.data || []).map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          score: a.score,
          timestamp: a.timestamp,
        })),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('User data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
