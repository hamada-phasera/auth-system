import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  GitBranch,
  StickyNote,
  FileText,
  Square,
  Minus,
  Undo2,
  Redo2,
  LayoutGrid,
  Download,
  Circle,
  Diamond,
  Triangle,
  ChevronDown,
} from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import type { ToolMode, StickyColor, ShapeVariant } from '../types/board';

interface ToolButton {
  mode: ToolMode;
  icon: React.ReactNode;
  label: string;
}

const TOOLS: ToolButton[] = [
  { mode: 'select', icon: <MousePointer2 size={18} />, label: 'Select (V)' },
  { mode: 'pan', icon: <Hand size={18} />, label: 'Pan (H)' },
  { mode: 'mindmap', icon: <GitBranch size={18} />, label: 'Mindmap (M)' },
  { mode: 'sticky', icon: <StickyNote size={18} />, label: 'Sticky Note (S)' },
  { mode: 'document', icon: <FileText size={18} />, label: 'Document (D)' },
  { mode: 'shape', icon: <Square size={18} />, label: 'Shape (R)' },
  { mode: 'edge', icon: <Minus size={18} />, label: 'Edge Connector (E)' },
];

const STICKY_COLORS: { color: StickyColor; hex: string }[] = [
  { color: 'yellow', hex: '#fbbf24' },
  { color: 'pink', hex: '#f472b6' },
  { color: 'blue', hex: '#60a5fa' },
  { color: 'green', hex: '#34d399' },
  { color: 'purple', hex: '#a78bfa' },
  { color: 'orange', hex: '#fb923c' },
];

const SHAPE_VARIANTS: { variant: ShapeVariant; icon: React.ReactNode; label: string }[] = [
  { variant: 'rectangle', icon: <Square size={16} />, label: 'Rectangle' },
  { variant: 'circle', icon: <Circle size={16} />, label: 'Circle' },
  { variant: 'diamond', icon: <Diamond size={16} />, label: 'Diamond' },
  { variant: 'triangle', icon: <Triangle size={16} />, label: 'Triangle' },
];

interface ToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout?: () => void;
}

export default function Toolbar({ onUndo, onRedo, onAutoLayout }: ToolbarProps) {
  const activeTool = useUiStore((s) => s.activeTool);
  const setTool = useUiStore((s) => s.setTool);
  const stickyColor = useUiStore((s) => s.stickyColor);
  const setStickyColor = useUiStore((s) => s.setStickyColor);
  const shapeVariant = useUiStore((s) => s.shapeVariant);
  const setShapeVariant = useUiStore((s) => s.setShapeVariant);
  const setExportDialogOpen = useUiStore((s) => s.setExportDialogOpen);

  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close shape dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShapeDropdownOpen(false);
      }
    }
    if (shapeDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [shapeDropdownOpen]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {/* Main toolbar row */}
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-xl backdrop-blur-md"
        style={{ background: 'rgba(30, 30, 60, 0.95)' }}
      >
        {/* Tool buttons */}
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.mode;
          const isShape = tool.mode === 'shape';

          return (
            <div key={tool.mode} className="relative" ref={isShape ? dropdownRef : undefined}>
              <button
                className={`
                  flex items-center gap-1 rounded-lg p-2 transition-colors duration-150
                  ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/10'}
                `}
                onClick={() => {
                  setTool(tool.mode);
                  if (isShape) setShapeDropdownOpen((prev) => !prev);
                }}
                title={tool.label}
              >
                {tool.icon}
                {isShape && (
                  <ChevronDown size={12} className="ml-0.5 opacity-60" />
                )}
              </button>

              {/* Shape variant dropdown */}
              {isShape && shapeDropdownOpen && (
                <div
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-lg p-2 flex flex-col gap-1 min-w-[140px]"
                  style={{ background: 'rgba(30, 30, 60, 0.98)' }}
                >
                  {SHAPE_VARIANTS.map((sv) => (
                    <button
                      key={sv.variant}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                        ${shapeVariant === sv.variant
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-300 hover:bg-white/10'}
                      `}
                      onClick={() => {
                        setShapeVariant(sv.variant);
                        setShapeDropdownOpen(false);
                      }}
                    >
                      {sv.icon}
                      {sv.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Undo / Redo */}
        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
          onClick={onUndo}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
          onClick={onRedo}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* Auto-layout */}
        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
          onClick={onAutoLayout}
          title="Auto Layout"
        >
          <LayoutGrid size={18} />
        </button>

        {/* Export */}
        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
          onClick={() => setExportDialogOpen(true)}
          title="Export (Cmd+E)"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Sticky color picker (shown when sticky tool is active) */}
      {activeTool === 'sticky' && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md"
          style={{ background: 'rgba(30, 30, 60, 0.95)' }}
        >
          {STICKY_COLORS.map((sc) => (
            <button
              key={sc.color}
              className={`
                w-6 h-6 rounded-full transition-transform duration-150
                ${stickyColor === sc.color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e1e3c] scale-110' : 'hover:scale-110'}
              `}
              style={{ backgroundColor: sc.hex }}
              onClick={() => setStickyColor(sc.color)}
              title={sc.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
