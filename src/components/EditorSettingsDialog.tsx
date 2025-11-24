import { useSettingsStore } from '@/store/settingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface EditorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditorSettingsDialog = ({ open, onOpenChange }: EditorSettingsDialogProps) => {
  const {
    fontSize,
    theme,
    typewriterMode,
    wordLimitWarningsEnabled,
    customWordLimit,
    customCharLimit,
    setFontSize,
    setTheme,
    setTypewriterMode,
    setWordLimitWarningsEnabled,
    setCustomWordLimit,
    setCustomCharLimit,
    resetToDefaults,
  } = useSettingsStore();

  const handleReset = () => {
    resetToDefaults();
    toast.success('Settings reset to defaults');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Customize your editing experience
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh]">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              
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
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Writing Experience</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="typewriter-mode" className="cursor-pointer">
                      Typewriter Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Keep cursor centered while typing
                    </p>
                  </div>
                  <Switch
                    id="typewriter-mode"
                    checked={typewriterMode}
                    onCheckedChange={setTypewriterMode}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Word/Character Limits</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="limit-warnings" className="cursor-pointer">
                    Enable Limit Warnings
                  </Label>
                  <Switch
                    id="limit-warnings"
                    checked={wordLimitWarningsEnabled}
                    onCheckedChange={setWordLimitWarningsEnabled}
                  />
                </div>

                {wordLimitWarningsEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="word-limit">Custom Word Limit</Label>
                      <Input
                        id="word-limit"
                        type="number"
                        min="0"
                        placeholder="e.g., 2500"
                        value={customWordLimit || ''}
                        onChange={(e) => setCustomWordLimit(e.target.value ? parseInt(e.target.value) : null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to disable word limit warnings
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="char-limit">Custom Character Limit</Label>
                      <Input
                        id="char-limit"
                        type="number"
                        min="0"
                        placeholder="e.g., 5000"
                        value={customCharLimit || ''}
                        onChange={(e) => setCustomCharLimit(e.target.value ? parseInt(e.target.value) : null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to disable character limit warnings
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Reset Settings</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Restore editor settings to their default values. This will not affect your saved documents.
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
      </DialogContent>
    </Dialog>
  );
};
