/**
 * FeatureCard - Reusable card component for displaying features
 * Used in the "Why Sense" section
 */
"use client";
import React, { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor?: "blue" | "emerald" | "violet";
}

const accentStyles = {
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    borderHover: "group-hover:border-blue-500/30",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    borderHover: "group-hover:border-emerald-500/30",
  },
  violet: {
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    borderHover: "group-hover:border-violet-500/30",
  },
};

export default function FeatureCard({ 
  icon, 
  title, 
  description, 
  accentColor = "blue" 
}: FeatureCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div 
      className={`group relative p-6 sm:p-8 rounded-2xl 
                  bg-white dark:bg-slate-800/50 
                  border border-slate-200 dark:border-slate-700/50
                  ${styles.borderHover}
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50`}
    >
      {/* Icon container */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${styles.iconBg} ${styles.iconColor} mb-5`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Subtle corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${styles.iconBg} rounded-bl-3xl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}
