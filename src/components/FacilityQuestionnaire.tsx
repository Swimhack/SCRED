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
const facilityQuestionnaireSchema = z.object({
  // Facility Information
  facility_name: z.string().min(2, "Facility name is required"),
  facility_type: z.string().min(1, "Facility type is required"),
  facility_npi: z.string().optional(),
  tax_id: z.string().optional(),
  
  // Location Details
  primary_address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  phone: z.string().regex(/^[\d\s\-()]+$/, "Invalid phone number"),
  fax: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  
  // Business Information
  ownership_type: z.string().min(1, "Ownership type is required"),
  years_in_operation: z.number().min(0).max(200),
  number_of_locations: z.number().min(1),
  annual_prescription_volume: z.number().min(0).optional(),
  
  // Licensing
  state_pharmacy_license: z.string().min(1, "License number is required"),
  license_expiration: z.date(),
  dea_registration: z.string().optional(),
  dea_expiration: z.date().optional(),
  
  // Insurance
  liability_insurance_carrier: z.string().min(2, "Insurance carrier is required"),
  liability_policy_number: z.string().min(1, "Policy number is required"),
  liability_coverage_amount: z.string().min(1, "Coverage amount is required"),
  liability_expiration: z.date(),
  
  // Services
  delivery_available: z.boolean().default(false),
  compounding_services: z.boolean().default(false),
  immunization_services: z.boolean().default(false),
  medication_therapy_management: z.boolean().default(false),
  
  // Staffing
  total_pharmacists: z.number().min(0),
  total_technicians: z.number().min(0),
  total_support_staff: z.number().min(0),
  
  // Technology
  pharmacy_management_system: z.string().optional(),
  e_prescribing_enabled: z.boolean().default(false),
  electronic_health_records: z.boolean().default(false),
  automated_dispensing: z.boolean().default(false),
  
  // Quality & Compliance
  quality_assurance_program: z.boolean().default(false),
  quality_program_description: z.string().optional(),
  hipaa_compliant: z.boolean().default(false),
  last_board_inspection: z.date().optional(),
  inspection_results: z.string().optional(),
  
  // Financial
  accepts_medicare: z.boolean().default(false),
  accepts_medicaid: z.boolean().default(false),
  preferred_wholesaler: z.string().optional(),
  
  // Emergency Preparedness
  emergency_plan: z.boolean().default(false),
  backup_power_system: z.boolean().default(false),
  disaster_recovery_plan: z.boolean().default(false),
  
  // Additional
  chain_affiliation: z.string().optional(),
  buying_group_membership: z.string().optional(),
  additional_notes: z.string().optional(),
});

type FacilityQuestionnaireFormData = z.infer<typeof facilityQuestionnaireSchema>;

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const FACILITY_TYPES = [
  "Hospital",
  "Retail Pharmacy",
  "Long-term Care",
  "Compounding Pharmacy",
  "Specialty Pharmacy",
  "Mail Order Pharmacy",
  "Ambulatory Surgery Center",
  "Clinic",
  "Other"
];

const OWNERSHIP_TYPES = [
  "Corporation",
  "LLC",
  "Partnership",
  "Sole Proprietorship",
  "Non-profit",
  "Government",
  "Other"
];

const PMS_SYSTEMS = [
  "QS/1",
  "Rx30",
  "ScriptPro",
  "PioneerRx",
  "WinPharm",
  "Liberty Software",
  "Computer-Rx",
  "PharamcyKeeper",
  "Other",
  "Custom"
];

const WHOLESALERS = [
  "McKesson",
  "Cardinal Health",
  "AmerisourceBergen",
  "Morris & Dickson",
  "FFF Enterprises",
  "Rochester Drug Cooperative",
  "H.D. Smith",
  "Other"
];

