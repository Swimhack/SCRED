import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Send, MessageSquare, Settings, Code } from 'lucide-react';
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

const DevConsole = () => {
  const { user, userRole } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DeveloperMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing messages
  useEffect(() => {
    fetchMessages();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('developer-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'developer_messages'
        },
        () => {
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
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('developer_messages')
        .insert({
          message: message.trim(),
          sender_id: user?.id,
          sender_type: 'developer',
          recipient_type: 'admin'
        });

      if (error) throw error;

      setMessage('');
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the admin'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only developers and super administrators can access the developer console.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="Developer Console - StreetCredRX"
        description="Real-time communication console for development and administration"
        canonicalPath="/dev-console"
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="h-8 w-8" />
            Developer Console
          </h1>
          <p className="text-muted-foreground">
            Real-time communication with client administrators
          </p>
        </div>
      </div>

      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Message to Admin
          </CardTitle>
          <CardDescription>
            Share updates about website development, upload images, discuss content changes, and collaborate on next steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share development updates, ask for guidance, or discuss content changes..."
            rows={4}
          />
          <Button onClick={sendMessage} disabled={loading || !message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message History
          </CardTitle>
          <CardDescription>
            Recent messages and their delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(msg.status)}>
                        {msg.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {msg.sender_type} → {msg.recipient_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="font-medium">{msg.message}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevConsole;