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
}

const CustomNode = memo(({ data, id }: NodeProps<CustomNodeData>) => {
  const { label, shape, color, textStyle, onClick, onDoubleClick, onAddNodeDirection } = data;

  const getShapeClasses = () => {
    const base = 'flex items-center justify-center min-w-[120px] min-h-[60px] max-w-[200px] px-4 py-3 bg-node-bg border-2 border-node-border shadow-lg cursor-pointer transition-all hover:shadow-xl text-sm font-medium text-foreground';
    
    switch (shape) {
      case 'circle':
        return `${base} rounded-full aspect-square`;
      case 'square':
        return `${base} rounded-lg aspect-square`;
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
    <div className="relative group" onClick={onClick} onDoubleClick={onDoubleClick}>
      {/* Custom resize handles on the border - follows the shape */}
      <NodeResizer 
        minWidth={120}
        minHeight={60}
        isVisible={true}
        lineClassName="!border-transparent"
        handleClassName="!w-3 !h-3 !bg-primary !rounded-full !border-2 !border-white"
      />
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 !top-0 opacity-0" />
      <Handle type="target" position={Position.Bottom} className="w-3 h-3 !bottom-0 opacity-0" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !left-0 opacity-0" />
      <Handle type="target" position={Position.Right} className="w-3 h-3 !right-0 opacity-0" />
      
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
          borderColor: color || undefined,
          boxShadow: color ? `0 4px 20px ${color}40` : undefined,
          width: '100%',
          height: '100%',
        }}
      >
        <span className={labelClasses} style={labelStyle}>{label}</span>
      </div>
      
      <Handle type="source" position={Position.Top} className="w-3 h-3 !top-0 opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bottom-0 opacity-0" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 !left-0 opacity-0" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !right-0 opacity-0" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
