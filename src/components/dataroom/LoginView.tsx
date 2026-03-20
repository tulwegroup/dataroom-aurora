'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionUser } from '@/lib/auth';
import { AuroraLogo } from './AuroraLogo';

interface LoginViewProps {
  onLogin: (user: SessionUser) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [mode, setMode] = useState<'login' | 'request'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      onLogin(data.user);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <AuroraLogo className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Aurora Data Room</h1>
            <p className="text-slate-400 mt-2">Secure Document Access Portal</p>
          </div>

          {success ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <div className="text-green-500 text-5xl mb-4">&#10003;</div>
                <h3 className="text-lg font-semibold text-white mb-2">Request Submitted</h3>
                <p className="text-slate-400">
                  Your access request has been submitted. Our team will review and get back to you shortly.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setMode('login');
                  }}
                >
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {mode === 'login' ? 'Sign In' : 'Request Access'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {mode === 'login'
                    ? 'Enter your credentials to access the data room'
                    : 'Submit a request for access to the data room'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 bg-red-900/50 border-red-800">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-amber-500 hover:text-amber-400"
                        onClick={() => setMode('request')}
                      >
                        Don't have access? Request access
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="req-name" className="text-slate-300">Full Name</Label>
                      <Input
                        id="req-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="req-email" className="text-slate-300">Email</Label>
                      <Input
                        id="req-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="req-company" className="text-slate-300">Company</Label>
                      <Input
                        id="req-company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-amber-500 hover:text-amber-400"
                        onClick={() => setMode('login')}
                      >
                        Already have access? Sign in
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-6 text-sm text-slate-500">
            <p>&copy; 2026 Aurora OSI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
