
import { cn } from "@/lib/utils";

type StatusType = "In Progress" | "Pending" | "Completed" | "Rejected" | "Expiring Soon";

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-status-blue";
      case "Pending":
        return "bg-yellow-100 text-status-yellow";
      case "Completed":
        return "bg-green-100 text-status-green";
      case "Rejected":
        return "bg-red-100 text-status-red";
      case "Expiring Soon":
        return "bg-red-100 text-status-red";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium inline-block",
      getStatusColor(status)
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
