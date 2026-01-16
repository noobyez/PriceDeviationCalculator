/**
 * SectionCard - Reusable container for grouping related content
 * Provides consistent styling across the application
 */
import React, { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function SectionCard({ 
  title, 
  subtitle, 
  children, 
  className = "",
  compact = false 
}: SectionCardProps) {
  return (
    <div className={`w-full bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 ${compact ? 'p-4' : 'p-5'} ${className}`}>
      {(title || subtitle) && (
        <div className={compact ? 'mb-3' : 'mb-4'}>
          {title && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
