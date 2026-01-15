import * as React from 'react';
import { format } from 'date-fns';
import { Calendar01Icon, ClockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  dateValue?: string;
  timeValue?: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string; // Minimum date in YYYY-MM-DD format
  minTime?: string; // Minimum time in HH:mm format (used when date equals minDate)
}

export function DateTimePicker({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  datePlaceholder = 'Pick a date',
  timePlaceholder = 'HH:mm',
  disabled = false,
  className,
  minDate,
  minTime,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = dateValue ? new Date(dateValue) : undefined;
  const minDateObj = minDate ? new Date(minDate) : undefined;

  // Validate time when date matches minDate
  const handleTimeChange = (value: string) => {
    if (minDate && minTime && dateValue === minDate && value) {
      // If the selected date is the same as minDate, validate that time is not before minTime
      const [minHour, minMinute] = minTime.split(':').map(Number);
      const [newHour, newMinute] = value.split(':').map(Number);

      if (newHour < minHour || (newHour === minHour && newMinute < minMinute)) {
        // Time is before minimum time - don't update
        return;
      }
    }
    onTimeChange(value);
  };

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>{datePlaceholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                // Check if selected date is before minDate
                if (minDateObj && selectedDate < minDateObj) {
                  return;
                }
                // If selected date equals minDate, validate time
                if (minDateObj && selectedDate.toISOString().split('T')[0] === minDate) {
                  // Time validation will be handled in handleTimeChange
                }
                onDateChange(selectedDate.toISOString().split('T')[0]);
                setOpen(false);
              }
            }}
            fromDate={minDateObj}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={ClockIcon} className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={timeValue || ''}
          onChange={(e) => handleTimeChange(e.target.value)}
          placeholder={timePlaceholder}
          disabled={disabled}
          className="pl-9"
        />
      </div>
    </div>
  );
}
