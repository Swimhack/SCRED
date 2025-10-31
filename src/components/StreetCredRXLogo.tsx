import React from 'react';

interface StreetCredRXLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean; // accepted for compatibility; logo always renders image only
}

const StreetCredRXLogo: React.FC<StreetCredRXLogoProps> = ({ 
  className = '', 
  size = 'md'
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/streetcredrx-logo.png" 
        alt="StreetCredRX Logo" 
        className={`${heightClasses[size]} w-auto`}
      />
    </div>
  );
};

export default StreetCredRXLogo;
