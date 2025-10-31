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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-6xl h-[90vh] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
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
    </div>
  );
};
