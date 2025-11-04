import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { NodeShape, TextStyle } from '@/types/journey';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomNodeData {
  label: string;
  shape: NodeShape;
  color?: string;
  textStyle?: TextStyle;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onAddNodeDirection?: (nodeId: string, direction: 'left' | 'right' | 'top' | 'bottom') => void;
  isSelected?: boolean;
}

const CustomNode = memo(({ data, id, selected }: NodeProps<CustomNodeData>) => {
  const { label, shape, color, textStyle, onClick, onDoubleClick, onAddNodeDirection } = data;

  const getShapeClasses = () => {
    const borderWidth = selected ? 'border-4' : 'border-2';
    const base = `flex items-center justify-center w-full h-full px-4 py-3 bg-node-bg ${borderWidth} border-node-border shadow-lg cursor-pointer transition-all hover:shadow-xl text-sm font-medium text-foreground`;
    
    switch (shape) {
      case 'circle':
        return `${base} rounded-full`;
      case 'square':
        return `${base} rounded-lg`;
      case 'diamond':
        return `${base} rotate-45`;
      case 'rectangle':
        return `${base} rounded-lg`;
      default:
        return `${base} rounded-full`;
    }
  };

  const labelClasses = shape === 'diamond' ? '-rotate-45' : '';
  const labelStyle = textStyle ? {
    fontSize: `${textStyle.fontSize}px`,
    fontWeight: textStyle.fontWeight,
    fontStyle: textStyle.fontStyle,
    wordBreak: 'break-word' as const,
    textAlign: 'center' as const,
    hyphens: 'auto' as const,
  } : {
    wordBreak: 'break-word' as const,
    textAlign: 'center' as const,
  };

  const handleDirectionClick = (e: React.MouseEvent, direction: 'left' | 'right' | 'top' | 'bottom') => {
    e.stopPropagation();
    onAddNodeDirection?.(id, direction);
  };

  return (
    <div className="relative group w-full h-full" onClick={onClick} onDoubleClick={onDoubleClick}>
      <NodeResizer 
        minWidth={80} 
        minHeight={40}
        isVisible={selected}
        lineClassName="!border-transparent"
        handleClassName="!w-2 !h-2 !bg-primary !rounded-full !border-2 !border-background"
        keepAspectRatio={shape === 'circle' || shape === 'square'}
        shouldResize={() => true}
      />
      <Handle id="t-top" type="target" position={Position.Top} className="w-3 h-3 !top-0 opacity-0" />
      <Handle id="t-bottom" type="target" position={Position.Bottom} className="w-3 h-3 !bottom-0 opacity-0" />
      <Handle id="t-left" type="target" position={Position.Left} className="w-3 h-3 !left-0 opacity-0" />
      <Handle id="t-right" type="target" position={Position.Right} className="w-3 h-3 !right-0 opacity-0" />
      
      {/* Direction arrows - only visible on hover */}
      <button
        onClick={(e) => handleDirectionClick(e, 'left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 z-10"
        title="Voeg node links toe"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <button
        onClick={(e) => handleDirectionClick(e, 'right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 z-10"
        title="Voeg node rechts toe"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      
      <button
        onClick={(e) => handleDirectionClick(e, 'top')}
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-8 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 z-10"
        title="Voeg node boven toe"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      
      <button
        onClick={(e) => handleDirectionClick(e, 'bottom')}
        className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-8 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 z-10"
        title="Voeg node onder toe"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      <div 
        className={getShapeClasses()} 
        style={{ 
          borderColor: selected ? (color || '#0891B2') : (color || undefined),
          boxShadow: selected 
            ? `0 0 0 4px ${color || '#0891B2'}40, 0 4px 20px ${color || '#0891B2'}60` 
            : (color ? `0 4px 20px ${color}40` : undefined),
        }}
      >
        <span className={labelClasses} style={labelStyle}>{label}</span>
      </div>
      
      <Handle id="s-top" type="source" position={Position.Top} className="w-3 h-3 !top-0 opacity-0" />
      <Handle id="s-bottom" type="source" position={Position.Bottom} className="w-3 h-3 !bottom-0 opacity-0" />
      <Handle id="s-left" type="source" position={Position.Left} className="w-3 h-3 !left-0 opacity-0" />
      <Handle id="s-right" type="source" position={Position.Right} className="w-3 h-3 !right-0 opacity-0" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
