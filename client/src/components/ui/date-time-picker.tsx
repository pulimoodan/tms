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
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = dateValue ? new Date(dateValue) : undefined;

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
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
                onDateChange(selectedDate.toISOString().split('T')[0]);
                setOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="relative">
        <HugeiconsIcon icon={ClockIcon} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="time"
          value={timeValue || ''}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder={timePlaceholder}
          disabled={disabled}
          className="pl-9"
        />
      </div>
    </div>
  );
}

