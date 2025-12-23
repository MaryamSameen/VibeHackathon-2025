'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { 
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  ArrowRight,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn, calculatePercentage } from '@/utils/helpers';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, quizzes, quizAttempts, setCurrentQuiz } = useApp();
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const quizId = searchParams.get('quizId');
  const quiz = quizzes.find(q => q.id === quizId);
  const attempt = quizAttempts.find(a => a.quizId === quizId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Results not found</h1>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage(attempt.score, attempt.totalQuestions);
  const correctCount = attempt.score;
  const incorrectCount = attempt.totalQuestions - attempt.score;

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: 'A', color: 'text-green-400', message: 'Excellent!' };
    if (percent >= 80) return { grade: 'B', color: 'text-blue-400', message: 'Great job!' };
    if (percent >= 70) return { grade: 'C', color: 'text-yellow-400', message: 'Good effort!' };
    if (percent >= 60) return { grade: 'D', color: 'text-orange-400', message: 'Keep practicing!' };
    return { grade: 'F', color: 'text-red-400', message: 'Try again!' };
  };

  const gradeInfo = getGrade(percentage);

  const handleRetake = () => {
    setCurrentQuiz(quiz);
    router.push('/quiz');
  };

  const toggleExplanation = (questionId: string) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <Card className="mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          <div className="relative py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-white/60 mb-6">{quiz.title}</p>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className={`text-6xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
                <p className="text-sm text-white/60 mt-1">{gradeInfo.message}</p>
              </div>
              <div className="h-20 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-5xl font-bold text-white">{percentage}%</p>
                <p className="text-sm text-white/60 mt-1">Score</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 mx-auto flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{attempt.totalQuestions}</p>
            <p className="text-sm text-white/60">Total Questions</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 mx-auto flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{correctCount}</p>
            <p className="text-sm text-white/60">Correct</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 mx-auto flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{incorrectCount}</p>
            <p className="text-sm text-white/60">Incorrect</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={handleRetake} className="flex-1" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Retake Quiz
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="secondary" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Detailed Review */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Question Review</h2>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, idx) => {
            const userAnswer = attempt.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <Card key={question.id} className="overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  )}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-white/60">Question {idx + 1}</span>
                      <Badge variant={isCorrect ? 'success' : 'danger'}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="text-white font-medium mb-4">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => {
                        const optionLabel = String.fromCharCode(65 + optIdx);
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correctAnswer === option;
                        
                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg',
                              isCorrectAnswer
                                ? 'bg-green-500/20 border border-green-500/30'
                                : isUserAnswer && !isCorrectAnswer
                                ? 'bg-red-500/20 border border-red-500/30'
                                : 'bg-white/5'
                            )}
                          >
                            <span className={cn(
                              'w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium',
                              isCorrectAnswer
                                ? 'bg-green-500 text-white'
                                : isUserAnswer && !isCorrectAnswer
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-white/60'
                            )}>
                              {optionLabel}
                            </span>
                            <span className={cn(
                              'flex-1',
                              isCorrectAnswer ? 'text-green-400' : isUserAnswer ? 'text-red-400' : 'text-white/80'
                            )}>
                              {option}
                            </span>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleExplanation(question.id)}
                          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                        >
                          <Lightbulb className="w-4 h-4" />
                          {showExplanations[question.id] ? 'Hide' : 'Show'} Explanation
                        </button>
                        {showExplanations[question.id] && (
                          <div className="mt-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-sm text-white/80">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
