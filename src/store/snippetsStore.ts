import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Snippet {
  id: string;
  trigger: string;
  content: string;
  description: string;
}

interface SnippetsState {
  snippets: Snippet[];
  addSnippet: (snippet: Omit<Snippet, 'id'>) => void;
  updateSnippet: (id: string, snippet: Partial<Snippet>) => void;
  deleteSnippet: (id: string) => void;
  getSnippetByTrigger: (trigger: string) => Snippet | undefined;
  importSnippets: (snippets: Snippet[]) => void;
  exportSnippets: () => Snippet[];
}

const defaultSnippets: Snippet[] = [
  {
    id: 'date',
    trigger: 'date',
    content: new Date().toLocaleDateString(),
    description: 'Current date',
  },
  {
    id: 'datetime',
    trigger: 'datetime',
    content: new Date().toLocaleString(),
    description: 'Current date and time',
  },
  {
    id: 'time',
    trigger: 'time',
    content: new Date().toLocaleTimeString(),
    description: 'Current time',
  },
  {
    id: 'note',
    trigger: 'note',
    content: '> [!NOTE]\n> ',
    description: 'GitHub note alert',
  },
  {
    id: 'warning',
    trigger: 'warning',
    content: '> [!WARNING]\n> ',
    description: 'GitHub warning alert',
  },
  {
    id: 'important',
    trigger: 'important',
    content: '> [!IMPORTANT]\n> ',
    description: 'GitHub important alert',
  },
  {
    id: 'tip',
    trigger: 'tip',
    content: '> [!TIP]\n> ',
    description: 'GitHub tip alert',
  },
  {
    id: 'caution',
    trigger: 'caution',
    content: '> [!CAUTION]\n> ',
    description: 'GitHub caution alert',
  },
  {
    id: 'table2x2',
    trigger: 'table2x2',
    content: '| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |',
    description: '2x2 table',
  },
  {
    id: 'table3x3',
    trigger: 'table3x3',
    content: '| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n| Cell 7 | Cell 8 | Cell 9 |',
    description: '3x3 table',
  },
  {
    id: 'codeblock',
    trigger: 'codeblock',
    content: '```javascript\n\n```',
    description: 'JavaScript code block',
  },
  {
    id: 'todo',
    trigger: 'todo',
    content: '- [ ] ',
    description: 'Todo item',
  },
  {
    id: 'frontmatter',
    trigger: 'frontmatter',
    content: '---\ntitle: \nauthor: \ndate: ${date}\ntags: []\n---\n\n',
    description: 'YAML frontmatter',
  },
];

export const useSnippetsStore = create<SnippetsState>()(
  persist(
    (set, get) => ({
      snippets: defaultSnippets,
      
      addSnippet: (snippet) => {
        const id = `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          snippets: [...state.snippets, { ...snippet, id }],
        }));
      },
      
      updateSnippet: (id, updates) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },
      
      deleteSnippet: (id) => {
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== id),
        }));
      },
      
      getSnippetByTrigger: (trigger) => {
        return get().snippets.find((s) => s.trigger === trigger);
      },
      
      importSnippets: (snippets) => {
        set({ snippets });
      },
      
      exportSnippets: () => {
        return get().snippets;
      },
    }),
    {
      name: 'snippets-storage',
    }
  )
);
