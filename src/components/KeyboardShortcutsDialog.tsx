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
      category: 'Quick Actions',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Command Palette (Search all commands)' },
        { keys: ['/'], description: 'Slash Command Menu (at start of line)' },
      ],
    },
    {
      category: 'Edit',
      items: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo (Alternative)' },
        { keys: ['Ctrl', 'X'], description: 'Cut' },
        { keys: ['Ctrl', 'C'], description: 'Copy' },
        { keys: ['Ctrl', 'V'], description: 'Paste (Smart: converts HTML to Markdown)' },
        { keys: ['Ctrl', 'A'], description: 'Select All' },
        { keys: ['Alt', 'D'], description: 'Insert Date/Time' },
        { keys: ['Ctrl', 'Shift', 'K'], description: 'Delete Line' },
        { keys: ['Ctrl', 'Shift', 'D'], description: 'Duplicate Line' },
        { keys: ['Ctrl', 'L'], description: 'Select Line' },
        { keys: ['Alt', '↑'], description: 'Move Line Up' },
        { keys: ['Alt', '↓'], description: 'Move Line Down' },
      ],
    },
    {
      category: 'Multiple Cursors',
      items: [
        { keys: ['Ctrl', 'Click'], description: 'Add cursor at click position' },
        { keys: ['Ctrl', 'D'], description: 'Select next occurrence' },
        { keys: ['Alt', 'Shift', '↑'], description: 'Add cursor above' },
        { keys: ['Alt', 'Shift', '↓'], description: 'Add cursor below' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['Ctrl', 'G'], description: 'Go To Line' },
        { keys: ['Ctrl', 'F'], description: 'Find & Replace' },
      ],
    },
    {
      category: 'View',
      items: [
        { keys: ['Ctrl', 'E'], description: 'Editor Only View' },
        { keys: ['Ctrl', 'D'], description: 'Split View' },
        { keys: ['Ctrl', 'P'], description: 'Preview Only View' },
        { keys: ['F11'], description: 'Toggle Focus Mode' },
        { keys: ['Shift', 'F11'], description: 'Toggle Zen Mode' },
        { keys: ['Esc'], description: 'Exit Focus/Zen Mode' },
        { keys: ['Ctrl', '+'], description: 'Zoom In' },
        { keys: ['Ctrl', '-'], description: 'Zoom Out' },
        { keys: ['Ctrl', '0'], description: 'Reset Zoom' },
      ],
    },
    {
      category: 'Text Formatting',
      items: [
        { keys: ['Ctrl', 'B'], description: 'Bold' },
        { keys: ['Ctrl', 'I'], description: 'Italic' },
        { keys: ['Select Text'], description: 'Shows floating toolbar for quick formatting' },
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
