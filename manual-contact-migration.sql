-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'archived')),
    source TEXT DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_submissions
CREATE POLICY "Allow anonymous insert for contact submissions"
    ON public.contact_submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update contact submissions"
    ON public.contact_submissions
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN public.contact_submissions.status IS 'Current status: new, in_progress, completed, archived';
COMMENT ON COLUMN public.contact_submissions.source IS 'Source of the submission (website, api, etc.)';
COMMENT ON COLUMN public.contact_submissions.metadata IS 'Additional metadata in JSON format';