import { useState } from 'react';
import { Plus, Type, Hash, CheckSquare, Calendar, User, Link, Mail, Phone, FileText, List, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldType } from '@/types/journey';

interface FieldTypeSelectorProps {
  onAddField: (name: string, type: FieldType) => void;
}

const fieldTypes: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Tekst', icon: Type },
  { type: 'number', label: 'Nummer', icon: Hash },
  { type: 'select', label: 'Selecteren', icon: Circle },
  { type: 'multiselect', label: 'Meerdere selecteren', icon: List },
  { type: 'status', label: 'Status', icon: Circle },
  { type: 'date', label: 'Datum', icon: Calendar },
  { type: 'person', label: 'Persoon', icon: User },
  { type: 'checkbox', label: 'Selectievakje', icon: CheckSquare },
  { type: 'url', label: 'URL', icon: Link },
  { type: 'email', label: 'E-mail', icon: Mail },
  { type: 'phone', label: 'Telefoon', icon: Phone },
  { type: 'files', label: 'Bestanden', icon: FileText },
];

export const FieldTypeSelector = ({ onAddField }: FieldTypeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [fieldName, setFieldName] = useState('');

  const handleAdd = () => {
    if (fieldName && selectedType) {
      onAddField(fieldName, selectedType);
      setFieldName('');
      setSelectedType(null);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Eigenschap toevoegen</DialogTitle>
          <DialogDescription>
            Kies een type voor je nieuwe veld
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="field-name">Naam van eigenschap</Label>
            <Input
              id="field-name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Vul een naam in..."
            />
          </div>

          <div>
            <Label>Type selecteren</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {fieldTypes.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="justify-start h-auto py-3"
                  onClick={() => setSelectedType(type)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleAdd} disabled={!fieldName || !selectedType}>
            Toevoegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
