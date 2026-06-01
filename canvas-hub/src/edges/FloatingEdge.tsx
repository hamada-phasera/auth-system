import React, { useState } from 'react';
import {
  getBezierPath,
  BaseEdge,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { useBoardStore } from '../store/boardStore';

export function FloatingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps<Edge>) {
  const [hovered, setHovered] = useState(false);
  const setEdges = useBoardStore((s) => s.setEdges);
  const edges = useBoardStore((s) => s.edges);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges(edges.filter((edge) => edge.id !== id));
  };

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: 'rgba(147, 197, 253, 0.6)',
          strokeWidth: 2,
          ...style,
        }}
      />
      {/* Invisible wider path for easier hover targeting */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && (
        <foreignObject
          width={24}
          height={24}
          x={labelX - 12}
          y={labelY - 12}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold shadow-md cursor-pointer border-none"
            onClick={handleDelete}
            title="Delete edge"
          >
            X
          </button>
        </foreignObject>
      )}
    </g>
  );
}
