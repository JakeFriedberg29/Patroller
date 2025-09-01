import { 
  Building2, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Settings,
  Bell,
  Monitor,
  Package,
  ArrowLeft,
  User,
  ChevronDown,
  MapPin
} from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Global View", url: "/", icon: Shield },
];

const adminItems = [
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Platform Admins", url: "/admins", icon: Shield },
  { title: "Notification Center", url: "/notifications", icon: Bell },
  { title: "Logs", url: "/logs", icon: BarChart3 },
];

const organizationItems = [
  { title: "Mission Control", url: "/mission-control", icon: Monitor },
  { title: "Team Directory", url: "/team-directory", icon: Users },
  { title: "Locations", url: "/locations", icon: MapPin },
  { title: "Equipment", url: "/equipment", icon: Package },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Logs", url: "/logs", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { id } = useParams();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  // Check if we're in an organization context
  const isInOrganization = currentPath.includes('/accounts/') && currentPath.split('/').length > 2;

  const isActive = (path: string) => {
    if (isInOrganization) {
      return currentPath.includes(path);
    }
    return currentPath === path;
  };
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">MissionLog</h2>
              <p className="text-xs text-sidebar-foreground/70">Platform Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {isInOrganization ? (
          <>
            {/* Back to Accounts Button */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/accounts" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-3 h-4 w-4" />
                        {!isCollapsed && <span>Back to Accounts</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Organization Menu Items */}
            <SidebarGroup>
              <SidebarGroupLabel>Organization</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {organizationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={`/accounts/${id}${item.url}`} className={getNavCls}>
                          <item.icon className="mr-3 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent">
                    <User className="h-4 w-4" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">Jake Friedberg</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}