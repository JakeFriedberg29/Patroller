import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useEquipment } from "@/hooks/useEquipment";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Package, Plus, Search, MapPin, Filter, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Equipment() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Status");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [editEquipment, setEditEquipment] = useState({
    name: "",
    category: "",
    status: "available" as const,
    model: "",
    serial_number: "",
    location_id: "",
    description: "",
    purchase_date: "",
    last_maintenance: "",
    next_maintenance: "",
  });
  const { toast } = useToast();
  const { equipment, loading, updateEquipment, createEquipment, canManageEquipment } = useEquipment();
  const { isPlatformAdmin } = usePermissions();

  const [locations, setLocations] = useState<any[]>([]);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    category: "",
    status: "available" as const,
    model: "",
    serial_number: "",
    location_id: "",
    description: "",
    purchase_date: "",
    last_maintenance: "",
    next_maintenance: "",
    organization_id: id || "",
  });

  const equipmentTypes = ["Medical", "Communication", "Vehicle", "Safety", "Rescue", "Tools"];
  const statusTypes = ["available", "in_use", "maintenance", "damaged", "retired"];

  const resetNewEquipment = () => {
    setNewEquipment({
      name: "",
      category: "",
      status: "available" as const,
      model: "",
      serial_number: "",
      location_id: "",
      description: "",
      purchase_date: "",
      last_maintenance: "",
      next_maintenance: "",
      organization_id: id || "",
    });
  };

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name')
          .eq('is_active', true);
        
        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);

  const handleAddEquipment = async () => {
    if (newEquipment.name && newEquipment.category) {
      const equipmentData = {
        ...newEquipment,
        specifications: { description: newEquipment.description },
        maintenance_schedule: {
          last_maintenance: newEquipment.last_maintenance || null,
          next_maintenance: newEquipment.next_maintenance || null
        }
      };
      
      const success = await createEquipment(equipmentData);
      if (success) {
        setAddModalOpen(false);
        resetNewEquipment();
      }
    }
  };

  const handleEditEquipment = async (equipmentData: any) => {
    if (selectedEquipment) {
      const success = await updateEquipment(selectedEquipment.id, equipmentData);
      if (success) {
        setIsEditModalOpen(false);
        setSelectedEquipment(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "default";
      case "in_use": return "secondary";
      case "maintenance": return "destructive";
      case "damaged": return "destructive";
      case "retired": return "outline";
      default: return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter and pagination logic
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All Status" || 
                         formatStatus(item.status) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredEquipment.length / rowsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipment</h1>
          <p className="text-muted-foreground">
            Manage and track all equipment inventory
          </p>
        </div>
        {canManageEquipment && (
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Status">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="In Use">In Use</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Damaged">Damaged</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEquipment.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status) as any}>
                      {formatStatus(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {locations.find(loc => loc.id === item.location_id)?.name || 'No Location'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="text-xs space-y-1">
                      <div>Last: {item.maintenance_schedule?.last_maintenance ? format(new Date(item.maintenance_schedule.last_maintenance), 'yyyy-MM-dd') : 'N/A'}</div>
                      <div>Next: {item.maintenance_schedule?.next_maintenance ? format(new Date(item.maintenance_schedule.next_maintenance), 'yyyy-MM-dd') : 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManageEquipment && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEquipment(item);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit Equipment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Equipment Details",
                                description: `Viewing details for ${item.name}`,
                              });
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredEquipment.length)} of {filteredEquipment.length}
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

      {/* Add Equipment Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Enter the details for the new equipment item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment-name">Equipment Name *</Label>
                  <Input
                    id="equipment-name"
                    placeholder="Enter equipment name"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-type">Type *</Label>
                  <Select value={newEquipment.category} onValueChange={(value) => setNewEquipment(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-status">Status</Label>
                  <Select value={newEquipment.status} onValueChange={(value) => setNewEquipment(prev => ({ ...prev, status: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusTypes.map((status) => (
                        <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-location">Location *</Label>
                  <Select value={newEquipment.location_id} onValueChange={(value) => setNewEquipment(prev => ({ ...prev, location_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="serial-number">Serial Number</Label>
                <Input
                  id="serial-number"
                  placeholder="Enter serial number"
                  value={newEquipment.serial_number}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter equipment description"
                  value={newEquipment.description}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Important Dates</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input
                    type="date"
                    value={newEquipment.purchase_date}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, purchase_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Maintenance</Label>
                  <Input
                    type="date"
                    value={newEquipment.last_maintenance}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, last_maintenance: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Maintenance</Label>
                  <Input
                    type="date"
                    value={newEquipment.next_maintenance}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, next_maintenance: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setAddModalOpen(false);
              resetNewEquipment();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddEquipment}>
              Add Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Equipment Name</Label>
                    <Input
                      id="edit-name"
                      value={editEquipment.name}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editEquipment.category} onValueChange={(value) => setEditEquipment(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editEquipment.status} onValueChange={(value) => setEditEquipment(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map((status) => (
                          <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Select value={editEquipment.location_id} onValueChange={(value) => setEditEquipment(prev => ({ ...prev, location_id: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Model</Label>
                    <Input
                      id="edit-model"
                      value={editEquipment.model}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-serial">Serial Number</Label>
                    <Input
                      id="edit-serial"
                      value={editEquipment.serial_number}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editEquipment.description}
                    onChange={(e) => setEditEquipment(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Important Dates</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={editEquipment.purchase_date}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, purchase_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Maintenance</Label>
                    <Input
                      type="date"
                      value={editEquipment.last_maintenance}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, last_maintenance: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Maintenance</Label>
                    <Input
                      type="date"
                      value={editEquipment.next_maintenance}
                      onChange={(e) => setEditEquipment(prev => ({ ...prev, next_maintenance: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleEditEquipment({
                name: (document.getElementById('edit-name') as HTMLInputElement)?.value,
                category: selectedEquipment?.category,
                status: selectedEquipment?.status,
                model: (document.getElementById('edit-model') as HTMLInputElement)?.value,
                serial_number: (document.getElementById('edit-serial') as HTMLInputElement)?.value,
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}