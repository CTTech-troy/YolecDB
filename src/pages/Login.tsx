/**
 * Login Page - TypeScript version with RBAC
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { Button, Input, Card } from '@/components/ui';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { toast } from 'react-hot-toast';
import { BrandLogo } from '@/components/layout/BrandLogo';

type AuthMode = 'login' | 'reset';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, authUser, loading: authLoading, homeRoute } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetKey, setResetKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && authUser) {
      navigate(homeRoute, { replace: true });
    }
  }, [authLoading, user, authUser, navigate, homeRoute]);

  if (authLoading && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <BrandLogo size="lg" />
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
    } catch (error: any) {
      let message = 'Failed to login';

      if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        message = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Invalid password';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later';
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        resetKey,
        password,
        confirmPassword,
      });
      toast.success('Password reset. You can sign in now.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setResetKey('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setResetKey('');
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))]">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md" padding="lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <BrandLogo size="xl" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login'
              ? 'Sign in to YolecHub Dashboard'
              : 'Enter the Super Admin reset key to continue'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={mode === 'login' ? handleSubmit : handleResetPassword}
          className="space-y-4"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />

          {mode === 'reset' && (
            <Input
              label="Reset key"
              type="password"
              value={resetKey}
              onChange={(e) => setResetKey(e.target.value)}
              placeholder="Enter reset key"
              required
              minLength={16}
              autoComplete="off"
              disabled={loading}
            />
          )}

          <Input
            label={mode === 'login' ? 'Password' : 'New password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'login' ? 'Enter your password' : 'Create a new password'}
            required
            minLength={mode === 'reset' ? 8 : undefined}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            disabled={loading}
          />

          {mode === 'reset' && (
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            size="lg"
          >
            {mode === 'login' ? 'Sign In' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => switchMode('reset')}
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by YolecHub Enterprise</p>
        </div>
      </Card>
    </div>
  );
}
