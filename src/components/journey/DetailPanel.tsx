import { X, ChevronRight, FileText, Upload, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JourneyNode, TextStyle } from '@/types/journey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef, useState } from 'react';
import { TextFormattingToolbar } from './TextFormattingToolbar';

interface DetailPanelProps {
  node: JourneyNode | null;
  onClose: () => void;
  onChildClick: (child: JourneyNode) => void;
  breadcrumbs: JourneyNode[];
  onDocumentUpload?: (nodeId: string, files: FileList) => void;
  onTextStyleChange?: (nodeId: string, style: Partial<TextStyle>) => void;
  onLinkAdd?: (nodeId: string, url: string, label: string) => void;
  onLinkRemove?: (nodeId: string, linkId: string) => void;
}

export const DetailPanel = ({ 
  node, 
  onClose, 
  onChildClick, 
  breadcrumbs, 
  onDocumentUpload,
  onTextStyleChange,
  onLinkAdd,
  onLinkRemove 
}: DetailPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  if (!node) return null;

  const textStyle = node.textStyle || { fontSize: 16, fontWeight: 'normal' as const, fontStyle: 'normal' as const };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && node) {
      onDocumentUpload?.(node.id, e.target.files);
    }
  };

  const handleStyleChange = (style: Partial<TextStyle>) => {
    if (node) {
      onTextStyleChange?.(node.id, style);
    }
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim() && node) {
      onLinkAdd?.(node.id, newLinkUrl, newLinkLabel || newLinkUrl);
      setNewLinkUrl('');
      setNewLinkLabel('');
    }
  };

  return (
    <div className="w-96 border-l border-border bg-card shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm text-muted-foreground truncate">
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-foreground">{crumb.label}</span>
                ) : (
                  crumb.label
                )}
              </span>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{
                fontSize: `${textStyle.fontSize}px`,
                fontWeight: textStyle.fontWeight,
                fontStyle: textStyle.fontStyle,
              }}
            >
              {node.label}
            </h2>
            {node.details && (
              <p className="text-muted-foreground">{node.details}</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tekst Formatting</CardTitle>
              <CardDescription>Pas de weergave van deze node aan</CardDescription>
            </CardHeader>
            <CardContent>
              <TextFormattingToolbar 
                textStyle={textStyle}
                onStyleChange={handleStyleChange}
              />
            </CardContent>
          </Card>

          {node.children && node.children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onderliggende items</CardTitle>
                <CardDescription>Klik op een item voor meer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {node.children.map((child) => (
                  <Button
                    key={child.id}
                    variant="outline"
                    className="w-full justify-between hover:bg-primary/10 hover:border-primary transition-colors"
                    onClick={() => onChildClick(child)}
                  >
                    <span>{child.label}</span>
                    {child.children && child.children.length > 0 && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
              <CardDescription>Voeg externe links toe (dubbel-klik op node om te openen)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-label">Label (optioneel)</Label>
                <Input
                  id="link-label"
                  placeholder="Mijn link"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                />
              </div>
              <Button onClick={handleAddLink} className="w-full" disabled={!newLinkUrl.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Link toevoegen
              </Button>

              {node.links && node.links.length > 0 && (
                <div className="space-y-2 mt-4">
                  {node.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{link.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => onLinkRemove?.(node.id, link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documenten</CardTitle>
              <CardDescription>Upload documenten voor dit item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                <span>Upload document</span>
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              
              {node.documents && node.documents.length > 0 && (
                <div className="space-y-2 mt-4">
                  {node.documents.map((doc, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-2 hover:bg-secondary/10"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{doc}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
