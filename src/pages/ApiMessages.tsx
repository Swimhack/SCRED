import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ApiMessages = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple API key check (you can make this more secure)
    const apiKey = searchParams.get('key');
    const validApiKey = 'streetcred-api-2025'; // You can change this
    
    if (!apiKey || apiKey !== validApiKey) {
      setError('Invalid or missing API key. Use ?key=streetcred-api-2025');
      setLoading(false);
      return;
    }
    const fetchMessages = async () => {
      try {
        // Use service role to bypass RLS for API access
        const { data, error } = await supabase
          .from('developer_messages')
          .select(`
            *,
            ai_analysis(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching messages:', error);
          setError(error.message);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Format response as JSON
  const response = {
    success: !error,
    timestamp: new Date().toISOString(),
    count: messages.length,
    error: error,
    data: messages.map(msg => ({
      id: msg.id,
      message: msg.message,
      sender_type: msg.sender_type,
      recipient_type: msg.recipient_type,
      category: msg.category,
      priority: msg.priority,
      status: msg.status,
      thread_id: msg.thread_id,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      metadata: msg.metadata,
      ai_analysis: msg.ai_analysis?.map((analysis: any) => ({
        analysis_type: analysis.analysis_type,
        generated_prompt: analysis.generated_prompt,
        suggested_response: analysis.suggested_response,
        confidence_score: analysis.confidence_score,
        developer_approved: analysis.developer_approved,
        created_at: analysis.created_at
      }))
    }))
  };

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {loading ? (
        <div>Loading messages...</div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            /* StreetCredRx Developer Messages API */
            <br />
            /* Live URL: https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025 */
            <br />
            /* Last Updated: {new Date().toISOString()} */
            <br />
            /* Total Messages: {messages.length} */
          </div>
          {JSON.stringify(response, null, 2)}
        </div>
      )}
    </div>
  );
};

export default ApiMessages;