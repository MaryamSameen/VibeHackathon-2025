import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlashQuiz+ | Instant Document-to-Quiz Platform',
  description: 'Transform your documents into interactive flashcards and quizzes with AI-powered learning.',
  keywords: ['flashcards', 'quiz', 'learning', 'AI', 'education', 'study'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
