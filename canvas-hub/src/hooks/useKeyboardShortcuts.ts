import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import type { ToolMode } from '../types/board';

const KEY_TOOL_MAP: Record<string, ToolMode> = {
  v: 'select',
  h: 'pan',
  m: 'mindmap',
  s: 'sticky',
  d: 'document',
  r: 'shape',
  e: 'edge',
};

/**
 * Global keyboard shortcuts for tool switching and common actions.
 * @param onDeleteSelected - callback invoked when Delete/Backspace is pressed
 */
export function useKeyboardShortcuts(onDeleteSelected?: () => void) {
  const setTool = useUiStore((s) => s.setTool);
  const setExportDialogOpen = useUiStore((s) => s.setExportDialogOpen);
  const exportDialogOpen = useUiStore((s) => s.exportDialogOpen);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't intercept when user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Cmd/Ctrl + E = toggle export dialog
      if ((event.metaKey || event.ctrlKey) && key === 'e') {
        event.preventDefault();
        setExportDialogOpen(!exportDialogOpen);
        return;
      }

      // Don't process single-key shortcuts when modifiers are held
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Tool switching shortcuts
      const tool = KEY_TOOL_MAP[key];
      if (tool) {
        setTool(tool);
        return;
      }

      // Delete/Backspace = delete selected
      if (key === 'delete' || key === 'backspace') {
        onDeleteSelected?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, setExportDialogOpen, exportDialogOpen, onDeleteSelected]);
}
