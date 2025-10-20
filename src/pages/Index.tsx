import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Link } from 'react-router-dom';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { DocumentHeader } from '@/components/DocumentHeader';
import { OutlinePanel } from '@/components/OutlinePanel';
import { TemplatesDrawer } from '@/components/TemplatesDrawer';
import { SettingsSheet } from '@/components/SettingsSheet';
import { SavedDocuments } from '@/components/SavedDocuments';
import { useEditorStore } from '@/store/editorStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Settings, BookTemplate, List, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { theme, viewMode, content, showOutline } = useEditorStore();
  const [mobilePanel, setMobilePanel] = useState<'documents' | 'templates' | 'settings' | 'outline' | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Calculate stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const SidePanel = ({ children }: { children: React.ReactNode }) => (
    <div className="hidden lg:block w-64 border-l border-border bg-muted/30">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">M</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MDBuild.io
            </h1>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Modern Markdown Editor
          </span>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/landing">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobilePanel('documents')}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobilePanel('templates')}>
            <BookTemplate className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobilePanel('outline')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobilePanel('settings')}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/landing" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
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
        </div>
      </header>

      {/* Document Header */}
      <DocumentHeader />
      
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {viewMode === 'split' && (
            <PanelGroup direction="horizontal" className="h-full">
              <Panel defaultSize={50} minSize={30}>
                <div className="h-full border-r border-border">
                  <Editor />
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
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
        </main>

        {/* Desktop Side Panels */}
        {showOutline && (
          <SidePanel>
            <OutlinePanel />
          </SidePanel>
        )}
      </div>

      {/* Footer with Stats */}
      <footer className="px-4 sm:px-6 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <span>Ready</span>
          <span className="hidden sm:inline">
            {viewMode === 'split' ? 'Split View' : viewMode === 'editor' ? 'Editor Only' : 'Preview Only'}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline">Words: {wordCount}</span>
          <span className="hidden md:inline">Chars: {charCount}</span>
          <span className="hidden lg:inline">{readingTime} min read</span>
          <span>Lines: {content.split('\n').length}</span>
        </div>
      </footer>

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
