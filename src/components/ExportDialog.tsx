import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEditorStore } from '@/store/editorStore';
import { 
  exportToMarkdown, 
  exportToHtml, 
  exportToPdf, 
  exportToImage, 
  exportToDocx,
  exportToZip 
} from '@/lib/exportUtils';
import { 
  FileText, 
  FileCode, 
  FileImage, 
  File, 
  Archive,
  Download,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const { content, savedDocuments, currentDocId } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);
  const [includeHtmlInZip, setIncludeHtmlInZip] = useState(true);
  
  const currentDoc = currentDocId 
    ? savedDocuments.find(d => d.id === currentDocId) 
    : null;
  
  const filename = currentDoc?.name || 'document';
  
  const getPreviewElement = () => {
    return document.querySelector('.preview-content') as HTMLElement;
  };
  
  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const previewElement = getPreviewElement();
      
      switch (format) {
        case 'md':
          exportToMarkdown(content, filename);
          toast.success('Markdown exported successfully');
          break;
        case 'html':
          exportToHtml(content, filename, previewElement);
          toast.success('HTML exported successfully');
          break;
        case 'pdf':
          if (!previewElement) {
            toast.error('Preview not available');
            return;
          }
          await exportToPdf(previewElement, filename);
          toast.success('PDF exported successfully');
          break;
        case 'png':
        case 'jpeg':
          if (!previewElement) {
            toast.error('Preview not available');
            return;
          }
          await exportToImage(previewElement, filename, format as 'png' | 'jpeg');
          toast.success(`${format.toUpperCase()} exported successfully`);
          break;
        case 'docx':
          exportToDocx(content, filename);
          toast.success('DOCX exported successfully');
          break;
        case 'zip':
          await exportToZip(content, filename, includeHtmlInZip, previewElement);
          toast.success('ZIP archive created successfully');
          break;
        default:
          toast.error('Unknown export format');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  const formats = [
    {
      id: 'md',
      name: 'Markdown',
      description: 'Plain text markdown file',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      id: 'html',
      name: 'HTML',
      description: 'Styled HTML document',
      icon: FileCode,
      color: 'text-orange-500',
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable document format',
      icon: File,
      color: 'text-red-500',
    },
    {
      id: 'docx',
      name: 'DOCX',
      description: 'Microsoft Word document',
      icon: File,
      color: 'text-blue-600',
    },
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High quality image',
      icon: FileImage,
      color: 'text-green-500',
    },
    {
      id: 'jpeg',
      name: 'JPEG Image',
      description: 'Compressed image',
      icon: FileImage,
      color: 'text-yellow-500',
    },
    {
      id: 'zip',
      name: 'ZIP Archive',
      description: 'Bundle with multiple formats',
      icon: Archive,
      color: 'text-purple-500',
    },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose a format to export "{filename}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {formats.map((format) => {
            const Icon = format.icon;
            return (
              <div
                key={format.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${format.color}`} />
                  <div>
                    <div className="font-medium text-sm">{format.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format.description}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span className="ml-1.5">Export</span>
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-html" className="text-sm font-medium">
                Include HTML in ZIP
              </Label>
              <p className="text-xs text-muted-foreground">
                Bundle both Markdown and styled HTML in the archive
              </p>
            </div>
            <Switch
              id="include-html"
              checked={includeHtmlInZip}
              onCheckedChange={setIncludeHtmlInZip}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
