import { Moon, Sun, Keyboard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ViewModeSwitcher } from '@/components/ViewModeSwitcher';
import { useEditorStore } from '@/store/editorStore';

interface ControlBarProps {
  onShowKeyboardShortcuts: () => void;
}

export const ControlBar = ({ onShowKeyboardShortcuts }: ControlBarProps) => {
  const { theme, setTheme, errors, showErrorPanel, setShowErrorPanel } = useEditorStore();

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return (
    <TooltipProvider>
      <div 
        className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm no-print"
        role="toolbar"
        aria-label="Editor controls"
      >
        {/* LEFT: View Mode Switcher - Most Important */}
        <div className="flex items-center gap-2">
          <ViewModeSwitcher />
        </div>

        {/* CENTER: Error Badge (when errors exist) */}
        {errors.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrorPanel(!showErrorPanel)}
                className="h-8 px-2 gap-1.5"
              >
                <AlertTriangle className={`h-4 w-4 ${errorCount > 0 ? 'text-destructive' : 'text-yellow-500'}`} />
                <Badge variant={errorCount > 0 ? 'destructive' : 'secondary'} className="h-5 text-xs">
                  {errors.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{errorCount} error{errorCount !== 1 ? 's' : ''}, {warningCount} warning{warningCount !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* RIGHT: Utility Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light';
                  setTheme(nextTheme);
                }}
                className="h-8"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : theme === 'dark' ? <Sun className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Theme (Light/Dark/Sepia)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onShowKeyboardShortcuts}
                className="h-8"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Keyboard Shortcuts</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
