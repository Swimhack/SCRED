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

const Messages = () => {
  const { user, userRole } = useAuth();
  const [messages, setMessages] = useState<DeveloperMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = ['super_admin', 'admin_manager', 'admin_regional'].includes(userRole || '');
  
  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('unified-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'developer_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as DeveloperMessage;
            // Show notification for new messages from the other party
            if ((isAdmin && newMsg.sender_type === 'developer') || 
                (!isAdmin && newMsg.sender_type === 'admin')) {
              toast({
                title: 'New Message',
                description: `You have received a new message from ${newMsg.sender_type === 'developer' ? 'the development team' : 'an administrator'}`
              });
            }
          }
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setMessages(data || []);
      
      // Count unread messages from the other party
      if (isAdmin) {
        const unread = (data || []).filter(
          msg => msg.sender_type === 'developer' && msg.status === 'sent'
        ).length;
        setUnreadCount(unread);
      }
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('developer_messages')
        .insert({
          message: newMessage.trim(),
          sender_id: user?.id,
          sender_type: isAdmin ? 'admin' : 'developer',
          recipient_type: isAdmin ? 'developer' : 'admin'
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

      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${isAdmin ? 'the development team' : 'all administrators'}`
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
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

  if (!isAdmin && userRole !== null) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only administrators can access the messaging center.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title={`${isAdmin ? 'Admin' : 'Developer'} Messages - StreetCredRX`}
        description="Real-time communication between development team and administrators"
        canonicalPath="/messages"
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            {isAdmin ? 'Developer Messages' : 'Development Console'}
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Real-time communication with the development team'
              : 'Real-time communication with client administrators'
            }
          </p>
        </div>
      </div>

      {/* Messages Thread */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Message Thread
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Messages from the development team and your replies'
              : 'Share updates about website development, discuss content changes, and collaborate on next steps'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">
                  {isAdmin 
                    ? 'Messages will appear here when the development team sends updates'
                    : 'Start a conversation with the administrators'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isDeveloper = msg.sender_type === 'developer';
                const isOwnMessage = isAdmin ? !isDeveloper : isDeveloper;
                const isUnread = isAdmin && isDeveloper && msg.status === 'sent';
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
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                      onClick={() => {
                        if (isUnread) {
                          markAsRead(msg.id);
                        }
                      }}
                    >
                      {/* Avatar for other party's messages */}
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarFallback className={`${isDeveloper ? 'bg-blue-500' : 'bg-green-500'} text-white text-xs`}>
                            {isDeveloper ? <Code2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Message content */}
                      <div className={`flex flex-col space-y-1 max-w-[80%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}>
                        {/* Sender info */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${
                            isDeveloper ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {isDeveloper ? 'Development Team' : (isOwnMessage ? 'You' : 'Administrator')}
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
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : `bg-white border ${isUnread ? 'border-blue-200 shadow-blue-100' : 'border-border'} hover:shadow-md` 
                          } ${isUnread ? 'ring-2 ring-blue-100' : ''}`}
                        >
                          {/* Message text */}
                          <div className={`text-sm leading-relaxed ${
                            isOwnMessage ? 'text-primary-foreground' : 'text-foreground'
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
                              isOwnMessage
                                ? 'right-[-6px] border-l-[6px] border-l-primary border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                                : `left-[-6px] border-r-[6px] ${isUnread ? 'border-r-blue-50' : 'border-r-white'} border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent`
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
                          {msg.status === 'read' && isOwnMessage && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Avatar for own messages */}
                      {isOwnMessage && (
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarFallback className={`${isDeveloper ? 'bg-blue-500' : 'bg-green-500'} text-white text-xs`}>
                            {isDeveloper ? <Code2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
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

      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {isAdmin ? 'Send Reply' : 'Send Message'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Provide guidance, feedback on development updates, or discuss website improvements'
              : 'Share development updates, ask for guidance, or discuss content changes'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isAdmin 
              ? "Share feedback, provide guidance, or discuss next steps for development..."
              : "Share development updates, ask for guidance, or discuss content changes..."
            }
            rows={4}
          />
          <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;