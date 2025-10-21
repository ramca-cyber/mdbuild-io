import { useEditorStore } from '@/store/editorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface PreviewSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreviewSettingsDialog = ({ open, onOpenChange }: PreviewSettingsDialogProps) => {
  const { previewSettings, setPreviewSettings } = useEditorStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview Settings</DialogTitle>
          <DialogDescription>
            Customize how your content is displayed
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh]">
          <div className="p-4 space-y-6">
            
            {/* Display Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Display</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="smooth-scroll" className="cursor-pointer">
                    Smooth Scrolling
                  </Label>
                  <Switch
                    id="smooth-scroll"
                    checked={previewSettings.enableSmoothScroll}
                    onCheckedChange={(checked) => 
                      setPreviewSettings({ enableSmoothScroll: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-headings" className="cursor-pointer">
                    Compact Headings
                  </Label>
                  <Switch
                    id="compact-headings"
                    checked={previewSettings.compactHeadings}
                    onCheckedChange={(checked) => 
                      setPreviewSettings({ compactHeadings: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-word-count" className="cursor-pointer">
                    Show Word Count
                  </Label>
                  <Switch
                    id="show-word-count"
                    checked={previewSettings.showWordCount}
                    onCheckedChange={(checked) => 
                      setPreviewSettings({ showWordCount: checked })
                    }
                  />
                </div>

              </div>
            </div>

            <Separator />

            {/* Image Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Images</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lazy-load" className="cursor-pointer">
                    Lazy Load Images
                  </Label>
                  <Switch
                    id="lazy-load"
                    checked={previewSettings.enableImageLazyLoad}
                    onCheckedChange={(checked) => 
                      setPreviewSettings({ enableImageLazyLoad: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-width">Maximum Image Width</Label>
                  <Select 
                    value={previewSettings.maxImageWidth} 
                    onValueChange={(value: 'full' | 'content' | 'narrow') => 
                      setPreviewSettings({ maxImageWidth: value })
                    }
                  >
                    <SelectTrigger id="image-width">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width</SelectItem>
                      <SelectItem value="content">Content Width</SelectItem>
                      <SelectItem value="narrow">Narrow (75%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

            </div>
          </div>

          <Separator />

          {/* Preview Scale */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview Scale</h3>
            <div className="space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preview-zoom">Preview Content Size</Label>
                  <span className="text-sm text-muted-foreground">
                    {previewSettings.previewZoom}%
                  </span>
                </div>
                <Slider
                  id="preview-zoom"
                  min={80}
                  max={200}
                  step={10}
                  value={[previewSettings.previewZoom]}
                  onValueChange={([value]) => 
                    setPreviewSettings({ previewZoom: value })
                  }
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Adjust the size of rendered content in the preview pane (80% - 200%)
                </p>
              </div>

            </div>
          </div>

          <Separator />

          {/* Advanced Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Advanced</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlight-section" className="cursor-pointer">
                    Highlight Current Section
                  </Label>
                  <Switch
                    id="highlight-section"
                    checked={previewSettings.highlightCurrentSection}
                    onCheckedChange={(checked) => 
                      setPreviewSettings({ highlightCurrentSection: checked })
                    }
                  />
                </div>

              </div>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
