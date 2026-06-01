import { nanoid } from 'nanoid';

export const newNodeId = () => `node_${nanoid(10)}`;
export const newEdgeId = () => `edge_${nanoid(10)}`;
export const newBoardId = () => `board_${nanoid(10)}`;
