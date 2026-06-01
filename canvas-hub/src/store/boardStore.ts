import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type XYPosition,
} from '@xyflow/react';
import type {
  Board,
  CanvasNode,
  CanvasEdge,
  CanvasNodeData,
} from '../types/board';
import { db } from '../db';
import { boardsApi } from '../api/boardsApi';
import { newNodeId, newEdgeId, newBoardId } from '../utils/ids';

// ── Debounce helper ──

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(fn: () => void, ms = 500) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(fn, ms);
}

// ── Store types ──

interface BoardState {
  boards: Board[];
  currentBoardId: string | null;
  nodes: CanvasNode[];
  edges: CanvasEdge[];

  // Board CRUD
  loadBoards: () => Promise<void>;
  createBoard: (title: string) => Promise<string>;
  openBoard: (id: string) => Promise<void>;
  saveCurrentBoard: () => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;

  // React Flow callbacks
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  onConnect: OnConnect;

  // Node operations
  addNode: (type: string, position: XYPosition, data: CanvasNodeData) => void;
  updateNodeData: (nodeId: string, data: Partial<CanvasNodeData>) => void;
  removeSelectedNodes: () => void;

  // Direct setters
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;

  // Aliases for cross-component compatibility
  activeBoardId: string | null;
  setActiveBoard: (id: string) => Promise<void>;
  renameBoard: (id: string, title: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoardId: null,
  nodes: [],
  edges: [],

  // ── Board CRUD (API-first with Dexie fallback) ──

  loadBoards: async () => {
    try {
      const summaries = await boardsApi.listBoards();
      // Convert summaries to Board objects (without nodes/edges for listing)
      const boards: Board[] = summaries.map((s) => ({
        ...s,
        nodes: [],
        edges: [],
      }));
      // Sync to Dexie cache
      await db.boards.clear();
      for (const b of boards) {
        await db.boards.put(b);
      }
      set({ boards });
    } catch {
      // Offline fallback: load from Dexie
      const boards = await db.boards.orderBy('updatedAt').reverse().toArray();
      set({ boards });
    }
  },

  createBoard: async (title: string) => {
    try {
      const board = await boardsApi.createBoard(title);
      await db.boards.put(board);
      set((state) => ({
        boards: [board, ...state.boards],
        currentBoardId: board.id,
        activeBoardId: board.id,
        nodes: [],
        edges: [],
      }));
      return board.id;
    } catch {
      // Offline fallback
      const now = new Date().toISOString();
      const board: Board = {
        id: newBoardId(),
        title,
        nodes: [],
        edges: [],
        createdAt: now,
        updatedAt: now,
      };
      await db.boards.add(board);
      set((state) => ({
        boards: [board, ...state.boards],
        currentBoardId: board.id,
        activeBoardId: board.id,
        nodes: [],
        edges: [],
      }));
      return board.id;
    }
  },

  openBoard: async (id: string) => {
    try {
      const board = await boardsApi.getBoard(id);
      await db.boards.put(board);
      set({
        currentBoardId: board.id,
        activeBoardId: board.id,
        nodes: board.nodes as CanvasNode[],
        edges: board.edges as CanvasEdge[],
      });
    } catch {
      // Offline fallback
      const board = await db.boards.get(id);
      if (!board) return;
      set({
        currentBoardId: board.id,
        activeBoardId: board.id,
        nodes: board.nodes as CanvasNode[],
        edges: board.edges as CanvasEdge[],
      });
    }
  },

  saveCurrentBoard: async () => {
    const { currentBoardId, nodes, edges, boards } = get();
    if (!currentBoardId) return;

    const now = new Date().toISOString();

    // Save to Dexie (always, for offline cache)
    await db.boards.update(currentBoardId, {
      nodes,
      edges,
      updatedAt: now,
    });

    // Save to API (best effort)
    try {
      await boardsApi.updateBoard(currentBoardId, { nodes: nodes as Board['nodes'], edges: edges as Board['edges'] });
    } catch {
      // API save failed, data is still in Dexie
    }

    set({
      boards: boards.map((b) =>
        b.id === currentBoardId
          ? { ...b, nodes, edges, updatedAt: now }
          : b,
      ),
    });
  },

  deleteBoard: async (id: string) => {
    try {
      await boardsApi.deleteBoard(id);
    } catch {
      // Continue with local deletion even if API fails
    }
    await db.boards.delete(id);
    const { currentBoardId } = get();
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      ...(currentBoardId === id
        ? { currentBoardId: null, activeBoardId: null, nodes: [], edges: [] }
        : {}),
    }));
  },

  // ── React Flow callbacks ──

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
    debouncedSave(() => get().saveCurrentBoard());
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
    debouncedSave(() => get().saveCurrentBoard());
  },

  onConnect: (connection) => {
    const edge: CanvasEdge = {
      ...connection,
      id: newEdgeId(),
      type: 'floating',
      animated: true,
    };
    set((state) => ({
      edges: addEdge(edge, state.edges),
    }));
    debouncedSave(() => get().saveCurrentBoard());
  },

  // ── Node operations ──

  addNode: (type, position, data) => {
    const node: CanvasNode = {
      id: newNodeId(),
      type,
      position,
      data,
    };
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    debouncedSave(() => get().saveCurrentBoard());
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as CanvasNodeData } : n,
      ),
    }));
    debouncedSave(() => get().saveCurrentBoard());
  },

  removeSelectedNodes: () => {
    set((state) => {
      const selectedIds = new Set(
        state.nodes.filter((n) => n.selected).map((n) => n.id),
      );
      return {
        nodes: state.nodes.filter((n) => !n.selected),
        edges: state.edges.filter(
          (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target),
        ),
      };
    });
    debouncedSave(() => get().saveCurrentBoard());
  },

  // ── Direct setters ──

  setNodes: (nodes) => {
    set({ nodes });
    debouncedSave(() => get().saveCurrentBoard());
  },

  setEdges: (edges) => {
    set({ edges });
    debouncedSave(() => get().saveCurrentBoard());
  },

  // ── Aliases ──

  activeBoardId: null,

  setActiveBoard: async (id: string) => {
    await get().openBoard(id);
  },

  renameBoard: async (id: string, title: string) => {
    try {
      await boardsApi.updateBoard(id, { title });
    } catch {
      // Continue with local update
    }
    const now = new Date().toISOString();
    await db.boards.update(id, { title, updatedAt: now });
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, title, updatedAt: now } : b,
      ),
    }));
  },
}));
