import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Phone, Mail } from "lucide-react";

const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Team Lead",
    status: "Available",
    phone: "(555) 123-4567",
    email: "sarah.johnson@example.com",
    certification: "EMT-P"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Rescue Specialist", 
    status: "On Mission",
    phone: "(555) 234-5678",
    email: "mike.chen@example.com",
    certification: "Technical Rescue"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Communications",
    status: "Available",
    phone: "(555) 345-6789", 
    email: "emily.rodriguez@example.com",
    certification: "Radio Operator"
  }
];

export default function TeamDirectory() {
  const { id } = useParams();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "default";
      case "On Mission": return "destructive"; 
      case "Off Duty": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Team Directory</h1>
            <p className="text-muted-foreground">Manage team members and contacts</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search team members..." className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant={getStatusColor(member.status) as any}>
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline">{member.certification}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}