-- Create AI analysis table for storing AI-generated insights on developer messages
CREATE TABLE public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('bug_report', 'question', 'feature_request', 'general')),
  generated_prompt TEXT,
  suggested_response TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  sources TEXT[],
  developer_approved BOOLEAN DEFAULT NULL,
  developer_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Only super admins (developers) can see AI analysis
CREATE POLICY "Super admins can manage AI analysis" 
ON public.ai_analysis 
FOR ALL 
USING (get_current_user_role_id() = 4)
WITH CHECK (get_current_user_role_id() = 4);

-- Create foreign key relationship to developer_messages
ALTER TABLE public.ai_analysis 
ADD CONSTRAINT ai_analysis_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES public.developer_messages(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_ai_analysis_message_id ON public.ai_analysis(message_id);
CREATE INDEX idx_ai_analysis_processed_at ON public.ai_analysis(processed_at DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_ai_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_analysis_updated_at
BEFORE UPDATE ON public.ai_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_analysis_updated_at();