import type { Board, StorageData } from '../types.js';

export interface GetBoardParams {
  boardId: string;
}

export function getBoard(
  storage: StorageData,
  params: GetBoardParams,
): Board {
  const board = storage.boards.find((b) => b.id === params.boardId);
  if (!board) {
    throw new Error(`Board not found: ${params.boardId}`);
  }
  return board;
}
