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

// Check if database is configured
const isDatabaseEnabled = () => {
  if (typeof window === 'undefined') return false;
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Fallback mock users for when database is not configured
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
  const [useDatabase, setUseDatabase] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const dbEnabled = isDatabaseEnabled();
    setUseDatabase(dbEnabled);
    
    const storedUser = localStorage.getItem('flashquiz_user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // If database is enabled, load user data from database
      if (dbEnabled) {
        loadUserDataFromDatabase(parsedUser.id);
      } else {
        // Load from localStorage
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
    
    setIsLoading(false);
  }, []);

  const loadFromLocalStorage = () => {
    const storedQuizzes = localStorage.getItem('flashquiz_quizzes');
    const storedFlashcards = localStorage.getItem('flashquiz_flashcards');
    const storedAttempts = localStorage.getItem('flashquiz_attempts');
    const storedActivities = localStorage.getItem('flashquiz_activities');
    
    if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
    if (storedFlashcards) setFlashcardSets(JSON.parse(storedFlashcards));
    if (storedAttempts) setQuizAttempts(JSON.parse(storedAttempts));
    if (storedActivities) setActivities(JSON.parse(storedActivities));
  };

  const loadUserDataFromDatabase = async (userId: string) => {
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load_user_data', userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
        setFlashcardSets(data.flashcardSets || []);
        setQuizAttempts(data.quizAttempts || []);
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      loadFromLocalStorage();
    }
  };

  // Save to localStorage when data changes (always, as backup)
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
    if (useDatabase) {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const newUser: User = {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          };
          setUser(newUser);
          await loadUserDataFromDatabase(newUser.id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    }
    
    // Fallback to mock authentication
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
    if (useDatabase) {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'signup', name, email, password }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const newUser: User = {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          };
          setUser(newUser);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Signup error:', error);
        return false;
      }
    }
    
    // Fallback to mock signup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockUsers.find(u => u.email === email)) {
      return false;
    }
    
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
    setQuizzes([]);
    setFlashcardSets([]);
    setQuizAttempts([]);
    setActivities([]);
    localStorage.removeItem('flashquiz_user');
    localStorage.removeItem('flashquiz_quizzes');
    localStorage.removeItem('flashquiz_flashcards');
    localStorage.removeItem('flashquiz_attempts');
    localStorage.removeItem('flashquiz_activities');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    if (useDatabase) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update', 
            userId: user.id, 
            updates: { name: updates.name, email: updates.email } 
          }),
        });
      } catch (error) {
        console.error('Update profile error:', error);
      }
    }
  };

  const addQuiz = async (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
    
    if (useDatabase && user) {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_quiz', userId: user.id, data: quiz }),
        });
      } catch (error) {
        console.error('Save quiz error:', error);
      }
    }
  };

  const addFlashcardSet = async (set: FlashcardSet) => {
    setFlashcardSets(prev => [set, ...prev]);
    
    if (useDatabase && user) {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_flashcard_set', userId: user.id, data: set }),
        });
      } catch (error) {
        console.error('Save flashcard set error:', error);
      }
    }
  };

  const addQuizAttempt = async (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [attempt, ...prev]);
    
    if (useDatabase && user) {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_quiz_attempt', userId: user.id, data: attempt }),
        });
      } catch (error) {
        console.error('Save attempt error:', error);
      }
    }
  };

  const addActivity = async (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 20));
    
    if (useDatabase && user) {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_activity', userId: user.id, data: newActivity }),
        });
      } catch (error) {
        console.error('Save activity error:', error);
      }
    }
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
    flashcardsStudied: flashcardSets.length * 5,
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
