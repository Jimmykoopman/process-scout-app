import { useState, useEffect } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Page, Block, BlockType } from '@/types/journey';
import { BlockEditor } from './BlockEditor';
import { toast } from 'sonner';

interface PageEditorProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export const PageEditor = ({ page, onPageChange }: PageEditorProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Ensure there's always at least one empty block
  useEffect(() => {
    if (page.blocks.length === 0) {
      const emptyBlock: Block = {
        id: `block-${Date.now()}`,
        type: 'text',
        content: '',
      };
      onPageChange({
        ...page,
        blocks: [emptyBlock],
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  const handleTitleChange = (title: string) => {
    onPageChange({ ...page, title, updatedAt: new Date().toISOString() });
  };

  const handleBlockChange = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = page.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    // If the last block now has content (but not for mindmap blocks), add a new empty block
    const lastBlock = updatedBlocks[updatedBlocks.length - 1];
    const hasContent = updates.content && updates.content.trim() !== '';
    const isNonTextBlock = updates.type && updates.type !== 'text';
    
    // Don't auto-add empty block for mindmap or database blocks
    const isSelfContainedBlock = lastBlock.type === 'mindmap' || lastBlock.type === 'database';
    
    if (lastBlock.id === blockId && (hasContent || isNonTextBlock) && !isSelfContainedBlock) {
      const newEmptyBlock: Block = {
        id: `block-${Date.now()}`,
        type: 'text',
        content: '',
      };
      updatedBlocks.push(newEmptyBlock);
    }

    onPageChange({
      ...page,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddBlockAfter = (type: BlockType, afterBlockId: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: type === 'mindmap' ? 'Mindmap' : '', // Default title for mindmap
      checked: type === 'todo' ? false : undefined,
      mindmapData: type === 'mindmap' ? { stages: [] } : undefined,
    };

    const afterIndex = page.blocks.findIndex(b => b.id === afterBlockId);
    const newBlocks = [...page.blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);

    onPageChange({
      ...page,
      blocks: newBlocks,
      updatedAt: new Date().toISOString(),
    });
    toast.success('Block toegevoegd');
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = page.blocks.filter(block => block.id !== blockId);
    
    // Ensure at least one block remains
    if (updatedBlocks.length === 0) {
      updatedBlocks.push({
        id: `block-${Date.now()}`,
        type: 'text',
        content: '',
      });
    }

    onPageChange({
      ...page,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
    toast.success('Block verwijderd');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...page.blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);

    onPageChange({
      ...page,
      blocks: newBlocks,
      updatedAt: new Date().toISOString(),
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const isBlockEmpty = (block: Block): boolean => {
    return !block.content || block.content.trim() === '';
  };

  const isLastBlock = (index: number): boolean => {
    return index === page.blocks.length - 1;
  };

  return (
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
        <div className="space-y-1">
          {page.blocks.map((block, index) => {
            const isEmpty = isBlockEmpty(block);
            const isLast = isLastBlock(index);
            const showTrash = !isEmpty || !isLast;

            return (
              <div
                key={block.id}
                className="group relative flex items-start gap-2"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Controls: Grip, Plus, Trash */}
                <div className="flex-shrink-0 flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 cursor-grab"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  {showTrash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Block content */}
                <div className="flex-1 min-w-0">
                  <BlockEditor
                    block={block}
                    onChange={(updates) => handleBlockChange(block.id, updates)}
                    onAddBlock={handleAddBlockAfter}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
