import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Block, JourneyData, BlockType } from '@/types/journey';
import { Separator } from '@/components/ui/separator';
import { DatabaseManager } from '@/components/database/DatabaseManager';
import { MindmapBlock } from './MindmapBlock';
import { Button } from '@/components/ui/button';
import { Plus, Brain, FileText, Heading1, Heading2, Heading3, Code, Quote, Minus, Database } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BlockEditorProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onAddBlock?: (type: BlockType, afterBlockId: string) => void;
}

export const BlockEditor = ({ block, onChange, onAddBlock }: BlockEditorProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleContentChange = (content: string) => {
    onChange({ content });
  };

  const blockTypeOptions = [
    { type: 'text' as BlockType, icon: FileText, label: 'Tekst' },
    { type: 'mindmap' as BlockType, icon: Brain, label: 'Mindmap' },
    { type: 'heading1' as BlockType, icon: Heading1, label: 'Heading 1' },
    { type: 'heading2' as BlockType, icon: Heading2, label: 'Heading 2' },
    { type: 'heading3' as BlockType, icon: Heading3, label: 'Heading 3' },
    { type: 'code' as BlockType, icon: Code, label: 'Code' },
    { type: 'quote' as BlockType, icon: Quote, label: 'Quote' },
    { type: 'divider' as BlockType, icon: Minus, label: 'Divider' },
    { type: 'database' as BlockType, icon: Database, label: 'Database' },
  ];

  const handleAddBlockType = (type: BlockType) => {
    if (onAddBlock) {
      onAddBlock(type, block.id);
    }
    setShowMenu(false);
  };

  switch (block.type) {
    case 'heading1':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 1"
          className="text-3xl font-bold border-0 focus-visible:ring-0 p-2 min-h-[auto]"
        />
      );

    case 'heading2':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 2"
          className="text-2xl font-bold border-0 focus-visible:ring-0 p-2 min-h-[auto]"
        />
      );

    case 'heading3':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Heading 3"
          className="text-xl font-bold border-0 focus-visible:ring-0 p-2 min-h-[auto]"
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
            className={`flex-1 border-0 focus-visible:ring-0 min-h-[auto] ${
              block.checked ? 'line-through text-muted-foreground' : ''
            }`}
          />
        </div>
      );

    case 'code':
      return (
        <Textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="// Code hier..."
          className="font-mono bg-muted border-0 focus-visible:ring-0 p-4"
        />
      );

    case 'quote':
      return (
        <div className="border-l-4 border-primary pl-4 py-2">
          <Textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Quote..."
            className="italic border-0 focus-visible:ring-0"
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

    case 'mindmap':
      return (
        <MindmapBlock
          data={block.mindmapData || { stages: [] }}
          onChange={(data: JourneyData) => onChange({ mindmapData: data })}
          title={block.content || 'Mindmap'}
          onTitleChange={(title: string) => onChange({ content: title })}
        />
      );

    case 'text':
    default:
      return (
        <div className="relative group">
          <div className="flex items-start gap-2">
            <Popover open={showMenu} onOpenChange={setShowMenu}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-popover z-50" align="start">
                <div className="space-y-1">
                  {blockTypeOptions.map((option) => (
                    <Button
                      key={option.type}
                      variant="ghost"
                      className="w-full justify-start gap-2 h-9"
                      onClick={() => handleAddBlockType(option.type)}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Textarea
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Typ iets..."
              className="border-0 focus-visible:ring-0 p-2 flex-1 min-h-[auto]"
            />
          </div>
        </div>
      );
  }
};
