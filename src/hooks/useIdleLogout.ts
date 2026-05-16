import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const IDLE_MS = 30 * 60 * 1000;

export function useIdleLogout() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return undefined;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void signOut();
      }, IDLE_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, signOut]);
}
