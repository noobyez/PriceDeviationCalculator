"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PanelConfig } from './types';
import { useLanguage } from '@/i18n';

interface ModularPanelProps {
  config: PanelConfig;
  children: React.ReactNode;
  onHide: () => void;
  onCollapse: () => void;
  onResize: (height: number) => void;
  onMoveToColumn: (column: 'left' | 'right') => void;
  onZoom?: () => void;
  hasZoom?: boolean;
  className?: string;
}

export default function ModularPanel({
  config,
  children,
  onHide,
  onCollapse,
  onResize,
  onMoveToColumn,
  onZoom,
  hasZoom = false,
  className = '',
}: ModularPanelProps) {
  const { t } = useLanguage();
  const [isResizing, setIsResizing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Trigger enter animation on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: isDragging ? 0.5 : 1,
    height: config.collapsed ? 'auto' : (config.height ? `${config.height}px` : 'auto'),
    minHeight: config.collapsed ? 'auto' : (config.minHeight ? `${config.minHeight}px` : 'auto'),
  };

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = panelRef.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY.current;
      const newHeight = Math.max(config.minHeight || 100, startHeight.current + deltaY);
      onResize(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [config.minHeight, onResize]);

  if (!config.visible) return null;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      className={`
        w-full bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800
        panel-transition
        ${isDragging ? 'ring-2 ring-blue-400 shadow-lg' : ''}
        ${isResizing ? 'select-none' : ''}
        ${isAnimating ? 'panel-enter' : ''}
        ${className}
      `}
    >
      {/* Header con drag handle e controlli */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-xl">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none flex-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400 flex-shrink-0"
          >
            <circle cx="9" cy="5" r="1" fill="currentColor" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="9" cy="19" r="1" fill="currentColor" />
            <circle cx="15" cy="5" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="19" r="1" fill="currentColor" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t(`panels.${config.id}`)}
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Move to other column */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={t("panels.movePanel")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-400"
              >
                <path d="M18 8L22 12L18 16" />
                <path d="M2 12H22" />
                <path d="M6 8L2 12L6 16" />
              </svg>
            </button>
            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50 min-w-[140px]">
                <button
                  type="button"
                  onClick={() => { onMoveToColumn('left'); setShowMoveMenu(false); }}
                  disabled={config.column === 'left'}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-t-lg"
                >
                  ← {t("common.leftColumn")}
                </button>
                <button
                  type="button"
                  onClick={() => { onMoveToColumn('right'); setShowMoveMenu(false); }}
                  disabled={config.column === 'right'}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-b-lg"
                >
                  → {t("common.rightColumn")}
                </button>
              </div>
            )}
          </div>

          {/* Zoom button (optional) */}
          {hasZoom && onZoom && (
            <button
              type="button"
              onClick={onZoom}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={t("common.expand")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6" />
                <path d="M8 11h6" />
              </svg>
            </button>
          )}

          {/* Collapse button */}
          <button
            type="button"
            onClick={onCollapse}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title={config.collapsed ? t("common.expand") : t("common.collapse")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-zinc-400 transition-transform ${config.collapsed ? 'rotate-180' : ''}`}
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>

          {/* Hide button */}
          <button
            type="button"
            onClick={onHide}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title={t("panels.hidePanel")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-400 hover:text-red-500"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!config.collapsed && (
        <div className="p-4 overflow-auto">
          {children}
        </div>
      )}

      {/* Resize handle */}
      {!config.collapsed && (
        <div
          onMouseDown={handleResizeStart}
          className="h-2 cursor-ns-resize flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-b-xl group"
        >
          <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full group-hover:bg-blue-400 transition-colors" />
        </div>
      )}
    </div>
  );
}
