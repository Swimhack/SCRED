import FacilityQuestionnaire from "@/components/FacilityQuestionnaire";
import SEO from "@/components/SEO";

const FacilityQuestionnairePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Facility Credentialing Questionnaire" 
        description="Complete your comprehensive facility credentialing questionnaire. Provide detailed information about your pharmacy operations, licensing, and compliance."
        canonicalPath="/questionnaire/facility"
      />
      <FacilityQuestionnaire />
    </div>
  );
};

export default FacilityQuestionnairePage;