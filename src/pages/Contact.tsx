
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

const Contact = () => {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen" style={{ 
      backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('/lovable-uploads/be98bba8-f7a4-4c5b-862a-41b0e9468e67.png')", 
      backgroundSize: "cover", 
      backgroundPosition: "center"
    }}>
      <SEO 
        title="Contact Us - StreetCredRX" 
        description="Get in touch with our pharmacy credentialing experts. We're here to help you navigate the provider enrollment process."
        canonicalPath="/contact"
      />
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 md:p-12 shadow-xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-brand-primary text-center">Contact Us</h1>
            <p className="text-xl mb-8 text-center opacity-90">
              Have questions about our credentialing services or ready to get started? 
              Contact our team today and we'll help you navigate the path to provider status.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label htmlFor="phone" className="block mb-2 text-sm font-medium">Phone Number</label>
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
