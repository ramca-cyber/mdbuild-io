import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListTodo,
  Link,
  Image,
  Quote,
  Code2,
  Minus,
  Table,
  Type,
  Eraser,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export const FormatMenu = () => {
  const { content, setContent } = useEditorStore();

  const insertAtCursor = (before: string, after: string = '') => {
    const event = new CustomEvent('editor-insert', {
      detail: { before, after }
    });
    window.dispatchEvent(event);
  };

  const handleConvertCase = (caseType: 'upper' | 'lower' | 'title') => {
    const event = new CustomEvent('editor-convert-case', {
      detail: { caseType }
    });
    window.dispatchEvent(event);
  };

  const handleTextCleanup = (cleanupType: 'trailing' | 'empty' | 'trim') => {
    const event = new CustomEvent('editor-text-cleanup', {
      detail: { cleanupType }
    });
    window.dispatchEvent(event);
  };

  return (
    <Menubar className="border-0 bg-transparent p-0 h-auto">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
          Format
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => insertAtCursor('**', '**')}>
            <Bold className="h-4 w-4 mr-2" />
            Bold
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('*', '*')}>
            <Italic className="h-4 w-4 mr-2" />
            Italic
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('~~', '~~')}>
            <Strikethrough className="h-4 w-4 mr-2" />
            Strikethrough
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('`', '`')}>
            <Code className="h-4 w-4 mr-2" />
            Inline Code
          </MenubarItem>

          <MenubarSeparator />

          <MenubarSub>
            <MenubarSubTrigger>
              <Heading1 className="h-4 w-4 mr-2" />
              Headings
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => insertAtCursor('# ', '')}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('## ', '')}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('### ', '')}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('#### ', '')}>
                <Heading4 className="h-4 w-4 mr-2" />
                Heading 4
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('##### ', '')}>
                <Heading5 className="h-4 w-4 mr-2" />
                Heading 5
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('###### ', '')}>
                <Heading6 className="h-4 w-4 mr-2" />
                Heading 6
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSub>
            <MenubarSubTrigger>
              <List className="h-4 w-4 mr-2" />
              Lists
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => insertAtCursor('- ', '')}>
                <List className="h-4 w-4 mr-2" />
                Bullet List
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('1. ', '')}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered List
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('- [ ] ', '')}>
                <ListTodo className="h-4 w-4 mr-2" />
                Task List
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSub>
            <MenubarSubTrigger>
              <Link className="h-4 w-4 mr-2" />
              Insert
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => insertAtCursor('[', '](url)')}>
                <Link className="h-4 w-4 mr-2" />
                Link
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('![alt](', ')')}>
                <Image className="h-4 w-4 mr-2" />
                Image
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('> ', '')}>
                <Quote className="h-4 w-4 mr-2" />
                Blockquote
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('```\n', '\n```')}>
                <Code2 className="h-4 w-4 mr-2" />
                Code Block
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('---\n', '')}>
                <Minus className="h-4 w-4 mr-2" />
                Horizontal Rule
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('| Column 1 | Column 2 |\n|----------|----------|\n| ', ' |  |')}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSeparator />

          <MenubarSub>
            <MenubarSubTrigger>
              <Type className="h-4 w-4 mr-2" />
              Convert Case
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleConvertCase('upper')}>
                UPPERCASE
              </MenubarItem>
              <MenubarItem onClick={() => handleConvertCase('lower')}>
                lowercase
              </MenubarItem>
              <MenubarItem onClick={() => handleConvertCase('title')}>
                Title Case
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSub>
            <MenubarSubTrigger>
              <Eraser className="h-4 w-4 mr-2" />
              Text Cleanup
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleTextCleanup('trailing')}>
                Remove Trailing Spaces
              </MenubarItem>
              <MenubarItem onClick={() => handleTextCleanup('empty')}>
                Remove Empty Lines
              </MenubarItem>
              <MenubarItem onClick={() => handleTextCleanup('trim')}>
                Trim Whitespace
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
