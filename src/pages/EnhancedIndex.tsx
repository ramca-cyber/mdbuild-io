import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { EnhancedToolbar } from '@/components/EnhancedToolbar';
import { OutlinePanel } from '@/components/OutlinePanel';
import { TemplatesDrawer } from '@/components/TemplatesDrawer';
import { SavedDocuments } from '@/components/SavedDocuments';
import { SettingsSheet } from '@/components/SettingsSheet';
import { useEditorStore } from '@/store/editorStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, FileText, List, BookOpen, Menu } from 'lucide-react';
import pako from 'pako';

const EnhancedIndex = () => {
  const { theme, viewMode, setContent, content } = useEditorStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Check for shared document in URL
    const params = new URLSearchParams(window.location.search);
    const docData = params.get('doc');
    
    if (docData) {
      try {
        const compressed = Uint8Array.from(atob(decodeURIComponent(docData)), c => c.charCodeAt(0));
        const decompressed = pako.inflate(compressed, { to: 'string' });
        setContent(decompressed);
        // Clear URL after loading
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Failed to load shared document:', error);
      }
    }
  }, [setContent]);

  // Calculate stats
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <Tabs defaultValue="documents" className="h-full">
                <SheetHeader className="p-4 pb-0">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="documents" className="text-xs">
                      <FileText className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="outline" className="text-xs">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs">
                      <BookOpen className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </SheetHeader>
                <TabsContent value="documents" className="h-[calc(100%-80px)] mt-0">
                  <SavedDocuments />
                </TabsContent>
                <TabsContent value="outline" className="h-[calc(100%-80px)] mt-0">
                  <OutlinePanel />
                </TabsContent>
                <TabsContent value="templates" className="h-[calc(100%-80px)] mt-0">
                  <TemplatesDrawer />
                </TabsContent>
                <TabsContent value="settings" className="h-[calc(100%-80px)] mt-0">
                  <SettingsSheet />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MDBuild.io
            </h1>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Modern Markdown Editor
          </span>
        </div>
      </header>

      {/* Toolbar */}
      <EnhancedToolbar />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 border-r border-border bg-muted/30">
          <Tabs defaultValue="documents" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="documents" title="Documents">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="outline" title="Outline">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="templates" title="Templates">
                <BookOpen className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="settings" title="Settings">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="h-[calc(100%-48px)] mt-0">
              <SavedDocuments />
            </TabsContent>
            <TabsContent value="outline" className="h-[calc(100%-48px)] mt-0">
              <OutlinePanel />
            </TabsContent>
            <TabsContent value="templates" className="h-[calc(100%-48px)] mt-0">
              <TemplatesDrawer />
            </TabsContent>
            <TabsContent value="settings" className="h-[calc(100%-48px)] mt-0">
              <SettingsSheet />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-hidden">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span className="hidden sm:inline">
            {viewMode === 'split' ? 'Split View' : viewMode === 'editor' ? 'Editor Only' : 'Preview Only'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span className="hidden sm:inline">{charCount} characters</span>
          <span className="hidden md:inline">{readingTime} min read</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedIndex;
