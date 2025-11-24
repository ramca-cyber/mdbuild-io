import { useState } from 'react';
import { Code2 } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { SnippetsDialog } from './SnippetsDialog';

export const SnippetsMenu = () => {
  const [showSnippets, setShowSnippets] = useState(false);

  return (
    <>
      <Menubar className="border-0 bg-transparent p-0 h-auto">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
            Snippets
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowSnippets(true)}>
              <Code2 className="h-4 w-4 mr-2" />
              Manage Snippets...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <SnippetsDialog 
        open={showSnippets} 
        onOpenChange={setShowSnippets} 
      />
    </>
  );
};
