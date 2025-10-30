import { FileText, Settings, Home, Database, Upload } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  onMenuSelect?: (menu: string) => void;
}

const menuItems = [
  { title: 'Home', icon: Home, id: 'home' },
  { title: 'Documenten', icon: FileText, id: 'documents' },
  { title: 'Database', icon: Database, id: 'database' },
  { title: 'Upload', icon: Upload, id: 'upload' },
  { title: 'Instellingen', icon: Settings, id: 'settings' },
];

export function AppSidebar({ onMenuSelect }: AppSidebarProps) {
  return (
    <Sidebar className="w-60 border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onMenuSelect?.(item.id)}
                    className="hover:bg-accent"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
