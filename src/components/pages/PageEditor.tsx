import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Input
          value={page.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="text-4xl font-bold border-0 focus-visible:ring-0 p-0 mb-2"
        />
      </div>

      <div className="space-y-2">
        {page.blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            <div className="absolute left-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
            <div className="pl-16">
              <BlockEditor
                block={block}
                onChange={(updates) => handleBlockChange(block.id, updates)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Select onValueChange={(value) => handleAddBlock(value as BlockType)}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <SelectValue placeholder="Voeg een block toe..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Tekst</SelectItem>
            <SelectItem value="heading1">Heading 1</SelectItem>
            <SelectItem value="heading2">Heading 2</SelectItem>
            <SelectItem value="heading3">Heading 3</SelectItem>
            <SelectItem value="todo">To-do</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="quote">Quote</SelectItem>
            <SelectItem value="divider">Divider</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
