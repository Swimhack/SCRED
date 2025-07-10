import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Send, Bell, CheckCircle, User, Code2, Clock } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('developer_messages')
        .insert({
          message: replyMessage.trim(),
          sender_id: user?.id,
          sender_type: 'admin',
          recipient_type: 'developer'
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger email notifications
      try {
        const { error: notificationError } = await supabase.functions.invoke('process-message-notifications', {
          body: { messageId: data.id }
        });
        
        if (notificationError) {
          console.warn('Failed to trigger email notifications:', notificationError);
        }
      } catch (notificationError) {
        console.warn('Failed to trigger email notifications:', notificationError);
      }

      setReplyMessage('');
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent to all administrators'
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatLongTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!['super_admin', 'admin_manager', 'admin_regional'].includes(userRole || '')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only administrators can access admin messages.
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
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Message Thread
          </CardTitle>
          <CardDescription>
            Messages from the development team and your replies
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Messages will appear here when the development team sends updates</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isDeveloper = msg.sender_type === 'developer';
                const isUnread = isDeveloper && msg.status === 'sent';
                const showDateSeparator = index === 0 || 
                  new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
                
                return (
                  <div key={msg.id} className="space-y-3">
                    {/* Date separator */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center py-2">
                        <Separator className="flex-1" />
                        <div className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                          {new Date(msg.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={`group flex items-start gap-3 ${
                        isDeveloper ? 'justify-start' : 'justify-end'
                      }`}
                      onClick={() => {
                        if (isUnread) {
                          markAsRead(msg.id);
                        }
                      }}
                    >
                      {/* Avatar for developer messages */}
                      {isDeveloper && (
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            <Code2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Message content */}
                      <div className={`flex flex-col space-y-1 max-w-[80%] ${
                        isDeveloper ? 'items-start' : 'items-end'
                      }`}>
                        {/* Sender info */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${
                            isDeveloper ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {isDeveloper ? 'Development Team' : 'You'}
                          </span>
                          {isUnread && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs px-1.5 py-0.5 h-5 animate-pulse"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        
                        {/* Message bubble */}
                        <div 
                          className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                            isDeveloper 
                              ? `bg-white border ${isUnread ? 'border-blue-200 shadow-blue-100' : 'border-border'} hover:shadow-md` 
                              : 'bg-primary text-primary-foreground'
                          } ${isUnread ? 'ring-2 ring-blue-100' : ''}`}
                        >
                          {/* Message text with better typography */}
                          <div className={`text-sm leading-relaxed ${
                            isDeveloper ? 'text-foreground' : 'text-primary-foreground'
                          }`}>
                            {msg.message.split('\n').map((line, i) => (
                              <div key={i} className={i > 0 ? 'mt-2' : ''}>
                                {line}
                              </div>
                            ))}
                          </div>
                          
                          {/* Message tail */}
                          <div 
                            className={`absolute top-4 w-0 h-0 ${
                              isDeveloper 
                                ? `left-[-6px] border-r-[6px] ${isUnread ? 'border-r-blue-50' : 'border-r-white'} border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent`
                                : 'right-[-6px] border-l-[6px] border-l-primary border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                            }`}
                          />
                        </div>
                        
                        {/* Timestamp and status */}
                        <div className="flex items-center gap-2 px-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span title={formatLongTimestamp(msg.created_at)}>
                              {formatTimestamp(msg.created_at)}
                            </span>
                          </div>
                          {msg.status === 'read' && !isDeveloper && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Avatar for admin messages */}
                      {!isDeveloper && (
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
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
            Provide guidance, feedback on development updates, or discuss website improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Share feedback, provide guidance, or discuss next steps for development..."
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