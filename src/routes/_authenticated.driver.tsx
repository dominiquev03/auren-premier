import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SignaturePad } from "@/components/signature-pad";
import { audit } from "@/lib/audit";
import { DELIVERY_STATUS_LABEL, statusTone, currentGps, type Delivery, type DeliveryStatus } from "@/lib/deliveries";
import { Truck, Loader2, MapPin, Camera, Send, X, CheckCircle2, AlertCircle, Navigation } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/driver")({
  component: DriverConsole,
  head: () => ({ meta: [{ title: "Driver console — Auren" }] }),
});

function DriverConsole() {
  const { user, hasAny, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const allowed = hasAny(["delivery", "super_admin", "admin"]);
  const [rows, setRows] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Delivery | null>(null);

  useEffect(() => {
    if (!authLoading && !allowed) navigate({ to: "/" });
  }, [authLoading, allowed, navigate]);

  async function load() {
    if (!user) return;
    setLoading(true);
    let q = supabase.from("deliveries" as never).select("*").in("status", ["pending", "dispatched", "out_for_delivery"]);
    // drivers see only their own; admins see all
    if (!hasAny(["super_admin", "admin"])) q = q.eq("driver_id", user.id);
    const { data } = await q.order("scheduled_at", { ascending: true, nullsFirst: false });
    setRows(((data ?? []) as unknown) as Delivery[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [user]); // eslint-disable-line

  if (!allowed) return null;

  return (
    <PageShell eyebrow="Driver console" title="Today's runs." lead="Tap a stop to start, capture POD on arrival." watermark>
      {loading ? (
        <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-12 text-center">
          <Truck className="h-6 w-6 text-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">No active deliveries assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((d) => (
            <button key={d.id} onClick={() => setActive(d)} className="text-left border border-border/60 rounded-xl p-5 hover:border-primary/40 active:scale-[0.99] transition">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{d.reference || d.id.slice(0,8)}</p>
                  <h3 className="font-display text-lg mt-0.5 truncate">{d.customer_name}</h3>
                  <p className="text-xs text-muted-foreground inline-flex items-start gap-1.5 mt-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {d.delivery_address}</p>
                </div>
                <span className={`text-xs border px-2.5 py-1 rounded-full h-fit ${statusTone(d.status)}`}>{DELIVERY_STATUS_LABEL[d.status]}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {active && <PodSheet delivery={active} onClose={() => { setActive(null); load(); }} />}
    </PageShell>
  );
}

function PodSheet({ delivery, onClose }: { delivery: Delivery; onClose: () => void }) {
  const { user } = useAuth();
  const [signature, setSignature] = useState<string | null>(null);
  const [signedName, setSignedName] = useState(delivery.customer_name ?? "");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState<DeliveryStatus | "pod" | null>(null);

  async function pushStatus(next: DeliveryStatus, extras: Partial<Delivery> = {}, note?: string) {
    setBusy(next);
    try {
      const gps = await currentGps();
      const patch: Record<string, unknown> = { status: next, ...extras };
      if (next === "dispatched" && !delivery.dispatched_at) patch.dispatched_at = new Date().toISOString();
      const { error: e1 } = await supabase.from("deliveries" as never).update(patch).eq("id", delivery.id);
      if (e1) throw e1;
      await supabase.from("delivery_events" as never).insert({
        delivery_id: delivery.id, status: next, note: note ?? null,
        gps_lat: gps?.lat ?? null, gps_lng: gps?.lng ?? null, actor_id: user?.id ?? null,
      });
      audit("quote.status_changed", { resourceType: "delivery", resourceId: delivery.id, metadata: { status: next } });
      toast.success(DELIVERY_STATUS_LABEL[next]);
      onClose();
    } catch (e) {
      toast.error((e as Error).message ?? "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function uploadPod() {
    if (!signature) { toast.error("Capture a signature first"); return; }
    if (!signedName.trim()) { toast.error("Enter signer name"); return; }
    setBusy("pod");
    try {
      const gps = await currentGps();
      // signature
      const blob = await (await fetch(signature)).blob();
      const sigPath = `${delivery.id}/signature-${Date.now()}.png`;
      const { error: sigErr } = await supabase.storage.from("delivery-pod").upload(sigPath, blob, { contentType: "image/png", upsert: true });
      if (sigErr) throw sigErr;

      // photos
      for (const f of photos) {
        const path = `${delivery.id}/photo-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: pErr } = await supabase.storage.from("delivery-pod").upload(path, f, { contentType: f.type, upsert: false });
        if (pErr) throw pErr;
        await supabase.from("delivery_photos" as never).insert({ delivery_id: delivery.id, storage_path: path, uploaded_by: user?.id ?? null });
      }

      const { error: uErr } = await supabase.from("deliveries" as never).update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
        pod_signature_path: sigPath,
        pod_signed_name: signedName.trim(),
        pod_signed_at: new Date().toISOString(),
        pod_gps_lat: gps?.lat ?? null,
        pod_gps_lng: gps?.lng ?? null,
      }).eq("id", delivery.id);
      if (uErr) throw uErr;

      await supabase.from("delivery_events" as never).insert({
        delivery_id: delivery.id, status: "delivered", note: notes || null,
        gps_lat: gps?.lat ?? null, gps_lng: gps?.lng ?? null, actor_id: user?.id ?? null,
      });
      audit("quote.status_changed", { resourceType: "delivery", resourceId: delivery.id, metadata: { status: "delivered", pod: true } });
      toast.success("Proof of delivery captured");
      onClose();
    } catch (e) {
      toast.error((e as Error).message ?? "Could not save POD");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">{delivery.reference || delivery.id.slice(0,8)}</p>
            <h2 className="font-display text-xl mt-1">{delivery.customer_name}</h2>
            <p className="text-xs text-muted-foreground mt-1 inline-flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5" /> {delivery.delivery_address}</p>
            {delivery.gps_lat && delivery.gps_lng && (
              <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${delivery.gps_lat},${delivery.gps_lng}`} className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary">
                <Navigation className="h-3 w-3" /> Navigate
              </a>
            )}
          </div>
          <button onClick={onClose} className="p-2 -m-2 text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {delivery.status === "pending" && (
            <button disabled={!!busy} onClick={() => pushStatus("dispatched")} className="col-span-2 py-3 rounded-full bg-secondary text-sm">
              {busy === "dispatched" ? "..." : "Mark dispatched"}
            </button>
          )}
          {(delivery.status === "dispatched" || delivery.status === "pending") && (
            <button disabled={!!busy} onClick={() => pushStatus("out_for_delivery")} className="col-span-2 py-3 rounded-full bg-gold-gradient text-primary-foreground text-sm font-medium shadow-gold-glow">
              {busy === "out_for_delivery" ? "..." : "Start delivery — out for delivery"}
            </button>
          )}
          <button disabled={!!busy} onClick={() => {
            const reason = prompt("Reason for failed delivery?");
            if (reason) pushStatus("failed", { failure_reason: reason }, reason);
          }} className="py-2.5 rounded-full border border-destructive/50 text-destructive text-xs inline-flex items-center justify-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Failed
          </button>
          <a href={`tel:${delivery.customer_phone ?? ""}`} className={`py-2.5 rounded-full border border-border text-xs text-center ${delivery.customer_phone ? "" : "opacity-40 pointer-events-none"}`}>
            Call customer
          </a>
        </div>

        <div className="space-y-5 border-t border-border/60 pt-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3 inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Proof of delivery</p>
            <label className="text-xs text-muted-foreground">Recipient name</label>
            <input value={signedName} onChange={(e) => setSignedName(e.target.value)} className="mt-1 mb-3 w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm" />
            <SignaturePad onChange={setSignature} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Camera className="h-3 w-3" /> Add photos</label>
            <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} className="mt-1 block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-secondary file:text-foreground" />
            {photos.length > 0 && <p className="mt-1 text-[11px] text-muted-foreground">{photos.length} photo(s) ready</p>}
          </div>

          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={2} className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm" />

          <button disabled={busy === "pod"} onClick={uploadPod} className="w-full py-3.5 rounded-full bg-gold-gradient text-primary-foreground font-medium text-sm shadow-gold-glow inline-flex items-center justify-center gap-2">
            {busy === "pod" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Complete delivery
          </button>
        </div>
      </div>
    </div>
  );
}
