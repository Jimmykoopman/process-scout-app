-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create workspace_permissions table
CREATE TABLE IF NOT EXISTS public.workspace_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, workspace_id)
);

ALTER TABLE public.workspace_permissions ENABLE ROW LEVEL SECURITY;

-- Teams RLS policies
DO $$ BEGIN
  CREATE POLICY "Users can view teams they are members of"
    ON public.teams FOR SELECT
    TO authenticated
    USING (
      owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update their teams"
    ON public.teams FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create teams"
    ON public.teams FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete their teams"
    ON public.teams FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Team members RLS policies
DO $$ BEGIN
  CREATE POLICY "Users can view team members of their teams"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.teams
        WHERE teams.id = team_members.team_id
        AND (teams.owner_id = auth.uid() OR team_members.user_id = auth.uid())
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners and admins can add team members"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.teams
        WHERE teams.id = team_members.team_id
        AND (
          teams.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
          )
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners and admins can update team members"
    ON public.team_members FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.teams
        WHERE teams.id = team_members.team_id
        AND (
          teams.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
          )
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners and admins can delete team members"
    ON public.team_members FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.teams
        WHERE teams.id = team_members.team_id
        AND (
          teams.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
          )
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Workspace permissions RLS policies
DO $$ BEGIN
  CREATE POLICY "Users can view their workspace permissions"
    ON public.workspace_permissions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.id = workspace_permissions.team_member_id
        AND team_members.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage workspace permissions"
    ON public.workspace_permissions FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        JOIN public.team_members target ON target.id = workspace_permissions.team_member_id
        WHERE tm.team_id = target.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for teams updated_at
DO $$ BEGIN
  CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;