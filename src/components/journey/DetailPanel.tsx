import { X, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JourneyNode } from '@/types/journey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DetailPanelProps {
  node: JourneyNode | null;
  onClose: () => void;
  onChildClick: (child: JourneyNode) => void;
  breadcrumbs: JourneyNode[];
}

export const DetailPanel = ({ node, onClose, onChildClick, breadcrumbs }: DetailPanelProps) => {
  if (!node) return null;

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
            <h2 className="text-2xl font-bold mb-2">{node.label}</h2>
            {node.details && (
              <p className="text-muted-foreground">{node.details}</p>
            )}
          </div>

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

          {node.documents && node.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documenten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
