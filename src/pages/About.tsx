
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="relative min-h-screen" style={{ 
      backgroundImage: "url('/lovable-uploads/b0b5c3c7-14d1-4e71-881c-a520bcdc11c8.png')", 
      backgroundSize: "cover", 
      backgroundPosition: "center"
    }}>
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 md:p-12 shadow-xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-brand-primary">About PharmCred</h1>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Mission</h2>
                <p className="text-lg">
                  PharmCred exists to empower pharmacists by streamlining the complex credentialing process, 
                  allowing them to focus on what matters most - patient care. We believe that pharmacists 
                  play a crucial role in healthcare delivery, and our mission is to eliminate administrative 
                  barriers that prevent them from billing for their valuable clinical services.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Story</h2>
                <p className="text-lg mb-4">
                  Founded by pharmacists who experienced firsthand the challenges of credentialing, PharmCred 
                  was born out of necessity. As states began allowing pharmacists to bill as providers, we 
                  identified a significant gap in the market for specialized credentialing support tailored 
                  to pharmacy practice.
                </p>
                <p className="text-lg">
                  Today, we've helped hundreds of pharmacists across multiple states successfully navigate the 
                  credentialing process, opening new revenue streams for their practices and expanding patient 
                  access to pharmacy services.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Expertise</h2>
                <p className="text-lg">
                  Our team combines deep expertise in healthcare credentialing with specific knowledge of pharmacy 
                  practice. We understand the unique requirements of pharmacy credentialing across different states 
                  and insurance providers, allowing us to navigate the process efficiently and effectively.
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Join Us</h2>
                <p className="text-lg">
                  Ready to unlock the full potential of your pharmacy practice? Partner with PharmCred today and 
                  let us handle the complexity of provider credentialing while you focus on delivering exceptional 
                  patient care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
