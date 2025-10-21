import { useEditorStore } from '@/store/editorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PreviewPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreviewPreferencesDialog = ({ open, onOpenChange }: PreviewPreferencesDialogProps) => {
  const { previewPreferences, setPreviewPreferences } = useEditorStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview Preferences</DialogTitle>
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
                    checked={previewPreferences.enableSmoothScroll}
                    onCheckedChange={(checked) => 
                      setPreviewPreferences({ enableSmoothScroll: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-headings" className="cursor-pointer">
                    Compact Headings
                  </Label>
                  <Switch
                    id="compact-headings"
                    checked={previewPreferences.compactHeadings}
                    onCheckedChange={(checked) => 
                      setPreviewPreferences({ compactHeadings: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-word-count" className="cursor-pointer">
                    Show Word Count
                  </Label>
                  <Switch
                    id="show-word-count"
                    checked={previewPreferences.showWordCount}
                    onCheckedChange={(checked) => 
                      setPreviewPreferences({ showWordCount: checked })
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
                    checked={previewPreferences.enableImageLazyLoad}
                    onCheckedChange={(checked) => 
                      setPreviewPreferences({ enableImageLazyLoad: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-width">Maximum Image Width</Label>
                  <Select 
                    value={previewPreferences.maxImageWidth} 
                    onValueChange={(value: 'full' | 'content' | 'narrow') => 
                      setPreviewPreferences({ maxImageWidth: value })
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
                    checked={previewPreferences.highlightCurrentSection}
                    onCheckedChange={(checked) => 
                      setPreviewPreferences({ highlightCurrentSection: checked })
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
