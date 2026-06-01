import React from 'react';
import { MiniMap as ReactFlowMiniMap } from '@xyflow/react';

/**
 * Custom node color function based on node type/category.
 */
function nodeColor(node: { type?: string; data?: { category?: string } }): string {
  const category = node.data?.category ?? node.type;

  switch (category) {
    case 'mindmap':
      return '#818cf8'; // indigo
    case 'sticky':
      return '#fbbf24'; // amber
    case 'document':
      return '#f8fafc'; // white
    case 'shape':
      return '#34d399'; // emerald
    default:
      return '#94a3b8'; // slate-400 fallback
  }
}

export default function MiniMap() {
  return (
    <ReactFlowMiniMap
      nodeColor={nodeColor}
      maskColor="rgba(22, 22, 48, 0.7)"
      style={{
        bottom: 80,
        right: 16,
        width: 160,
        height: 100,
        backgroundColor: 'rgba(30, 30, 60, 0.9)',
        borderRadius: 8,
        border: '1px solid #3a3a6a',
      }}
      pannable
      zoomable
    />
  );
}
