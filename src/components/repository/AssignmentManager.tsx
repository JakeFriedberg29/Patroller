import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

interface AssignmentManagerProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
  onAssignmentsSaved: () => void;
}

export function AssignmentManager({ tenantId, isOpen, onClose, templateId, onAssignmentsSaved }: AssignmentManagerProps) {
  const { toast } = useToast();
  const [allOrgTypes, setAllOrgTypes] = useState<string[]>([]);
  const [initialAssignedTypes, setInitialAssignedTypes] = useState<string[]>([]);
  const [leftList, setLeftList] = useState<string[]>([]);
  const [rightList, setRightList] = useState<string[]>([]);
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [savingAssign, setSavingAssign] = useState<boolean>(false);

  const loadAssignments = async (tId: string) => {
    try {
      // Load org subtypes
      let orgTypes: string[] = [];
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
      setAllOrgTypes(orgTypes);

      // Get current assignments across ALL tenants (show as assigned if ANY tenant has it)
      const { data: typeAssignRows, error: typeAssignErr } = await supabase
        .from('repository_assignments')
        .select('target_organization_subtype_id, tenant_id')
        .eq('element_type', 'report_template')
        .eq('element_id', tId)
        .eq('target_type', 'organization_type');
      if (typeAssignErr) throw typeAssignErr;

      const subtypeIds = Array.from(new Set((typeAssignRows || []).map((r: any) => r.target_organization_subtype_id).filter(Boolean)));
      let typeAssigned: string[] = [];
      if (subtypeIds.length > 0) {
        // Get all subtype names from any tenant (they could be in different tenants)
        const { data: subtypeRows } = await supabase
          .from('organization_subtypes')
          .select('id,name')
          .in('id', subtypeIds as any);
        typeAssigned = Array.from(new Set((subtypeRows || []).map((s: any) => String(s.name)).filter(Boolean)));
      }

      // Organization-level assignments across all tenants
      let orgSubtypeAssigned: string[] = [];
      const { data: orgAssignRows } = await supabase
        .from('repository_assignments')
        .select('target_organization_id')
        .eq('element_type', 'report_template')
        .eq('element_id', tId)
        .eq('target_type', 'organization');
      const orgIds = Array.from(new Set((orgAssignRows || []).map((r: any) => r.target_organization_id).filter(Boolean)));
      if (orgIds.length > 0) {
        const { data: orgRows } = await supabase
          .from('organizations')
          .select('organization_subtype')
          .in('id', orgIds as any);
        orgSubtypeAssigned = Array.from(new Set((orgRows || []).map((o: any) => String(o.organization_subtype)).filter(Boolean)));
      }

      const assignedDistinct = Array.from(new Set([...typeAssigned, ...orgSubtypeAssigned]));
      const available = orgTypes.filter(t => !assignedDistinct.includes(t));
      
      setInitialAssignedTypes(assignedDistinct);
      setRightList(assignedDistinct);
      setLeftList(available);
      setLeftSelected([]);
      setRightSelected([]);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
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

  const saveAssignments = async () => {
    if (!templateId) return;
    setSavingAssign(true);
    const toAdd = rightList.filter(t => !initialAssignedTypes.includes(t));
    const toRemove = initialAssignedTypes.filter(t => !rightList.includes(t));
    try {
      const quoteForIn = (v: string) => `"${v.replace(/\"/g, '\\"')}"`;
      
      // Add missing catalog entries
      const needsCatalogAdd = toAdd.filter(label => !allOrgTypes.includes(label));
      if (needsCatalogAdd.length > 0) {
        await Promise.all(needsCatalogAdd.map(async (label) => {
          await supabase.rpc('organization_add_subtype' as any, { p_name: label });
        }));
        setAllOrgTypes(prev => Array.from(new Set([...prev, ...needsCatalogAdd])));
      }

      // Add new assignments across ALL tenants that have organizations with these subtypes
      if (toAdd.length > 0) {
        // Step 1: Find all tenants that have organizations with the target subtypes
        const { data: orgsWithSubtypes } = await supabase
          .from('organizations')
          .select('tenant_id, organization_subtype')
          .in('organization_subtype', toAdd as any)
          .not('tenant_id', 'is', null);
        
        // Get unique tenant IDs
        const affectedTenantIds = Array.from(
          new Set((orgsWithSubtypes || []).map((o: any) => o.tenant_id).filter(Boolean))
        );
        
        if (affectedTenantIds.length === 0) {
          toast({ 
            title: 'No organizations found', 
            description: `No organizations found with subtypes: ${toAdd.join(', ')}`,
            variant: 'destructive' 
          });
          return;
        }

        // Step 2: For each affected tenant, get the subtype IDs and create assignments
        for (const affectedTenantId of affectedTenantIds) {
          const { data: subtypeRows } = await supabase
            .from('organization_subtypes')
            .select('id,name')
            .eq('tenant_id', affectedTenantId)
            .in('name', toAdd as any);
          
          const nameToId: Record<string, string> = {};
          (subtypeRows || []).forEach((s: any) => { nameToId[String(s.name)] = String(s.id); });
          
          const rows = toAdd
            .map(subtypeName => nameToId[subtypeName])
            .filter(Boolean)
            .map(subtypeId => ({
              tenant_id: affectedTenantId,
              element_type: 'report_template' as const,
              element_id: templateId,
              target_type: 'organization_type' as const,
              target_organization_subtype_id: subtypeId,
            }));
          
          for (const row of rows) {
            const { data: existing } = await supabase
              .from('repository_assignments')
              .select('id')
              .eq('tenant_id', row.tenant_id)
              .eq('element_type', row.element_type)
              .eq('element_id', row.element_id)
              .eq('target_type', row.target_type)
              .eq('target_organization_subtype_id', row.target_organization_subtype_id)
              .maybeSingle();
            
            if (!existing) {
              const { error: insertErr } = await supabase
                .from('repository_assignments')
                .insert(row);
              if (insertErr) throw insertErr;
            }
          }
        }
      }

      // Remove assignments across ALL tenants
      if (toRemove.length > 0) {
        // Find all tenants that might have this assignment
        const { data: existingAssignments } = await supabase
          .from('repository_assignments')
          .select('tenant_id, target_organization_subtype_id')
          .eq('element_type', 'report_template')
          .eq('element_id', templateId)
          .eq('target_type', 'organization_type');
        
        const affectedTenantIds = Array.from(
          new Set((existingAssignments || []).map((a: any) => a.tenant_id).filter(Boolean))
        );

        // For each tenant, remove assignments for the specified subtypes
        for (const affectedTenantId of affectedTenantIds) {
          const { data: subtypesToRemove } = await supabase
            .from('organization_subtypes')
            .select('id')
            .eq('tenant_id', affectedTenantId)
            .in('name', toRemove as any);
          
          const toRemoveIds = (subtypesToRemove || []).map((s: any) => s.id);
          
          if (toRemoveIds.length > 0) {
            const { error: delErr } = await supabase
              .from('repository_assignments')
              .delete()
              .eq('tenant_id', affectedTenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization_type')
              .eq('element_id', templateId)
              .in('target_organization_subtype_id', toRemoveIds as any);
            if (delErr) throw delErr;
          }
        }

        // Clean up legacy org-level rows across all tenants
        const inCriteria = `(${toRemove.map(quoteForIn).join(',')})`;
        const { data: orgRows } = await supabase
          .from('organizations')
          .select('id, tenant_id')
          .filter('organization_subtype', 'in', inCriteria);
        
        // Group by tenant for efficient deletion
        const orgIdsByTenant: Record<string, string[]> = {};
        (orgRows || []).forEach((org: any) => {
          const tid = org.tenant_id;
          if (tid) {
            if (!orgIdsByTenant[tid]) orgIdsByTenant[tid] = [];
            orgIdsByTenant[tid].push(org.id);
          }
        });

        for (const [tid, orgIds] of Object.entries(orgIdsByTenant)) {
          if (orgIds.length > 0) {
            const { error: delErr } = await supabase
              .from('repository_assignments')
              .delete()
              .eq('tenant_id', tid)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization')
              .eq('element_id', templateId)
              .in('target_organization_id', orgIds as any);
            if (delErr) throw delErr;
          }
        }
      }

      toast({ title: 'Assignments saved', description: 'Subtype assignments updated.' });
      onAssignmentsSaved();
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to save assignments', variant: 'destructive' });
    } finally {
      setSavingAssign(false);
    }
  };

  // Load assignments when dialog opens
  if (isOpen && templateId && leftList.length === 0 && rightList.length === 0) {
    loadAssignments(templateId);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  <input 
                    type="checkbox" 
                    className="accent-primary" 
                    checked={leftSelected.includes(item)} 
                    onChange={(e) => {
                      setLeftSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                    }} 
                  />
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
              className="w-32 gap-2"
            >
              <span>Add</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={moveLeft}
              disabled={rightSelected.length === 0}
              className="w-32 gap-2"
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
                  <input 
                    type="checkbox" 
                    className="accent-primary" 
                    checked={rightSelected.includes(item)} 
                    onChange={(e) => {
                      setRightSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                    }} 
                  />
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
          <Button variant="outline" onClick={onClose} disabled={savingAssign}>Cancel</Button>
          <Button onClick={saveAssignments} disabled={savingAssign} className="gap-2">
            {savingAssign && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
