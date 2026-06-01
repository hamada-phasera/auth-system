import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface Board {
  id: string;
  title: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
}

function genId(): string {
  return 'board_' + Math.random().toString(36).slice(2, 12);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ?id=xxx for single board operations
  const boardId = req.query.id as string | undefined;

  try {
    // ── GET /api/boards ── list all boards
    // ── GET /api/boards?id=xxx ── get single board
    if (req.method === 'GET') {
      if (boardId) {
        const board = await kv.get<Board>(`board:${boardId}`);
        if (!board) return res.status(404).json({ error: 'Board not found' });
        return res.status(200).json(board);
      }
      const ids = await kv.zrange('boards:index', 0, -1, { rev: true });
      const boards = [];
      for (const id of ids) {
        const b = await kv.get<Board>(`board:${id}`);
        if (b) boards.push({ id: b.id, title: b.title, createdAt: b.createdAt, updatedAt: b.updatedAt });
      }
      return res.status(200).json(boards);
    }

    // ── POST /api/boards ── create new board
    if (req.method === 'POST') {
      const { title } = req.body as { title: string };
      if (!title) return res.status(400).json({ error: 'title is required' });
      const now = new Date().toISOString();
      const board: Board = { id: genId(), title, nodes: [], edges: [], createdAt: now, updatedAt: now };
      await kv.set(`board:${board.id}`, board);
      await kv.zadd('boards:index', { score: Date.parse(now), member: board.id });
      return res.status(201).json(board);
    }

    // ── PUT /api/boards?id=xxx ── update board
    if (req.method === 'PUT') {
      if (!boardId) return res.status(400).json({ error: 'id query param required' });
      const existing = await kv.get<Board>(`board:${boardId}`);
      if (!existing) return res.status(404).json({ error: 'Board not found' });
      const { title, nodes, edges } = req.body as Partial<Board>;
      const now = new Date().toISOString();
      const updated: Board = {
        ...existing,
        title: title ?? existing.title,
        nodes: nodes ?? existing.nodes,
        edges: edges ?? existing.edges,
        updatedAt: now,
      };
      await kv.set(`board:${boardId}`, updated);
      await kv.zadd('boards:index', { score: Date.parse(now), member: boardId });
      return res.status(200).json(updated);
    }

    // ── DELETE /api/boards?id=xxx ── delete board
    if (req.method === 'DELETE') {
      if (!boardId) return res.status(400).json({ error: 'id query param required' });
      await kv.del(`board:${boardId}`);
      await kv.zrem('boards:index', boardId);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
}
