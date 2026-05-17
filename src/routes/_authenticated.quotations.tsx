import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { FileText, Plus, Image as ImageIcon, Mic, Video, MapPin, Loader2 } from "lucide-react";
import { QuoteRequestComposer } from "@/components/quote-request-composer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/quotations")({
  component: QuotationsPage,
  validateSearch: (s: Record<string, unknown>) => ({ new: s.new === "1" || s.new === 1 ? 1 : undefined }) as { new?: 1 },
  head: () => ({ meta: [{ title: "Quotations — Auren" }] }),
});

type QuoteRow = {
  id: string;
  message: string | null;
  urgency: "standard" | "priority" | "urgent";
  status: "new" | "in_review" | "quoted" | "closed";
  site_address: string | null;
  created_at: string;
};

function QuotationsPage() {
  const search = useSearch({ from: "/_authenticated/quotations" });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (search.new === 1) setOpen(true);
  }, [search.new]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("quote_requests")
      .select("id,message,urgency,status,site_address,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setQuotes((data ?? []) as QuoteRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function onComposerClose() {
    setOpen(false);
    load();
  }

  return (
    <PageShell eyebrow="Trade quotations" title="Quote it. Specify it. Win it." lead="Snap a photo, record a voice note, drop a pin — we'll quote it. As simple as WhatsApp." watermark>
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

      {loading ? (
        <div className="py-12 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : quotes.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-10 text-center">
          <FileText className="h-6 w-6 text-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">No quotations yet. Send your first one in under 30 seconds.</p>
        </div>
      ) : (
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_140px_180px_140px] gap-3 bg-secondary/50 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span>Request</span><span>Urgency</span><span>Date</span><span>Site</span><span>Status</span>
          </div>
          {quotes.map((q) => (
            <div key={q.id} className="grid md:grid-cols-[1fr_120px_140px_180px_140px] gap-2 md:gap-3 border-t border-border/60 px-5 py-4 hover:bg-secondary/30 transition text-sm">
              <span className="font-medium truncate flex items-center gap-2"><FileText className="h-4 w-4 text-primary shrink-0" />{q.message?.slice(0, 80) || "(media-only request)"}</span>
              <span className="capitalize text-muted-foreground">{q.urgency}</span>
              <span className="text-muted-foreground">{new Date(q.created_at).toLocaleDateString("en-ZA")}</span>
              <span className="text-muted-foreground truncate">{q.site_address || "—"}</span>
              <span><span className="text-xs border border-primary/40 text-primary px-2.5 py-1 rounded-full capitalize">{q.status.replace("_", " ")}</span></span>
            </div>
          ))}
        </div>
      )}
      <QuoteRequestComposer open={open} onClose={onComposerClose} />
    </PageShell>
  );
}
