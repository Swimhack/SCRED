
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";
import SEO from "@/components/SEO";
import pharmaceuticalHero from "@/assets/pharmaceutical-lab-hero.jpg";

const Service = () => {
  const services = [
    {
      title: "Provider Credentialing",
      description: "Complete credentialing services for pharmacists seeking provider status with insurance networks.",
      features: [
        "CAQH ProView profile creation and maintenance",
        "Insurance panel applications",
        "Medicare/Medicaid enrollment",
        "Credentialing document management",
        "Status tracking and follow-up"
      ]
    },
    {
      title: "Provider Enrollment",
      description: "Streamlined enrollment process to help pharmacists join insurance networks and billing systems.",
      features: [
        "Insurance network enrollment",
        "Electronic claims setup",
        "Billing software integration",
        "Provider identification numbers",
        "Contract negotiation assistance"
      ]
    },
    {
      title: "Ongoing Maintenance",
      description: "Continuous support to maintain your credentialing status and handle renewals.",
      features: [
        "Credential renewal management",
        "Document expiration monitoring",
        "Information updates across platforms",
        "Re-credentialing assistance",
        "Compliance monitoring"
      ]
    }
  ];

  return (
    <div 
      className="hero-section relative min-h-screen bg-cover bg-center bg-no-repeat" 
      style={{ 
        backgroundImage: `url(${pharmaceuticalHero})`
      }}
    >
      {/* Simplified overlay for better text contrast */}
      <div className="bg-image-overlay absolute inset-0 bg-black/50"></div>
      <SEO 
        title="Pharmacy Credentialing & Enrollment Services" 
        description="Explore our comprehensive credentialing services for pharmacists including provider enrollment, insurance network applications, and ongoing maintenance."
        canonicalPath="/service"
      />
      <Navbar />
      
      <div className="bg-image-content pt-24 pb-16">
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
              Our Services
            </h1>
            
            <p className="text-xl mb-12">
              StreetCredRx offers comprehensive credentialing and enrollment services designed specifically 
              for pharmacists looking to bill for clinical services.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-gray-800/70 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
                  <h2 className="text-2xl font-bold mb-4 text-brand-primary">{service.title}</h2>
                  <p className="mb-6 text-gray-300">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex">
                        <Check className="text-brand-primary mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
              <p className="text-lg mb-6">
                Contact us today to learn how we can help streamline your credentialing process.
              </p>
              <a href="/contact" className="bg-brand-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-colors inline-block">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
