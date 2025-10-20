import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: 'File Operations',
      items: [
        { keys: ['Ctrl', 'N'], description: 'New Document' },
        { keys: ['Ctrl', 'S'], description: 'Save Document' },
        { keys: ['Ctrl', 'P'], description: 'Print' },
      ],
    },
    {
      category: 'View Controls',
      items: [
        { keys: ['F11'], description: 'Toggle Focus Mode' },
        { keys: ['Esc'], description: 'Exit Focus Mode' },
      ],
    },
    {
      category: 'Text Formatting',
      items: [
        { keys: ['Ctrl', 'B'], description: 'Bold (in supported editors)' },
        { keys: ['Ctrl', 'I'], description: 'Italic (in supported editors)' },
      ],
    },
    {
      category: 'Search & Replace',
      items: [
        { keys: ['Ctrl', 'F'], description: 'Find' },
        { keys: ['Ctrl', 'H'], description: 'Replace' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                              {key}
                            </kbd>
                            {keyIndex < item.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {section !== shortcuts[shortcuts.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
