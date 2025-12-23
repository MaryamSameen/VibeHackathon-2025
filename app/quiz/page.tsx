'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, ProgressBar, EmptyState, Badge, LoadingSpinner } from '@/components/ui';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn, generateId, calculatePercentage } from '@/utils/helpers';

export default function QuizPage() {
  const router = useRouter();
  const { user, isLoading, currentQuiz, quizzes, setCurrentQuiz, addQuizAttempt, addActivity } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (currentQuiz) {
      setCurrentIndex(0);
      setAnswers({});
      setIsSubmitted(false);
    }
  }, [currentQuiz]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuiz && currentIndex < currentQuiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;
    
    setIsSubmitted(true);
    
    // Calculate score
    const score = currentQuiz.questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    // Save attempt
    const attempt = {
      id: generateId(),
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      answers,
      score,
      totalQuestions: currentQuiz.questions.length,
      completedAt: new Date(),
    };
    
    addQuizAttempt(attempt);
    addActivity({
      type: 'quiz',
      title: 'Completed Quiz',
      description: currentQuiz.title,
      score: calculatePercentage(score, currentQuiz.questions.length),
    });
    
    // Navigate to results
    router.push(`/results?quizId=${currentQuiz.id}`);
  };

  const selectQuiz = (quiz: typeof quizzes[0]) => {
    setCurrentQuiz(quiz);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  // Show quiz selection if no current quiz
  if (!currentQuiz) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quizzes</h1>
          <p className="text-white/60 mb-8">Select a quiz to take</p>

          {quizzes.length > 0 ? (
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <Card 
                  key={quiz.id} 
                  hover 
                  onClick={() => selectQuiz(quiz)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{quiz.title}</h3>
                      <p className="text-sm text-white/60">
                        {quiz.questions.length} questions • From {quiz.documentName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardList className="w-8 h-8" />}
              title="No quizzes yet"
              description="Upload a document to generate your first quiz!"
              action={
                <Link href="/upload">
                  <Button leftIcon={<Upload className="w-4 h-4" />}>
                    Upload Document
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / currentQuiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === currentQuiz.questions.length;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={() => setCurrentQuiz(null)}
              className="text-white/60 hover:text-white text-sm mb-2 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to quizzes
            </button>
            <h1 className="text-2xl font-bold text-white">{currentQuiz.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={allAnswered ? 'success' : 'default'}>
              {answeredCount}/{currentQuiz.questions.length} answered
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Question {currentIndex + 1} of {currentQuiz.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Question Navigation Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {currentQuiz.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'w-10 h-10 rounded-xl text-sm font-medium transition-all',
                idx === currentIndex
                  ? 'gradient-bg text-white'
                  : answers[q.id]
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        <Card className="mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-white leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option;
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option)}
                  disabled={isSubmitted}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all',
                    isSelected
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10',
                    isSubmitted && 'cursor-not-allowed'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60'
                  )}>
                    {optionLabel}
                  </span>
                  <span className="text-white flex-1">{option}</span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentIndex === currentQuiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={!allAnswered ? 'opacity-50' : ''}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Warning if not all answered */}
        {!allAnswered && currentIndex === currentQuiz.questions.length - 1 && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-400 text-sm">
              Please answer all questions before submitting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
