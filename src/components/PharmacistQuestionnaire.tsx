import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Save, Send, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Form validation schema
const pharmacistQuestionnaireSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.date().optional(),
  ssn_last_four: z.string().length(4, "Must be exactly 4 digits").regex(/^\d{4}$/, "Must contain only numbers").optional(),
  home_address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  phone_number: z.string().regex(/^[\d\s\-()]+$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  
  // Professional Information
  license_number: z.string().min(1, "License number is required"),
  license_state: z.string().length(2, "State must be 2 characters"),
  license_expiration: z.date(),
  npi_number: z.string().length(10, "NPI must be 10 digits").regex(/^\d{10}$/, "Must contain only numbers"),
  dea_number: z.string().optional(),
  years_of_experience: z.number().min(0).max(50),
  pharmacy_school: z.string().min(2, "School name is required"),
  graduation_year: z.number().min(1950).max(new Date().getFullYear()),
  
  // Employment
  current_employer: z.string().min(2, "Employer name is required"),
  employer_address: z.string().min(5, "Employer address is required"),
  position_title: z.string().min(2, "Position title is required"),
  employment_start_date: z.date(),
  
  // Certifications
  immunization_certified: z.boolean(),
  cpr_certified: z.boolean(),
  
  // Insurance
  malpractice_insurance_carrier: z.string().min(2, "Insurance carrier is required"),
  policy_number: z.string().min(1, "Policy number is required"),
  policy_expiration: z.date(),
  coverage_amount: z.string().min(1, "Coverage amount is required"),
  
  // Compliance
  criminal_history: z.boolean(),
  criminal_history_explanation: z.string().optional(),
  disciplinary_action: z.boolean(),
  disciplinary_action_explanation: z.string().optional(),
  
  // Additional
  languages_spoken: z.array(z.string()).default([]),
  available_start_date: z.date().optional(),
  preferred_work_schedule: z.string().optional(),
  willing_to_travel: z.boolean().default(false),
  additional_notes: z.string().optional(),
});

type PharmacistQuestionnaireFormData = z.infer<typeof pharmacistQuestionnaireSchema>;

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const LANGUAGES = [
  "English", "Spanish", "French", "Mandarin", "Cantonese", "Vietnamese",
  "Korean", "Japanese", "Arabic", "Hindi", "Russian", "Portuguese",
  "German", "Italian", "Polish", "Tagalog", "Other"
];

