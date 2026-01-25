import * as React from 'react';
import { format } from 'date-fns';
import { Calendar01Icon, ClockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerSingleProps {
  value?: string; // ISO datetime string
  onChange: (value: string) => void; // Returns ISO datetime string
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDateTime?: string; // ISO datetime string for minimum allowed datetime
}

export function DateTimePickerSingle({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  disabled = false,
  className,
  minDateTime,
}: DateTimePickerSingleProps) {
  const [open, setOpen] = React.useState(false);
  // Parse ISO string to local date to avoid UTC shift
  const parseISODate = (isoString: string): Date => {
    const date = new Date(isoString);
    // Create a new date in local timezone using the local components
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    );
  };
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? parseISODate(value) : undefined,
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(parseISODate(value), 'HH:mm') : '',
  );

  const minDateObj = minDateTime ? parseISODate(minDateTime) : undefined;
  const minDateStr = minDateObj
    ? (() => {
        const year = minDateObj.getFullYear();
        const month = String(minDateObj.getMonth() + 1).padStart(2, '0');
        const day = String(minDateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })()
    : undefined;
  const minTimeStr = minDateObj ? format(minDateObj, 'HH:mm') : undefined;

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = parseISODate(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setTimeValue(format(date, 'HH:mm'));
      }
    } else {
      setSelectedDate(undefined);
      setTimeValue('');
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Check if date is before minDate
    if (minDateObj && date < minDateObj) {
      return;
    }

    setSelectedDate(date);
    updateDateTime(date, timeValue);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);

    if (selectedDate && time) {
      // Validate time if date equals minDate (compare local date strings)
      const selectedDateStr = (() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      if (minDateStr && selectedDateStr === minDateStr && minTimeStr) {
        const [minHour, minMinute] = minTimeStr.split(':').map(Number);
        const [newHour, newMinute] = time.split(':').map(Number);

        if (newHour < minHour || (newHour === minHour && newMinute < minMinute)) {
          return; // Don't update if time is before minimum
        }
      }

      updateDateTime(selectedDate, time);
    }
  };

  const updateDateTime = (date: Date, time: string) => {
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    if (!isNaN(dateTime.getTime())) {
      // Check if datetime is before minDateTime
      if (minDateObj && dateTime < minDateObj) {
        return;
      }

      onChange(dateTime.toISOString());
    }
  };

  const displayValue =
    selectedDate && timeValue ? `${format(selectedDate, 'PPP')} at ${timeValue}` : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            fromDate={minDateObj}
            initialFocus
          />
          <div className="flex items-center border-t pt-3">
            <HugeiconsIcon
              icon={ClockIcon}
              className="absolute left-6 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              placeholder="HH:mm"
              disabled={disabled}
              className="pl-9 h-10"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
