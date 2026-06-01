// ── Node category types (mirrored from main app) ──

export type NodeCategory = 'mindmap' | 'sticky' | 'document' | 'shape';
export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';
export type ShapeVariant = 'rectangle' | 'circle' | 'diamond' | 'triangle';

// ── Node data interfaces ──

export interface MindmapNodeData {
  category: 'mindmap';
  label: string;
  collapsed?: boolean;
}

export interface StickyNoteNodeData {
  category: 'sticky';
  text: string;
  color: StickyColor;
}

export interface DocumentNodeData {
  category: 'document';
  title: string;
  content: string;
}

export interface ShapeNodeData {
  category: 'shape';
  variant: ShapeVariant;
  label: string;
  fillColor: string;
  strokeColor: string;
}

export type CanvasNodeData =
  | MindmapNodeData
  | StickyNoteNodeData
  | DocumentNodeData
  | ShapeNodeData;

// ── Canvas node (standalone, no @xyflow/react dependency) ──

export interface CanvasNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: CanvasNodeData;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

// ── Canvas edge ──

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  [key: string]: unknown;
}

// ── Board persistence ──

export interface Board {
  id: string;
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: string;
  updatedAt: string;
}

// ── Storage file shape ──

export interface StorageData {
  boards: Board[];
}
