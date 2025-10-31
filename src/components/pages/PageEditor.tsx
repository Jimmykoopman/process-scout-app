import { useState } from 'react';
import { Plus, Trash2, GripVertical, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Page, Block, BlockType } from '@/types/journey';
import { BlockEditor } from './BlockEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PageEditorProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export const PageEditor = ({ page, onPageChange }: PageEditorProps) => {
  const handleTitleChange = (title: string) => {
    onPageChange({ ...page, title, updatedAt: new Date().toISOString() });
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      checked: type === 'todo' ? false : undefined,
    };

    onPageChange({
      ...page,
      blocks: [...page.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    });
    toast.success('Block toegevoegd');
  };

  const handleBlockChange = (blockId: string, updates: Partial<Block>) => {
    onPageChange({
      ...page,
      blocks: page.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    onPageChange({
      ...page,
      blocks: page.blocks.filter(block => block.id !== blockId),
      updatedAt: new Date().toISOString(),
    });
    toast.success('Block verwijderd');
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar with + button */}
      <div className="w-16 border-r border-border bg-card flex flex-col items-center pt-8 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAddBlock('text')}
          title="Voeg tekst toe"
          className="h-10 w-10"
        >
          <FileText className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAddBlock('mindmap')}
          title="Voeg mindmap toe"
          className="h-10 w-10"
        >
          <Brain className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Title in center */}
          <div className="mb-8 text-center">
            <Input
              value={page.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="text-4xl font-bold border-0 focus-visible:ring-0 p-0 mb-2 text-center"
            />
          </div>

          {/* Blocks */}
          <div className="space-y-2">
            {page.blocks.map((block, index) => (
              <div key={block.id} className="group relative">
                <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <BlockEditor
                  block={block}
                  onChange={(updates) => handleBlockChange(block.id, updates)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
