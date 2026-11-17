'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content ${className || ''}`}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'mailvault-dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'mailvault-dark' ? (
        <Sun className="h-4 w-4 text-warning" />
      ) : (
        <Moon className="h-4 w-4 text-primary" />
      )}
    </button>
  );
}
