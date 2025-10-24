import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const ErrorConsole = () => {
  const { errors, showErrorPanel, setShowErrorPanel, clearErrors, removeError } = useEditorStore();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const filteredErrors = errors.filter(err => filter === 'all' || err.type === filter);

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;
  const infoCount = errors.filter(e => e.type === 'info').length;

  const getIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      markdown: 'Markdown',
      mermaid: 'Mermaid',
      math: 'Math',
      link: 'Link',
      accessibility: 'Accessibility'
    };
    return labels[category] || category;
  };

  const handleErrorClick = (line?: number) => {
    if (line) {
      window.dispatchEvent(new CustomEvent('preview-click', { detail: line }));
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border bg-background no-print">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            className="h-7 px-2 gap-1"
          >
            {showErrorPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="font-semibold text-sm">Issues</span>
          </Button>

          {errorCount > 0 && (
            <Badge variant="destructive" className="h-5 text-xs font-medium gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errorCount}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="h-5 text-xs font-medium gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20">
              <AlertCircle className="h-3 w-3" />
              {warningCount}
            </Badge>
          )}
          {infoCount > 0 && (
            <Badge className="h-5 text-xs font-medium gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20">
              <Info className="h-3 w-3" />
              {infoCount}
            </Badge>
          )}

          <Separator orientation="vertical" className="h-4" />

          {/* Filter buttons */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-6 px-2 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === 'error' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('error')}
              className="h-6 px-2 text-xs"
              disabled={errorCount === 0}
            >
              Errors
            </Button>
            <Button
              variant={filter === 'warning' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('warning')}
              className="h-6 px-2 text-xs"
              disabled={warningCount === 0}
            >
              Warnings
            </Button>
            <Button
              variant={filter === 'info' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('info')}
              className="h-6 px-2 text-xs"
              disabled={infoCount === 0}
            >
              Info
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearErrors}
          className="h-7 px-2 gap-1 text-xs"
        >
          <Trash2 className="h-3 w-3" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
      </div>

      {/* Error List */}
      {showErrorPanel && (
        <ScrollArea className="h-48">
          <div className="divide-y divide-border">
            {filteredErrors.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No {filter !== 'all' && `${filter}s`} to display
              </div>
            ) : (
              filteredErrors.map((error) => (
                <div
                  key={error.id}
                  className="p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleErrorClick(error.line)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getIcon(error.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{error.message}</span>
                        {error.line && (
                          <Badge variant="outline" className="h-5 text-xs">
                            Line {error.line}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="h-5 text-xs">
                          {getCategoryLabel(error.category)}
                        </Badge>
                      </div>
                      {error.details && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {error.details}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeError(error.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
