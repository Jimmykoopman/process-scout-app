import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { DetailPanel } from './DetailPanel';
import { Toolbar } from './Toolbar';
import { JourneyNode, NodeShape } from '@/types/journey';
import { sampleJourneyData } from '@/data/sampleJourney';

const nodeTypes = {
  custom: CustomNode,
};

export const JourneyCanvas = () => {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<JourneyNode[]>([]);
  const [selectedShape, setSelectedShape] = useState<NodeShape>('circle');

  // Convert journey data to React Flow nodes
  const createNodesFromData = useCallback(() => {
    const nodes: Node[] = [];
    const xSpacing = 250;
    const ySpacing = 150;

    sampleJourneyData.stages.forEach((stage, index) => {
      nodes.push({
        id: stage.id,
        type: 'custom',
        position: { x: index * xSpacing, y: 300 },
        data: {
          label: stage.label,
          shape: stage.shape,
          color: stage.color,
          onClick: () => handleNodeClick(stage),
        },
      });

      // Add children nodes
      if (stage.children) {
        stage.children.forEach((child, childIndex) => {
          nodes.push({
            id: child.id,
            type: 'custom',
            position: { 
              x: index * xSpacing - 100 + childIndex * 120, 
              y: 300 + ySpacing 
            },
            data: {
              label: child.label,
              shape: child.shape,
              onClick: () => handleNodeClick(child, [stage]),
            },
          });
        });
      }
    });

    return nodes;
  }, []);

  const createEdgesFromData = useCallback(() => {
    const edges: Edge[] = [];
    let edgeId = 0;

    sampleJourneyData.stages.forEach((stage, index) => {
      // Connect stages
      if (index < sampleJourneyData.stages.length - 1) {
        edges.push({
          id: `e${edgeId++}`,
          source: stage.id,
          target: sampleJourneyData.stages[index + 1].id,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#0891B2', strokeWidth: 2 },
        });
      }

      // Connect children to parent
      if (stage.children) {
        stage.children.forEach((child) => {
          edges.push({
            id: `e${edgeId++}`,
            source: stage.id,
            target: child.id,
            type: 'smoothstep',
            style: { stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '5,5' },
          });
        });
      }
    });

    return edges;
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodesFromData());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdgesFromData());

  const handleNodeClick = useCallback((node: JourneyNode, parentBreadcrumbs: JourneyNode[] = []) => {
    setSelectedNode(node);
    setBreadcrumbs([...parentBreadcrumbs, node]);
  }, []);

  const handleChildClick = useCallback((child: JourneyNode) => {
    setSelectedNode(child);
    setBreadcrumbs([...breadcrumbs, child]);
  }, [breadcrumbs]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
    setBreadcrumbs([]);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: 'Nieuwe node',
        shape: selectedShape,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [selectedShape, setNodes]);

  return (
    <div className="relative w-full h-screen flex">
      <div className="flex-1 relative">
        <Toolbar
          onAddNode={handleAddNode}
          onShapeChange={setSelectedShape}
          selectedShape={selectedShape}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-canvas-bg"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as { color?: string };
              return data.color || '#0891B2';
            }}
            className="bg-card border border-border"
          />
        </ReactFlow>
      </div>
      <DetailPanel
        node={selectedNode}
        onClose={handleClosePanel}
        onChildClick={handleChildClick}
        breadcrumbs={breadcrumbs}
      />
    </div>
  );
};
