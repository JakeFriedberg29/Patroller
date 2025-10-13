import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface FolderFile {
  id: number;
  name: string;
  size: string;
  dateModified: string;
}

export interface Folder {
  id: number;
  name: string;
  artifactCount: number;
  dateCreated: string;
  dateUpdated: string;
  files: FolderFile[];
}

const mockInitialFolders: Folder[] = [
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

export function useFolderManagement() {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>(mockInitialFolders);

  const createFolder = (folderName: string) => {
    if (!folderName.trim()) {
      toast({
        title: "Invalid Folder Name",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newFolder: Folder = {
        id: folders.length + 1,
        name: folderName.trim(),
        artifactCount: 0,
        dateCreated: new Date().toISOString().split('T')[0],
        dateUpdated: new Date().toISOString().split('T')[0],
        files: []
      };

      setFolders(prev => [...prev, newFolder]);

      toast({
        title: "Folder Created Successfully",
        description: `"${folderName.trim()}" folder has been created.`,
      });

      return true;
    } catch (error) {
      toast({
        title: "Error Creating Folder",
        description: "Failed to create the folder. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating folder:', error);
      return false;
    }
  };

  const getFolderById = (id: number): Folder | undefined => {
    return folders.find(f => f.id === id);
  };

  return {
    folders,
    createFolder,
    getFolderById
  };
}
