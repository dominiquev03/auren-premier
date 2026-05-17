import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { formatZAR } from "@/lib/products";
import { Truck, Package, CheckCircle2, Upload } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Orders — Auren" }, { name: "description", content: "Track your Auren orders, upload proof of payment, and follow deliveries." }] }),
});

const orders = [
  { id: "ORD-7820", date: "14 May 2026", total: 86430, stage: 3, status: "Out for delivery", eta: "Tomorrow", payment: "Paid" },
  { id: "ORD-7811", date: "09 May 2026", total: 12490, stage: 2, status: "Dispatched", eta: "16 May", payment: "Paid" },
  { id: "ORD-7799", date: "02 May 2026", total: 4899, stage: 4, status: "Delivered", eta: "Delivered", payment: "Paid" },
  { id: "ORD-7790", date: "28 Apr 2026", total: 38900, stage: 1, status: "Awaiting payment", eta: "—", payment: "Pending" },
];

const stages = ["Confirmed", "Packed", "Dispatched", "Out for delivery", "Delivered"];

function OrdersPage() {
  return (
    <PageShell eyebrow="Orders & delivery" title="Every order, every step." lead="Live status from warehouse to doorstep, with proof-of-payment upload built in." watermark>
      <div className="space-y-5">
        {orders.map((o) => (
          <div key={o.id} className="border border-border/60 rounded-xl p-6 hover:border-primary/40 transition">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">{o.id}</p>
                <h3 className="font-display text-xl mt-1">{formatZAR(o.total)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Placed {o.date} · ETA {o.eta}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-3 py-1.5 rounded-full border ${o.payment === "Paid" ? "border-primary/40 text-primary" : "border-destructive/50 text-destructive"}`}>
                  {o.payment}
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground">{o.status}</span>
                {o.payment !== "Paid" && (
                  <button className="inline-flex items-center gap-1.5 text-xs bg-gold-gradient text-primary-foreground px-3 py-1.5 rounded-full">
                    <Upload className="h-3 w-3" /> Upload POP
                  </button>
                )}
              </div>
            </div>
            {/* Tracker */}
            <div className="mt-6">
              <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full" style={{ width: `${(o.stage / (stages.length - 1)) * 100}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {stages.map((s, i) => (
                  <div key={s} className={`flex flex-col items-center gap-1 ${i <= o.stage ? "text-primary" : ""}`}>
                    {i === 0 && <Package className="h-3 w-3" />}
                    {i === 2 && <Truck className="h-3 w-3" />}
                    {i === 4 && <CheckCircle2 className="h-3 w-3" />}
                    <span className="text-center">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
