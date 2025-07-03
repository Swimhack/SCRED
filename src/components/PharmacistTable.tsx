import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { usePharmacistData, Pharmacist } from "@/hooks/usePharmacistData";

interface PharmacistTableProps {
  filterStatus?: Pharmacist["status"];
}

const PharmacistTable = ({ filterStatus }: PharmacistTableProps) => {
  const { getPharmacistsByStatus, updatePharmacistStatus } = usePharmacistData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get filtered pharmacists based on status
  const allPharmacists = getPharmacistsByStatus(filterStatus);
  
  // Pagination logic
  const totalPages = Math.ceil(allPharmacists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPharmacists = allPharmacists.slice(startIndex, endIndex);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewPharmacist = (pharmacist: Pharmacist) => {
    toast({
      title: "Pharmacist Details",
      description: `Viewing profile for ${pharmacist.name}`,
      duration: 3000,
    });
  };

  const handleStatusChange = (pharmacistId: string, newStatus: Pharmacist["status"]) => {
    updatePharmacistStatus(pharmacistId, newStatus);
    toast({
      title: "Status Updated",
      description: `Pharmacist status changed to ${newStatus}`,
      duration: 3000,
    });
  };

  const handleViewDocument = (pharmacist: Pharmacist) => {
    toast({
      title: "Document Access",
      description: `Opening documents for ${pharmacist.name}`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {filterStatus ? `${filterStatus} Pharmacists` : 'All Pharmacists'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {allPharmacists.length} total {filterStatus ? filterStatus.toLowerCase() : ''} pharmacists
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground">PHARMACIST</th>
              <th className="text-left p-4 font-medium text-muted-foreground">STATUS</th>
              <th className="text-left p-4 font-medium text-muted-foreground">SUBMITTED</th>
              <th className="text-left p-4 font-medium text-muted-foreground">LICENSE</th>
              <th className="text-left p-4 font-medium text-muted-foreground">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentPharmacists.length > 0 ? (
              currentPharmacists.map((pharmacist) => (
                <tr key={pharmacist.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center text-sm font-semibold text-brand-primary border">
                        {pharmacist.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{pharmacist.name}</div>
                        {pharmacist.email && (
                          <div className="text-sm text-muted-foreground">{pharmacist.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={pharmacist.status} />
                  </td>
                  <td className="p-4 text-muted-foreground">{pharmacist.submitted}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium">{pharmacist.license || "N/A"}</div>
                      {pharmacist.npi && (
                        <div className="text-muted-foreground">NPI: {pharmacist.npi}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        onClick={() => handleViewPharmacist(pharmacist)}
                      >
                        View
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button 
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        onClick={() => handleViewDocument(pharmacist)}
                      >
                        Documents
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No pharmacists found{filterStatus ? ` with ${filterStatus} status` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, allPharmacists.length)} of {allPharmacists.length} results
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 border rounded hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <button 
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                    currentPage === pageNumber 
                      ? "bg-brand-primary text-primary-foreground font-medium shadow-sm" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              className="p-2 border rounded hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistTable;