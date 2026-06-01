import type { Node, Edge } from '@xyflow/react';

// ── Node category types ──

export type NodeCategory = 'mindmap' | 'sticky' | 'document' | 'shape';
export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';
export type ShapeVariant = 'rectangle' | 'circle' | 'diamond' | 'triangle';

// ── Node data interfaces ──

export type MindmapNodeData = {
  category: 'mindmap';
  label: string;
  collapsed?: boolean;
  [key: string]: unknown;
};

export type StickyNoteNodeData = {
  category: 'sticky';
  text: string;
  color: StickyColor;
  [key: string]: unknown;
};

export type DocumentNodeData = {
  category: 'document';
  title: string;
  content: string; // TipTap JSON serialized as string
  [key: string]: unknown;
};

export type ShapeNodeData = {
  category: 'shape';
  variant: ShapeVariant;
  label: string;
  fillColor: string;
  strokeColor: string;
  [key: string]: unknown;
};

export type CanvasNodeData =
  | MindmapNodeData
  | StickyNoteNodeData
  | DocumentNodeData
  | ShapeNodeData;

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

// ── Board persistence ──

export interface Board {
  id: string;
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: string;
  updatedAt: string;
}

// ── UI state types ──

export type ToolMode =
  | 'select'
  | 'pan'
  | 'mindmap'
  | 'sticky'
  | 'document'
  | 'shape'
  | 'edge';
