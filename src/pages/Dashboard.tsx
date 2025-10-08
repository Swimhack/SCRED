
/**
 * Dashboard Component
 * Displays admin or pharmacist dashboard with live timestamp footer
 * Last updated: 2025-01-08 - Added timestamp footer in CST timezone
 */
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
import featureFlags from "@/lib/featureFlags";

const Dashboard = () => {
  const { userRole, profile } = useAuth();
  const { statistics } = usePharmacistData();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // This would be replaced with actual data from Supabase
  useEffect(() => {
    // Simulating fetch of recent activity
    setRecentActivity([
      { date: "May 18, 2025", action: "License updated", status: "Completed" },
      { date: "May 15, 2025", action: "Insurance verification", status: "Pending" },
      { date: "May 10, 2025", action: "Application submitted", status: "In Progress" },
    ]);
    setLastUpdated(new Date());
  }, []);

  // Update timestamp when statistics change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [statistics]);

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
            bgColor="bg-brand-yellow"
            variant="primary"
          />
        </Link>
        <Link to="/pending">
          <StatCard 
            title="Pending Requests" 
            value={statistics.pending}
            bgColor="bg-brand-blue"
            variant="warning"
          />
        </Link>
        <Link to="/completed">
          <StatCard 
            title="Completed" 
            value={statistics.completed}
            bgColor="bg-brand-green"
            variant="success"
          />
        </Link>
        <Link to="/expiring">
          <StatCard 
            title="Expiring Soon" 
            value={statistics.expiring}
            bgColor="bg-brand-red"
            variant="error"
          />
        </Link>
      </div>
      
      {/* Show full table in Enterprise mode, simplified view in MVP */}
      {featureFlags.features.dashboard.advancedAnalytics ? (
        <PharmacistTable />
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <p className="text-sm text-gray-500 mt-1">
              {featureFlags.isMvp ? "MVP Mode - Basic view" : "Recent pharmacist applications"}
            </p>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>Click on the stat cards above to view detailed lists</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/pending">
                  <Button variant="outline" className="w-full">
                    View Pending Applications
                  </Button>
                </Link>
                <Link to="/pharmacists">
                  <Button variant="outline" className="w-full">
                    View All Pharmacists
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  const PharmacistDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Link to="/my-credentials">
          <StatCard 
            title="Active Credentials" 
            value="3" 
            bgColor="bg-brand-green"
            variant="success"
          />
        </Link>
        <Link to="/my-applications">
          <StatCard 
            title="Pending Applications" 
            value="1" 
            bgColor="bg-brand-blue"
            variant="warning"
          />
        </Link>
        <Link to="/my-expiring">
          <StatCard 
            title="Expiring Soon" 
            value="1" 
            bgColor="bg-brand-red"
            variant="error"
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

  // Format timestamp in CST
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase() + ' cst';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <SEO 
        title={featureFlags.hasRole(userRole || "", "admin") ? "Admin Dashboard - StreetCredRx" : "Provider Dashboard - StreetCredRx"}
        description={featureFlags.hasRole(userRole || "", "admin") 
          ? "Manage pharmacy credentialing applications and track enrollment statuses across your organization." 
          : "Monitor your pharmacy credentials, track application status, and manage upcoming renewals."}
        canonicalPath="/dashboard"
      />
      <h1 className="text-2xl font-semibold mb-6">
        {featureFlags.hasRole(userRole || "", "admin") ? "Admin Dashboard" : "My Dashboard"}
        {featureFlags.isMvp && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">MVP Mode</span>}
      </h1>
      
      <div className="flex-1">
        {featureFlags.hasRole(userRole || "", "admin") ? <AdminDashboard /> : <PharmacistDashboard />}
      </div>
      
      {/* Discreet footer with last updated timestamp */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-right">
          Last updated: {formatTimestamp(lastUpdated)}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
