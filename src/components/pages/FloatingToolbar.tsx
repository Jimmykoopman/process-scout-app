import { useState, useEffect } from 'react';
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
  GripVertical,
  Pin,
  PinOff
} from 'lucide-react';
import { NodeShape } from '@/types/journey';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  selectedShape: NodeShape;
  onShapeChange: (shape: NodeShape) => void;
  onAddNode: () => void;
}

type Position = 'bottom' | 'left' | 'top' | 'right' | 'floating';

export const FloatingToolbar = ({ selectedShape, onShapeChange, onAddNode }: FloatingToolbarProps) => {
  const [position, setPosition] = useState<Position>('floating');
  const [isDragging, setIsDragging] = useState(false);
  const [coords, setCoords] = useState({ x: 20, y: 20 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (position === 'floating') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - coords.x, y: e.clientY - coords.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && position === 'floating') {
      setCoords({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
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
  }, [isDragging, dragStart]);

  const togglePin = () => {
    if (position === 'floating') {
      setPosition('bottom');
    } else {
      setPosition('floating');
    }
  };

  const cyclePosition = () => {
    const positions: Position[] = ['bottom', 'left', 'top', 'right'];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPosition(positions[nextIndex]);
  };

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
      className={cn(
        'absolute z-20 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-2',
        position === 'floating' ? 'cursor-move' : '',
        getPositionStyles()
      )}
      style={position === 'floating' ? {
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      } : undefined}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle - only visible when floating */}
      {position === 'floating' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-move"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      )}

      {/* Pin/Unpin button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={position === 'floating' ? togglePin : cyclePosition}
        title={position === 'floating' ? 'Vastpinnen' : 'Positie wijzigen'}
      >
        {position === 'floating' ? (
          <PinOff className="h-4 w-4" />
        ) : (
          <Pin className="h-4 w-4" />
        )}
      </Button>

      <div className={cn('h-px w-full bg-border', isVertical ? 'my-1' : 'mx-1', isVertical ? 'w-full h-px' : 'h-full w-px')} />

      {/* Add node button */}
      <Button
        variant="default"
        size="sm"
        className="h-8 gap-2"
        onClick={onAddNode}
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
          onClick={() => onShapeChange('circle')}
          title="Cirkel"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'square' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onShapeChange('square')}
          title="Vierkant"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'diamond' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onShapeChange('diamond')}
          title="Diamant"
        >
          <Diamond className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedShape === 'rectangle' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onShapeChange('rectangle')}
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
          title="Lettergrootte"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Dikgedrukt"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
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
          title="Upload"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Link toevoegen"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Tekenen"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
