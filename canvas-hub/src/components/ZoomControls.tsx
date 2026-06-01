import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useReactFlow, useViewport } from '@xyflow/react';

export default function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-1 rounded-xl p-1.5 backdrop-blur-md"
      style={{ background: 'rgba(30, 30, 60, 0.95)' }}
    >
      <button
        className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <ZoomIn size={18} />
      </button>

      {/* Zoom percentage display */}
      <span className="text-xs text-slate-400 font-mono py-1 select-none">
        {zoomPercent}%
      </span>

      <button
        className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>

      <div className="w-6 h-px bg-slate-600 my-0.5" />

      <button
        className="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors duration-150"
        onClick={() => fitView({ padding: 0.2 })}
        title="Fit View"
      >
        <Maximize size={18} />
      </button>
    </div>
  );
}
