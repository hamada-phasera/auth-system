import { create } from 'zustand';
import type { ToolMode, StickyColor, ShapeVariant } from '../types/board';

interface UiState {
  activeTool: ToolMode;
  sidebarOpen: boolean;
  stickyColor: StickyColor;
  shapeVariant: ShapeVariant;
  exportDialogOpen: boolean;
  setTool: (tool: ToolMode) => void;
  toggleSidebar: () => void;
  setStickyColor: (color: StickyColor) => void;
  setShapeVariant: (variant: ShapeVariant) => void;
  setExportDialogOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  sidebarOpen: false,
  stickyColor: 'yellow',
  shapeVariant: 'rectangle',
  exportDialogOpen: false,
  setTool: (tool) => set({ activeTool: tool }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setStickyColor: (color) => set({ stickyColor: color }),
  setShapeVariant: (variant) => set({ shapeVariant: variant }),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
}));
