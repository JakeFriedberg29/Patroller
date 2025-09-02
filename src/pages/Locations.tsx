import { MapPin, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const locations = [
  {
    id: 1,
    name: "Downtown Command Center",
    address: "123 Main St, Downtown",
    type: "Command Center",
    status: "Active",
    coordinates: "40.7128° N, 74.0060° W",
    personnel: 12,
  },
  {
    id: 2,
    name: "North District Station",
    address: "456 Oak Ave, North District",
    type: "Field Station",
    status: "Active",
    coordinates: "40.7589° N, 73.9851° W",
    personnel: 8,
  },
  {
    id: 3,
    name: "Emergency Response Depot",
    address: "789 Pine Rd, Industrial Zone",
    type: "Supply Depot",
    status: "Maintenance",
    coordinates: "40.6782° N, 73.9442° W",
    personnel: 4,
  },
];

export default function Locations() {
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
        <Button className="gap-2">
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

      {/* Locations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <Badge 
                  variant={location.status === "Active" ? "default" : "secondary"}
                  className={location.status === "Active" ? "bg-success text-success-foreground" : ""}
                >
                  {location.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">Address:</span>
                  <p className="text-muted-foreground">{location.address}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Type:</span>
                  <p className="text-muted-foreground">{location.type}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Coordinates:</span>
                  <p className="text-muted-foreground font-mono text-xs">{location.coordinates}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Personnel:</span>
                  <p className="text-muted-foreground">{location.personnel} active</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
}