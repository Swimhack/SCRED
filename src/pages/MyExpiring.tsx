
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

interface Credential {
  id: string;
  name: string;
  issuer: string;
  expires: string;
  daysLeft: number;
}

const MyExpiring = () => {
  const navigate = useNavigate();
  const [expiringCredentials] = useState<Credential[]>([
    {
      id: "1",
      name: "Blue Cross Contract",
      issuer: "BCBS",
      expires: "Jun 10, 2025",
      daysLeft: 21,
    },
    {
      id: "2",
      name: "Pharmacy License",
      issuer: "State Board of Pharmacy",
      expires: "Jul 15, 2025",
      daysLeft: 56,
    }
  ]);

  const handleRenewNow = (id: string, name: string) => {
    toast({
      title: "Renewal Process Started",
      description: `Starting renewal process for ${name}`,
      duration: 3000,
    });
    // Navigate to the renewal form with pre-filled data
    navigate(`/pharmacist-form?id=${id}&renew=true&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title="Expiring Pharmacy Credentials" 
        description="Monitor credentials that need renewal. Get timely reminders for approaching expiration dates to maintain uninterrupted billing privileges."
        canonicalPath="/my-expiring"
      />
      <h1 className="text-2xl font-semibold mb-6">Expiring Credentials</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-yellow-800">Important Reminder</h3>
          <p className="text-yellow-700">Credentials should be renewed at least 30 days before their expiration date to ensure continuity of service.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Credentials Expiring Soon</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CREDENTIAL</TableHead>
                <TableHead>ISSUER</TableHead>
                <TableHead>EXPIRATION DATE</TableHead>
                <TableHead>DAYS LEFT</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringCredentials.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell className="font-medium">{credential.name}</TableCell>
                  <TableCell>{credential.issuer}</TableCell>
                  <TableCell>{credential.expires}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      credential.daysLeft <= 30 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {credential.daysLeft} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      className="bg-brand-primary text-gray-900 hover:bg-yellow-300 transition-colors"
                      size="sm"
                      onClick={() => handleRenewNow(credential.id, credential.name)}
                    >
                      Renew Now
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Renewal Process</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Click the "Renew Now" button for the credential you wish to renew</li>
            <li>Complete the renewal application form with updated information</li>
            <li>Upload any required documentation</li>
            <li>Submit your renewal application for processing</li>
            <li>Track the status of your renewal in the "My Applications" section</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MyExpiring;
