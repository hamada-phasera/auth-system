// Shared types for canvas-hub (used by frontend, API routes, and MCP server)

export type NodeCategory = 'mindmap' | 'sticky' | 'document' | 'shape';
export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';
export type ShapeVariant = 'rectangle' | 'circle' | 'diamond' | 'triangle';
export type ToolMode = 'select' | 'pan' | 'mindmap' | 'sticky' | 'document' | 'shape' | 'edge';

export interface MindmapNodeData {
  category: 'mindmap';
  label: string;
  collapsed?: boolean;
  [key: string]: unknown;
}

export interface StickyNoteNodeData {
  category: 'sticky';
  text: string;
  color: StickyColor;
  [key: string]: unknown;
}

export interface DocumentNodeData {
  category: 'document';
  title: string;
  content: string;
  [key: string]: unknown;
}

export interface ShapeNodeData {
  category: 'shape';
  variant: ShapeVariant;
  label: string;
  fillColor: string;
  strokeColor: string;
  [key: string]: unknown;
}

export type CanvasNodeData =
  | MindmapNodeData
  | StickyNoteNodeData
  | DocumentNodeData
  | ShapeNodeData;

export interface CanvasNodePosition {
  x: number;
  y: number;
}

export interface SerializedNode {
  id: string;
  type: string;
  position: CanvasNodePosition;
  data: CanvasNodeData;
  width?: number;
  height?: number;
  selected?: boolean;
  [key: string]: unknown;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  [key: string]: unknown;
}

export interface Board {
  id: string;
  title: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
