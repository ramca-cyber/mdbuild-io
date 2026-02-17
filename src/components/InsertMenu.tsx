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
  Link,
  Image,
  Quote,
  Code2,
  Minus,
  Table,
  AlertCircle,
  Info,
  AlertTriangle,
  Lightbulb,
  Flame,
  GitGraph,
  Sigma,
  Footprints,
  Smile,
} from 'lucide-react';
import { useEditorViewStore } from '@/store/editorViewStore';

export const InsertMenu = () => {
  const { insert } = useEditorViewStore();

  const insertAtCursor = (before: string, after: string = '') => {
    insert('wrap', { before, after });
  };

  return (
    <Menubar className="border-0 bg-transparent p-0 h-auto">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
          Insert
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => insertAtCursor('[', '](url)')}>
            <Link className="h-4 w-4 mr-2" />
            Link
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('![alt](', ')')}>
            <Image className="h-4 w-4 mr-2" />
            Image
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('| Column 1 | Column 2 |\n|----------|----------|\n| ', ' |  |')}>
            <Table className="h-4 w-4 mr-2" />
            Table
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('```\n', '\n```')}>
            <Code2 className="h-4 w-4 mr-2" />
            Code Block
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('> ', '')}>
            <Quote className="h-4 w-4 mr-2" />
            Blockquote
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('---\n', '')}>
            <Minus className="h-4 w-4 mr-2" />
            Horizontal Rule
          </MenubarItem>

          <MenubarSeparator />

          <MenubarSub>
            <MenubarSubTrigger>
              <AlertCircle className="h-4 w-4 mr-2" />
              GitHub Alerts
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => insertAtCursor('> [!NOTE]\n> ', '')}>
                <Info className="h-4 w-4 mr-2" />
                Note
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('> [!TIP]\n> ', '')}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Tip
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('> [!IMPORTANT]\n> ', '')}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Important
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('> [!WARNING]\n> ', '')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('> [!CAUTION]\n> ', '')}>
                <Flame className="h-4 w-4 mr-2" />
                Caution
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSub>
            <MenubarSubTrigger>
              <GitGraph className="h-4 w-4 mr-2" />
              Mermaid Diagram
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => insertAtCursor('```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[OK]\n    B -->|No| D[End]\n', '```\n')}>
                Flowchart
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('```mermaid\nsequenceDiagram\n    participant A\n    participant B\n    A->>B: Request\n    B-->>A: Response\n', '```\n')}>
                Sequence Diagram
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('```mermaid\ngantt\n    title Project Schedule\n    dateFormat YYYY-MM-DD\n    section Phase 1\n    Task A :a1, 2024-01-01, 30d\n    Task B :after a1, 20d\n', '```\n')}>
                Gantt Chart
              </MenubarItem>
              <MenubarItem onClick={() => insertAtCursor('```mermaid\npie title Distribution\n    "Category A" : 40\n    "Category B" : 30\n    "Category C" : 30\n', '```\n')}>
                Pie Chart
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSeparator />

          <MenubarItem onClick={() => insertAtCursor('$$\n', '\n$$')}>
            <Sigma className="h-4 w-4 mr-2" />
            Math Block
          </MenubarItem>
          <MenubarItem onClick={() => insertAtCursor('[^', ']: footnote text')}>
            <Footprints className="h-4 w-4 mr-2" />
            Footnote
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
