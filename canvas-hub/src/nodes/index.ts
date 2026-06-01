import type { NodeTypes } from '@xyflow/react';
import { MindmapNode } from './MindmapNode';
import { StickyNoteNode } from './StickyNoteNode';
import { DocumentNode } from './DocumentNode';
import { ShapeNode } from './ShapeNode';

export const nodeTypes: NodeTypes = {
  mindmap: MindmapNode,
  sticky: StickyNoteNode,
  document: DocumentNode,
  shape: ShapeNode,
};
