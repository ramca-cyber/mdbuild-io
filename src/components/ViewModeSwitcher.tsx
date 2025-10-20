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
      tooltip: 'Editor Only (Ctrl+E)'
    },
    { 
      value: 'split' as const, 
      icon: Columns3, 
      label: 'Split',
      tooltip: 'Split View (Ctrl+D)'
    },
    { 
      value: 'preview' as const, 
      icon: Eye, 
      label: 'Preview',
      tooltip: 'Preview Only (Ctrl+P)'
    },
  ];

  return (
    <div 
      className="fixed top-20 right-4 z-40 no-print"
      role="group"
      aria-label="View mode switcher"
    >
      <div className="flex items-center gap-0.5 bg-toolbar-bg border border-border rounded-md p-0.5 shadow-sm">
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
                  className={`gap-1.5 transition-all duration-200 h-8 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  }`}
                  aria-label={mode.tooltip}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-medium">{mode.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{mode.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
