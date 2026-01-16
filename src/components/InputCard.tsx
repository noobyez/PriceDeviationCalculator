/**
 * InputCard - Specialized card for form inputs
 * Used in the left column for data entry controls
 */
import React, { ReactNode } from "react";

interface InputCardProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function InputCard({ 
  label, 
  description, 
  children, 
  className = "" 
}: InputCardProps) {
  return (
    <div className={`w-full bg-[var(--surface)] rounded-lg p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 ${className}`}>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
