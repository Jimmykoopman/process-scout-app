import { Bold, Italic, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextStyle } from '@/types/journey';

interface TextFormattingToolbarProps {
  textStyle: TextStyle;
  onStyleChange: (style: Partial<TextStyle>) => void;
}

export const TextFormattingToolbar = ({ textStyle, onStyleChange }: TextFormattingToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <div className="flex items-center gap-1">
        <Type className="w-4 h-4 text-muted-foreground" />
        <Select 
          value={textStyle.fontSize.toString()} 
          onValueChange={(value) => onStyleChange({ fontSize: parseInt(value) })}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="28">28</SelectItem>
            <SelectItem value="32">32</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant={textStyle.fontWeight === 'bold' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStyleChange({ fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold' })}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant={textStyle.fontStyle === 'italic' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStyleChange({ fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic' })}
      >
        <Italic className="w-4 h-4" />
      </Button>
    </div>
  );
};
