"use client";
import React, { useReducer, useCallback, useMemo } from 'react';
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
      {/* Hidden panels menu - header */}
      <div className="flex justify-end mb-4">
        <HiddenPanelsMenu
          panels={state.panels}
          onShowPanel={handleShowPanel}
          onRestoreAll={handleRestoreAll}
          onResetLayout={handleResetLayout}
        />
      </div>

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
