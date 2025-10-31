import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Type
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

export const DocumentEditor = ({ content = '', onChange }: DocumentEditorProps) => {
  const [selectedText, setSelectedText] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    setSelectedText(selection ? selection.toString().length > 0 : false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = `<img src="${event.target?.result}" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, img);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex-1 flex bg-background">
      {/* Editor Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="w-full max-w-[21cm] bg-white shadow-lg min-h-[29.7cm] p-[2cm]">
          <div
            ref={editorRef}
            contentEditable
            className="outline-none min-h-full text-foreground"
            onInput={handleInput}
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '12pt',
              lineHeight: '1.6'
            }}
          />
        </div>
      </div>

      {/* Right Sidebar with Toolbar */}
      <div className="w-64 border-l border-border bg-card p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Lettertype</h3>
          <Select onValueChange={(value) => handleFormat('fontName', value)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Lettertype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Grootte</h3>
          <Select onValueChange={(value) => handleFormat('fontSize', value)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Grootte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">8pt</SelectItem>
              <SelectItem value="2">10pt</SelectItem>
              <SelectItem value="3">12pt</SelectItem>
              <SelectItem value="4">14pt</SelectItem>
              <SelectItem value="5">18pt</SelectItem>
              <SelectItem value="6">24pt</SelectItem>
              <SelectItem value="7">36pt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Opmaak</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('bold')}
              title="Vetgedrukt"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('italic')}
              title="Cursief"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('underline')}
              title="Onderstreept"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Uitlijning</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('justifyLeft')}
              title="Links uitlijnen"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('justifyCenter')}
              title="Centreren"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('justifyRight')}
              title="Rechts uitlijnen"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Lijsten</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('insertUnorderedList')}
              title="Opsommingslijst"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleFormat('insertOrderedList')}
              title="Genummerde lijst"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Invoegen</h3>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              Afbeelding
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                const url = prompt('Voer URL in:');
                if (url) handleFormat('createLink', url);
              }}
            >
              <LinkIcon className="h-4 w-4" />
              Link
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
};
