import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Mail, Phone, Calendar, Globe, Smartphone, Eye, MessageSquare, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import DatabaseCheck from "@/components/DatabaseCheck";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'replied' | 'resolved';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  email_sent: boolean;
  email_sent_at?: string;
  email_error?: string;
  responded_at?: string;
  responded_by?: string;
  response_notes?: string;
}

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [responseNotes, setResponseNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      console.log('Fetching contact submissions...');
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Contact submissions fetched:', data?.length || 0, 'items');
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: `Failed to fetch contact submissions: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, responseNotes?: string) => {
    try {
      const updates: Partial<ContactSubmission> = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'replied' || status === 'resolved') {
        updates.responded_at = new Date().toISOString();
        updates.response_notes = responseNotes;
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === id 
          ? { ...sub, ...updates }
          : sub
      ));

      toast({
        title: "Success",
        description: "Submission status updated",
      });

      setSelectedSubmission(null);
      setResponseNotes("");
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (submission: ContactSubmission) => {
    if (submission.status === 'new') {
      await updateSubmissionStatus(submission.id, 'read');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubmissions = statusFilter === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.status === statusFilter);

  if (loading) {
    return <div className="p-6">Loading contact submissions...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No contact submissions found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        {submission.email}
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {submission.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                    <Badge className={getPriorityColor(submission.priority)}>
                      {submission.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{submission.message}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Globe size={12} />
                      {submission.source}
                    </div>
                    {submission.email_sent ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={12} />
                        Email sent
                      </div>
                    ) : submission.email_error ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <Mail size={12} />
                        Email failed
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        markAsRead(submission);
                      }}
                    >
                      <Eye size={14} className="mr-1" />
                      View Details
                    </Button>
                    {submission.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSubmissionStatus(submission.id, 'resolved')}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Contact Submission Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{selectedSubmission.email}</p>
                </div>
                {selectedSubmission.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg">{selectedSubmission.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-lg">{format(new Date(selectedSubmission.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <p className="mt-1 p-3 bg-gray-50 rounded border whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <p>{selectedSubmission.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                  <p>{selectedSubmission.ip_address || 'N/A'}</p>
                </div>
                {selectedSubmission.user_agent && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">User Agent</label>
                    <p className="text-xs break-all">{selectedSubmission.user_agent}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedSubmission.status)}>
                  {selectedSubmission.status}
                </Badge>
                <Badge className={getPriorityColor(selectedSubmission.priority)}>
                  {selectedSubmission.priority}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Response Notes</label>
                <Textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add response notes..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'replied', responseNotes)}
                  disabled={!responseNotes}
                >
                  <MessageSquare size={14} className="mr-1" />
                  Mark as Replied
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'resolved', responseNotes)}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug component - remove after troubleshooting */}
      <DatabaseCheck />
    </div>
  );
};

export default ContactSubmissions;