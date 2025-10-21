import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const emojiCategories = {
  smileys: {
    label: '😀 Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴'],
  },
  gestures: {
    label: '👋 Gestures',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  },
  animals: {
    label: '🐶 Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈'],
  },
  food: {
    label: '🍕 Food',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆'],
  },
  activities: {
    label: '⚽ Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗'],
  },
  travel: {
    label: '🚗 Travel',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸'],
  },
  objects: {
    label: '💡 Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢'],
  },
  symbols: {
    label: '❤️ Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️'],
  },
  flags: {
    label: '🏁 Flags',
    emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇰🇷', '🇧🇷', '🇮🇳', '🇷🇺', '🇲🇽'],
  },
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredEmojis = Object.entries(emojiCategories).reduce((acc, [key, category]) => {
    const filtered = category.emojis.filter(emoji => {
      if (!searchQuery) return true;
      // Simple search - could be enhanced with emoji names
      return emoji.includes(searchQuery);
    });
    if (filtered.length > 0) {
      acc[key] = { ...category, emojis: filtered };
    }
    return acc;
  }, {} as typeof emojiCategories);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Insert emoji">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Emoji</p>
          </TooltipContent>
          <PopoverContent className="w-80 p-0 bg-popover" align="start">
            <div className="p-3 border-b border-border">
              <Input
                placeholder="Search emoji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <Tabs defaultValue="smileys" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-10">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex">
                    {Object.entries(filteredEmojis).map(([key, category]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        {category.label.split(' ')[0]}
                      </TabsTrigger>
                    ))}
                  </div>
                </ScrollArea>
              </TabsList>
              {Object.entries(filteredEmojis).map(([key, category]) => (
                <TabsContent key={key} value={key} className="p-2 m-0">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-8 gap-1">
                      {category.emojis.map((emoji, index) => (
                        <Button
                          key={`${emoji}-${index}`}
                          variant="ghost"
                          className="h-10 w-10 p-0 text-2xl hover:bg-accent"
                          onClick={() => handleEmojiClick(emoji)}
                          aria-label={`Insert ${emoji}`}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
};
