import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "super_admin"
  | "admin"
  | "sales"
  | "delivery"
  | "warehouse"
  | "accounting"
  | "customer";

export const STAFF_ROLES: AppRole[] = ["super_admin", "admin", "sales", "delivery", "warehouse", "accounting"];

type AuthState = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAny: (roles: AppRole[]) => boolean;
  can: (action: Permission) => boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

export type Permission =
  | "quotes.manage"
  | "orders.manage"
  | "inventory.manage"
  | "payments.manage"
  | "pricing.edit"
  | "users.manage"
  | "settings.manage"
  | "audit.view";

const PERMISSION_MATRIX: Record<Permission, AppRole[]> = {
  "quotes.manage": ["super_admin", "admin", "sales"],
  "orders.manage": ["super_admin", "admin", "sales", "delivery"],
  "inventory.manage": ["super_admin", "admin", "warehouse"],
  "payments.manage": ["super_admin", "admin", "accounting"],
  "pricing.edit": ["super_admin", "admin"],
  "users.manage": ["super_admin"],
  "settings.manage": ["super_admin"],
  "audit.view": ["super_admin"],
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRoles(userId: string | undefined) {
    if (!userId) {
      setRoles([]);
      return;
    }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => {
        loadRoles(s?.user.id);
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRoles(data.session?.user.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAny = (rs: AppRole[]) => rs.some((r) => roles.includes(r));
  const can = (action: Permission) => hasAny(PERMISSION_MATRIX[action]);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    roles,
    loading,
    isStaff: hasAny(STAFF_ROLES),
    isSuperAdmin: hasRole("super_admin"),
    isAdmin: hasAny(["super_admin", "admin"]),
    hasRole,
    hasAny,
    can,
    signOut: async () => {
      try {
        const { clearVerified } = await import("@/lib/biometric");
        clearVerified();
      } catch { /* ignore */ }
      await supabase.auth.signOut();
    },
    refreshRoles: async () => loadRoles(session?.user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
