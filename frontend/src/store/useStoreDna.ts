import { create } from "zustand";
import { supabase } from "../lib/supabase";

// 1. Define the TypeScript shape of our Store DNA
interface StoreDna {
  storeName: string;
  targetAov: number;
  targetRevenue: number;
}

// 2. Define what our Global Register holds and what it can DO
interface DnaState {
  // --- ORIGINAL DNA STATE ---
  dna: StoreDna;
  loading: boolean;
  fetchDna: () => Promise<void>;
  updateDna: (newDna: Partial<StoreDna>) => Promise<void>;

  // --- NEW INTEGRATION STATE ---
  isShopifyConnected: boolean;
  shopDomain: string | null;
  lastSyncTime: string | null;
  setShopifyConnection: (
    isConnected: boolean,
    domain: string,
    syncTime: string,
  ) => void;
}

// 3. Create the SINGLE actual hook
export const useStoreDna = create<DnaState>((set, get) => ({
  // ==========================
  // INITIAL VALUES
  // ==========================
  dna: {
    storeName: "",
    targetAov: 0,
    targetRevenue: 0,
  },
  loading: false,

  // New integration default values
  isShopifyConnected: false,
  shopDomain: null,
  lastSyncTime: null,

  // ==========================
  // ACTIONS
  // ==========================

  // Action A: Fetch DNA from Supabase
  fetchDna: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("dna")
        .single(); // We only expect exactly ONE row per user

      if (error && error.code !== "PGRST116") throw error; // Ignore "no rows found" error code

      if (data?.dna) {
        set({ dna: data.dna });
      }
    } catch (err: any) {
      console.error("Error fetching Store DNA:", err.message);
    } finally {
      set({ loading: false });
    }
  },

  // Action B: Save/Update DNA in Supabase
  updateDna: async (newDna) => {
    set({ loading: true });
    try {
      // Merge old DNA state with the newly typed edits
      const updatedDna = { ...get().dna, ...newDna };

      // Get the currently logged-in user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Upsert: Try updating if it exists; if not, insert a new row
      const { error } = await supabase.from("store_settings").upsert(
        {
          user_id: user.id,
          dna: updatedDna,
        },
        { onConflict: "user_id" },
      ); // If user_id row exists, overwrite it

      if (error) throw error;

      // Update local Zustand RAM state so UI flashes instantly
      set({ dna: updatedDna });
    } catch (err: any) {
      alert(`Failed to save DNA: ${err.message}`);
    } finally {
      set({ loading: false });
    }
  },

  // Action C: Update Shopify Connection Status
  setShopifyConnection: (isConnected, domain, syncTime) =>
    set({
      isShopifyConnected: isConnected,
      shopDomain: domain,
      lastSyncTime: syncTime,
    }),
}));
