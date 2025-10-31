import { useState } from 'react';
import { FileText, Settings, Home, Database, Upload, FolderOpen, FileEdit, ChevronDown, ChevronRight, Search, Star, Users, PenTool, CheckSquare, FileSpreadsheet } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { WorkspaceManager } from './WorkspaceManager';
import { DocumentLibrary } from './DocumentLibrary';
import { Workspace, Document } from '@/types/journey';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AppSidebarProps {
  onMenuSelect: (menuId: string) => void;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
  onAddWorkspace: (name: string, type: any) => void;
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}

const mainItems = [
  { title: 'Startpagina', icon: Home, id: 'home' },
  { title: 'Meetings', icon: Users, id: 'meetings' },
  { title: 'Notion AI', icon: Star, id: 'notion-ai' },
  { title: 'Inbox', icon: FileText, id: 'inbox', badge: 2 },
];

const favoriteItems = [
  { title: 'Departments', icon: Users, id: 'departments' },
  { title: 'All tasks', icon: CheckSquare, id: 'all-tasks' },
];

const privateItems = [
  { title: 'Nieuwe database', icon: Database, id: 'database' },
  { 
    title: 'Takentracker', 
    icon: CheckSquare, 
    id: 'takentracker',
    subItems: [
      { title: 'Alle taken', id: 'alle-taken' },
      { title: 'Op status', id: 'op-status' },
      { title: 'Mijn taken', id: 'mijn-taken' },
    ]
  },
  { title: 'Nieuw formulier', icon: FileEdit, id: 'nieuw-formulier' },
  { title: 'Nieuwe database', icon: FileSpreadsheet, id: 'nieuwe-database' },
  { title: 'Kladblok', icon: PenTool, id: 'kladblok' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({
    favorites: true,
    private: true,
    teams: true,
  });

  const handleMenuClick = (id: string) => {
    setSelectedView(id);
    onMenuSelect(id);
  };

  const toggleSection = (section: 'favorites' | 'private' | 'teams') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <WorkspaceManager
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onWorkspaceChange={onWorkspaceChange}
          onAddWorkspace={onAddWorkspace}
        />
        
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoeken"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent/50 border-0"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Items */}
        <SidebarGroup className="py-2">
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => handleMenuClick(item.id)}
                  isActive={selectedView === item.id}
                  className="relative"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Favorieten */}
        <Collapsible open={openSections.favorites} onOpenChange={() => toggleSection('favorites')}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">Favorieten</span>
                {openSections.favorites ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => handleMenuClick(item.id)}
                        isActive={selectedView === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Privé */}
        <Collapsible open={openSections.private} onOpenChange={() => toggleSection('private')}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">Privé</span>
                {openSections.private ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {privateItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      {item.subItems ? (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton 
                              onClick={() => handleMenuClick(item.id)}
                              isActive={selectedView === item.id}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.id}>
                                  <SidebarMenuSubButton 
                                    onClick={() => handleMenuClick(subItem.id)}
                                    isActive={selectedView === subItem.id}
                                  >
                                    <span className="text-xs">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton 
                          onClick={() => handleMenuClick(item.id)}
                          isActive={selectedView === item.id}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Teamruimten */}
        <Collapsible open={openSections.teams} onOpenChange={() => toggleSection('teams')}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">Teamruimten</span>
                {openSections.teams ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {workspaces.map((workspace) => (
                    <SidebarMenuItem key={workspace.id}>
                      <SidebarMenuButton 
                        onClick={() => {
                          onWorkspaceChange(workspace.id);
                          handleMenuClick('workspace-' + workspace.id);
                        }}
                        isActive={currentWorkspaceId === workspace.id}
                      >
                        <Home className="h-4 w-4" />
                        <span>{workspace.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
