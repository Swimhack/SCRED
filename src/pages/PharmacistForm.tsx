
import CredentialingForm from "@/components/CredentialingForm";

const PharmacistForm = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">New Pharmacist Credentialing</h1>
      <CredentialingForm />
    </div>
  );
};

export default PharmacistForm;
