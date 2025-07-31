"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Save,
  Upload,
  Building2,
  Globe,
  Calendar,
  DollarSign,
  PaintBucket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the form schema with Zod
const organizationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters" }),
  legalName: z
    .string()
    .min(2, { message: "Legal name must be at least 2 characters" }),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  postalCode: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  taxId: z.string().optional(),
  fiscalYearStart: z
    .string()
    .min(1, { message: "Fiscal year start is required" }),
  fiscalYearEnd: z.string().min(1, { message: "Fiscal year end is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code",
  }),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

// Mock data for the organization
const defaultOrganization = {
  name: "Acme Corporation",
  legalName: "Acme Corporation LLC",
  email: "contact@acmecorp.com",
  phone: "+1 (555) 123-4567",
  website: "https://www.acmecorp.com",
  address: "123 Main Street, Suite 100",
  city: "San Francisco",
  state: "CA",
  postalCode: "94105",
  country: "United States",
  taxId: "12-3456789",
  fiscalYearStart: "01-01",
  fiscalYearEnd: "12-31",
  currency: "USD",
  primaryColor: "#3b82f6",
  logo: "/placeholder-logo.png",
};

// Currency options
const currencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [logoPreview, setLogoPreview] = useState(defaultOrganization.logo);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: defaultOrganization.name,
      legalName: defaultOrganization.legalName,
      email: defaultOrganization.email,
      phone: defaultOrganization.phone,
      website: defaultOrganization.website,
      address: defaultOrganization.address,
      city: defaultOrganization.city,
      state: defaultOrganization.state,
      postalCode: defaultOrganization.postalCode,
      country: defaultOrganization.country,
      taxId: defaultOrganization.taxId,
      fiscalYearStart: defaultOrganization.fiscalYearStart,
      fiscalYearEnd: defaultOrganization.fiscalYearEnd,
      currency: defaultOrganization.currency,
      primaryColor: defaultOrganization.primaryColor,
    },
  });

  // Handle form submission
  const onSubmit = async (data: OrganizationFormValues) => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Organization data saved:", data);
    setIsSaving(false);
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, just create a local URL for preview
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Profile</h1>
        <p className="text-muted-foreground">
          Manage your organization's profile and settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">
            <Building2 className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="tab2">
            <PaintBucket className="mr-2 h-4 w-4" />
            Tab 2
          </TabsTrigger>
          <TabsTrigger value="tab3">
            <DollarSign className="mr-2 h-4 w-4" />
            Tab 3
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-6"
          >
            <TabsContent value="general">
              <div className="space-y-6 h-[calc(100vh-22rem)] overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
                      Basic information about your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The name displayed throughout the application
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="legalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legal Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Official registered name of your organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                    <CardDescription>
                      Your organization's physical location
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tab2" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tab 2</CardTitle>
                  <CardDescription>Tab 2 description</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="tab3" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tab 3</CardTitle>
                  <CardDescription>Tab 3 description</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
