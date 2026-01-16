"use client";
import React from 'react';
import { useHelpOptional } from './HelpContext';

export default function HelpToggle() {
  const { helpEnabled, toggleHelp } = useHelpOptional();

  return (
    <button
      type="button"
      onClick={toggleHelp}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${helpEnabled
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }
      `}
      title={helpEnabled ? 'Disattiva aiuti' : 'Attiva aiuti'}
    >
      <span className={`transition-transform duration-200 ${helpEnabled ? 'scale-110' : 'scale-100'}`}>
        {helpEnabled ? '💡' : '🔅'}
      </span>
      <span className="hidden sm:inline">
        {helpEnabled ? 'Aiuti ON' : 'Aiuti OFF'}
      </span>
      
      {/* Toggle switch visual */}
      <div className={`
        w-8 h-4 rounded-full transition-colors duration-200 relative
        ${helpEnabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'}
      `}>
        <div className={`
          absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${helpEnabled ? 'translate-x-4' : 'translate-x-0.5'}
        `} />
      </div>
    </button>
  );
}
