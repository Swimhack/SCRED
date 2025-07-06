
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import PharmacistTable from "@/components/PharmacistTable";
import { useAuth } from "@/hooks/useAuth";
import { usePharmacistData } from "@/hooks/usePharmacistData";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

const Dashboard = () => {
  const { userRole, profile } = useAuth();
  const { statistics } = usePharmacistData();
  const navigate = useNavigate();
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

  const handleNewApplication = () => {
    toast({
      title: "New Application",
      description: "Starting a new application form",
      duration: 3000,
    });
    navigate("/pharmacist-form");
  };

  const handleViewCredentials = () => {
    toast({
      title: "My Credentials",
      description: "Navigating to your credentials",
      duration: 3000,
    });
    navigate("/my-credentials");
  };

  const handleCheckExpiring = () => {
    toast({
      title: "Expiring Credentials",
      description: "Checking your expiring credentials",
      duration: 3000,
    });
    navigate("/my-expiring");
  };

  const AdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Link to="/pharmacists">
          <StatCard 
            title="Total Pharmacists" 
            value={statistics.total}
            icon={<Users size={24} className="text-gray-700" />} 
            bgColor="bg-brand-yellow"
          />
        </Link>
        <Link to="/pending">
          <StatCard 
            title="Pending Requests" 
            value={statistics.pending}
            icon={<Clock size={24} className="text-gray-700" />} 
            bgColor="bg-brand-blue"
          />
        </Link>
        <Link to="/completed">
          <StatCard 
            title="Completed" 
            value={statistics.completed}
            icon={<CheckCircle size={24} className="text-gray-700" />} 
            bgColor="bg-brand-green"
          />
        </Link>
        <Link to="/expiring">
          <StatCard 
            title="Expiring Soon" 
            value={statistics.expiring}
            icon={<AlertTriangle size={24} className="text-gray-700" />} 
            bgColor="bg-brand-red"
          />
        </Link>
      </div>
      
      <PharmacistTable />
    </>
  );
  
  const PharmacistDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Link to="/my-credentials">
          <StatCard 
            title="Active Credentials" 
            value="3" 
            icon={<CheckCircle size={24} className="text-gray-700" />} 
            bgColor="bg-brand-green"
          />
        </Link>
        <Link to="/my-applications">
          <StatCard 
            title="Pending Applications" 
            value="1" 
            icon={<Clock size={24} className="text-gray-700" />} 
            bgColor="bg-brand-blue"
          />
        </Link>
        <Link to="/my-expiring">
          <StatCard 
            title="Expiring Soon" 
            value="1" 
            icon={<AlertTriangle size={24} className="text-gray-700" />} 
            bgColor="bg-brand-red"
          />
        </Link>
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
            <Button className="w-full" onClick={handleNewApplication}>
              Submit New Application
            </Button>
            <Button variant="outline" className="w-full" onClick={handleViewCredentials}>
              View My Credentials
            </Button>
            <Button variant="outline" className="w-full" onClick={handleCheckExpiring}>
              Check Expiring Credentials
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title={userRole === "super_admin" ? "Admin Dashboard - StreetCredRX" : "Provider Dashboard - StreetCredRX"}
        description={userRole === "super_admin" 
          ? "Manage pharmacy credentialing applications and track enrollment statuses across your organization." 
          : "Monitor your pharmacy credentials, track application status, and manage upcoming renewals."}
        canonicalPath="/dashboard"
      />
      <h1 className="text-2xl font-semibold mb-6">
        {userRole === "super_admin" ? "Admin Dashboard" : "My Dashboard"}
      </h1>
      
      {userRole === "super_admin" ? <AdminDashboard /> : <PharmacistDashboard />}
    </div>
  );
};

export default Dashboard;
