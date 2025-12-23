'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserStats, QuizAttempt, FlashcardSet, Quiz, ActivityItem } from '@/types';
import { generateId } from '@/utils/helpers';

interface AppContextType {
  // Auth
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Data
  quizzes: Quiz[];
  flashcardSets: FlashcardSet[];
  quizAttempts: QuizAttempt[];
  activities: ActivityItem[];
  stats: UserStats;
  
  // Actions
  addQuiz: (quiz: Quiz) => void;
  addFlashcardSet: (set: FlashcardSet) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  
  // Current session
  currentQuiz: Quiz | null;
  currentFlashcards: FlashcardSet | null;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCurrentFlashcards: (set: FlashcardSet | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock user database
const mockUsers: { email: string; password: string; name: string }[] = [
  { email: 'demo@flashquiz.com', password: 'demo123', name: 'Demo User' }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentFlashcards, setCurrentFlashcards] = useState<FlashcardSet | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('flashquiz_user');
    const storedQuizzes = localStorage.getItem('flashquiz_quizzes');
    const storedFlashcards = localStorage.getItem('flashquiz_flashcards');
    const storedAttempts = localStorage.getItem('flashquiz_attempts');
    const storedActivities = localStorage.getItem('flashquiz_activities');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    }
    if (storedFlashcards) {
      setFlashcardSets(JSON.parse(storedFlashcards));
    }
    if (storedAttempts) {
      setQuizAttempts(JSON.parse(storedAttempts));
    }
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }
    
    setIsLoading(false);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('flashquiz_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flashquiz_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('flashquiz_flashcards', JSON.stringify(flashcardSets));
  }, [flashcardSets]);

  useEffect(() => {
    localStorage.setItem('flashquiz_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('flashquiz_activities', JSON.stringify(activities));
  }, [activities]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const newUser: User = {
        id: generateId(),
        name: foundUser.name,
        email: foundUser.email,
        createdAt: new Date(),
      };
      setUser(newUser);
      return true;
    }
    
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return false;
    }
    
    // Add to mock database
    mockUsers.push({ email, password, name });
    
    const newUser: User = {
      id: generateId(),
      name,
      email,
      createdAt: new Date(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flashquiz_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
  };

  const addFlashcardSet = (set: FlashcardSet) => {
    setFlashcardSets(prev => [set, ...prev]);
  };

  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [attempt, ...prev]);
  };

  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 20));
  };

  const stats: UserStats = {
    totalQuizzes: quizAttempts.length,
    totalFlashcards: flashcardSets.reduce((acc, set) => acc + set.flashcards.length, 0),
    averageScore: quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / quizAttempts.length)
      : 0,
    quizzesThisWeek: quizAttempts.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.completedAt) > weekAgo;
    }).length,
    flashcardsStudied: flashcardSets.length * 5, // Simulated
    streakDays: Math.min(quizAttempts.length, 7),
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        quizzes,
        flashcardSets,
        quizAttempts,
        activities,
        stats,
        addQuiz,
        addFlashcardSet,
        addQuizAttempt,
        addActivity,
        currentQuiz,
        currentFlashcards,
        setCurrentQuiz,
        setCurrentFlashcards,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
