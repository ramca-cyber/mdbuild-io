import { useState } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Settings, Monitor, FileEdit, Keyboard, RotateCcw, FileText } from 'lucide-react';
import { EditorSettingsDialog } from './EditorSettingsDialog';
import { PreviewSettingsDialog } from './PreviewSettingsDialog';
import { DocumentSettingsDialog } from './DocumentSettingsDialog';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export const SettingsMenu = () => {
  const [showEditorSettings, setShowEditorSettings] = useState(false);
  const [showPreviewSettings, setShowPreviewSettings] = useState(false);
  const [showDocumentSettings, setShowDocumentSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const { resetToDefaults } = useSettingsStore();

  const handleResetAll = () => {
    if (confirm('Reset all settings to defaults? This action cannot be undone.')) {
      resetToDefaults();
      toast.success('All settings reset to defaults');
    }
  };

  return (
    <>
      <Menubar className="border-0 bg-transparent p-0 h-auto">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
            Settings
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowEditorSettings(true)}>
              <FileEdit className="h-4 w-4 mr-2" />
              Editor Settings...
            </MenubarItem>
            <MenubarItem onClick={() => setShowPreviewSettings(true)}>
              <Monitor className="h-4 w-4 mr-2" />
              Preview Settings...
            </MenubarItem>
            <MenubarItem onClick={() => setShowDocumentSettings(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Document Settings...
            </MenubarItem>
            
            <MenubarSeparator />
            
            <MenubarItem onClick={() => setShowKeyboardShortcuts(true)}>
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts...
            </MenubarItem>
            
            <MenubarSeparator />
            
            <MenubarItem onClick={handleResetAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <EditorSettingsDialog 
        open={showEditorSettings} 
        onOpenChange={setShowEditorSettings} 
      />
      <PreviewSettingsDialog 
        open={showPreviewSettings} 
        onOpenChange={setShowPreviewSettings} 
      />
      <DocumentSettingsDialog
        open={showDocumentSettings}
        onOpenChange={setShowDocumentSettings}
      />
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
    </>
  );
};
