"use client";

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
  
  // Convert our value format to react-day-picker DateRange format
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (!value) return undefined;
    return {
      from: value.from,
      to: value.to,
    };
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
            className
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from || new Date()}
          selected={dateRange}
          onSelect={(range: DateRange | undefined) => {
            if (range) {
              onChange({
                from: range.from,
                to: range.to,
              });
              // Close popover when both dates are selected
              if (range.from && range.to) {
                setOpen(false);
              }
            } else {
              onChange(undefined);
            }
          }}
          numberOfMonths={2}
        />
        {dateRange?.from && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
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
