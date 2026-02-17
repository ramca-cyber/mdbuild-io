import { useState } from 'react';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Save, Download, Upload, FilePlus, Undo, Redo, Search,
  Bold, Italic, Heading, List, Code, Link, Image, Table,
  ListTree, Moon, Sun, Settings, FileText,
} from 'lucide-react';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { useEditorViewStore } from '@/store/editorViewStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { InsertLinkDialog } from './InsertLinkDialog';

interface MobileMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDocuments: () => void;
}

export const MobileMenuSheet = ({ open, onOpenChange, onOpenDocuments }: MobileMenuSheetProps) => {
  const actions = useDocumentActions();
  const { undo, redo, canUndo, canRedo, insert } = useEditorViewStore();
  const { setShowSearchReplace } = useSearchStore();
  const { theme, setTheme, showOutline, setShowOutline, setShowEditorSettings } = useSettingsStore();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const close = () => onOpenChange(false);

  const act = (fn: () => void) => { fn(); close(); };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerDescription>Quick access to editor actions</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4 overflow-y-auto">
            {/* File */}
            <Section title="File">
              <MBtn icon={FilePlus} label="New" onClick={() => act(actions.handleNewDocument)} />
              <MBtn icon={Save} label="Save" onClick={() => act(actions.handleQuickSave)} />
              <MBtn icon={Download} label="Export MD" onClick={() => act(actions.handleExportMarkdown)} />
              <MBtn icon={Upload} label="Import" onClick={() => act(actions.handleImport)} />
              <MBtn icon={FileText} label="Documents" onClick={() => { close(); onOpenDocuments(); }} />
            </Section>

            <Separator />

            {/* Edit */}
            <Section title="Edit">
              <MBtn icon={Undo} label="Undo" onClick={() => act(undo)} disabled={!canUndo} />
              <MBtn icon={Redo} label="Redo" onClick={() => act(redo)} disabled={!canRedo} />
              <MBtn icon={Search} label="Find" onClick={() => { setShowSearchReplace(true); close(); }} />
            </Section>

            <Separator />

            {/* Format */}
            <Section title="Format">
              <MBtn icon={Bold} label="Bold" onClick={() => act(() => insert('wrap', { before: '**', after: '**' }))} />
              <MBtn icon={Italic} label="Italic" onClick={() => act(() => insert('wrap', { before: '*', after: '*' }))} />
              <MBtn icon={Heading} label="H1" onClick={() => act(() => insert('wrap', { before: '# ', after: '' }))} />
              <MBtn icon={List} label="List" onClick={() => act(() => insert('wrap', { before: '- ', after: '' }))} />
              <MBtn icon={Code} label="Code" onClick={() => act(() => insert('wrap', { before: '`', after: '`' }))} />
            </Section>

            <Separator />

            {/* Insert */}
            <Section title="Insert">
              <MBtn icon={Link} label="Link" onClick={() => { close(); setLinkDialogOpen(true); }} />
              <MBtn icon={Image} label="Image" onClick={() => act(() => insert('wrap', { before: '![', after: '](url)', placeholder: 'alt text' }))} />
              <MBtn icon={Table} label="Table" onClick={() => act(() => insert('block', { block: '| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |' }))} />
            </Section>

            <Separator />

            {/* View & Settings */}
            <Section title="View & Settings">
              <MBtn icon={ListTree} label={showOutline ? 'Hide Outline' : 'Outline'} onClick={() => act(() => setShowOutline(!showOutline))} />
              <MBtn icon={theme === 'dark' ? Sun : Moon} label="Theme" onClick={() => act(() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light'))} />
              <MBtn icon={Settings} label="Settings" onClick={() => { setShowEditorSettings(true); close(); }} />
            </Section>
          </div>
        </DrawerContent>
      </Drawer>

      <InsertLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsert={(url, text) => insert('wrap', { before: '[', after: `](${url})`, placeholder: text || 'link text' })}
        mode="link"
      />
    </>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function MBtn({ icon: Icon, label, onClick, disabled }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onClick} disabled={disabled}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
