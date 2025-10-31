import { useState } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Person } from '@/types/journey';

// Mock data - in a real app, this would come from a database
const mockPersons: Person[] = [
  { id: '1', name: 'Jimmy Koopman', email: 'jimmy@example.com' },
  { id: '2', name: 'Tycho Elings', email: 'tycho@example.com' },
  { id: '3', name: 'Sarah de Vries', email: 'sarah@example.com' },
  { id: '4', name: 'Tom Bakker', email: 'tom@example.com' },
];

interface PersonSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export const PersonSelector = ({ value, onChange, multiple = false }: PersonSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedPersons = multiple
    ? mockPersons.filter(p => (value as string[])?.includes(p.id))
    : mockPersons.find(p => p.id === value);

  const handleSelect = (personId: string) => {
    if (multiple) {
      const current = (value as string[]) || [];
      const newValue = current.includes(personId)
        ? current.filter(id => id !== personId)
        : [...current, personId];
      onChange(newValue);
    } else {
      onChange(personId);
      setOpen(false);
    }
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
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {multiple
              ? (selectedPersons as Person[]).length > 0
                ? `${(selectedPersons as Person[]).length} geselecteerd`
                : 'Selecteer personen...'
              : (selectedPersons as Person)?.name || 'Selecteer persoon...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Zoek persoon..." />
          <CommandEmpty>Geen persoon gevonden.</CommandEmpty>
          <CommandGroup>
            {mockPersons.map((person) => {
              const isSelected = multiple
                ? (value as string[])?.includes(person.id)
                : value === person.id;

              return (
                <CommandItem
                  key={person.id}
                  value={person.name}
                  onSelect={() => handleSelect(person.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div>
                    <div className="font-medium">{person.name}</div>
                    {person.email && (
                      <div className="text-xs text-muted-foreground">{person.email}</div>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
