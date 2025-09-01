import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertTriangle, Heart, Flame, Users, Truck } from "lucide-react";

const reportTemplates = [
  {
    id: 1,
    name: "Incident Report",
    description: "Any operational mission (rescue, search, etc.)",
    icon: AlertTriangle,
    type: "incident"
  },
  {
    id: 2,
    name: "Patient Care Report",
    description: "Patient contact with first aid/medical treatment",
    icon: Heart,
    type: "medical"
  },
  {
    id: 3,
    name: "NFIRS Report", 
    description: "Fire-related incidents (structure, wildland)",
    icon: Flame,
    type: "fire"
  },
  {
    id: 4,
    name: "Injury/Exposure Report",
    description: "Responder injury or hazardous material exposure",
    icon: Users,
    type: "safety"
  },
  {
    id: 5,
    name: "EMS Patient Care Report",
    description: "Ambulance transport, EMS-specific calls",
    icon: Truck,
    type: "ems"
  }
];

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Generate compliance reports and analyze operational data</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates by name or incident type..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          All Categories
        </Button>
      </div>

      {/* Report Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report Templates (10)</h2>
          <div className="text-sm text-muted-foreground">
            Show: <strong>10</strong>
          </div>
        </div>

        <div className="grid gap-4">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <template.icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;