import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '@/components/journey/CustomNode';
import { JourneyData, JourneyNode, NodeShape, TextStyle } from '@/types/journey';
import { FloatingToolbar } from './FloatingToolbar';
import { ExpandedNodeView } from '@/components/journey/ExpandedNodeView';
import { toast } from 'sonner';


const nodeTypes = {
  custom: CustomNode,
};

interface MindmapCanvasProps {
  data: JourneyData;
  onChange: (data: JourneyData) => void;
}

export const MindmapCanvas = ({ data, onChange }: MindmapCanvasProps) => {
  const [selectedShape, setSelectedShape] = useState<NodeShape>('circle');
  const [expandedNode, setExpandedNode] = useState<JourneyNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 5000 }); // 500x500 grid units (10px per unit)
  const GRID_UNIT = 10; // pixels per grid unit
  const MARGIN = 1000; // 100 grid units margin (100 * 10px)

  // Convert JourneyData to ReactFlow nodes and edges
  const convertToReactFlow = useCallback((journeyData: JourneyData, nodeClickHandler?: (node: JourneyNode) => void) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const processNode = (node: JourneyNode, level: number = 0, parentId?: string, index: number = 0) => {
      const nodeId = node.id;
      nodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: level * 250, y: index * 150 },
        data: { 
          label: node.label,
          shape: node.shape,
          color: node.color,
          textStyle: node.textStyle,
          onClick: nodeClickHandler ? () => nodeClickHandler(node) : undefined,
          onAddNodeDirection: undefined, // Will be set later via useEffect
        },
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#0891B2', strokeWidth: 2 },
        });
      }

      if (node.children) {
        node.children.forEach((child, idx) => {
          processNode(child, level + 1, nodeId, idx);
        });
      }
    };

    journeyData.stages.forEach((stage, idx) => processNode(stage, 0, undefined, idx));
    return { nodes, edges };
  }, []);

  const handleNodeClick = useCallback((node: JourneyNode) => {
    setExpandedNode(node);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(convertToReactFlow(data, handleNodeClick).nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertToReactFlow(data, handleNodeClick).edges);

  const handleAddNode = useCallback(() => {
    const newNode: JourneyNode = {
      id: `node-${Date.now()}`,
      label: 'Nieuwe node',
      shape: selectedShape,
      color: '#0891B2',
      textStyle: { fontSize: 16, fontWeight: 'normal', fontStyle: 'normal' },
    };

    // Add to journey data
    onChange({
      stages: [...data.stages, newNode]
    });

    // Add to React Flow with random position
    const newFlowNode: Node = {
      id: newNode.id,
      type: 'custom',
      position: { 
        x: Math.random() * 500 + 100, 
        y: Math.random() * 500 + 100 
      },
      data: {
        label: newNode.label,
        shape: newNode.shape,
        color: newNode.color,
        textStyle: newNode.textStyle,
        onClick: () => handleNodeClick(newNode),
        onAddNodeDirection: handleAddNodeFromDirection,
      },
    };
    
    setNodes((nds) => [...nds, newFlowNode]);
    toast.success('Node toegevoegd');
  }, [selectedShape, data, onChange, handleNodeClick]);

  const handleAddNodeFromDirection = useCallback((sourceNodeId: string, direction: 'left' | 'right' | 'top' | 'bottom') => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const offset = 250;
    let newPosition = { ...sourceNode.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= offset;
        break;
      case 'right':
        newPosition.x += offset;
        break;
      case 'top':
        newPosition.y -= offset;
        break;
      case 'bottom':
        newPosition.y += offset;
        break;
    }

    // Use the same shape as the source node
    const sourceShape = sourceNode.data.shape || 'circle';

    const newNode: JourneyNode = {
      id: `node-${Date.now()}`,
      label: 'Nieuwe node',
      shape: sourceShape,
      color: '#0891B2',
      textStyle: { fontSize: 16, fontWeight: 'normal', fontStyle: 'normal' },
    };

    // Add to journey data
    onChange({
      stages: [...data.stages, newNode]
    });

    // Add to React Flow
    const newFlowNode: Node = {
      id: newNode.id,
      type: 'custom',
      position: newPosition,
      data: {
        label: newNode.label,
        shape: newNode.shape,
        color: newNode.color,
        textStyle: newNode.textStyle,
        onClick: () => handleNodeClick(newNode),
        onAddNodeDirection: handleAddNodeFromDirection,
      },
    };

    // Create edge with correct handles
    const handleMap = {
      'top': { sourceHandle: 's-top', targetHandle: 't-bottom' },
      'bottom': { sourceHandle: 's-bottom', targetHandle: 't-top' },
      'left': { sourceHandle: 's-left', targetHandle: 't-right' },
      'right': { sourceHandle: 's-right', targetHandle: 't-left' },
    } as const;
    
    const handles = handleMap[direction];
    const newEdge: Edge = {
      id: `e${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#0891B2', strokeWidth: 2 },
    };

    setNodes((nds) => [...nds, newFlowNode]);
    setEdges((eds) => [...eds, newEdge]);
    toast.success('Node toegevoegd');
  }, [nodes, data, onChange, handleNodeClick, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      const selectedNode = nodes.find(n => n.id === nodeId);
      if (selectedNode) {
        setSelectedShape(selectedNode.data.shape);
      }
    }
  }, [nodes]);

  // Handle shape change for selected node
  const handleShapeChangeForSelected = useCallback((newShape: NodeShape) => {
    setSelectedShape(newShape);
    
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  shape: newShape,
                },
              }
            : node
        )
      );

      // Update journey data
      const updatedStages = data.stages.map(stage => {
        if (stage.id === selectedNodeId) {
          return { ...stage, shape: newShape };
        }
        return stage;
      });
      onChange({ stages: updatedStages });
      toast.success('Vorm aangepast');
    }
  }, [selectedNodeId, data, onChange, setNodes]);

  // Update nodes with callback functions after they're defined
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddNodeDirection: handleAddNodeFromDirection,
          isSelected: node.id === selectedNodeId,
        },
      }))
    );
  }, [handleAddNodeFromDirection, selectedNodeId, setNodes]);

  // Fit view only on initial load
  React.useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      const hasInitialized = reactFlowWrapper.current?.dataset.initialized;
      if (!hasInitialized) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, maxZoom: 1, duration: 300 });
          if (reactFlowWrapper.current) {
            reactFlowWrapper.current.dataset.initialized = 'true';
          }
        }, 0);
      }
    }
  }, [reactFlowInstance]);

  // Dynamically expand canvas when nodes approach edges
  React.useEffect(() => {
    if (nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      const nodeWidth = 150; // approximate node width
      const nodeHeight = 100; // approximate node height
      
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // Calculate required canvas size with margin
    const requiredWidth = Math.max(5000, (maxX - minX) + (MARGIN * 2));
    const requiredHeight = Math.max(5000, (maxY - minY) + (MARGIN * 2));

    // Update canvas size if needed
    if (requiredWidth > canvasSize.width || requiredHeight > canvasSize.height) {
      setCanvasSize({
        width: Math.max(requiredWidth, canvasSize.width),
        height: Math.max(requiredHeight, canvasSize.height)
      });
    }
  }, [nodes, canvasSize, MARGIN]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative">
      <FloatingToolbar
        selectedShape={selectedShape}
        onShapeChange={selectedNodeId ? handleShapeChangeForSelected : setSelectedShape}
        onAddNode={handleAddNode}
      />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onSelectionChange={(selection) => {
          const selectedNodes = selection.nodes;
          handleNodeSelect(selectedNodes.length > 0 ? selectedNodes[0].id : null);
        }}
        minZoom={0.1}
        maxZoom={2}
        panOnScroll={true}
        panOnDrag={true}
        selectionOnDrag={false}
        nodesDraggable={false}
        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        preventScrolling={true}
        translateExtent={[
          [-canvasSize.width / 2, -canvasSize.height / 2],
          [canvasSize.width, canvasSize.height]
        ]}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={GRID_UNIT} 
          size={1}
          style={{ width: canvasSize.width, height: canvasSize.height }}
        />
        <Controls />
        
        <MiniMap pannable={false} zoomable={false} />
      </ReactFlow>

      {/* Expanded node view */}
      {expandedNode && (
        <ExpandedNodeView
          node={expandedNode}
          open={!!expandedNode}
          onClose={() => setExpandedNode(null)}
        />
      )}
    </div>
  );
};
