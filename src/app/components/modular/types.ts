export interface PanelConfig {
  id: string;
  title: string;
  visible: boolean;
  column: 'left' | 'right';
  order: number;
  minHeight?: number;
  height?: number;
  collapsed?: boolean;
}

export interface LayoutState {
  panels: PanelConfig[];
}

export type PanelAction =
  | { type: 'TOGGLE_VISIBILITY'; id: string }
  | { type: 'HIDE_PANEL'; id: string }
  | { type: 'SHOW_PANEL'; id: string }
  | { type: 'MOVE_PANEL'; id: string; column: 'left' | 'right' }
  | { type: 'REORDER_PANELS'; column: 'left' | 'right'; orderedIds: string[] }
  | { type: 'TOGGLE_COLLAPSE'; id: string }
  | { type: 'RESIZE_PANEL'; id: string; height: number }
  | { type: 'RESET_LAYOUT' }
  | { type: 'RESTORE_ALL' };

export const DEFAULT_PANELS: PanelConfig[] = [
  // Left column panels
  { id: 'upload', title: 'Carica Storico Prezzi', visible: true, column: 'left', order: 0 },
  { id: 'dateFilter', title: 'Filtro per Data', visible: true, column: 'left', order: 1 },
  { id: 'priceHistory', title: 'Storico Prezzi', visible: true, column: 'left', order: 2 },
  { id: 'interval', title: 'Intervallo Dati', visible: true, column: 'left', order: 3 },
  { id: 'statistics', title: 'Statistiche', visible: true, column: 'left', order: 4 },
  { id: 'newPrice', title: 'Valutazione Nuovo Prezzo', visible: true, column: 'left', order: 5 },
  { id: 'download', title: 'Download PDF', visible: true, column: 'left', order: 6 },
  
  // Right column panels
  { id: 'priceChart', title: 'Grafico Prezzi', visible: true, column: 'right', order: 0, minHeight: 400 },
  { id: 'regression', title: 'Risultato Regressione', visible: true, column: 'right', order: 1 },
  { id: 'correlation', title: 'Analisi Correlazione', visible: true, column: 'right', order: 2 },
  { id: 'probabilistic', title: 'Previsione Probabilistica', visible: true, column: 'right', order: 3, minHeight: 350 },
  { id: 'overlay', title: 'Storico vs Previsione', visible: true, column: 'right', order: 4, minHeight: 350 },
];

export function layoutReducer(state: LayoutState, action: PanelAction): LayoutState {
  switch (action.type) {
    case 'TOGGLE_VISIBILITY': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, visible: !p.visible } : p
        ),
      };
    }
    case 'HIDE_PANEL': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, visible: false } : p
        ),
      };
    }
    case 'SHOW_PANEL': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, visible: true } : p
        ),
      };
    }
    case 'MOVE_PANEL': {
      const panel = state.panels.find(p => p.id === action.id);
      if (!panel || panel.column === action.column) return state;
      
      const targetPanels = state.panels.filter(p => p.column === action.column);
      const newOrder = targetPanels.length;
      
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, column: action.column, order: newOrder } : p
        ),
      };
    }
    case 'REORDER_PANELS': {
      return {
        ...state,
        panels: state.panels.map(p => {
          if (p.column !== action.column) return p;
          const newOrder = action.orderedIds.indexOf(p.id);
          return newOrder >= 0 ? { ...p, order: newOrder } : p;
        }),
      };
    }
    case 'TOGGLE_COLLAPSE': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, collapsed: !p.collapsed } : p
        ),
      };
    }
    case 'RESIZE_PANEL': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.id ? { ...p, height: action.height } : p
        ),
      };
    }
    case 'RESET_LAYOUT': {
      return { panels: DEFAULT_PANELS };
    }
    case 'RESTORE_ALL': {
      return {
        ...state,
        panels: state.panels.map(p => ({ ...p, visible: true })),
      };
    }
    default:
      return state;
  }
}
