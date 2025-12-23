'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  BarChart2,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { calculatePercentage, formatDate } from '@/utils/helpers';

export default function ProgressPage() {
  const router = useRouter();
  const { user, isLoading, quizAttempts, flashcardSets, stats } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

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

  // Generate performance data for charts
  const getPerformanceData = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttempts = quizAttempts.filter(a => {
        const attemptDate = new Date(a.completedAt).toISOString().split('T')[0];
        return attemptDate === dateStr;
      });
      
      const avgScore = dayAttempts.length > 0
        ? Math.round(dayAttempts.reduce((acc, a) => acc + calculatePercentage(a.score, a.totalQuestions), 0) / dayAttempts.length)
        : null;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: avgScore,
        quizzes: dayAttempts.length,
      });
    }
    
    return data;
  };

  const performanceData = getPerformanceData();

  // Quiz distribution by score range
  const getScoreDistribution = () => {
    const ranges = [
      { name: '90-100%', min: 90, max: 100, count: 0, color: '#22c55e' },
      { name: '70-89%', min: 70, max: 89, count: 0, color: '#3b82f6' },
      { name: '50-69%', min: 50, max: 69, count: 0, color: '#eab308' },
      { name: '0-49%', min: 0, max: 49, count: 0, color: '#ef4444' },
    ];
    
    quizAttempts.forEach(a => {
      const percent = calculatePercentage(a.score, a.totalQuestions);
      const range = ranges.find(r => percent >= r.min && percent <= r.max);
      if (range) range.count++;
    });
    
    return ranges.filter(r => r.count > 0);
  };

  const scoreDistribution = getScoreDistribution();

  // Weekly activity
  const getWeeklyActivity = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, idx) => {
      const count = quizAttempts.filter(a => {
        const d = new Date(a.completedAt);
        return d.getDay() === idx;
      }).length;
      return { day, quizzes: count };
    });
  };

  const weeklyActivity = getWeeklyActivity();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="text-white font-medium">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-white/60">
              {p.name}: {p.value}{p.name === 'score' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Progress Tracking</h1>
            <p className="text-white/60">Monitor your learning journey and performance</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'gradient-bg text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {quizAttempts.length === 0 ? (
          <EmptyState
            icon={<BarChart2 className="w-8 h-8" />}
            title="No progress data yet"
            description="Complete some quizzes to see your progress analytics!"
          />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalQuizzes}</p>
                    <p className="text-sm text-white/60">Total Quizzes</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
                    <p className="text-sm text-white/60">Avg Score</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalFlashcards}</p>
                    <p className="text-sm text-white/60">Flashcards</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.streakDays}</p>
                    <p className="text-sm text-white/60">Day Streak</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Score Trend */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Score Trend</h3>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.4)" 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        dot={{ fill: '#a855f7', strokeWidth: 2 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="day" 
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quizzes" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Score Distribution & Recent Attempts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <h3 className="text-lg font-semibold text-white mb-6">Score Distribution</h3>
                {scoreDistribution.length > 0 ? (
                  <div className="flex items-center gap-8">
                    <div className="w-40 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scoreDistribution}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={4}
                          >
                            {scoreDistribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {scoreDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-white/80 text-sm">{item.name}</span>
                          <Badge variant="default">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/60">No data available</p>
                )}
              </Card>

              {/* Recent Attempts */}
              <Card>
                <h3 className="text-lg font-semibold text-white mb-6">Recent Attempts</h3>
                <div className="space-y-4">
                  {quizAttempts.slice(0, 5).map((attempt) => {
                    const percent = calculatePercentage(attempt.score, attempt.totalQuestions);
                    return (
                      <div key={attempt.id} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          percent >= 70 ? 'bg-green-500/20' : percent >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                        }`}>
                          <span className={`text-sm font-bold ${
                            percent >= 70 ? 'text-green-400' : percent >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {percent}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{attempt.quizTitle}</p>
                          <p className="text-sm text-white/60">
                            {attempt.score}/{attempt.totalQuestions} correct
                          </p>
                        </div>
                        <p className="text-xs text-white/40">
                          {formatDate(new Date(attempt.completedAt))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
