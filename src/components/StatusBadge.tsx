import { cn } from "@/lib/utils";

type StatusType = "In Progress" | "Pending" | "Completed" | "Rejected" | "Expiring Soon";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  "In Progress": {
    className: "bg-blue-100 text-status-blue",
    icon: "/lovable-uploads/517e0393-12e2-4056-97f3-f6bb9d1c74ea.png"
  },
  "Pending": {
    className: "bg-yellow-100 text-status-yellow",
    icon: "/lovable-uploads/d1013e83-9484-495e-880b-68ab1888a169.png"
  },
  "Completed": {
    className: "bg-green-100 text-status-green",
    icon: "/lovable-uploads/0b3034dd-3f18-4e5e-89c5-26313d170f2f.png"
  },
  "Rejected": {
    className: "bg-red-100 text-status-red",
    icon: "/lovable-uploads/31952335-a3f3-4c7c-8ca7-c429b6c2605b.png"
  },
  "Expiring Soon": {
    className: "bg-red-100 text-status-red",
    icon: "/lovable-uploads/31952335-a3f3-4c7c-8ca7-c429b6c2605b.png"
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      <img src={config.icon} alt="" className="w-3 h-3" />
      {status}
    </span>
  );
};

export default StatusBadge;