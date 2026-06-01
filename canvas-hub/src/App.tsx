import { useMemo } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import ExportDialog from './components/ExportDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoLayout } from './hooks/useAutoLayout';
import { useBoardStore } from './store/boardStore';
import type { Board } from './types/board';

export default function App() {
  const removeSelectedNodes = useBoardStore((s) => s.removeSelectedNodes);
  const boards = useBoardStore((s) => s.boards);
  const currentBoardId = useBoardStore((s) => s.currentBoardId);
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);

  const { autoLayout } = useAutoLayout();
  useKeyboardShortcuts(removeSelectedNodes);

  const currentBoard = useMemo<Board | null>(() => {
    if (!currentBoardId) return null;
    const found = boards.find((b) => b.id === currentBoardId);
    if (!found) return null;
    return { ...found, nodes, edges };
  }, [boards, currentBoardId, nodes, edges]);

  const handleImport = async (board: Board) => {
    const { createBoard, openBoard } = useBoardStore.getState();
    const id = await createBoard(board.title);
    const store = useBoardStore.getState();
    store.setNodes(board.nodes);
    store.setEdges(board.edges);
  };

  return (
    <div className="w-screen h-screen relative">
      <Canvas />
      <Toolbar onAutoLayout={() => autoLayout()} />
      <Sidebar />
      <ExportDialog currentBoard={currentBoard} onImport={handleImport} />
    </div>
  );
}
