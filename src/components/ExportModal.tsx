import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  FileCode,
  FileImage,
  Package,
  Share2,
  Github,
  Mail,
  Link2,
  Download,
  Loader2,
} from 'lucide-react';
import { exportToMarkdown, getFileSize } from '@/lib/export/exportToMarkdown';
import { exportToHtml } from '@/lib/export/exportToHtml';
import { exportToPdf } from '@/lib/export/exportToPdf';
import { exportToImage, ImageFormat } from '@/lib/export/exportToImage';
import { exportToZip } from '@/lib/export/exportToZip';
import { generateShareLink, createEmailLink } from '@/lib/export/shareUtils';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportModal = ({ open, onOpenChange }: ExportModalProps) => {
  const { content, theme } = useEditorStore();
  const { toast } = useToast();
  const [filename, setFilename] = useState('document');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [includeFrontmatter, setIncludeFrontmatter] = useState(true);
  const [embedAssets, setEmbedAssets] = useState(true);
  const [shareLink, setShareLink] = useState('');

  const handleExport = async (type: string) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const previewElement = document.querySelector('.preview-content') as HTMLElement;
      const previewContent = previewElement?.innerHTML || '';

      switch (type) {
        case 'markdown':
          setExportProgress(50);
          exportToMarkdown(content, filename);
          setExportProgress(100);
          toast({
            title: 'Exported!',
            description: 'Markdown file downloaded',
          });
          break;

        case 'html':
          setExportProgress(50);
          exportToHtml(previewContent, theme, filename);
          setExportProgress(100);
          toast({
            title: 'Exported!',
            description: 'HTML file downloaded',
          });
          break;

        case 'pdf':
          if (!previewElement) throw new Error('Preview not available');
          setExportProgress(30);
          await exportToPdf(previewElement, filename);
          setExportProgress(100);
          toast({
            title: 'Exported!',
            description: 'PDF file downloaded',
          });
          break;

        case 'png':
        case 'jpeg':
        case 'svg':
          if (!previewElement) throw new Error('Preview not available');
          setExportProgress(30);
          await exportToImage(previewElement, type as ImageFormat, filename);
          setExportProgress(100);
          toast({
            title: 'Exported!',
            description: `${type.toUpperCase()} image downloaded`,
          });
          break;

        case 'zip':
          setExportProgress(30);
          const htmlForZip = `<!DOCTYPE html><html><body>${previewContent}</body></html>`;
          await exportToZip(content, htmlForZip, filename);
          setExportProgress(100);
          toast({
            title: 'Exported!',
            description: 'ZIP archive downloaded',
          });
          break;

        default:
          throw new Error('Unknown export type');
      }
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'An error occurred during export',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleGenerateShareLink = () => {
    const link = generateShareLink(content);
    setShareLink(link);
    toast({
      title: 'Link Generated!',
      description: 'Copy the link to share your document',
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard',
    });
  };

  const handleEmailShare = () => {
    const emailLink = createEmailLink(content, filename);
    window.location.href = emailLink;
  };

  const fileSize = getFileSize(content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export & Share</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="document"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current size: {fileSize}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="frontmatter">Include Frontmatter</Label>
              <Switch
                id="frontmatter"
                checked={includeFrontmatter}
                onCheckedChange={setIncludeFrontmatter}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="embed-assets">Embed Assets Inline</Label>
              <Switch
                id="embed-assets"
                checked={embedAssets}
                onCheckedChange={setEmbedAssets}
              />
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={exportProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Exporting... {exportProgress}%
              </p>
            </div>
          )}

          <Tabs defaultValue="local" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="local">Local</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-3 mt-4">
              <Button
                onClick={() => handleExport('markdown')}
                disabled={isExporting}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Markdown (.md)</div>
                  <div className="text-xs text-muted-foreground">
                    Plain text format
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleExport('html')}
                disabled={isExporting}
                variant="outline"
                className="w-full justify-start"
              >
                <FileCode className="mr-2 h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">HTML (.html)</div>
                  <div className="text-xs text-muted-foreground">
                    Self-contained web page
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">PDF (.pdf)</div>
                  <div className="text-xs text-muted-foreground">
                    Printable document
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleExport('png')}
                disabled={isExporting}
                variant="outline"
                className="w-full justify-start"
              >
                <FileImage className="mr-2 h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Image (PNG/JPEG)</div>
                  <div className="text-xs text-muted-foreground">
                    High-resolution image
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </TabsContent>

            <TabsContent value="archive" className="space-y-3 mt-4">
              <Button
                onClick={() => handleExport('zip')}
                disabled={isExporting}
                variant="outline"
                className="w-full justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">ZIP Archive (.zip)</div>
                  <div className="text-xs text-muted-foreground">
                    Bundle MD + HTML + assets
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </TabsContent>

            <TabsContent value="share" className="space-y-3 mt-4">
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateShareLink}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Generate Share Link</div>
                    <div className="text-xs text-muted-foreground">
                      Create compressed URL
                    </div>
                  </div>
                </Button>

                {shareLink && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <Input value={shareLink} readOnly className="text-xs" />
                    <Button
                      onClick={handleCopyShareLink}
                      size="sm"
                      className="w-full"
                    >
                      Copy Link
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleEmailShare}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Email</div>
                    <div className="text-xs text-muted-foreground">
                      Share via email client
                    </div>
                  </div>
                </Button>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Github className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">GitHub Gist</div>
                      <div>Coming soon - Publish to GitHub Gists</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
