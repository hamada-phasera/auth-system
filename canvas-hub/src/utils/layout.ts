import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled';
import type { CanvasNode, CanvasEdge } from '../types/board';

const elk = new ELK();

export type LayoutDirection = 'RIGHT' | 'DOWN';

/**
 * Compute a tree layout using the ELK layered algorithm.
 * Returns a new array of nodes with updated positions.
 */
export async function computeTreeLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  direction: LayoutDirection = 'RIGHT',
): Promise<CanvasNode[]> {
  if (nodes.length === 0) return [];

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '100',
      'elk.layered.spacing.nodeNodeBetweenLayers': '200',
      'elk.layered.spacing.edgeNodeBetweenLayers': '50',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.measured?.width ?? node.width ?? 200,
      height: node.measured?.height ?? node.height ?? 80,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutResult = await elk.layout(graph);

  const positionMap = new Map<string, { x: number; y: number }>();
  for (const child of layoutResult.children ?? []) {
    positionMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  return nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: pos,
    };
  });
}
