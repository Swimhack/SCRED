
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="relative" style={{ 
      backgroundImage: "url('/lovable-uploads/b0b5c3c7-14d1-4e71-881c-a520bcdc11c8.png')", 
      backgroundSize: "cover", 
      backgroundPosition: "center"
    }}>
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Index;
