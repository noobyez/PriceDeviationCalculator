/**
 * HeroSection - Main hero component for ProcuraSense landing page
 * Displays the brand identity, main value proposition, and CTA
 */
"use client";
import React from "react";
import { useLanguage } from "@/i18n";

interface HeroSectionProps {
  onScrollToUpload?: () => void;
}

export default function HeroSection({ onScrollToUpload }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 sm:py-28 lg:py-32">
      {/* Background pattern - subtle grid effect */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Gradient orbs - decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Tagline above title */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 tracking-wider">
              <span className="w-8 h-px bg-blue-400/50" />
              Turn price uncertainty into strategic insight
              <span className="w-8 h-px bg-blue-400/50" />
            </span>
          </div>

          {/* Main title - "Sense" with gradient */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Sense
            </span>
          </h1>

          {/* Subtitle/tagline */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-300 mb-8 max-w-3xl mx-auto">
            {t("landing.hero.subtitle") || "Your predictive companion for smarter procurement decisions"}
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.hero.description") || "Analyze historical prices, forecast future scenarios and quantify risk with probabilistic models tailored for procurement."}
          </p>

          {/* CTA button - subtle, non-invasive */}
          <button
            onClick={onScrollToUpload}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full 
                       bg-white/5 border border-white/10 text-white/90
                       hover:bg-white/10 hover:border-white/20 
                       transition-all duration-300 ease-out"
          >
            <span className="text-sm font-medium tracking-wide">
              {t("landing.hero.cta") || "Upload your data to start"}
            </span>
            <svg 
              className="w-4 h-4 text-slate-400 group-hover:translate-y-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t("landing.hero.trust1") || "Enterprise-grade security"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{t("landing.hero.trust2") || "Instant analysis"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{t("landing.hero.trust3") || "Data never leaves your browser"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
