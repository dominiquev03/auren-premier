import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, STAFF_ROLES, type AppRole } from "@/hooks/use-auth";
import { audit } from "@/lib/audit";
import { FileText, Image as ImageIcon, Video, Mic, MapPin, Loader2, RefreshCw, Shield, ScrollText, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Auren" }] }),
});

type Status = "new" | "in_review" | "quoted" | "closed";
type Urgency = "standard" | "priority" | "urgent";

type Attachment = { id: string; kind: "image" | "video" | "audio"; storage_path: string; name: string | null };

type CustomerQuote = {
  id: string;
  user_id: string;
  message: string | null;
  urgency: Urgency;
  status: Status;
  site_address: string | null;
  site_contact: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
  profiles?: { full_name: string | null; company_name: string | null; email: string | null; mobile: string | null } | null;
  quote_attachments: Attachment[];
};

type GuestQuote = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  urgency: Urgency;
  status: Status;
  site_address: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
  guest_quote_attachments: Attachment[];
};

type TopTab = "guest" | "customer" | "users" | "audit";

function AdminPage() {
  const { isStaff, isSuperAdmin, can, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TopTab>("guest");
  const [customer, setCustomer] = useState<CustomerQuote[]>([]);
  const [guest, setGuest] = useState<GuestQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    if (!authLoading && !isStaff) navigate({ to: "/" });
  }, [authLoading, isStaff, navigate]);

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: g }] = await Promise.all([
      supabase.from("quote_requests").select("*, quote_attachments(id,kind,storage_path,name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("guest_quote_requests").select("*, guest_quote_attachments(id,kind,storage_path,name)").order("created_at", { ascending: false }).limit(200),
    ]);
    const rows = (c ?? []) as unknown as CustomerQuote[];
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name,company_name,email,mobile").in("id", userIds);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rows.forEach((r) => {
        const p = map.get(r.user_id);
        if (p) r.profiles = { full_name: p.full_name, company_name: p.company_name, email: p.email, mobile: p.mobile };
      });
    }
    setCustomer(rows);
    setGuest((g ?? []) as unknown as GuestQuote[]);
    setLoading(false);
  }

  useEffect(() => {
    if (isStaff) load();
  }, [isStaff]);

  async function updateStatus(table: "quote_requests" | "guest_quote_requests", id: string, status: Status) {
    if (!can("quotes.manage")) return toast.error("You don't have permission to update quotes.");
    const { error } = await supabase.from(table).update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated.");
    await audit("quote.status_changed", { resourceType: table, resourceId: id, metadata: { status } });
    if (table === "quote_requests") setCustomer((cur) => cur.map((q) => (q.id === id ? { ...q, status } : q)));
    else setGuest((cur) => cur.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  if (authLoading || !isStaff) {
    return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const visibleCustomer = filter === "all" ? customer : customer.filter((q) => q.status === filter);
  const visibleGuest = filter === "all" ? guest : guest.filter((q) => q.status === filter);

  return (
    <PageShell eyebrow="AurenFlow staff" title="Quote request inbox" lead="Every customer and guest request, with media, urgency and GPS — process directly here.">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button onClick={() => setTab("guest")} className={`text-xs px-4 py-2 rounded-full border ${tab === "guest" ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground"}`}>
          Guest requests <span className="ml-1 opacity-60">({guest.length})</span>
        </button>
        <button onClick={() => setTab("customer")} className={`text-xs px-4 py-2 rounded-full border ${tab === "customer" ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground"}`}>
          Customer requests <span className="ml-1 opacity-60">({customer.length})</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "in_review", "quoted", "closed"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${filter === s ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        <button onClick={load} className="text-xs inline-flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 hover:border-primary/60">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : tab === "guest" ? (
        visibleGuest.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-4">
            {visibleGuest.map((q) => (
              <QuoteCard
                key={q.id}
                bucket="guest-quote-media"
                attachments={q.guest_quote_attachments}
                header={q.company || q.name}
                contact={`${q.email}${q.phone ? ` · ${q.phone}` : ""}${q.company && q.name !== q.company ? ` · ${q.name}` : ""}`}
                message={q.message}
                urgency={q.urgency}
                status={q.status}
                created_at={q.created_at}
                id={q.id}
                site_address={q.site_address}
                gps_lat={q.gps_lat}
                gps_lng={q.gps_lng}
                onUpdate={(s) => updateStatus("guest_quote_requests", q.id, s)}
              />
            ))}
          </div>
        )
      ) : visibleCustomer.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-4">
          {visibleCustomer.map((q) => (
            <QuoteCard
              key={q.id}
              bucket="quote-media"
              attachments={q.quote_attachments}
              header={q.profiles?.company_name || q.profiles?.full_name || "Customer"}
              contact={`${q.profiles?.email ?? ""}${q.profiles?.mobile ? ` · ${q.profiles.mobile}` : ""}`}
              message={q.message}
              urgency={q.urgency}
              status={q.status}
              created_at={q.created_at}
              id={q.id}
              site_address={q.site_address}
              gps_lat={q.gps_lat}
              gps_lng={q.gps_lng}
              site_contact={q.site_contact}
              onUpdate={(s) => updateStatus("quote_requests", q.id, s)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function Empty() {
  return <div className="border border-dashed border-border/60 rounded-xl p-10 text-center text-sm text-muted-foreground">No requests in this view.</div>;
}

function QuoteCard(props: {
  id: string;
  bucket: "quote-media" | "guest-quote-media";
  attachments: Attachment[];
  header: string;
  contact: string;
  message: string | null;
  urgency: Urgency;
  status: Status;
  created_at: string;
  site_address: string | null;
  site_contact?: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  onUpdate: (s: Status) => void;
}) {
  const { id, bucket, attachments, header, contact, message, urgency, status, created_at, site_address, site_contact, gps_lat, gps_lng, onUpdate } = props;
  const [signed, setSigned] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const result: Record<string, string> = {};
      await Promise.all(
        attachments.map(async (a) => {
          const { data } = await supabase.storage.from(bucket).createSignedUrl(a.storage_path, 60 * 30);
          if (data?.signedUrl) result[a.id] = data.signedUrl;
        }),
      );
      setSigned(result);
    })();
  }, [id, bucket]);

  const urgencyColor =
    urgency === "urgent" ? "border-destructive/60 text-destructive" : urgency === "priority" ? "border-primary text-primary" : "border-border/60 text-muted-foreground";

  return (
    <div className="border border-border/60 rounded-xl p-5">
      <div className="flex flex-wrap justify-between gap-4 items-start">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
            <FileText className="h-3 w-3" /> {id.slice(0, 8)} · {new Date(created_at).toLocaleString("en-ZA")}
          </p>
          <p className="font-display text-lg mt-1">{header}</p>
          <p className="text-xs text-muted-foreground">{contact}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full border capitalize ${urgencyColor}`}>{urgency}</span>
          <select value={status} onChange={(e) => onUpdate(e.target.value as Status)} className="text-xs bg-input/40 border border-border rounded-full px-3 py-1.5">
            {(["new", "in_review", "quoted", "closed"] as const).map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
          </select>
        </div>
      </div>

      {message && <p className="text-sm mt-4 whitespace-pre-wrap">{message}</p>}

      {(site_address || gps_lat) && (
        <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          {site_address && <span>📍 {site_address}</span>}
          {site_contact && <span>👤 {site_contact}</span>}
          {gps_lat && (
            <a className="text-primary hover:underline inline-flex items-center gap-1" href={`https://maps.google.com/?q=${gps_lat},${gps_lng}`} target="_blank" rel="noreferrer">
              <MapPin className="h-3 w-3" /> Open in Maps
            </a>
          )}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {attachments.map((a) => (
            <div key={a.id} className="border border-border/60 rounded-lg overflow-hidden bg-secondary">
              {!signed[a.id] ? (
                <div className="h-24 grid place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : a.kind === "image" ? (
                <a href={signed[a.id]} target="_blank" rel="noreferrer"><img src={signed[a.id]} alt={a.name ?? ""} className="h-24 w-full object-cover" /></a>
              ) : a.kind === "video" ? (
                <video src={signed[a.id]} controls className="h-24 w-full object-cover" />
              ) : (
                <div className="h-24 flex items-center justify-center px-2"><Mic className="h-4 w-4 text-primary mr-2" /><audio src={signed[a.id]} controls className="w-full h-8" /></div>
              )}
              <p className="px-2 py-1 text-[10px] text-muted-foreground truncate flex items-center gap-1">
                {a.kind === "image" && <ImageIcon className="h-3 w-3" />}
                {a.kind === "video" && <Video className="h-3 w-3" />}
                {a.kind === "audio" && <Mic className="h-3 w-3" />}
                {a.name ?? a.kind}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
