"use client";
import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { PanelConfig } from './types';
import ModularPanel from './ModularPanel';

interface ModularColumnProps {
  columnId: 'left' | 'right';
  panels: PanelConfig[];
  onHidePanel: (id: string) => void;
  onCollapsePanel: (id: string) => void;
  onResizePanel: (id: string, height: number) => void;
  onMovePanel: (id: string, column: 'left' | 'right') => void;
  onZoomPanel?: (id: string) => void;
  zoomablePanels?: string[];
  renderPanel: (panelId: string, config: PanelConfig) => React.ReactNode;
  className?: string;
}

export default function ModularColumn({
  columnId,
  panels,
  onHidePanel,
  onCollapsePanel,
  onResizePanel,
  onMovePanel,
  onZoomPanel,
  zoomablePanels = [],
  renderPanel,
  className = '',
}: ModularColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  // Sort panels by order
  const sortedPanels = [...panels]
    .filter(p => p.visible)
    .sort((a, b) => a.order - b.order);

  const panelIds = sortedPanels.map(p => p.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col gap-4 min-h-[200px] p-2 rounded-xl transition-colors
        ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 ring-dashed' : ''}
        ${className}
      `}
    >
      <SortableContext items={panelIds} strategy={verticalListSortingStrategy}>
        {sortedPanels.map((panelConfig) => (
          <ModularPanel
            key={panelConfig.id}
            config={panelConfig}
            onHide={() => onHidePanel(panelConfig.id)}
            onCollapse={() => onCollapsePanel(panelConfig.id)}
            onResize={(height) => onResizePanel(panelConfig.id, height)}
            onMoveToColumn={(col) => onMovePanel(panelConfig.id, col)}
            onZoom={zoomablePanels.includes(panelConfig.id) && onZoomPanel 
              ? () => onZoomPanel(panelConfig.id) 
              : undefined}
            hasZoom={zoomablePanels.includes(panelConfig.id)}
          >
            {renderPanel(panelConfig.id, panelConfig)}
          </ModularPanel>
        ))}
      </SortableContext>

      {sortedPanels.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Trascina qui un pannello
          </p>
        </div>
      )}
    </div>
  );
}
