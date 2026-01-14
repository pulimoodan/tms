import { useAuth } from '@/context/auth-context';
import { useMemo } from 'react';

export type Permission = 'Read' | 'Write' | 'Update' | 'Delete' | 'Export';

export type ModuleName =
  | 'Customers'
  | 'Contracts'
  | 'Orders'
  | 'Vehicles'
  | 'Drivers'
  | 'Locations'
  | 'CreditTerms'
  | 'VehicleTypes'
  | 'Users'
  | 'Roles'
  | 'Company';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    return user?.role?.permissions || {};
  }, [user?.role?.permissions]);

  const hasPermission = (module: ModuleName, permission: Permission): boolean => {
    if (!permissions || !permissions[module]) return false;
    return permissions[module][permission] === true;
  };

  const hasReadPermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'Read');
  };

  const hasWritePermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'Write');
  };

  const hasUpdatePermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'Update');
  };

  const hasDeletePermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'Delete');
  };

  const hasExportPermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'Export');
  };

  const getPermissions = (): Record<string, Record<string, boolean>> | null => {
    return permissions || null;
  };

  return {
    hasPermission,
    hasReadPermission,
    hasWritePermission,
    hasUpdatePermission,
    hasDeletePermission,
    hasExportPermission,
    getPermissions,
  };
}

