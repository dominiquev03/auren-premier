import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_ORDER, statusTone, type Delivery, type DeliveryStatus } from "@/lib/deliveries";
import { Truck, Loader2, MapPin, PenLine, FileText, Package, ImageIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deliveries")({
  component: DeliveriesPage,
  head: () => ({ meta: [{ title: "Deliveries — Auren" }] }),
});

type Event = { id: string; status: DeliveryStatus; note: string | null; created_at: string };
type Photo = { id: string; storage_path: string; caption: string | null };

function DeliveriesPage() {
  const { user, isStaff, hasAny } = useAuth();
  const isDriver = hasAny(["delivery", "super_admin", "admin"]);
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sigUrl, setSigUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("deliveries" as never)
      .select("*")
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setRows(((data ?? []) as unknown) as Delivery[]);
    setLoading(false);
  }

  useEffect(() => { if (user) load(); }, [user]);

  async function openDetail(d: Delivery) {
    setSelected(d);
    setSigUrl(null);
    const [{ data: ev }, { data: ph }] = await Promise.all([
      supabase.from("delivery_events" as never).select("*").eq("delivery_id", d.id).order("created_at", { ascending: false }),
      supabase.from("delivery_photos" as never).select("*").eq("delivery_id", d.id).order("created_at", { ascending: false }),
    ]);
    setEvents(((ev ?? []) as unknown) as Event[]);
    setPhotos(((ph ?? []) as unknown) as Photo[]);
    if (d.pod_signature_path) {
      const { data: s } = await supabase.storage.from("delivery-pod").createSignedUrl(d.pod_signature_path, 3600);
      setSigUrl(s?.signedUrl ?? null);
    }
  }

  return (
    <PageShell eyebrow="Logistics" title="Deliveries." lead="Live tracking from dispatch to doorstep, with proof of delivery captured on site." watermark>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {DELIVERY_STATUS_ORDER.concat(["failed"]).map((s) => (
            <span key={s} className={`px-2.5 py-1 rounded-full border ${statusTone(s)}`}>{DELIVERY_STATUS_LABEL[s]}</span>
          ))}
        </div>
        {isDriver && (
          <Link to="/driver" className="inline-flex items-center gap-2 text-sm bg-gold-gradient text-primary-foreground px-4 py-2 rounded-full shadow-gold-glow">
            <Truck className="h-4 w-4" /> Driver console
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-12 text-center">
          <Truck className="h-6 w-6 text-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">No deliveries yet. {isStaff ? "Schedule one from the admin console." : "Your scheduled deliveries will appear here."}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((d) => {
            const idx = DELIVERY_STATUS_ORDER.indexOf(d.status);
            const pct = d.status === "failed" ? 100 : Math.max(0, (idx / (DELIVERY_STATUS_ORDER.length - 1)) * 100);
            return (
              <button key={d.id} onClick={() => openDetail(d)} className="text-left border border-border/60 rounded-xl p-5 hover:border-primary/40 transition">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{d.reference || d.id.slice(0, 8)}</p>
                    <h3 className="font-display text-lg mt-1">{d.customer_name || "Customer"}</h3>
                    <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {d.delivery_address || "Address pending"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs border px-2.5 py-1 rounded-full ${statusTone(d.status)}`}>{DELIVERY_STATUS_LABEL[d.status]}</span>
                    {d.scheduled_at && <span className="text-[11px] text-muted-foreground">Sched {new Date(d.scheduled_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>}
                  </div>
                </div>
                <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${d.status === "failed" ? "bg-destructive" : "bg-gold-gradient"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2.5 grid grid-cols-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {DELIVERY_STATUS_ORDER.map((s, i) => (
                    <span key={s} className={`text-center ${i <= idx ? "text-primary" : ""}`}>{DELIVERY_STATUS_LABEL[s]}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  {d.invoice_ref && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {d.invoice_ref}</span>}
                  {d.quote_id && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> Quote linked</span>}
                  {d.project_ref && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {d.project_ref}</span>}
                  {d.pod_signed_name && <span className="inline-flex items-center gap-1 text-primary"><ShieldCheck className="h-3 w-3" /> Signed by {d.pod_signed_name}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{selected.reference || selected.id.slice(0,8)}</p>
                <h2 className="font-display text-2xl mt-1">{selected.customer_name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{selected.delivery_address}</p>
              </div>
              <span className={`text-xs border px-2.5 py-1 rounded-full ${statusTone(selected.status)}`}>{DELIVERY_STATUS_LABEL[selected.status]}</span>
            </div>

            {sigUrl && (
              <div className="mb-5 border border-border/60 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-primary mb-2 inline-flex items-center gap-1.5"><PenLine className="h-3 w-3" /> Customer signature</p>
                <img src={sigUrl} alt="Signature" className="bg-white rounded max-h-40" />
                <p className="mt-2 text-xs text-muted-foreground">{selected.pod_signed_name} · {selected.pod_signed_at && new Date(selected.pod_signed_at).toLocaleString("en-ZA")}</p>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest text-primary mb-2 inline-flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> POD photos</p>
                <DeliveryPhotos photos={photos} />
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">Timeline</p>
              <ol className="space-y-3">
                {events.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p>{DELIVERY_STATUS_LABEL[e.status]} {e.note && <span className="text-muted-foreground">— {e.note}</span>}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString("en-ZA")}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function DeliveryPhotos({ photos }: { photos: Photo[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(photos.map(async (p) => {
        const { data } = await supabase.storage.from("delivery-pod").createSignedUrl(p.storage_path, 3600);
        return [p.id, data?.signedUrl ?? ""] as const;
      }));
      setUrls(Object.fromEntries(entries));
    })();
  }, [photos]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {photos.map((p) => (
        <a key={p.id} href={urls[p.id]} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-border/60 bg-secondary">
          {urls[p.id] && <img src={urls[p.id]} alt={p.caption ?? ""} className="w-full h-full object-cover" />}
        </a>
      ))}
    </div>
  );
}
