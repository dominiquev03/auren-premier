import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Auren" }, { name: "description", content: "Sign in to your Auren contractor account." }] }),
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  return (
    <div className="mx-auto max-w-md px-6 pt-16 pb-24">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <BrandLogo size={96} className="drop-shadow-[0_0_30px_rgba(212,175,55,0.35)]" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Contractor portal</p>
        <h1 className="font-display text-4xl">{mode === "signin" ? "Welcome back." : "Open an account."}</h1>
        <p className="text-sm text-muted-foreground mt-3 italic font-display">Quality you trust, relationships that last.</p>
      </div>
      <div className="border border-border/60 rounded-2xl p-7 bg-card/50 backdrop-blur">
        <div className="flex bg-secondary/60 rounded-full p-1 text-sm mb-6">
          {(["signin", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full transition ${mode === m ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"}`}
            >
              {m === "signin" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
        <form className="space-y-3">
          {mode === "register" && (
            <input placeholder="Trading name" className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60" />
          )}
          <input placeholder="Email" type="email" className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60" />
          <input placeholder="Password" type="password" className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60" />
          {mode === "register" && (
            <input placeholder="VAT number (optional)" className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60" />
          )}
          <button type="button" className="w-full bg-gold-gradient text-primary-foreground font-medium px-6 py-3 rounded-full shadow-gold-glow mt-2">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-5">
          {mode === "signin" ? "Forgot your password?" : "Approvals typically within 1 business day."}
        </p>
      </div>
      <p className="text-center mt-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back home</Link>
      </p>
      <p className="text-center mt-8 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
        Secured by AurenFlow™ · Enterprise-grade access control
      </p>
    </div>
  );
}
