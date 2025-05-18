
import CredentialingForm from "@/components/CredentialingForm";
import SEO from "@/components/SEO";

const PharmacistForm = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title="Pharmacy Credentialing Application" 
        description="Complete your pharmacy provider enrollment application. Submit your information for credentialing with insurance networks."
        canonicalPath="/pharmacist-form"
      />
      <h1 className="text-2xl font-semibold mb-6">New Pharmacist Credentialing</h1>
      <CredentialingForm />
    </div>
  );
};

export default PharmacistForm;
