import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { ChevronRight } from 'lucide-react';
import type { MindmapNodeData } from '../types/board';
import { handleStyle, nodeBase, nodeSelected } from './nodeStyles';

function MindmapNodeComponent({ id, data, selected }: NodeProps<Node<MindmapNodeData>>) {
  const { label, collapsed } = data as MindmapNodeData;
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
    if (trimmed && trimmed !== label) {
      updateNodeData(id, { label: trimmed });
    } else {
      setEditValue(label);
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

  const toggleCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateNodeData(id, { collapsed: !collapsed });
    },
    [id, collapsed, updateNodeData],
  );

  return (
    <div
      className={`
        ${nodeBase}
        ${selected ? nodeSelected : ''}
        flex items-center gap-1.5 px-4 py-2
        rounded-full bg-gradient-to-r from-indigo-600 to-purple-700
        text-white cursor-pointer select-none min-w-[100px]
      `}
      onDoubleClick={handleDoubleClick}
    >
      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        className="!-left-1"
      />

      {/* Label / edit input */}
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="bg-white/20 text-white text-sm rounded px-1.5 py-0.5 outline-none
                     border border-white/30 focus:border-white/60 w-full min-w-[60px]"
        />
      ) : (
        <span className="text-sm font-medium truncate max-w-[200px]">{label}</span>
      )}

      {/* Collapse / expand toggle */}
      <button
        onClick={toggleCollapse}
        className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors flex-shrink-0"
        title={collapsed ? 'Expand children' : 'Collapse children'}
      >
        <ChevronRight
          size={14}
          className={`transition-transform duration-200 ${
            collapsed ? '' : 'rotate-90'
          }`}
        />
      </button>

      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        className="!-right-1"
      />
    </div>
  );
}

export const MindmapNode = memo(MindmapNodeComponent);
