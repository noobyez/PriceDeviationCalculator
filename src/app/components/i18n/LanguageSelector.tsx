"use client";

import React from "react";
import { useLanguage, Language } from "@/i18n";

/**
 * Compact IT/EN language switcher
 * Displays as a toggle button group
 */
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "it", label: "IT", flag: "🇮🇹" },
    { code: "en", label: "EN", flag: "🇬🇧" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`
            flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
            transition-all duration-200
            ${
              language === lang.code
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          title={lang.code === "it" ? "Italiano" : "English"}
        >
          <span className="text-sm">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Minimal language selector as a dropdown
 */
export function LanguageSelectorDropdown() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="
        text-xs bg-transparent border border-gray-300 dark:border-gray-600 
        rounded px-2 py-1 cursor-pointer
        text-gray-600 dark:text-gray-300
        hover:border-gray-400 dark:hover:border-gray-500
        focus:outline-none focus:ring-1 focus:ring-blue-500
      "
      title={t("language.selectLanguage")}
    >
      <option value="it">🇮🇹 Italiano</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}

export default LanguageSelector;
