import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { formatZAR } from "@/lib/products";
import { FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/quotations")({
  component: QuotationsPage,
  head: () => ({ meta: [{ title: "Quotations — Auren" }, { name: "description", content: "Request and manage your Auren quotations." }] }),
});

const quotes = [
  { id: "QTN-2104", date: "12 May 2026", items: 14, total: 48750, status: "Awaiting approval" },
  { id: "QTN-2098", date: "04 May 2026", items: 6, total: 12490, status: "Approved" },
  { id: "QTN-2085", date: "21 Apr 2026", items: 22, total: 86430, status: "Converted to order" },
];

function QuotationsPage() {
  return (
    <PageShell eyebrow="Trade quotations" title="Quote it. Specify it. Win it." lead="Build line-item quotes in seconds, share with your client, convert to order in a click.">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{quotes.length} active quotations</p>
        <button className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-full shadow-gold-glow">
          <Plus className="h-4 w-4" /> New quotation
        </button>
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
    </PageShell>
  );
}
