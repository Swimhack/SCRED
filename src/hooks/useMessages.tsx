import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface DeveloperMessage {
  id: string;
  message: string;
  sender_id: string;
  sender_type: string;
  recipient_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  thread_id: string | null;
  category: string;
  priority: string;
}

export const useMessages = () => {
  const { user, userRole } = useAuth();
  const [messages, setMessages] = useState<DeveloperMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if user is admin (works with both MVP simplified roles and full role names)
  const isAdmin = ['super_admin', 'admin_manager', 'admin_regional', 'admin'].includes(userRole || '');

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

  const sendMessage = async (messageText: string, replyToMessage?: DeveloperMessage, category = 'update', priority = 'normal') => {
    if (!messageText.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('developer_messages')
        .insert({
          message: messageText.trim(),
          sender_id: user?.id,
          sender_type: isAdmin ? 'admin' : 'developer',
          recipient_type: isAdmin ? 'developer' : 'admin',
          thread_id: replyToMessage?.thread_id || replyToMessage?.id || null,
          category: replyToMessage ? replyToMessage.category : category,
          priority: replyToMessage ? replyToMessage.priority : priority
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

      // Automatically trigger AI analysis for messages from admins
      if (isAdmin) {
        try {
          await supabase.functions.invoke('analyze-message-with-ai', {
            body: {
              messageId: data.id,
              messageText: messageText.trim(),
              senderInfo: {
                senderType: 'admin',
                senderId: user?.id
              }
            }
          });
        } catch (aiError) {
          console.warn('Failed to trigger AI analysis:', aiError);
        }
      }

      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${isAdmin ? 'the development team' : 'all administrators'}`
      });

      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    unreadCount,
    isAdmin,
    user,
    userRole,
    markAsRead,
    sendMessage,
    fetchMessages
  };
};