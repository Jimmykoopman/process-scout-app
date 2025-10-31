import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DatabaseField } from '@/types/journey';
import { PersonSelector } from './PersonSelector';
import { SelectEditor } from './SelectEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface CellEditorProps {
  value: any;
  field: DatabaseField;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (value: any) => void;
  onCancel: () => void;
}

export const CellEditor = ({ value, field, isEditing, onStartEdit, onChange, onCancel }: CellEditorProps) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(tempValue);
    } else if (e.key === 'Escape') {
      setTempValue(value);
      onCancel();
    }
  };

  const renderValue = () => {
    switch (field.type) {
      case 'checkbox':
        return (
          <Checkbox
            checked={value}
            onCheckedChange={onChange}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP', { locale: nl }) : 'Selecteer datum'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'person':
        return (
          <PersonSelector
            value={value}
            onChange={onChange}
          />
        );

      case 'select':
      case 'multiselect':
      case 'status':
        return (
          <SelectEditor
            value={value}
            field={field}
            onChange={onChange}
          />
        );

      case 'number':
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      default:
        if (isEditing) {
          return (
            <Input
              ref={inputRef}
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
              value={tempValue || ''}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => onChange(tempValue)}
              onKeyDown={handleKeyDown}
              className="h-8"
            />
          );
        }
        return (
          <div
            onClick={onStartEdit}
            className="min-h-[32px] px-2 py-1 cursor-pointer hover:bg-muted/50 rounded"
          >
            {value || <span className="text-muted-foreground">Leeg</span>}
          </div>
        );
    }
  };

  return <div className="w-full">{renderValue()}</div>;
};
