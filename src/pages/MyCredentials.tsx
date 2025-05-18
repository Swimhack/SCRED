
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

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  expires: string;
  status: "Active" | "Expiring Soon" | "Expired";
}

const MyCredentials = () => {
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Credentials</h1>
        <button className="bg-brand-primary text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors">
          Renew Credential
        </button>
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
                    <button className="text-blue-600 hover:underline">View</button>
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
