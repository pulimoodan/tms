import * as Icons from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ComponentType } from 'react';

export const getIcon = (name: string): any => {
  return (Icons as any)[name] || Icons.CircleIcon;
};

export const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const iconObj = getIcon(name);
  return <HugeiconsIcon icon={iconObj} className={className} />;
};

export const iconMap: Record<string, string> = {
  Loader2: 'Orbit01Icon',
  ChevronRight: 'ArrowRight01Icon',
  ChevronDown: 'ArrowDown01Icon',
  ChevronUp: 'ArrowUp01Icon',
  ChevronLeft: 'ArrowLeft01Icon',
  LogOut: 'Logout01Icon',
  Bell: 'NotificationIcon',
  Sun: 'Sun01Icon',
  Moon: 'Moon01Icon',
  MoreHorizontal: 'MenuDotsVerticalIcon',
  Plus: 'PlusSignIcon',
  Download: 'Download01Icon',
  Filter: 'Filter01Icon',
  Grid3x3: 'GridIcon',
  Table2: 'TableIcon',
  Building2: 'Building01Icon',
  MapPin: 'Location03Icon',
  FileText: 'File01Icon',
  Package: 'PackageIcon',
  AlertCircle: 'AlertCircleIcon',
  Eye: 'EyeIcon',
  Pencil: 'Edit01Icon',
  Trash2: 'Delete01Icon',
  Truck: 'ShippingTruck02Icon',
  Calendar: 'Calendar01Icon',
  CheckCircle: 'CheckmarkCircle01Icon',
  CheckCircle2: 'CheckmarkCircle01Icon',
  XCircle: 'CloseCircleIcon',
  Clock: 'Clock01Icon',
  Info: 'InformationCircleIcon',
  ArrowUpDown: 'ArrowUpDownIcon',
  User: 'User01Icon',
  Users: 'UserGroupIcon',
  Settings: 'Settings01Icon',
  Search: 'Search01Icon',
  X: 'CloseIcon',
  Check: 'CheckmarkIcon',
};

export const getHugeIconName = (lucideName: string): string => {
  return (
    iconMap[lucideName] ||
    lucideName.replace(/([A-Z])/g, '$1').replace(/^./, (str) => str.toUpperCase()) + 'Icon'
  );
};
