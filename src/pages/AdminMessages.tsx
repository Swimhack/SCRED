import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Send, Bell, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

interface DeveloperMessage {
  id: string;
  message: string;
  sender_id: string;
  sender_type: string;
  recipient_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminMessages = () => {
  const { user, userRole } = useAuth();
  const [messages, setMessages] = useState<DeveloperMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'developer_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Show notification for new messages
            toast({
              title: 'New Developer Message',
              description: 'You have received a new message from the developer'
            });
          }
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setMessages(data || []);
      
      // Count unread messages from developer
      const unread = (data || []).filter(
        msg => msg.sender_type === 'developer' && msg.status === 'sent'
      ).length;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('developer_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('developer_messages')
        .insert({
          message: replyMessage.trim(),
          sender_id: user?.id,
          sender_type: 'admin',
          recipient_type: 'developer'
        });

      if (error) throw error;

      setReplyMessage('');
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent to the developer'
      });
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSenderBadgeColor = (senderType: string) => {
    return senderType === 'developer' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only super administrators can access admin messages.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="Admin Messages - StreetCredRX"
        description="Real-time messages from the development team"
        canonicalPath="/admin-messages"
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Developer Messages
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Real-time communication with the development team
          </p>
        </div>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Message Thread
          </CardTitle>
          <CardDescription>
            Messages from the development team and your replies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`border rounded-lg p-4 space-y-2 ${
                    msg.sender_type === 'developer' && msg.status === 'sent' 
                      ? 'bg-blue-50 border-blue-200' 
                      : ''
                  }`}
                  onClick={() => {
                    if (msg.sender_type === 'developer' && msg.status === 'sent') {
                      markAsRead(msg.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getSenderBadgeColor(msg.sender_type)}>
                        {msg.sender_type === 'developer' ? 'Developer' : 'You'}
                      </Badge>
                      {msg.sender_type === 'developer' && msg.status === 'sent' && (
                        <Badge variant="outline" className="text-red-600">
                          New
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    {msg.status === 'read' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="font-medium">{msg.message}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Reply
          </CardTitle>
          <CardDescription>
            Reply to the developer messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply to the developer..."
            rows={4}
          />
          <Button onClick={sendReply} disabled={loading || !replyMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Reply'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessages;