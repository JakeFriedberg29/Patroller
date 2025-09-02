import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, FileIcon, Upload, Download, Plus, MoreHorizontal, Folder, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
const reportTemplates = [{
  id: 1,
  name: "Incident Report",
  description: "Standard incident reporting form for emergency response situations"
}, {
  id: 2,
  name: "Patient Care Report",
  description: "Medical care documentation for patient treatment and transport"
}, {
  id: 3,
  name: "NFIRS Report",
  description: "National Fire Incident Reporting System documentation"
}, {
  id: 4,
  name: "Injury/Exposure Report",
  description: "Report form for personnel injuries or hazardous exposures"
}, {
  id: 5,
  name: "EMS Patient Care Report",
  description: "Emergency Medical Services patient care documentation"
}, {
  id: 6,
  name: "Rescue Report",
  description: "Technical rescue operations documentation and analysis"
}, {
  id: 7,
  name: "Medical/First Aid Report",
  description: "Basic medical assistance and first aid treatment record"
}, {
  id: 8,
  name: "Incident Report (Behavioral/Crisis)",
  description: "Specialized reporting for behavioral health and crisis situations"
}, {
  id: 9,
  name: "Medical Logs",
  description: "Ongoing medical activity and equipment status logs"
}, {
  id: 10,
  name: "Law Enforcement",
  description: "Law enforcement coordination and incident documentation"
}];

const mockFolders = [
  {
    id: 1,
    name: "Q1 2024 Reports",
    artifactCount: 12,
    dateCreated: "2024-01-15",
    dateUpdated: "2024-03-30",
    files: [
      { id: 1, name: "Incident_Report_001.pdf", size: "2.4 MB", dateModified: "2024-03-30" },
      { id: 2, name: "Patient_Care_Report_045.pdf", size: "1.8 MB", dateModified: "2024-03-29" }
    ]
  },
  {
    id: 2,
    name: "Emergency Response",
    artifactCount: 8,
    dateCreated: "2024-02-01",
    dateUpdated: "2024-04-01",
    files: [
      { id: 3, name: "EMS_Report_023.pdf", size: "3.1 MB", dateModified: "2024-04-01" },
      { id: 4, name: "Rescue_Operation_007.pdf", size: "2.7 MB", dateModified: "2024-03-28" }
    ]
  },
  {
    id: 3,
    name: "Training Documentation",
    artifactCount: 15,
    dateCreated: "2024-01-10",
    dateUpdated: "2024-04-02",
    files: [
      { id: 5, name: "Training_Report_2024.pdf", size: "4.2 MB", dateModified: "2024-04-02" }
    ]
  }
];
export default function OrganizationReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<typeof mockFolders[0] | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isFolderContentOpen, setIsFolderContentOpen] = useState(false);
  const handleDownloadTemplate = (template: typeof reportTemplates[0]) => {
    // Create a simple Word document template download
    const content = `${template.name}\n\n${template.description}\n\n[Template fields would be here]`;
    const blob = new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_')}_Template.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleCreateReport = (template: typeof reportTemplates[0]) => {
    navigate(`/accounts/${id}/reports/create/${template.id}`);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: folders.length + 1,
        name: newFolderName.trim(),
        artifactCount: 0,
        dateCreated: new Date().toISOString().split('T')[0],
        dateUpdated: new Date().toISOString().split('T')[0],
        files: []
      };
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    }
  };

  const handleFolderClick = (folder: typeof mockFolders[0]) => {
    setSelectedFolder(folder);
    setIsFolderContentOpen(true);
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and generate organization reports</p>
          </div>
        </div>
        
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
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportTemplates.map(template => <TableRow key={template.id} className="hover:bg-muted/50">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateReport(template)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="files">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Folders</h3>
                <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="folder-name" className="text-sm font-medium">
                          Folder Name
                        </label>
                        <Input
                          id="folder-name"
                          placeholder="Enter folder name..."
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateFolder();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-between space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateFolderOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateFolder}>
                          Create Folder
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Artifact Count</TableHead>
                    <TableHead className="font-semibold">Date Created</TableHead>
                    <TableHead className="font-semibold">Date Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folders.map((folder) => (
                    <TableRow 
                      key={folder.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Folder className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold">{folder.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {folder.artifactCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {folder.dateCreated}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {folder.dateUpdated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {folders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No folders created</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create folders to organize your report files.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isFolderContentOpen} onOpenChange={setIsFolderContentOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {selectedFolder?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {selectedFolder && selectedFolder.files.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date Modified</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFolder.files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              {file.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.size}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.dateModified}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No files in this folder</h3>
                    <p className="text-muted-foreground text-center">
                      This folder is currently empty.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>;
}