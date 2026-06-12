import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface ArchiveRecord {
  id: string;
  filename: string;
  dashboard_data: any;
  created_at: string;
}

interface ArchiveState {
  archives: ArchiveRecord[];
  loading: boolean;
  fetchArchives: () => Promise<void>;
  saveArchive: (filename: string, dashboardData: any) => Promise<void>;
}

export const useBriefArchive = create<ArchiveState>((set) => ({
  archives: [],
  loading: false,

  // Pulls all past briefs from Supabase, newest first
  fetchArchives: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("brief_archives")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) set({ archives: data });
    } catch (err: any) {
      console.error("Failed to fetch archives:", err.message);
    } finally {
      set({ loading: false });
    }
  },

  // Saves a freshly generated brief payload to the cloud database
  saveArchive: async (filename, dashboardData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("brief_archives")
        .insert([
          {
            user_id: user.id,
            filename: filename,
            dashboard_data: dashboardData,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistically push the new archive to the top of our local state
      if (data) {
        set((state) => ({ archives: [data, ...state.archives] }));
      }
    } catch (err: any) {
      console.error("Failed to save archive:", err.message);
    }
  },
}));
