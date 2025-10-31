import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyData } from '@/types/journey';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '@/components/journey/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface MindmapBlockProps {
  data: JourneyData;
  onChange: (data: JourneyData) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export const MindmapBlock = ({ data, onChange, title, onTitleChange }: MindmapBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert JourneyData to ReactFlow nodes and edges
  const convertToReactFlow = (journeyData: JourneyData) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const processNode = (node: any, level: number = 0, parentId?: string, index: number = 0) => {
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
        },
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          animated: true,
        });
      }

      if (node.children) {
        node.children.forEach((child: any, idx: number) => {
          processNode(child, level + 1, nodeId, idx);
        });
      }
    };

    journeyData.stages.forEach((stage, idx) => processNode(stage, 0, undefined, idx));
    return { nodes, edges };
  };

  const { nodes, edges } = convertToReactFlow(data);

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h3 className="text-lg font-semibold">Mindmap bewerken</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mindmap Canvas */}
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={2}
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      {/* Editable title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Mindmap titel"
        className="text-sm font-semibold mb-2 bg-transparent border-0 focus:outline-none focus:ring-0 px-0"
      />
      
      <div className="relative border rounded-lg overflow-hidden bg-muted/30">
        {/* Zoomed out preview */}
        <div className="h-64 pointer-events-none">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Expand button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/0 hover:bg-background/10 transition-colors">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsExpanded(true)}
            className="shadow-lg"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Open mindmap
          </Button>
        </div>
      </div>
    </div>
  );
};
