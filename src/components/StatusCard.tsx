/**
 * StatusCard - Decision-first UI component
 * Displays RDA evaluation status prominently with color-coded feedback
 * User should understand the decision in under 3 seconds
 */
import React from "react";

type StatusType = "OK" | "WARNING" | "ALERT" | null;

interface StatusCardProps {
  status: StatusType;
  reasons: string[];
  comment?: string;
  title?: string;
}

const statusConfig = {
  OK: {
    bg: "bg-emerald-50 dark:bg-emerald-900/40",
    border: "border-emerald-200 dark:border-emerald-700",
    icon: "✓",
    iconBg: "bg-emerald-500",
    title: "Prezzo Accettabile",
    titleColor: "text-emerald-800 dark:text-emerald-100",
  },
  WARNING: {
    bg: "bg-amber-50 dark:bg-amber-900/40",
    border: "border-amber-200 dark:border-amber-700",
    icon: "⚠",
    iconBg: "bg-amber-500",
    title: "Attenzione Richiesta",
    titleColor: "text-amber-800 dark:text-amber-100",
  },
  ALERT: {
    bg: "bg-red-50 dark:bg-red-900/40",
    border: "border-red-200 dark:border-red-700",
    icon: "✕",
    iconBg: "bg-red-500",
    title: "Prezzo Non Accettabile",
    titleColor: "text-red-800 dark:text-red-100",
  },
};

export default function StatusCard({ status, reasons, comment, title }: StatusCardProps) {
  if (!status) return null;

  const config = statusConfig[status];

  return (
    <div className={`w-full p-5 rounded-xl border-2 ${config.bg} ${config.border} transition-all`}>
      {/* Header with icon and status */}
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
          {config.icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
            {title || "Stato RDA"}
          </div>
          <div className={`text-xl font-bold ${config.titleColor}`}>
            {config.title}
          </div>
        </div>
      </div>

      {/* Primary reason - most important, shown prominently */}
      {reasons.length > 0 && (
        <p className={`text-base font-medium ${config.titleColor} mb-2`}>
          {reasons[0]}
        </p>
      )}

      {/* Secondary reasons - less prominent */}
      {reasons.length > 1 && (
        <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1 mb-2">
          {reasons.slice(1).map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-zinc-400">•</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Technical comment - de-emphasized */}
      {comment && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 italic">
          {comment}
        </p>
      )}
    </div>
  );
}
