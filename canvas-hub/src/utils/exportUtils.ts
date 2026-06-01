import type { Board } from '../types/board';

/**
 * Serialize a Board to a JSON string suitable for file export.
 */
export function exportBoardAsJson(board: Board): string {
  return JSON.stringify(board, null, 2);
}

/**
 * Parse a JSON string and validate it as a Board.
 * Throws if the input is not a valid Board shape.
 */
export function importBoardFromJson(json: string): Board {
  const parsed = JSON.parse(json);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof parsed.id !== 'string' ||
    typeof parsed.title !== 'string' ||
    !Array.isArray(parsed.nodes) ||
    !Array.isArray(parsed.edges) ||
    typeof parsed.createdAt !== 'string' ||
    typeof parsed.updatedAt !== 'string'
  ) {
    throw new Error('Invalid board format: missing or invalid required fields');
  }

  // Validate each node has at minimum an id and position
  for (const node of parsed.nodes) {
    if (
      typeof node.id !== 'string' ||
      typeof node.position !== 'object' ||
      typeof node.position.x !== 'number' ||
      typeof node.position.y !== 'number'
    ) {
      throw new Error(`Invalid node: ${JSON.stringify(node)}`);
    }
  }

  // Validate each edge has source and target
  for (const edge of parsed.edges) {
    if (
      typeof edge.id !== 'string' ||
      typeof edge.source !== 'string' ||
      typeof edge.target !== 'string'
    ) {
      throw new Error(`Invalid edge: ${JSON.stringify(edge)}`);
    }
  }

  return parsed as Board;
}
