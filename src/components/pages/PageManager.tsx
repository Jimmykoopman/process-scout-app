import { useState } from 'react';
import { Plus, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Page } from '@/types/journey';
import { PageEditor } from './PageEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export const PageManager = () => {
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'welcome',
      title: 'Welkom',
      blocks: [
        {
          id: 'block-1',
          type: 'heading1',
          content: 'Welkom bij je workspace',
        },
        {
          id: 'block-2',
          type: 'text',
          content: 'Begin met typen of voeg nieuwe blocks toe...',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [currentPageId, setCurrentPageId] = useState('welcome');

  const currentPage = pages.find(p => p.id === currentPageId);

  const handleCreatePage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: 'Nieuwe pagina',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    toast.success('Pagina aangemaakt');
  };

  const handlePageChange = (updatedPage: Page) => {
    setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border">
          <Button onClick={handleCreatePage} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe pagina
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-2">
            {pages.map(page => (
              <Button
                key={page.id}
                variant={currentPageId === page.id ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-1"
                onClick={() => setCurrentPageId(page.id)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {page.title || 'Untitled'}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto">
        {currentPage ? (
          <PageEditor page={currentPage} onPageChange={handlePageChange} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Selecteer of maak een pagina</p>
          </div>
        )}
      </div>
    </div>
  );
};
