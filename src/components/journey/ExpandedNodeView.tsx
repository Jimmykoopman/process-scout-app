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
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
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
