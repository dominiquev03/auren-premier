import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Image as ImageIcon, Mic, Paperclip, Send, X, Square, Loader2, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { toast } from "sonner";

export const Route = createFileRoute("/quote")({
  component: GuestQuotePage,
  head: () => ({
    meta: [
      { title: "Request a quotation — Auren Plumbing Supplies" },
      { name: "description", content: "Send a quotation request in 30 seconds. No login required — receive your quote by email." },
    ],
  }),
});

type Attachment = {
  id: string;
  kind: "image" | "video" | "audio";
  name: string;
  url: string;
  size: number;
  durationMs?: number;
  file: Blob;
};

type Urgency = "standard" | "priority" | "urgent";

const URGENCY: { value: Urgency; label: string; hint: string }[] = [
  { value: "standard", label: "Standard", hint: "Quote within 24h" },
  { value: "priority", label: "Priority", hint: "Same-day quote" },
  { value: "urgent", label: "Urgent", hint: "Call back · 15 min" },
];

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function ms(d: number) {
  const s = Math.floor(d / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function GuestQuotePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [siteAddress, setSiteAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: Attachment[] = [];
    Array.from(list).forEach((f) => {
      const kind: Attachment["kind"] = f.type.startsWith("video/") ? "video" : f.type.startsWith("audio/") ? "audio" : "image";
      next.push({
        id: crypto.randomUUID(),
        kind,
        name: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
        file: f,
      });
    });
    setAttachments((cur) => [...cur, ...next]);
  }

  function removeAttachment(id: string) {
    setAttachments((cur) => {
      const a = cur.find((x) => x.id === id);
      if (a) URL.revokeObjectURL(a.url);
      return cur.filter((x) => x.id !== id);
    });
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAttachments((cur) => [
          ...cur,
          {
            id: crypto.randomUUID(),
            kind: "audio",
            name: `voice-note-${new Date().toISOString().slice(11, 19)}.webm`,
            url,
            size: blob.size,
            durationMs: Date.now() - startedAtRef.current,
            file: blob,
          },
        ]);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsed(0);
      rec.start();
      setRecording(true);
      tickRef.current = window.setInterval(() => setElapsed(Date.now() - startedAtRef.current), 200);
    } catch {
      toast.error("Microphone access is required to record a voice note.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (tickRef.current) window.clearInterval(tickRef.current);
  }

  function captureLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function submit() {
    if (!name.trim() || !email.trim()) {
      toast.error("Please share your name and email so we can send your quote.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("That email doesn't look quite right.");
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      toast.error("Add a short description or attach a photo of the job.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: quote, error } = await supabase
        .from("guest_quote_requests")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          message: message.trim() || null,
          urgency,
          site_address: siteAddress.trim() || null,
          gps_lat: coords?.lat ?? null,
          gps_lng: coords?.lng ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      for (const a of attachments) {
        const ext = a.name.split(".").pop() || (a.kind === "audio" ? "webm" : "bin");
        const path = `${quote.id}/${a.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from("guest-quote-media").upload(path, a.file, {
          contentType: a.file.type || undefined,
          upsert: false,
        });
        if (upErr) throw upErr;
        await supabase.from("guest_quote_attachments").insert({
          quote_id: quote.id,
          kind: a.kind,
          storage_path: path,
          name: a.name,
          size: a.size,
          duration_ms: a.durationMs ?? null,
        });
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-[80vh] grid place-items-center px-6 py-16">
        <div className="max-w-md w-full text-center bg-card border border-border/60 rounded-2xl p-10 shadow-luxe">
          <div className="h-16 w-16 mx-auto rounded-full bg-gold-gradient grid place-items-center text-primary-foreground">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl mt-5">Request received</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Thanks {name.split(" ")[0]}. A specifier is preparing your quotation. You'll receive it at <span className="text-foreground">{email}</span> shortly.
          </p>
          <div className="mt-8 grid gap-2">
            <Link to="/products" className="inline-flex justify-center items-center gap-2 bg-gold-gradient text-primary-foreground text-sm font-medium px-6 py-3 rounded-full shadow-gold-glow">
              Browse the catalogue <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground py-2">
              Create an account to track your quotes →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        {/* hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <BrandLogo size={40} className="drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary">No login required</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
            Quote in <span className="text-gold-gradient italic">30 seconds</span>.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Tell us what you need, attach a photo or plan, and we'll send pricing to your inbox.
          </p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl shadow-luxe overflow-hidden">
          {/* Contact */}
          <div className="p-5 sm:p-6 border-b border-border/60 grid sm:grid-cols-2 gap-3">
            <Field label="Full name *">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className={inputCls} autoComplete="name" />
            </Field>
            <Field label="Email *">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} autoComplete="email" inputMode="email" />
            </Field>
            <Field label="Mobile">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="082 000 0000" className={inputCls} autoComplete="tel" inputMode="tel" />
            </Field>
            <Field label="Company (optional)">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Smith Plumbing" className={inputCls} autoComplete="organization" />
            </Field>
          </div>

          {/* Urgency */}
          <div className="p-5 sm:p-6 border-b border-border/60">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Urgency</p>
            <div className="grid grid-cols-3 gap-2">
              {URGENCY.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value)}
                  className={`text-left rounded-lg border p-2.5 sm:p-3 transition ${
                    urgency === u.value ? "border-primary bg-gold-gradient/10 shadow-gold-glow" : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium">{u.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{u.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Site (optional) */}
          <div className="p-5 sm:p-6 border-b border-border/60 space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Site (optional)</p>
            <input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="Street, suburb, city" className={inputCls} />
            <button type="button" onClick={captureLocation} className="inline-flex items-center gap-1.5 text-xs border border-border rounded-md px-3 py-2 hover:border-primary/60 transition">
              {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-primary" />}
              {coords ? `Pinned · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Drop a GPS pin"}
            </button>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="p-5 sm:p-6 border-b border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="relative group border border-border/60 rounded-lg overflow-hidden bg-secondary">
                  {a.kind === "image" && <img src={a.url} alt={a.name} className="h-24 w-full object-cover" />}
                  {a.kind === "video" && <video src={a.url} className="h-24 w-full object-cover" muted />}
                  {a.kind === "audio" && (
                    <div className="h-24 flex flex-col items-center justify-center gap-2 px-3">
                      <Mic className="h-5 w-5 text-primary" />
                      <audio src={a.url} controls className="w-full h-7" />
                    </div>
                  )}
                  <div className="px-2 py-1 text-[10px] text-muted-foreground flex justify-between gap-2">
                    <span className="truncate">{a.name}</span>
                    <span className="shrink-0">{bytes(a.size)}</span>
                  </div>
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/80 backdrop-blur grid place-items-center"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          <div className="p-5 sm:p-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the job — fittings, sizes, brands, deadlines…"
              rows={5}
              className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60 resize-none"
            />
          </div>

          {/* composer */}
          <div className="border-t border-border/60 px-3 py-3 bg-background/50">
            {recording ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-sm">Recording · {ms(elapsed)}</span>
                </div>
                <button onClick={stopRecording} className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground rounded-full px-4 py-2 text-sm">
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input ref={photoInput} type="file" accept="image/*,video/*" multiple capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />

                <IconBtn label="Photo / video" onClick={() => photoInput.current?.click()}><ImageIcon className="h-4 w-4" /></IconBtn>
                <IconBtn label="Voice note" onClick={startRecording}><Mic className="h-4 w-4" /></IconBtn>
                <IconBtn label="Attach file" onClick={() => fileInput.current?.click()}><Paperclip className="h-4 w-4" /></IconBtn>

                <div className="flex-1" />

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-medium px-5 sm:px-6 py-2.5 rounded-full shadow-gold-glow disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send request
                </button>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              By submitting you agree to be contacted at the email and phone provided.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Repeat customer?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>{" "}
          to track orders, invoices and quote history.
        </p>
      </div>
    </main>
  );
}

const inputCls = "w-full bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition">
      {children}
    </button>
  );
}
