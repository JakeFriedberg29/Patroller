import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Plus, Loader2, Layers as LayersIcon, ChevronRight, ChevronLeft, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeMutation } from "@/lib/safeMutation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getValidNextStates, canDeleteReport, type ReportStatus } from "@/utils/statusTransitions";

export default function Repository() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isPlatformAdmin } = usePermissions();
  const tenantId = profile?.profileData?.tenant_id as string | undefined;

  const [platformTemplates, setPlatformTemplates] = useState<Array<{ id: string; name: string; description: string | null }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [assignedOrgCounts, setAssignedOrgCounts] = useState<Record<string, number>>({});
  const [assignedSubtypeCounts, setAssignedSubtypeCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Add Report moved to full-page Report Builder

  // Edit moved to full-page Report Builder

  // Assign Subtypes dialog state
  const [allOrgTypes, setAllOrgTypes] = useState<string[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [assignTemplateId, setAssignTemplateId] = useState<string | null>(null);
  const [initialAssignedTypes, setInitialAssignedTypes] = useState<string[]>([]);
  const [leftList, setLeftList] = useState<string[]>([]);
  const [rightList, setRightList] = useState<string[]>([]);
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [savingAssign, setSavingAssign] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [deleteTemplateName, setDeleteTemplateName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const openAssignModal = async (templateId: string) => {
    try {
      // Refresh available org subtypes (prefer dynamic table per tenant if present)
      let orgTypes: string[] = [];
      if (tenantId) {
        const { data: dyn } = await supabase
          .from('organization_subtypes')
          .select('name')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        const names = (dyn || []).map((r: any) => String(r.name));
        orgTypes = names.length > 0
          ? names
          : ([...(Constants.public.Enums.organization_type as readonly string[])] as string[]);
      } else {
        orgTypes = ([...(Constants.public.Enums.organization_type as readonly string[])] as string[]);
      }
      // Update state for any UI that depends on it, but use local orgTypes to avoid race conditions
      setAllOrgTypes(orgTypes);
      // Show subtype as selected for current tenant assignments to this template
      if (!tenantId) throw new Error('Missing tenant context');
      // 1) Direct type-based assignments (repository_assignments)
      const { data: typeAssignRows, error: typeAssignErr } = await supabase
        .from('repository_assignments')
        .select('target_organization_type')
        .eq('tenant_id', tenantId)
        .eq('element_type', 'report_template')
        .eq('element_id', templateId)
        .eq('target_type', 'organization_type');
      if (typeAssignErr) throw typeAssignErr;
      const typeAssigned = (typeAssignRows || [])
        .map((r: any) => String(r.target_organization_type))
        .filter(Boolean);

      // 2) Organization-level assignments -> map back to subtypes via organizations.organization_subtype
      let orgSubtypeAssigned: string[] = [];
      const { data: orgAssignRows } = await supabase
        .from('repository_assignments')
        .select('target_organization_id')
        .eq('tenant_id', tenantId)
        .eq('element_type', 'report_template')
        .eq('element_id', templateId)
        .eq('target_type', 'organization');
      const orgIds = Array.from(new Set((orgAssignRows || []).map((r: any) => r.target_organization_id).filter(Boolean)));
      if (orgIds.length > 0) {
        const { data: orgRows } = await supabase
          .from('organizations')
          .select('organization_subtype')
          .eq('tenant_id', tenantId)
          .in('id', orgIds as any);
        orgSubtypeAssigned = Array.from(new Set((orgRows || []).map((o: any) => String(o.organization_subtype)).filter(Boolean)));
      }

      const assignedDistinct = Array.from(new Set([
        ...typeAssigned,
        ...orgSubtypeAssigned,
      ]));
      const available = orgTypes.filter(t => !assignedDistinct.includes(t));
      setAssignTemplateId(templateId);
      setInitialAssignedTypes(assignedDistinct);
      setRightList(assignedDistinct);
      setLeftList(available);
      setLeftSelected([]);
      setRightSelected([]);
      setIsAssignOpen(true);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
    }
  };

  const handleInlineStatusChange = async (templateId: string, next: 'draft' | 'ready' | 'published' | 'unpublished' | 'archive') => {
    try {
      // Use RPC which enforces tenancy/role checks
      const { data: rpc, error: rpcErr } = await supabase.rpc('set_report_template_status' as any, {
        p_template_id: templateId,
        p_status: next,
      });
      if (rpcErr) throw rpcErr;
      const rpcObj = (rpc || {}) as any;
      if (rpcObj?.success === false) {
        const err = rpcObj?.error || 'Update failed';
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
      }

      // Refetch the updated status from DB to ensure UI consistency
      const { data: fresh, error: fetchErr } = await supabase
        .from('report_templates')
        .select('status')
        .eq('id', templateId)
        .single();
      if (fetchErr) throw fetchErr;

      setPlatformTemplates(prev => prev.map(t => 
        t.id === templateId ? ({ ...t, status: fresh?.status } as any) : t
      ));
      toast({ title: 'Status updated', description: `Report status changed to ${fresh?.status}.` });
    } catch (e: any) {
      const errorMsg = e?.message || 'Could not update status.';
      toast({ title: 'Update failed', description: errorMsg, variant: 'destructive' });
    }
  };

  const moveRight = () => {
    const toMove = leftSelected;
    setRightList(prev => [...prev, ...toMove].sort());
    setLeftList(prev => prev.filter(i => !toMove.includes(i)));
    setLeftSelected([]);
  };
  const moveLeft = () => {
    const toMove = rightSelected;
    setLeftList(prev => [...prev, ...toMove].sort());
    setRightList(prev => prev.filter(i => !toMove.includes(i)));
    setRightSelected([]);
  };

  const openDeleteDialog = (templateId: string, templateName: string) => {
    setDeleteTemplateId(templateId);
    setDeleteTemplateName(templateName);
    setIsDeleteOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!tenantId || !deleteTemplateId) return;
    setIsDeleting(true);
    try {
      const userId = profile?.profileData?.user_id || null;
      const requestId = crypto.randomUUID();
      await safeMutation(`del-template:${deleteTemplateId}`, {
        op: async () => {
          const { data, error } = await supabase.rpc('delete_report_template', {
            p_tenant_id: tenantId,
            p_template_id: deleteTemplateId,
            p_actor_id: userId,
            p_request_id: requestId,
          });
          if (error) throw error;
          return data;
        },
        refetch: async () => {
          const { data } = await supabase
            .from('report_templates')
            .select('id,name,description,status')
            .eq('tenant_id', tenantId)
            .is('organization_id', null)
            .order('name', { ascending: true });
          const templates = (data || []) as Array<{ id: string; name: string; description: string | null }>;
          setPlatformTemplates(templates);
        },
      });
      toast({ title: 'Report deleted', description: `"${deleteTemplateName}" was permanently removed.` });
    } catch (e: any) {
      console.error('Failed to delete template', e);
      let errorMsg = 'Could not delete report. Please try again.';
      
      // Handle specific error for non-archive status
      if (e?.message?.includes('Only archived reports can be deleted') || e?.message?.includes('Cannot delete report template with status')) {
        errorMsg = 'Only archived reports can be deleted. Please archive this report first.';
      } else if (e?.message) {
        errorMsg = e.message;
      }
      
      toast({ title: 'Delete failed', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTemplateId(null);
      setDeleteTemplateName("");
    }
  };

  const saveAssignments = async () => {
    if (!assignTemplateId || !tenantId) return;
    setSavingAssign(true);
    const toAdd = rightList.filter(t => !initialAssignedTypes.includes(t));
    const toRemove = initialAssignedTypes.filter(t => !rightList.includes(t));
    try {
      const quoteForIn = (v: string) => `"${v.replace(/\"/g, '\\"')}"`;
      const isEnumValue = (v: string) => (Constants.public.Enums.organization_type as readonly string[]).includes(v as any);
      const useEnumTypes = rightList.length > 0 && rightList.every(isEnumValue);

      // 0) Gather existing assignments in this tenant for this template
      let existingTypeAssignments: Array<{ tenant_id: string; target_organization_type: string; element_id: string }> = [];
      let existingOrgAssignments: Array<{ tenant_id: string; target_organization_id: string; element_id: string }> = [];
      if (useEnumTypes) {
        const { data: existingRows, error: existErr } = await supabase
          .from('repository_assignments')
          .select('tenant_id, target_organization_type, element_id')
          .eq('tenant_id', tenantId)
          .eq('element_type', 'report_template')
          .eq('target_type', 'organization_type')
          .eq('element_id', assignTemplateId)
          .in('target_organization_type', rightList as any);
        if (existErr) throw existErr;
        existingTypeAssignments = (existingRows || []) as any;
      } else {
        // Custom subtype path: find organizations in this tenant with those subtypes
        const inCriteria = `(${rightList.map(quoteForIn).join(',')})`;
        const { data: orgRows, error: orgErr } = await supabase
          .from('organizations')
          .select('id')
          .eq('tenant_id', tenantId)
          .filter('organization_subtype', 'in', inCriteria);
        if (orgErr) throw orgErr;
        const orgIdsForSelected = Array.from(new Set((orgRows || []).map((r: any) => r.id))).filter(Boolean);
        if (orgIdsForSelected.length > 0) {
          const { data: existingRows, error: existErr } = await supabase
            .from('repository_assignments')
            .select('tenant_id, target_organization_id, element_id')
            .eq('tenant_id', tenantId)
            .eq('element_type', 'report_template')
            .eq('target_type', 'organization')
            .eq('element_id', assignTemplateId)
            .in('target_organization_id', orgIdsForSelected as any);
          if (existErr) throw existErr;
          existingOrgAssignments = (existingRows || []) as any;
        }
      }

      // 4) Build missing assignment rows across all relevant tenants for all SELECTED subtypes
      const missingRows: any[] = [];
      if (useEnumTypes) {
        for (const subtype of rightList) {
          const already = existingTypeAssignments.some(e => e.tenant_id === tenantId && e.target_organization_type === subtype && e.element_id === assignTemplateId);
          if (!already) {
            missingRows.push({
              tenant_id: tenantId,
              element_type: 'report_template',
              element_id: assignTemplateId,
              target_type: 'organization_type',
              target_organization_type: subtype,
            });
          }
        }
      } else {
        // Recompute org ids for the selected subtypes in this tenant
        const inCriteria = `(${rightList.map(quoteForIn).join(',')})`;
        const { data: orgRows } = await supabase
          .from('organizations')
          .select('id')
          .eq('tenant_id', tenantId)
          .filter('organization_subtype', 'in', inCriteria);
        const orgIdsForSelected = Array.from(new Set((orgRows || []).map((r: any) => r.id))).filter(Boolean);
        for (const orgId of orgIdsForSelected) {
          const already = existingOrgAssignments.some(e => e.tenant_id === tenantId && e.target_organization_id === orgId && e.element_id === assignTemplateId);
          if (!already) {
            missingRows.push({
              tenant_id: tenantId,
              element_type: 'report_template',
              element_id: assignTemplateId,
              target_type: 'organization',
              target_organization_id: orgId,
            });
          }
        }
      }
      if (missingRows.length > 0) {
        const { error: addErr } = await supabase.from('repository_assignments').insert(missingRows);
        if (addErr) throw addErr;
      }

      // 5) Remove deselected subtypes across ALL tenants for all tenant-local template ids sharing this name
      if (toRemove.length > 0) {
        if (useEnumTypes) {
          const { error: delErr } = await supabase
            .from('repository_assignments')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('element_type', 'report_template')
            .eq('target_type', 'organization_type')
            .eq('element_id', assignTemplateId)
            .in('target_organization_type', toRemove as any);
          if (delErr) throw delErr;
        } else {
          const inCriteria = `(${toRemove.map(quoteForIn).join(',')})`;
          const { data: orgRows } = await supabase
            .from('organizations')
            .select('id')
            .eq('tenant_id', tenantId)
            .filter('organization_subtype', 'in', inCriteria);
          const orgIds = (orgRows || []).map((r: any) => r.id);
          if (orgIds.length > 0) {
            const { error: delErr } = await supabase
              .from('repository_assignments')
              .delete()
              .eq('tenant_id', tenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization')
              .eq('element_id', assignTemplateId)
              .in('target_organization_id', orgIds as any);
            if (delErr) throw delErr;
          }
        }
      }

      setIsAssignOpen(false);
      toast({ title: 'Assignments saved', description: 'Subtype assignments updated across tenants.' });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to save assignments', variant: 'destructive' });
    } finally {
      setSavingAssign(false);
    }
  };

  // (Removed inline edit modal/state)

  // No navigation here: let visibility be controlled by nav and server RLS.

  const renderStatusBadge = (statusRaw: string | null | undefined) => {
    const status = String(statusRaw || 'draft').toLowerCase();
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const colorClass =
      status === 'published'
        ? 'bg-green-500 text-white'
        : status === 'ready'
        ? 'bg-blue-500 text-white'
        : status === 'unpublished'
        ? 'bg-red-500 text-white'
        : status === 'archive'
        ? 'bg-yellow-600 text-white'
        : 'bg-gray-500 text-white';
    return <Badge className={`${colorClass} border-transparent`}>{label}</Badge>;
  };

  useEffect(() => {
    const loadTemplates = async () => {
      if (!tenantId) return;
      setIsLoading(true);
      const { data } = await supabase
        .from('report_templates')
        .select('id,name,description,status')
        .eq('tenant_id', tenantId)
        .is('organization_id', null)
        .order('name', { ascending: true });
      const templates = (data || []) as Array<{ id: string; name: string; description: string | null }>;
      setPlatformTemplates(templates);

      // Compute Organizations Assigned count per template via subtype assignments in this tenant
      try {
        const templateIds = templates.map(t => t.id);
        if (templateIds.length > 0) {
          const [
            { data: typeAssignments },
            { data: orgAssignments },
            { data: orgs }
          ] = await Promise.all([
            supabase
              .from('repository_assignments')
              .select('element_id, target_organization_type')
              .eq('tenant_id', tenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization_type')
              .in('element_id', templateIds as any),
            supabase
              .from('repository_assignments')
              .select('element_id, target_organization_id')
              .eq('tenant_id', tenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization')
              .in('element_id', templateIds as any),
            supabase
              .from('organizations')
              .select('id, organization_type, organization_subtype')
              .eq('tenant_id', tenantId)
          ]);

          // Map of organization_type -> count of orgs with that type (for org assignment expansion)
          const orgTypeCounts: Record<string, number> = {};
          const orgIdToSubtype: Record<string, string | null> = {};
          (orgs || []).forEach((o: any) => {
            const ot = String(o.organization_type);
            orgTypeCounts[ot] = (orgTypeCounts[ot] || 0) + 1;
            orgIdToSubtype[String(o.id)] = (o.organization_subtype != null ? String(o.organization_subtype) : null);
          });

          // Organizations Assigned count
          const orgAssignedMap: Record<string, number> = {};
          (typeAssignments || []).forEach((a: any) => {
            const tpl = String(a.element_id);
            const ttype = String(a.target_organization_type);
            orgAssignedMap[tpl] = (orgAssignedMap[tpl] || 0) + (orgTypeCounts[ttype] || 0);
          });
          setAssignedOrgCounts(orgAssignedMap);

          // Subtypes Assigned count (distinct subtypes per template)
          const subtypeSetByTemplate: Record<string, Set<string>> = {};
          (typeAssignments || []).forEach((a: any) => {
            const tpl = String(a.element_id);
            const subtype = String(a.target_organization_type);
            if (!subtypeSetByTemplate[tpl]) subtypeSetByTemplate[tpl] = new Set();
            subtypeSetByTemplate[tpl].add(subtype);
          });
          (orgAssignments || []).forEach((a: any) => {
            const tpl = String(a.element_id);
            const orgId = String(a.target_organization_id);
            const subtype = orgIdToSubtype[orgId];
            if (!subtype) return;
            if (!subtypeSetByTemplate[tpl]) subtypeSetByTemplate[tpl] = new Set();
            subtypeSetByTemplate[tpl].add(subtype);
          });
          const subtypeCountMap: Record<string, number> = {};
          Object.keys(subtypeSetByTemplate).forEach(tpl => {
            subtypeCountMap[tpl] = subtypeSetByTemplate[tpl].size;
          });
          setAssignedSubtypeCounts(subtypeCountMap);
        } else {
          setAssignedOrgCounts({});
          setAssignedSubtypeCounts({});
        }
      } catch {
        setAssignedOrgCounts({});
        setAssignedSubtypeCounts({});
      }
      setIsLoading(false);
    };
    loadTemplates();
  }, [tenantId]);

  // Filter reports based on search term and status
  const filteredTemplates = platformTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || (template as any).status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-5 w-5" /> Repository</h1>
        <p className="text-sm text-muted-foreground">Manage platform elements</p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">Platform-level report templates</div>
            <Button size="sm" onClick={() => navigate('/repository/reports/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search reports by name or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Report Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Subtypes Assigned</TableHead>
                    <TableHead className="font-semibold">Organizations Assigned</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map(t => (
                    <TableRow key={t.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.description || ''}</TableCell>
                      <TableCell className="text-muted-foreground">{assignedSubtypeCounts[t.id] || 0}</TableCell>
                      <TableCell className="text-muted-foreground">{assignedOrgCounts[t.id] || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <Select value={(t as any).status || 'draft'} onValueChange={(v) => handleInlineStatusChange(t.id, v as any)}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={(t as any).status || 'draft'}>
                              {((t as any).status || 'draft').charAt(0).toUpperCase() + ((t as any).status || 'draft').slice(1)}
                            </SelectItem>
                            {getValidNextStates(((t as any).status || 'draft') as ReportStatus).map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openAssignModal(t.id)}>
                            <LayersIcon className="h-4 w-4" />
                            <span className="sr-only">Assign Subtypes</span>
                          </Button>
                          {canDeleteReport(((t as any).status || 'draft') as ReportStatus) && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDeleteDialog(t.id, t.name)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/repository/reports/${t.id}`)}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">View More</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-muted-foreground text-center py-6">
                        {searchTerm ? `No reports found matching "${searchTerm}".` : "No platform forms found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Report modal removed; handled by Report Builder page */}

          {/* Edit moved to full-page Report Builder */}

          {/* Assign Subtypes Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Assign Organization Subtypes</DialogTitle>
                <DialogDescription>Select subtypes that should have this report template available.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <div className="font-medium mb-2 text-sm">Unselected</div>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {leftList.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="accent-primary" checked={leftSelected.includes(item)} onChange={(e) => {
                          setLeftSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                        }} />
                        <span>{item.split('_').join(' ')}</span>
                      </label>
                    ))}
                    {leftList.length === 0 && (
                      <div className="text-xs text-muted-foreground">None</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={moveRight}
                    disabled={leftSelected.length === 0}
                    className="w-32 gap-2 border bg-background hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 shadow-sm"
                  >
                    <span>Add</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={moveLeft}
                    disabled={rightSelected.length === 0}
                    className="w-32 gap-2 border bg-background hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Remove</span>
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium mb-2 text-sm">Selected</div>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {rightList.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="accent-primary" checked={rightSelected.includes(item)} onChange={(e) => {
                          setRightSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                        }} />
                        <span>{item.split('_').join(' ')}</span>
                      </label>
                    ))}
                    {rightList.length === 0 && (
                      <div className="text-xs text-muted-foreground">None</div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAssignOpen(false)} disabled={savingAssign}>Cancel</Button>
                <Button onClick={saveAssignments} disabled={savingAssign} className="gap-2">
                  {savingAssign && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Assignments
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete report template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove “{deleteTemplateName}” from all assigned organization subtypes and delete it from the repository. Submitted reports will remain visible in accounts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTemplate}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}


