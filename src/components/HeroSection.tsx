
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" className="bg-brand-maize text-black px-8 py-3 rounded-full font-medium hover:bg-brand-maize/90 transition-all duration-300 inline-block text-center">
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
