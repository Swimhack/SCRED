import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Bell } from 'lucide-react';
import { MessageBubble } from '@/components/MessageBubble';
import { DeveloperMessage } from '@/hooks/useMessages';

interface MessageThreadProps {
  messages: DeveloperMessage[];
  isAdmin: boolean;
  onMarkAsRead: (messageId: string) => void;
  onReply: (message: DeveloperMessage) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  isAdmin,
  onMarkAsRead,
  onReply
}) => {
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

  return (
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
                  <MessageBubble
                    message={msg}
                    isAdmin={isAdmin}
                    onMarkAsRead={onMarkAsRead}
                    onReply={onReply}
                    formatTimestamp={formatTimestamp}
                    formatLongTimestamp={formatLongTimestamp}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};