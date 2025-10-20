import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateStatistics } from '@/lib/statisticsUtils';
import { useEditorStore } from '@/store/editorStore';

export const StatisticsPanel = () => {
  const { content } = useEditorStore();
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => calculateStatistics(content), [content]);

  return (
    <div className="border-t bg-background">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-4 flex-wrap">
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
          onClick={() => setExpanded(!expanded)}
          className="h-8 px-2"
          aria-label={expanded ? 'Hide detailed statistics' : 'Show detailed statistics'}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
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
  );
};
