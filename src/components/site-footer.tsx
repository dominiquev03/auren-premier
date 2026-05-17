import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-sm bg-gold-gradient grid place-items-center text-primary-foreground font-display font-bold text-base">A</span>
            <span className="font-display text-lg tracking-wide">Auren Plumbing Supplies</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm font-display italic">
            Quality you trust, relationships that last.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">Johannesburg · Cape Town · Durban</p>
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
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-sans font-medium">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>+27 11 000 0000</li>
            <li>trade@aurensupplies.co.za</li>
            <li><Link to="/support" className="hover:text-foreground">Support centre</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Auren Plumbing Supplies (Pty) Ltd. All rights reserved.</span>
          <span>VAT reg. 4xxxxxxxxx · Prices in ZAR incl. VAT.</span>
        </div>
      </div>
    </footer>
  );
}
