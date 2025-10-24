import { Edit3, Eye, Columns3 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settingsStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ViewModeSwitcher = () => {
  const { viewMode, setViewMode } = useSettingsStore();

  // Handle keyboard shortcuts for view modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'e') {
          e.preventDefault();
          setViewMode('editor');
        } else if (e.key === 'd') {
          e.preventDefault();
          setViewMode('split');
        } else if (e.key === 'p') {
          e.preventDefault();
          setViewMode('preview');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewMode]);

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
      className="flex items-center gap-0.5"
      role="group"
      aria-label="View mode switcher"
    >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = viewMode === mode.value;
          
          return (
            <Tooltip key={mode.value}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(mode.value)}
                  className={`gap-1.5 transition-all duration-200 h-8 ${
                    isActive 
                      ? 'border-primary border-2 bg-primary/10 text-primary font-semibold shadow-sm' 
                      : 'border-border hover:bg-accent hover:border-accent-foreground/20'
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
  );
};
