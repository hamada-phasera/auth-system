import type { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { kv } from '@vercel/kv';
import { z } from 'zod';

// ── Types ──

interface Board {
  id: string;
  title: string;
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string; type?: string; animated?: boolean }>;
  createdAt: string;
  updatedAt: string;
}

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

// ── Create MCP Server with all tools ──

function createServer(): McpServer {
  const server = new McpServer(
    { name: 'canvas-hub-mcp', version: '0.2.0' },
    { capabilities: { tools: {} } },
  );

  // ── create_board ──
  server.tool(
    'create_board',
    'Create a new canvas board',
    { title: z.string().describe('Title of the new board') },
    async ({ title }) => {
      const now = new Date().toISOString();
      const board: Board = { id: genId('board'), title, nodes: [], edges: [], createdAt: now, updatedAt: now };
      await kv.set(`board:${board.id}`, board);
      await kv.zadd('boards:index', { score: Date.parse(now), member: board.id });
      return { content: [{ type: 'text', text: JSON.stringify({ id: board.id, title: board.title }, null, 2) }] };
    },
  );

  // ── list_boards ──
  server.tool(
    'list_boards',
    'List all boards',
    {},
    async () => {
      const ids = await kv.zrange('boards:index', 0, -1, { rev: true });
      const boards = [];
      for (const id of ids) {
        const b = await kv.get<Board>(`board:${id}`);
        if (b) boards.push({ id: b.id, title: b.title, updatedAt: b.updatedAt });
      }
      return { content: [{ type: 'text', text: JSON.stringify(boards, null, 2) }] };
    },
  );

  // ── get_board ──
  server.tool(
    'get_board',
    'Get full board data by id',
    { boardId: z.string().describe('Board ID') },
    async ({ boardId }) => {
      const board = await kv.get<Board>(`board:${boardId}`);
      if (!board) return { content: [{ type: 'text', text: `Error: Board not found: ${boardId}` }], isError: true };
      return { content: [{ type: 'text', text: JSON.stringify(board, null, 2) }] };
    },
  );

  // ── delete_board ──
  server.tool(
    'delete_board',
    'Delete a board by id',
    { boardId: z.string().describe('Board ID to delete') },
    async ({ boardId }) => {
      await kv.del(`board:${boardId}`);
      await kv.zrem('boards:index', boardId);
      return { content: [{ type: 'text', text: JSON.stringify({ deleted: boardId }) }] };
    },
  );

  // ── add_node ──
  server.tool(
    'add_node',
    'Add a node to a board. Types: mindmap, sticky, document, shape',
    {
      boardId: z.string().describe('Board ID'),
      type: z.string().describe('Node type: mindmap, sticky, document, or shape'),
      position: z.object({ x: z.number(), y: z.number() }).describe('Position on canvas'),
      data: z.record(z.string(), z.unknown()).describe('Node data. Must include "category" matching type. For mindmap: {category, label}. For sticky: {category, text, color}. For document: {category, title, content}. For shape: {category, variant, label, fillColor, strokeColor}.'),
    },
    async ({ boardId, type, position, data }) => {
      const board = await kv.get<Board>(`board:${boardId}`);
      if (!board) return { content: [{ type: 'text', text: `Error: Board not found` }], isError: true };
      const node = { id: genId('node'), type, position, data };
      board.nodes.push(node);
      board.updatedAt = new Date().toISOString();
      await kv.set(`board:${boardId}`, board);
      await kv.zadd('boards:index', { score: Date.parse(board.updatedAt), member: boardId });
      return { content: [{ type: 'text', text: JSON.stringify({ id: node.id, type }, null, 2) }] };
    },
  );

  // ── update_node ──
  server.tool(
    'update_node',
    'Update node data on a board',
    {
      boardId: z.string().describe('Board ID'),
      nodeId: z.string().describe('Node ID'),
      data: z.record(z.string(), z.unknown()).describe('Partial data to merge into node'),
    },
    async ({ boardId, nodeId, data }) => {
      const board = await kv.get<Board>(`board:${boardId}`);
      if (!board) return { content: [{ type: 'text', text: `Error: Board not found` }], isError: true };
      const idx = board.nodes.findIndex((n) => n.id === nodeId);
      if (idx === -1) return { content: [{ type: 'text', text: `Error: Node not found` }], isError: true };
      board.nodes[idx] = { ...board.nodes[idx], data: { ...board.nodes[idx].data, ...data } };
      board.updatedAt = new Date().toISOString();
      await kv.set(`board:${boardId}`, board);
      return { content: [{ type: 'text', text: JSON.stringify({ updated: nodeId }) }] };
    },
  );

  // ── delete_node ──
  server.tool(
    'delete_node',
    'Delete a node from a board (also removes connected edges)',
    {
      boardId: z.string().describe('Board ID'),
      nodeId: z.string().describe('Node ID to delete'),
    },
    async ({ boardId, nodeId }) => {
      const board = await kv.get<Board>(`board:${boardId}`);
      if (!board) return { content: [{ type: 'text', text: `Error: Board not found` }], isError: true };
      board.nodes = board.nodes.filter((n) => n.id !== nodeId);
      board.edges = board.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      board.updatedAt = new Date().toISOString();
      await kv.set(`board:${boardId}`, board);
      return { content: [{ type: 'text', text: JSON.stringify({ deleted: nodeId }) }] };
    },
  );

  // ── add_edge ──
  server.tool(
    'add_edge',
    'Add an edge between two nodes on a board',
    {
      boardId: z.string().describe('Board ID'),
      source: z.string().describe('Source node ID'),
      target: z.string().describe('Target node ID'),
    },
    async ({ boardId, source, target }) => {
      const board = await kv.get<Board>(`board:${boardId}`);
      if (!board) return { content: [{ type: 'text', text: `Error: Board not found` }], isError: true };
      const edge = { id: genId('edge'), source, target, type: 'floating', animated: true };
      board.edges.push(edge);
      board.updatedAt = new Date().toISOString();
      await kv.set(`board:${boardId}`, board);
      await kv.zadd('boards:index', { score: Date.parse(board.updatedAt), member: boardId });
      return { content: [{ type: 'text', text: JSON.stringify({ id: edge.id, source, target }, null, 2) }] };
    },
  );

  return server;
}

// ── Vercel Serverless Handler ──

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id');
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For DELETE requests (session termination in stateless mode), just return 200
  if (req.method === 'DELETE') {
    return res.status(200).end();
  }

  // For GET requests (SSE stream), not supported in stateless serverless
  if (req.method === 'GET') {
    return res.status(405).json({ error: 'SSE stream not supported in serverless mode. Use POST.' });
  }

  // POST: handle MCP JSON-RPC request
  if (req.method === 'POST') {
    try {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless mode
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } catch (err) {
      console.error('MCP handler error:', err);
      if (!res.headersSent) {
        return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
