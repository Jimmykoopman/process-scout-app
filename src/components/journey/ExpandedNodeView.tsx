import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JourneyNode } from '@/types/journey';

interface ExpandedNodeViewProps {
  node: JourneyNode | null;
  open: boolean;
  onClose: () => void;
}

export const ExpandedNodeView = ({ node, open, onClose }: ExpandedNodeViewProps) => {
  if (!node) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text representation
    const content = `
${node.label}
${'='.repeat(node.label.length)}

${node.details || 'Geen details beschikbaar'}

${node.links && node.links.length > 0 ? '\nLinks:\n' + node.links.map(l => `- ${l.label}: ${l.url}`).join('\n') : ''}

${node.documents && node.documents.length > 0 ? '\nDocumenten:\n' + node.documents.map(d => `- ${d}`).join('\n') : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${node.label}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">{node.label}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* A4 format container: 210mm × 297mm at 96 DPI ≈ 794px × 1123px */}
          <div className="p-8 mx-auto bg-card" style={{ 
            width: '794px', 
            minHeight: '1123px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}>
            <div className="space-y-6">
              {node.details && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{node.details}</p>
                </div>
              )}

              {node.links && node.links.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Links</h3>
                  <ul className="space-y-2">
                    {node.links.map((link) => (
                      <li key={link.id}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.label || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.documents && node.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Documenten</h3>
                  <ul className="space-y-1">
                    {node.documents.map((doc, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.children && node.children.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Onderdelen</h3>
                  <ul className="space-y-1">
                    {node.children.map((child) => (
                      <li key={child.id} className="text-muted-foreground">
                        • {child.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
