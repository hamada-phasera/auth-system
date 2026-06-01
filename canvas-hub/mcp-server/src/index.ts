#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { apiFetch } from './apiClient.js';

// Types for API responses
interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Board {
  id: string;
  title: string;
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string }>;
  createdAt: string;
  updatedAt: string;
}

// ── Server Setup ──

const server = new Server(
  {
    name: 'canvas-hub-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// ── Tool Definitions ──

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_board',
      description: 'Create a new canvas board',
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'Title of the new board' },
        },
        required: ['title'],
      },
    },
    {
      name: 'list_boards',
      description: 'List all boards with id, title, and updatedAt',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'get_board',
      description: 'Get full board data by id',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'delete_board',
      description: 'Delete a board by id',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID to delete' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'add_node',
      description: 'Add a node to a board',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          type: {
            type: 'string',
            description: 'Node type: mindmap, sticky, document, or shape',
          },
          position: {
            type: 'object',
            properties: { x: { type: 'number' }, y: { type: 'number' } },
            required: ['x', 'y'],
          },
          data: {
            type: 'object',
            description:
              'Node data. Must include "category" matching type. For mindmap: {category, label}. For sticky: {category, text, color}. For document: {category, title, content}. For shape: {category, variant, label, fillColor, strokeColor}.',
          },
        },
        required: ['boardId', 'type', 'position', 'data'],
      },
    },
    {
      name: 'update_node',
      description: 'Update node data on a board',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          nodeId: { type: 'string', description: 'Node ID' },
          data: { type: 'object', description: 'Partial data to merge' },
        },
        required: ['boardId', 'nodeId', 'data'],
      },
    },
    {
      name: 'delete_node',
      description: 'Delete a node from a board (also removes connected edges)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          nodeId: { type: 'string', description: 'Node ID to delete' },
        },
        required: ['boardId', 'nodeId'],
      },
    },
    {
      name: 'add_edge',
      description: 'Add an edge between two nodes on a board',
      inputSchema: {
        type: 'object' as const,
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          source: { type: 'string', description: 'Source node ID' },
          target: { type: 'string', description: 'Target node ID' },
        },
        required: ['boardId', 'source', 'target'],
      },
    },
  ],
}));

// ── Tool Handlers (all via HTTP API) ──

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_board': {
        const { title } = args as { title: string };
        const board = await apiFetch<Board>('/boards', {
          method: 'POST',
          body: JSON.stringify({ title }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ id: board.id, title: board.title }, null, 2) }],
        };
      }

      case 'list_boards': {
        const boards = await apiFetch<BoardSummary[]>('/boards');
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(boards, null, 2) }],
        };
      }

      case 'get_board': {
        const { boardId } = args as { boardId: string };
        const board = await apiFetch<Board>(`/boards/${boardId}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(board, null, 2) }],
        };
      }

      case 'delete_board': {
        const { boardId } = args as { boardId: string };
        await apiFetch(`/boards/${boardId}`, { method: 'DELETE' });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ deleted: boardId }) }],
        };
      }

      case 'add_node': {
        const { boardId, type, position, data } = args as {
          boardId: string; type: string; position: { x: number; y: number }; data: Record<string, unknown>;
        };
        const node = await apiFetch<{ id: string }>(`/boards/${boardId}/nodes`, {
          method: 'POST',
          body: JSON.stringify({ type, position, data }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ id: node.id, type }, null, 2) }],
        };
      }

      case 'update_node': {
        const { boardId, nodeId, data } = args as { boardId: string; nodeId: string; data: Record<string, unknown> };
        await apiFetch(`/boards/${boardId}/nodes/${nodeId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ updated: nodeId }) }],
        };
      }

      case 'delete_node': {
        const { boardId, nodeId } = args as { boardId: string; nodeId: string };
        await apiFetch(`/boards/${boardId}/nodes/${nodeId}`, { method: 'DELETE' });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ deleted: nodeId }) }],
        };
      }

      case 'add_edge': {
        const { boardId, source, target } = args as { boardId: string; source: string; target: string };
        const edge = await apiFetch<{ id: string }>(`/boards/${boardId}/edges`, {
          method: 'POST',
          body: JSON.stringify({ source, target }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ id: edge.id, source, target }, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text' as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ── Resource Definitions ──

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const boards = await apiFetch<BoardSummary[]>('/boards');
    return {
      resources: boards.map((b) => ({
        uri: `board://${b.id}`,
        name: b.title,
        description: `Canvas board: ${b.title}`,
        mimeType: 'application/json',
      })),
    };
  } catch {
    return { resources: [] };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const match = uri.match(/^board:\/\/(.+)$/);
  if (!match) throw new Error(`Invalid resource URI: ${uri}`);

  const board = await apiFetch<Board>(`/boards/${match[1]}`);
  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(board, null, 2),
    }],
  };
});

// ── Start Server ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Canvas Hub MCP server running on stdio (API mode)');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
