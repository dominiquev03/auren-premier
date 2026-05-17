import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Support — Auren" }, { name: "description", content: "Talk to an Auren specifier. WhatsApp, phone or email — we're here." }] }),
});

function SupportPage() {
  return (
    <PageShell eyebrow="Concierge support" title="A specifier, on call." lead="Trade questions, technical specs, urgent orders — reach a real person in under 5 minutes.">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[
            { icon: MessageCircle, t: "WhatsApp", d: "+27 11 000 0000", a: "Chat now", link: "https://wa.me/27110000000" },
            { icon: Phone, t: "Trade line", d: "+27 11 000 0000", a: "Call", link: "tel:+27110000000" },
            { icon: Mail, t: "Email", d: "trade@aurensupplies.co.za", a: "Compose", link: "mailto:trade@aurensupplies.co.za" },
            { icon: MapPin, t: "Showroom", d: "12 Smit Street, Braamfontein, JHB", a: "Directions", link: "#" },
          ].map((c) => (
            <a key={c.t} href={c.link} className="flex items-center gap-5 border border-border/60 rounded-xl p-5 hover:border-primary/50 transition group">
              <div className="h-12 w-12 rounded-full bg-gold-gradient grid place-items-center text-primary-foreground">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-display text-lg">{c.t}</p>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </div>
              <span className="text-xs text-primary group-hover:translate-x-1 transition">{c.a} →</span>
            </a>
          ))}
        </div>
        <form className="border border-border/60 rounded-xl p-7 space-y-4">
          <h3 className="font-display text-2xl">Send us a message</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" className="bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
            <input placeholder="Company" className="bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
          </div>
          <input placeholder="Email" type="email" className="w-full bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
          <textarea placeholder="How can we help?" rows={6} className="w-full bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
          <button type="button" className="w-full bg-gold-gradient text-primary-foreground font-medium px-6 py-3 rounded-full shadow-gold-glow">Send message</button>
        </form>
      </div>
    </PageShell>
  );
}
