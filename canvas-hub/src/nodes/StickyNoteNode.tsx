import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Handle,
  Position,
  NodeResizer,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import type { StickyNoteNodeData } from '../types/board';
import { handleStyle, STICKY_COLORS } from './nodeStyles';

/** Derive a deterministic small rotation from the node id */
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  // Map to range -1 to 2 degrees
  return -1 + (((hash % 300) + 300) % 300) / 100;
}

function StickyNoteNodeComponent({ id, data, selected }: NodeProps<Node<StickyNoteNodeData>>) {
  const { text, color } = data as StickyNoteNodeData;
  const { updateNodeData } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rotation = getRotation(id);
  const colorScheme = STICKY_COLORS[color] ?? STICKY_COLORS.yellow;

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
    },
    [id, updateNodeData],
  );

  return (
    <div
      className={`
        ${colorScheme.bg} ${colorScheme.text}
        shadow-md rounded-sm
        ${selected ? 'ring-2 ring-blue-400 shadow-blue-400/20' : ''}
      `}
      style={{
        minWidth: 180,
        minHeight: 180,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={180}
        lineClassName="!border-blue-400"
        handleClassName="!w-2.5 !h-2.5 !bg-blue-400 !border-blue-400"
      />

      {/* Handles on all 4 sides */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* Faux fold at top-right */}
      <div className="absolute top-0 right-0 w-5 h-5 overflow-hidden">
        <div
          className="absolute -top-[10px] -right-[10px] w-5 h-5 bg-black/10 rotate-45 origin-bottom-left"
        />
      </div>

      {/* Editable text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onInput={autoResize}
        placeholder="Type a note..."
        className={`
          w-full h-full p-3 pt-4 resize-none bg-transparent outline-none
          text-sm font-medium leading-relaxed placeholder-gray-500/50
          ${colorScheme.text}
        `}
        style={{ minHeight: 140 }}
      />
    </div>
  );
}

export const StickyNoteNode = memo(StickyNoteNodeComponent);
