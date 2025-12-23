'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Upload, 
  BookOpen, 
  ClipboardList, 
  BarChart2, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/helpers';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: ClipboardList },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const { user, logout } = useApp();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="w-full max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FlashQuiz+</span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'gradient-bg text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/80">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FlashQuiz+</span>
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="glass border-t border-white/10 px-4 py-4 space-y-2 animate-slide-up">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'gradient-bg text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-[72px]" />
    </>
  );
}
