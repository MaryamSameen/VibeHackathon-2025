'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, Input, Badge, LoadingSpinner } from '@/components/ui';
import { 
  User,
  Mail,
  Camera,
  Save,
  LogOut,
  Trophy,
  BookOpen,
  ClipboardList,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/utils/helpers';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateProfile, stats, quizAttempts, flashcardSets } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isLoading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProfile({ name, email });
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const accountStats = [
    { icon: ClipboardList, label: 'Quizzes Taken', value: stats.totalQuizzes },
    { icon: BookOpen, label: 'Flashcard Sets', value: flashcardSets.length },
    { icon: Trophy, label: 'Average Score', value: `${stats.averageScore}%` },
    { icon: Calendar, label: 'Member Since', value: formatDate(new Date(user.createdAt)) },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/60">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mx-auto">
                  <span className="text-4xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">{user.name}</h2>
              <p className="text-white/60 text-sm mb-4">{user.email}</p>
              <Badge variant="success">Active Account</Badge>
            </Card>
          </div>

          {/* Edit Profile */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>
              
              <div className="space-y-5">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-5 h-5" />}
                  placeholder="Enter your name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-5 h-5" />}
                  placeholder="Enter your email"
                />

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    className={saveSuccess ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {accountStats.map((stat, index) => (
              <Card key={index}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <Card className="border-red-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Session</h3>
            <p className="text-white/60 text-sm mb-4">
              Log out from your account. You&apos;ll need to sign in again to access your data.
            </p>
            <Button
              variant="danger"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Log Out
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
