import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { useDataTable } from "@/hooks/useDataTable";
import { useRepositoryActions } from "@/hooks/useRepositoryActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Plus, Layers as LayersIcon, ChevronRight, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import { AssignmentManager } from "@/components/repository/AssignmentManager";

interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  status: string;
  subtypes_assigned?: number;
  orgs_assigned?: number;
}

export default function Repository() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isPlatformAdmin } = usePermissions();
  const tenantId = profile?.profileData?.tenant_id as string | undefined;
  const userId = profile?.profileData?.user_id || null;

  const [platformTemplates, setPlatformTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [assignedOrgCounts, setAssignedOrgCounts] = useState<Record<string, number>>({});
  const [assignedSubtypeCounts, setAssignedSubtypeCounts] = useState<Record<string, number>>({});

  // Assignment modal state
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [assignTemplateId, setAssignTemplateId] = useState<string | null>(null);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [deleteTemplateName, setDeleteTemplateName] = useState<string>("");

  const { handleStatusChange, handleDelete, isDeleting } = useRepositoryActions({
    tenantId,
    userId,
    onTemplatesUpdated: loadTemplates,
  });

  const dataTable = useDataTable({
    data: platformTemplates,
    searchableFields: ['name', 'description'] as (keyof ReportTemplate)[],
    filterConfigs: [
      {
        key: 'status',
        label: 'Status',
        options: [
          { label: 'All Statuses', value: 'all' },
          { label: 'Draft', value: 'draft' },
          { label: 'Ready', value: 'ready' },
          { label: 'Published', value: 'published' },
          { label: 'Unpublished', value: 'unpublished' },
          { label: 'Archive', value: 'archive' },
        ],
      },
    ],
  });

  async function loadTemplates() {
    if (!tenantId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('report_templates')
      .select('id,name,description,status')
      .eq('tenant_id', tenantId)
      .is('organization_id', null)
      .order('name', { ascending: true });
    const templates = (data || []) as ReportTemplate[];
    
    // Load assignment counts
    const templateIds = templates.map(t => t.id);
    if (templateIds.length > 0) {
      await loadAssignmentCounts(templateIds);
    }
    
    // Merge counts into templates
    const enrichedTemplates = templates.map(t => ({
      ...t,
      subtypes_assigned: assignedSubtypeCounts[t.id] || 0,
      orgs_assigned: assignedOrgCounts[t.id] || 0,
    }));
    
    setPlatformTemplates(enrichedTemplates);
    setIsLoading(false);
  }

  async function loadAssignmentCounts(templateIds: string[]) {
    if (!tenantId) return;
    try {
      const [
        { data: typeAssignments },
        { data: orgAssignments },
        { data: orgs }
      ] = await Promise.all([
        supabase
          .from('repository_assignments')
          .select('element_id, target_organization_subtype_id')
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
          .select('id, organization_subtype')
          .eq('tenant_id', tenantId)
      ]);

      const orgSubtypeCounts: Record<string, number> = {};
      const orgIdToSubtype: Record<string, string | null> = {};
      (orgs || []).forEach((o: any) => {
        const st = o.organization_subtype != null ? String(o.organization_subtype) : null;
        if (st) orgSubtypeCounts[st] = (orgSubtypeCounts[st] || 0) + 1;
        orgIdToSubtype[String(o.id)] = st;
      });

      // Count orgs assigned
      const orgAssignedMap: Record<string, number> = {};
      if ((typeAssignments || []).length > 0) {
        const subtypeIds = Array.from(new Set((typeAssignments || []).map((a: any) => a.target_organization_subtype_id).filter(Boolean)));
        let nameCounts: Record<string, number> = {};
        if (subtypeIds.length > 0) {
          const { data: subtypeRows } = await supabase
            .from('organization_subtypes')
            .select('id,name')
            .eq('tenant_id', tenantId)
            .in('id', subtypeIds as any);
          const idToName: Record<string, string> = {};
          (subtypeRows || []).forEach((s: any) => { idToName[String(s.id)] = String(s.name); });
          nameCounts = Object.keys(idToName).reduce((acc, id) => {
            const name = idToName[id];
            acc[name] = orgSubtypeCounts[name] || 0;
            return acc;
          }, {} as Record<string, number>);
        }
        (typeAssignments || []).forEach((a: any) => {
          const tpl = String(a.element_id);
          const subtypeId = a.target_organization_subtype_id ? String(a.target_organization_subtype_id) : '';
          const subtypeNameCount = Object.values(nameCounts).length > 0 ? Object.values(nameCounts)[0] : 0;
          orgAssignedMap[tpl] = (orgAssignedMap[tpl] || 0) + subtypeNameCount;
        });
      }
      setAssignedOrgCounts(orgAssignedMap);

      // Count subtypes assigned
      const subtypeSetByTemplate: Record<string, Set<string>> = {};
      if ((typeAssignments || []).length > 0) {
        const subtypeIds2 = Array.from(new Set((typeAssignments || []).map((a: any) => a.target_organization_subtype_id).filter(Boolean)));
        let idToName2: Record<string, string> = {};
        if (subtypeIds2.length > 0) {
          const { data: subtypeRows2 } = await supabase
            .from('organization_subtypes')
            .select('id,name')
            .eq('tenant_id', tenantId)
            .in('id', subtypeIds2 as any);
          (subtypeRows2 || []).forEach((s: any) => { idToName2[String(s.id)] = String(s.name); });
        }
        (typeAssignments || []).forEach((a: any) => {
          const tpl = String(a.element_id);
          const name = a.target_organization_subtype_id ? idToName2[String(a.target_organization_subtype_id)] : undefined;
          if (!name) return;
          if (!subtypeSetByTemplate[tpl]) subtypeSetByTemplate[tpl] = new Set();
          subtypeSetByTemplate[tpl].add(name);
        });
      }
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
    } catch {
      setAssignedOrgCounts({});
      setAssignedSubtypeCounts({});
    }
  }

  const openAssignModal = (templateId: string) => {
    setAssignTemplateId(templateId);
    setIsAssignOpen(true);
  };

  const openDeleteDialog = (templateId: string, templateName: string) => {
    setDeleteTemplateId(templateId);
    setDeleteTemplateName(templateName);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTemplateId) return;
    const success = await handleDelete(deleteTemplateId, deleteTemplateName);
    if (success) {
      setIsDeleteOpen(false);
      setDeleteTemplateId(null);
      setDeleteTemplateName("");
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [tenantId]);

  const columns = [
    {
      key: 'name' as const,
      header: 'Report Name',
      cell: (item: ReportTemplate) => <div className="font-medium">{item.name}</div>,
    },
    {
      key: 'description' as const,
      header: 'Description',
      cell: (item: ReportTemplate) => <div className="text-muted-foreground">{item.description || ''}</div>,
    },
    {
      key: 'subtypes_assigned' as const,
      header: 'Subtypes Assigned',
      cell: (item: ReportTemplate) => <div className="text-muted-foreground">{assignedSubtypeCounts[item.id] || 0}</div>,
    },
    {
      key: 'orgs_assigned' as const,
      header: 'Organizations Assigned',
      cell: (item: ReportTemplate) => <div className="text-muted-foreground">{assignedOrgCounts[item.id] || 0}</div>,
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (item: ReportTemplate) => (
        <Select 
          value={item.status || 'draft'} 
          onValueChange={(v) => handleStatusChange(item.id, v as any, (newStatus) => {
            setPlatformTemplates(prev => prev.map(t => t.id === item.id ? { ...t, status: newStatus } : t));
          })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={item.status || 'draft'}>
              {(item.status || 'draft').charAt(0).toUpperCase() + (item.status || 'draft').slice(1)}
            </SelectItem>
            {getValidNextStates((item.status || 'draft') as ReportStatus).map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'name' as const,
      header: 'Actions',
      cell: (item: ReportTemplate) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openAssignModal(item.id)}>
            <LayersIcon className="h-4 w-4" />
            <span className="sr-only">Assign Subtypes</span>
          </Button>
          {canDeleteReport((item.status || 'draft') as ReportStatus) && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDeleteDialog(item.id, item.name)}>
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/repository/reports/${item.id}`)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">View More</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-5 w-5" /> Repository
        </h1>
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

          <DataTable
            data={dataTable.paginatedData}
            columns={columns}
            searchValue={dataTable.searchTerm}
            onSearchChange={dataTable.handleSearch}
            searchPlaceholder="Search reports by name or description..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Draft', value: 'draft' },
                  { label: 'Ready', value: 'ready' },
                  { label: 'Published', value: 'published' },
                  { label: 'Unpublished', value: 'unpublished' },
                  { label: 'Archive', value: 'archive' },
                ],
              },
            ]}
            filterValues={dataTable.filters}
            onFilterChange={dataTable.handleFilter}
            currentPage={dataTable.currentPage}
            totalPages={dataTable.totalPages}
            onPageChange={dataTable.handlePageChange}
            rowsPerPage={dataTable.rowsPerPage}
            onRowsPerPageChange={dataTable.handleRowsPerPageChange}
            totalRecords={dataTable.totalRecords}
            isLoading={isLoading}
            emptyMessage="No platform forms found."
          />

          <AssignmentManager
            tenantId={tenantId || ''}
            isOpen={isAssignOpen}
            onClose={() => {
              setIsAssignOpen(false);
              setAssignTemplateId(null);
            }}
            templateId={assignTemplateId}
            onAssignmentsSaved={loadTemplates}
          />

          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete report template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "{deleteTemplateName}" from all assigned organization subtypes and delete it from the repository. Submitted reports will remain visible in accounts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
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
