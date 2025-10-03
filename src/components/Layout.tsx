import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AccountHeader } from "@/components/AccountHeader";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  
  // Check if user is on patroller dashboard
  const isPatrollerView = location.pathname.includes('/patroller-dashboard');

  const handleSignOut = async () => {
    await signOut();
  };

  // If it's the patroller view, don't use sidebar
  if (isPatrollerView) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Account Context Header */}
          <div className="flex items-center justify-between">
            <AccountHeader />
            <div className="flex items-center gap-2 px-6 py-2">
              <PersonaSwitcher />
            </div>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}