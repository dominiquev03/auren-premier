import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} />
            <div>
              <p className="font-display text-lg tracking-[0.18em] leading-none">AUREN</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Plumbing Supplies™</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground max-w-sm font-display italic">
            Quality you trust, relationships that last.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">Johannesburg · Cape Town · Durban</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-primary/70">Powered by AurenFlow™</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-sans font-medium">Explore</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">Products</Link></li>
            <li><Link to="/quotations" className="hover:text-foreground">Quotations</Link></li>
            <li><Link to="/orders" className="hover:text-foreground">Orders</Link></li>
            <li><Link to="/statements" className="hover:text-foreground">Statements</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-sans font-medium">Legal</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/legal/terms" className="hover:text-foreground">Terms of Service</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/legal/ip" className="hover:text-foreground">Intellectual Property</Link></li>
            <li><Link to="/support" className="hover:text-foreground">Support centre</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-8 text-[11px] text-muted-foreground space-y-3">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Auren Plumbing Supplies (Pty) Ltd. All Rights Reserved.
            <span className="block mt-2 text-muted-foreground/80">
              AurenFlow™, Auren Plumbing Supplies™, logos, branding, systems, content, designs,
              workflows, and platform structure are proprietary intellectual property of Auren
              Plumbing Supplies. Unauthorized copying, reproduction, resale, redistribution,
              reverse engineering, or commercial use is strictly prohibited.
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            VAT reg. 4xxxxxxxxx · Prices in ZAR incl. VAT · Quality you trust, relationships that last.
          </p>
        </div>
      </div>
    </footer>
  );
}
