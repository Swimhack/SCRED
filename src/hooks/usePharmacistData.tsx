import { useState, useEffect, useMemo } from "react";

export interface Pharmacist {
  id: string;
  name: string;
  status: "In Progress" | "Pending" | "Completed" | "Expiring Soon" | "Rejected";
  submitted: string;
  avatar: string;
  email?: string;
  license?: string;
  npi?: string;
  expirationDate?: string;
}

// Enhanced mock data for production-ready demo
const mockPharmacists: Pharmacist[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    status: "In Progress",
    submitted: "May 15, 2025",
    avatar: "SJ",
    email: "sarah.johnson@pharmacy.com",
    license: "PH123456",
    npi: "1234567890",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    status: "Completed",
    submitted: "May 12, 2025",
    avatar: "MC",
    email: "michael.chen@rxcare.com",
    license: "PH234567",
    npi: "2345678901",
  },
  {
    id: "3",
    name: "Dr. Jessica Smith",
    status: "Pending",
    submitted: "May 10, 2025",
    avatar: "JS",
    email: "jessica.smith@medpharm.com",
    license: "PH345678",
    npi: "3456789012",
  },
  {
    id: "4",
    name: "Dr. Robert Williams",
    status: "Expiring Soon",
    submitted: "May 5, 2025",
    avatar: "RW",
    email: "robert.williams@healthrx.com",
    license: "PH456789",
    npi: "4567890123",
    expirationDate: "June 15, 2025",
  },
  {
    id: "5",
    name: "Dr. Emily Parker",
    status: "Completed",
    submitted: "May 2, 2025",
    avatar: "EP",
    email: "emily.parker@pharmacare.com",
    license: "PH567890",
    npi: "5678901234",
  },
  {
    id: "6",
    name: "Dr. David Lee",
    status: "In Progress",
    submitted: "May 1, 2025",
    avatar: "DL",
    email: "david.lee@rxsolutions.com",
    license: "PH678901",
    npi: "6789012345",
  },
  {
    id: "7",
    name: "Dr. Maria Garcia",
    status: "Pending",
    submitted: "Apr 28, 2025",
    avatar: "MG",
    email: "maria.garcia@pharmtech.com",
    license: "PH789012",
    npi: "7890123456",
  },
  {
    id: "8",
    name: "Dr. James Wilson",
    status: "Completed",
    submitted: "Apr 25, 2025",
    avatar: "JW",
    email: "james.wilson@healthpharm.com",
    license: "PH890123",
    npi: "8901234567",
  },
  {
    id: "9",
    name: "Dr. Lisa Thompson",
    status: "Expiring Soon",
    submitted: "Apr 22, 2025",
    avatar: "LT",
    email: "lisa.thompson@careplus.com",
    license: "PH901234",
    npi: "9012345678",
    expirationDate: "July 10, 2025",
  },
  {
    id: "10",
    name: "Dr. Kevin Brown",
    status: "In Progress",
    submitted: "Apr 20, 2025",
    avatar: "KB",
    email: "kevin.brown@rxnetwork.com",
    license: "PH012345",
    npi: "0123456789",
  },
];

export const usePharmacistData = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>(mockPharmacists);
  const [loading, setLoading] = useState(false);

  // Statistics derived from real data
  const statistics = useMemo(() => {
    const total = pharmacists.length;
    const pending = pharmacists.filter(p => p.status === "Pending").length;
    const completed = pharmacists.filter(p => p.status === "Completed").length;
    const expiring = pharmacists.filter(p => p.status === "Expiring Soon").length;
    const inProgress = pharmacists.filter(p => p.status === "In Progress").length;

    return {
      total: total.toString(),
      pending: pending.toString(),
      completed: completed.toString(),
      expiring: expiring.toString(),
      inProgress: inProgress.toString(),
    };
  }, [pharmacists]);

  // Filter pharmacists by status
  const getPharmacistsByStatus = (status?: Pharmacist["status"]) => {
    if (!status) return pharmacists;
    return pharmacists.filter(p => p.status === status);
  };

  // Update pharmacist status
  const updatePharmacistStatus = (id: string, newStatus: Pharmacist["status"]) => {
    setPharmacists(prev => 
      prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      )
    );
  };

  // Add new pharmacist
  const addPharmacist = (pharmacist: Omit<Pharmacist, "id">) => {
    const newPharmacist: Pharmacist = {
      ...pharmacist,
      id: Date.now().toString(),
    };
    setPharmacists(prev => [newPharmacist, ...prev]);
  };

  return {
    pharmacists,
    statistics,
    loading,
    getPharmacistsByStatus,
    updatePharmacistStatus,
    addPharmacist,
  };
};