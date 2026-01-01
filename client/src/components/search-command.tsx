import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface MenuItem {
  title: string;
  url?: string;
  icon?: string;
  badge?: string;
  items?: MenuItem[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface SearchCommandProps {
  menuGroups: MenuGroup[];
}

export function SearchCommand({ menuGroups }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  // Flatten all menu items for searching
  const flatMenuItems: Array<{ title: string; url: string; group: string }> = [];

  menuGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.items && item.items.length > 0) {
        item.items.forEach((subItem) => {
          if (subItem.url) {
            flatMenuItems.push({
              title: `${item.title} > ${subItem.title}`,
              url: subItem.url,
              group: group.label,
            });
          }
        });
      } else if (item.url) {
        flatMenuItems.push({
          title: item.title,
          url: item.url,
          group: group.label,
        });
      }
    });
  });

  // Handle Ctrl/Cmd + K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="secondary"
        className="relative w-full max-w-sm justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
        data-testid="button-search"
      >
        <HugeiconsIcon icon={Search01Icon} className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search menus...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-card px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search menus..." />
        <CommandList>
          <CommandEmpty>No menus found.</CommandEmpty>
          {Array.from(new Set(flatMenuItems.map((item) => item.group))).map((group) => {
            const groupItems = flatMenuItems.filter((item) => item.group === group);
            return (
              <CommandGroup key={group} heading={group}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                    data-testid={`menu-search-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
