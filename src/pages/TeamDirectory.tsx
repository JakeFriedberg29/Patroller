import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Phone, Mail, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserModal } from "@/components/user-management/UserModal";
import { DeleteUserModal } from "@/components/user-management/DeleteUserModal";
import { useToast } from "@/hooks/use-toast";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { ResendActivationButton } from "@/components/ResendActivationButton";
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/useDataTable";
import { useCrudModals } from "@/hooks/useCrudModals";
import { createStatusFilter } from "@/lib/filterConfigs";

export default function OrganizationUsers() {
  const { id } = useParams();
  const modals = useCrudModals<any>();
  const { toast } = useToast();
  const { teamMembers, loading, updateTeamMember } = useTeamMembers();

  const statusOptions = [...new Set(teamMembers.map(member => member.status))];

  const filterConfigs: FilterConfig[] = [
    createStatusFilter(statusOptions)
  ];

  const columns: ColumnDef<any>[] = [
    {
      key: 'full_name',
      header: 'Name',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">{member.full_name}</span>
        </div>
      ),
    },
    {
      key: 'profile_data',
      header: 'Role',
      render: (member) => <span className="text-muted-foreground">{member.profile_data?.role || 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => (
        <div className="flex items-center gap-2">
          <UserStatusBadge status={member.status as 'pending' | 'active' | 'disabled' | 'deleted'} />
          {member.status === 'pending' && (
            <ResendActivationButton 
              userId={member.id} 
              email={member.email} 
              fullName={member.full_name} 
              size="sm" 
            />
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      render: (member) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{member.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (member) => (
        <Badge variant="outline">
          {member.profile_data?.specialization || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (member) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => modals.edit.open(member)}
            >
              Edit Member
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast({
                  title: "View Profile",
                  description: `Viewing profile for ${member.full_name}`,
                });
              }}
            >
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const dataTable = useDataTable({
    data: teamMembers,
    searchableFields: ['full_name', 'email'],
    filterConfigs,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage users and contacts</p>
          </div>
        </div>
        <Button className="gap-2" onClick={modals.add.open}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        data={dataTable.paginatedData}
        columns={columns}
        searchPlaceholder="Search team members..."
        isLoading={loading}
        emptyMessage="No team members found"
        searchValue={dataTable.searchTerm}
        onSearchChange={dataTable.handleSearch}
        filterValues={dataTable.filters}
        onFilterChange={dataTable.handleFilter}
        filters={filterConfigs}
        currentPage={dataTable.currentPage}
        totalPages={dataTable.totalPages}
        rowsPerPage={dataTable.rowsPerPage}
        totalRecords={dataTable.totalRecords}
        onPageChange={dataTable.handlePageChange}
        onRowsPerPageChange={dataTable.handleRowsPerPageChange}
      />

      <UserModal
        open={modals.add.isOpen}
        onOpenChange={(open) => !open && modals.add.close()}
        mode="add"
        accountType="organization"
        accountId={id}
        onSuccess={() => {
          toast({
            title: "Member Added",
            description: "New team member has been added successfully.",
          });
        }}
      />

      {/* Edit Member Modal */}
      <Dialog open={modals.edit.isOpen} onOpenChange={(open) => !open && modals.edit.close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {modals.selected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  defaultValue={modals.selected.full_name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={modals.selected.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  defaultValue={modals.selected.phone || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select defaultValue={modals.selected.profile_data?.role || ''}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Patroller">Patroller</SelectItem>
                    <SelectItem value="Responder">Responder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={modals.selected.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={modals.edit.close}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (modals.selected) {
                await updateTeamMember(modals.selected.id, {
                  full_name: (document.getElementById('edit-name') as HTMLInputElement)?.value || modals.selected.full_name,
                  email: (document.getElementById('edit-email') as HTMLInputElement)?.value || modals.selected.email,
                  phone: (document.getElementById('edit-phone') as HTMLInputElement)?.value || modals.selected.phone,
                });
              }
              modals.edit.close();
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}