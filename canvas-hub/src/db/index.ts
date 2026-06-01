import Dexie, { type EntityTable } from 'dexie';
import type { Board } from '../types/board';

const db = new Dexie('canvas-hub-db') as Dexie & {
  boards: EntityTable<Board, 'id'>;
};

db.version(1).stores({
  boards: 'id, title, updatedAt',
});

export { db };
