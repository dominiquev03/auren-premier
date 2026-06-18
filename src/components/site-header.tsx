import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User, LogOut, ShieldCheck, Crown } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/quote", label: "Get a quote" },
  { to: "/orders", label: "Orders" },
  { to: "/deliveries", label: "Deliveries" },
  { to: "/statements", label: "Statements" },
  { to: "/support", label: "Support" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, isStaff, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <BrandLogo size={36} className="drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]" />
          <span className="font-display text-lg tracking-[0.18em]">AUREN</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
          {isStaff && (
            <Link to="/admin" className="text-sm text-primary inline-flex items-center gap-1.5" activeProps={{ className: "underline" }}>
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link to="/profile" className="hidden md:inline-flex items-center gap-2 text-sm border border-border rounded-full px-4 py-2 hover:border-primary/50 transition">
                <User className="h-3.5 w-3.5" /> Account
              </Link>
              <button onClick={handleSignOut} className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden md:inline-flex text-sm bg-gold-gradient text-primary-foreground font-medium px-4 py-2 rounded-full shadow-gold-glow hover:opacity-90 transition">
              Sign in
            </Link>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm py-1.5 text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            {isStaff && (
              <Link to="/admin" onClick={() => setOpen(false)} className="text-sm py-1.5 text-primary inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {session ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm py-1.5 text-muted-foreground hover:text-foreground">Account</Link>
                <button onClick={handleSignOut} className="text-sm py-1.5 text-left text-muted-foreground">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm py-1.5 text-primary">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
