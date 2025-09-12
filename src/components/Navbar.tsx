
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png" 
              alt="StreetCredRX" 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            StreetCredRX
          </Link>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="text-white hover:text-brand-primary transition-colors">Home</Link>
              <Link to="/about" className="text-white hover:text-brand-primary transition-colors">About</Link>
              <Link to="/service" className="text-white hover:text-brand-primary transition-colors">Service</Link>
              <Link to="/contact" className="text-white hover:text-brand-primary transition-colors">Contact</Link>
            </div>
            
            <Link to="/auth" className="bg-brand-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-brand-primary/90 transition-colors">
              Log In
            </Link>
          </div>
          
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 mt-2">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link to="/" className="text-white py-2 hover:text-brand-primary">Home</Link>
            <Link to="/about" className="text-white py-2 hover:text-brand-primary">About</Link>
            <Link to="/service" className="text-white py-2 hover:text-brand-primary">Service</Link>
            <Link to="/contact" className="text-white py-2 hover:text-brand-primary">Contact</Link>
            <Link to="/auth" className="bg-brand-primary text-primary-foreground py-2 px-4 rounded-lg text-center mt-2">
              Log In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
