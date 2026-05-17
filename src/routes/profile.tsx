import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Award, TrendingUp, Building2, Wrench } from "lucide-react";
import { formatZAR } from "@/lib/products";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Contractor dashboard — Auren" }, { name: "description", content: "Your contractor profile, loyalty rewards and account summary." }] }),
});

function ProfilePage() {
  return (
    <PageShell eyebrow="Contractor dashboard" title="Welcome back, Sipho." lead="Your account at a glance — spend, rewards and active jobs.">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Loyalty card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-primary/30 p-8">
          <div className="absolute inset-0 bg-gold-gradient opacity-10" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Auren Gold Tier</p>
              <p className="font-display text-5xl mt-3 text-gold-gradient">2,840 pts</p>
              <p className="text-sm text-muted-foreground mt-2">≈ {formatZAR(2840)} redeemable at checkout</p>
            </div>
            <Award className="h-10 w-10 text-primary" />
          </div>
          <div className="relative mt-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Gold</span><span>Platinum at 5,000 pts</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gold-gradient" style={{ width: "57%" }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: TrendingUp, l: "YTD spend", v: formatZAR(412500) },
            { icon: Building2, l: "Active jobs", v: "7" },
            { icon: Wrench, l: "Open quotes", v: "3" },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-4 border border-border/60 rounded-xl p-5">
              <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center"><s.icon className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
                <p className="font-display text-xl mt-0.5">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account details */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="border border-border/60 rounded-xl p-7">
          <h3 className="font-display text-xl mb-5">Company details</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Trading name", "Mokoena Plumbing & Drainage"],
              ["Account no.", "AU-104829"],
              ["VAT number", "4720198345"],
              ["Credit limit", formatZAR(150000)],
              ["Terms", "30 days from statement"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 pb-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="border border-border/60 rounded-xl p-7">
          <h3 className="font-display text-xl mb-5">Primary contact</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Name", "Sipho Mokoena"],
              ["Role", "Director"],
              ["Mobile", "+27 82 555 1100"],
              ["Email", "sipho@mokoenaplumbing.co.za"],
              ["Delivery hub", "Johannesburg"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 pb-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageShell>
  );
}
