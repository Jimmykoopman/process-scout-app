import { X, ChevronRight, FileText, Upload, Link2, Plus, Trash2, Maximize2, Bold, Italic, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JourneyNode, TextStyle } from '@/types/journey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef, useState } from 'react';
import React from 'react';

interface DetailPanelProps {
  node: JourneyNode | null;
  onClose: () => void;
  onChildClick: (child: JourneyNode) => void;
  breadcrumbs: JourneyNode[];
  onDocumentUpload?: (nodeId: string, files: FileList) => void;
  onNodeLabelChange?: (nodeId: string, newLabel: string) => void;
  onTextStyleChange?: (nodeId: string, style: Partial<TextStyle>) => void;
  onLinkAdd?: (nodeId: string, url: string, label: string) => void;
  onLinkRemove?: (nodeId: string, linkId: string) => void;
  onExpandDocument?: () => void;
}

export const DetailPanel = ({ 
  node, 
  onClose, 
  onChildClick, 
  breadcrumbs, 
  onDocumentUpload,
  onNodeLabelChange,
  onTextStyleChange,
  onLinkAdd,
  onLinkRemove,
  onExpandDocument 
}: DetailPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [editedLabel, setEditedLabel] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);

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
      setShowLinkDialog(false);
    }
  };

  const handleLabelChange = (newLabel: string) => {
    setEditedLabel(newLabel);
  };

  const handleLabelBlur = () => {
    if (node && editedLabel.trim() && editedLabel !== node.label) {
      onNodeLabelChange?.(node.id, editedLabel.trim());
    } else if (node) {
      setEditedLabel(node.label);
    }
  };

  React.useEffect(() => {
    if (node) {
      setEditedLabel(node.label);
    }
  }, [node]);

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
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Titel</Label>
            <Input
              value={editedLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="text-xl font-semibold"
              placeholder="Node naam..."
            />
            {node.details && (
              <p className="text-muted-foreground text-sm mt-2">{node.details}</p>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Opmaak</CardTitle>
              <CardDescription className="text-xs">Gebruik deze knoppen om geselecteerde tekst op te maken</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 Tip: Selecteer tekst in de node en klik dan op dikgedrukt of cursief
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={textStyle.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleChange({ 
                    fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  className="h-8 w-8 p-0"
                  title="Dikgedrukt (hele node)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={textStyle.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleChange({ 
                    fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  className="h-8 w-8 p-0"
                  title="Cursief (hele node)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={textStyle.fontSize}
                    onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) || 16 })}
                    className="h-8 w-16 text-center"
                    min="8"
                    max="72"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkDialog(!showLinkDialog)}
                  className="h-8 w-8 p-0"
                  title="Link toevoegen"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                  title="Document uploaden"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
              </div>

              {showLinkDialog && (
                <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/20">
                  <Input
                    placeholder="https://example.com"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="h-8"
                  />
                  <Input
                    placeholder="Label (optioneel)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="h-8"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddLink} size="sm" disabled={!newLinkUrl.trim()} className="flex-1">
                      Toevoegen
                    </Button>
                    <Button onClick={() => setShowLinkDialog(false)} size="sm" variant="outline">
                      Annuleer
                    </Button>
                  </div>
                </div>
              )}

              {node.links && node.links.length > 0 && (
                <div className="space-y-1">
                  {node.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 rounded bg-muted text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Link2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => onLinkRemove?.(node.id, link.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Document Preview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExpandDocument}
                  className="h-7 text-xs gap-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  Volledig scherm
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* A4 format preview - scaled down */}
              <div 
                className="border border-border rounded bg-white shadow-sm overflow-auto"
                style={{ 
                  width: '100%',
                  height: '500px',
                }}
              >
                <div className="p-6 space-y-4" style={{ fontSize: '11px' }}>
                  {node.details && (
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontSize: '13px' }}>Details</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{node.details}</p>
                    </div>
                  )}
                  
                  {node.links && node.links.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontSize: '13px' }}>Links</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        {node.links.map((link) => (
                          <li key={link.id} className="text-muted-foreground">
                            {link.label || link.url}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {node.children && node.children.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontSize: '13px' }}>Onderdelen</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        {node.children.map((child) => (
                          <li key={child.id} className="text-muted-foreground">
                            {child.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {node.documents && node.documents.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontSize: '13px' }}>Documenten</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        {node.documents.map((doc, index) => (
                          <li key={index} className="text-muted-foreground">
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!node.details && (!node.links || node.links.length === 0) && 
                   (!node.children || node.children.length === 0) && 
                   (!node.documents || node.documents.length === 0) && (
                    <p className="text-muted-foreground text-center py-12">
                      Document is leeg. Voeg inhoud toe via links, onderdelen of documenten.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
