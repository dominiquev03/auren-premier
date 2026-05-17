import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Award, Repeat, FileText, PackageSearch, Receipt, Clock, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-faucet.jpg";
import { products, formatZAR } from "@/lib/products";

const recentOrders = [
  { id: "ORD-7820", items: "14 items · Geberit + Cobra", total: 86430, eta: "Tomorrow, JHB" },
  { id: "ORD-7811", items: "6 items · PVC fittings", total: 12490, eta: "16 May, PTA" },
];

const savedLists = [
  { name: "Sandton Penthouse — Bathroom 2", count: 28 },
  { name: "Standard 3-bed callout kit", count: 42 },
  { name: "Geyser replacement bundle", count: 11 },
];

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Auren Plumbing Supplies — Premium plumbing, South Africa" },
      { name: "description", content: "Luxury plumbing supplies for contractors and architects. Quote, order, track and reward — all in one place." },
    ],
  }),
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-6">Auren · Est. South Africa</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02]">
              The standard for <span className="text-gold-gradient italic">refined</span> plumbing.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Curated brassware, fittings and bathware for the country's most discerning builds.
              Quote in seconds, order in confidence, deliver on time — every time.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-medium px-6 py-3.5 rounded-full shadow-gold-glow hover:opacity-90 transition">
                Browse catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/quotations" className="inline-flex items-center gap-2 border border-border px-6 py-3.5 rounded-full text-sm hover:border-primary/60 transition">
                Request a quotation
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: "12k+", v: "Contractors" },
                { k: "48h", v: "Avg. delivery" },
                { k: "4.9★", v: "Trade rating" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl text-gold-gradient">{s.k}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-10 bg-gold-gradient opacity-10 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden shadow-luxe">
              <img src={heroImg} alt="Brushed gold luxury faucet" width={1600} height={1200} className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">Featured</p>
                  <p className="font-display text-xl mt-1">Aurelia Collection</p>
                </div>
                <span className="text-sm bg-background/60 backdrop-blur border border-border/60 px-3 py-1.5 rounded-full">From R 4 899</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-border/40">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, t: "Trade-grade quality", d: "Every SKU SABS-tested and warranty-backed." },
            { icon: Truck, t: "Nationwide delivery", d: "Door-to-door across all 9 provinces." },
            { icon: Sparkles, t: "Account financing", d: "30-day terms for approved contractors." },
            { icon: Award, t: "Loyalty rewards", d: "Earn points on every order, redeem at checkout." },
          ].map((f) => (
            <div key={f.t} className="border border-border/60 rounded-xl p-6 hover:border-primary/50 transition group">
              <f.icon className="h-6 w-6 text-primary mb-5" />
              <h3 className="font-display text-lg">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Signature pieces</p>
            <h2 className="font-display text-4xl md:text-5xl">Crafted to be specified.</h2>
          </div>
          <Link to="/products" className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((p) => (
            <article key={p.id} className="group border border-border/60 rounded-xl overflow-hidden bg-card hover:border-primary/40 transition">
              <div className="aspect-square overflow-hidden bg-secondary">
                <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-primary">{p.category}</p>
                <h3 className="font-display text-lg mt-2 leading-snug">{p.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-medium">{formatZAR(p.price)}</span>
                  <span className="text-xs text-muted-foreground">{p.sku}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gold-gradient opacity-[0.08]" />
          <p className="relative text-xs uppercase tracking-[0.3em] text-primary">Contractor account</p>
          <h2 className="relative font-display text-4xl md:text-5xl mt-4 max-w-2xl mx-auto">Built for the trade. Polished for the brand.</h2>
          <p className="relative mt-5 text-muted-foreground max-w-xl mx-auto">
            Open a contractor account and unlock pricing, statements, loyalty points and a dedicated specifier.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="bg-gold-gradient text-primary-foreground font-medium px-6 py-3.5 rounded-full shadow-gold-glow">Open an account</Link>
            <Link to="/support" className="border border-border px-6 py-3.5 rounded-full text-sm hover:border-primary/60 transition">Talk to specifier</Link>
          </div>
        </div>
      </section>
    </>
  );
}
