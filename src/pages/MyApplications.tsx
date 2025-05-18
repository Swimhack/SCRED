
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

interface Application {
  id: string;
  name: string;
  status: "In Progress" | "Pending" | "Completed" | "Rejected";
  submitted: string;
  type: string;
}

const MyApplications = () => {
  const [applications] = useState<Application[]>([
    {
      id: "1",
      name: "Medicare Provider Enrollment",
      status: "In Progress",
      submitted: "May 15, 2025",
      type: "Provider Enrollment",
    },
    {
      id: "2",
      name: "Blue Cross Credentialing",
      status: "Pending",
      submitted: "May 10, 2025",
      type: "Commercial Insurance",
    },
    {
      id: "3",
      name: "State Medicaid Enrollment",
      status: "Completed",
      submitted: "Apr 25, 2025",
      type: "Medicaid Provider",
    },
  ]);

  const handleViewApplication = (id: string, name: string) => {
    toast({
      title: "Application Details",
      description: `Viewing ${name} (ID: ${id})`,
      duration: 3000,
    });
    // In a real app, this would navigate to the application details page with the specific ID
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title="My Pharmacy Enrollment Applications" 
        description="Track and manage your pharmacy credentialing applications. Submit new applications and monitor pending approvals."
        canonicalPath="/my-applications"
      />
      <h1 className="text-2xl font-semibold mb-6">My Applications</h1>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Applications</h2>
          <Link to="/pharmacist-form">
            <Button className="bg-brand-primary text-gray-900 hover:bg-yellow-300 transition-colors">
              New Application
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>APPLICATION</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>SUBMITTED</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>{app.submitted}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="text-blue-600 hover:underline p-0"
                        onClick={() => handleViewApplication(app.id, app.name)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
