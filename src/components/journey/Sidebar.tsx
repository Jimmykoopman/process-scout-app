import { useState } from 'react';
import { FileText, Settings, Home, Database, Upload, FolderOpen, FileEdit, ChevronDown, ChevronRight, Search, Star, Users, PenTool, CheckSquare, FileSpreadsheet, MoreHorizontal, Plus, Link2, Copy, Trash2, ExternalLink } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
  { title: 'Inbox', icon: FileText, id: 'inbox', badge: 2 },
];

const templateTypes = [
  { title: 'Nieuwe database', icon: Database, id: 'database' },
  { title: 'Nieuwe pagina', icon: FileText, id: 'page' },
  { title: 'Nieuw formulier', icon: FileEdit, id: 'form' },
  { title: 'Kladblok', icon: PenTool, id: 'note' },
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
  const [privateItems, setPrivateItems] = useState<Array<{
    title: string;
    icon: any;
    id: string;
    subItems?: Array<{ title: string; id: string }>;
  }>>([]);
  const [openSections, setOpenSections] = useState({
    private: true,
    teams: true,
  });

  const handleMenuClick = (id: string) => {
    setSelectedView(id);
    onMenuSelect(id);
  };

  const toggleSection = (section: 'private' | 'teams') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddTemplate = (templateType: typeof templateTypes[0]) => {
    const newItem = {
      ...templateType,
      id: `${templateType.id}-${Date.now()}`,
      title: templateType.title,
    };
    setPrivateItems([...privateItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setPrivateItems(privateItems.filter(item => item.id !== id));
  };

  const handleAddToFavorites = (id: string) => {
    // Placeholder for favorite functionality
    console.log('Add to favorites:', id);
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

        {/* Privé */}
        <Collapsible open={openSections.private} onOpenChange={() => toggleSection('private')}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1 group">
                <div className="flex items-center gap-2">
                  {openSections.private ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">Privé</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {templateTypes.map((template) => (
                        <DropdownMenuItem
                          key={template.id}
                          onClick={() => handleAddTemplate(template)}
                        >
                          <template.icon className="h-4 w-4 mr-2" />
                          {template.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTemplate(templateTypes[0]);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {privateItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <div className="group flex items-center">
                        {item.subItems ? (
                          <Collapsible className="flex-1">
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
                            className="flex-1"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => handleAddToFavorites(item.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Toevoegen aan Favorieten
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link2 className="h-4 w-4 mr-2" />
                              Link kopiëren
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Dupliceren
                              <ChevronRight className="ml-auto h-3 w-3" />
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Naam wijzigen
                              <span className="ml-auto text-xs text-muted-foreground">⌘R</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Verplaatsen naar
                              <span className="ml-auto text-xs text-muted-foreground">⌘P</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Verplaatsen naar prullenbak
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in een nieuw tabblad
                              <span className="ml-auto text-xs text-muted-foreground">⌘↵</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                              Laatst bewerkt door Jimmy Koopman
                              <br />
                              Vandaag om 09:23
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
