import type { ReactNode } from "react";
import { BrandWatermark } from "@/components/brand-logo";

export function PageShell({ eyebrow, title, lead, children, watermark = false }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode; watermark?: boolean }) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-12">
      {watermark && <BrandWatermark />}
      <div className="relative">
        {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-primary mb-5">{eyebrow}</p>}
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-muted-foreground text-lg">{lead}</p>}
        {children && <div className="mt-12">{children}</div>}
        {watermark && (
          <div className="mt-16 pt-6 border-t border-border/60 text-[11px] text-muted-foreground flex flex-wrap justify-between gap-2">
            <span>© 2026 Auren Plumbing Supplies (Pty) Ltd.</span>
            <span className="italic font-display">Quality you trust, relationships that last.</span>
          </div>
        )}
      </div>
    </section>
  );
}
