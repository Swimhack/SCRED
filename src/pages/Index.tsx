
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-brand-robins-egg p-6 rounded-xl mb-8">
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
                    className="bg-brand-maize text-black px-8 py-3 rounded-full font-medium hover:bg-brand-maize/90 transition-colors w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
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
