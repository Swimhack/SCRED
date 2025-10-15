
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import pharmaceuticalHero from "@/assets/pharmaceutical-lab-hero.jpg";
import { CheckCircle, TrendingUp, Shield, Scale, DollarSign, Users, Clock, Star, ArrowRight } from "lucide-react";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields (name, email, and message).",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid email address",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get additional data for submission
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Try Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          source: 'investor-homepage',
          userAgent,
          referrer
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Email service error: ${error.message || 'Unknown error'}`);
      }

      if (!data?.success) {
        console.error('Email sending failed:', data);
        throw new Error(data?.error || 'Failed to send email');
      }

      // Success!
      toast({
        title: "Message sent!",
        description: "We've received your message and our team will get back to you soon. Thank you for your interest in StreetCredRx!",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      
    } catch (error) {
      console.error('Contact form submission failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Unable to send message", 
        description: `Error: ${errorMessage}. Please try again or contact us at contact@streetcredrx.com`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <SEO 
        title="StreetCredRx - Revolutionizing Pharmacy Credentialing" 
        description="Investment opportunity: Streamlining the $50+ billion pharmacy credentialing market with automated workflows and compliance solutions."
        canonicalPath="/"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pharmaceuticalHero})`
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl w-full">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{
                color: '#ffffff',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              Revolutionizing Pharmacy<br />Credentialing
            </h1>
            <p 
              className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed"
              style={{
                color: '#ffffff',
                opacity: '0.95',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              Streamlining the $50+ billion pharmacy credentialing market with automated workflows, 
              compliance solutions, and scalable technology infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a href="#contact" className="bg-brand-primary text-black px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-all duration-300 inline-block text-center">
                Schedule a Demo
              </a>
              <a href="#market-opportunity" className="bg-transparent border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-full font-medium hover:bg-brand-primary hover:text-black transition-all duration-300 inline-block text-center">
                Learn More
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

      {/* Market Opportunity Section */}
      <section id="market-opportunity" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Massive Market Opportunity
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The pharmacy credentialing market is ripe for disruption with outdated processes costing the industry billions annually.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">$50+ Billion</h3>
              <p className="text-gray-600">Annual pharmacy credentialing market size with 12% YoY growth</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">6-12 Months</h3>
              <p className="text-gray-600">Average credentialing time we reduce to 30-60 days</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">67,000+</h3>
              <p className="text-gray-600">Independent pharmacies needing credentialing services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Platform Advantages
            </h2>
            <p className="text-lg text-gray-600">
              Our technology-first approach delivers measurable results for pharmacies and payers alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Workflows</h3>
                  <p className="text-gray-600">AI-powered document processing reduces manual work by 85% and eliminates common errors.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Assurance</h3>
                  <p className="text-gray-600">Built-in compliance checks ensure 100% regulatory adherence across all states and payers.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalable Infrastructure</h3>
                  <p className="text-gray-600">Cloud-native architecture handles unlimited concurrent credentialing applications.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Reduction</span>
                  <span className="font-semibold text-gray-900">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost Savings</span>
                  <span className="font-semibold text-gray-900">$15K per pharmacy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-900">97.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Retention</span>
                  <span className="font-semibold text-gray-900">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Proven Business Model
            </h2>
            <p className="text-lg text-gray-600">
              Multiple revenue streams with strong unit economics and predictable growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Revenue Streams</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">SaaS Subscriptions</h4>
                    <p className="text-sm text-gray-600">$2,500/month per pharmacy, 95% retention</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Transaction Fees</h4>
                    <p className="text-sm text-gray-600">2.5% of processed credentialing volume</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Premium Services</h4>
                    <p className="text-sm text-gray-600">Consulting, compliance audits, training</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Competitive Advantages</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">First-Mover Advantage</h4>
                    <p className="text-sm text-gray-600">Only fully automated platform in market</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Network Effects</h4>
                    <p className="text-sm text-gray-600">Payer integrations create switching costs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Data Moat</h4>
                    <p className="text-sm text-gray-600">Proprietary credentialing intelligence</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Regulatory Expertise</h4>
                    <p className="text-sm text-gray-600">Deep compliance knowledge barrier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Ready to Learn More?
              </h2>
              <p className="text-lg text-gray-600">
                Connect with our team to discuss this investment opportunity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-lg">SC</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">StreetCredRx Team</h3>
                    <p className="text-gray-600">Leadership Team</p>
                    <p className="text-gray-600">contact@streetcredrx.com</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">What We're Looking For:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Strategic investors with healthcare expertise
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Partnership opportunities with payers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Growth capital for market expansion
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input 
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Input 
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Input 
                      name="phone"
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Textarea 
                      name="message"
                      rows={4}
                      placeholder="Tell us about your interest in StreetCredRx..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="border-gray-300"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-brand-primary text-black px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-colors w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Schedule a Demo"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
