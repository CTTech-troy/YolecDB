/**
 * Dashboard entry point with TypeScript
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './App.tsx';
import { ApiErrorBoundary } from '@/components/shared/ApiErrorBoundary';
import { installGlobalErrorHandlers } from '@/lib/incidentReporter';

installGlobalErrorHandlers('dashboard');

// Import styles
import 'remixicon/fonts/remixicon.css';
import './global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ApiErrorBoundary>
        <AppContent />
      </ApiErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
