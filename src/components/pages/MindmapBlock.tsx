import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyData } from '@/types/journey';
import { MindmapCanvas } from './MindmapCanvas';
import ReactFlow, { Background, BackgroundVariant } from 'reactflow';
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

  // Convert JourneyData to preview nodes
  const previewNodes = data.stages.map((stage, idx) => ({
    id: stage.id,
    type: 'custom',
    position: { x: idx * 200, y: 100 },
    data: { 
      label: stage.label,
      shape: stage.shape,
      color: stage.color,
      textStyle: stage.textStyle,
    },
  }));

  if (isExpanded) {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-64 z-40 bg-background">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Mindmap titel"
              className="text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0"
            />
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mindmap Canvas */}
          <MindmapCanvas data={data} onChange={onChange} />
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
      
      {/* Preview - clickable to expand */}
      <div 
        className="relative border border-border rounded-lg overflow-hidden bg-card hover:bg-accent/5 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="h-64 w-full pointer-events-none">
          <ReactFlow
            nodes={previewNodes}
            edges={[]}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={1}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            preventScrolling={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} className="opacity-30" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
