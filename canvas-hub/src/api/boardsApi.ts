import type { Board } from '../types/board';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const boardsApi = {
  listBoards(): Promise<BoardSummary[]> {
    return apiFetch(`${API_BASE}/boards`);
  },

  getBoard(id: string): Promise<Board> {
    return apiFetch(`${API_BASE}/boards?id=${id}`);
  },

  createBoard(title: string): Promise<Board> {
    return apiFetch(`${API_BASE}/boards`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  updateBoard(id: string, data: Partial<Pick<Board, 'title' | 'nodes' | 'edges'>>): Promise<Board> {
    return apiFetch(`${API_BASE}/boards?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBoard(id: string): Promise<void> {
    return apiFetch(`${API_BASE}/boards?id=${id}`, { method: 'DELETE' });
  },
};
