import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar';
import {
  Eye,
  SplitSquareHorizontal,
  FileEdit,
  ListTree,
  Link,
  Maximize2,
  Sparkles,
  WrapText,
  Hash,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

export function ViewMenu() {
  const {
    viewMode,
    setViewMode,
    showOutline,
    setShowOutline,
    syncScroll,
    setSyncScroll,
    focusMode,
    setFocusMode,
    zenMode,
    setZenMode,
    lineWrap,
    setLineWrap,
    lineNumbers,
    setLineNumbers,
  } = useSettingsStore();

  return (
    <Menubar className="border-0 bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">View</MenubarTrigger>
        <MenubarContent>
          {/* View Mode */}
          <MenubarSub>
            <MenubarSubTrigger>
              <SplitSquareHorizontal className="h-4 w-4 mr-2" />
              View Mode
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <MenubarRadioItem value="editor">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Editor Only
                  <MenubarShortcut>Ctrl+E</MenubarShortcut>
                </MenubarRadioItem>
                <MenubarRadioItem value="split">
                  <SplitSquareHorizontal className="h-4 w-4 mr-2" />
                  Split View
                  <MenubarShortcut>Ctrl+D</MenubarShortcut>
                </MenubarRadioItem>
                <MenubarRadioItem value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Only
                  <MenubarShortcut>Ctrl+P</MenubarShortcut>
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarCheckboxItem
            checked={lineWrap}
            onCheckedChange={setLineWrap}
          >
            <WrapText className="h-4 w-4 mr-2" />
            Word Wrap
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={lineNumbers}
            onCheckedChange={setLineNumbers}
          >
            <Hash className="h-4 w-4 mr-2" />
            Line Numbers
          </MenubarCheckboxItem>

          <MenubarSeparator />

          {/* Panel Toggles */}
          {viewMode !== 'editor' && (
            <MenubarCheckboxItem
              checked={showOutline}
              onCheckedChange={setShowOutline}
            >
              <ListTree className="h-4 w-4 mr-2" />
              Outline Panel
            </MenubarCheckboxItem>
          )}

          {viewMode === 'split' && (
            <MenubarCheckboxItem
              checked={syncScroll}
              onCheckedChange={setSyncScroll}
            >
              <Link className="h-4 w-4 mr-2" />
              Sync Scrolling
            </MenubarCheckboxItem>
          )}

          {viewMode !== 'editor' && <MenubarSeparator />}

          {/* Focus & Zen Modes */}
          <MenubarCheckboxItem
            checked={focusMode}
            onCheckedChange={setFocusMode}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Focus Mode
            <MenubarShortcut>F11</MenubarShortcut>
          </MenubarCheckboxItem>

          <MenubarCheckboxItem
            checked={zenMode}
            onCheckedChange={setZenMode}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Zen Mode
            <MenubarShortcut>Shift+F11</MenubarShortcut>
          </MenubarCheckboxItem>

        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
