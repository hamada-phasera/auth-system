import type { CanvasNodeData, StorageData } from '../types.js';

export interface UpdateNodeParams {
  boardId: string;
  nodeId: string;
  data: Partial<CanvasNodeData>;
}

export function updateNode(
  storage: StorageData,
  params: UpdateNodeParams,
): { storage: StorageData } {
  const boardIndex = storage.boards.findIndex((b) => b.id === params.boardId);
  if (boardIndex === -1) {
    throw new Error(`Board not found: ${params.boardId}`);
  }

  const board = storage.boards[boardIndex];
  const nodeIndex = board.nodes.findIndex((n) => n.id === params.nodeId);
  if (nodeIndex === -1) {
    throw new Error(`Node not found: ${params.nodeId}`);
  }

  const updatedNodes = [...board.nodes];
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    data: { ...updatedNodes[nodeIndex].data, ...params.data } as CanvasNodeData,
  };

  const boards = [...storage.boards];
  boards[boardIndex] = {
    ...board,
    nodes: updatedNodes,
    updatedAt: new Date().toISOString(),
  };

  return { storage: { boards } };
}
