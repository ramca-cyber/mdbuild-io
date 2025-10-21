import { useState } from 'react';
import {
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
} from '@/components/ui/menubar';
import { Settings, Monitor, FileEdit } from 'lucide-react';
import { EditorPreferencesDialog } from './EditorPreferencesDialog';
import { PreviewPreferencesDialog } from './PreviewPreferencesDialog';

export const PreferencesMenu = () => {
  const [showEditorPrefs, setShowEditorPrefs] = useState(false);
  const [showPreviewPrefs, setShowPreviewPrefs] = useState(false);

  return (
    <>
      <MenubarSub>
        <MenubarSubTrigger>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem onClick={() => setShowEditorPrefs(true)}>
            <FileEdit className="h-4 w-4 mr-2" />
            Editor Preferences...
          </MenubarItem>
          <MenubarItem onClick={() => setShowPreviewPrefs(true)}>
            <Monitor className="h-4 w-4 mr-2" />
            Preview Preferences...
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>

      <EditorPreferencesDialog 
        open={showEditorPrefs} 
        onOpenChange={setShowEditorPrefs} 
      />
      <PreviewPreferencesDialog 
        open={showPreviewPrefs} 
        onOpenChange={setShowPreviewPrefs} 
      />
    </>
  );
};
