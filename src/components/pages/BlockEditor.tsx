import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Block } from '@/types/journey';
import { Separator } from '@/components/ui/separator';
import { DatabaseManager } from '@/components/database/DatabaseManager';

interface BlockEditorProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}

export const BlockEditor = ({ block, onChange }: BlockEditorProps) => {
  const handleContentChange = (content: string) => {
    onChange({ content });
  };

  switch (block.type) {
    case 'heading1':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 1"
          className="text-3xl font-bold border-0 focus-visible:ring-0 p-2 resize-none"
          rows={1}
        />
      );

    case 'heading2':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 2"
          className="text-2xl font-bold border-0 focus-visible:ring-0 p-2 resize-none"
          rows={1}
        />
      );

    case 'heading3':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 3"
          className="text-xl font-bold border-0 focus-visible:ring-0 p-2 resize-none"
          rows={1}
        />
      );

    case 'todo':
      return (
        <div className="flex items-start gap-2 p-2">
          <Checkbox
            checked={block.checked}
            onCheckedChange={(checked) => onChange({ checked: checked as boolean })}
            className="mt-1"
          />
          <Textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="To-do"
            className={`flex-1 border-0 focus-visible:ring-0 resize-none ${
              block.checked ? 'line-through text-muted-foreground' : ''
            }`}
            rows={1}
          />
        </div>
      );

    case 'code':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="// Code hier..."
          className="font-mono bg-muted border-0 focus-visible:ring-0 p-4 resize-none"
          rows={4}
        />
      );

    case 'quote':
      return (
        <div className="border-l-4 border-primary pl-4 py-2">
          <Textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Quote..."
            className="italic border-0 focus-visible:ring-0 resize-none"
            rows={2}
          />
        </div>
      );

    case 'divider':
      return <Separator className="my-4" />;

    case 'database':
      return (
        <div className="border rounded-lg p-4 my-4">
          <DatabaseManager />
        </div>
      );

    case 'text':
    default:
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Typ iets..."
          className="border-0 focus-visible:ring-0 p-2 resize-none"
          rows={2}
        />
      );
  }
};
