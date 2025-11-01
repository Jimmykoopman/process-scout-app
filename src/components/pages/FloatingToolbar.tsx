import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Circle, 
  Square, 
  Diamond, 
  Minus,
  Upload,
  Link as LinkIcon,
  Type,
  Bold,
  Italic,
  Pencil,
  GripVertical
} from 'lucide-react';
import { NodeShape } from '@/types/journey';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  selectedShape: NodeShape;
  onShapeChange: (shape: NodeShape) => void;
  onAddNode: () => void;
}

type Position = 'bottom' | 'left' | 'top' | 'right';

export const FloatingToolbar = ({ selectedShape, onShapeChange, onAddNode }: FloatingToolbarProps) => {
  const [position, setPosition] = useState<Position>('bottom');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const x = e.clientX;
    const y = e.clientY;

    // Calculate distances to each edge
    const distToLeft = x;
    const distToRight = windowWidth - x;
    const distToTop = y;
    const distToBottom = windowHeight - y;

    // Find the closest edge
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    
    let newPosition: Position;
    if (minDist === distToLeft) newPosition = 'left';
    else if (minDist === distToRight) newPosition = 'right';
    else if (minDist === distToTop) newPosition = 'top';
    else newPosition = 'bottom';

    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-4 left-1/2 -translate-x-1/2 flex-row';
      case 'left':
        return 'left-4 top-1/2 -translate-y-1/2 flex-col';
      case 'top':
        return 'top-4 left-1/2 -translate-x-1/2 flex-row';
      case 'right':
        return 'right-4 top-1/2 -translate-y-1/2 flex-col';
      default:
        return 'flex-row';
    }
  };

  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'absolute z-20 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-2 transition-all duration-200',
        isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab',
        getPositionStyles()
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle */}
      <div 
        className="flex items-center justify-center h-8 w-8 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className={cn('h-px w-full bg-border', isVertical ? 'my-1' : 'mx-1', isVertical ? 'w-full h-px' : 'h-full w-px')} />

      {/* Add node button */}
      <Button
        variant="default"
        size="sm"
        className="h-8 gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onAddNode();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Node toevoegen"
      >
        <Plus className="h-4 w-4" />
        {!isVertical && <span className="text-xs">Node</span>}
      </Button>

      <div className={cn('h-px w-full bg-border', isVertical ? 'my-1' : 'mx-1', isVertical ? 'w-full h-px' : 'h-full w-px')} />

      {/* Shape buttons */}
      <div className={cn('flex gap-1', isVertical ? 'flex-col' : 'flex-row')}>
        <Button
          variant={selectedShape === 'circle' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onShapeChange('circle');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Cirkel"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'square' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onShapeChange('square');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Vierkant"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'diamond' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onShapeChange('diamond');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Diamant"
        >
          <Diamond className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'rectangle' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onShapeChange('rectangle');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Rechthoek"
        >
          <Minus className="h-4 w-4 rotate-90" />
        </Button>
      </div>

      <div className={cn('h-px w-full bg-border', isVertical ? 'my-1' : 'mx-1', isVertical ? 'w-full h-px' : 'h-full w-px')} />

      {/* Text formatting */}
      <div className={cn('flex gap-1', isVertical ? 'flex-col' : 'flex-row')}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Lettergrootte"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Dikgedrukt"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Schuin"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn('h-px w-full bg-border', isVertical ? 'my-1' : 'mx-1', isVertical ? 'w-full h-px' : 'h-full w-px')} />

      {/* Additional tools */}
      <div className={cn('flex gap-1', isVertical ? 'flex-col' : 'flex-row')}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Upload"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Link toevoegen"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => e.stopPropagation()}
          title="Tekenen"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
