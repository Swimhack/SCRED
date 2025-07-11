import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import { DeveloperMessage } from '@/hooks/useMessages';

interface MessageComposerProps {
  isAdmin: boolean;
  loading: boolean;
  replyingTo: DeveloperMessage | null;
  onSendMessage: (message: string, replyTo?: DeveloperMessage) => Promise<boolean>;
  onCancelReply: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isAdmin,
  loading,
  replyingTo,
  onSendMessage,
  onCancelReply
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = async () => {
    const success = await onSendMessage(newMessage, replyingTo || undefined);
    if (success) {
      setNewMessage('');
    }
  };

  return (
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
        {replyingTo && (
          <div className="bg-muted p-3 rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Replying to:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onCancelReply}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-foreground line-clamp-2">
              {replyingTo.message}
            </p>
          </div>
        )}
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={replyingTo 
            ? "Type your reply..."
            : (isAdmin 
              ? "Share feedback, provide guidance, or discuss next steps for development..."
              : "Share development updates, ask for guidance, or discuss content changes..."
            )
          }
          rows={4}
        />
        <Button onClick={handleSend} disabled={loading || !newMessage.trim()}>
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </CardContent>
    </Card>
  );
};