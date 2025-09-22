import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Plus, Loader2, Layers as LayersIcon, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
      if (tenantId) {
        const { data: dyn } = await supabase
          .from('organization_subtypes')
          .select('name')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        const names = (dyn || []).map((r: any) => String(r.name));
        if (names.length > 0) setAllOrgTypes(names);
        else setAllOrgTypes([...(Constants.public.Enums.organization_type as readonly string[])] as string[]);
      } else {
        setAllOrgTypes([...(Constants.public.Enums.organization_type as readonly string[])] as string[]);
      }
      // Show subtype as selected if ANY tenant currently has it assigned
      const { data, error } = await supabase
        .from('platform_assignments')
        .select('target_organization_type')
        .eq('element_type', 'report_template')
        .eq('element_id', templateId)
        .eq('target_type', 'organization_type');
      if (error) throw error;
      const assignedDistinct = Array.from(new Set((data || [])
        .map((r: any) => String(r.target_organization_type))
        .filter(Boolean)));
      const available = allOrgTypes.filter(t => !assignedDistinct.includes(t));
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

  const handleInlineStatusChange = async (templateId: string, next: 'draft' | 'ready' | 'published' | 'unpublished') => {
    try {
      const { data, error } = await supabase.rpc('set_report_template_status' as any, {
        p_template_id: templateId,
        p_status: next,
      });
      const ok = (data as any)?.success !== false;
      if (error || !ok) throw error || new Error((data as any)?.error || 'update_failed');
      setPlatformTemplates(prev => prev.map(t => t.id === templateId ? ({ ...t, status: next } as any) : t));
      const { title, description } = { title: 'Status updated', description: `Report set to ${next}.` };
      toast({ title, description });
    } catch (e: any) {
      toast({ title: 'Update failed', description: 'Could not update status.', variant: 'destructive' });
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
      // 1) Remove subtype/platform assignments for this template in this tenant
      await supabase
        .from('platform_assignments')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('element_type', 'report_template' as any)
        .eq('target_type', 'organization_type' as any)
        .eq('element_id', deleteTemplateId);

      // 2) Remove any direct organization assignments (legacy), if table exists
      try {
        await supabase
          .from('organization_report_templates' as any)
          .delete()
          .eq('tenant_id', tenantId)
          .eq('template_id', deleteTemplateId);
      } catch {}

      // 3) Delete the template itself (reports keep visibility; template_id will be set NULL by FK)
      const { error: delErr } = await supabase
        .from('report_templates')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('id', deleteTemplateId);
      if (delErr) throw delErr;

      // 4) Audit log
      const userId = profile?.profileData?.user_id || null;
      await supabase.from('audit_logs').insert({
        tenant_id: tenantId,
        user_id: userId as any,
        action: 'DELETE_REPORT_TEMPLATE',
        resource_type: 'report_template',
        resource_id: deleteTemplateId,
        metadata: { name: deleteTemplateName } as any,
      } as any);

      // 5) Update UI state
      setPlatformTemplates(prev => prev.filter(t => t.id !== deleteTemplateId));
      setAssignedOrgCounts(prev => {
        const { [deleteTemplateId]: _omit, ...rest } = prev;
        return rest;
      });
      toast({ title: 'Report deleted', description: `“${deleteTemplateName}” was permanently removed.` });
    } catch (e: any) {
      console.error('Failed to delete template', e);
      toast({ title: 'Delete failed', description: 'Could not delete report. Please try again.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTemplateId(null);
      setDeleteTemplateName("");
    }
  };

  const saveAssignments = async () => {
    if (!assignTemplateId) return;
    setSavingAssign(true);
    const toAdd = rightList.filter(t => !initialAssignedTypes.includes(t));
    const toRemove = initialAssignedTypes.filter(t => !rightList.includes(t));
    try {
      // 0) Load source template (name/description/schema) so we can replicate per-tenant
      const { data: srcTemplate, error: srcErr } = await supabase
        .from('report_templates')
        .select('id, name, description, template_schema')
        .eq('id', assignTemplateId)
        .single();
      if (srcErr || !srcTemplate) throw (srcErr || new Error('Source template not found'));

      // 1) Expand selected subtypes to ALL tenant_ids that have orgs of those subtypes
      let tenantsForSelected: string[] = [];
      if (rightList.length > 0) {
        const { data: tenantRows, error: tenantErr } = await supabase
          .from('organizations')
          .select('tenant_id, organization_type')
          .in('organization_type', rightList as any);
        if (tenantErr) throw tenantErr;
        tenantsForSelected = Array.from(new Set((tenantRows || []).map((r: any) => r.tenant_id))).filter(Boolean);
      }

      // 2) Ensure a tenant-local report_template exists per tenant (by name) and map tenant -> template_id
      const tenantToTemplateId: Record<string, string> = {};
      if (tenantsForSelected.length > 0) {
        // Fetch any existing tenant-local templates by name in bulk
        const { data: existingTemplates } = await supabase
          .from('report_templates')
          .select('id, tenant_id')
          .in('tenant_id', tenantsForSelected)
          .eq('name', srcTemplate.name)
          .is('organization_id', null);
        (existingTemplates || []).forEach((rt: any) => {
          if (rt.tenant_id && rt.id) tenantToTemplateId[rt.tenant_id] = rt.id;
        });
        // Insert missing tenant-local templates
        const missingTenants = tenantsForSelected.filter(t => !tenantToTemplateId[t]);
        if (missingTenants.length > 0) {
          const rows = missingTenants.map(t => ({
            tenant_id: t,
            name: srcTemplate.name,
            description: srcTemplate.description,
            template_schema: (srcTemplate as any).template_schema,
            is_active: true,
            organization_id: null,
            created_by: profile?.profileData?.user_id || null,
          }));
          const { data: inserted, error: insErr } = await supabase
            .from('report_templates')
            .insert(rows)
            .select('id, tenant_id');
          if (insErr) throw insErr;
          (inserted || []).forEach((rt: any) => {
            if (rt.tenant_id && rt.id) tenantToTemplateId[rt.tenant_id] = rt.id;
          });
        }
      }

      // 3) Fetch existing assignments for these tenants/subtypes referencing the tenant-local template ids
      let existing: Array<{ tenant_id: string; target_organization_type: string; element_id: string }> = [];
      const templateIdsAcrossTenants = Object.values(tenantToTemplateId);
      if (tenantsForSelected.length > 0 && rightList.length > 0 && templateIdsAcrossTenants.length > 0) {
        const { data: existingRows, error: existErr } = await supabase
          .from('platform_assignments')
          .select('tenant_id, target_organization_type, element_id')
          .eq('element_type', 'report_template')
          .eq('target_type', 'organization_type')
          .in('tenant_id', tenantsForSelected)
          .in('element_id', templateIdsAcrossTenants)
          .in('target_organization_type', rightList as any);
        if (existErr) throw existErr;
        existing = (existingRows || []) as any;
      }

      // 4) Build missing assignment rows across all relevant tenants for all SELECTED subtypes
      const missingRows: any[] = [];
      for (const t of tenantsForSelected) {
        const templateId = tenantToTemplateId[t];
        if (!templateId) continue;
        for (const subtype of rightList) {
          const already = existing.some(e => e.tenant_id === t && e.target_organization_type === subtype && e.element_id === templateId);
          if (!already) {
            missingRows.push({
              tenant_id: t,
              element_type: 'report_template',
              element_id: templateId,
              target_type: 'organization_type',
              target_organization_type: subtype,
            });
          }
        }
      }
      if (missingRows.length > 0) {
        const { error: addErr } = await supabase.from('platform_assignments').insert(missingRows);
        if (addErr) throw addErr;
      }

      // 5) Remove deselected subtypes across ALL tenants for all tenant-local template ids sharing this name
      if (toRemove.length > 0) {
        const { data: allRt } = await supabase
          .from('report_templates')
          .select('id')
          .eq('name', srcTemplate.name)
          .is('organization_id', null);
        const allTemplateIds = (allRt || []).map((r: any) => r.id);
        if (allTemplateIds.length > 0) {
          const { error: delErr } = await supabase
            .from('platform_assignments')
            .delete()
            .eq('element_type', 'report_template')
            .eq('target_type', 'organization_type')
            .in('element_id', allTemplateIds)
            .in('target_organization_type', toRemove as any);
          if (delErr) throw delErr;
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
          const [{ data: assignments }, { data: orgs }] = await Promise.all([
            supabase
              .from('platform_assignments')
              .select('element_id, target_organization_type')
              .eq('tenant_id', tenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization_type')
              .in('element_id', templateIds as any),
            supabase
              .from('organizations')
              .select('organization_type')
              .eq('tenant_id', tenantId)
          ]);

          const orgTypeCounts: Record<string, number> = {};
          (orgs || []).forEach((o: any) => {
            const ot = String(o.organization_type);
            orgTypeCounts[ot] = (orgTypeCounts[ot] || 0) + 1;
          });

          const map: Record<string, number> = {};
          (assignments || []).forEach((a: any) => {
            const tpl = String(a.element_id);
            const ttype = String(a.target_organization_type);
            map[tpl] = (map[tpl] || 0) + (orgTypeCounts[ttype] || 0);
          });

          setAssignedOrgCounts(map);
        } else {
          setAssignedOrgCounts({});
        }
      } catch {
        setAssignedOrgCounts({});
      }
      setIsLoading(false);
    };
    loadTemplates();
  }, [tenantId]);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-5 w-5" /> Repository</h1>
        <p className="text-sm text-muted-foreground">Manage platform elements</p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">Platform-level report templates</div>
            <Button size="sm" onClick={() => navigate('/repository/reports/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Report Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Organizations Assigned</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformTemplates.map(t => (
                    <TableRow key={t.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.description || ''}</TableCell>
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
                  {!isLoading && platformTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-sm text-muted-foreground text-center py-6">
                        No platform forms found.
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
        <TabsContent value="equipment"></TabsContent>
      </Tabs>
    </div>
  );
}


