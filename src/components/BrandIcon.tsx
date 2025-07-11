import { cn } from "@/lib/utils";

interface BrandIconProps {
  variant: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const iconConfig = {
  primary: "/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png", // Yellow - primary brand
  secondary: "/lovable-uploads/517e0393-12e2-4056-97f3-f6bb9d1c74ea.png", // Light purple - secondary actions
  neutral: "/lovable-uploads/b02a3c85-c32f-4cac-98f6-ff8e9ebdf96c.png", // Gray - neutral/disabled states
  success: "/lovable-uploads/0b3034dd-3f18-4e5e-89c5-26313d170f2f.png", // Purple - success/completed
  warning: "/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png", // Yellow - warnings/pending
  error: "/lovable-uploads/31952335-a3f3-4c7c-8ca7-c429b6c2605b.png" // Coral - errors/expired
};

const sizeConfig = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

const BrandIcon = ({ variant, size = "md", className }: BrandIconProps) => {
  return (
    <img 
      src={iconConfig[variant]}
      alt="StreetCredRx Icon"
      className={cn(sizeConfig[size], className)}
    />
  );
};

export default BrandIcon;