import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyNode } from '@/types/journey';
import { DocumentEditor } from '@/components/pages/DocumentEditor';

interface ExpandedNodeViewProps {
  node: JourneyNode | null;
  open: boolean;
  onClose: () => void;
}

export const ExpandedNodeView = ({ node, open, onClose }: ExpandedNodeViewProps) => {
  if (!node || !open) return null;

  return (
    <div className="w-[600px] h-full bg-background border-x border-border shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
        <h2 className="text-xl font-bold">{node.label}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Document Editor */}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor content="" onChange={() => {}} />
      </div>
    </div>
  );
};
