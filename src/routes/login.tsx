import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/profile" }),
  head: () => ({
    meta: [
      { title: "Sign in — Auren" },
      { name: "description", content: "Sign in or register for your Auren contractor account." },
    ],
  }),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  company_name: z.string().trim().max(160).optional().or(z.literal("")),
  mobile: z.string().trim().min(7, "Mobile is required").max(20),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: "", company_name: "", mobile: "", email: "", password: "" });
  const { session } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    if (session) navigate({ to: search.redirect || "/profile" });
  }, [session, search.redirect, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
      } else {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setBusy(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
            data: {
              full_name: parsed.data.full_name,
              mobile: parsed.data.mobile,
              company_name: parsed.data.company_name || null,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to verify.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/profile" });
      if (result.error) toast.error("Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60";

  return (
    <div className="mx-auto max-w-md px-6 pt-12 pb-24">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <BrandLogo size={88} className="drop-shadow-[0_0_30px_rgba(212,175,55,0.35)]" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Contractor portal</p>
        <h1 className="font-display text-3xl sm:text-4xl">{mode === "signin" ? "Welcome back." : "Open an account."}</h1>
        <p className="text-sm text-muted-foreground mt-3 italic font-display">Quality you trust, relationships that last.</p>
      </div>

      <div className="border border-border/60 rounded-2xl p-6 sm:p-7 bg-card/50 backdrop-blur">
        <div className="flex bg-secondary/60 rounded-full p-1 text-sm mb-5">
          {(["signin", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full transition ${mode === m ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"}`}
            >
              {m === "signin" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full border border-border rounded-full py-3 text-sm flex items-center justify-center gap-2 hover:border-primary/60 transition disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.96h5.5c-.24 1.4-1.7 4.12-5.5 4.12-3.3 0-6-2.74-6-6.12s2.7-6.12 6-6.12c1.88 0 3.14.8 3.86 1.48l2.62-2.52C16.86 3.42 14.62 2.4 12 2.4 6.74 2.4 2.5 6.66 2.5 12s4.24 9.6 9.5 9.6c5.48 0 9.12-3.86 9.12-9.28 0-.62-.06-1.08-.16-1.56z"/></svg>
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> or email <span className="flex-1 h-px bg-border" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input required placeholder="Full name" className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input placeholder="Company / trading name" className={inputCls} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              <input required placeholder="Mobile (+27…)" className={inputCls} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </>
          )}
          <input required placeholder="Email" type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Password" type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={busy} className="w-full bg-gold-gradient text-primary-foreground font-medium px-6 py-3 rounded-full shadow-gold-glow mt-2 inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back home</Link>
      </p>
      <p className="text-center mt-8 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
        Secured by AurenFlow™ · POPIA-aware data handling
      </p>
    </div>
  );
}
