import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertTriangle, Heart, Flame, Users, Truck, Shield, UserX, FileSpreadsheet, Scale, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const reportTemplates = [
  {
    id: 1,
    name: "Incident Report",
    description: "Any operational mission (rescue, search, etc.)",
    icon: AlertTriangle
  },
  {
    id: 2,
    name: "Patient Care Report",
    description: "Patient contact with first aid/medical treatment",
    icon: Heart
  },
  {
    id: 3,
    name: "NFIRS Report", 
    description: "Fire-related incidents (structure, wildland)",
    icon: Flame
  },
  {
    id: 4,
    name: "Injury/Exposure Report",
    description: "Responder injury or hazardous material exposure",
    icon: Users
  },
  {
    id: 5,
    name: "EMS Patient Care Report",
    description: "Ambulance transport, EMS-specific calls",
    icon: Truck
  },
  {
    id: 6,
    name: "Rescue Report",
    description: "Specialized rescue operations and protocols",
    icon: Shield
  },
  {
    id: 7,
    name: "Medical/First Aid Report",
    description: "Basic medical care and first aid interventions",
    icon: Heart
  },
  {
    id: 8,
    name: "Incident Report (Behavioral/Crisis)",
    description: "Mental health and behavioral crisis responses",
    icon: UserX
  },
  {
    id: 9,
    name: "Medical Logs",
    description: "Ongoing medical care documentation",
    icon: FileSpreadsheet
  },
  {
    id: 10,
    name: "Law Enforcement",
    description: "Law enforcement related incidents and reports",
    icon: Scale
  }
];

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Generate compliance reports and analyze operational data</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <template.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.description}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View Template
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Create Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Reports;