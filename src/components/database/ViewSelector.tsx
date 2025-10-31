import { LayoutGrid, Table, Calendar, Image, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseView } from '@/types/journey';

interface ViewSelectorProps {
  currentView: DatabaseView;
  onViewChange: (view: DatabaseView) => void;
}

export const ViewSelector = ({ currentView, onViewChange }: ViewSelectorProps) => {
  const views: { value: DatabaseView; icon: any; label: string }[] = [
    { value: 'table', icon: Table, label: 'Tabel' },
    { value: 'board', icon: LayoutGrid, label: 'Board' },
    { value: 'calendar', icon: Calendar, label: 'Kalender' },
    { value: 'gallery', icon: Image, label: 'Galerij' },
    { value: 'list', icon: List, label: 'Lijst' },
  ];

  return (
    <div className="flex gap-1 border border-border rounded-md p-1">
      {views.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={currentView === value ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(value)}
          className="gap-2"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};
