import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/quotations", label: "Quotations" },
  { to: "/orders", label: "Orders" },
  { to: "/statements", label: "Statements" },
  { to: "/support", label: "Support" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="h-8 w-8 rounded-sm bg-gold-gradient grid place-items-center text-primary-foreground font-display font-bold text-base shadow-gold-glow">A</span>
          <span className="font-display text-lg tracking-wide">Auren</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="hidden md:inline-flex items-center gap-2 text-sm border border-border rounded-full px-4 py-2 hover:border-primary/50 transition">
            <User className="h-3.5 w-3.5" /> Account
          </Link>
          <Link to="/login" className="hidden md:inline-flex text-sm bg-gold-gradient text-primary-foreground font-medium px-4 py-2 rounded-full shadow-gold-glow hover:opacity-90 transition">
            Sign in
          </Link>
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
            <Link to="/profile" onClick={() => setOpen(false)} className="text-sm py-1.5 text-muted-foreground hover:text-foreground">Account</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm py-1.5 text-primary">Sign in</Link>
          </div>
        </div>
      )}
    </header>
  );
}
