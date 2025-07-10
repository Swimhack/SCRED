import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  User, 
  GraduationCap, 
  Building, 
  FileText, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { PharmacistWithDocuments } from "@/hooks/usePharmacistApplications";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface PharmacistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacist: PharmacistWithDocuments | null;
  onStatusUpdate?: (id: string, status: string) => Promise<any>;
  onAddNote?: (applicationId: string, noteContent: string, priority: string) => Promise<any>;
}

const PharmacistDetailModal: React.FC<PharmacistDetailModalProps> = ({
  isOpen,
  onClose,
  pharmacist,
  onStatusUpdate,
  onAddNote,
}) => {
  const [newNote, setNewNote] = useState("");
  const [notePriority, setNotePriority] = useState("normal");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!pharmacist) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCompletionIcon = (isComplete: boolean | null) => {
    if (isComplete) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;
    
    setIsUpdating(true);
    try {
      const result = await onStatusUpdate(pharmacist.id, newStatus);
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
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!onAddNote || !newNote.trim()) return;

    try {
      const result = await onAddNote(pharmacist.id, newNote, notePriority);
      if (result.success) {
        setNewNote("");
        setNotePriority("normal");
        toast({
          title: "Note Added",
          description: "Note has been added to the application",
        });
      } else {
        toast({
          title: "Failed to Add Note",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Add Note",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getFullName = () => {
    const parts = [pharmacist.first_name, pharmacist.middle_name, pharmacist.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "N/A";
  };

  const getAvatar = () => {
    const name = getFullName();
    if (name === "N/A") return "?";
    const nameParts = name.split(" ");
    return nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center text-lg font-semibold text-brand-primary border">
              {getAvatar()}
            </div>
            <div>
              <DialogTitle className="text-xl">{getFullName()}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Badge className={getStatusColor(pharmacist.status)}>
                  {pharmacist.status.replace("_", " ").toUpperCase()}
                </Badge>
                <span>•</span>
                <span>{pharmacist.email}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Section completion: {getCompletionIcon(pharmacist.section_personal_complete)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Full Name:</span> {getFullName()}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {pharmacist.email || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {pharmacist.phone || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {pharmacist.mailing_address || "N/A"}
                  </div>
                  {pharmacist.aliases_nicknames && (
                    <div>
                      <span className="font-medium">Aliases:</span> {pharmacist.aliases_nicknames}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </CardTitle>
                  <CardDescription>
                    Section completion: {getCompletionIcon(pharmacist.section_education_complete)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">School:</span> {pharmacist.pharmacy_school_name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Degree:</span> {pharmacist.pharmacy_degree || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Graduation:</span> {
                      pharmacist.graduation_date 
                        ? format(new Date(pharmacist.graduation_date), "MMM dd, yyyy")
                        : "N/A"
                    }
                  </div>
                  <div>
                    <span className="font-medium">School Website:</span> {pharmacist.school_website || "N/A"}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Professional Information
                  </CardTitle>
                  <CardDescription>
                    Section completion: {getCompletionIcon(pharmacist.section_professional_complete)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">NPI Number:</span> {pharmacist.npi_number || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">License Number:</span> {pharmacist.state_license_number || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">License State:</span> {pharmacist.state_license_state || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">DEA Certificate:</span> {pharmacist.dea_certificate_number || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">License Expiration:</span> {
                      pharmacist.license_expiration_date 
                        ? format(new Date(pharmacist.license_expiration_date), "MMM dd, yyyy")
                        : "N/A"
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium">Overall Completion:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-brand-primary h-2 rounded-full transition-all"
                        style={{ width: `${pharmacist.overall_completion_percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{pharmacist.overall_completion_percentage || 0}%</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Personal Information</span>
                      {getCompletionIcon(pharmacist.section_personal_complete)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Education</span>
                      {getCompletionIcon(pharmacist.section_education_complete)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Professional</span>
                      {getCompletionIcon(pharmacist.section_professional_complete)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Documents</span>
                      {getCompletionIcon(pharmacist.section_documents_complete)}
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("in_review")}
                        disabled={isUpdating}
                      >
                        In Review
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("pending")}
                        disabled={isUpdating}
                      >
                        Pending
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("approved")}
                        disabled={isUpdating}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusUpdate("rejected")}
                        disabled={isUpdating}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                  All documents uploaded for this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pharmacist.documents && pharmacist.documents.length > 0 ? (
                  <div className="space-y-2">
                    {pharmacist.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {format(new Date(doc.uploaded_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Badge variant={doc.is_verified ? "default" : "secondary"}>
                          {doc.is_verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note Section */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note about this application..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <select 
                      value={notePriority} 
                      onChange={(e) => setNotePriority(e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Existing Notes */}
                <div className="space-y-2">
                  {pharmacist.notes && pharmacist.notes.length > 0 ? (
                    pharmacist.notes.map((note) => (
                      <div key={note.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={note.priority === "urgent" ? "destructive" : "outline"}>
                            {note.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                          </span>
                        </div>
                        <p className="text-sm">{note.note_content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No notes added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Application Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pharmacist.updates && pharmacist.updates.length > 0 ? (
                  <div className="space-y-3">
                    {pharmacist.updates.map((update) => (
                      <div key={update.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{update.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={update.priority === "urgent" ? "destructive" : "outline"}>
                              {update.priority}
                            </Badge>
                            {!update.is_read && (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{update.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(update.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No updates available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacistDetailModal;
