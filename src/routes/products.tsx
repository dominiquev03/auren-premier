import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { products, formatZAR } from "@/lib/products";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products — Auren Plumbing Supplies" }, { name: "description", content: "Browse the full Auren catalogue of premium plumbing supplies." }] }),
});

const categories = ["All", "Taps & Mixers", "Showers", "Baths", "Fittings"];

function ProductsPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const filtered = products.filter(
    (p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageShell eyebrow="The catalogue" title="Premium plumbing, curated." lead="Every product is trade-tested, warranty-backed and ready for specification.">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm border transition ${cat === c ? "bg-gold-gradient text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SKU or product…"
            className="w-full bg-input/40 border border-border rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <article key={p.id} className="group border border-border/60 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition">
            <div className="aspect-square overflow-hidden bg-secondary">
              <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-widest text-primary">{p.category}</p>
              <h3 className="font-display text-lg mt-2 leading-snug">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">{formatZAR(p.price)}</span>
                <button className="text-xs bg-gold-gradient text-primary-foreground px-3 py-1.5 rounded-full">Add to quote</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
