"use client";
import React, { useReducer, useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PanelConfig, LayoutState, layoutReducer, DEFAULT_PANELS } from './types';
import ModularColumn from './ModularColumn';
import HiddenPanelsMenu from './HiddenPanelsMenu';

// Pannelli essenziali per la modalità Essential
const ESSENTIAL_LEFT_PANELS = ['upload', 'dateFilter', 'priceHistory', 'statistics'];
const ESSENTIAL_RIGHT_PANELS = ['overlay', 'regression'];
const ESSENTIAL_PANELS = [...ESSENTIAL_LEFT_PANELS, ...ESSENTIAL_RIGHT_PANELS];

interface ModularLayoutProps {
  renderPanel: (panelId: string, config: PanelConfig) => React.ReactNode;
  onZoomPanel?: (panelId: string) => void;
  zoomablePanels?: string[];
  initialPanels?: PanelConfig[];
  hasPurchases?: boolean;
}

export default function ModularLayout({
  renderPanel,
  onZoomPanel,
  zoomablePanels = [],
  initialPanels,
  hasPurchases = false,
}: ModularLayoutProps) {
  const [state, dispatch] = useReducer(layoutReducer, {
    panels: initialPanels || DEFAULT_PANELS,
  } as LayoutState);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Memoize panel arrays per column
  const leftPanels = useMemo(
    () => state.panels.filter(p => p.column === 'left'),
    [state.panels]
  );
  const rightPanels = useMemo(
    () => state.panels.filter(p => p.column === 'right'),
    [state.panels]
  );

  // Handlers
  const handleHidePanel = useCallback((id: string) => {
    dispatch({ type: 'HIDE_PANEL', id });
  }, []);

  const handleShowPanel = useCallback((id: string) => {
    dispatch({ type: 'SHOW_PANEL', id });
  }, []);

  const handleCollapsePanel = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', id });
  }, []);

  const handleResizePanel = useCallback((id: string, height: number) => {
    dispatch({ type: 'RESIZE_PANEL', id, height });
  }, []);

  const handleMovePanel = useCallback((id: string, column: 'left' | 'right') => {
    dispatch({ type: 'MOVE_PANEL', id, column });
  }, []);

  const handleRestoreAll = useCallback(() => {
    dispatch({ type: 'RESTORE_ALL' });
  }, []);

  const handleResetLayout = useCallback(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  // Essential mode toggle
  const handleToggleEssential = useCallback(() => {
    if (state.isEssentialMode) {
      dispatch({ type: 'EXIT_ESSENTIAL_MODE' });
    } else {
      dispatch({ type: 'SET_ESSENTIAL_MODE', essentialIds: ESSENTIAL_PANELS });
    }
  }, [state.isEssentialMode]);

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activePanel = state.panels.find(p => p.id === active.id);
    if (!activePanel) return;

    // Check if dragging over a column directly
    if (over.id === 'left' || over.id === 'right') {
      if (activePanel.column !== over.id) {
        dispatch({ type: 'MOVE_PANEL', id: activePanel.id, column: over.id });
      }
    }
  }, [state.panels]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePanel = state.panels.find(p => p.id === active.id);
    const overPanel = state.panels.find(p => p.id === over.id);

    if (!activePanel) return;

    // If dropping on a column
    if (over.id === 'left' || over.id === 'right') {
      if (activePanel.column !== over.id) {
        dispatch({ type: 'MOVE_PANEL', id: activePanel.id, column: over.id });
      }
      return;
    }

    // If dropping on another panel
    if (overPanel) {
      // Moving within same column - reorder
      if (activePanel.column === overPanel.column) {
        const columnPanels = state.panels
          .filter(p => p.column === activePanel.column && p.visible)
          .sort((a, b) => a.order - b.order);
        
        const oldIndex = columnPanels.findIndex(p => p.id === active.id);
        const newIndex = columnPanels.findIndex(p => p.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = arrayMove(columnPanels, oldIndex, newIndex);
          dispatch({
            type: 'REORDER_PANELS',
            column: activePanel.column,
            orderedIds: newOrder.map(p => p.id),
          });
        }
      } else {
        // Moving to different column
        dispatch({ type: 'MOVE_PANEL', id: activePanel.id, column: overPanel.column });
        
        // Then reorder in new column
        setTimeout(() => {
          const columnPanels = state.panels
            .filter(p => p.column === overPanel.column && p.visible)
            .sort((a, b) => a.order - b.order);
          const overIndex = columnPanels.findIndex(p => p.id === over.id);
          const newOrderIds = [...columnPanels.map(p => p.id)];
          // Insert active panel at over position
          newOrderIds.splice(overIndex, 0, activePanel.id);
          // Remove duplicate
          const uniqueIds = [...new Set(newOrderIds)];
          dispatch({
            type: 'REORDER_PANELS',
            column: overPanel.column,
            orderedIds: uniqueIds,
          });
        }, 0);
      }
    }
  }, [state.panels]);

  const activePanel = activeId ? state.panels.find(p => p.id === activeId) : null;

  return (
    <div className="w-full">
      {/* Header con Essential button e Hidden panels menu */}
      <div className="flex items-center justify-between mb-4">
        {/* Essential Mode Toggle - Left side */}
        <button
          type="button"
          onClick={handleToggleEssential}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-300 ease-in-out transform
            ${state.isEssentialMode
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-102'
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${state.isEssentialMode ? 'rotate-180' : ''}`}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          <span>{state.isEssentialMode ? 'Vista Completa' : 'Essential'}</span>
          {state.isEssentialMode && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </button>

        {/* Hidden panels menu - Right side */}
        <HiddenPanelsMenu
          panels={state.panels}
          onShowPanel={handleShowPanel}
          onRestoreAll={handleRestoreAll}
          onResetLayout={handleResetLayout}
        />
      </div>

      {/* Essential mode indicator */}
      {state.isEssentialMode && (
        <div className="mb-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
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
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>
              <strong>Modalità Essential attiva</strong> — Visualizzazione semplificata con i componenti principali.
              Clicca di nuovo su &quot;Vista Completa&quot; per ripristinare tutti i pannelli.
            </span>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="w-full lg:w-1/2">
            <ModularColumn
              columnId="left"
              panels={leftPanels}
              onHidePanel={handleHidePanel}
              onCollapsePanel={handleCollapsePanel}
              onResizePanel={handleResizePanel}
              onMovePanel={handleMovePanel}
              onZoomPanel={onZoomPanel}
              zoomablePanels={zoomablePanels}
              renderPanel={renderPanel}
            />
          </div>

          {/* Right column */}
          {hasPurchases && (
            <div className="w-full lg:w-1/2">
              <ModularColumn
                columnId="right"
                panels={rightPanels}
                onHidePanel={handleHidePanel}
                onCollapsePanel={handleCollapsePanel}
                onResizePanel={handleResizePanel}
                onMovePanel={handleMovePanel}
                onZoomPanel={onZoomPanel}
                zoomablePanels={zoomablePanels}
                renderPanel={renderPanel}
              />
            </div>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activePanel ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border-2 border-blue-400 p-4 opacity-90">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {activePanel.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
