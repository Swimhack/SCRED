
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Provider Credentialing & Enrollment Services
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl">
            Pharmacists in certain states can now bill insurance companies for their services, but
            before they can do so, they must complete a complex credentialing process.
          </p>
          
          <Link to="/contact" className="bg-brand-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-colors inline-block">
            Contact Us
          </Link>
          
          <div className="mt-16">
            <p className="mb-2">Satisfied Clients</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  P1
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  P2
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  P3
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="font-bold text-lg">4.9</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
