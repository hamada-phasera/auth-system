import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Handle,
  Position,
  NodeResizer,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import type { ShapeNodeData } from '../types/board';
import { handleStyle, nodeSelected } from './nodeStyles';

const DEFAULT_SIZE = 120;

function renderShape(
  variant: string,
  w: number,
  h: number,
  fill: string,
  stroke: string,
) {
  const strokeWidth = 2;

  switch (variant) {
    case 'circle':
      return (
        <ellipse
          cx={w / 2}
          cy={h / 2}
          rx={w / 2 - strokeWidth}
          ry={h / 2 - strokeWidth}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'diamond': {
      const mx = w / 2;
      const my = h / 2;
      const inset = strokeWidth;
      const points = `${mx},${inset} ${w - inset},${my} ${mx},${h - inset} ${inset},${my}`;
      return (
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    case 'triangle': {
      const inset = strokeWidth;
      const points = `${w / 2},${inset} ${w - inset},${h - inset} ${inset},${h - inset}`;
      return (
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    case 'rectangle':
    default:
      return (
        <rect
          x={strokeWidth}
          y={strokeWidth}
          width={w - strokeWidth * 2}
          height={h - strokeWidth * 2}
          rx={8}
          ry={8}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
}

function ShapeNodeComponent({ id, data, selected }: NodeProps<Node<ShapeNodeData>>) {
  const { variant, label, fillColor, strokeColor } = data as ShapeNodeData;
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
  }, []);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed !== label) {
      updateNodeData(id, { label: trimmed || label });
    }
  }, [editValue, id, label, updateNodeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit();
      } else if (e.key === 'Escape') {
        setEditValue(label);
        setEditing(false);
      }
    },
    [commitEdit, label],
  );

  return (
    <div
      className={`relative ${selected ? nodeSelected : ''}`}
      style={{ width: DEFAULT_SIZE, height: DEFAULT_SIZE }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        lineClassName="!border-blue-400"
        handleClassName="!w-2.5 !h-2.5 !bg-blue-400 !border-blue-400"
      />

      {/* Handles on all 4 sides */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* SVG shape */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`}
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        {renderShape(variant, DEFAULT_SIZE, DEFAULT_SIZE, fillColor, strokeColor)}
      </svg>

      {/* Centered label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="pointer-events-auto bg-black/30 text-white text-xs text-center
                       rounded px-1.5 py-0.5 outline-none border border-white/30
                       focus:border-white/60 w-3/4"
          />
        ) : (
          <span className="text-xs font-medium text-white drop-shadow-md select-none truncate px-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export const ShapeNode = memo(ShapeNodeComponent);
