import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

type EnterpriseSubtypeRow = { id: string; name: string; is_active: boolean };
type OrganizationSubtypeRow = { id: string; name: string; is_active: boolean };

export default function Subtypes() {
  const { profile } = useUserProfile();
  const { isPlatformAdmin } = usePermissions();
  const { toast } = useToast();
  const tenantId = profile?.profileData?.tenant_id as string | undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [enterpriseRows, setEnterpriseRows] = useState<EnterpriseSubtypeRow[]>([]);
  const [organizationRows, setOrganizationRows] = useState<OrganizationSubtypeRow[]>([]);

  const [activeTab, setActiveTab] = useState<"enterprise" | "organization">("enterprise");
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>("");
  const [originalValue, setOriginalValue] = useState<string>("");

  const orgEnumValues = useMemo(() => Constants.public.Enums.organization_type as readonly string[], []);

  const isValidOrgSubtypeName = (value: string) => value.trim().length > 0;

  useEffect(() => {
    const load = async () => {
      if (!tenantId || !isPlatformAdmin) {
        setEnterpriseRows([]);
        setOrganizationRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const [{ data: ents }, { data: orgs }] = await Promise.all([
        supabase.from("enterprise_subtypes").select("id,name,is_active").eq("tenant_id", tenantId).order("name", { ascending: true }),
        supabase.from("organization_subtypes").select("id,name,is_active").eq("tenant_id", tenantId).order("name", { ascending: true }),
      ]);
      setEnterpriseRows((ents || []).map((r: any) => ({ id: r.id, name: r.name, is_active: r.is_active })));
      setOrganizationRows((orgs || []).map((r: any) => ({ id: r.id, name: r.name, is_active: r.is_active })));
      setLoading(false);
    };
    load();
  }, [tenantId, isPlatformAdmin]);

  const openAdd = () => {
    setOriginalValue("");
    setEditValue("");
    setIsAddOpen(true);
  };

  const openEdit = (name: string) => {
    setOriginalValue(name);
    setEditValue(name);
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!editValue.trim()) return;
    try {
      if (activeTab === "enterprise") {
        const { error } = await supabase.from("enterprise_subtypes").insert({ tenant_id: tenantId, name: editValue.trim() });
        if (error) throw error;
        setEnterpriseRows(prev => [...prev, { id: crypto.randomUUID(), name: editValue.trim(), is_active: true }].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        // Adds enum if needed and inserts subtype for this tenant
        const { error } = await supabase.rpc("add_organization_subtype" as any, { p_name: editValue.trim() });
        if (error) throw error;
        setOrganizationRows(prev => [...prev, { id: crypto.randomUUID(), name: editValue.trim(), is_active: true }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsAddOpen(false);
      setEditValue("");
      toast({ title: "Created", description: "Subtype added." });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to add subtype", variant: "destructive" });
    }
  };

  const handleEdit = async () => {
    const newName = editValue.trim();
    if (!newName || !originalValue || newName === originalValue) {
      setIsEditOpen(false);
      return;
    }
    try {
      if (activeTab === "enterprise") {
        const { error: updErr } = await supabase
          .from("enterprise_subtypes")
          .update({ name: newName })
          .eq("tenant_id", tenantId)
          .eq("name", originalValue);
        if (updErr && (updErr as any).code === "23505") {
          // Name already exists; remove the old row to avoid duplicates
          await supabase
            .from("enterprise_subtypes")
            .delete()
            .eq("tenant_id", tenantId)
            .eq("name", originalValue);
        } else if (updErr) {
          throw updErr;
        }
        setEnterpriseRows(prev => {
          const withoutOld = prev.filter(r => r.name !== originalValue);
          const existsNew = withoutOld.some(r => r.name === newName);
          return (existsNew ? withoutOld : [...withoutOld, { id: crypto.randomUUID(), name: newName, is_active: true }]).sort((a, b) => a.name.localeCompare(b.name));
        });
      } else {
        if (!isValidOrgSubtypeName(newName)) {
          toast({ title: "Invalid name", description: "Use lowercase letters, numbers, and underscores only.", variant: "destructive" });
          return;
        }

        // If the target name is already one of the enum values, try direct update.
        const targetExistsInEnum = orgEnumValues.includes(newName as any);
        if (targetExistsInEnum) {
          const { error: updErr } = await supabase
            .from("organization_subtypes")
            .update({ name: newName as any })
            .eq("tenant_id", tenantId)
            .eq("name", originalValue as any);
          if (updErr && (updErr as any).code === "23505") {
            // Unique violation: row for newName already exists; just remove the old one
            await supabase.from("organization_subtypes").delete().eq("tenant_id", tenantId).eq("name", originalValue as any);
          } else if (updErr) {
            throw updErr;
          }
        } else {
          // Ensure enum label exists and create tenant row, then remove the old row
          const { error: addErr } = await supabase.rpc("add_organization_subtype" as any, { p_name: newName });
          if (addErr) throw addErr;
          await supabase.from("organization_subtypes").delete().eq("tenant_id", tenantId).eq("name", originalValue as any);
        }

        setOrganizationRows(prev => {
          // Ensure a single entry with newName exists
          const withoutOld = prev.filter(r => r.name !== originalValue);
          const existsNew = withoutOld.some(r => r.name === newName);
          return (existsNew ? withoutOld : [...withoutOld, { id: crypto.randomUUID(), name: newName, is_active: true }]).sort((a, b) => a.name.localeCompare(b.name));
        });
      }
      setIsEditOpen(false);
      toast({ title: "Updated", description: "Subtype name updated." });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to update subtype", variant: "destructive" });
    }
  };

  const handleDelete = async (name: string) => {
    try {
      if (activeTab === "enterprise") {
        const { error } = await supabase.from("enterprise_subtypes").delete().eq("tenant_id", tenantId).eq("name", name);
        if (error) throw error;
        setEnterpriseRows(prev => prev.filter(r => r.name !== name));
      } else {
        const { error } = await supabase.rpc("delete_organization_subtype" as any, { p_name: name });
        if (error) throw error;
        setOrganizationRows(prev => prev.filter(r => r.name !== name));
      }
      toast({ title: "Deleted", description: "Subtype removed." });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to delete subtype", variant: "destructive" });
    }
  };

  const renderTable = (rows: { id: string; name: string; is_active: boolean }[]) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground">No subtypes found.</TableCell>
              </TableRow>
            ) : rows.map(r => (
              <TableRow key={r.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(r.name)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(r.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Subtypes</h1>
        </div>
        {isPlatformAdmin && (
          <Button size="sm" className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>
        <TabsContent value="enterprise" className="space-y-4">
          {renderTable(enterpriseRows)}
        </TabsContent>
        <TabsContent value="organization" className="space-y-4">
          {renderTable(organizationRows)}
        </TabsContent>
      </Tabs>

      {/* Add dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {activeTab === "enterprise" ? "Enterprise" : "Organization"} Subtype</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder={activeTab === "enterprise" ? "e.g. Resort Chain" : "e.g. Ski Patrol"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              list={activeTab === "organization" ? "org-subtypes-enum" : undefined}
            />
            {activeTab === "organization" && (
              <datalist id="org-subtypes-enum">
                {orgEnumValues.map(v => <option key={v} value={v} />)}
              </datalist>
            )}
            {activeTab === "organization" && (
              <p className="text-xs text-muted-foreground">Letters, numbers, spaces, and special characters are allowed.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {activeTab === "enterprise" ? "Enterprise" : "Organization"} Subtype</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder={activeTab === "enterprise" ? "e.g. Resort Chain" : "e.g. Ski Patrol"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            {activeTab === "organization" && (
              <p className="text-xs text-muted-foreground">Letters, numbers, spaces, and special characters are allowed.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


