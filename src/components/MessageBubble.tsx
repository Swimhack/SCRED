import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, User, Code2, Clock, Reply } from 'lucide-react';
import { DeveloperMessage } from '@/hooks/useMessages';

interface MessageBubbleProps {
  message: DeveloperMessage;
  isAdmin: boolean;
  onMarkAsRead: (messageId: string) => void;
  onReply: (message: DeveloperMessage) => void;
  formatTimestamp: (timestamp: string) => string;
  formatLongTimestamp: (timestamp: string) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isAdmin,
  onMarkAsRead,
  onReply,
  formatTimestamp,
  formatLongTimestamp
}) => {
  const isDeveloper = message.sender_type === 'developer';
  const isOwnMessage = isAdmin ? !isDeveloper : isDeveloper;
  const isUnread = isAdmin && isDeveloper && message.status === 'sent';

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <div 
      className={`group flex items-start gap-3 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
      onClick={handleClick}
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
            {message.message.split('\n').map((line, i) => (
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
        
        {/* Timestamp, status, and reply button */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span title={formatLongTimestamp(message.created_at)}>
              {formatTimestamp(message.created_at)}
            </span>
          </div>
          {message.status === 'read' && isOwnMessage && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
          {!isOwnMessage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs opacity-70 hover:opacity-100 transition-opacity bg-muted/50 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onReply(message);
              }}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
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
  );
};