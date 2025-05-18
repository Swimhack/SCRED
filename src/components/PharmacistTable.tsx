
import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface Pharmacist {
  id: string;
  name: string;
  status: "In Progress" | "Pending" | "Completed" | "Expiring Soon";
  submitted: string;
  avatar: string;
}

interface PharmacistTableProps {
  filterStatus?: "In Progress" | "Pending" | "Completed" | "Expiring Soon";
}

const pharmacists: Pharmacist[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    status: "In Progress",
    submitted: "May 15, 2025",
    avatar: "SJ",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    status: "Completed",
    submitted: "May 12, 2025",
    avatar: "MC",
  },
  {
    id: "3",
    name: "Dr. Jessica Smith",
    status: "Pending",
    submitted: "May 10, 2025",
    avatar: "JS",
  },
  {
    id: "4",
    name: "Dr. Robert Williams",
    status: "Expiring Soon",
    submitted: "May 5, 2025",
    avatar: "RW",
  },
  {
    id: "5",
    name: "Dr. Emily Parker",
    status: "Completed",
    submitted: "May 1, 2025",
    avatar: "EP",
  },
  {
    id: "6",
    name: "Dr. David Lee",
    status: "Completed",
    submitted: "Apr 28, 2025",
    avatar: "DL",
  },
  {
    id: "7",
    name: "Dr. Lisa Wong",
    status: "In Progress",
    submitted: "Apr 25, 2025",
    avatar: "LW",
  },
  {
    id: "8",
    name: "Dr. James Taylor",
    status: "Pending",
    submitted: "Apr 20, 2025",
    avatar: "JT",
  },
];

const PharmacistTable = ({ filterStatus }: PharmacistTableProps) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page
  
  // Filter pharmacists based on the provided status if any
  const filteredPharmacists = filterStatus
    ? pharmacists.filter(pharmacist => pharmacist.status === filterStatus)
    : pharmacists;
    
  // Calculate total pages
  const totalPages = Math.ceil(filteredPharmacists.length / itemsPerPage);
  
  // Get current pharmacists
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPharmacists = filteredPharmacists.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const handleViewDocument = (pharmacistId: string, name: string) => {
    toast({
      title: "Document Viewer",
      description: `Opening documents for ${name}`,
      duration: 3000,
    });
    // In a real app, this would open the document viewer or download the document
  };
  
  const handleEditPharmacist = (pharmacistId: string, name: string) => {
    toast({
      title: "Edit Pharmacist",
      description: `Editing profile for ${name}`,
      duration: 3000,
    });
    // In a real app, this would open the edit form
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">
          {filterStatus ? `${filterStatus} Pharmacist Applications` : "Recent Pharmacist Applications"}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-500 border-b">
              <th className="px-6 py-3">NAME</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">SUBMITTED</th>
              <th className="px-6 py-3">DOCUMENT</th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentPharmacists.length > 0 ? (
              currentPharmacists.map((pharmacist) => (
                <tr key={pharmacist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {pharmacist.avatar}
                      </div>
                      <span className="font-medium">{pharmacist.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pharmacist.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pharmacist.submitted}</td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-blue-600 hover:underline"
                      onClick={() => handleViewDocument(pharmacist.id, pharmacist.name)}
                    >
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-gray-600 hover:bg-gray-100 p-2 rounded"
                      onClick={() => handleEditPharmacist(pharmacist.id, pharmacist.name)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No pharmacists found with {filterStatus} status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Showing {currentPharmacists.length} of {filteredPharmacists.length} records
        </span>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 border rounded hover:bg-gray-50"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button 
              key={number}
              onClick={() => paginate(number)}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                currentPage === number 
                  ? "bg-brand-primary font-medium" 
                  : "hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          ))}
          
          <button 
            className="p-2 border rounded hover:bg-gray-50"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacistTable;
