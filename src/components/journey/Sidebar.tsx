import { useState } from 'react';
import { FileText, Settings, Home, Database, Upload, FolderOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { WorkspaceManager } from './WorkspaceManager';
import { DocumentLibrary } from './DocumentLibrary';
import { Workspace, Document } from '@/types/journey';

interface AppSidebarProps {
  onMenuSelect: (menuId: string) => void;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
  onAddWorkspace: (name: string, type: any) => void;
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}

const items = [
  { title: 'Home', icon: Home, id: 'home' },
  { title: 'Documenten', icon: FileText, id: 'documenten' },
  { title: 'Database', icon: Database, id: 'database' },
  { title: 'Upload', icon: Upload, id: 'upload' },
  { title: 'Instellingen', icon: Settings, id: 'settings' },
];

export function AppSidebar({ 
  onMenuSelect,
  workspaces,
  currentWorkspaceId,
  onWorkspaceChange,
  onAddWorkspace,
  documents,
  onDocumentClick
}: AppSidebarProps) {
  const [selectedView, setSelectedView] = useState<string>('home');

  const handleMenuClick = (id: string) => {
    setSelectedView(id);
    onMenuSelect(id);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <WorkspaceManager
              workspaces={workspaces}
              currentWorkspaceId={currentWorkspaceId}
              onWorkspaceChange={onWorkspaceChange}
              onAddWorkspace={onAddWorkspace}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    onClick={() => handleMenuClick(item.id)}
                    isActive={selectedView === item.id}
                  >
                    <a href="#">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {selectedView === 'documenten' && (
          <SidebarGroup>
            <SidebarGroupContent className="px-2">
              <DocumentLibrary 
                documents={documents}
                onDocumentClick={onDocumentClick}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
