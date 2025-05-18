import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  expires: string;
  status: "Active" | "Expiring Soon" | "Expired";
}

const MyCredentials = () => {
  const navigate = useNavigate();
  const [credentials] = useState<Credential[]>([
    {
      id: "1",
      name: "Medicare Provider Number",
      issuer: "CMS",
      issued: "Jan 15, 2025",
      expires: "Jan 15, 2026",
      status: "Active",
    },
    {
      id: "2",
      name: "Blue Cross Contract",
      issuer: "BCBS",
      issued: "Mar 10, 2025",
      expires: "Jun 10, 2025",
      status: "Expiring Soon",
    },
    {
      id: "3",
      name: "State Medicaid ID",
      issuer: "State Medicaid",
      issued: "Dec 1, 2024",
      expires: "Dec 1, 2025",
      status: "Active",
    },
  ]);

  const handleRenewCredential = () => {
    toast({
      title: "New Credential Form",
      description: "Starting a new credential application form.",
      duration: 3000,
    });
    navigate("/pharmacist-form");
  };
  
  const handleViewCredential = (id: string, name: string) => {
    toast({
      title: "Credential Details",
      description: `Viewing details for ${name}`,
      duration: 3000,
    });
    // In a real app, this would navigate to the credential details page with the specific ID
    navigate(`/pharmacist-form?id=${id}&view=true&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title="My Pharmacy Credentials Dashboard" 
        description="View and manage your active pharmacy credentials. Track expiration dates and renew your provider credentials."
        canonicalPath="/my-credentials"
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Credentials</h1>
        <Button 
          variant="default" 
          className="bg-brand-primary text-gray-900 hover:bg-yellow-300"
          onClick={handleRenewCredential}
        >
          New Credential
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Active Credentials</h3>
          <p className="text-3xl font-bold">2</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Expiring Soon</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="text-gray-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1">Average Renewal Time</h3>
          <p className="text-3xl font-bold">15 days</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Credentials</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CREDENTIAL</TableHead>
                <TableHead>ISSUER</TableHead>
                <TableHead>ISSUED DATE</TableHead>
                <TableHead>EXPIRATION</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell className="font-medium">{credential.name}</TableCell>
                  <TableCell>{credential.issuer}</TableCell>
                  <TableCell>{credential.issued}</TableCell>
                  <TableCell>{credential.expires}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      credential.status === "Active" ? "bg-green-100 text-green-800" : 
                      credential.status === "Expiring Soon" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {credential.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:underline p-0"
                      onClick={() => handleViewCredential(credential.id, credential.name)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MyCredentials;
