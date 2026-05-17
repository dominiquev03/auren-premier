import type { ReactNode } from "react";
import { BrandWatermark } from "@/components/brand-logo";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow?: string; title: string; updated?: string; children: ReactNode }) {
  return (
    <section className="relative mx-auto max-w-3xl px-6 pt-20 pb-24">
      <BrandWatermark />
      <div className="relative">
        {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-primary mb-5">{eyebrow}</p>}
        <h1 className="font-display text-5xl leading-[1.05]">{title}</h1>
        {updated && <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">{updated}</p>}
        <div className="prose prose-invert prose-sm md:prose-base mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
          {children}
        </div>
        <div className="mt-16 pt-6 border-t border-border/60 text-[11px] text-muted-foreground space-y-1">
          <p>© 2026 Auren Plumbing Supplies (Pty) Ltd. All Rights Reserved.</p>
          <p className="italic font-display">Quality you trust, relationships that last.</p>
        </div>
      </div>
    </section>
  );
}
