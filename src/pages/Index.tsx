import { useEffect, useState, useMemo } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { ResizableHandle } from '@/components/ui/resizable';
import { SEO } from '@/components/SEO';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { DocumentHeader } from '@/components/DocumentHeader';
import { OutlinePanel } from '@/components/OutlinePanel';
import { TemplatesDrawer } from '@/components/TemplatesDrawer';
import { SavedDocuments } from '@/components/SavedDocuments';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { ErrorConsole } from '@/components/ErrorConsole';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateStatistics } from '@/lib/statisticsUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { theme, setTheme, viewMode, showOutline, focusMode, setFocusMode, zenMode, setZenMode } = useSettingsStore();
  const { content } = useDocumentStore();
  const [mobilePanel, setMobilePanel] = useState<'documents' | 'templates' | 'outline' | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const isMobile = useIsMobile();

  // Calculate word count for focus mode
  const stats = useMemo(() => calculateStatistics(content), [content]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // System theme detection - only on first visit (respect persisted preference)
  useEffect(() => {
    const hasPersistedSettings = localStorage.getItem('settings-storage');
    if (hasPersistedSettings) return; // User already has a saved theme preference
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
  }, [setTheme]);

  // Handle ESC key to exit focus/zen mode, F11 for focus mode, Shift+F11 for zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zenMode) {
          setZenMode(false);
        } else if (focusMode) {
          setFocusMode(false);
        }
      }
      if (e.key === 'F11') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+F11 = Zen Mode
          setZenMode(!zenMode);
        } else {
          // F11 = Focus Mode
          setFocusMode(!focusMode);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, setFocusMode, zenMode, setZenMode]);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'sepia');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'sepia') {
      document.documentElement.classList.add('sepia');
    }
  }, [theme]);

  // Handle print mode
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    const printMedia = window.matchMedia('print');
    const handlePrintMediaChange = (e: MediaQueryListEvent) => setIsPrinting(e.matches);
    printMedia.addEventListener('change', handlePrintMediaChange);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      printMedia.removeEventListener('change', handlePrintMediaChange);
    };
  }, []);

  const SidePanel = ({ children }: { children: React.ReactNode }) => (
    <div className="hidden lg:flex lg:flex-col w-64 border-l border-border bg-muted/30 overflow-hidden">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <SEO 
        title="MDBuild.io Editor - GitHub Alerts, Mermaid, LaTeX & Interactive Tasks"
        description="Professional markdown editor with GitHub Alerts & Admonitions, real-time preview, Mermaid diagrams, KaTeX math, interactive task lists. Export to PNG, PDF, HTML, DOCX. Free, private, no sign-up."
        keywords="markdown editor online, github alerts markdown, markdown admonitions, live preview, mermaid diagrams, latex equations, katex markdown, interactive task list, markdown to pdf, markdown to png, technical writing, documentation editor, pwa markdown editor"
        canonicalUrl="https://mdbuild.io/editor"
      />
      {/* Skip to content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="skip-to-content"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
      
      
      {/* Document Header (merged with app header) */}
      {!focusMode && (
        <DocumentHeader 
          showKeyboardShortcuts={showKeyboardShortcuts}
          setShowKeyboardShortcuts={setShowKeyboardShortcuts}
          setMobilePanel={setMobilePanel}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main id="main-content" className="flex-1 overflow-hidden" role="main" aria-label="Document editor">
          {isPrinting ? (
            <div className="h-full">
              <Preview />
            </div>
          ) : (
            <>
              {viewMode === 'split' && !isMobile && (
                <PanelGroup direction="horizontal" className="h-full">
                  <Panel defaultSize={50} minSize={30}>
                    <Editor />
                  </Panel>
                  <ResizableHandle withHandle />
                  <Panel defaultSize={50} minSize={30}>
                    <Preview />
                  </Panel>
                </PanelGroup>
              )}
              
              {viewMode === 'split' && isMobile && (
                <PanelGroup direction="vertical" className="h-full">
                  <Panel defaultSize={65} minSize={30}>
                    <Editor />
                  </Panel>
                  <ResizableHandle withHandle />
                  <Panel defaultSize={35} minSize={20}>
                    <Preview />
                  </Panel>
                </PanelGroup>
              )}
              
              {viewMode === 'editor' && (
                <div className="h-full">
                  <Editor />
                </div>
              )}
              
              {viewMode === 'preview' && (
                <div className="h-full">
                  <Preview />
                </div>
              )}
            </>
          )}
        </main>

        {/* Desktop Side Panels */}
        {!focusMode && showOutline && (
          <SidePanel>
            <aside role="complementary" aria-label="Document outline" className="h-full overflow-hidden">
              <OutlinePanel />
            </aside>
          </SidePanel>
        )}
      </div>

      {/* Footer with Enhanced Statistics */}
      {!zenMode && !focusMode && (
        <footer role="contentinfo" className="border-t">
          <StatisticsPanel />
        </footer>
      )}

      {/* Error Console */}
      <ErrorConsole />

      {/* Focus Mode or Zen Mode Exit Button and Word Count Overlay */}
      {(focusMode || zenMode) && (
        <div role="dialog" aria-modal="true" aria-label={zenMode ? "Zen mode" : "Focus mode"}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (zenMode) setZenMode(false);
                  else setFocusMode(false);
                }}
                className="no-print fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-accent transition-all"
                aria-label={zenMode ? "Exit zen mode" : "Exit focus mode"}
                title={zenMode ? "Exit Zen Mode (Esc)" : "Exit Focus Mode (Esc)"}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{zenMode ? "Exit Zen Mode (ESC)" : "Exit Focus Mode (ESC)"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Word Count Overlay */}
          <div 
            className="no-print fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg"
            role="status"
            aria-live="polite"
            aria-label="Document statistics"
          >
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Words: <span className="font-medium text-foreground">{stats.words}</span>
              </span>
              <span className="text-muted-foreground">
                Characters: <span className="font-medium text-foreground">{stats.characters}</span>
              </span>
              <span className="text-muted-foreground">
                Reading: <span className="font-medium text-foreground">{stats.readingTime} min</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog 
        open={showKeyboardShortcuts} 
        onOpenChange={setShowKeyboardShortcuts} 
      />

      {/* Mobile Sheets */}
      <Sheet open={mobilePanel === 'documents'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Saved Documents</SheetTitle>
          </SheetHeader>
          <SavedDocuments />
        </SheetContent>
      </Sheet>

      <Sheet open={mobilePanel === 'templates'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Templates</SheetTitle>
          </SheetHeader>
          <TemplatesDrawer />
        </SheetContent>
      </Sheet>

      <Sheet open={mobilePanel === 'outline'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="right" className="w-80 flex flex-col">
          <SheetHeader>
            <SheetTitle>Outline</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden mt-4">
            <OutlinePanel />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
