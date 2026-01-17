/**
 * HowItWorksSection - Simple 3-step process explanation
 * Guides users through the workflow
 */
"use client";
import React from "react";
import { useLanguage } from "@/i18n";

export default function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      title: t("landing.howItWorks.step1.title") || "Upload data",
      description: t("landing.howItWorks.step1.description") || "Import your historical price data from CSV or Excel files.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      number: "02",
      title: t("landing.howItWorks.step2.title") || "Analyze trends",
      description: t("landing.howItWorks.step2.description") || "Explore statistics, correlations and identify patterns.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: t("landing.howItWorks.step3.title") || "Simulate scenarios",
      description: t("landing.howItWorks.step3.description") || "Generate probabilistic forecasts and assess risk levels.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {t("landing.howItWorks.title") || "How it works"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t("landing.howItWorks.subtitle") || "From raw data to actionable insights in three simple steps."}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-violet-200 dark:from-blue-800 dark:via-emerald-800 dark:to-violet-800" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number badge */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                  ${index === 0 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''}
                  ${index === 1 ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : ''}
                  ${index === 2 ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' : ''}
                `}>
                  {step.icon}
                </div>

                {/* Step content */}
                <div className="max-w-xs">
                  <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2 block">
                    {t("landing.howItWorks.stepLabel") || "Step"} {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
