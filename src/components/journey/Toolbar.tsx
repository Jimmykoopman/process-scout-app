import { Plus, Download, Upload, Square, Circle, Diamond, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NodeShape } from '@/types/journey';

interface ToolbarProps {
  onAddNode: () => void;
  onShapeChange: (shape: NodeShape) => void;
  selectedShape: NodeShape;
}

export const Toolbar = ({ onAddNode, onShapeChange, selectedShape }: ToolbarProps) => {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card p-3 rounded-lg shadow-lg border border-border">
      <Button onClick={onAddNode} size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Voeg node toe
      </Button>
      
      <div className="flex gap-1 border-l border-border pl-2">
        <Button
          variant={selectedShape === 'circle' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onShapeChange('circle')}
          title="Cirkel"
        >
          <Circle className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedShape === 'square' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onShapeChange('square')}
          title="Vierkant"
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedShape === 'diamond' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onShapeChange('diamond')}
          title="Diamant"
        >
          <Diamond className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedShape === 'rectangle' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onShapeChange('rectangle')}
          title="Rechthoek"
        >
          <Minus className="w-4 h-4 rotate-90" />
        </Button>
      </div>
    </div>
  );
};
