import { MapPin, Plus, Search, Filter, MoreVertical, Edit, Eye, Trash2, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const locations = [
  {
    id: 1,
    name: "Downtown Command Center",
    address: "123 Main St, Downtown",
    type: "Command Center",
    status: "Active",
    coordinates: "40.7128° N, 74.0060° W",
    personnel: 12,
    admins: ["John Smith", "Sarah Johnson"],
    equipment: ["Radio Systems", "Emergency Vehicles", "Communication Hub"],
    users: ["Alice Cooper", "Bob Wilson", "Carol Davis", "David Lee"]
  },
  {
    id: 2,
    name: "North District Station",
    address: "456 Oak Ave, North District",
    type: "Field Station",
    status: "Active",
    coordinates: "40.7589° N, 73.9851° W",
    personnel: 8,
    admins: ["Mike Brown", "Lisa White"],
    equipment: ["Patrol Vehicles", "First Aid Kits", "Surveillance Equipment"],
    users: ["Emma Thompson", "Frank Miller", "Grace Chen", "Henry Taylor"]
  },
  {
    id: 3,
    name: "Emergency Response Depot",
    address: "789 Pine Rd, Industrial Zone",
    type: "Supply Depot",
    status: "Maintenance",
    coordinates: "40.6782° N, 73.9442° W",
    personnel: 4,
    admins: ["Robert Garcia"],
    equipment: ["Supply Trucks", "Storage Systems", "Loading Equipment"],
    users: ["Ivan Rodriguez", "Julia Martinez", "Kevin Anderson", "Laura Kim"]
  },
];

export default function Locations() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { toast } = useToast();

  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    type: "",
    status: "Active",
    coordinates: "",
    personnel: 0,
    admins: [] as string[],
    equipment: [] as string[],
    users: [] as string[]
  });

  const handleEdit = (location: typeof locations[0]) => {
    setSelectedLocation(location);
    setEditModalOpen(true);
  };

  const handleSummary = (location: typeof locations[0]) => {
    setSelectedLocation(location);
    setSummaryModalOpen(true);
  };

  const handleDelete = (location: typeof locations[0]) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLocation) {
      toast({
        title: "Location deleted",
        description: `${selectedLocation.name} has been successfully deleted.`,
      });
      setDeleteDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedLocation) {
      toast({
        title: "Location updated",
        description: `${selectedLocation.name} has been successfully updated.`,
      });
      setEditModalOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.type) {
      toast({
        title: "Location added",
        description: `${newLocation.name} has been successfully added.`,
      });
      setAddModalOpen(false);
      resetNewLocation();
    }
  };

  const resetNewLocation = () => {
    setNewLocation({
      name: "",
      address: "",
      type: "",
      status: "Active",
      coordinates: "",
      personnel: 0,
      admins: [],
      equipment: [],
      users: []
    });
  };

  const addAdmin = () => {
    setNewLocation(prev => ({
      ...prev,
      admins: [...prev.admins, "New Admin"]
    }));
  };

  const removeAdmin = (index: number) => {
    setNewLocation(prev => ({
      ...prev,
      admins: prev.admins.filter((_, i) => i !== index)
    }));
  };

  const addEquipment = () => {
    setNewLocation(prev => ({
      ...prev,
      equipment: [...prev.equipment, "New Equipment"]
    }));
  };

  const removeEquipment = (index: number) => {
    setNewLocation(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const addUser = () => {
    setNewLocation(prev => ({
      ...prev,
      users: [...prev.users, "New User"]
    }));
  };

  const removeUser = (index: number) => {
    setNewLocation(prev => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== index)
    }));
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">
            Manage and monitor all operational locations
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Locations Table */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Personnel</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.slice(0, rowsPerPage).map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-muted-foreground">{location.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{location.address}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={location.status === "Active" ? "default" : "secondary"}
                          className={location.status === "Active" ? "bg-success text-success-foreground" : ""}
                        >
                          {location.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {location.personnel} active
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(location)} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSummary(location)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Summary
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(location)} 
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value))}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">rows</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(rowsPerPage, locations.length)} of {locations.length} locations
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">Total Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">2</div>
            <p className="text-xs text-muted-foreground">Active Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">1</div>
            <p className="text-xs text-muted-foreground">Under Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-xs text-muted-foreground">Total Personnel</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Modify equipment and users assigned to {selectedLocation?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLocation && (
            <div className="space-y-6">
              {/* Location Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Location Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <div className="font-medium">{selectedLocation.name}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="font-medium">{selectedLocation.address}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Equipment Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipment
                  </h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedLocation.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item}</span>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Users Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Users
                  </h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedLocation.users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{user}</span>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Modal */}
      <Dialog open={summaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Location Summary</DialogTitle>
            <DialogDescription>
              Complete overview of {selectedLocation?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLocation && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Location Name</Label>
                    <div className="font-medium">{selectedLocation.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <div className="font-medium">{selectedLocation.type}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <div className="font-medium">{selectedLocation.address}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <Badge 
                      variant={selectedLocation.status === "Active" ? "default" : "secondary"}
                      className={selectedLocation.status === "Active" ? "bg-success text-success-foreground" : ""}
                    >
                      {selectedLocation.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm text-muted-foreground">Coordinates</Label>
                    <div className="font-mono text-sm">{selectedLocation.coordinates}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assigned Admins */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Assigned Admins</h3>
                <div className="space-y-2">
                  {selectedLocation.admins.map((admin, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{admin}</div>
                        <div className="text-xs text-muted-foreground">Location Admin</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Equipment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Equipment ({selectedLocation.equipment.length})</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedLocation.equipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Personnel */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personnel ({selectedLocation.users.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedLocation.users.map((user, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm">{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedLocation?.name}</strong>? This action cannot be undone.
              All equipment and user assignments will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Location Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new location with equipment and user assignments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter location name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newLocation.type} onValueChange={(value) => setNewLocation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Command Center">Command Center</SelectItem>
                      <SelectItem value="Field Station">Field Station</SelectItem>
                      <SelectItem value="Supply Depot">Supply Depot</SelectItem>
                      <SelectItem value="Emergency Response">Emergency Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates</Label>
                  <Input
                    id="coordinates"
                    value={newLocation.coordinates}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, coordinates: e.target.value }))}
                    placeholder="e.g., 40.7128° N, 74.0060° W"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newLocation.status} onValueChange={(value) => setNewLocation(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Admins Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Admins
                </h3>
                <Button size="sm" variant="outline" onClick={addAdmin}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </div>
              <div className="space-y-2">
                {newLocation.admins.map((admin, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <Input
                      value={admin}
                      onChange={(e) => {
                        const updatedAdmins = [...newLocation.admins];
                        updatedAdmins[index] = e.target.value;
                        setNewLocation(prev => ({ ...prev, admins: updatedAdmins }));
                      }}
                      placeholder="Admin name"
                      className="flex-1 mr-2"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeAdmin(index)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newLocation.admins.length === 0 && (
                  <p className="text-sm text-muted-foreground">No admins assigned yet. Click "Add Admin" to get started.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Equipment Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipment
                </h3>
                <Button size="sm" variant="outline" onClick={addEquipment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </div>
              <div className="space-y-2">
                {newLocation.equipment.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updatedEquipment = [...newLocation.equipment];
                        updatedEquipment[index] = e.target.value;
                        setNewLocation(prev => ({ ...prev, equipment: updatedEquipment }));
                      }}
                      placeholder="Equipment name"
                      className="flex-1 mr-2"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeEquipment(index)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newLocation.equipment.length === 0 && (
                  <p className="text-sm text-muted-foreground">No equipment assigned yet. Click "Add Equipment" to get started.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Users Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personnel
                </h3>
                <Button size="sm" variant="outline" onClick={addUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              <div className="space-y-2">
                {newLocation.users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <Input
                      value={user}
                      onChange={(e) => {
                        const updatedUsers = [...newLocation.users];
                        updatedUsers[index] = e.target.value;
                        setNewLocation(prev => ({ ...prev, users: updatedUsers }));
                      }}
                      placeholder="User name"
                      className="flex-1 mr-2"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeUser(index)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newLocation.users.length === 0 && (
                  <p className="text-sm text-muted-foreground">No personnel assigned yet. Click "Add User" to get started.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => { setAddModalOpen(false); resetNewLocation(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation} disabled={!newLocation.name || !newLocation.address || !newLocation.type}>
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}