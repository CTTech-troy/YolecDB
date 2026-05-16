import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

export function AppToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDark ? '#1e293b' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDark ? '#1e293b' : '#ffffff',
          },
        },
      }}
    />
  );
}
