import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Video, Mic, MapPin, Send, X, Square, Paperclip, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

type Attachment = {
  id: string;
  kind: "image" | "video" | "audio";
  name: string;
  url: string;
  size: number;
  durationMs?: number;
};

type Urgency = "standard" | "priority" | "urgent";

const URGENCY: { value: Urgency; label: string; hint: string }[] = [
  { value: "standard", label: "Standard", hint: "Quote within 24h" },
  { value: "priority", label: "Priority", hint: "Same-day quote" },
  { value: "urgent", label: "Urgent", hint: "Emergency · call back in 15 min" },
];

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function ms(d: number) {
  const s = Math.floor(d / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function QuoteRequestComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteContact, setSiteContact] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // recording state
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  const audInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(list: FileList | null, kind: Attachment["kind"]) {
    if (!list) return;
    const next: Attachment[] = [];
    Array.from(list).forEach((f) => {
      next.push({
        id: crypto.randomUUID(),
        kind,
        name: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
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
    } catch (err) {
      console.error("mic permission denied", err);
      alert("Microphone access is required to record a voice note.");
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
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function submit() {
    if (!message.trim() && attachments.length === 0) return;
    setSubmitting(true);
    // TODO: POST to AurenFlow ingestion endpoint via createServerFn
    // (multipart: message, urgency, siteAddress, siteContact, coords, attachments[])
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  function reset() {
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setAttachments([]);
    setMessage("");
    setUrgency("standard");
    setSiteAddress("");
    setSiteContact("");
    setCoords(null);
    setSubmitted(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-end sm:place-items-center p-0 sm:p-6" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl bg-card border border-border/60 rounded-t-2xl sm:rounded-2xl shadow-luxe max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="New quotation request"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">AurenFlow request</p>
            <h2 className="font-display text-xl mt-0.5">New quotation</h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gold-gradient grid place-items-center text-primary-foreground">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl">Sent to AurenFlow</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              A specifier is reviewing your request. You'll receive a quotation shortly via WhatsApp and email.
            </p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => { reset(); onClose(); }} className="text-sm border border-border rounded-full px-5 py-2.5 hover:border-primary/60">Close</button>
              <button onClick={reset} className="text-sm bg-gold-gradient text-primary-foreground rounded-full px-5 py-2.5 shadow-gold-glow">New request</button>
            </div>
          </div>
        ) : (
          <>
            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Urgency */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Urgency</p>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgency(u.value)}
                      className={`text-left rounded-lg border p-3 transition ${
                        urgency === u.value
                          ? "border-primary bg-gold-gradient/10 shadow-gold-glow"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-medium">{u.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{u.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Site details */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Site location</p>
                <input
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="Street address, suburb, city"
                  className="w-full bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                />
                <div className="flex gap-2">
                  <input
                    value={siteContact}
                    onChange={(e) => setSiteContact(e.target.value)}
                    placeholder="On-site contact (name & mobile)"
                    className="flex-1 bg-input/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                  />
                  <button
                    type="button"
                    onClick={captureLocation}
                    className="inline-flex items-center gap-1.5 text-xs border border-border rounded-md px-3 py-2.5 hover:border-primary/60 transition shrink-0"
                  >
                    {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-primary" />}
                    {coords ? "Pinned" : "Use GPS"}
                  </button>
                </div>
                {coords && (
                  <p className="text-[11px] text-muted-foreground">
                    GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Attachments grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="relative group border border-border/60 rounded-lg overflow-hidden bg-secondary">
                      {a.kind === "image" && <img src={a.url} alt={a.name} className="h-28 w-full object-cover" />}
                      {a.kind === "video" && <video src={a.url} className="h-28 w-full object-cover" muted />}
                      {a.kind === "audio" && (
                        <div className="h-28 flex flex-col items-center justify-center gap-2 px-3">
                          <Mic className="h-5 w-5 text-primary" />
                          <audio src={a.url} controls className="w-full h-8" />
                        </div>
                      )}
                      <div className="px-2 py-1.5 text-[10px] text-muted-foreground flex justify-between gap-2">
                        <span className="truncate">{a.name}</span>
                        <span className="shrink-0">{bytes(a.size)}</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(a.id)}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/80 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the job — fittings, sizes, brands, deadlines…"
                rows={4}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary/60 resize-none"
              />
            </div>

            {/* composer footer (WhatsApp-like) */}
            <div className="border-t border-border/60 px-3 py-3 bg-background/50">
              {recording ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm">Recording · {ms(elapsed)}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground rounded-full px-4 py-2 text-sm"
                  >
                    <Square className="h-3.5 w-3.5" /> Stop
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <input ref={imgInput} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files, "image")} />
                  <input ref={vidInput} type="file" accept="video/*" multiple capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files, "video")} />
                  <input ref={audInput} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, "audio")} />

                  <IconBtn label="Photo" onClick={() => imgInput.current?.click()}><ImageIcon className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Video" onClick={() => vidInput.current?.click()}><Video className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Voice note" onClick={startRecording}><Mic className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Attach file" onClick={() => audInput.current?.click()}><Paperclip className="h-4 w-4" /></IconBtn>

                  <div className="flex-1" />

                  <button
                    onClick={submit}
                    disabled={submitting || (!message.trim() && attachments.length === 0)}
                    className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-medium px-5 py-2.5 rounded-full shadow-gold-glow disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Routed to AurenFlow · staff respond on WhatsApp & email
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition"
    >
      {children}
    </button>
  );
}
