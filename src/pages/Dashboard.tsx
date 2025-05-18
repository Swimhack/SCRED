
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import PharmacistTable from "@/components/PharmacistTable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { userRole, profile } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);

  // This would be replaced with actual data from Supabase
  useEffect(() => {
    // Simulating fetch of recent activity
    setRecentActivity([
      { date: "May 18, 2025", action: "License updated", status: "Completed" },
      { date: "May 15, 2025", action: "Insurance verification", status: "Pending" },
      { date: "May 10, 2025", action: "Application submitted", status: "In Progress" },
    ]);
  }, []);

  const AdminDashboard = () => (
    <>
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
    </>
  );
  
  const PharmacistDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Active Credentials" 
          value="3" 
          icon={<CheckCircle size={24} className="text-gray-700" />} 
          bgColor="bg-brand-green"
        />
        <StatCard 
          title="Pending Applications" 
          value="1" 
          icon={<Clock size={24} className="text-gray-700" />} 
          bgColor="bg-brand-blue"
        />
        <StatCard 
          title="Expiring Soon" 
          value="1" 
          icon={<AlertTriangle size={24} className="text-gray-700" />} 
          bgColor="bg-brand-red"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="divide-y">
              {recentActivity.map((activity, index) => (
                <div key={index} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      activity.status === "Completed" ? "bg-green-100 text-green-800" : 
                      activity.status === "Pending" ? "bg-blue-100 text-blue-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link to="/pharmacist-form">
              <Button className="w-full">Submit New Application</Button>
            </Link>
            <Link to="/my-credentials">
              <Button variant="outline" className="w-full">View My Credentials</Button>
            </Link>
            <Link to="/my-expiring">
              <Button variant="outline" className="w-full">Check Expiring Credentials</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">
        {userRole === "admin" ? "Admin Dashboard" : "My Dashboard"}
      </h1>
      
      {userRole === "admin" ? <AdminDashboard /> : <PharmacistDashboard />}
    </div>
  );
};

export default Dashboard;
