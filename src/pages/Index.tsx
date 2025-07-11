
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="relative">
      <SEO 
        title="StreetCredRx - Pharmacy Credentialing & Enrollment Services" 
        description="Simplify your pharmacy credentialing process with StreetCredRx. We help independent pharmacists navigate the complex provider enrollment requirements."
        canonicalPath="/"
      />
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Index;
