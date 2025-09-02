import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, FileIcon, Upload } from "lucide-react";

const reportTemplates = [
  {
    id: 1,
    name: "Incident Report",
    description: "Standard incident reporting form for emergency response situations"
  },
  {
    id: 2,
    name: "Patient Care Report",
    description: "Medical care documentation for patient treatment and transport"
  },
  {
    id: 3,
    name: "NFIRS Report", 
    description: "National Fire Incident Reporting System documentation"
  },
  {
    id: 4,
    name: "Injury/Exposure Report",
    description: "Report form for personnel injuries or hazardous exposures"
  },
  {
    id: 5,
    name: "EMS Patient Care Report",
    description: "Emergency Medical Services patient care documentation"
  },
  {
    id: 6,
    name: "Rescue Report",
    description: "Technical rescue operations documentation and analysis"
  },
  {
    id: 7,
    name: "Medical/First Aid Report",
    description: "Basic medical assistance and first aid treatment record"
  },
  {
    id: 8,
    name: "Incident Report (Behavioral/Crisis)",
    description: "Specialized reporting for behavioral health and crisis situations"
  },
  {
    id: 9,
    name: "Medical Logs",
    description: "Ongoing medical activity and equipment status logs"
  },
  {
    id: 10,
    name: "Law Enforcement",
    description: "Law enforcement coordination and incident documentation"
  }
];

export default function OrganizationReports() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and generate organization reports</p>
          </div>
        </div>
        <Button className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Report Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportTemplates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <FileIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.description}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View More
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="files">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files uploaded</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your report files here to access them later.
              </p>
              <Button>
                Upload Files
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}