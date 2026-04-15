import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

type AdminAccessResponse = {
  adminExists: boolean;
  isAdmin?: boolean;
  claimed?: boolean;
};

type AdminAuthResult = {
  success: boolean;
  requiresConfirmation?: boolean;
  message?: string;
};

interface AdminAuthState {
  adminExists: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<AdminAuthResult>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<AdminAuthResult>;
}

let authListenerInitialized = false;

const fetchAdminSetup = async (): Promise<Pick<AdminAccessResponse, "adminExists">> => {
  const { data, error } = await supabase.functions.invoke<Pick<AdminAccessResponse, "adminExists">>("admin-access", {
    body: { action: "setup" },
  });

  if (error) throw error;

  return {
    adminExists: Boolean(data?.adminExists),
  };
};

const fetchAdminStatus = async (action: "status" | "bootstrap") => {
  const { data, error } = await supabase.functions.invoke<AdminAccessResponse>("admin-access", {
    body: { action },
  });

  if (error) throw error;

  return {
    adminExists: Boolean(data?.adminExists),
    claimed: Boolean(data?.claimed),
    isAdmin: Boolean(data?.isAdmin),
  };
};

export const useAdminAuth = create<AdminAuthState>((set, get) => {
  const applyLoggedOutState = async () => {
    const setup = await fetchAdminSetup().catch(() => ({ adminExists: true }));

    set({
      adminExists: setup.adminExists,
      initialized: true,
      isAuthenticated: false,
      isLoading: false,
    });

    return setup;
  };

  const syncAdminState = async (action: "status" | "bootstrap" = "status") => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return applyLoggedOutState();
    }

    const access = await fetchAdminStatus(action);

    set({
      adminExists: access.adminExists,
      initialized: true,
      isAuthenticated: access.isAdmin,
      isLoading: false,
    });

    return access;
  };

  return {
    adminExists: true,
    initialized: false,
    isAuthenticated: false,
    isLoading: true,
    initialize: async () => {
      if (!authListenerInitialized) {
        authListenerInitialized = true;

        supabase.auth.onAuthStateChange((_event, session) => {
          void (async () => {
            if (!session) {
              await applyLoggedOutState();
              return;
            }

            try {
              await syncAdminState("status");
            } catch {
              set({
                adminExists: true,
                initialized: true,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          })();
        });
      }

      if (get().initialized && !get().isLoading) return;

      set({ isLoading: true });

      try {
        await syncAdminState("status");
      } catch {
        await applyLoggedOutState();
      }
    },
    login: async (email, password) => {
      set({ isLoading: true });

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        set({ isLoading: false });
        return { message: error.message, success: false };
      }

      try {
        const access = await syncAdminState("bootstrap");

        if (!access.isAdmin) {
          await supabase.auth.signOut();
          await applyLoggedOutState();

          return {
            message: access.adminExists
              ? "This account does not have admin access."
              : "Unable to grant admin access to this account.",
            success: false,
          };
        }

        return { success: true };
      } catch (error) {
        await supabase.auth.signOut();
        await applyLoggedOutState();

        return {
          message: error instanceof Error ? error.message : "Unable to complete admin login.",
          success: false,
        };
      }
    },
    logout: async () => {
      await supabase.auth.signOut();
      await applyLoggedOutState();
    },
    signup: async (email, password, fullName) => {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        set({ isLoading: false });
        return { message: error.message, success: false };
      }

      if (!data.session) {
        const setup = await applyLoggedOutState();

        return {
          requiresConfirmation: true,
          success: true,
          message: setup.adminExists
            ? "Account created. Check your email to confirm it, then log in here."
            : "First admin account created. Check your email to confirm it, then log in here.",
        };
      }

      try {
        const access = await syncAdminState("bootstrap");

        if (!access.isAdmin) {
          await supabase.auth.signOut();
          await applyLoggedOutState();

          return {
            message: "This account is not authorized for admin access.",
            success: false,
          };
        }

        return { success: true };
      } catch (caughtError) {
        await supabase.auth.signOut();
        await applyLoggedOutState();

        return {
          message: caughtError instanceof Error ? caughtError.message : "Unable to create the admin account.",
          success: false,
        };
      }
    },
  };
});
