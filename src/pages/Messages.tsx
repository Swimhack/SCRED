import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Search, Filter, Archive, Bell, BellOff } from 'lucide-react';
import SEO from '@/components/SEO';
import { MessageThread } from '@/components/MessageThread';
import { MessageComposer } from '@/components/MessageComposer';
import { useMessages, DeveloperMessage } from '@/hooks/useMessages';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel';
import { supabase } from '@/integrations/supabase/client';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Get all message IDs for AI analysis
  const allMessageIds = useMemo(() => 
    messages.map(msg => msg.id), [messages]
  );

  const {
    analyses,
    loading: aiLoading,
    updateAnalysis,
    triggerAIAnalysis
  } = useAIAnalysis(allMessageIds);

  // Check if user is super admin (developer) - works with role ID or name
  const isDeveloper = userRole === '4' || userRole === 'super_admin';

  // Group messages by thread
  const messageThreads = useMemo(() => {
    const threads = new Map<string, DeveloperMessage[]>();
    
    messages.forEach(message => {
      const threadId = message.thread_id || message.id;
      if (!threads.has(threadId)) {
        threads.set(threadId, []);
      }
      threads.get(threadId)!.push(message);
    });

    // Sort messages within each thread by created_at
    threads.forEach(thread => {
      thread.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    // Convert to array and sort threads by latest message
    return Array.from(threads.entries())
      .map(([threadId, messages]) => ({
        threadId,
        messages,
        latestMessage: messages[messages.length - 1],
        unreadCount: messages.filter(msg => 
          isAdmin && msg.sender_type === 'developer' && msg.status === 'sent'
        ).length
      }))
      .sort((a, b) => 
        new Date(b.latestMessage.created_at).getTime() - 
        new Date(a.latestMessage.created_at).getTime()
      );
  }, [messages, isAdmin]);

  // Filter threads based on search and filters
  const filteredThreads = useMemo(() => {
    return messageThreads.filter(thread => {
      const matchesSearch = searchTerm === '' || 
        thread.messages.some(msg => 
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory = selectedCategory === 'all' || 
        thread.latestMessage.category === selectedCategory;

      const matchesPriority = selectedPriority === 'all' || 
        thread.latestMessage.priority === selectedPriority;

      const matchesTab = activeTab === 'all' ||
        (activeTab === 'unread' && thread.unreadCount > 0) ||
        (activeTab === 'priority' && ['urgent', 'high'].includes(thread.latestMessage.priority));

      return matchesSearch && matchesCategory && matchesPriority && matchesTab;
    });
  }, [messageThreads, searchTerm, selectedCategory, selectedPriority, activeTab]);

  const handleSendMessage = async (messageText: string, replyTo?: DeveloperMessage, category?: string, priority?: string) => {
    const success = await sendMessage(messageText, replyTo, category, priority);
    if (success) {
      setReplyingTo(null);
    }
    return success;
  };

  // Function to trigger AI analysis on new messages from A.J.
  const handleTriggerAIAnalysis = async (message: DeveloperMessage) => {
    // Only analyze messages from A.J. (assuming A.J. has a specific sender_id)
    // You can adjust this condition based on how A.J. is identified
    if (message.sender_type === 'admin' && isDeveloper) {
      try {
        await triggerAIAnalysis(message.id, message.message, {
          senderType: message.sender_type,
          senderId: message.sender_id
        });
      } catch (error) {
        console.error('Failed to trigger AI analysis:', error);
      }
    }
  };

  // Get AI analysis for a specific message
  const getAnalysisForMessage = (messageId: string) => {
    return analyses.find(analysis => analysis.message_id === messageId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const markThreadAsRead = async (threadMessages: DeveloperMessage[]) => {
    const unreadMessages = threadMessages.filter(msg => 
      isAdmin && msg.sender_type === 'developer' && msg.status === 'sent'
    );
    
    for (const msg of unreadMessages) {
      await markAsRead(msg.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug_report': return '🐛';
      case 'feature_request': return '✨';
      case 'question': return '❓';
      case 'approval_needed': return '✅';
      default: return '💬';
    }
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug_report">🐛 Bug Reports</SelectItem>
                <SelectItem value="feature_request">✨ Features</SelectItem>
                <SelectItem value="question">❓ Questions</SelectItem>
                <SelectItem value="approval_needed">✅ Approvals</SelectItem>
                <SelectItem value="update">💬 Updates</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="normal">🔵 Normal</SelectItem>
                <SelectItem value="low">⚫ Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Message Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredThreads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No messages found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No messages in this category yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredThreads.map(({ threadId, messages: threadMessages, latestMessage, unreadCount: threadUnreadCount }) => (
              <Card key={threadId} className={`transition-all hover:shadow-md ${threadUnreadCount > 0 ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{getCategoryIcon(latestMessage.category)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(latestMessage.priority)}>
                            {latestMessage.priority}
                          </Badge>
                          <Badge variant="outline">
                            {latestMessage.category.replace('_', ' ')}
                          </Badge>
                          {threadUnreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {threadUnreadCount} new
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Latest: {new Date(latestMessage.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {threadUnreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markThreadAsRead(threadMessages)}
                        className="ml-2"
                      >
                        <BellOff className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <MessageThread
                    messages={threadMessages}
                    isAdmin={isAdmin}
                    onMarkAsRead={markAsRead}
                    onReply={setReplyingTo}
                  />
                  
                  {/* AI Analysis for Developers */}
                  {isDeveloper && threadMessages.map(message => {
                    const analysis = getAnalysisForMessage(message.id);
                    return analysis ? (
                      <AIAnalysisPanel
                        key={analysis.id}
                        analysis={analysis}
                        onUpdateAnalysis={updateAnalysis}
                      />
                    ) : (
                      message.sender_type === 'admin' && (
                        <div key={`trigger-${message.id}`} className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerAIAnalysis(message)}
                            className="w-full"
                          >
                            🤖 Analyze with AI
                          </Button>
                        </div>
                      )
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

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