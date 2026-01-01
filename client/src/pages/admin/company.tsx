import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft01Icon,
  Building02Icon,
  Loading01Icon,
  FloppyDiskIcon,
} from '@hugeicons/core-free-icons';
import { PageTitle } from '@/components/ui/page-title';
import { HugeiconsIcon } from '@hugeicons/react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { fetchCurrentUser, fetchCompany, updateCompany } from '@/lib/api-helpers';

const translateToArabic = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') return '';

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`,
    );
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.error('Translation error:', error);
  }

  return '';
};

const companyFormSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(200).optional(),
  nameArabic: z.string().max(200).optional(),
  buildingNo: z.string().max(4).optional(),
  secondaryNo: z.string().max(4).optional(),
  street: z.string().max(200).optional(),
  streetArabic: z.string().max(200).optional(),
  district: z.string().max(100).optional(),
  districtArabic: z.string().max(100).optional(),
  postalCode: z.number().optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  crNo: z.string().max(50).optional(),
  crExpiryDate: z.string().optional(),
  vatNo: z.string().max(50).optional(),
  nationalAddress: z.string().max(500).optional(),
  crCertificate: z.string().max(500).optional(),
  vatCertificate: z.string().max(500).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function CompanyPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      nameArabic: '',
      buildingNo: '',
      secondaryNo: '',
      street: '',
      streetArabic: '',
      district: '',
      districtArabic: '',
      postalCode: '',
      country: '',
      city: '',
      crNo: '',
      crExpiryDate: '',
      vatNo: '',
      nationalAddress: '',
      crCertificate: '',
      vatCertificate: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const userData = await fetchCurrentUser(user.id);
        if (userData) {
          setCurrentUser(userData);
          const companyId = userData.companyId;
          if (companyId) {
            const companyData = await fetchCompany(companyId);
            if (companyData) {
              setCompany(companyData);
              form.reset(companyData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id, form]);

  const onSubmit = async (data: CompanyFormValues) => {
    if (!currentUser?.companyId) return;
    try {
      setSubmitting(true);
      const payload: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof CompanyFormValues];
        if (value !== '' && value !== undefined && value !== null) {
          if (key === 'postalCode' && value === '') {
            return;
          }
          payload[key] = value;
        }
      });
      await updateCompany(currentUser.companyId, payload);
      toast({
        title: 'Company updated',
        description: 'The company information has been successfully updated.',
      });
      const updatedCompany = await fetchCompany(currentUser.companyId);
      if (updatedCompany) {
        setCompany(updatedCompany);
        form.reset(updatedCompany);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description:
          error.response?.data?.message || error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const companyId = currentUser?.companyId;

  if (!companyId || !company) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={Building02Icon} className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Company not found</h2>
          <p className="text-muted-foreground mt-2">Unable to load company information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </Button>
        <div>
          <PageTitle
            title="Company Information"
            description="Update your company details and documents."
            icon={Building02Icon}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Building02Icon} className="h-5 w-5 text-primary" />
                Company Details
              </CardTitle>
              <CardDescription>
                Update your company information, address, and documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name (English)</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameArabic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name (Arabic)</FormLabel>
                          <FormControl>
                            <Input placeholder="شركة أكمي" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="crNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CR Number</FormLabel>
                          <FormControl>
                            <Input placeholder="CR1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="crExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CR Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vatNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number</FormLabel>
                        <FormControl>
                          <Input placeholder="VAT123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Address Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="buildingNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Number</FormLabel>
                        <FormControl>
                          <Input placeholder="5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="King Fahd Road" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="streetArabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder="طريق الملك فهد" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Al Olaya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="districtArabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder="العليا" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Riyadh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Saudi Arabia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12345"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? '' : parseInt(value, 10));
                            }}
                            value={field.value === '' ? '' : field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Documents</h3>
                <FormField
                  control={form.control}
                  name="nationalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National Address Document URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/national-address.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CR Certificate URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/cr-certificate.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Certificate URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/vat-certificate.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                  Update Company
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
