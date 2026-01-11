'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (value: { from?: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(undefined);
  const shouldCloseRef = React.useRef(true);

  // Convert our value format to react-day-picker DateRange format
  // Also sanitize: if both dates are the same, treat as start-only
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (!value) return undefined;
    // If both dates are set and they're the same, treat as start-only (invalid state)
    if (value.from && value.to && value.from.getTime() === value.to.getTime()) {
      return {
        from: value.from,
        to: undefined,
      };
    }
    return {
      from: value.from,
      to: value.to,
    };
  }, [value]);

  // Reset internal range when popover opens to allow fresh selection
  React.useEffect(() => {
    if (open) {
      // Check if dateRange has both dates set to the same value (invalid state)
      const hasSameDates =
        dateRange?.from && dateRange?.to && dateRange.from.getTime() === dateRange.to.getTime();

      if (hasSameDates) {
        // If both dates are the same, treat as start-only (invalid state from previous bug)
        setInternalRange({ from: dateRange.from, to: undefined });
        shouldCloseRef.current = false;
      } else if (dateRange?.from && !dateRange?.to) {
        // Keep partial selection (only from)
        setInternalRange(dateRange);
        shouldCloseRef.current = false;
      } else {
        // Start fresh for new selection or complete range
        setInternalRange(undefined);
        shouldCloseRef.current = true;
      }
    } else {
      // When popover closes, reset only if we completed the selection
      // Don't reset if we're closing with a partial selection (shouldn't happen, but just in case)
      if (shouldCloseRef.current) {
        setInternalRange(undefined);
      }
    }
  }, [open, dateRange]);

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      // Check if both dates are the same (single date click in range mode)
      // react-day-picker sometimes sets both from and to to the same date on first click
      const isSameDate = range.from && range.to && range.from.getTime() === range.to.getTime();

      if (isSameDate) {
        // If same date, treat it as start date only (not a complete range)
        const startOnly = { from: range.from, to: undefined };
        setInternalRange(startOnly);
        shouldCloseRef.current = false;
        // Don't call onChange - keep popover open
        return;
      }

      // Normal range selection
      setInternalRange(range);

      // Only call onChange when both dates are selected and they're different
      // This prevents the popover from closing and parent re-renders
      if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
        // Both dates selected and different - allow closing
        shouldCloseRef.current = true;
        onChange({
          from: range.from,
          to: range.to,
        });
        // Close popover only when both dates are selected
        setTimeout(() => {
          setOpen(false);
          setInternalRange(undefined);
        }, 250);
      } else if (range.from) {
        // Only start date is selected - prevent closing
        shouldCloseRef.current = false;
        // IMPORTANT: Don't call onChange here - this keeps popover open
        // and prevents parent component from re-rendering and potentially closing popover
      }
    } else {
      setInternalRange(undefined);
      onChange(undefined);
      shouldCloseRef.current = true;
    }
  };

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // If trying to close, check if we should prevent it
      if (!newOpen) {
        // Check if we have a partial selection - if so, prevent closing
        const hasPartialSelection = internalRange?.from && !internalRange?.to;
        if (!shouldCloseRef.current || hasPartialSelection) {
          // Force it to stay open - prevent the close
          // Use a synchronous approach to prevent the state change
          return;
        }
      }
      // Allow the state change only if we're allowed to close or opening
      setOpen(newOpen);
      // Reset internal range when popover closes
      if (!newOpen) {
        setInternalRange(undefined);
        shouldCloseRef.current = true;
      }
    },
    [internalRange],
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
              </>
            ) : (
              format(dateRange.from, 'LLL dd, y')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg"
        align="start"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside if we have a partial selection
          if (internalRange?.from && !internalRange?.to) {
            e.preventDefault();
            return;
          }
          // Also prevent if we're not allowed to close
          if (!shouldCloseRef.current) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside if we have a partial selection
          if (internalRange?.from && !internalRange?.to) {
            e.preventDefault();
            return;
          }
          // Also prevent if we're not allowed to close
          if (!shouldCloseRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape if we have a partial selection
          if (internalRange?.from && !internalRange?.to) {
            e.preventDefault();
            return;
          }
          // Also prevent if we're not allowed to close
          if (!shouldCloseRef.current) {
            e.preventDefault();
          }
        }}
        onOpenAutoFocus={(e) => {
          // Prevent focus issues
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          // Prevent focus issues when closing
          e.preventDefault();
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={internalRange?.from || dateRange?.from || new Date()}
            selected={internalRange !== undefined ? internalRange : undefined}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </div>
        {(internalRange?.from || dateRange?.from) && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setInternalRange(undefined);
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
