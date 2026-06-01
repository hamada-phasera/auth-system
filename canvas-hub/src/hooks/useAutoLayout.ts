import { useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';
import { computeTreeLayout, type LayoutDirection } from '../utils/layout';

/**
 * Hook that provides an auto-layout function for the current canvas.
 * Uses the ELK layered algorithm to arrange nodes in a tree.
 */
export function useAutoLayout() {
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const setNodes = useBoardStore((s) => s.setNodes);

  const autoLayout = useCallback(
    async (direction: LayoutDirection = 'RIGHT') => {
      if (nodes.length === 0) return;
      const layoutedNodes = await computeTreeLayout(nodes, edges, direction);
      setNodes(layoutedNodes);
    },
    [nodes, edges, setNodes],
  );

  return { autoLayout };
}
