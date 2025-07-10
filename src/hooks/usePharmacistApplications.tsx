import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type PharmacistApplication = Tables<"pharmacist_applications">;

export interface PharmacistWithDocuments extends PharmacistApplication {
  documents?: Array<Tables<"application_documents">>;
  notes?: Array<Tables<"application_notes">>;
  updates?: Array<Tables<"application_updates">>;
}

export const usePharmacistApplications = () => {
  const [applications, setApplications] = useState<PharmacistWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("pharmacist_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (applicationsError) throw applicationsError;

      // Then fetch related data for each application if needed
      const applicationsWithExtras: PharmacistWithDocuments[] = applicationsData || [];

      setApplications(applicationsWithExtras);
    } catch (err) {
      console.error("Error fetching pharmacist applications:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription
    const channel = supabase
      .channel("pharmacist_applications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pharmacist_applications",
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Statistics derived from real data
  const statistics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === "pending_documents").length;
    const completed = applications.filter(app => app.status === "approved").length;
    const expiring = applications.filter(app => {
      if (!app.license_expiration_date) return false;
      const expirationDate = new Date(app.license_expiration_date);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expirationDate <= threeMonthsFromNow;
    }).length;
    const inProgress = applications.filter(app => 
      app.status === "in_review" || app.status === "draft" || app.status === "submitted"
    ).length;

    return {
      total: total.toString(),
      pending: pending.toString(),
      completed: completed.toString(),
      expiring: expiring.toString(),
      inProgress: inProgress.toString(),
    };
  }, [applications]);

  // Map database status to display status
  const mapStatus = (dbStatus: string): "In Progress" | "Pending" | "Completed" | "Expiring Soon" | "Rejected" => {
    switch (dbStatus) {
      case "draft":
      case "submitted":
      case "in_review":
        return "In Progress";
      case "pending_documents":
        return "Pending";
      case "approved":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        return "In Progress";
    }
  };

  // Filter applications by status
  const getApplicationsByStatus = (status?: "In Progress" | "Pending" | "Completed" | "Expiring Soon" | "Rejected") => {
    if (!status) return applications;

    // Handle expiring status separately
    if (status === "Expiring Soon") {
      return applications.filter(app => {
        if (!app.license_expiration_date) return false;
        const expirationDate = new Date(app.license_expiration_date);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expirationDate <= threeMonthsFromNow;
      });
    }

    return applications.filter(app => mapStatus(app.status) === status);
  };

  // Update application status
  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("pharmacist_applications")
        .update({ status: newStatus, reviewed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Optimistically update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status: newStatus, reviewed_at: new Date().toISOString() } : app
        )
      );

      return { success: true };
    } catch (err) {
      console.error("Error updating application status:", err);
      return { success: false, error: err instanceof Error ? err.message : "Update failed" };
    }
  };

  // Add a note to an application
  const addNote = async (applicationId: string, noteContent: string, priority: string = "normal") => {
    try {
      const { error } = await supabase
        .from("application_notes")
        .insert({
          application_id: applicationId,
          application_type: "pharmacist",
          note_content: noteContent,
          priority,
          created_by: (await supabase.auth.getUser()).data.user?.id || "",
        });

      if (error) throw error;

      // Refresh data to include new note
      await fetchApplications();

      return { success: true };
    } catch (err) {
      console.error("Error adding note:", err);
      return { success: false, error: err instanceof Error ? err.message : "Failed to add note" };
    }
  };

  return {
    applications,
    loading,
    error,
    statistics,
    getApplicationsByStatus,
    updateApplicationStatus,
    addNote,
    mapStatus,
    refetch: fetchApplications,
  };
};