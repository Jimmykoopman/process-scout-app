import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, Page, WorkspacePage, Document } from '@/types/journey';

export interface UserAppData {
  workspaces: Workspace[];
  pageData: Record<string, any>;
  pages: Page[];
  workspacePages: Record<string, WorkspacePage[]>;
  documents: Document[];
}

const DEFAULT_DATA: UserAppData = {
  workspaces: [{ id: 'default', name: 'Klant Reis', type: 'mindmap', data: { stages: [] } }],
  pageData: { 'default': { stages: [] } },
  pages: [],
  workspacePages: {},
  documents: [],
};

export function useUserData(userId: string) {
  const [data, setData] = useState<UserAppData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<UserAppData>(DEFAULT_DATA);

  // Keep ref in sync
  dataRef.current = data;

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      const { data: row, error } = await supabase
        .from('user_app_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
        return;
      }

      if (row) {
        const loaded: UserAppData = {
          workspaces: (row.workspaces as any) || DEFAULT_DATA.workspaces,
          pageData: (row.page_data as any) || DEFAULT_DATA.pageData,
          pages: (row.pages as any) || DEFAULT_DATA.pages,
          workspacePages: (row.workspace_pages as any) || DEFAULT_DATA.workspacePages,
          documents: (row.documents as any) || DEFAULT_DATA.documents,
        };
        setData(loaded);
        dataRef.current = loaded;
      } else {
        // Create initial row for new user
        await supabase.from('user_app_data').insert({
          user_id: userId,
          workspaces: DEFAULT_DATA.workspaces as any,
          page_data: DEFAULT_DATA.pageData as any,
          pages: DEFAULT_DATA.pages as any,
          workspace_pages: DEFAULT_DATA.workspacePages as any,
          documents: DEFAULT_DATA.documents as any,
        });
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  // Debounced save - stable reference
  const saveToDb = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const current = dataRef.current;
      await supabase
        .from('user_app_data')
        .update({
          workspaces: current.workspaces as any,
          page_data: current.pageData as any,
          pages: current.pages as any,
          workspace_pages: current.workspacePages as any,
          documents: current.documents as any,
        })
        .eq('user_id', userId);
    }, 1000);
  }, [userId]);

  const updateData = useCallback((partial: Partial<UserAppData>) => {
    setData(prev => {
      const next = { ...prev, ...partial };
      dataRef.current = next;
      return next;
    });
    saveToDb();
  }, [saveToDb]);

  // Cleanup on unmount - save any pending changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save immediately on unmount
        const current = dataRef.current;
        supabase
          .from('user_app_data')
          .update({
            workspaces: current.workspaces as any,
            page_data: current.pageData as any,
            pages: current.pages as any,
            workspace_pages: current.workspacePages as any,
            documents: current.documents as any,
          })
          .eq('user_id', userId);
      }
    };
  }, [userId]);

  return { data, updateData, loading };
}
