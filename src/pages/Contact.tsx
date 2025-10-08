
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import pharmaceuticalHero from "@/assets/pharmaceutical-lab-hero.jpg";

const Contact = () => {
  console.log('Contact component rendered');
  
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
    console.log('handleSubmit called', { formData });
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        console.log('Validation failed - calling toast for missing fields');
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields (name, email, and message).",
          variant: "destructive",
        });
        console.log('Toast called for missing fields');
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
      
      console.log('Submitting contact form with data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message.substring(0, 50) + '...',
        source: 'website',
        userAgent: userAgent.substring(0, 50) + '...',
        referrer
      });
      
      // First try Supabase Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            message: formData.message.trim(),
            source: 'website',
            userAgent,
            referrer
          }
        });

        console.log('Supabase function response:', { data, error });

        if (!error && data?.success) {
          toast({
            title: "Message sent!",
            description: "We've received your message and will get back to you soon. Thank you for contacting us!",
          });
          setFormData({ name: "", email: "", phone: "", message: "" });
          return;
        }
        
        console.log('Supabase function failed, trying Formspree fallback');
      } catch (supabaseError) {
        console.log('Supabase function error, trying Formspree fallback:', supabaseError);
      }
      
      // Fallback - Open email client with pre-filled message
      const emailSubject = encodeURIComponent(`Contact Form Submission from ${formData.name.trim()}`);
      const emailBody = encodeURIComponent(
        `Name: ${formData.name.trim()}\n` +
        `Email: ${formData.email.trim()}\n` +
        `Phone: ${formData.phone.trim() || 'Not provided'}\n\n` +
        `Message:\n${formData.message.trim()}\n\n` +
        `---\nSource: Contact Page\n` +
        `User Agent: ${userAgent}\n` +
        `Referrer: ${referrer || 'Direct'}`
      );
      
      window.open(`mailto:ajlipka@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
      
      toast({
        title: "Opening email client...",
        description: "We've opened your email client with a pre-filled message. Please send the email to complete your inquiry.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      
    } catch (error) {
      console.error('Contact form submission failed completely:', error);
      
      toast({
        title: "Unable to send message",
        description: "We're experiencing technical difficulties. Please email us directly at ajlipka@gmail.com or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat" 
      style={{ 
        backgroundImage: `url(${pharmaceuticalHero})`
      }}
    >
      {/* Simplified overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <SEO 
        title="Contact Us - StreetCredRx" 
        description="Get in touch with our pharmacy credentialing experts. We're here to help you navigate the provider enrollment process."
        canonicalPath="/contact"
      />
      <Navbar />
      
      <div className="pt-24 pb-16 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 md:p-12 shadow-xl text-white">
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-brand-primary text-center"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              Contact Us
            </h1>
            <p 
              className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-center opacity-90"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              Have questions about our credentialing services or ready to get started? 
              Contact our team today and we'll help you navigate the path to provider status.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium">Your Name</label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium">Email Address</label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium">Phone Number (Optional)</label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium">Message</label>
                <Textarea 
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-brand-primary text-black px-8 py-6 rounded-full font-medium hover:bg-brand-primary/90 transition-colors w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
