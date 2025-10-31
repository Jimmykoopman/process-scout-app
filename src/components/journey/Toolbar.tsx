import { Plus, Square, Circle, Diamond, Minus, FileText, Database, FileEdit, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NodeShape, PageType } from '@/types/journey';

interface ToolbarProps {
  mode: 'mindmap' | 'document' | 'workspace';
  onAddNode?: () => void;
  onShapeChange?: (shape: NodeShape) => void;
  selectedShape?: NodeShape;
  onCreatePage?: (type: PageType) => void;
  onFileUpload?: () => void;
}

export const Toolbar = ({ 
  mode, 
  onAddNode, 
  onShapeChange, 
  selectedShape,
  onCreatePage,
  onFileUpload 
}: ToolbarProps) => {
  // Workspace toolbar - shown on workspace home
  if (mode === 'workspace' && onCreatePage) {
    return (
      <div className="border-b border-border p-2 flex items-center gap-2 bg-card">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Voeg toe
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onCreatePage('mindmap')}>
              <Circle className="h-4 w-4 mr-2" />
              Mindmap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreatePage('document')}>
              <FileText className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreatePage('database')}>
              <Database className="h-4 w-4 mr-2" />
              Database
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreatePage('form')}>
              <FileEdit className="h-4 w-4 mr-2" />
              Formulier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="gap-2" onClick={onFileUpload}>
          <Upload className="w-4 h-4" />
          Uploaden
        </Button>
      </div>
    );
  }

  // Mindmap toolbar - shown when editing mindmap
  if (mode === 'mindmap' && onAddNode && onShapeChange && selectedShape) {
    return (
      <div className="border-b border-border p-2 flex items-center gap-2 bg-card">
        <Button onClick={onAddNode} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Voeg node toe
        </Button>
        
        <div className="flex gap-1 border-l border-border pl-2 ml-2">
          <Button
            variant={selectedShape === 'circle' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onShapeChange('circle')}
            title="Cirkel"
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedShape === 'square' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onShapeChange('square')}
            title="Vierkant"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedShape === 'diamond' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onShapeChange('diamond')}
            title="Diamant"
          >
            <Diamond className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedShape === 'rectangle' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onShapeChange('rectangle')}
            title="Rechthoek"
          >
            <Minus className="w-4 h-4 rotate-90" />
          </Button>
        </div>

        <div className="border-l border-border pl-2 ml-2 flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={onFileUpload}>
            <Upload className="w-4 h-4" />
            Uploaden
          </Button>
        </div>
      </div>
    );
  }

  // Document toolbar is handled by DocumentEditor itself
  return null;
};
