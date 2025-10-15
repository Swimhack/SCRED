# Original Homepage Components - Complete Dependency Backup

**Backup Date:** 2025-09-12
**Purpose:** Complete preservation of all homepage component dependencies for perfect restoration

## Component Dependency Tree
```
Index.tsx
├── @/components/Navbar
├── @/components/HeroSection  
└── @/components/SEO
```

---

## 1. Navbar Component

**File Path:** `src/components/Navbar.tsx`
**Line Count:** 62 lines
**Dependencies:** react-router-dom, lucide-react, useState hook

```tsx
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
```

**Key Features:**
- Responsive navigation with mobile hamburger menu
- Logo integration with image asset
- Navigation links: Home, About, Service, Contact, Auth
- Brand primary color usage
- Z-index layering for proper display over hero

---

## 2. HeroSection Component

**File Path:** `src/components/HeroSection.tsx`
**Line Count:** 93 lines
**Dependencies:** lucide-react, react-router-dom, pharmaceutical background image

```tsx
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import pharmaceuticalHero from "@/assets/pharmaceutical-lab-hero.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${pharmaceuticalHero})`
      }}
    >
      {/* Simplified overlay for better text contrast */}
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
            Provider Credentialing &<br />Enrollment Services
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
            Pharmacists in certain states can now bill insurance companies for their 
            services, but before they can do so, they must complete a complex 
            credentialing process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link to="/contact" className="bg-brand-primary text-black px-8 py-3 rounded-full font-medium hover:bg-brand-primary/90 transition-all duration-300 inline-block text-center">
              Contact Us
            </Link>
            <Link to="/auth" className="bg-transparent border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-full font-medium hover:bg-brand-primary hover:text-black transition-all duration-300 inline-block text-center">
              Log In
            </Link>
          </div>
          
          <div className="mt-16">
            <p className="mb-4 text-sm opacity-90">Satisfied Clients</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2 sm:-space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  DR
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  SM
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  JL
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-white bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  +50
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-xl sm:text-2xl">4.9</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="sm:w-5 sm:h-5 text-brand-primary fill-brand-primary" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm opacity-90 ml-1">(150+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

**Key Features:**
- Full-screen hero section with background image
- Custom typography with anti-aliasing optimizations
- Call-to-action buttons with brand styling
- Client testimonials with avatar placeholders
- Star ratings with filled stars
- Responsive design with mobile breakpoints

---

## 3. SEO Component

**File Path:** `src/components/SEO.tsx`
**Line Count:** 28 lines
**Dependencies:** react-helmet-async

```tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
}

const SEO = ({ 
  title = 'StreetCredRx - Pharmacy Credentialing & Enrollment Services', 
  description = 'Streamline your pharmacy credentialing process with StreetCredRx. We help pharmacists navigate complex provider enrollment and credentialing requirements.',
  canonicalPath = ''
}: SEOProps) => {
  const siteUrl = 'https://streetcredrx.com';
  const fullTitle = title.includes('StreetCredRx') ? title : `${title} | StreetCredRx`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalPath && <link rel="canonical" href={`${siteUrl}${canonicalPath}`} />}
    </Helmet>
  );
};

export default SEO;
```

**Key Features:**
- TypeScript interface for props
- Automatic title formatting
- Meta description handling
- Canonical URL generation
- Default values for all props

---

## Required Assets

### Images
1. **Logo:** `public/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png`
   - Used in Navbar component
   - Responsive sizing: w-8 h-8 sm:w-10 sm:h-10

2. **Hero Background:** `src/assets/pharmaceutical-lab-hero.jpg`
   - Used in HeroSection component
   - Full-screen background with cover positioning

### External Dependencies
- `react-router-dom` - Navigation and routing
- `lucide-react` - Icon library (Menu, Star icons)
- `react-helmet-async` - SEO meta tag management

---

## Styling Dependencies

### Tailwind Configuration
Key brand colors used throughout components:
- `--brand-primary: 45 100% 50%` (Yellow/Gold primary color)
- `--primary-foreground` for text contrast
- Custom responsive breakpoints and container settings

### Custom CSS (from index.css)
- Responsive overflow fixes
- Container max-width constraints
- Mobile-specific adjustments
- CSS custom properties for colors

---

## Restoration Checklist

To fully restore the original homepage:

1. **✓ Component Files**
   - Restore `src/pages/Index.tsx`
   - Restore `src/components/Navbar.tsx`
   - Restore `src/components/HeroSection.tsx`
   - Restore `src/components/SEO.tsx`

2. **✓ Asset Files**
   - Verify `public/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png` exists
   - Verify `src/assets/pharmaceutical-lab-hero.jpg` exists

3. **✓ Dependencies**
   - Install `react-router-dom`
   - Install `lucide-react`
   - Install `react-helmet-async`

4. **✓ Configuration**
   - Maintain `tailwind.config.ts` brand color setup
   - Keep `src/index.css` custom styles
   - Preserve routing configuration

5. **✓ Testing**
   - Test responsive navigation
   - Verify image loading
   - Check SEO meta tags
   - Validate all navigation links

**CRITICAL:** This backup captures the complete state of all homepage dependencies. Every line of code, import statement, and asset reference is preserved for perfect restoration capability.