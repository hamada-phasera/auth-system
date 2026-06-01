import { nanoid } from 'nanoid';
import type { CanvasNode, CanvasNodeData, StorageData } from '../types.js';

export interface AddNodeParams {
  boardId: string;
  type: string;
  position: { x: number; y: number };
  data: CanvasNodeData;
}

export function addNode(
  storage: StorageData,
  params: AddNodeParams,
): { node: CanvasNode; storage: StorageData } {
  const boardIndex = storage.boards.findIndex((b) => b.id === params.boardId);
  if (boardIndex === -1) {
    throw new Error(`Board not found: ${params.boardId}`);
  }

  const node: CanvasNode = {
    id: `node_${nanoid(10)}`,
    type: params.type,
    position: params.position,
    data: params.data,
  };

  const boards = [...storage.boards];
  boards[boardIndex] = {
    ...boards[boardIndex],
    nodes: [...boards[boardIndex].nodes, node],
    updatedAt: new Date().toISOString(),
  };

  return { node, storage: { boards } };
}
