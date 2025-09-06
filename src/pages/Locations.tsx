import { MapPin, Plus, Search, Filter, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocations } from "@/hooks/useLocations";
import { Skeleton } from "@/components/ui/skeleton";

export default function Locations() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Use the locations hook
  const { 
    locations, 
    loading, 
    createLocation, 
    updateLocation, 
    deleteLocation 
  } = useLocations();

  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    coordinates: ""
  });

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (location: any) => {
    setSelectedLocation(location);
    setEditModalOpen(true);
  };

  const handleSummary = (location: any) => {
    setSelectedLocation(location);
    setSummaryModalOpen(true);
  };

  const handleDelete = (location: any) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLocation) {
      deleteLocation(selectedLocation.id);
      setDeleteDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedLocation) {
      updateLocation(selectedLocation.id, selectedLocation);
      setEditModalOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleAddLocation = async () => {
    if (newLocation.name && newLocation.address.street) {
      const success = await createLocation({
        name: newLocation.name,
        description: newLocation.description,
        address: newLocation.address,
        coordinates: newLocation.coordinates,
      });
      
      if (success) {
        setAddModalOpen(false);
        resetNewLocation();
      }
    }
  };

  const resetNewLocation = () => {
    setNewLocation({
      name: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      },
      coordinates: ""
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.slice(0, rowsPerPage).map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          {location.description && (
                            <div className="text-sm text-muted-foreground">{location.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {typeof location.address === 'object' && location.address ? 
                          `${location.address.street || ''} ${location.address.city || ''}`.trim() || 'No address'
                          : 'No address'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={location.is_active ? "default" : "secondary"}
                        className={location.is_active ? "bg-success text-success-foreground" : ""}
                      >
                        {location.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(location)} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSummary(location)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
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
            
            {filteredLocations.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No locations found. Create your first location to get started.
              </div>
            )}
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
            Showing {Math.min(rowsPerPage, filteredLocations.length)} of {filteredLocations.length} locations
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new location for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newLocation.description}
                onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter location description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={newLocation.address.street}
                onChange={(e) => setNewLocation(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
                placeholder="Enter street address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newLocation.address.city}
                  onChange={(e) => setNewLocation(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newLocation.address.state}
                  onChange={(e) => setNewLocation(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  placeholder="State"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates (Optional)</Label>
              <Input
                id="coordinates"
                value={newLocation.coordinates}
                onChange={(e) => setNewLocation(prev => ({ ...prev, coordinates: e.target.value }))}
                placeholder="e.g., 40.7128° N, 74.0060° W"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation}>Add Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update location information
            </DialogDescription>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Location Name</Label>
                <Input
                  id="editName"
                  value={selectedLocation.name}
                  onChange={(e) => setSelectedLocation({...selectedLocation, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={selectedLocation.description || ''}
                  onChange={(e) => setSelectedLocation({...selectedLocation, description: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Modal */}
      <Dialog open={summaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Details</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedLocation.name}</h3>
                <p className="text-muted-foreground">{selectedLocation.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="font-medium">
                    {selectedLocation.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div className="font-medium">
                    {new Date(selectedLocation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {selectedLocation.coordinates && (
                <div>
                  <Label className="text-muted-foreground">Coordinates</Label>
                  <div className="font-medium">{selectedLocation.coordinates}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}