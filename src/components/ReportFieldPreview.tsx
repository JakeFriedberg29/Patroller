import { Calendar as CalendarIcon, Upload, Check, X, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

type FieldType = 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'file_upload' | 'divider' | 'page_break';
type FieldWidth = '1/3' | '1/2' | 'full';

interface FieldRow {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  multiSelect?: boolean;
  label?: string; // for divider/page_break
  width?: FieldWidth;
}

interface ReportFieldPreviewProps {
  field: FieldRow;
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  previewUrl?: string;
}

function FileUploadField({ field }: { field: FieldRow }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    const isValidType = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValidType) {
      return 'Only PDF, DOCX, PNG, and JPG files are allowed';
    }
    return null;
  };

  const createPreviewUrl = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        status: error ? 'error' : 'success',
        error: error || undefined,
        previewUrl: createPreviewUrl(file)
      };
      setUploadedFiles(prev => [...prev, uploadedFile]);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Supports PDF, DOCX, PNG, JPG (max 10MB each)
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                uploadedFile.status === 'error' 
                  ? 'border-destructive/20 bg-destructive/5' 
                  : 'border-border bg-muted/20'
              }`}
            >
              {uploadedFile.previewUrl ? (
                <img 
                  src={uploadedFile.previewUrl} 
                  alt={uploadedFile.file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  {getFileIcon(uploadedFile.file)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <p className="text-xs text-destructive mt-1">
                    {uploadedFile.error}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {uploadedFile.status === 'success' && (
                  <Check className="h-4 w-4 text-success" />
                )}
                {uploadedFile.status === 'error' && (
                  <X className="h-4 w-4 text-destructive" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportFieldPreview({ field }: ReportFieldPreviewProps) {
  const renderField = () => {
    switch (field.type) {
      case 'short_answer':
        return (
          <Input placeholder="Enter your response..." />
        );

      case 'paragraph':
        return (
          <Textarea 
            placeholder="Enter detailed response..." 
            rows={5}
            className="resize-y"
          />
        );

      case 'date':
        const [date, setDate] = useState<Date>();
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full justify-start text-left font-normal border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md inline-flex items-center",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.filter(opt => opt.trim()).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        if (field.multiSelect) {
          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Multi-select dropdown</div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select multiple options..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.filter(opt => opt.trim()).map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Single-select dropdown</div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.filter(opt => opt.trim()).map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

      case 'file_upload':
        return <FileUploadField field={field} />;

      default:
        return null;
    }
  };

  if (field.type === 'divider' || field.type === 'page_break') {
    return null; // These are handled by their own components
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.name}
        {field.required && <span className="text-orange-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}