import { AppSidebar, menuGroups } from './app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ModeToggle } from '@/components/mode-toggle';
import { SearchCommand } from '@/components/search-command';
import { Clock } from '@/components/header/clock';
import { Notifications } from '@/components/header/notifications';
import { useLocation } from 'wouter';
import { useBreadcrumb } from '@/context/breadcrumb-context';

interface LayoutProps {
  children: React.ReactNode;
}

interface Breadcrumb {
  label: string;
  path: string;
  isLast?: boolean;
}

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Map route segments to entity names
const ENTITY_NAME_MAP: Record<string, string> = {
  customers: 'Customer',
  contracts: 'Contract',
  orders: 'Order',
  trips: 'Trip',
  waybills: 'Waybill',
  vehicles: 'Vehicle',
  drivers: 'Driver',
  locations: 'Location',
  'vehicle-types': 'Vehicle Type',
  'credit-terms': 'Credit Term',
  roles: 'Role',
  users: 'User',
};

// Map entity types to their identifier field names
const ENTITY_IDENTIFIER_FIELD: Record<string, string> = {
  customers: 'name',
  contracts: 'contractNumber',
  orders: 'orderNo',
  trips: 'tripNo', // Assuming trips have tripNo
  waybills: 'waybillNo', // Assuming waybills have waybillNo
  vehicles: 'plateNumber',
  drivers: 'name',
  locations: 'name',
  'vehicle-types': 'name',
  'credit-terms': 'name',
  roles: 'name',
  users: 'name',
};

function isUUID(segment: string): boolean {
  return UUID_REGEX.test(segment);
}

function getEntityName(segment: string): string {
  return (
    ENTITY_NAME_MAP[segment] ||
    segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function generateBreadcrumbs(pathname: string, entityLabel: string | null): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: 'Home', path: '/', isLast: true }];
  }

  const breadcrumbs: Breadcrumb[] = [{ label: 'Home', path: '/', isLast: false }];
  let currentPath = '';

  segments.forEach((segment, index) => {
    const nextSegment = index < segments.length - 1 ? segments[index + 1] : null;

    // Skip UUID segments that are followed by "edit" - we'll handle it in the edit segment
    if (isUUID(segment) && nextSegment === 'edit') {
      currentPath += `/${segment}`;
      return; // Skip creating breadcrumb for UUID, it will be handled by "edit"
    }

    currentPath += `/${segment}`;

    let label: string;

    // Check if this segment is a UUID
    if (isUUID(segment)) {
      // Get the previous segment to determine entity type
      const previousSegment = index > 0 ? segments[index - 1] : null;

      if (previousSegment && ENTITY_NAME_MAP[previousSegment]) {
        // Use the entity label from context if available, otherwise use entity name
        if (entityLabel && index === segments.length - 1) {
          // Only use entityLabel for the last segment (current page)
          label = entityLabel;
        } else {
          const entityName = ENTITY_NAME_MAP[previousSegment];
          label = entityName;
        }
      } else {
        // Fallback: just show a shortened version of the UUID
        label = segment.substring(0, 8) + '...';
      }
    } else if (segment === 'edit') {
      // Handle "edit" segment - get the previous segment (which should be a UUID)
      const previousSegment = index > 0 ? segments[index - 1] : null;
      const segmentBeforePrevious = index > 1 ? segments[index - 2] : null;

      if (
        previousSegment &&
        isUUID(previousSegment) &&
        segmentBeforePrevious &&
        ENTITY_NAME_MAP[segmentBeforePrevious]
      ) {
        const entityName = ENTITY_NAME_MAP[segmentBeforePrevious];
        // Use entity label if available
        if (entityLabel) {
          label = `Edit ${entityLabel}`;
        } else {
          label = `Edit ${entityName}`;
        }
      } else {
        label = 'Edit';
      }
    } else {
      // Normal segment - format it nicely
      label = getEntityName(segment);
    }

    breadcrumbs.push({
      label,
      path: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { entityLabel } = useBreadcrumb();
  const breadcrumbs = generateBreadcrumbs(location, entityLabel);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 bg-card">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className={index === 0 ? 'hidden md:block' : ''} />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <SearchCommand menuGroups={menuGroups} />
            <Notifications />
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
