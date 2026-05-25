import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "quote.status_changed"
  | "user.role_granted"
  | "user.role_revoked"
  | "user.profile_updated"
  | "pricing.changed"
  | "inventory.changed"
  | "payment.recorded"
  | "auth.signed_in"
  | "auth.signed_out";

export async function audit(
  action: AuditAction,
  opts: { resourceType?: string; resourceId?: string; metadata?: Record<string, unknown> } = {},
) {
  try {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return;
    await supabase.from("audit_logs").insert({
      actor_id: u.id,
      actor_email: u.email ?? null,
      action,
      resource_type: opts.resourceType ?? null,
      resource_id: opts.resourceId ?? null,
      metadata: (opts.metadata ?? null) as never,
    });
  } catch {
    /* never block UX on audit failure */
  }
}
