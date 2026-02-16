
-- Table to store all user app data as JSON per user
CREATE TABLE public.user_app_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspaces jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  workspace_pages jsonb NOT NULL DEFAULT '{}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_app_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON public.user_app_data FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
ON public.user_app_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON public.user_app_data FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_user_app_data_updated_at
BEFORE UPDATE ON public.user_app_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
