import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, X } from 'lucide-react';
import { DeveloperMessage } from '@/hooks/useMessages';

interface MessageComposerProps {
  isAdmin: boolean;
  loading: boolean;
  replyingTo: DeveloperMessage | null;
  onSendMessage: (message: string, replyTo?: DeveloperMessage, category?: string, priority?: string) => Promise<boolean>;
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
  const [selectedCategory, setSelectedCategory] = useState('update');
  const [selectedPriority, setSelectedPriority] = useState('normal');

  const handleSend = async () => {
    const success = await onSendMessage(newMessage, replyingTo || undefined, selectedCategory, selectedPriority);
    if (success) {
      setNewMessage('');
      setSelectedCategory('update');
      setSelectedPriority('normal');
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
        
        {!replyingTo && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">💬 Update</SelectItem>
                  <SelectItem value="bug_report">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature_request">✨ Feature Request</SelectItem>
                  <SelectItem value="question">❓ Question</SelectItem>
                  <SelectItem value="approval_needed">✅ Approval Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">⚫ Low</SelectItem>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
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