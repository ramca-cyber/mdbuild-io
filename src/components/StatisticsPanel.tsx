import { useMemo, useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateStatistics } from '@/lib/statisticsUtils';
import { useEditorStore } from '@/store/editorStore';
import { GoToLineDialog } from '@/components/GoToLineDialog';

export const StatisticsPanel = () => {
  const { 
    content, 
    statisticsExpanded, 
    setStatisticsExpanded, 
    hasUnsavedChanges, 
    autoSave,
    cursorLine,
    cursorColumn,
    selectedWords,
    zoomLevel
  } = useEditorStore();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showGoToDialog, setShowGoToDialog] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges && autoSave) {
      setLastSaved(new Date());
      setIsSaving(false);
    } else if (hasUnsavedChanges && autoSave) {
      setIsSaving(true);
    }
  }, [hasUnsavedChanges, autoSave]);
  
  useEffect(() => {
    const handleShowGoTo = () => setShowGoToDialog(true);
    window.addEventListener('show-goto-dialog', handleShowGoTo);
    return () => window.removeEventListener('show-goto-dialog', handleShowGoTo);
  }, []);

  const stats = useMemo(() => calculateStatistics(content), [content]);
  const totalLines = content.split('\n').length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return 'just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="border-t bg-background">
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowGoToDialog(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Click to go to line (Ctrl+G)"
            >
              <span>
                Ln <span className="font-medium text-foreground">{cursorLine}</span>, Col <span className="font-medium text-foreground">{cursorColumn}</span>
              </span>
              {selectedWords > 0 && (
                <span className="text-primary font-medium">
                  ({selectedWords} word{selectedWords !== 1 ? 's' : ''} selected)
                </span>
              )}
            </button>
            
            {zoomLevel !== 100 && (
              <span className="text-muted-foreground">
                Zoom: <span className="font-medium text-foreground">{zoomLevel}%</span>
              </span>
            )}
            
            <span className="text-muted-foreground">
              UTF-8
            </span>
            
            {autoSave && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-primary">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                    <span className="text-green-600 dark:text-green-500">
                      Saved {lastSaved ? formatTime(lastSaved) : ''}
                    </span>
                  </>
                )}
              </span>
            )}
            <span className="text-muted-foreground">
              Words: <span className="font-medium text-foreground">{stats.words}</span>
            </span>
            <span className="text-muted-foreground">
              Characters: <span className="font-medium text-foreground">{stats.characters}</span>
            </span>
            <span className="text-muted-foreground">
              Lines: <span className="font-medium text-foreground">{stats.lines}</span>
            </span>
            <span className="text-muted-foreground">
              Reading time: <span className="font-medium text-foreground">{stats.readingTime} min</span>
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatisticsExpanded(!statisticsExpanded)}
            className="h-8 px-2"
            aria-label={statisticsExpanded ? 'Hide detailed statistics' : 'Show detailed statistics'}
          >
            {statisticsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {statisticsExpanded && (
          <div className="px-4 pb-3 pt-1 border-t animate-accordion-down">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Characters (no spaces)</div>
                <div className="font-medium">{stats.charactersNoSpaces}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Paragraphs</div>
                <div className="font-medium">{stats.paragraphs}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sentences</div>
                <div className="font-medium">{stats.sentences}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg words/sentence</div>
                <div className="font-medium">
                  {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Headings</div>
                <div className="font-medium">
                  {Object.values(stats.headings).reduce((a, b) => a + b, 0)}
                  <span className="text-xs text-muted-foreground ml-1">
                    (H1:{stats.headings.h1} H2:{stats.headings.h2} H3:{stats.headings.h3})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Code blocks</div>
                <div className="font-medium">{stats.codeBlocks}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Links</div>
                <div className="font-medium">{stats.links}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Images</div>
                <div className="font-medium">{stats.images}</div>
              </div>
              {stats.tables > 0 && (
                <div>
                  <div className="text-muted-foreground">Tables</div>
                  <div className="font-medium">{stats.tables}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <GoToLineDialog
        open={showGoToDialog}
        onOpenChange={setShowGoToDialog}
        totalLines={totalLines}
      />
    </>
  );
};
