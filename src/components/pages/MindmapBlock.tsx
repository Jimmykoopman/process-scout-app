import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyData } from '@/types/journey';
import { MindmapCanvas } from './MindmapCanvas';

interface MindmapBlockProps {
  data: JourneyData;
  onChange: (data: JourneyData) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export const MindmapBlock = ({ data, onChange, title, onTitleChange }: MindmapBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      
      <div className="relative border rounded-lg overflow-hidden bg-muted/30">
        {/* Preview message */}
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Klik om de mindmap te openen</p>
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
    </div>
  );
};
