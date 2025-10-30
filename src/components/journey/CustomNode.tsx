import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeShape, TextStyle } from '@/types/journey';

interface CustomNodeData {
  label: string;
  shape: NodeShape;
  color?: string;
  textStyle?: TextStyle;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const CustomNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const { label, shape, color, textStyle, onClick, onDoubleClick } = data;

  const getShapeClasses = () => {
    const base = 'flex items-center justify-center min-w-[120px] min-h-[60px] px-4 py-3 bg-node-bg border-2 border-node-border shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 text-sm font-medium text-foreground';
    
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
  } : {};

  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div 
        className={getShapeClasses()} 
        style={{ 
          borderColor: color || undefined,
          boxShadow: color ? `0 4px 20px ${color}40` : undefined 
        }}
      >
        <span className={labelClasses} style={labelStyle}>{label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
