
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

const CredentialingForm = () => {
  const [currentStep, setCurrentStep] = useState<string>("personal-info");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Pharmacist Credentialing Application</h2>
      
      <Accordion type="single" collapsible defaultValue="personal-info">
        <AccordionItem value="personal-info">
          <AccordionTrigger className="py-4 text-lg font-medium">
            1. Personal Information
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npi">NPI Number</Label>
                <Input id="npi" placeholder="Enter NPI number" />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep("education")}
                className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
              >
                Next Step <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="education">
          <AccordionTrigger className="py-4 text-lg font-medium">
            2. Education & Training
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pharmacySchool">Pharmacy School</Label>
                  <Input id="pharmacySchool" placeholder="Enter school name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationDate">Graduation Date</Label>
                  <Input id="graduationDate" type="month" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="degree">Degree Earned</Label>
                <Input id="degree" placeholder="e.g., Pharm.D., B.Pharm" />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">Upload Diploma (PDF)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <p className="text-gray-500 mb-1">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep("licenses")}
                className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
              >
                Next Step <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="licenses">
          <AccordionTrigger className="py-4 text-lg font-medium">
            3. License & Certifications
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" placeholder="Enter license number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseState">State of Licensure</Label>
                  <Input id="licenseState" placeholder="Enter state" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input id="expirationDate" type="date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2">Upload License (PDF)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <p className="text-gray-500 mb-1">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep("practice")}
                className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
              >
                Next Step <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="practice">
          <AccordionTrigger className="py-4 text-lg font-medium">
            4. Practice Information
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="practiceName">Practice Name</Label>
                  <Input id="practiceName" placeholder="Enter practice name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceType">Practice Type</Label>
                  <Input id="practiceType" placeholder="e.g., Retail, Hospital, etc." />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="practiceAddress">Practice Address</Label>
                <Input id="practiceAddress" placeholder="Enter street address" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="practiceCity">City</Label>
                  <Input id="practiceCity" placeholder="Enter city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceState">State</Label>
                  <Input id="practiceState" placeholder="Enter state" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceZip">Zip Code</Label>
                  <Input id="practiceZip" placeholder="Enter zip code" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => alert("Form submitted successfully!")}
                className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
              >
                Submit Application
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CredentialingForm;
