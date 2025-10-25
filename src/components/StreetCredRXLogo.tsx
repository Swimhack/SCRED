import React from 'react';

interface StreetCredRXLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StreetCredRXLogo: React.FC<StreetCredRXLogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl md:text-2xl',
    lg: 'text-xl sm:text-2xl md:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Logo Icon - Coral Red StreetCredRX Symbol */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 40 40" 
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer U-shaped capsule */}
          <path
            d="M8 12 C8 8, 12 6, 20 6 C28 6, 32 8, 32 12 L32 28 C32 32, 28 34, 20 34 C12 34, 8 32, 8 28 Z"
            stroke="#FF6B6B"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Inner star/cross symbol */}
          <g transform="translate(20, 20)">
            {/* Horizontal line */}
            <line
              x1="-6"
              y1="0"
              x2="6"
              y2="0"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Vertical line */}
            <line
              x1="0"
              y1="-6"
              x2="0"
              y2="6"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Diagonal lines for star effect */}
            <line
              x1="-4"
              y1="-4"
              x2="4"
              y2="4"
              stroke="#FF6B6B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="4"
              x2="4"
              y2="-4"
              stroke="#FF6B6B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`font-bold tracking-tight text-[#FF6B6B] ${textSizeClasses[size]}`}>
          StreetCredRX
        </span>
      )}
    </div>
  );
};

export default StreetCredRXLogo;
