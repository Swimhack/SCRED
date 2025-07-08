
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import BrandIcon from "./BrandIcon";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  bgColor: string;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
}

const StatCard = ({ title, value, icon, bgColor, className, onClick, variant = "primary" }: StatCardProps) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg p-6 shadow-sm border flex items-center gap-4 transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-105 transform",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className={cn("p-3 rounded-lg flex items-center justify-center", bgColor)}>
        {icon || <BrandIcon variant={variant} size="md" />}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
