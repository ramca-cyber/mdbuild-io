import { useState } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Settings, Monitor, FileEdit, Keyboard, RotateCcw, FileText, Code2 } from 'lucide-react';
import { SnippetsDialog } from './SnippetsDialog';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export const SettingsMenu = () => {
  const [showSnippets, setShowSnippets] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const { resetToDefaults, setShowEditorSettings, setShowKeyboardShortcuts, setShowDocumentSettings } = useSettingsStore();

  const handleResetAll = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    toast.success('All settings reset to defaults');
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
            <MenubarItem onClick={() => setShowDocumentSettings(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Document Settings...
            </MenubarItem>
            
            <MenubarSeparator />

            <MenubarItem onClick={() => setShowSnippets(true)}>
              <Code2 className="h-4 w-4 mr-2" />
              Manage Snippets...
            </MenubarItem>
            
            <MenubarSeparator />
            
            <MenubarItem onClick={() => setShowKeyboardShortcuts(true)}>
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts...
            </MenubarItem>
            
            <MenubarSeparator />
            
            <MenubarItem onClick={() => setShowResetConfirm(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <SnippetsDialog
        open={showSnippets}
        onOpenChange={setShowSnippets}
      />

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all editor, preview, and document settings to their defaults. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll}>Reset All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
