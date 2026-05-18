import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Award, Fingerprint, Loader2, LogOut, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatZAR } from "@/lib/products";
import {
  disableBiometric,
  enrollBiometric,
  isEnrolled,
  isPlatformAuthAvailable,
} from "@/lib/biometric";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My profile — Auren" }] }),
});

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  company_name: string | null;
  account_type: "customer" | "contractor" | "sales_rep";
  vat_number: string | null;
  alt_contact: string | null;
  default_delivery_address: string | null;
  billing_address: string | null;
  preferred_branch: string | null;
  comm_method: string | null;
  notes: string | null;
  loyalty_points: number;
};

const empty: ProfileRow = {
  full_name: "",
  email: "",
  mobile: "",
  company_name: "",
  account_type: "customer",
  vat_number: "",
  alt_contact: "",
  default_delivery_address: "",
  billing_address: "",
  preferred_branch: "",
  comm_method: "",
  notes: "",
  loyalty_points: 0,
};

function ProfilePage() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    isPlatformAuthAvailable().then(setBioSupported);
  }, []);
  useEffect(() => {
    if (user) setBioEnabled(isEnrolled(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ ...empty, ...data });
        setLoading(false);
      });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        mobile: profile.mobile,
        company_name: profile.company_name,
        account_type: profile.account_type,
        vat_number: profile.vat_number,
        alt_contact: profile.alt_contact,
        default_delivery_address: profile.default_delivery_address,
        billing_address: profile.billing_address,
        preferred_branch: profile.preferred_branch,
        comm_method: profile.comm_method,
        notes: profile.notes,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved.");
  }

  async function toggleBiometric() {
    if (!user) return;
    setBioBusy(true);
    try {
      if (bioEnabled) {
        disableBiometric(user.id);
        setBioEnabled(false);
        toast.success("Biometric login disabled.");
      } else {
        await enrollBiometric(user.id, user.email ?? profile.email ?? "user");
        setBioEnabled(true);
        toast.success("Biometric login enabled.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update biometric setting.");
    } finally {
      setBioBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  const field = "w-full bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60";

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageShell eyebrow="My account" title={profile.full_name || "Welcome"} lead="Manage your contact details, delivery preferences, and loyalty rewards.">
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-primary/30 p-7">
          <div className="absolute inset-0 bg-gold-gradient opacity-10" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Auren rewards</p>
              <p className="font-display text-4xl mt-2 text-gold-gradient">{profile.loyalty_points.toLocaleString()} pts</p>
              <p className="text-sm text-muted-foreground mt-2">≈ {formatZAR(profile.loyalty_points)} redeemable</p>
            </div>
            <Award className="h-9 w-9 text-primary" />
          </div>
        </div>
        <div className="border border-border/60 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Account access</p>
          <div className="flex flex-wrap gap-2">
            {roles.length === 0 && <span className="text-xs text-muted-foreground">customer</span>}
            {roles.map((r) => (
              <span key={r} className="text-xs inline-flex items-center gap-1.5 border border-primary/40 text-primary rounded-full px-2.5 py-1">
                <ShieldCheck className="h-3 w-3" /> {r.replace("_", " ")}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Only the Super Admin can change account roles or pricing levels.</p>
        </div>
      </div>

      <div className="border border-border/60 rounded-xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Fingerprint className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Biometric login</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bioSupported
                ? bioEnabled
                  ? "Face ID / fingerprint unlock is enabled on this device."
                  : "Enable Face ID, fingerprint or device passcode for quick secure access."
                : "Not available on this device or browser."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleBiometric}
            disabled={!bioSupported || bioBusy}
            className={`text-xs px-4 py-2 rounded-full border transition disabled:opacity-50 ${bioEnabled ? "border-border hover:border-destructive/60 hover:text-destructive" : "border-primary text-primary hover:bg-primary/10"}`}
          >
            {bioBusy ? "…" : bioEnabled ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs px-4 py-2 rounded-full border border-border inline-flex items-center gap-1.5 hover:border-destructive/60 hover:text-destructive transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Section title="Contact details">
          <Field label="Full name"><input className={field} value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
          <Field label="Email"><input className={field} value={profile.email ?? ""} disabled /></Field>
          <Field label="Mobile number"><input className={field} value={profile.mobile ?? ""} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} /></Field>
          <Field label="Alternative contact"><input className={field} value={profile.alt_contact ?? ""} onChange={(e) => setProfile({ ...profile, alt_contact: e.target.value })} /></Field>
          <Field label="Preferred communication">
            <select className={field} value={profile.comm_method ?? ""} onChange={(e) => setProfile({ ...profile, comm_method: e.target.value })}>
              <option value="">Select…</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </Field>
        </Section>

        <Section title="Company & billing">
          <Field label="Company / trading name"><input className={field} value={profile.company_name ?? ""} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} /></Field>
          <Field label="Account type">
            <select className={field} value={profile.account_type} onChange={(e) => setProfile({ ...profile, account_type: e.target.value as ProfileRow["account_type"] })}>
              <option value="customer">Customer</option>
              <option value="contractor">Contractor</option>
              <option value="sales_rep">Sales Representative</option>
            </select>
          </Field>
          <Field label="VAT number"><input className={field} value={profile.vat_number ?? ""} onChange={(e) => setProfile({ ...profile, vat_number: e.target.value })} /></Field>
          <Field label="Preferred branch / rep"><input className={field} value={profile.preferred_branch ?? ""} onChange={(e) => setProfile({ ...profile, preferred_branch: e.target.value })} /></Field>
          <Field label="Billing address"><textarea rows={2} className={field} value={profile.billing_address ?? ""} onChange={(e) => setProfile({ ...profile, billing_address: e.target.value })} /></Field>
        </Section>

        <Section title="Delivery">
          <Field label="Default delivery address"><textarea rows={3} className={field} value={profile.default_delivery_address ?? ""} onChange={(e) => setProfile({ ...profile, default_delivery_address: e.target.value })} /></Field>
        </Section>

        <Section title="Notes / special instructions">
          <Field label="Notes"><textarea rows={3} className={field} value={profile.notes ?? ""} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} /></Field>
        </Section>

        <div className="md:col-span-2 flex justify-end">
          <button disabled={saving} className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-medium px-6 py-3 rounded-full shadow-gold-glow disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border/60 rounded-xl p-6">
      <h3 className="font-display text-lg mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
