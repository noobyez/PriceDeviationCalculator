/**
 * Footer - Minimal footer for ProcuraSense
 * Simple branding and copyright
 */
"use client";
import React from "react";
import { useLanguage } from "@/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-8 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-white">Sense</span>
            <span className="text-slate-600">—</span>
            <span className="text-sm">{t("landing.footer.tagline") || "Analytics made simple"}</span>
          </div>

          {/* Links / Info */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>© {new Date().getFullYear()} ProcuraSense</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
