import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Building2, Mail, Phone, Users, Filter, Loader2, Copy, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccounts, CreateAccountRequest, Account } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const typeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Enterprise": "default",
  "Organization": "secondary"
};

const categoryColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Search & Rescue": "destructive",
  "Lifeguard Service": "default",
  "Park Service": "secondary",
  "Event Medical": "outline",
  "Ski Patrol": "secondary",
  "Harbor Master": "default"
};

export default function Accounts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { accounts, loading, createAccount, canManageAccounts } = useAccounts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All Types");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All Subtypes");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // State for dynamic subtypes
  const [organizationSubtypes, setOrganizationSubtypes] = useState<Array<{ id: string; name: string }>>([]);
  const [enterpriseSubtypes, setEnterpriseSubtypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast({
        title: "Copied",
        description: "Account ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy account ID",
        variant: "destructive",
      });
    }
  };
  
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: "",
    type: "Enterprise",
    category: "",
    primaryEmail: "",
    primaryPhone: "",
    secondaryEmail: "",
    secondaryPhone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    tenantId: undefined
  });

  const [enterpriseSearchOpen, setEnterpriseSearchOpen] = useState(false);
  const [enterpriseQuery, setEnterpriseQuery] = useState("");
  const [enterprises, setEnterprises] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingEnterprises, setLoadingEnterprises] = useState(false);

  // Fetch organization subtypes from platform
  const loadOrganizationSubtypes = async () => {
    try {
      setLoadingSubtypes(true);
      const { data, error } = await supabase
        .from('organization_subtypes')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setOrganizationSubtypes((data || []).map((s: any) => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error('Error loading organization subtypes:', error);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  // Fetch enterprise subtypes from platform
  const loadEnterpriseSubtypes = async () => {
    try {
      setLoadingSubtypes(true);
      const { data, error } = await supabase
        .from('enterprise_subtypes')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setEnterpriseSubtypes((data || []).map((s: any) => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error('Error loading enterprise subtypes:', error);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  // Load subtypes when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      loadOrganizationSubtypes();
      loadEnterpriseSubtypes();
    }
  }, [isAddModalOpen]);

  const loadEnterprises = async (q: string) => {
    try {
      setLoadingEnterprises(true);
      const query = supabase
        .from('enterprises')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(20);
      if (q) {
        // Basic ILIKE match on name
        // @ts-ignore - supabase-js supports ilike
        query.ilike('name', `%${q}%`);
      }
      const { data } = await query;
      setEnterprises((data || []).map((t: any) => ({ id: t.id, name: t.name })));
    } catch (e) {
      // silent fail; input shows empty list
    } finally {
      setLoadingEnterprises(false);
    }
  };

  const handleViewAccount = (accountId: string) => {
    console.log("handleViewAccount called with accountId:", accountId);
    console.log("AccountId type:", typeof accountId);
    console.log("Available accounts:", accounts);
    
    // Validate accountId
    if (!accountId || accountId === 'undefined' || accountId === 'null') {
      console.error("Invalid accountId received:", accountId);
      toast({
        title: "Error",
        description: "Invalid account ID",
        variant: "destructive"
      });
      return;
    }
    
    const account = accounts.find(acc => acc.id === accountId);
    console.log("Found account:", account);
    
    if (!account) {
      toast({
        title: "Error",
        description: "Account not found",
        variant: "destructive"
      });
      return;
    }
    
    if (account?.type === "Enterprise") {
      console.log("Navigating to enterprise:", `/enterprises/${accountId}/analytics`);
      navigate(`/enterprises/${accountId}/analytics`);
    } else {
      console.log("Navigating to organization:", `/organization/${accountId}/analytics`);
      navigate(`/organization/${accountId}/analytics`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.category || !formData.primaryEmail || !formData.primaryPhone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const success = await createAccount(formData);
      if (success) {
        setIsAddModalOpen(false);
        // Reset form
        setFormData({
          name: "",
          type: "Organization",
          category: "",
          primaryEmail: "",
          primaryPhone: "",
          secondaryEmail: "",
          secondaryPhone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          tenantId: undefined
        });
      }
    } catch (error) {
      toast({
        title: "Error Creating Account",
        description: "Failed to create the account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filter and pagination logic
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTypeFilter = selectedTypeFilter === "All Types" || account.type === selectedTypeFilter;
    const matchesCategoryFilter = selectedCategoryFilter === "All Subtypes" || account.category === selectedCategoryFilter;
    return matchesSearch && matchesTypeFilter && matchesCategoryFilter;
  });

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + rowsPerPage);

  const accountTypes = [...new Set(accounts.map(account => account.type))];
  const accountCategories = [...new Set(accounts.map(account => account.category))].filter(cat => cat !== 'Root Account');

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading accounts...</span>
        </div>
      </div>
    );
  }

  // Debug accounts data
  console.log("Accounts data loaded:", accounts);
  console.log("First account:", accounts[0]);

  // Show access denied if not platform admin
  if (!canManageAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">You don't have permission to view accounts</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Accounts
          </h1>
          <p className="text-muted-foreground mt-1">Manage accounts and their settings</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts by name, email, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            {accountTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Subtypes">All Subtypes</SelectItem>
            {accountCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Subtype</TableHead>
                <TableHead className="font-semibold">Team Members</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm text-muted-foreground">Created {account.created}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeColors[account.type] || "default"}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryColors[account.category] || "default"}>
                      {account.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{account.members}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{account.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{account.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleCopyId(account.id)}
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy Account ID</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Copy Account ID
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewAccount(account.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">View More</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={rowsPerPage.toString()} onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAccounts.length)} of {filteredAccounts.length}
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new account in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                className="border-2"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => {
                handleInputChange("type", value as 'Enterprise' | 'Organization');
                // Reset category when type changes
                handleInputChange("category", "");
                // Reset selected enterprise when switching away from Organization
                if (value === 'Enterprise') handleInputChange('tenantId', "");
              }}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Subtype *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select a subtype..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingSubtypes ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">Loading subtypes...</div>
                  ) : formData.type === "Enterprise" ? (
                    enterpriseSubtypes.length > 0 ? (
                      enterpriseSubtypes.map((subtype) => (
                        <SelectItem key={subtype.id} value={subtype.name}>
                          {subtype.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">No enterprise subtypes available</div>
                    )
                  ) : (
                    organizationSubtypes.length > 0 ? (
                      organizationSubtypes.map((subtype) => (
                        <SelectItem key={subtype.id} value={subtype.name}>
                          {subtype.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">No organization subtypes available</div>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email *</Label>
              <Input
                id="primaryEmail"
                type="email"
                className="border-2"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                className="border-2"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                className="border-2"
                value={formData.secondaryEmail}
                onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                className="border-2"
                value={formData.secondaryPhone}
                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                className="border-2"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="border-2"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                className="border-2"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                className="border-2"
                value={formData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
              />
            </div>

            {formData.type === 'Organization' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Assign to Enterprise (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">Organizations can exist independently or be assigned to an enterprise. This can be changed later in Settings.</p>
                <Popover open={enterpriseSearchOpen} onOpenChange={setEnterpriseSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.tenantId ? (enterprises.find(e => e.id === formData.tenantId)?.name || 'Selected enterprise') : 'No enterprise assigned (standalone)'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search enterprises..." value={enterpriseQuery} onValueChange={(v) => {
                        setEnterpriseQuery(v);
                        loadEnterprises(v);
                      }} />
                      <CommandList>
                        <CommandEmpty>{loadingEnterprises ? 'Loading...' : 'No results found.'}</CommandEmpty>
                        <CommandGroup>
                          {formData.tenantId && (
                            <CommandItem value="none" onSelect={() => {
                              handleInputChange('tenantId', '');
                              setEnterpriseSearchOpen(false);
                            }}>
                              <span className="text-muted-foreground">Clear assignment (standalone)</span>
                            </CommandItem>
                          )}
                          {enterprises.map((ent) => (
                            <CommandItem key={ent.id} value={ent.name} onSelect={() => {
                              handleInputChange('tenantId', ent.id);
                              setEnterpriseSearchOpen(false);
                            }}>
                              {ent.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}