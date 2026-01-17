/**
 * ItemSelector - Dropdown component for selecting the active item in multi-item datasets
 * Shows a selector when multiple items are present, hidden for single-item datasets
 */
"use client";
import React from "react";
import { useLanguage } from "@/i18n";
import { Tooltip } from "./help";

interface ItemSelectorProps {
  items: string[];
  selectedItem: string;
  onItemChange: (item: string) => void;
  hasMultipleItems: boolean;
}

export default function ItemSelector({
  items,
  selectedItem,
  onItemChange,
  hasMultipleItems
}: ItemSelectorProps) {
  const { t } = useLanguage();

  // Don't render if single-item dataset
  if (!hasMultipleItems || items.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
      <Tooltip content={t("itemSelector.tooltip") || "Select item for analysis"}>
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
          {t("itemSelector.label") || "Analyze Item:"}
        </label>
      </Tooltip>
      
      <select
        value={selectedItem}
        onChange={(e) => onItemChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-600 
                   bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all cursor-pointer"
      >
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md">
        {items.length} {t("itemSelector.itemsCount") || "items"}
      </span>
    </div>
  );
}
