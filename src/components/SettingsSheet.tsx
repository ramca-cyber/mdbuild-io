import { useEditorStore } from '@/store/editorStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsSheet = () => {
  const {
    fontSize,
    lineWrap,
    lineNumbers,
    autoSave,
    theme,
    setFontSize,
    setLineWrap,
    setLineNumbers,
    setAutoSave,
    setTheme,
    resetToDefaults,
  } = useEditorStore();

  const handleReset = () => {
    resetToDefaults();
    toast.success('Settings reset to defaults');
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Editor Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'sepia') => setTheme(value)}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="line-wrap" className="cursor-pointer">
                Line Wrap
              </Label>
              <Switch
                id="line-wrap"
                checked={lineWrap}
                onCheckedChange={setLineWrap}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="line-numbers" className="cursor-pointer">
                Line Numbers
              </Label>
              <Switch
                id="line-numbers"
                checked={lineNumbers}
                onCheckedChange={setLineNumbers}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="cursor-pointer">
                Auto Save
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Bold</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+B</kbd>
            </div>
            <div className="flex justify-between">
              <span>Italic</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+I</kbd>
            </div>
            <div className="flex justify-between">
              <span>Link</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Code</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+`</kbd>
            </div>
            <div className="flex justify-between">
              <span>Save</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-2">Reset Settings</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Restore all settings to their default values. This will not affect your saved documents.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleReset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
