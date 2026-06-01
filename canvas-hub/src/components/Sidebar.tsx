import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import BoardList from './BoardList';

export default function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <>
      {/* Hamburger button to open sidebar (visible when closed) */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 rounded-lg p-2 text-slate-300 hover:bg-white/10 transition-colors backdrop-blur-md"
          style={{ background: 'rgba(30, 30, 60, 0.95)' }}
          onClick={toggleSidebar}
          title="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed top-0 left-0 z-50 h-full flex flex-col"
              style={{
                width: 280,
                background: 'rgba(22, 22, 48, 0.98)',
                borderRight: '1px solid #3a3a6a',
              }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-slate-100">Boards</h2>
                <button
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 transition-colors"
                  onClick={toggleSidebar}
                  title="Close sidebar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Board list */}
              <div className="flex-1 overflow-y-auto">
                <BoardList />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
