import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Folder, FolderOpen, FileIcon, Download, MoreHorizontal } from "lucide-react";
import { Folder as FolderType } from "@/hooks/useFolderManagement";

interface FilesTabProps {
  folders: FolderType[];
  onCreateFolder: (name: string) => boolean;
}

export function FilesTab({ folders, onCreateFolder }: FilesTabProps) {
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isFolderContentOpen, setIsFolderContentOpen] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const success = onCreateFolder(newFolderName);
      if (success) {
        setNewFolderName("");
        setIsCreateFolderOpen(false);
      }
    }
  };

  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolder(folder);
    setIsFolderContentOpen(true);
  };

  return (
    <>
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

      {/* Folder Content Dialog */}
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
    </>
  );
}
