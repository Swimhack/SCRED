import PharmacistQuestionnaire from "@/components/PharmacistQuestionnaire";
import SEO from "@/components/SEO";

const PharmacistQuestionnairePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Pharmacist Credentialing Questionnaire" 
        description="Complete your comprehensive pharmacist credentialing questionnaire. Provide detailed information about your professional background, certifications, and experience."
        canonicalPath="/questionnaire/pharmacist"
      />
      <PharmacistQuestionnaire />
    </div>
  );
};

export default PharmacistQuestionnairePage;