import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString();
}

function EditableTitle({
  title,
  onSave,
}: {
  title: string;
  onSave: (newTitle: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <span
        className="text-sm font-medium text-slate-100 truncate cursor-text"
        onDoubleClick={() => {
          setValue(title);
          setEditing(true);
        }}
      >
        {title}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      className="text-sm font-medium text-slate-100 bg-transparent border-b border-indigo-400 outline-none w-full"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (value.trim() && value !== title) {
          onSave(value.trim());
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setEditing(false);
          if (value.trim() && value !== title) {
            onSave(value.trim());
          }
        }
        if (e.key === 'Escape') {
          setEditing(false);
          setValue(title);
        }
      }}
    />
  );
}

export default function BoardList() {
  const boards = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const createBoard = useBoardStore((s) => s.createBoard);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const setActiveBoard = useBoardStore((s) => s.setActiveBoard);
  const renameBoard = useBoardStore((s) => s.renameBoard);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      {/* New board button */}
      <button
        className="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        onClick={() => createBoard('Untitled Board')}
      >
        <Plus size={16} />
        New Board
      </button>

      {/* Board entries */}
      {boards.length === 0 ? (
        <div className="px-4 py-8 text-center text-slate-500 text-sm">
          No boards yet. Create your first board to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-2 py-1">
          {boards.map((board) => {
            const isActive = board.id === activeBoardId;
            const isHovered = hoveredId === board.id;

            return (
              <div
                key={board.id}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                  ${isActive ? 'bg-indigo-500/20 border border-indigo-500/40' : 'hover:bg-white/5 border border-transparent'}
                `}
                onClick={() => setActiveBoard(board.id)}
                onMouseEnter={() => setHoveredId(board.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <EditableTitle
                    title={board.title}
                    onSave={(newTitle) => renameBoard(board.id, newTitle)}
                  />
                  <span className="text-xs text-slate-500">
                    {formatRelativeTime(board.updatedAt)}
                  </span>
                </div>

                {/* Delete button (shown on hover) */}
                {isHovered && (
                  <button
                    className="ml-2 p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBoard(board.id);
                    }}
                    title="Delete board"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