export default function FacilityQuestionnaire() {
  const [activeTab, setActiveTab] = useState("facility");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    role: string;
    organization_id: string;
    organizations?: { id: string; name: string };
  } | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FacilityQuestionnaireFormData>({
    resolver: zodResolver(facilityQuestionnaireSchema),
    defaultValues: {
      delivery_available: false,
      compounding_services: false,
      immunization_services: false,
      medication_therapy_management: false,
      e_prescribing_enabled: false,
      electronic_health_records: false,
      automated_dispensing: false,
      quality_assurance_program: false,
      hipaa_compliant: false,
      accepts_medicare: false,
      accepts_medicaid: false,
      emergency_plan: false,
      backup_power_system: false,
      disaster_recovery_plan: false,
    },
  });

  // Load user profile and existing questionnaire data
  useEffect(() => {
    loadUserProfile();
    loadQuestionnaire();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadQuestionnaire = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!data?.organization_id) return;

      const { data: questionnaire, error } = await supabase
        .from("facility_questionnaires")
        .select("*")
        .eq("organization_id", data.organization_id)
        .eq("status", "draft")
        .single();

      if (questionnaire) {
        setQuestionnaireId(questionnaire.id);
        // Convert date strings to Date objects and handle JSON fields
        const formData = {
          ...questionnaire,
          license_expiration: questionnaire.license_expiration ? new Date(questionnaire.license_expiration) : undefined,
          dea_expiration: questionnaire.dea_expiration ? new Date(questionnaire.dea_expiration) : undefined,
          liability_expiration: questionnaire.liability_expiration ? new Date(questionnaire.liability_expiration) : undefined,
          last_board_inspection: questionnaire.last_board_inspection ? new Date(questionnaire.last_board_inspection) : undefined,
        };
        form.reset(formData);
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  const saveAsDraft = async () => {
    if (!userProfile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be associated with an organization to complete this questionnaire.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const values = form.getValues();
      const dataToSave = {
        ...values,
        organization_id: userProfile.organization_id,
        submitted_by: user.id,
        status: "draft",
        license_expiration: values.license_expiration?.toISOString(),
        dea_expiration: values.dea_expiration?.toISOString(),
        liability_expiration: values.liability_expiration?.toISOString(),
        last_board_inspection: values.last_board_inspection?.toISOString(),
      };

      if (questionnaireId) {
        // Update existing questionnaire
        const { error } = await supabase
          .from("facility_questionnaires")
          .update(dataToSave)
          .eq("id", questionnaireId);

        if (error) throw error;
      } else {
        // Create new questionnaire
        const { data, error } = await supabase
          .from("facility_questionnaires")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        if (data) setQuestionnaireId(data.id);
      }

      toast({
        title: "Saved successfully",
        description: "Your facility questionnaire has been saved as a draft.",
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

  const onSubmit = async (values: FacilityQuestionnaireFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be associated with an organization to complete this questionnaire.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const dataToSubmit = {
        ...values,
        organization_id: userProfile.organization_id,
        submitted_by: user.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        license_expiration: values.license_expiration?.toISOString(),
        dea_expiration: values.dea_expiration?.toISOString(),
        liability_expiration: values.liability_expiration?.toISOString(),
        last_board_inspection: values.last_board_inspection?.toISOString(),
      };

      if (questionnaireId) {
        const { error } = await supabase
          .from("facility_questionnaires")
          .update(dataToSubmit)
          .eq("id", questionnaireId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("facility_questionnaires")
          .insert([dataToSubmit]);

        if (error) throw error;
      }

      toast({
        title: "Submitted successfully",
        description: "Your facility questionnaire has been submitted for review.",
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
    { id: "facility", label: "Facility Info" },
    { id: "business", label: "Business" },
    { id: "licensing", label: "Licensing" },
    { id: "insurance", label: "Insurance" },
    { id: "services", label: "Services" },
    { id: "staffing", label: "Staffing" },
    { id: "technology", label: "Technology" },
    { id: "quality", label: "Quality" },
    { id: "financial", label: "Financial" },
    { id: "emergency", label: "Emergency" },
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

  // Check if user has admin permissions
  const hasAdminAccess = userProfile?.role && ['super_admin', 'admin_manager'].includes(userProfile.role);

  if (!hasAdminAccess) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be an administrator to access the facility questionnaire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Facility Credentialing Questionnaire</CardTitle>
          <CardDescription>
            Complete this questionnaire for your facility. You can save your progress and return later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 lg:grid-cols-11 mb-6">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="facility" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="facility_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Pharmacy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facility_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select facility type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FACILITY_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name="facility_npi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility NPI</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tax_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID</FormLabel>
                          <FormControl>
                            <Input placeholder="12-3456789" {...field} />
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
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4568" {...field} />
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
                            <Input type="email" placeholder="info@pharmacy.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.pharmacy.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="primary_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Address *</FormLabel>
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

                <TabsContent value="business" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownership_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ownership Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ownership type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OWNERSHIP_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name="years_in_operation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Operation *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="number_of_locations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Locations *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annual_prescription_volume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Prescription Volume</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Approximate number of prescriptions filled per year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="licensing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state_pharmacy_license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State Pharmacy License *</FormLabel>
                          <FormControl>
                            <Input placeholder="PH123456" {...field} />
                          </FormControl>
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
                      name="dea_registration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DEA Registration</FormLabel>
                          <FormControl>
                            <Input placeholder="BF1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dea_expiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DEA Expiration</FormLabel>
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
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="liability_insurance_carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Liability Insurance Carrier *</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="liability_policy_number"
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
                      name="liability_coverage_amount"
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

                    <FormField
                      control={form.control}
                      name="liability_expiration"
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
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="delivery_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Delivery Services</FormLabel>
                            <FormDescription>
                              Do you offer prescription delivery services?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compounding_services"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Compounding Services</FormLabel>
                            <FormDescription>
                              Do you offer prescription compounding?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="immunization_services"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Immunization Services</FormLabel>
                            <FormDescription>
                              Do you provide immunizations/vaccinations?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medication_therapy_management"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Medication Therapy Management</FormLabel>
                            <FormDescription>
                              Do you offer MTM services?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="staffing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="total_pharmacists"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Pharmacists *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_technicians"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Technicians *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="4"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_support_staff"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Support Staff *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="technology" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pharmacy_management_system"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy Management System</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select PMS" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PMS_SYSTEMS.map((system) => (
                                <SelectItem key={system} value={system}>
                                  {system}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="e_prescribing_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>E-Prescribing Enabled</FormLabel>
                              <FormDescription>
                                Electronic prescription processing
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="electronic_health_records"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Electronic Health Records</FormLabel>
                              <FormDescription>
                                EHR system integration
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="automated_dispensing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Automated Dispensing</FormLabel>
                              <FormDescription>
                                Robotic dispensing systems
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="quality_assurance_program"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quality Assurance Program</FormLabel>
                            <FormDescription>
                              Do you have a formal quality assurance program?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("quality_assurance_program") && (
                      <FormField
                        control={form.control}
                        name="quality_program_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quality Program Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your quality assurance program"
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
                      name="hipaa_compliant"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>HIPAA Compliant</FormLabel>
                            <FormDescription>
                              Are you HIPAA compliant?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="last_board_inspection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Board Inspection</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="inspection_results"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Results</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select result" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                <SelectItem value="satisfactory-with-recommendations">Satisfactory with Recommendations</SelectItem>
                                <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="accepts_medicare"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Accepts Medicare</FormLabel>
                            <FormDescription>
                              Do you accept Medicare patients?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accepts_medicaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Accepts Medicaid</FormLabel>
                            <FormDescription>
                              Do you accept Medicaid patients?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferred_wholesaler"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Wholesaler</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select wholesaler" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WHOLESALERS.map((wholesaler) => (
                              <SelectItem key={wholesaler} value={wholesaler}>
                                {wholesaler}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="emergency" className="space-y-4">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="emergency_plan"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Emergency Response Plan</FormLabel>
                            <FormDescription>
                              Do you have a documented emergency response plan?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backup_power_system"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Backup Power System</FormLabel>
                            <FormDescription>
                              Do you have backup power (generator, UPS)?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disaster_recovery_plan"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Disaster Recovery Plan</FormLabel>
                            <FormDescription>
                              Do you have a disaster recovery plan for IT systems?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="chain_affiliation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chain Affiliation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CVS, Walgreens, Independent" {...field} />
                          </FormControl>
                          <FormDescription>If applicable</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buying_group_membership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buying Group Membership</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., NCPA, Good Neighbor" {...field} />
                          </FormControl>
                          <FormDescription>If applicable</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additional_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information about your facility"
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