import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  description?: string;
  icon: IconSvgElement;
  className?: string;
}

export function PageTitle({ title, description, icon, className }: PageTitleProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      {description && <p className="text-muted-foreground ml-[52px]">{description}</p>}
    </div>
  );
}
