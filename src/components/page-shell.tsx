import type { ReactNode } from "react";

export function PageShell({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-12">
      {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-primary mb-5">{eyebrow}</p>}
      <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">{title}</h1>
      {lead && <p className="mt-5 max-w-2xl text-muted-foreground text-lg">{lead}</p>}
      {children && <div className="mt-12">{children}</div>}
    </section>
  );
}
