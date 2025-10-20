import { useEffect, useState, useMemo } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { ResizableHandle } from '@/components/ui/resizable';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { DocumentHeader } from '@/components/DocumentHeader';
import { OutlinePanel } from '@/components/OutlinePanel';
import { TemplatesDrawer } from '@/components/TemplatesDrawer';
import { SettingsSheet } from '@/components/SettingsSheet';
import { SavedDocuments } from '@/components/SavedDocuments';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useEditorStore } from '@/store/editorStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Settings, BookTemplate, List, Home, X, Moon, Sun, Keyboard, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateStatistics } from '@/lib/statisticsUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { theme, setTheme, viewMode, setViewMode, showOutline, focusMode, setFocusMode, content } = useEditorStore();
  const [mobilePanel, setMobilePanel] = useState<'documents' | 'templates' | 'settings' | 'outline' | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const isMobile = useIsMobile();

  // Calculate word count for focus mode
  const stats = useMemo(() => calculateStatistics(content), [content]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // System theme detection and sync
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // Set initial theme based on system preference
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Handle ESC key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, setFocusMode]);

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
    <div className="hidden lg:block w-64 border-l border-border bg-muted/30">
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
      
      {/* Header */}
      {!focusMode && (
      <header className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10" role="banner">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">M</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MDBuild.io
            </h1>
          </div>
        </div>

        {/* Mobile menu - Consolidated */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/landing">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setMobilePanel('documents')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setMobilePanel('templates')}
                >
                  <BookTemplate className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                
                {/* Visual Separator */}
                <div className="h-px bg-border my-2" />
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setMobilePanel('outline')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Outline
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light';
                    setTheme(nextTheme);
                  }}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4 mr-2" /> : theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                  Theme ({theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Sepia'})
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    setShowKeyboardShortcuts(true);
                  }}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Keyboard Shortcuts
                </Button>

                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/help">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Help & Docs
                  </Link>
                </Button>
                
                {/* Visual Separator */}
                <div className="h-px bg-border my-2" />
                
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setMobilePanel('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Primary Navigation Group */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/landing" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/help" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Help</span>
            </Link>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <SettingsSheet />
            </SheetContent>
          </Sheet>
          
          {/* Visual Separator */}
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Utility Group */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light';
                  setTheme(nextTheme);
                }}
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
                onClick={() => setShowKeyboardShortcuts(true)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Keyboard Shortcuts</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      )}

      {/* Document Header */}
      {!focusMode && <DocumentHeader />}
      
      {/* Toolbar */}
      {!focusMode && <Toolbar />}

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
                  <Panel defaultSize={50} minSize={30}>
                    <Editor />
                  </Panel>
                  <ResizableHandle withHandle />
                  <Panel defaultSize={50} minSize={30}>
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
            <aside role="complementary" aria-label="Document outline">
              <OutlinePanel />
            </aside>
          </SidePanel>
        )}
      </div>

      {/* Footer with Enhanced Statistics */}
      {!focusMode && (
        <footer role="contentinfo" className="border-t">
          <StatisticsPanel />
          <div className="px-4 py-2 text-sm text-muted-foreground flex justify-end">
            <Link to="/help" className="hover:text-foreground">Help & Docs</Link>
          </div>
        </footer>
      )}

      {/* Focus Mode Exit Button and Word Count Overlay */}
      {focusMode && (
        <div role="dialog" aria-modal="true" aria-label="Focus mode">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFocusMode(false)}
                className="no-print fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-accent transition-all"
                aria-label="Exit focus mode"
                title="Exit Focus Mode (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit Focus Mode (ESC)</p>
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
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Outline</SheetTitle>
          </SheetHeader>
          <OutlinePanel />
        </SheetContent>
      </Sheet>

      <Sheet open={mobilePanel === 'settings'} onOpenChange={(open) => !open && setMobilePanel(null)}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <SettingsSheet />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
