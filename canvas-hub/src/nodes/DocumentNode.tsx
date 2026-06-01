import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Handle,
  Position,
  NodeResizer,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List } from 'lucide-react';
import type { DocumentNodeData } from '../types/board';
import { handleStyle, nodeBase, nodeSelected } from './nodeStyles';

/** Safely parse TipTap JSON content */
function parseContent(content: string) {
  if (!content) return undefined;
  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
}

function DocumentNodeComponent({ id, data, selected }: NodeProps<Node<DocumentNodeData>>) {
  const { title, content } = data as DocumentNodeData;
  const { updateNodeData } = useReactFlow();
  const [titleValue, setTitleValue] = useState(title);
  const isInternalUpdate = useRef(false);

  // Keep local title in sync with external data changes
  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start typing...' }),
    ],
    content: parseContent(content),
    onUpdate({ editor: ed }) {
      isInternalUpdate.current = true;
      const json = JSON.stringify(ed.getJSON());
      updateNodeData(id, { content: json });
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-gray-200',
      },
    },
  });

  // Sync external content changes into editor (e.g. undo/redo)
  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const parsed = parseContent(content);
    if (parsed) {
      const current = JSON.stringify(editor.getJSON());
      if (current !== content) {
        editor.commands.setContent(parsed, false);
      }
    }
  }, [content, editor]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitleValue(e.target.value);
    },
    [],
  );

  const commitTitle = useCallback(() => {
    if (titleValue !== title) {
      updateNodeData(id, { title: titleValue });
    }
  }, [id, title, titleValue, updateNodeData]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitTitle();
        editor?.commands.focus();
      }
    },
    [commitTitle, editor],
  );

  // Toolbar button helper
  const ToolbarBtn = useCallback(
    ({
      onClick,
      active,
      children,
      ariaLabel,
    }: {
      onClick: () => void;
      active: boolean;
      children: React.ReactNode;
      ariaLabel: string;
    }) => (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // prevent blur
          onClick();
        }}
        className={`p-1 rounded transition-colors ${
          active
            ? 'bg-indigo-500/40 text-indigo-300'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
        }`}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    ),
    [],
  );

  return (
    <div
      className={`
        ${nodeBase}
        ${selected ? nodeSelected : ''}
        bg-gray-900 border border-gray-700 flex flex-col overflow-hidden
      `}
      style={{ minWidth: 300, minHeight: 200 }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="!border-blue-400"
        handleClassName="!w-2.5 !h-2.5 !bg-blue-400 !border-blue-400"
      />

      {/* Handles */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800/60">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <input
          value={titleValue}
          onChange={handleTitleChange}
          onBlur={commitTitle}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled Document"
          className="flex-1 bg-transparent text-sm font-semibold text-gray-100
                     outline-none placeholder-gray-500 truncate"
        />
      </div>

      {/* Mini formatting toolbar */}
      {editor && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-700/60 bg-gray-800/40">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            ariaLabel="Bold"
          >
            <Bold size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            ariaLabel="Italic"
          >
            <Italic size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            ariaLabel="Heading"
          >
            <Heading2 size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            ariaLabel="Bullet list"
          >
            <List size={14} />
          </ToolbarBtn>
        </div>
      )}

      {/* Editor body */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export const DocumentNode = memo(DocumentNodeComponent);
