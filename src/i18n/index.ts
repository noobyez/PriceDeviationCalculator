"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { it } from "./it";
import { en } from "./en";

// ============================================
// Types
// ============================================
export type Language = "it" | "en";

// Recursive type for nested translation keys
type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof it>;

// ============================================
// Dictionaries
// ============================================
const dictionaries = {
  it,
  en,
} as const;

// ============================================
// Context
// ============================================
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// ============================================
// Helper function to get nested value
// ============================================
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Key not found, return the path as fallback
      return path;
    }
  }

  // If result is an array, join it
  if (Array.isArray(result)) {
    return result.join("\n");
  }

  return typeof result === "string" ? result : path;
}

// ============================================
// Provider Component
// ============================================
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = "it" }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("app-language");
    if (stored === "it" || stored === "en") {
      setLanguageState(stored);
    }
    setIsInitialized(true);
  }, []);

  // Save language to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  }, []);

  // Translation function with parameter substitution
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dictionary = dictionaries[language];
      let translation = getNestedValue(dictionary, key);

      // Replace parameters like {param} with actual values
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
        });
      }

      return translation;
    },
    [language]
  );

  // Don't render until we've checked localStorage
  if (!isInitialized) {
    return React.createElement(React.Fragment, null, null);
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
}

// ============================================
// Hook
// ============================================
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// ============================================
// Standalone t function for use outside React components
// This is a simple fallback that uses Italian by default
// ============================================
export function getStaticTranslation(key: string, language: Language = "it"): string {
  return getNestedValue(dictionaries[language], key);
}

// ============================================
// Export dictionaries for type checking
// ============================================
export { it, en };
