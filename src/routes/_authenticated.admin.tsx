import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FileText, Image as ImageIcon, Video, Mic, MapPin, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Quote inbox — Auren" }] }),
});

type QuoteRow = {
  id: string;
  user_id: string;
  message: string | null;
  urgency: "standard" | "priority" | "urgent";
  status: "new" | "in_review" | "quoted" | "closed";
  site_address: string | null;
  site_contact: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
  profiles?: { full_name: string | null; company_name: string | null; email: string | null; mobile: string | null } | null;
  quote_attachments: { id: string; kind: "image" | "video" | "audio"; storage_path: string; name: string | null }[];
};

function AdminPage() {
  const { isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | QuoteRow["status"]>("all");

  useEffect(() => {
    if (!authLoading && !isStaff) {
      navigate({ to: "/" });
    }
  }, [authLoading, isStaff, navigate]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("quote_requests")
      .select("*, quote_attachments(id,kind,storage_path,name)")
      .order("created_at", { ascending: false })
      .limit(200);
    const rows = (data ?? []) as unknown as QuoteRow[];
    // hydrate profiles separately (RLS allows staff to read all)
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,full_name,company_name,email,mobile")
        .in("id", userIds);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rows.forEach((r) => {
        const p = map.get(r.user_id);
        if (p) r.profiles = { full_name: p.full_name, company_name: p.company_name, email: p.email, mobile: p.mobile };
      });
    }
    setQuotes(rows);
    setLoading(false);
  }

  useEffect(() => {
    if (isStaff) load();
  }, [isStaff]);

  async function updateStatus(id: string, status: QuoteRow["status"]) {
    const { error } = await supabase.from("quote_requests").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated.");
      setQuotes((cur) => cur.map((q) => (q.id === id ? { ...q, status } : q)));
    }
  }

  if (authLoading || !isStaff) {
    return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const visible = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <PageShell eyebrow="AurenFlow staff" title="Quote request inbox" lead="Every customer request, with media, urgency and GPS — process directly here.">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "in_review", "quoted", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${filter === s ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground"}`}
            >
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
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-10 text-center text-sm text-muted-foreground">
          No requests in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((q) => (
            <QuoteCard key={q.id} q={q} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function QuoteCard({ q, onUpdate }: { q: QuoteRow; onUpdate: (id: string, s: QuoteRow["status"]) => void }) {
  const [signed, setSigned] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const result: Record<string, string> = {};
      await Promise.all(
        q.quote_attachments.map(async (a) => {
          const { data } = await supabase.storage.from("quote-media").createSignedUrl(a.storage_path, 60 * 30);
          if (data?.signedUrl) result[a.id] = data.signedUrl;
        }),
      );
      setSigned(result);
    })();
  }, [q.id]);

  const urgencyColor =
    q.urgency === "urgent" ? "border-destructive/60 text-destructive" : q.urgency === "priority" ? "border-primary text-primary" : "border-border/60 text-muted-foreground";

  return (
    <div className="border border-border/60 rounded-xl p-5">
      <div className="flex flex-wrap justify-between gap-4 items-start">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
            <FileText className="h-3 w-3" /> {q.id.slice(0, 8)} · {new Date(q.created_at).toLocaleString("en-ZA")}
          </p>
          <p className="font-display text-lg mt-1">{q.profiles?.company_name || q.profiles?.full_name || "Customer"}</p>
          <p className="text-xs text-muted-foreground">{q.profiles?.email} {q.profiles?.mobile && `· ${q.profiles.mobile}`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-full border capitalize ${urgencyColor}`}>{q.urgency}</span>
          <select
            value={q.status}
            onChange={(e) => onUpdate(q.id, e.target.value as QuoteRow["status"])}
            className="text-xs bg-input/40 border border-border rounded-full px-3 py-1.5"
          >
            {(["new", "in_review", "quoted", "closed"] as const).map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {q.message && <p className="text-sm mt-4 whitespace-pre-wrap">{q.message}</p>}

      {(q.site_address || q.gps_lat) && (
        <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          {q.site_address && <span>📍 {q.site_address}</span>}
          {q.site_contact && <span>👤 {q.site_contact}</span>}
          {q.gps_lat && (
            <a className="text-primary hover:underline inline-flex items-center gap-1" href={`https://maps.google.com/?q=${q.gps_lat},${q.gps_lng}`} target="_blank" rel="noreferrer">
              <MapPin className="h-3 w-3" /> Open in Maps
            </a>
          )}
        </div>
      )}

      {q.quote_attachments.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {q.quote_attachments.map((a) => (
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
