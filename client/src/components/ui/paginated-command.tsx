import { useEffect, useRef, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface PaginatedCommandProps {
  items: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (item: any) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  renderItem: (item: any) => React.ReactNode;
  getItemValue: (item: any) => string;
}

export function PaginatedCommand({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  onSelect,
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  emptyMessage = 'No items found.',
  renderItem,
  getItemValue,
}: PaginatedCommandProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [internalSearch, setInternalSearch] = useState('');

  const search = searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = onSearchChange || setInternalSearch;

  // Callback ref to attach to the scrollable element
  const setListRef = (element: HTMLDivElement | null) => {
    listRef.current = element;
  };

  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      // Load more when user scrolls to within 100px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
        onLoadMore();
      }
    };

    listElement.addEventListener('scroll', handleScroll);
    return () => listElement.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore, items.length]);

  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
      <CommandList ref={setListRef} className="max-h-[300px]">
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <HugeiconsIcon icon={Orbit01Icon} className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            emptyMessage
          )}
        </CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem key={item.id} value={getItemValue(item)} onSelect={() => onSelect(item)}>
              {renderItem(item)}
            </CommandItem>
          ))}
          {isLoading && items.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <HugeiconsIcon icon={Orbit01Icon} className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="text-center py-2 text-xs text-muted-foreground">No more items</div>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
