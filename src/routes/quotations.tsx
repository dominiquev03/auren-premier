import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { formatZAR } from "@/lib/products";
import { FileText, Plus, Image as ImageIcon, Mic, Video, MapPin } from "lucide-react";
import { QuoteRequestComposer } from "@/components/quote-request-composer";

export const Route = createFileRoute("/quotations")({
  component: QuotationsPage,
  validateSearch: (s: Record<string, unknown>) => ({ new: s.new === "1" || s.new === 1 ? 1 : undefined }) as { new?: 1 },
  head: () => ({ meta: [{ title: "Quotations — Auren" }, { name: "description", content: "Request and manage your Auren quotations." }] }),
});

const quotes = [
  { id: "QTN-2104", date: "12 May 2026", items: 14, total: 48750, status: "Awaiting approval" },
  { id: "QTN-2098", date: "04 May 2026", items: 6, total: 12490, status: "Approved" },
  { id: "QTN-2085", date: "21 Apr 2026", items: 22, total: 86430, status: "Converted to order" },
];

function QuotationsPage() {
  const search = useSearch({ from: "/quotations" });
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (search.new === 1) setOpen(true);
  }, [search.new]);

  return (
    <PageShell eyebrow="Trade quotations" title="Quote it. Specify it. Win it." lead="Snap a photo, record a voice note, drop a pin — we'll quote it. As simple as WhatsApp.">
      {/* Fast request card */}
      <div className="mb-8 relative overflow-hidden rounded-2xl border border-primary/30 p-6 md:p-8">
        <div className="absolute inset-0 bg-gold-gradient opacity-[0.06]" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">30-second request</p>
            <h2 className="font-display text-2xl md:text-3xl mt-2">On site? Send it now.</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5 text-primary" /> Photos</span>
              <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-primary" /> Video</span>
              <span className="inline-flex items-center gap-1.5"><Mic className="h-3.5 w-3.5 text-primary" /> Voice notes</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> GPS pin</span>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground text-sm font-medium px-6 py-3 rounded-full shadow-gold-glow shrink-0">
            <Plus className="h-4 w-4" /> New quotation
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{quotes.length} active quotations</p>
      </div>
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-4 px-5">Reference</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Items</th>
              <th className="py-4 px-5">Total</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-border/60 hover:bg-secondary/30 transition">
                <td className="py-4 px-5 font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{q.id}</td>
                <td className="py-4 px-5 text-muted-foreground">{q.date}</td>
                <td className="py-4 px-5 text-muted-foreground">{q.items}</td>
                <td className="py-4 px-5 font-medium">{formatZAR(q.total)}</td>
                <td className="py-4 px-5"><span className="text-xs border border-primary/40 text-primary px-2.5 py-1 rounded-full">{q.status}</span></td>
                <td className="py-4 px-5 text-right"><button className="text-xs text-primary hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <QuoteRequestComposer open={open} onClose={() => setOpen(false)} />
    </PageShell>
  );
}
