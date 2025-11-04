import { useState } from 'react';
import { X, FileText, Plus, Bold, Link as LinkIcon, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyNode } from '@/types/journey';
import { DocumentEditor } from '@/components/pages/DocumentEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface ExpandedNodeViewProps {
  node: JourneyNode | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (nodeId: string, updates: { label?: string; description?: string }) => void;
}

export const ExpandedNodeView = ({ node, open, onClose, onUpdate }: ExpandedNodeViewProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [nodeTitle, setNodeTitle] = useState(node?.label || 'Nieuwe node');
  const [nodeDescription, setNodeDescription] = useState('');

  if (!node || !open) return null;

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error('Voer een documentnaam in');
      return;
    }

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      content: '',
      createdAt: new Date(),
    };

    setDocuments([...documents, newDoc]);
    setNewDocTitle('');
    setIsCreating(false);
    toast.success('Document aangemaakt');
  };

  const handleDocumentChange = (content: string) => {
    if (!selectedDocument) return;
    
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, content } 
          : doc
      )
    );
    
    setSelectedDocument({ ...selectedDocument, content });
  };

  // If a document is selected, show the editor
  if (selectedDocument) {
    return (
      <div className="fixed right-0 top-0 w-[800px] h-full bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden z-50">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedDocument(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <DocumentEditor 
            content={selectedDocument.content} 
            onChange={handleDocumentChange} 
          />
        </div>
      </div>
    );
  }

  // Otherwise, show the document list
  return (
    <div className="fixed right-0 top-0 w-[400px] h-full bg-background border-l border-border shadow-xl flex flex-col overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex-1 mr-2">
          <Input
            value={nodeTitle}
            onChange={(e) => setNodeTitle(e.target.value)}
            onBlur={() => {
              if (node && onUpdate && nodeTitle !== node.label) {
                onUpdate(node.id, { label: nodeTitle });
              }
            }}
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
            placeholder="Nieuwe node"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border space-y-3">
        <Textarea
          value={nodeDescription}
          onChange={(e) => setNodeDescription(e.target.value)}
          onBlur={() => {
            if (node && onUpdate) {
              onUpdate(node.id, { description: nodeDescription });
            }
          }}
          placeholder="Beschrijving toevoegen..."
          className="min-h-[60px] resize-none"
        />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast.info('Bold functie komt binnenkort')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast.info('Link functie komt binnenkort')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => toast.info('Bestandsupload komt binnenkort')}>
                <FileUp className="mr-2 h-4 w-4" />
                Bestand uploaden
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Google Docs integratie komt binnenkort')}>
                <FileText className="mr-2 h-4 w-4" />
                Google Docs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Google Spreadsheets integratie komt binnenkort')}>
                <FileText className="mr-2 h-4 w-4" />
                Google Spreadsheets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Google Drive integratie komt binnenkort')}>
                <FileText className="mr-2 h-4 w-4" />
                Google Drive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nieuw Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuw Document Aanmaken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Documentnaam"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDocument()}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateDocument} className="flex-1">
                  Aanmaken
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setNewDocTitle('');
                  }}
                  className="flex-1"
                >
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nog geen documenten</p>
              <p className="text-sm mt-2">Klik op "Nieuw Document" om te beginnen</p>
            </div>
          ) : (
            documents.map((doc) => (
              <Card 
                key={doc.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedDocument(doc)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {doc.createdAt.toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
