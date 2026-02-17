import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settingsStore';
import { FileEdit, Monitor, Settings2, Keyboard } from 'lucide-react';

interface UnifiedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export const UnifiedSettingsDialog = ({ open, onOpenChange, defaultTab = 'editor' }: UnifiedSettingsDialogProps) => {
  const {
    fontSize, theme, typewriterMode,
    wordLimitWarningsEnabled, customWordLimit, customCharLimit,
    setFontSize, setTheme, setTypewriterMode,
    setWordLimitWarningsEnabled, setCustomWordLimit, setCustomCharLimit,
    previewSettings, setPreviewSettings,
    lineWrap, setLineWrap,
    lineNumbers, setLineNumbers,
    autoSave, setAutoSave,
    syncScroll, setSyncScroll,
    focusMode, setFocusMode,
    zenMode, setZenMode,
    resetToDefaults,
  } = useSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your editor and preview experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">
              <FileEdit className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Monitor className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] mt-4">
            <TabsContent value="editor" className="space-y-6 px-1">
              {/* Appearance */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Appearance</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="s-theme">Theme</Label>
                    <Select value={theme} onValueChange={(v: 'light' | 'dark' | 'sepia' | 'system') => setTheme(v)}>
                      <SelectTrigger id="s-theme"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="sepia">Sepia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider min={12} max={24} step={1} value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Editor Behavior */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Behavior</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-wrap" className="cursor-pointer">Word Wrap</Label>
                    <Switch id="s-wrap" checked={lineWrap} onCheckedChange={setLineWrap} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-ln" className="cursor-pointer">Line Numbers</Label>
                    <Switch id="s-ln" checked={lineNumbers} onCheckedChange={setLineNumbers} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-auto" className="cursor-pointer">Auto Save</Label>
                    <Switch id="s-auto" checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="s-tw" className="cursor-pointer">Typewriter Mode</Label>
                      <p className="text-xs text-muted-foreground">Keep cursor centered</p>
                    </div>
                    <Switch id="s-tw" checked={typewriterMode} onCheckedChange={setTypewriterMode} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Modes */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Focus Modes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="s-focus" className="cursor-pointer">Focus Mode</Label>
                      <p className="text-xs text-muted-foreground">Hide menus, show only editor (F11)</p>
                    </div>
                    <Switch id="s-focus" checked={focusMode} onCheckedChange={setFocusMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="s-zen" className="cursor-pointer">Zen Mode</Label>
                      <p className="text-xs text-muted-foreground">Minimal distraction mode (Shift+F11)</p>
                    </div>
                    <Switch id="s-zen" checked={zenMode} onCheckedChange={setZenMode} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Word Limits */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Word/Character Limits</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-limits" className="cursor-pointer">Enable Limit Warnings</Label>
                    <Switch id="s-limits" checked={wordLimitWarningsEnabled} onCheckedChange={setWordLimitWarningsEnabled} />
                  </div>
                  {wordLimitWarningsEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Word Limit</Label>
                        <Input type="number" min="0" placeholder="e.g., 2500" value={customWordLimit || ''} onChange={(e) => setCustomWordLimit(e.target.value ? parseInt(e.target.value) : null)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Character Limit</Label>
                        <Input type="number" min="0" placeholder="e.g., 5000" value={customCharLimit || ''} onChange={(e) => setCustomCharLimit(e.target.value ? parseInt(e.target.value) : null)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 px-1">
              {/* Display */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Display</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Smooth Scrolling</Label>
                    <Switch checked={previewSettings.enableSmoothScroll} onCheckedChange={(c) => setPreviewSettings({ enableSmoothScroll: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Compact Headings</Label>
                    <Switch checked={previewSettings.compactHeadings} onCheckedChange={(c) => setPreviewSettings({ compactHeadings: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Show Visible Word Count</Label>
                    <Switch checked={previewSettings.showWordCount} onCheckedChange={(c) => setPreviewSettings({ showWordCount: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="cursor-pointer">Highlight Current Section</Label>
                      <p className="text-xs text-muted-foreground">Visually marks the section at cursor position</p>
                    </div>
                    <Switch checked={previewSettings.highlightCurrentSection} onCheckedChange={(c) => setPreviewSettings({ highlightCurrentSection: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Sync Scrolling</Label>
                    <Switch checked={syncScroll} onCheckedChange={setSyncScroll} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Images</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Lazy Load Images</Label>
                    <Switch checked={previewSettings.enableImageLazyLoad} onCheckedChange={(c) => setPreviewSettings({ enableImageLazyLoad: c })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Image Width</Label>
                    <Select value={previewSettings.maxImageWidth} onValueChange={(v: 'full' | 'content' | 'narrow') => setPreviewSettings({ maxImageWidth: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                <h3 className="text-sm font-semibold mb-3">Scale</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preview Content Size</Label>
                    <span className="text-sm text-muted-foreground">{previewSettings.previewZoom}%</span>
                  </div>
                  <Slider min={80} max={200} step={10} value={[previewSettings.previewZoom]} onValueChange={([v]) => setPreviewSettings({ previewZoom: v })} />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => {
            resetToDefaults();
            onOpenChange(false);
          }}>
            Reset to Defaults
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
