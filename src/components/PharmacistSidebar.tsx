
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Home, Users, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, MessageSquare, Code, FileText, Mail, ClipboardList, Building2, Award, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getNavigationItems } from "@/lib/featureFlags";
import featureFlags from "@/lib/featureFlags";

const PharmacistSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [activePath, setActivePath] = useState("/dashboard");
  const { userRole } = useAuth();

  // Define icon mapping for navigation items
  const iconMap = {
    Home,
    Users,
    Clock,
    CheckCircle,
    AlertCircle: AlertTriangle,
    FileText,
    Award,
    MessageSquare,
    Settings,
    Mail,
    ClipboardList,
    Building2,
  };

  // Get menu items from feature flags based on user role
  const navigationItems = getNavigationItems(userRole || 'pharmacist');
  
  // Convert navigation items to include icons
  const menuItems = navigationItems.map(item => ({
    icon: iconMap[item.icon as keyof typeof iconMap] || FileText,
    label: item.name,
    path: item.path
  }));

  // Update active path based on current location
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  return (
    <div className={cn(
      "h-screen bg-white border-r transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {!collapsed && <h2 className="font-bold text-xl">StreetCredRx</h2>}
          {collapsed && <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">S</div>}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <div className="flex flex-col p-3 gap-1 flex-1">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100",
              activePath === item.path ? "bg-gray-100 text-black font-medium" : "text-gray-600"
            )}
            onClick={() => setActivePath(item.path)}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            StreetCredRx {featureFlags.isMvp ? "MVP" : "Enterprise"} v1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistSidebar;
