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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FloppyDiskIcon, UserIcon, Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import { fetchRoles, fetchUser, createUser, updateUser } from '@/lib/api-helpers';
import { useBreadcrumb } from '@/context/breadcrumb-context';

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: any;
  isEditMode?: boolean;
  userId?: string;
  onComplete?: () => void;
}

export function UserForm({ initialData, isEditMode = false, userId, onComplete }: UserFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [roles, setRoles] = useState<any[]>([]);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rolesData, userData] = await Promise.all([
          fetchRoles(),
          isEditMode && userId ? fetchUser(userId) : Promise.resolve(null),
        ]);
        setRoles(rolesData);
        if (userData) {
          setExistingUser(userData);
          form.reset({
            ...userData,
            password: '',
          });
          if (userData.name) {
            setEntityLabel(userData.name);
          }
        } else {
          setEntityLabel(null);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => setEntityLabel(null);
  }, [isEditMode, userId, form, setEntityLabel]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      setSubmitting(true);
      if (isEditMode && userId) {
        const payload: any = {
          name: data.name,
          email: data.email,
          roleId: data.roleId,
        };
        if (data.password && data.password.length > 0) {
          payload.password = data.password;
        }
        if (data.status) payload.status = data.status;
        await updateUser(userId, payload);
        toast({
          title: 'User updated',
          description: 'The user has been successfully updated.',
        });
      } else {
        const payload: any = {
          name: data.name,
          email: data.email,
          password: data.password,
          roleId: data.roleId,
        };
        if (data.status) payload.status = data.status;
        await createUser(payload);
        toast({
          title: 'User created',
          description: 'The user has been successfully created.',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-primary" />
              User Details
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update user information and role assignment.'
                : 'Create a new user account for the system.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onComplete} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <HugeiconsIcon icon={Orbit01Icon} className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
