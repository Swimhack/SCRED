import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysis {
  id: string;
  message_id: string;
  analysis_type: 'bug_report' | 'question' | 'feature_request' | 'general';
  generated_prompt: string | null;
  suggested_response: string | null;
  confidence_score: number;
  sources: string[];
  developer_approved: boolean | null;
  developer_notes: string | null;
  processed_at: string;
  created_at: string;
  updated_at: string;
}

export const useAIAnalysis = (messageIds: string[]) => {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messageIds.length === 0) return;

    const fetchAnalyses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_analysis')
          .select('*')
          .in('message_id', messageIds)
          .order('processed_at', { ascending: false });

        if (error) throw error;
        setAnalyses((data || []) as AIAnalysis[]);
      } catch (error) {
        console.error('Error fetching AI analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [messageIds]);

  const updateAnalysis = async (analysisId: string, updates: Partial<AIAnalysis>) => {
    try {
      const { error } = await supabase
        .from('ai_analysis')
        .update(updates)
        .eq('id', analysisId);

      if (error) throw error;

      // Update local state
      setAnalyses(prev => 
        prev.map(analysis => 
          analysis.id === analysisId 
            ? { ...analysis, ...updates }
            : analysis
        )
      );
    } catch (error) {
      console.error('Error updating AI analysis:', error);
      throw error;
    }
  };

  const triggerAIAnalysis = async (messageId: string, messageText: string, senderInfo: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-message-with-ai', {
        body: {
          messageId,
          messageText,
          senderInfo
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      throw error;
    }
  };

  return {
    analyses,
    loading,
    updateAnalysis,
    triggerAIAnalysis
  };
};