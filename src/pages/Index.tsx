
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="relative" style={{ 
      backgroundImage: "url('/lovable-uploads/b0b5c3c7-14d1-4e71-881c-a520bcdc11c8.png')", 
      backgroundSize: "cover", 
      backgroundPosition: "center"
    }}>
      <SEO 
        title="StreetCredRX - Pharmacy Credentialing & Enrollment Services" 
        description="Simplify your pharmacy credentialing process with StreetCredRX. We help independent pharmacists navigate the complex provider enrollment requirements."
        canonicalPath="/"
      />
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Index;
