
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#682D70' }}>
      {/* Clean purple background - no overlay needed */}
      <SEO 
        title="About Our Pharmacy Credentialing Services" 
        description="Learn about StreetCredRx's mission to streamline the credentialing process for pharmacists. Founded by pharmacists for pharmacists."
        canonicalPath="/about"
      />
      <Navbar />
      
      <div className="pt-24 pb-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 md:p-12 shadow-xl text-white">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-8 text-brand-primary"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              About StreetCredRx
            </h1>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-bittersweet">Our Mission</h2>
                <p className="text-lg">
                  StreetCredRx's mission is to make pharmacist credentialing affordable and accessible, empowering 
                  pharmacies to unlock stronger revenue streams, expand patient services and fuel long-term industry 
                  growth.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-bittersweet">Our Story</h2>
                <p className="text-lg mb-4">
                  Founded by 20+ year pharmacy industry veterans dedicated to advancing the pharmacy profession 
                  and keeping community pharmacies profitable, StreetCredRx was born out of necessity.
                </p>
                <p className="text-lg">
                  As states began allowing pharmacists to bill as providers, many pharmacies were unable to 
                  affordably and efficiently get their pharmacists credentialed with medical payers.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-bittersweet">Our Expertise</h2>
                <p className="text-lg">
                  Our team combines deep expertise in healthcare credentialing with specific knowledge of pharmacy 
                  practice. We understand the unique requirements of pharmacy credentialing across different states 
                  and insurance providers, allowing us to navigate the process efficiently and effectively.
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-bittersweet">Contact Us</h2>
                <p className="text-lg mb-6">
                  Ready to unlock the full potential of your pharmacy practice? Get in touch with our team today.
                </p>
                <div className="max-w-md">
                  <div className="bg-brand-robins-egg p-6 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-bittersweet rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SC</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">StreetCredRx Team</h3>
                        <p className="text-sm text-gray-700">info@streetcredrx.com</p>
                      </div>
                    </div>
                  </div>
                  <a 
                    href="/contact" 
                    className="bg-brand-maize text-black px-6 py-3 rounded-full font-medium hover:bg-brand-maize/90 transition-colors inline-block"
                  >
                    Send us a message
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
