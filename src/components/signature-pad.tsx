import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

type Props = {
  onChange: (dataUrl: string | null) => void;
  height?: number;
};

export function SignaturePad({ onChange, height = 180 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#fafafa";
    }
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pos(e);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext("2d");
    if (!ctx || !lastRef.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    if (!hasInk) setHasInk(true);
  }
  function up() {
    drawingRef.current = false;
    lastRef.current = null;
    if (canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  }
  function clear() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx?.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border border-border/60 bg-secondary/30 overflow-hidden touch-none" style={{ height }}>
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="w-full h-full block"
        />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            Sign here
          </div>
        )}
      </div>
      <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <Eraser className="h-3 w-3" /> Clear
      </button>
    </div>
  );
}
