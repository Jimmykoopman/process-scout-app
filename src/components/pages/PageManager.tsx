import { useState } from 'react';
import { Plus, FileText, MoreHorizontal, Star, Copy, ExternalLink, FolderInput, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Page } from '@/types/journey';
import { PageEditor } from './PageEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      isFavorite: false,
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

  const handleToggleFavorite = (pageId: string) => {
    setPages(pages.map(p => 
      p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    const page = pages.find(p => p.id === pageId);
    toast.success(page?.isFavorite ? 'Verwijderd uit favorieten' : 'Toegevoegd aan favorieten');
  };

  const handleDuplicatePage = (pageId: string) => {
    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (!pageToDuplicate) return;

    const newPage: Page = {
      ...pageToDuplicate,
      id: `page-${Date.now()}`,
      title: `${pageToDuplicate.title} (kopie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPages([...pages, newPage]);
    toast.success('Pagina gedupliceerd');
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length === 1) {
      toast.error('Je moet minimaal één pagina hebben');
      return;
    }

    setPages(pages.filter(p => p.id !== pageId));
    
    if (currentPageId === pageId) {
      setCurrentPageId(pages.find(p => p.id !== pageId)?.id || '');
    }
    
    toast.success('Pagina verwijderd');
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
              <div key={page.id} className="group relative flex items-center mb-1">
                <Button
                  variant={currentPageId === page.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start pr-8"
                  onClick={() => setCurrentPageId(page.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {page.title || 'Untitled'}
                  {page.isFavorite && (
                    <Star className="h-3 w-3 ml-auto fill-yellow-400 text-yellow-400" />
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                    <DropdownMenuItem onClick={() => handleToggleFavorite(page.id)}>
                      <Star className={`h-4 w-4 mr-2 ${page.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {page.isFavorite ? 'Verwijderen uit favorieten' : 'Toevoegen aan favorieten'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Dupliceren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(window.location.href, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Openen in nieuw tablad
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderInput className="h-4 w-4 mr-2" />
                      Verplaatsen naar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeletePage(page.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
