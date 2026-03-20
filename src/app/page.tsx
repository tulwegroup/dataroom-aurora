'use client';

import { useEffect, useState } from 'react';
import { LoginView } from '@/components/dataroom/LoginView';
import { DashboardView } from '@/components/dataroom/DashboardView';
import { SessionUser } from '@/lib/auth';

export default function DataRoomApp() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loggedInUser: SessionUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return <DashboardView user={user} onLogout={handleLogout} />;
}
