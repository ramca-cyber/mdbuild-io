import { Edit3, Eye, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/editorStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ViewModeSwitcher = () => {
  const { viewMode, setViewMode } = useEditorStore();

  const modes = [
    { 
      value: 'editor' as const, 
      icon: Edit3, 
      label: 'Edit',
      tooltip: 'Editor Only (Ctrl+E)',
      description: '📝 Edit'
    },
    { 
      value: 'split' as const, 
      icon: Columns3, 
      label: 'Split',
      tooltip: 'Split View (Ctrl+D)',
      description: '⚡ Split'
    },
    { 
      value: 'preview' as const, 
      icon: Eye, 
      label: 'Preview',
      tooltip: 'Preview Only (Ctrl+P)',
      description: '👁️ Preview'
    },
  ];

  return (
    <div 
      className="fixed top-20 right-4 z-40 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg no-print"
      role="group"
      aria-label="View mode switcher"
    >
      <div className="flex items-center gap-1 p-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = viewMode === mode.value;
          
          return (
            <Tooltip key={mode.value}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode.value)}
                  className={`gap-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'hover:bg-accent'
                  }`}
                  aria-label={mode.tooltip}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{mode.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{mode.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Keyboard shortcut hints */}
      <div className="px-2 pb-1 pt-0">
        <div className="text-[10px] text-muted-foreground text-center">
          <kbd className="px-1">Ctrl</kbd>+<kbd className="px-1">E/D/P</kbd>
        </div>
      </div>
    </div>
  );
};
