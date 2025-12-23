'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LoadingSpinner } from '@/components/ui';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, ClipboardList, BarChart2, Zap } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  FlashQuiz<span className="gradient-text">+</span>
                </h1>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Documents into
              <br />
              <span className="gradient-text">Interactive Learning</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Upload any document and let AI generate personalized flashcards and quizzes. 
              Study smarter, not harder.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-bg text-white font-semibold rounded-2xl shadow-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-button text-white font-semibold rounded-2xl"
              >
                Sign In
              </Link>
            </div>

            {/* Demo credentials */}
            <p className="mt-6 text-sm text-white/40">
              Demo: demo@flashquiz.com / demo123
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Everything You Need to Learn Effectively
          </h3>
          <p className="text-white/60 max-w-xl mx-auto">
            Powered by GPT-4o, FlashQuiz+ understands your content and creates meaningful study materials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'AI-Powered Generation',
              description: 'Upload PDF, DOCX, or TXT and get instant flashcards and quizzes.',
            },
            {
              icon: BookOpen,
              title: 'Interactive Flashcards',
              description: 'Beautiful flip cards with progress tracking and spaced repetition.',
            },
            {
              icon: ClipboardList,
              title: 'Smart Quizzes',
              description: 'Multiple choice questions with explanations and instant feedback.',
            },
            {
              icon: BarChart2,
              title: 'Progress Analytics',
              description: 'Track your learning journey with detailed performance insights.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">
            Built with ❤️ for Hackathon 2024 • Powered by GPT-4o
          </p>
        </div>
      </footer>
    </div>
  );
}
