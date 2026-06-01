import { nanoid } from 'nanoid';
import type { Board, StorageData } from '../types.js';

export interface CreateBoardParams {
  title: string;
}

export function createBoard(
  storage: StorageData,
  params: CreateBoardParams,
): { board: Board; storage: StorageData } {
  const now = new Date().toISOString();
  const board: Board = {
    id: `board_${nanoid(10)}`,
    title: params.title,
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };

  const updatedStorage: StorageData = {
    boards: [...storage.boards, board],
  };

  return { board, storage: updatedStorage };
}
