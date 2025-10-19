import { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  importMarkdown,
  importHtml,
  importDocx,
  importZip,
  detectFileType,
  getFilePreview,
} from '@/lib/import/importHandlers';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const { setContent } = useEditorStore();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    preview: string;
  } | null>(null);

  const handleFile = async (file: File) => {
    setIsImporting(true);
    setFileInfo(null);

    try {
      const fileType = detectFileType(file.name);
      let content: string;

      switch (fileType) {
        case 'markdown':
        case 'text':
          content = await importMarkdown(file);
          break;
        case 'html':
          content = await importHtml(file);
          break;
        case 'docx':
          content = await importDocx(file);
          break;
        case 'zip':
          content = await importZip(file);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      const fileSize = `${(file.size / 1024).toFixed(2)} KB`;
      const preview = getFilePreview(content);

      setFileInfo({
        name: file.name,
        size: fileSize,
        preview,
      });

      setContent(content);

      toast({
        title: 'Import Successful!',
        description: `${file.name} loaded successfully`,
      });

      setTimeout(() => {
        onOpenChange(false);
        setFileInfo(null);
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".md,.txt,.html,.htm,.docx,.zip"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              {isImporting ? (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: .md, .txt, .html, .docx, .zip
                </p>
              </div>
            </Label>
          </div>

          {fileInfo && (
            <div className="p-4 bg-muted rounded-lg space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{fileInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{fileInfo.size}</p>
                </div>
              </div>
              <div className="bg-background p-3 rounded text-xs font-mono">
                {fileInfo.preview}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Supported Formats:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Markdown</strong> (.md, .txt) - Direct import</li>
              <li>• <strong>HTML</strong> (.html, .htm) - Converts to Markdown</li>
              <li>• <strong>Word</strong> (.docx) - Converts to Markdown</li>
              <li>• <strong>ZIP</strong> (.zip) - Extracts first .md file</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
