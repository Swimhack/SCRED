import { cn } from "@/lib/utils";

interface BrandIconProps {
  variant: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeConfig = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

const colorConfig = {
  primary: "#FF6B6B", // Coral red - primary brand
  secondary: "#8B5CF6", // Purple - secondary actions
  neutral: "#6B7280", // Gray - neutral/disabled states
  success: "#10B981", // Green - success/completed
  warning: "#F59E0B", // Yellow - warnings/pending
  error: "#EF4444" // Red - errors/expired
};

const BrandIcon = ({ variant, size = "md", className }: BrandIconProps) => {
  const color = colorConfig[variant];
  
  return (
    <div className={cn(sizeConfig[size], className)}>
      <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer U-shaped capsule */}
        <path
          d="M8 12 C8 8, 12 6, 20 6 C28 6, 32 8, 32 12 L32 28 C32 32, 28 34, 20 34 C12 34, 8 32, 8 28 Z"
          stroke={color}
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
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Vertical line */}
          <line
            x1="0"
            y1="-6"
            x2="0"
            y2="6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Diagonal lines for star effect */}
          <line
            x1="-4"
            y1="-4"
            x2="4"
            y2="4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="-4"
            y1="4"
            x2="4"
            y2="-4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default BrandIcon;