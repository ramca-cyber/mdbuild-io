import { useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { useEditorStore } from '@/store/editorStore';

const Index = () => {
  const { theme, viewMode } = useEditorStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
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
      <Toolbar />

      {/* Main Content */}
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

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span className="hidden sm:inline">
            {viewMode === 'split' ? 'Split View' : viewMode === 'editor' ? 'Editor Only' : 'Preview Only'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Lines: {useEditorStore.getState().content.split('\n').length}</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
