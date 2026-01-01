import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const data = response.data;

      if (data.success && data.result) {
        const token = data.result.accessToken;
        const user = {
          id: data.result.user.id,
          email: data.result.user.email,
          username: data.result.user.name,
          role: data.result.user.role,
        };

        if (token) {
          login(token, user);
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
        } else {
          throw new Error('No token received');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description:
          error.response?.data?.message ||
          error.message ||
          'Invalid credentials. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-slate-900/60 z-10" />
        <div className="absolute inset-0">
          <img
            src="/login-cover.jpg"
            className="w-full h-full object-cover"
            alt="Company Journey"
          />
        </div>
        <div className="relative z-20 flex flex-col justify-between p-12 text-white h-full">
          <div>
            <div className="mb-8">
              <img
                src="/company-logo.png"
                alt="Company Logo"
                className="h-20 w-auto object-contain"
                style={{ maxWidth: '280px' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">Manage your fleet with precision and ease.</h1>
            <p className="text-slate-300 text-lg">
              Complete logistics solution for tracking, management, and optimization.
            </p>
          </div>
          <div className="text-sm text-slate-400">© 2025 All rights reserved.</div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <Card className="w-full max-w-md shadow-none p-4 bg-card borde">
          <CardHeader className="space-y-1 px-0">
            <div className="flex justify-center mb-4">
              <img
                src="/company-logo.png"
                alt="Company Logo"
                className="h-20 w-auto object-contain"
                style={{ maxWidth: '240px' }}
              />
            </div>
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>Enter your email and password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