export default function PharmacistQuestionnaire() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<PharmacistQuestionnaireFormData>({
    resolver: zodResolver(pharmacistQuestionnaireSchema),
    defaultValues: {
      immunization_certified: false,
      cpr_certified: false,
      criminal_history: false,
      disciplinary_action: false,
      willing_to_travel: false,
      languages_spoken: [],
    },
  });

  // Load existing questionnaire data
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("pharmacist_questionnaires")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .single();

      if (data) {
        setQuestionnaireId(data.id);
        // Convert date strings to Date objects
        const formData = {
          ...data,
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          license_expiration: data.license_expiration ? new Date(data.license_expiration) : undefined,
          employment_start_date: data.employment_start_date ? new Date(data.employment_start_date) : undefined,
          policy_expiration: data.policy_expiration ? new Date(data.policy_expiration) : undefined,
          available_start_date: data.available_start_date ? new Date(data.available_start_date) : undefined,
        };
        form.reset(formData);
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const values = form.getValues();
      const dataToSave = {
        ...values,
        user_id: user.id,
        status: "draft",
        date_of_birth: values.date_of_birth?.toISOString(),
        license_expiration: values.license_expiration?.toISOString(),
        employment_start_date: values.employment_start_date?.toISOString(),
        policy_expiration: values.policy_expiration?.toISOString(),
        available_start_date: values.available_start_date?.toISOString(),
      };

      if (questionnaireId) {
        // Update existing questionnaire
        const { error } = await supabase
          .from("pharmacist_questionnaires")
          .update(dataToSave)
          .eq("id", questionnaireId);

        if (error) throw error;
      } else {
        // Create new questionnaire
        const { data, error } = await supabase
          .from("pharmacist_questionnaires")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        if (data) setQuestionnaireId(data.id);
      }

      toast({
        title: "Saved successfully",
        description: "Your questionnaire has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast({
        title: "Error",
        description: "Failed to save questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (values: PharmacistQuestionnaireFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const dataToSubmit = {
        ...values,
        user_id: user.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        date_of_birth: values.date_of_birth?.toISOString(),
        license_expiration: values.license_expiration?.toISOString(),
        employment_start_date: values.employment_start_date?.toISOString(),
        policy_expiration: values.policy_expiration?.toISOString(),
        available_start_date: values.available_start_date?.toISOString(),
      };

      if (questionnaireId) {
        const { error } = await supabase
          .from("pharmacist_questionnaires")
          .update(dataToSubmit)
          .eq("id", questionnaireId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pharmacist_questionnaires")
          .insert([dataToSubmit]);

        if (error) throw error;
      }

      toast({
        title: "Submitted successfully",
        description: "Your questionnaire has been submitted for review.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast({
        title: "Error",
        description: "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Information" },
    { id: "professional", label: "Professional" },
    { id: "employment", label: "Employment" },
    { id: "certifications", label: "Certifications" },
    { id: "insurance", label: "Insurance" },
    { id: "compliance", label: "Compliance" },
    { id: "additional", label: "Additional" },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const canGoNext = currentTabIndex < tabs.length - 1;
  const canGoPrevious = currentTabIndex > 0;

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pharmacist Credentialing Questionnaire</CardTitle>
          <CardDescription>
            Please complete all sections of this questionnaire. You can save your progress and return later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
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
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ssn_last_four"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SSN (Last 4 digits)</FormLabel>
                          <FormControl>
                            <Input placeholder="1234" maxLength={4} {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="home_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
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
                            <FormLabel>State *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STATES.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
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
                        name="zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="professional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="license_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="RPH123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="license_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License State *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
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
                      name="license_expiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Expiration *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="npi_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NPI Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" maxLength={10} {...field} />
                          </FormControl>
                          <FormDescription>10-digit National Provider Identifier</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dea_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DEA Number</FormLabel>
                          <FormControl>
                            <Input placeholder="BA1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="years_of_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pharmacy_school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy School *</FormLabel>
                          <FormControl>
                            <Input placeholder="University of Pharmacy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="graduation_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2015"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="employment" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="current_employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Employer *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Pharmacy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="456 Business Ave, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="position_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Staff Pharmacist" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employment_start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="certifications" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="immunization_certified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Immunization Certified
                            </FormLabel>
                            <FormDescription>
                              Check if you are certified to administer immunizations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpr_certified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              CPR Certified
                            </FormLabel>
                            <FormDescription>
                              Check if you have current CPR certification
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="malpractice_insurance_carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Malpractice Insurance Carrier *</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="policy_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="POL123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="policy_expiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Expiration *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverage_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coverage Amount *</FormLabel>
                          <FormControl>
                            <Input placeholder="$1,000,000/$3,000,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="criminal_history"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Criminal History</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="false"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                              />
                              <span>No</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="true"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                              />
                              <span>Yes</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Have you ever been convicted of a crime?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("criminal_history") && (
                    <FormField
                      control={form.control}
                      name="criminal_history_explanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please explain</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about the criminal history"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="disciplinary_action"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Disciplinary Action</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="false"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                              />
                              <span>No</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="true"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                              />
                              <span>Yes</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Have you ever been subject to disciplinary action by any licensing board?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("disciplinary_action") && (
                    <FormField
                      control={form.control}
                      name="disciplinary_action_explanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please explain</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about the disciplinary action"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="languages_spoken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages Spoken</FormLabel>
                        <FormDescription>
                          Select all languages you speak fluently
                        </FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {LANGUAGES.map((language) => (
                            <label key={language} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(language)}
                                onCheckedChange={(checked) => {
                                  const updatedLanguages = checked
                                    ? [...(field.value || []), language]
                                    : field.value?.filter((l) => l !== language) || [];
                                  field.onChange(updatedLanguages);
                                }}
                              />
                              <span className="text-sm">{language}</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="available_start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferred_work_schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Work Schedule</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full Time</SelectItem>
                              <SelectItem value="part-time">Part Time</SelectItem>
                              <SelectItem value="per-diem">Per Diem</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="willing_to_travel"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Willing to Travel
                          </FormLabel>
                          <FormDescription>
                            Check if you are willing to travel for work assignments
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additional_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information you'd like to provide"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToNextTab}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveAsDraft}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}