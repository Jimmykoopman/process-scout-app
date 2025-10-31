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
    <div className="fixed right-0 top-0 bottom-0 w-[800px] bg-background border-l border-border shadow-2xl flex flex-col z-30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-xl font-bold">{node.label}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Document Editor */}
      <DocumentEditor content="" onChange={() => {}} />
    </div>
  );
};
