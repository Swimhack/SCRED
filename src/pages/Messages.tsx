import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import SEO from '@/components/SEO';
import { MessageThread } from '@/components/MessageThread';
import { MessageComposer } from '@/components/MessageComposer';
import { useMessages, DeveloperMessage } from '@/hooks/useMessages';

const Messages = () => {
  const {
    messages,
    loading,
    unreadCount,
    isAdmin,
    userRole,
    markAsRead,
    sendMessage
  } = useMessages();

  const [replyingTo, setReplyingTo] = useState<DeveloperMessage | null>(null);

  const handleSendMessage = async (messageText: string, replyTo?: DeveloperMessage) => {
    const success = await sendMessage(messageText, replyTo);
    if (success) {
      setReplyingTo(null);
    }
    return success;
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
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
      <MessageThread
        messages={messages}
        isAdmin={isAdmin}
        onMarkAsRead={markAsRead}
        onReply={setReplyingTo}
      />

      {/* Send Message */}
      <MessageComposer
        isAdmin={isAdmin}
        loading={loading}
        replyingTo={replyingTo}
        onSendMessage={handleSendMessage}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
};

export default Messages;