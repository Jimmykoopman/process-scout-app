import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseSchema } from '@/types/journey';
import { DatabaseView } from './DatabaseView';
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
import { toast } from 'sonner';

export const DatabaseManager = () => {
  const [databases, setDatabases] = useState<DatabaseSchema[]>([
    {
      id: 'default',
      name: 'Klanten Database',
      fields: [
        { id: 'name', name: 'Naam', type: 'text' },
        { id: 'status', name: 'Status', type: 'status', options: ['Actief', 'Inactief', 'Prospect'] },
      ],
      rows: [],
    },
  ]);
  const [currentDatabaseId, setCurrentDatabaseId] = useState('default');
  const [newDbName, setNewDbName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentDatabase = databases.find(db => db.id === currentDatabaseId);

  const handleCreateDatabase = () => {
    if (!newDbName) return;

    const newDb: DatabaseSchema = {
      id: `db-${Date.now()}`,
      name: newDbName,
      fields: [
        { id: 'name', name: 'Naam', type: 'text' },
      ],
      rows: [],
    };

    setDatabases([...databases, newDb]);
    setCurrentDatabaseId(newDb.id);
    setNewDbName('');
    setDialogOpen(false);
    toast.success(`Database "${newDbName}" aangemaakt`);
  };

  const handleSchemaChange = (updatedSchema: DatabaseSchema) => {
    setDatabases(databases.map(db =>
      db.id === updatedSchema.id ? updatedSchema : db
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={currentDatabaseId}
            onChange={(e) => setCurrentDatabaseId(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            {databases.map(db => (
              <option key={db.id} value={db.id}>{db.name}</option>
            ))}
          </select>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe database
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe database</DialogTitle>
              <DialogDescription>
                Maak een nieuwe database aan voor je gegevens
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="db-name">Database naam</Label>
                <Input
                  id="db-name"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  placeholder="Bijv. Klanten, Producten, Taken..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleCreateDatabase} disabled={!newDbName}>
                Aanmaken
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {currentDatabase && (
        <DatabaseView
          schema={currentDatabase}
          onSchemaChange={handleSchemaChange}
        />
      )}
    </div>
  );
};
