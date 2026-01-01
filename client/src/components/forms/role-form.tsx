import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FloppyDiskIcon, ShieldIcon, Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import {
  fetchRole,
  createRole,
  updateRole,
  createRolePermissions,
  updateRolePermissions,
  deleteRolePermissions,
} from '@/lib/api-helpers';

const PERMISSIONS = ['Read', 'Write', 'Update', 'Delete', 'Export'] as const;
type Permission = (typeof PERMISSIONS)[number];

const MODULES = [
  { id: 'Customers', label: 'Customers', category: 'Sales' },
  { id: 'Contracts', label: 'Contracts', category: 'Sales' },
  { id: 'Orders', label: 'Orders / Waybills', category: 'Operations' },
  { id: 'Vehicles', label: 'Vehicles', category: 'Fleet' },
  { id: 'Drivers', label: 'Drivers', category: 'Fleet' },
  { id: 'Locations', label: 'Locations', category: 'Configuration' },
  { id: 'CreditTerms', label: 'Credit Terms', category: 'Configuration' },
  { id: 'VehicleTypes', label: 'Vehicle Types', category: 'Configuration' },
  { id: 'Users', label: 'Users', category: 'Administration' },
  { id: 'Roles', label: 'Roles', category: 'Administration' },
] as const;

const CATEGORIES = Array.from(new Set(MODULES.map((m) => m.category)));

const roleFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(50),
  permissions: z.record(
    z.string(),
    z.object({
      Read: z.boolean().default(false),
      Write: z.boolean().default(false),
      Update: z.boolean().default(false),
      Delete: z.boolean().default(false),
      Export: z.boolean().default(false),
    }),
  ),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  initialData?: any;
  isEditMode?: boolean;
  roleId?: string;
  onComplete?: () => void;
}

export function RoleForm({ initialData, isEditMode = false, roleId, onComplete }: RoleFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [existingRole, setExistingRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const defaultPermissions = MODULES.reduce(
    (acc, module) => ({
      ...acc,
      [module.id]: {
        Read: false,
        Write: false,
        Update: false,
        Delete: false,
        Export: false,
      },
    }),
    {} as Record<string, Record<Permission, boolean>>,
  );

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      permissions: defaultPermissions,
    },
  });

  useEffect(() => {
    async function loadData() {
      if (isEditMode && roleId) {
        setLoading(true);
        try {
          const roleData = await fetchRole(roleId);
          if (roleData) {
            setExistingRole(roleData);
            form.reset(roleData);
            if (roleData.name) {
              setEntityLabel(roleData.name);
            }
          }
        } catch (error) {
          console.error('Failed to load role:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setEntityLabel(null);
      }
    }
    loadData();
    return () => setEntityLabel(null);
  }, [isEditMode, roleId, form, setEntityLabel]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      setSubmitting(true);
      if (isEditMode && roleId) {
        await updateRole(roleId, { name: data.name });

        const permissionPromises = Object.entries(data.permissions).map(async ([module, perms]) => {
          const selectedPerms = Object.entries(perms)
            .filter(([, checked]) => checked)
            .map(([perm]) => perm) as Permission[];

          try {
            if (selectedPerms.length > 0) {
              try {
                await updateRolePermissions(roleId, module, selectedPerms);
              } catch (error: any) {
                if (error.response?.status === 404) {
                  await createRolePermissions(roleId, module, selectedPerms);
                } else {
                  throw error;
                }
              }
            } else {
              try {
                await deleteRolePermissions(roleId, module);
              } catch (error: any) {
                if (error.response?.status !== 404) {
                  throw error;
                }
              }
            }
          } catch (error) {
            console.error(`Failed to update permission for ${module}:`, error);
          }
        });

        await Promise.all(permissionPromises);
        toast({
          title: 'Role updated',
          description: 'The role and permissions have been successfully updated.',
        });
      } else {
        const createdRole = await createRole({ name: data.name });
        const createdRoleId = createdRole.id;

        const permissionPromises = Object.entries(data.permissions)
          .filter(([module, perms]) => {
            const selectedPerms = Object.entries(perms)
              .filter(([, checked]) => checked)
              .map(([perm]) => perm);
            return selectedPerms.length > 0;
          })
          .map(async ([module, perms]) => {
            const selectedPerms = Object.entries(perms)
              .filter(([, checked]) => checked)
              .map(([perm]) => perm) as Permission[];

            try {
              await createRolePermissions(createdRoleId, module, selectedPerms);
            } catch (error) {
              console.error(`Failed to add permission for ${module}:`, error);
            }
          });

        await Promise.all(permissionPromises);
        toast({
          title: 'Role created',
          description: 'The role and permissions have been successfully created.',
        });
      }
      if (onComplete) onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: isEditMode ? 'Update failed' : 'Create failed',
        description:
          error.response?.data?.message || error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRow = (moduleId: string, checked: boolean) => {
    const currentPerms = form.getValues(`permissions.${moduleId}`);
    form.setValue(`permissions.${moduleId}`, {
      Read: checked,
      Write: checked,
      Update: checked,
      Delete: checked,
      Export: checked,
    });
  };

  const toggleAll = (checked: boolean) => {
    MODULES.forEach((module) => {
      form.setValue(`permissions.${module.id}`, {
        Read: checked,
        Write: checked,
        Update: checked,
        Delete: checked,
        Export: checked,
      });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShieldIcon} className="h-5 w-5 text-primary" />
              Role Information
            </CardTitle>
            <CardDescription>Define the role identity.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fleet Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>Configure granular access control for this role.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allChecked = MODULES.every((m) => {
                  const p = form.getValues(`permissions.${m.id}`);
                  return p?.Read && p?.Write && p?.Update && p?.Delete && p?.Export;
                });
                toggleAll(!allChecked);
              }}
            >
              Toggle All Permissions
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Module</TableHead>
                    {PERMISSIONS.map((perm) => (
                      <TableHead key={perm} className="text-center">
                        {perm}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CATEGORIES.map((category) => (
                    <>
                      <TableRow key={`cat-${category}`} className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={7} className="font-semibold py-2">
                          {category}
                        </TableCell>
                      </TableRow>
                      {MODULES.filter((m) => m.category === category).map((module) => (
                        <TableRow key={module.id}>
                          <TableCell className="font-medium pl-6">{module.label}</TableCell>
                          {PERMISSIONS.map((permType) => (
                            <TableCell key={`${module.id}-${permType}`} className="text-center">
                              <FormField
                                control={form.control}
                                name={`permissions.${module.id}.${permType}`}
                                render={({ field }) => (
                                  <FormItem className="flex justify-center m-0 p-0 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-primary"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const current = form.getValues(`permissions.${module.id}`);
                                const allEnabled = Object.values(current).every(Boolean);
                                toggleRow(module.id, !allEnabled);
                              }}
                            >
                              {Object.values(
                                form.getValues(`permissions.${module.id}`) || {},
                              ).every(Boolean)
                                ? 'Unselect All'
                                : 'Select All'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onComplete} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Role' : 'Create Role'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
