import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-card',
          style: {
            background: 'var(--surface-container)',
            color: 'var(--on-surface)',
            border: '1px solid var(--outline-variant)',
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
