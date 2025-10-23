
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import streetCredIcon from "@/assets/streetcredrx-icon.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);
  
  return (
    <nav className="navbar absolute top-0 left-0 right-0 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 relative z-10">
            <img 
              src={streetCredIcon} 
              alt="StreetCredRX Icon" 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            />
            <span className="tracking-tight">StreetCredRX</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8 relative z-10">
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="text-white hover:text-brand-maize transition-colors">Home</Link>
              <Link to="/about" className="text-white hover:text-brand-maize transition-colors">About</Link>
              <Link to="/service" className="text-white hover:text-brand-maize transition-colors">Service</Link>
              <Link to="/contact" className="text-white hover:text-brand-maize transition-colors">Contact</Link>
            </div>
            
            <Link to="/auth" className="bg-brand-maize text-black px-6 py-2 rounded-full font-medium hover:bg-brand-maize/90 transition-colors">
              Log In
            </Link>
          </div>
          
          <button 
            className="md:hidden text-white p-2 relative z-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div ref={menuRef} className="mobile-menu md:hidden bg-gray-900/95 backdrop-blur-sm mt-2">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link to="/" className="text-white py-2 hover:text-brand-maize transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className="text-white py-2 hover:text-brand-maize transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/service" className="text-white py-2 hover:text-brand-maize transition-colors" onClick={() => setIsMenuOpen(false)}>Service</Link>
            <Link to="/contact" className="text-white py-2 hover:text-brand-maize transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link to="/auth" className="bg-brand-maize text-black py-2 px-4 rounded-lg text-center mt-2 hover:bg-brand-maize/90 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Log In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
