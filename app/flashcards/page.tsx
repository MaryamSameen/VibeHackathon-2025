'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, ProgressBar, EmptyState, LoadingSpinner } from '@/components/ui';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Upload,
  BookOpen,
  Shuffle,
  Check
} from 'lucide-react';
import { shuffleArray } from '@/utils/helpers';

export default function FlashcardsPage() {
  const router = useRouter();
  const { user, isLoading, currentFlashcards, flashcardSets, setCurrentFlashcards, addActivity } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(currentFlashcards?.flashcards || []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (currentFlashcards) {
      setShuffledCards(currentFlashcards.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudiedCards(new Set());
    }
  }, [currentFlashcards]);

  const handleNext = () => {
    if (currentFlashcards && currentIndex < shuffledCards.length - 1) {
      setStudiedCards(prev => new Set([...prev, shuffledCards[currentIndex].id]));
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    if (currentFlashcards) {
      setShuffledCards(shuffleArray(currentFlashcards.flashcards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffled(true);
    }
  };

  const handleReset = () => {
    if (currentFlashcards) {
      setShuffledCards(currentFlashcards.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudiedCards(new Set());
      setIsShuffled(false);
    }
  };

  const handleComplete = () => {
    if (currentFlashcards) {
      addActivity({
        type: 'flashcard',
        title: 'Studied Flashcards',
        description: `Completed ${studiedCards.size + 1} of ${shuffledCards.length} cards`,
      });
    }
    router.push('/dashboard');
  };

  const selectFlashcardSet = (set: typeof flashcardSets[0]) => {
    setCurrentFlashcards(set);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  // Show flashcard set selection if no current set
  if (!currentFlashcards) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flashcards</h1>
          <p className="text-white/60 mb-8">Select a flashcard set to study</p>

          {flashcardSets.length > 0 ? (
            <div className="grid gap-4">
              {flashcardSets.map((set) => (
                <Card 
                  key={set.id} 
                  hover 
                  onClick={() => selectFlashcardSet(set)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{set.title}</h3>
                      <p className="text-sm text-white/60">
                        {set.flashcards.length} cards • From {set.documentName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="No flashcard sets yet"
              description="Upload a document to generate your first flashcard set!"
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

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={() => setCurrentFlashcards(null)}
              className="text-white/60 hover:text-white text-sm mb-2 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to sets
            </button>
            <h1 className="text-2xl font-bold text-white">{currentFlashcards.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              leftIcon={<Shuffle className="w-4 h-4" />}
            >
              Shuffle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Card {currentIndex + 1} of {shuffledCards.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Flashcard */}
        <div 
          className={`flip-card w-full h-80 md:h-96 mb-8 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          <div className="flip-card-inner">
            {/* Front */}
            <div className="flip-card-front glass-card flex flex-col items-center justify-center p-8">
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-4">
                Question
              </span>
              <p className="text-xl md:text-2xl font-medium text-white text-center leading-relaxed">
                {currentCard.question}
              </p>
              <span className="absolute bottom-4 text-sm text-white/40">
                Click to reveal answer
              </span>
            </div>
            
            {/* Back */}
            <div className="flip-card-back glass-card bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex flex-col items-center justify-center p-8">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wide mb-4">
                Answer
              </span>
              <p className="text-xl md:text-2xl font-medium text-white text-center leading-relaxed">
                {currentCard.answer}
              </p>
              <span className="absolute bottom-4 text-sm text-white/40">
                Click to see question
              </span>
            </div>
          </div>
        </div>

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

          {currentIndex === shuffledCards.length - 1 ? (
            <Button
              onClick={handleComplete}
              leftIcon={<Check className="w-5 h-5" />}
            >
              Complete
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

        {/* Keyboard shortcuts hint */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Tip: Click the card to flip it
          </p>
        </div>
      </div>
    </div>
  );
}
