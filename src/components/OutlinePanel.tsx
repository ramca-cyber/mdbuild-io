import { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { List, ChevronRight } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TreeNode {
  heading: Heading;
  children: TreeNode[];
}

// Build hierarchical tree from flat headings
const buildHeadingTree = (headings: Heading[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const stack: TreeNode[] = [];

  headings.forEach((heading) => {
    const node: TreeNode = { heading, children: [] };

    // Pop stack until we find a parent with lower level
    while (stack.length > 0 && stack[stack.length - 1].heading.level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level heading
      tree.push(node);
    } else {
      // Add as child to current parent
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  });

  return tree;
};

export const OutlinePanel = () => {
  const { content } = useDocumentStore();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    const lines = content.split('\n');
    const found: Heading[] = [];
    const slugCounts = new Map<string, number>();
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        let slug = slugify(match[2]);
        if (!slug) return;
        const count = slugCounts.get(slug) || 0;
        slugCounts.set(slug, count + 1);
        if (count > 0) slug = `${slug}-${count}`;
        
        found.push({
          level: match[1].length,
          text: match[2],
          id: slug,
        });
      }
    });
    
    setHeadings(found);
    setTree(buildHeadingTree(found));
  }, [content]);

  const scrollToHeading = (id: string) => {
    const preview = document.querySelector('.preview-content') as HTMLElement | null;
    if (!preview) return;

    const target = preview.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null;

    if (target) {
      // Compute unscaled offset relative to the scroll container
      let top = 0;
      let node: HTMLElement | null = target;
      while (node && node !== preview) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      preview.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Recursive component to render outline nodes
  const OutlineNode = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const hasChildren = node.children.length > 0;

    if (!hasChildren) {
      // Leaf node - simple clickable button
      return (
        <button
          onClick={() => scrollToHeading(node.heading.id)}
          className="block w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="text-muted-foreground mr-2">·</span>
          {node.heading.text}
        </button>
      );
    }

    // Parent node with children - collapsible accordion
    return (
      <AccordionItem value={node.heading.id} className="border-none">
        <AccordionTrigger 
          className="py-1.5 px-2 hover:bg-muted rounded hover:no-underline text-sm font-normal"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => {
            // Allow clicking the heading text to scroll
            if ((e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('svg')) {
              scrollToHeading(node.heading.id);
            }
          }}
        >
          <span className="flex items-center flex-1">
            <span className="text-muted-foreground mr-2">
              {node.heading.level === 1 && '▸'}
              {node.heading.level === 2 && '▹'}
              {node.heading.level >= 3 && '·'}
            </span>
            {node.heading.text}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-0">
          {node.children.map((child, index) => (
            <OutlineNode key={index} node={child} depth={depth + 1} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (headings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <List className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">No headings found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Table of Contents</h3>
        <Accordion type="multiple" className="space-y-1" defaultValue={tree.map(n => n.heading.id)}>
          {tree.map((node, index) => (
            <OutlineNode key={index} node={node} />
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
};
