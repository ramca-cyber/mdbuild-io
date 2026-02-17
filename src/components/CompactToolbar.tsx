import { Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, CheckSquare, Undo2, Redo2, Search, MoreHorizontal, Image as ImageIcon, Table, Quote, Strikethrough, Minus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useSearchStore } from '@/store/searchStore';
import { useEditorViewStore } from '@/store/editorViewStore';
import { EmojiPicker } from './EmojiPicker';
import { InsertLinkDialog } from './InsertLinkDialog';
import { useState } from 'react';

export function CompactToolbar() {
  const { setShowSearchReplace } = useSearchStore();
  const { undo, redo, insert } = useEditorViewStore();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const dispatchWrap = (before: string, after: string = '', placeholder: string = '') => {
    insert('wrap', { before, after, placeholder });
  };

  const dispatchBlock = (block: string) => {
    insert('block', { block });
  };

  const handleLink = () => {
    setLinkDialogOpen(true);
  };

  const handleImage = () => {
    setImageDialogOpen(true);
  };

  const onLinkInsert = (url: string, text: string) => {
    dispatchWrap('[', `](${url})`, text || 'link text');
  };

  const onImageInsert = (url: string, alt: string) => {
    dispatchBlock(`![${alt || 'image'}](${url})`);
  };

  const handleEmojiInsert = (emoji: string) => {
    dispatchWrap(emoji, '');
    setEmojiPickerOpen(false);
  };

  return (
    <>
    <div className="hidden lg:flex items-center gap-1 px-2">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatchWrap('**', '**', 'bold text')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatchWrap('*', '*', 'italic text')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic (Ctrl+I)</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 px-2 font-bold text-base">
                  H
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Headings</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => dispatchBlock('# Heading 1')}>
              <span className="text-2xl font-bold">H1</span>
              <span className="ml-2">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('## Heading 2')}>
              <span className="text-xl font-bold">H2</span>
              <span className="ml-2">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('### Heading 3')}>
              <span className="text-lg font-bold">H3</span>
              <span className="ml-2">Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('#### Heading 4')}>
              <span className="text-base font-bold">H4</span>
              <span className="ml-2">Heading 4</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('##### Heading 5')}>
              <span className="text-sm font-bold">H5</span>
              <span className="ml-2">Heading 5</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('###### Heading 6')}>
              <span className="text-xs font-bold">H6</span>
              <span className="ml-2">Heading 6</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLink}
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Link (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <List className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lists</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => dispatchBlock('- List item')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('1. List item')}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('- [ ] Task item')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Task List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatchWrap('`', '`', 'code')}
              className="h-8 w-8 p-0"
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inline Code</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* More Options */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>More Formatting</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleImage}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Insert Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatchBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}>
            <Table className="h-4 w-4 mr-2" />
            Insert Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatchBlock('> Quote')}>
            <Quote className="h-4 w-4 mr-2" />
            Blockquote
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => dispatchWrap('~~', '~~', 'strikethrough')}>
            <Strikethrough className="h-4 w-4 mr-2" />
            Strikethrough
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatchBlock('---')}>
            <Minus className="h-4 w-4 mr-2" />
            Horizontal Rule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatchBlock('```\ncode block\n```')}>
            <Code className="h-4 w-4 mr-2" />
            Code Block
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenu open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <DropdownMenuTrigger asChild>
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                <Smile className="h-4 w-4 mr-2" />
                Emoji Picker
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-0">
              <EmojiPicker onEmojiSelect={handleEmojiInsert} />
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Utilities */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => undo()}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => redo()}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSearchReplace(true)}
              className="h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Find & Replace (Ctrl+F)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    <InsertLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} onInsert={onLinkInsert} mode="link" />
    <InsertLinkDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen} onInsert={onImageInsert} mode="image" />
    </>
  );
}
