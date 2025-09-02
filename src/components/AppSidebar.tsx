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
  MoreHorizontal,
  MapPin,
  LogOut
} from "lucide-react";
import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom";

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Global View", url: "/", icon: Shield },
];

const adminItems = [
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Platform Admins", url: "/admins", icon: Shield },
  { title: "Notification Center", url: "/notifications", icon: Bell },
  { title: "Logs", url: "/logs", icon: BarChart3 },
];

const enterpriseItems = [
  { title: "Enterprise View", url: "/enterprise-view", icon: Building2 },
  { title: "Organizations", url: "/organizations", icon: Users },
  { title: "Enterprise Admins", url: "/enterprise-admins", icon: Shield },
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
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  // Check navigation context
  const isInOrganization = currentPath.includes('/accounts/') && currentPath.split('/').length > 2;
  const isInEnterprise = currentPath.includes('/enterprises/') || 
    (currentPath.includes('/accounts/') && currentPath.includes('/enterprise'));

  const isActive = (path: string) => {
    if (isInOrganization || isInEnterprise) {
      return currentPath.includes(path);
    }
    return currentPath === path;
  };
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-blue-500 font-medium transition-all duration-200 hover:scale-105" 
      : "text-white hover:bg-sidebar-accent/50 transition-all duration-200 hover:scale-105";

  const handleSettingsClick = () => {
    if (isInOrganization) {
      navigate(`/accounts/${id}/settings`);
    } else if (isInEnterprise) {
      navigate(`/enterprises/${id}/settings`);
    } else {
      navigate('/settings');
    }
  };

  const handleSignOut = () => {
    // Add sign out logic here
    console.log('Sign out clicked');
  };

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
        {isInEnterprise ? (
          <>
            {/* Back to Accounts Button */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/accounts" className="text-white hover:bg-sidebar-accent/50 transition-all duration-200 hover:scale-105">
                        <ArrowLeft className="mr-3 h-4 w-4" />
                        {!isCollapsed && <span>Back to Accounts</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Enterprise Menu Items */}
            <SidebarGroup>
              <SidebarGroupLabel>Enterprise</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {enterpriseItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={`/enterprises/${id}${item.url}`} className={getNavCls}>
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
        ) : isInOrganization ? (
          <>
            {/* Back to Accounts Button */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/accounts" className="text-white hover:bg-sidebar-accent/50 transition-all duration-200 hover:scale-105">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent">
                      <User className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">Jake Friedberg</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}