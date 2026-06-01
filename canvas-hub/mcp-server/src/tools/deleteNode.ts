import type { StorageData } from '../types.js';

export interface DeleteNodeParams {
  boardId: string;
  nodeId: string;
}

export function deleteNode(
  storage: StorageData,
  params: DeleteNodeParams,
): { storage: StorageData } {
  const boardIndex = storage.boards.findIndex((b) => b.id === params.boardId);
  if (boardIndex === -1) {
    throw new Error(`Board not found: ${params.boardId}`);
  }

  const board = storage.boards[boardIndex];
  const nodeExists = board.nodes.some((n) => n.id === params.nodeId);
  if (!nodeExists) {
    throw new Error(`Node not found: ${params.nodeId}`);
  }

  const boards = [...storage.boards];
  boards[boardIndex] = {
    ...board,
    // Remove the node
    nodes: board.nodes.filter((n) => n.id !== params.nodeId),
    // Also remove any edges connected to this node
    edges: board.edges.filter(
      (e) => e.source !== params.nodeId && e.target !== params.nodeId,
    ),
    updatedAt: new Date().toISOString(),
  };

  return { storage: { boards } };
}
