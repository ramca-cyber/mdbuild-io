import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useEditorStore } from '@/store/editorStore';
import { Printer, FileText, Settings2, Layout } from 'lucide-react';

interface PrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrintSettingsDialog = ({ open, onOpenChange }: PrintSettingsDialogProps) => {
  const { printSettings, setPrintSettings, viewMode, setViewMode } = useEditorStore();
  
  const [localSettings, setLocalSettings] = useState(printSettings);

  const handlePrint = () => {
    setPrintSettings(localSettings);
    onOpenChange(false);
    
    // Set to preview mode and trigger print
    const originalMode = viewMode;
    setViewMode('preview');
    setTimeout(() => {
      window.print();
      setViewMode(originalMode);
    }, 100);
  };

  const handleSaveDefault = () => {
    setPrintSettings(localSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Settings
          </DialogTitle>
          <DialogDescription>
            Customize how your document will be printed
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="page" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="page">
              <FileText className="h-4 w-4 mr-2" />
              Page
            </TabsTrigger>
            <TabsTrigger value="content">
              <Layout className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style">
              <Settings2 className="h-4 w-4 mr-2" />
              Style
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="page" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="paper-size">Paper Size</Label>
              <Select
                value={localSettings.paperSize}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, paperSize: value })}
              >
                <SelectTrigger id="paper-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5 x 11 in)</SelectItem>
                  <SelectItem value="Legal">Legal (8.5 x 14 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={localSettings.orientation}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, orientation: value })}
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margins">Margins</Label>
              <Select
                value={localSettings.margins}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, margins: value })}
              >
                <SelectTrigger id="margins">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (1 inch)</SelectItem>
                  <SelectItem value="narrow">Narrow (0.5 inch)</SelectItem>
                  <SelectItem value="wide">Wide (1.5 inch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="line-numbers" className="cursor-pointer">
                Include Line Numbers
              </Label>
              <Switch
                id="line-numbers"
                checked={localSettings.includeLineNumbers}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, includeLineNumbers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="page-numbers" className="cursor-pointer">
                Include Page Numbers
              </Label>
              <Switch
                id="page-numbers"
                checked={localSettings.includePageNumbers}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, includePageNumbers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="header-footer" className="cursor-pointer">
                Include Header/Footer
              </Label>
              <Switch
                id="header-footer"
                checked={localSettings.includeHeaderFooter}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, includeHeaderFooter: checked })}
              />
            </div>

            {localSettings.includeHeaderFooter && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="header-text">Header Text</Label>
                  <Input
                    id="header-text"
                    placeholder="e.g., Document Title"
                    value={localSettings.headerText || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, headerText: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                    id="footer-text"
                    placeholder="e.g., © 2025"
                    value={localSettings.footerText || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, footerText: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{date}'} for current date, {'{time}'} for current time
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select
                value={localSettings.fontSize}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, fontSize: value })}
              >
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (10pt)</SelectItem>
                  <SelectItem value="medium">Medium (12pt)</SelectItem>
                  <SelectItem value="large">Large (14pt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="syntax-highlighting" className="cursor-pointer">
                Syntax Highlighting
              </Label>
              <Switch
                id="syntax-highlighting"
                checked={localSettings.syntaxHighlighting}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, syntaxHighlighting: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-mode">Color Mode</Label>
              <Select
                value={localSettings.colorMode}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, colorMode: value })}
              >
                <SelectTrigger id="color-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="grayscale">Grayscale</SelectItem>
                  <SelectItem value="blackwhite">Black & White</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="columns">Layout</Label>
              <Select
                value={localSettings.columns}
                onValueChange={(value: any) => setLocalSettings({ ...localSettings, columns: value })}
              >
                <SelectTrigger id="columns">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Column</SelectItem>
                  <SelectItem value="two">Two Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="toc" className="cursor-pointer">
                Include Table of Contents
              </Label>
              <Switch
                id="toc"
                checked={localSettings.includeTableOfContents}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, includeTableOfContents: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="page-breaks" className="cursor-pointer">
                Break Pages at Headings
              </Label>
              <Switch
                id="page-breaks"
                checked={localSettings.breakPagesAtHeadings}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, breakPagesAtHeadings: checked })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSaveDefault}>
            Save as Default
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
