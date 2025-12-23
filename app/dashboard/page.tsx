'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { 
  Upload, 
  BookOpen, 
  ClipboardList, 
  BarChart2, 
  Trophy, 
  Flame, 
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  FileText
} from 'lucide-react';
import { getRelativeTime, calculatePercentage } from '@/utils/helpers';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, stats, activities, quizAttempts, flashcardSets } = useApp();

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

  const statCards = [
    {
      icon: ClipboardList,
      label: 'Quizzes Taken',
      value: stats.totalQuizzes,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BookOpen,
      label: 'Flashcards Studied',
      value: stats.flashcardsStudied,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Trophy,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: stats.streakDays,
      color: 'from-red-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-white/60">
            Ready to continue learning? Here&apos;s your progress overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/upload">
              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Upload Document</h3>
                  <p className="text-sm text-white/60">Generate new content</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
              </Card>
            </Link>
            
            <Link href="/flashcards">
              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Study Flashcards</h3>
                  <p className="text-sm text-white/60">{flashcardSets.length} sets available</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
              </Card>
            </Link>
            
            <Link href="/quiz">
              <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Take Quiz</h3>
                  <p className="text-sm text-white/60">Test your knowledge</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <Link href="/progress" className="text-sm text-purple-400 hover:text-purple-300">
                View all
              </Link>
            </div>
            <Card>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'quiz' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : activity.type === 'flashcard'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {activity.type === 'quiz' ? (
                          <ClipboardList className="w-5 h-5" />
                        ) : activity.type === 'flashcard' ? (
                          <BookOpen className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-white/60">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        {activity.score !== undefined && (
                          <Badge variant={activity.score >= 70 ? 'success' : activity.score >= 50 ? 'warning' : 'danger'}>
                            {activity.score}%
                          </Badge>
                        )}
                        <p className="text-xs text-white/40 mt-1">
                          {getRelativeTime(new Date(activity.timestamp))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="w-8 h-8" />}
                  title="No activity yet"
                  description="Upload a document to get started!"
                  action={
                    <Link href="/upload">
                      <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Upload Document
                      </Button>
                    </Link>
                  }
                />
              )}
            </Card>
          </div>

          {/* Performance Summary */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Performance Summary</h2>
              <Link href="/progress" className="text-sm text-purple-400 hover:text-purple-300">
                View details
              </Link>
            </div>
            <Card>
              {quizAttempts.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">This Week</p>
                      <p className="text-3xl font-bold text-white">{stats.quizzesThisWeek}</p>
                      <p className="text-sm text-white/60">quizzes completed</p>
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-purple-500"
                        style={{
                          clipPath: `polygon(0 0, 100% 0, 100% ${stats.averageScore}%, 0 ${stats.averageScore}%)`
                        }}
                      />
                      <span className="text-xl font-bold text-white">{stats.averageScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white/80">Recent Scores</p>
                    {quizAttempts.slice(0, 3).map((attempt) => (
                      <div key={attempt.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-white truncate">{attempt.quizTitle}</p>
                          <div className="mt-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                calculatePercentage(attempt.score, attempt.totalQuestions) >= 70
                                  ? 'bg-green-500'
                                  : calculatePercentage(attempt.score, attempt.totalQuestions) >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${calculatePercentage(attempt.score, attempt.totalQuestions)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8" />}
                  title="No quizzes taken yet"
                  description="Complete your first quiz to see your performance!"
                  action={
                    <Link href="/upload">
                      <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Create Quiz
                      </Button>
                    </Link>
                  }
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
