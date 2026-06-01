import { nanoid } from 'nanoid';
import type { CanvasEdge, StorageData } from '../types.js';

export interface AddEdgeParams {
  boardId: string;
  source: string;
  target: string;
}

export function addEdge(
  storage: StorageData,
  params: AddEdgeParams,
): { edge: CanvasEdge; storage: StorageData } {
  const boardIndex = storage.boards.findIndex((b) => b.id === params.boardId);
  if (boardIndex === -1) {
    throw new Error(`Board not found: ${params.boardId}`);
  }

  const board = storage.boards[boardIndex];

  // Validate source and target nodes exist
  if (!board.nodes.some((n) => n.id === params.source)) {
    throw new Error(`Source node not found: ${params.source}`);
  }
  if (!board.nodes.some((n) => n.id === params.target)) {
    throw new Error(`Target node not found: ${params.target}`);
  }

  const edge: CanvasEdge = {
    id: `edge_${nanoid(10)}`,
    source: params.source,
    target: params.target,
  };

  const boards = [...storage.boards];
  boards[boardIndex] = {
    ...board,
    edges: [...board.edges, edge],
    updatedAt: new Date().toISOString(),
  };

  return { edge, storage: { boards } };
}
