import { useState } from 'react';
import { Plus, FolderOpen, Grid3x3, GitBranch, Table, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Workspace, WorkspaceType } from '@/types/journey';

interface WorkspaceManagerProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
  onAddWorkspace: (name: string, type: WorkspaceType) => void;
}

const workspaceIcons = {
  mindmap: Grid3x3,
  flowchart: GitBranch,
  spreadsheet: Table,
  orgchart: Network,
};

export const WorkspaceManager = ({ 
  workspaces, 
  currentWorkspaceId, 
  onWorkspaceChange,
  onAddWorkspace 
}: WorkspaceManagerProps) => {
  const [open, setOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceType, setNewWorkspaceType] = useState<WorkspaceType>('mindmap');

  const handleAddWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onAddWorkspace(newWorkspaceName, newWorkspaceType);
      setNewWorkspaceName('');
      setNewWorkspaceType('mindmap');
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-muted-foreground">Workspaces</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Workspace</DialogTitle>
              <DialogDescription>
                Voeg een nieuwe workspace toe aan je project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Mijn workspace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newWorkspaceType} onValueChange={(value) => setNewWorkspaceType(value as WorkspaceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mindmap">Mindmap</SelectItem>
                    <SelectItem value="flowchart">Flowchart</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    <SelectItem value="orgchart">Organisatie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddWorkspace} className="w-full">
                Toevoegen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        {workspaces.map((workspace) => {
          const Icon = workspaceIcons[workspace.type];
          return (
            <Button
              key={workspace.id}
              variant={workspace.id === currentWorkspaceId ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onWorkspaceChange(workspace.id)}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{workspace.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
