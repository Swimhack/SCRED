
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import PharmacistTable from "@/components/PharmacistTable";

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Pharmacist Credentialing Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Pharmacists" 
          value="1,584" 
          icon={<Users size={24} className="text-gray-700" />} 
          bgColor="bg-brand-yellow"
        />
        <StatCard 
          title="Pending Requests" 
          value="42" 
          icon={<Clock size={24} className="text-gray-700" />} 
          bgColor="bg-brand-blue"
        />
        <StatCard 
          title="Completed" 
          value="1,387" 
          icon={<CheckCircle size={24} className="text-gray-700" />} 
          bgColor="bg-brand-green"
        />
        <StatCard 
          title="Expiring Soon" 
          value="23" 
          icon={<AlertTriangle size={24} className="text-gray-700" />} 
          bgColor="bg-brand-red"
        />
      </div>
      
      <PharmacistTable />
    </div>
  );
};

export default Dashboard;
