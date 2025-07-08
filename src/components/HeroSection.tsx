
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.6)), url('/lovable-uploads/be98bba8-f7a4-4c5b-862a-41b0e9468e67.png')"
      }}
    >
      
      <div className="container mx-auto px-4 relative z-20 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Provider Credentialing &<br />Enrollment Services
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-white/95">
            Pharmacists in certain states can now bill insurance companies for their 
            services, but before they can do so, they must complete a complex 
            credentialing process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link to="/contact" className="bg-brand-primary text-black px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-all duration-300 inline-block text-center">
              Contact Us
            </Link>
            <Link to="/auth" className="bg-transparent border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-full font-medium hover:bg-brand-primary hover:text-black transition-all duration-300 inline-block text-center">
              Log In
            </Link>
          </div>
          
          <div className="mt-16">
            <p className="mb-4 text-sm opacity-90">Satisfied Clients</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  DR
                </div>
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                  SM
                </div>
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  JL
                </div>
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                  +50
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl">4.9</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-brand-primary fill-brand-primary" />
                  ))}
                </div>
                <span className="text-sm opacity-90 ml-1">(150+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
