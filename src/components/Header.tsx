
import { Bell, Search, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-200 w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="font-medium">John Smith</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <User size={20} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
