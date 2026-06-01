import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useReactFlow,
  type XYPosition,
} from '@xyflow/react';
import ZoomControls from './ZoomControls';
import { useBoardStore } from '../store/boardStore';
import { useUiStore } from '../store/uiStore';
import { edgeTypes } from '../edges';
import { nodeTypes } from '../nodes';
import type {
  CanvasNodeData,
  MindmapNodeData,
  StickyNoteNodeData,
  DocumentNodeData,
  ShapeNodeData,
  NodeCategory,
} from '../types/board';

// ── Default data factories for each node category ──

function defaultNodeData(category: NodeCategory): CanvasNodeData {
  switch (category) {
    case 'mindmap':
      return { category: 'mindmap', label: 'New idea' } satisfies MindmapNodeData;
    case 'sticky':
      return { category: 'sticky', text: '', color: 'yellow' } satisfies StickyNoteNodeData;
    case 'document':
      return { category: 'document', title: 'Untitled', content: '' } satisfies DocumentNodeData;
    case 'shape':
      return {
        category: 'shape',
        variant: 'rectangle',
        label: '',
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
      } satisfies ShapeNodeData;
    default:
      return { category: 'mindmap', label: 'Node' } satisfies MindmapNodeData;
  }
}

// ── Tool categories that can create nodes by clicking the canvas ──
const creatableTools: NodeCategory[] = ['mindmap', 'sticky', 'document', 'shape'];

// ── Inner canvas (must be inside ReactFlowProvider) ──

function CanvasInner() {
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const onNodesChange = useBoardStore((s) => s.onNodesChange);
  const onEdgesChange = useBoardStore((s) => s.onEdgesChange);
  const onConnect = useBoardStore((s) => s.onConnect);
  const addNode = useBoardStore((s) => s.addNode);
  const currentBoardId = useBoardStore((s) => s.currentBoardId);
  const createBoard = useBoardStore((s) => s.createBoard);
  const loadBoards = useBoardStore((s) => s.loadBoards);

  // Load boards on mount and auto-create one if none exist
  useEffect(() => {
    (async () => {
      await loadBoards();
      const state = useBoardStore.getState();
      if (state.boards.length === 0) {
        await createBoard('My Board');
      } else if (!state.currentBoardId) {
        const firstBoard = state.boards[0];
        await useBoardStore.getState().openBoard(firstBoard.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drag-and-drop handler for creating nodes ──

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/canvas-hub-node');
      if (!type) return;

      const position: XYPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const category = type as NodeCategory;
      addNode(category, position, defaultNodeData(category));
    },
    [screenToFlowPosition, addNode],
  );

  // ── Pane click: create node when a tool is active ──

  const activeTool = useUiStore((s) => s.activeTool);
  const stickyColor = useUiStore((s) => s.stickyColor);
  const shapeVariant = useUiStore((s) => s.shapeVariant);
  const setTool = useUiStore((s) => s.setTool);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!creatableTools.includes(activeTool as NodeCategory)) return;

      const position: XYPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const category = activeTool as NodeCategory;
      let data = defaultNodeData(category);

      // Apply current UI selections
      if (category === 'sticky') {
        data = { ...data, color: stickyColor } as CanvasNodeData;
      } else if (category === 'shape') {
        data = { ...data, variant: shapeVariant } as CanvasNodeData;
      }

      addNode(category, position, data);
      setTool('select');
    },
    [screenToFlowPosition, addNode, activeTool, stickyColor, shapeVariant, setTool],
  );

  if (!currentBoardId) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{ type: 'floating', animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          color="var(--canvas-grid)"
        />
      </ReactFlow>
      <ZoomControls />
    </div>
  );
}

// ── Exported component with provider ──

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
