import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FloppyDiskIcon,
  UserIcon,
  Loading01Icon,
  LockIcon,
  Mail01Icon,
  Edit01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { PageTitle } from '@/components/ui/page-title';

const baseProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
});

const profileFormSchema = baseProfileSchema;

const profileWithPasswordSchema = baseProfileSchema
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.trim() !== '' && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Current password is required to change password',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.trim() !== '' && data.newPassword.length < 8) {
        return false;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) => {
      if (
        data.newPassword &&
        data.newPassword.trim() !== '' &&
        data.newPassword !== data.confirmPassword
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  );

type ProfileFormValues = z.infer<typeof baseProfileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/users/${user.id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      return null;
    },
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const schema = showPasswordSection ? profileWithPasswordSchema : profileFormSchema;
    form.clearErrors('currentPassword');
    form.clearErrors('newPassword');
    form.clearErrors('confirmPassword');
  }, [showPasswordSection, form]);

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [currentUser, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues | { name: string; email: string }) => {
      const updateData: any = {
        name: data.name,
      };

      if ('newPassword' in data && data.newPassword && data.newPassword.trim() !== '') {
        if (
          !('currentPassword' in data) ||
          !data.currentPassword ||
          data.currentPassword.trim() === ''
        ) {
          throw new Error('Current password is required to change password');
        }
        updateData.currentPassword = data.currentPassword;
        updateData.password = data.newPassword;
      }

      const response = await api.patch(`/users/${user?.id}`, updateData);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Failed to update profile');
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const updatedUserData = {
            ...userData,
            username: updatedUser.name || userData.username,
            email: updatedUser.email || userData.email,
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error('Failed to update stored user data', e);
        }
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      form.reset({
        name: form.getValues('name'),
        email: form.getValues('email'),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      if (!showPasswordSection) {
        form.clearErrors('currentPassword');
        form.clearErrors('newPassword');
        form.clearErrors('confirmPassword');

        const nameSchema = z
          .string()
          .min(1, 'Name is required')
          .min(2, 'Name must be at least 2 characters')
          .max(100);
        const emailSchema = z.string().email('Invalid email address');

        const nameResult = nameSchema.safeParse(data.name);
        const emailResult = emailSchema.safeParse(data.email);

        if (!nameResult.success) {
          form.setError('name', { type: 'manual', message: nameResult.error.errors[0].message });
          setIsSubmitting(false);
          return;
        }

        if (!emailResult.success) {
          form.setError('email', { type: 'manual', message: emailResult.error.errors[0].message });
          setIsSubmitting(false);
          return;
        }

        const updateData: any = {
          name: data.name,
          email: data.email,
        };
        await updateProfileMutation.mutateAsync(updateData);
      } else {
        const schema = profileWithPasswordSchema;
        const validationResult = schema.safeParse(data);
        if (!validationResult.success) {
          validationResult.error.errors.forEach((error) => {
            form.setError(error.path[0] as any, {
              type: 'manual',
              message: error.message,
            });
          });
          setIsSubmitting(false);
          return;
        }
        await updateProfileMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageTitle
        title="Profile"
        description="Manage your account settings and preferences"
        icon={UserIcon}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                {currentUser?.name ? getInitials(currentUser.name) : 'U'}
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{currentUser?.name || 'User'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                  {currentUser?.email || user?.email || 'No email'}
                </CardDescription>
                {currentUser?.role && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentUser.role.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Update your name</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={UserIcon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
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
                        <FormLabel className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={Mail01Icon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} disabled />
                        </FormControl>
                        <FormDescription>Email cannot be changed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <HugeiconsIcon icon={LockIcon} className="h-5 w-5 text-primary" />
                        Password & Security
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Change your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (showPasswordSection) {
                          form.resetField('currentPassword');
                          form.resetField('newPassword');
                          form.resetField('confirmPassword');
                          form.clearErrors('currentPassword');
                          form.clearErrors('newPassword');
                          form.clearErrors('confirmPassword');
                        }
                        setShowPasswordSection(!showPasswordSection);
                      }}
                    >
                      <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                      {showPasswordSection ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>

                  {showPasswordSection && (
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your current password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your current password to verify your identity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>Minimum 8 characters</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  {showPasswordSection && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.resetField('currentPassword');
                        form.resetField('newPassword');
                        form.resetField('confirmPassword');
                        form.clearErrors('currentPassword');
                        form.clearErrors('newPassword');
                        form.clearErrors('confirmPassword');
                        setShowPasswordSection(false);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
