import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { formatZAR } from "@/lib/products";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/statements")({
  component: StatementsPage,
  head: () => ({ meta: [{ title: "Statements & invoices — Auren" }, { name: "description", content: "Download invoices and monthly statements for your Auren account." }] }),
});

const docs = [
  { id: "INV-9921", type: "Invoice", date: "14 May 2026", ref: "ORD-7820", amount: 86430 },
  { id: "STM-0526", type: "Statement", date: "01 May 2026", ref: "Monthly", amount: 124320 },
  { id: "INV-9908", type: "Invoice", date: "09 May 2026", ref: "ORD-7811", amount: 12490 },
  { id: "INV-9890", type: "Invoice", date: "02 May 2026", ref: "ORD-7799", amount: 4899 },
];

function StatementsPage() {
  return (
    <PageShell eyebrow="Account ledger" title="Statements & invoices." lead="Every document, archived and downloadable — built for accounts payable." watermark>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { l: "Current balance", v: formatZAR(28430) },
          { l: "30 days", v: formatZAR(86430) },
          { l: "60+ days", v: formatZAR(0) },
        ].map((s) => (
          <div key={s.l} className="border border-border/60 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
            <p className="font-display text-3xl mt-2 text-gold-gradient">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-4 px-5">Document</th>
              <th className="py-4 px-5">Type</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Reference</th>
              <th className="py-4 px-5">Amount</th>
              <th className="py-4 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-border/60 hover:bg-secondary/30">
                <td className="py-4 px-5 font-medium">{d.id}</td>
                <td className="py-4 px-5 text-muted-foreground">{d.type}</td>
                <td className="py-4 px-5 text-muted-foreground">{d.date}</td>
                <td className="py-4 px-5 text-muted-foreground">{d.ref}</td>
                <td className="py-4 px-5">{formatZAR(d.amount)}</td>
                <td className="py-4 px-5 text-right">
                  <button className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Download className="h-3 w-3" /> PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
