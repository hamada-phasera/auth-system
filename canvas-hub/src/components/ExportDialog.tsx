import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download, Upload } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { exportBoardAsJson, importBoardFromJson } from '../utils/exportUtils';
import type { Board } from '../types/board';

interface ExportDialogProps {
  /** The current board to export. If null, export is disabled. */
  currentBoard: Board | null;
  /** Callback when a board is imported from JSON. */
  onImport?: (board: Board) => void;
}

export default function ExportDialog({ currentBoard, onImport }: ExportDialogProps) {
  const exportDialogOpen = useUiStore((s) => s.exportDialogOpen);
  const setExportDialogOpen = useUiStore((s) => s.setExportDialogOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    if (!currentBoard) return;

    const json = exportBoardAsJson(currentBoard);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBoard.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportDialogOpen(false);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const board = importBoardFromJson(reader.result as string);
        onImport?.(board);
        setExportDialogOpen(false);
      } catch (err) {
        alert(`Failed to import board: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-imported
    e.target.value = '';
  }

  return (
    <AnimatePresence>
      {exportDialogOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] backdrop-blur-sm bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExportDialogOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative rounded-2xl p-6 w-[360px] pointer-events-auto"
              style={{
                background: 'rgba(22, 22, 48, 0.98)',
                border: '1px solid #3a3a6a',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors"
                onClick={() => setExportDialogOpen(false)}
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-semibold text-slate-100 mb-6">
                Export / Import
              </h3>

              <div className="flex flex-col gap-3">
                {/* Export button */}
                <button
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${currentBoard
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                  `}
                  onClick={handleExport}
                  disabled={!currentBoard}
                >
                  <Download size={18} />
                  Export as JSON
                </button>

                {/* Import button */}
                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  onClick={handleImportClick}
                >
                  <Upload size={18} />
                  Import from JSON
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {!currentBoard && (
                <p className="mt-3 text-xs text-slate-500">
                  No active board to export. Open or create a board first.
                </p>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
