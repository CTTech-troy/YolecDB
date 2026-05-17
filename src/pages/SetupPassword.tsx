import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Button, Card, Input } from '@/components/ui';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { toast } from 'react-hot-toast';
import { BrandLogo } from '@/components/layout/BrandLogo';

export function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [invite, setInvite] = useState<{
    email: string;
    fullName: string;
    roleDisplayName: string;
  } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setLoading(false);
      return;
    }

    authApi
      .validateInvite(token)
      .then((data) => {
        setInvite({
          email: data.email,
          fullName: data.fullName,
          roleDisplayName: data.roleDisplayName,
        });
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.setupPassword({ token, password, confirmPassword });
      toast.success('Account activated. You can sign in now.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))]">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md" padding="lg">
        {loading ? (
          <p className="text-center text-slate-500">Validating invitation...</p>
        ) : invalid ? (
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Invalid link</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This invitation is invalid, expired, or already used. Ask your administrator for a
              new invite.
            </p>
            <Link to="/" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mb-6 flex justify-center">
                <BrandLogo size="lg" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your password</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {invite?.fullName} - {invite?.roleDisplayName}
              </p>
              <p className="text-xs text-slate-500">{invite?.email}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full" loading={submitting}>
                Activate account
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
