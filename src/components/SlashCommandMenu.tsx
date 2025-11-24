import { useEffect, useState, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Hash, List, Code, Table, Minus, ListTodo, AlertCircle, FileCode, Image, Link } from 'lucide-react';

interface SlashCommandMenuProps {
  onSelect: (template: string) => void;
  onClose: () => void;
  position: { x: number; y: number } | null;
}

const commands = [
  { icon: Hash, label: 'Heading 1', value: '# ', description: 'Large section heading' },
  { icon: Hash, label: 'Heading 2', value: '## ', description: 'Medium section heading' },
  { icon: Hash, label: 'Heading 3', value: '### ', description: 'Small section heading' },
  { icon: List, label: 'Bullet List', value: '- ', description: 'Create a bullet list' },
  { icon: List, label: 'Numbered List', value: '1. ', description: 'Create a numbered list' },
  { icon: ListTodo, label: 'Task List', value: '- [ ] ', description: 'Create a task list' },
  { icon: Code, label: 'Code Block', value: '```\n\n```', description: 'Insert a code block' },
  { icon: FileCode, label: 'Inline Code', value: '`code`', description: 'Insert inline code' },
  { icon: Table, label: 'Table', value: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', description: 'Insert a table' },
  { icon: Minus, label: 'Horizontal Rule', value: '\n---\n', description: 'Insert a divider' },
  { icon: AlertCircle, label: 'Note Alert', value: '> [!NOTE]\n> ', description: 'Insert a note callout' },
  { icon: AlertCircle, label: 'Warning Alert', value: '> [!WARNING]\n> ', description: 'Insert a warning callout' },
  { icon: Link, label: 'Link', value: '[text](url)', description: 'Insert a link' },
  { icon: Image, label: 'Image', value: '![alt text](url)', description: 'Insert an image' },
];

export const SlashCommandMenu = ({ onSelect, onClose, position }: SlashCommandMenuProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].value);
        }
      } else if (e.key === 'Backspace' && search === '') {
        onClose();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setSearch(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [search, selectedIndex, filteredCommands, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 animate-in fade-in-0 zoom-in-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Command className="rounded-lg border shadow-lg bg-popover">
        <div className="px-3 py-2 border-b border-border">
          <input
            type="text"
            placeholder="Search commands..."
            className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <CommandList className="max-h-80">
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup>
            {filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <CommandItem
                  key={cmd.label}
                  onSelect={() => onSelect(cmd.value)}
                  className={`cursor-pointer ${index === selectedIndex ? 'bg-accent' : ''}`}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{cmd.label}</span>
                    <span className="text-xs text-muted-foreground">{cmd.description}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
