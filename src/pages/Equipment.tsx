import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search, Calendar, MapPin } from "lucide-react";

const mockEquipment = [
  {
    id: 1,
    name: "Rescue Boat Alpha",
    type: "Watercraft",
    status: "Available",
    location: "Dock A", 
    lastMaintenance: "2024-08-15",
    nextMaintenance: "2024-11-15"
  },
  {
    id: 2,
    name: "All-Terrain Vehicle 1",
    type: "Vehicle",
    status: "In Use",
    location: "Base Station",
    lastMaintenance: "2024-08-20", 
    nextMaintenance: "2024-12-20"
  },
  {
    id: 3,
    name: "Emergency Medical Kit A",
    type: "Medical",
    status: "Available", 
    location: "Medical Bay",
    lastMaintenance: "2024-08-25",
    nextMaintenance: "2024-09-25"
  },
  {
    id: 4,
    name: "Rope Rescue System",
    type: "Rescue Gear",
    status: "Maintenance",
    location: "Equipment Room",
    lastMaintenance: "2024-08-10",
    nextMaintenance: "2024-09-01"
  }
];

export default function Equipment() {
  const { id } = useParams();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "default";
      case "In Use": return "secondary";
      case "Maintenance": return "destructive";
      case "Out of Service": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Equipment</h1>
            <p className="text-muted-foreground">Track and manage equipment inventory</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search equipment..." className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEquipment.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                </div>
                <Badge variant={getStatusColor(item.status) as any}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last: {item.lastMaintenance}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Next: {item.nextMaintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}