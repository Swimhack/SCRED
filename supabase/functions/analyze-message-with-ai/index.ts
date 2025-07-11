import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const SYSTEM_PROMPTS = {
  classify: `You are an expert at analyzing developer communication messages. Your job is to classify messages and generate appropriate responses.

Classify the message into one of these categories:
- bug_report: Issues, problems, things not working, errors, broken features
- question: Questions asking for information, clarification, how-to
- feature_request: Requests for new functionality, improvements, enhancements
- general: Updates, status reports, general communication

For bug_report messages:
- Generate a specific Lovable agent prompt that would fix the issue
- Focus on actionable, technical instructions
- Be specific about what needs to be changed

For question messages:
- Generate a factual, helpful answer
- Include relevant context about the system
- If you don't have enough information, say so clearly
- Never hallucinate or make up information

Return JSON with:
{
  "analysis_type": "bug_report|question|feature_request|general",
  "generated_prompt": "string (for bug reports)",
  "suggested_response": "string (for questions)",
  "confidence_score": 0.0-1.0,
  "sources": ["source1", "source2"] (for questions),
  "reasoning": "explanation of classification"
}

Be extremely careful about accuracy. When in doubt, classify as "general".`,

  context: `System Context:
- This is StreetCredRx, a pharmaceutical credentialing platform
- Current tech stack: React, TypeScript, Tailwind CSS, Supabase
- Users can submit pharmacist and pharmacy applications
- Admins can review and manage applications
- The system has messaging between developers and admins
- Key features: application management, document upload, status tracking, notifications`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, messageText, senderInfo } = await req.json();
    
    console.log('Analyzing message:', { messageId, senderInfo });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze the message with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.classify },
          { role: 'system', content: SYSTEM_PROMPTS.context },
          { role: 'user', content: `Analyze this message: "${messageText}"` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Validate analysis structure
    if (!analysis.analysis_type || !['bug_report', 'question', 'feature_request', 'general'].includes(analysis.analysis_type)) {
      analysis.analysis_type = 'general';
    }

    // Store analysis in database
    const { data: aiAnalysis, error: insertError } = await supabase
      .from('ai_analysis')
      .insert({
        message_id: messageId,
        analysis_type: analysis.analysis_type,
        generated_prompt: analysis.generated_prompt || null,
        suggested_response: analysis.suggested_response || null,
        confidence_score: Math.min(Math.max(analysis.confidence_score || 0.5, 0), 1),
        sources: analysis.sources || []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to store AI analysis');
    }

    console.log('AI analysis stored successfully:', aiAnalysis.id);

    return new Response(JSON.stringify({ 
      success: true, 
      analysisId: aiAnalysis.id,
      analysisType: analysis.analysis_type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-message-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});