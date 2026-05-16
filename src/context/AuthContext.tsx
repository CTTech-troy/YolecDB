/**
 * RBAC-aware AuthContext with httpOnly session exchange
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { apiClient, setCsrfToken } from '@/lib/apiClient';
import { AuthUser, Permission } from '@/types';
import { isSuperAdminRole, getDefaultHomeRoute } from '@/lib/roles';
import { createSession, logoutSession } from '@/api/session';
import { useIdleLogout } from '@/hooks/useIdleLogout';

interface AuthContextValue {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
  isSuperAdmin: boolean;
  homeRoute: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const exchangeInFlight = useRef(false);
  const sessionReadyUid = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        sessionReadyUid.current = null;
        setAuthUser(null);
        setCsrfToken(null);
        setLoading(false);
        return;
      }

      if (sessionReadyUid.current === firebaseUser.uid) {
        setLoading(false);
        return;
      }

      if (exchangeInFlight.current) {
        return;
      }

      exchangeInFlight.current = true;
      setLoading(true);

      try {
        const idToken = await firebaseUser.getIdToken();
        const session = await createSession(idToken);
        setCsrfToken(session.csrfToken);
        setAuthUser(session.user);
        sessionReadyUid.current = firebaseUser.uid;
      } catch (error) {
        console.warn('Session exchange failed:', error);
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await apiClient.get<AuthUser>('/api/mgmt/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAuthUser(userData);
          sessionReadyUid.current = firebaseUser.uid;
        } catch {
          try {
            const tokenResult = await firebaseUser.getIdTokenResult();
            if (tokenResult.claims.admin === true) {
              setAuthUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                roleId: 'legacy',
                roleName: 'SUPER_ADMIN',
                permissions: [],
                status: 'active',
              });
              sessionReadyUid.current = firebaseUser.uid;
            } else {
              setAuthUser(null);
              sessionReadyUid.current = null;
            }
          } catch {
            setAuthUser(null);
            sessionReadyUid.current = null;
          }
        }
      } finally {
        exchangeInFlight.current = false;
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!authUser) return false;
    if (isSuperAdminRole(authUser.roleName)) return true;
    return authUser.permissions.includes(permission);
  };

  const hasAnyPermission = (...permissions: Permission[]): boolean => {
    if (!authUser) return false;
    if (isSuperAdminRole(authUser.roleName)) return true;
    return permissions.some((p) => authUser.permissions.includes(p));
  };

  const hasAllPermissions = (...permissions: Permission[]): boolean => {
    if (!authUser) return false;
    if (isSuperAdminRole(authUser.roleName)) return true;
    return permissions.every((p) => authUser.permissions.includes(p));
  };

  const isSuperAdmin = isSuperAdminRole(authUser?.roleName);
  const homeRoute = getDefaultHomeRoute(authUser?.roleName);

  const signOut = async () => {
    try {
      await logoutSession();
    } catch {
      /* ignore */
    }
    setCsrfToken(null);
    sessionReadyUid.current = null;
    await auth.signOut();
    setUser(null);
    setAuthUser(null);
  };

  const value: AuthContextValue = {
    user,
    authUser,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    homeRoute,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      <IdleLogoutWatcher />
      {children}
    </AuthContext.Provider>
  );
}

function IdleLogoutWatcher() {
  useIdleLogout();
  return null;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
