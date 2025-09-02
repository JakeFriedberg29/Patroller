import { useLocation, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";

// Mock data for enterprises
const mockEnterprises = [
  {
    id: "1",
    name: "MegaCorp Industries",
    type: "Enterprise",
    status: "Active"
  }
];

// Mock data for organizations (from AccountDetail.tsx)
const mockOrganizations = [
  {
    id: "1",
    name: "Mountain Rescue Team Alpha",
    type: "Search & Rescue",
    status: "Active"
  },
  {
    id: "2", 
    name: "Coastal Lifeguard Services",
    type: "Lifeguard Service",
    status: "Active"
  },
  {
    id: "3",
    name: "Wilderness Adventures Inc",
    type: "Adventure Tourism", 
    status: "Active"
  },
  {
    id: "4",
    name: "Coastal Lifeguard Division",
    type: "Lifeguard Service",
    status: "Active"
  },
  {
    id: "5",
    name: "Mountain Ridge SAR",
    type: "Search & Rescue",
    status: "Active"
  }
];

export function AccountHeader() {
  const location = useLocation();
  const params = useParams();
  
  // Check if we're in an Enterprise or Organization context
  const isInEnterprise = location.pathname.startsWith('/enterprises/');
  const isInOrganization = location.pathname.startsWith('/organization/');
  
  if (!isInEnterprise && !isInOrganization) {
    return null;
  }
  
  const accountId = params.id;
  
  if (isInEnterprise && accountId) {
    const enterprise = mockEnterprises.find(e => e.id === accountId);
    
    if (enterprise) {
      return (
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Currently viewing Enterprise:</span>
                <span className="font-semibold text-foreground">{enterprise.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {enterprise.type}
                </Badge>
                <Badge variant={enterprise.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                  {enterprise.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
  
  if (isInOrganization && accountId) {
    const organization = mockOrganizations.find(o => o.id === accountId);
    
    if (organization) {
      return (
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Currently viewing Organization:</span>
                <span className="font-semibold text-foreground">{organization.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {organization.type}
                </Badge>
                <Badge variant={organization.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                  {organization.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
  
  return null;
}