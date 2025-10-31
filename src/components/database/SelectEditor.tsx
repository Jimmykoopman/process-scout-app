import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DatabaseField } from '@/types/journey';

interface SelectEditorProps {
  value: string | string[];
  field: DatabaseField;
  onChange: (value: string | string[]) => void;
}

export const SelectEditor = ({ value, field, onChange }: SelectEditorProps) => {
  const [open, setOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const isMultiple = field.type === 'multiselect';

  const options = field.options || [];

  const handleSelect = (option: string) => {
    if (isMultiple) {
      const current = (value as string[]) || [];
      const newValue = current.includes(option)
        ? current.filter(v => v !== option)
        : [...current, option];
      onChange(newValue);
    } else {
      onChange(option);
      setOpen(false);
    }
  };

  const handleAddOption = () => {
    if (newOption && !options.includes(newOption)) {
      field.options = [...options, newOption];
      setNewOption('');
    }
  };

  const displayValue = () => {
    if (isMultiple) {
      const selected = (value as string[]) || [];
      if (selected.length === 0) return 'Selecteer opties...';
      return (
        <div className="flex gap-1 flex-wrap">
          {selected.map(v => (
            <Badge key={v} variant="secondary">{v}</Badge>
          ))}
        </div>
      );
    }
    return value || 'Selecteer optie...';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Zoek of voeg toe..." 
            value={newOption}
            onValueChange={setNewOption}
          />
          <CommandEmpty>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleAddOption}
            >
              <Plus className="mr-2 h-4 w-4" />
              Voeg "{newOption}" toe
            </Button>
          </CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = isMultiple
                ? (value as string[])?.includes(option)
                : value === option;

              return (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
