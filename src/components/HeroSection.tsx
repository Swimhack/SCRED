
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section 
      className="hero-section relative min-h-screen flex items-center"
      style={{
        backgroundColor: '#682D70'
      }}
    >
      
      <div className="bg-image-content container mx-auto px-4">
        <div className="max-w-4xl w-full">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-brand-bittersweet"
            style={{
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            Pharmacist credentialing, simplified.
          </h1>
          <p 
            className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-white"
            style={{
              opacity: '0.95',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            Expert pharmacist credentialing to join health plan networks faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a href="#contact" className="bg-brand-maize text-black px-8 py-3 rounded-full font-medium hover:bg-brand-maize/90 transition-all duration-300 inline-block text-center">
              See how it works
            </a>
          </div>
          
          <div className="mt-16">
            <p className="mb-4 text-sm opacity-90">Trusted by Leading Pharmacies</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2 sm:-space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  IND
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  RX
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  PHARM
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  +500
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-xl sm:text-2xl">4.9</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="sm:w-5 sm:h-5 text-brand-primary fill-brand-primary" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm opacity-90 ml-1">(500+ pharmacies)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
