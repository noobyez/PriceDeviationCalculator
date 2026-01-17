/**
 * CoreValueSection - "Why Sense" section with 3 feature cards
 * Displays the main value propositions of ProcuraSense
 */
"use client";
import React from "react";
import { useLanguage } from "@/i18n";
import FeatureCard from "./FeatureCard";

export default function CoreValueSection() {
  const { t } = useLanguage();

  // Feature card data with icons
  const features = [
    {
      id: "forecasting",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: t("landing.features.forecasting.title") || "Price Forecasting",
      description: t("landing.features.forecasting.description") || "Linear regression and probabilistic scenarios to anticipate future price movements.",
      accentColor: "blue" as const,
    },
    {
      id: "risk",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t("landing.features.risk.title") || "Risk Awareness",
      description: t("landing.features.risk.description") || "Understand volatility, confidence bands and price uncertainty before committing.",
      accentColor: "emerald" as const,
    },
    {
      id: "procurement",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t("landing.features.procurement.title") || "Procurement-Ready",
      description: t("landing.features.procurement.description") || "Designed for buyers, category managers and supply chain professionals.",
      accentColor: "violet" as const,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {t("landing.features.title") || "Why Sense"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t("landing.features.subtitle") || "Built for procurement professionals who need data-driven insights, not just data."}
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
