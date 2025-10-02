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
  ArrowLeft,
  User,
  MoreHorizontal,
  LogOut,
  Layers,
  Tag,
  CreditCard,
  Package
} from "lucide-react";
import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  { title: "Global Analytics", url: "/", icon: Shield },
];

const adminItems = [
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Platform Admins", url: "/admins", icon: Shield },
  { title: "Subtypes", url: "/subtypes", icon: Tag },
  { title: "Repository", url: "/repository", icon: Layers },
  { title: "Notification Center", url: "/notifications", icon: Bell },
  { title: "Logs", url: "/logs", icon: BarChart3 },
];

const enterpriseItems = [
  { title: "Analytics", url: "/analytics", icon: Building2 },
  { title: "Organizations", url: "/organizations", icon: Users },
  { title: "Users", url: "/users", icon: Shield },
  { title: "Notification Center", url: "/notifications", icon: Bell },
  { title: "Logs", url: "/logs", icon: BarChart3 },
  { title: "Account Details", url: "/settings", icon: Settings },
];

const organizationItems = [
  { title: "Analytics", url: "/analytics", icon: Monitor },
  { title: "Users", url: "/users", icon: Users },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Logs", url: "/logs", icon: BarChart3 },
  { title: "Account Details", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const { isPatroller, hasOrgRead, isPlatformAdmin } = usePermissions();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  // Check navigation context
  const isInOrganization = currentPath.includes('/organization/') && currentPath.split('/').length > 2;
  const isInEnterprise = currentPath.includes('/enterprises/');

  // Derive route id from the path if params are unavailable
  const deriveRouteIdFromPath = (): string | undefined => {
    const segments = currentPath.split('/').filter(Boolean);
    const idx = segments.findIndex(seg => seg === 'organization' || seg === 'enterprises');
    if (idx >= 0 && segments.length > idx + 1) return segments[idx + 1];
    return undefined;
  };
  const routeId = id ?? deriveRouteIdFromPath();

  // Fetch organization data to check if it's standalone
  const { data: organizationData } = useQuery({
    queryKey: ['organization', routeId],
    queryFn: async () => {
      if (!routeId || !isInOrganization) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', routeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isInOrganization && !!routeId
  });

  // Determine if licenses/billing should be shown
  const showLicensesAndBilling = isInEnterprise || (isInOrganization && !organizationData?.tenant_id);



  const isActive = (path: string) => {
    if (isInOrganization || isInEnterprise) {
      return currentPath.includes(path);
    }
    return currentPath === path;
  };
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-primary/30" 
      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1";

  const handleLicensesClick = () => {
    if (isInOrganization && routeId) {
      navigate(`/organization/${routeId}/licenses`);
    } else if (isInEnterprise && routeId) {
      navigate(`/enterprises/${routeId}/licenses`);
    }
  };

  const handleBillingClick = () => {
    if (isInOrganization && routeId) {
      navigate(`/organization/${routeId}/billing`);
    } else if (isInEnterprise && routeId) {
      navigate(`/enterprises/${routeId}/billing`);
    }
  };

  const handleSettingsClick = () => {
    // Always navigate to user settings, not account settings
    navigate('/settings');
  };

  const handleSignOut = async () => {
    try {
      // Log logout before signing out
      await supabase.rpc('log_user_action', {
        p_action: 'LOGOUT',
        p_resource_type: 'session',
        p_resource_id: null,
        p_metadata: {
          logout_method: 'manual',
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.log('Failed to log logout action:', logError);
    }

    await signOut();
    navigate('/auth');
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
              <h2 className="text-lg font-bold text-sidebar-foreground">Patroller Console</h2>
              <p className="text-xs text-sidebar-foreground/70">
                {(isInEnterprise || isInOrganization) ? 'Analytics' : 'Platform View'}
              </p>
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
                      <NavLink to="/accounts" className={({ isActive }) => 
                        isActive 
                          ? "bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm backdrop-blur-sm transition-all duration-200" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1"
                      }>
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
                        <NavLink to={routeId ? `/enterprises/${routeId}${item.url}` : '/settings'} className={({ isActive }) => getNavCls({ isActive })}>
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
                      <NavLink to="/accounts" className={({ isActive }) => 
                        isActive 
                          ? "bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm backdrop-blur-sm transition-all duration-200" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1"
                      }>
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
                  {(
                    (isPlatformAdmin || hasOrgRead)
                      ? organizationItems
                      : organizationItems.filter(i => ["Analytics","Incidents","Reports","Logs"].includes(i.title))
                  ).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={routeId ? `/organization/${routeId}${item.url}` : '/settings'} className={({ isActive }) => getNavCls({ isActive })}>
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
                      <NavLink to={item.url} end className={({ isActive }) => getNavCls({ isActive })}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {adminItems
                  .filter(item => item.title !== 'Repository' || isPlatformAdmin)
                  .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={({ isActive }) => getNavCls({ isActive })}>
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
                          <span className="flex-1 text-left">{profile?.fullName || profile?.email || 'Loading...'}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {showLicensesAndBilling && (
                      <>
                        <DropdownMenuItem onClick={handleLicensesClick}>
                          <Package className="mr-2 h-4 w-4" />
                          Licenses Catalog
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleBillingClick}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Billing
                        </DropdownMenuItem>
                      </>
                    )}
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