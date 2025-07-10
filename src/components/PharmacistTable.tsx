import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { usePharmacistApplications, PharmacistWithDocuments } from "@/hooks/usePharmacistApplications";
import PharmacistDetailModal from "./PharmacistDetailModal";

interface PharmacistTableProps {
  filterStatus?: "In Progress" | "Pending" | "Completed" | "Expiring Soon" | "Rejected";
}

const PharmacistTable = ({ filterStatus }: PharmacistTableProps) => {
  const { 
    applications, 
    loading, 
    error, 
    getApplicationsByStatus, 
    updateApplicationStatus, 
    addNote,
    mapStatus 
  } = usePharmacistApplications();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPharmacist, setSelectedPharmacist] = useState<PharmacistWithDocuments | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const itemsPerPage = 8;

  // Get filtered applications based on status
  const allApplications = getApplicationsByStatus(filterStatus);
  
  // Pagination logic
  const totalPages = Math.ceil(allApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = allApplications.slice(startIndex, endIndex);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewPharmacist = (application: PharmacistWithDocuments) => {
    setSelectedPharmacist(application);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (application: PharmacistWithDocuments) => {
    setSelectedPharmacist(application);
    setIsDetailModalOpen(true);
    // Focus on documents tab when modal opens
    setTimeout(() => {
      const documentsTab = document.querySelector('[data-tab="documents"]') as HTMLElement;
      documentsTab?.click();
    }, 100);
  };

  const getFullName = (application: PharmacistWithDocuments) => {
    const parts = [application.first_name, application.middle_name, application.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Unknown";
  };

  const getAvatar = (application: PharmacistWithDocuments) => {
    const name = getFullName(application);
    if (name === "Unknown") return "?";
    const nameParts = name.split(" ");
    return nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name[0];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading pharmacist applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 text-center">
          <p className="text-red-600">Error loading applications: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {filterStatus ? `${filterStatus} Pharmacists` : 'All Pharmacists'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {allApplications.length} total {filterStatus ? filterStatus.toLowerCase() : ''} applications
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
            {currentApplications.length > 0 ? (
              currentApplications.map((application) => (
                <tr key={application.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center text-sm font-semibold text-brand-primary border">
                        {getAvatar(application)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{getFullName(application)}</div>
                        {application.email && (
                          <div className="text-sm text-muted-foreground">{application.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={mapStatus(application.status)} />
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {application.submitted_at 
                      ? new Date(application.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "Not submitted"
                    }
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium">{application.state_license_number || "N/A"}</div>
                      {application.npi_number && (
                        <div className="text-muted-foreground">NPI: {application.npi_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        onClick={() => handleViewPharmacist(application)}
                      >
                        View
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button 
                        className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        onClick={() => handleViewDocument(application)}
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
                  No applications found{filterStatus ? ` with ${filterStatus} status` : ''}.
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
            Showing {startIndex + 1}-{Math.min(endIndex, allApplications.length)} of {allApplications.length} results
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

      {/* Pharmacist Detail Modal */}
      <PharmacistDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPharmacist(null);
        }}
        pharmacist={selectedPharmacist}
        onStatusUpdate={updateApplicationStatus}
        onAddNote={addNote}
      />
    </div>
  );
};

export default PharmacistTable;