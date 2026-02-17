import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorViewStore } from '@/store/editorViewStore';
import { useDocumentStore } from '@/store/documentStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Scissors, Copy, Clipboard, Bold, Italic, Code,
  Strikethrough, Link, Image, Quote, Table, Hash,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditorContextMenuProps {
  children: React.ReactNode;
}

export const EditorContextMenu = ({ children }: EditorContextMenuProps) => {
  const { insert, view } = useEditorViewStore();

  const handleCut = async () => {
    if (!view) return;
    const sel = view.state.selection.main;
    const text = view.state.sliceDoc(sel.from, sel.to);
    if (text) {
      await navigator.clipboard.writeText(text);
      view.dispatch({ changes: { from: sel.from, to: sel.to, insert: '' } });
    }
  };

  const handleCopy = async () => {
    if (!view) return;
    const sel = view.state.selection.main;
    const text = view.state.sliceDoc(sel.from, sel.to);
    if (text) await navigator.clipboard.writeText(text);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      insert('text', { text });
    } catch {
      toast.error('Failed to paste');
    }
  };

  const hasSelection = () => {
    if (!view) return false;
    const sel = view.state.selection.main;
    return sel.from !== sel.to;
  };

  const wrapSelection = (before: string, after: string) => {
    insert('wrap', { before, after });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleCut} disabled={!hasSelection()}>
          <Scissors className="h-4 w-4 mr-2" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy} disabled={!hasSelection()}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste}>
          <Clipboard className="h-4 w-4 mr-2" />
          Paste
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Bold className="h-4 w-4 mr-2" />
            Format
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => wrapSelection('**', '**')}>
              <Bold className="h-4 w-4 mr-2" />
              Bold
            </ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('*', '*')}>
              <Italic className="h-4 w-4 mr-2" />
              Italic
            </ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('~~', '~~')}>
              <Strikethrough className="h-4 w-4 mr-2" />
              Strikethrough
            </ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('`', '`')}>
              <Code className="h-4 w-4 mr-2" />
              Inline Code
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Link className="h-4 w-4 mr-2" />
            Insert
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => wrapSelection('[', '](url)')}>
              <Link className="h-4 w-4 mr-2" />
              Link
            </ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('![alt](', ')')}>
              <Image className="h-4 w-4 mr-2" />
              Image
            </ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('> ', '')}>
              <Quote className="h-4 w-4 mr-2" />
              Blockquote
            </ContextMenuItem>
            <ContextMenuItem onClick={() => insert('wrap', { before: '| Col 1 | Col 2 |\n|------|------|\n| ', after: ' |  |' })}>
              <Table className="h-4 w-4 mr-2" />
              Table
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Hash className="h-4 w-4 mr-2" />
            Heading
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => wrapSelection('# ', '')}>H1</ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('## ', '')}>H2</ContextMenuItem>
            <ContextMenuItem onClick={() => wrapSelection('### ', '')}>H3</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};

interface PreviewContextMenuProps {
  children: React.ReactNode;
}

export const PreviewContextMenu = ({ children }: PreviewContextMenuProps) => {
  const handleCopyAsMarkdown = async () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      await navigator.clipboard.writeText(selection);
      toast.success('Copied as text');
    }
  };

  const handleCopyAsHTML = async () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const div = document.createElement('div');
    div.appendChild(range.cloneContents());
    const html = div.innerHTML;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([selection.toString()], { type: 'text/plain' }),
        }),
      ]);
      toast.success('Copied as HTML');
    } catch {
      await navigator.clipboard.writeText(selection.toString());
      toast.success('Copied as text');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleCopyAsMarkdown}>
          <Copy className="h-4 w-4 mr-2" />
          Copy as Text
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyAsHTML}>
          <Code className="h-4 w-4 mr-2" />
          Copy as HTML
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
