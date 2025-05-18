
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor: string;
}

const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border flex items-center gap-4">
      <div className={cn("p-3 rounded-lg", bgColor)}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
