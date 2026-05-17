import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/legal/ip")({
  component: IPPage,
  head: () => ({ meta: [{ title: "Intellectual Property Notice — Auren" }, { name: "description", content: "Intellectual property, trademark and proprietary rights notice for Auren Plumbing Supplies and AurenFlow™." }] }),
});

function IPPage() {
  return (
    <LegalPage eyebrow="Legal" title="Intellectual Property Notice" updated="Effective 1 January 2026">
      <div className="not-prose flex items-center gap-4 p-5 border border-primary/30 rounded-xl mb-8 bg-card/40">
        <BrandLogo size={56} />
        <div>
          <p className="font-display text-lg leading-tight">Auren Plumbing Supplies™ · AurenFlow™</p>
          <p className="text-xs text-muted-foreground mt-1">All marks, designs and systems are proprietary.</p>
        </div>
      </div>

      <h2>1. Ownership of Branding</h2>
      <p>The Auren logo, the "AUREN" wordmark, the "Auren Plumbing Supplies™" name, the "AurenFlow™" platform mark, the gold-on-black visual identity, the tagline <em>"Quality you trust, relationships that last"</em>, and all related design elements are the exclusive property of Auren Plumbing Supplies (Pty) Ltd.</p>

      <h2>2. Ownership of Platform Systems</h2>
      <p>The architecture, workflows, business logic, database schemas, user-role hierarchy, quotation pipeline, loyalty rewards engine, delivery tracking system, and the entire AurenFlow™ business management platform are proprietary works owned by Auren Plumbing Supplies.</p>

      <h2>3. Ownership of the Customer Portal Structure</h2>
      <p>The layout, navigation, user flows, page templates, document formats, watermarking system, and any custom UI components composing this customer portal are protected as proprietary works and trade dress.</p>

      <h2>4. Protection of Logos and Designs</h2>
      <p>All logos, icons, illustrations, photography, typography pairings, and color systems are protected under South African and international copyright and trademark law.</p>

      <h2>5. Prohibited Unauthorized Use</h2>
      <p>You may not, without prior written permission from Auren Plumbing Supplies:</p>
      <ul>
        <li>copy, clone, mirror, or republish any part of the platform;</li>
        <li>reverse engineer, decompile, or extract source code, schemas, or workflows;</li>
        <li>resell, sublicense, or redistribute access, content, or designs;</li>
        <li>use Auren or AurenFlow trademarks in advertising, social media, or third-party products;</li>
        <li>train AI/ML models on Auren content, designs, documents, or platform data.</li>
      </ul>

      <h2>6. Proprietary Use of AurenFlow™</h2>
      <p>AurenFlow™ is the proprietary business management system developed by Auren Plumbing Supplies. The name, methodology, and platform are reserved for internal Auren operations and authorized customer-facing surfaces. No third-party may operate, replicate, or represent AurenFlow™ services.</p>

      <h2>7. Enforcement</h2>
      <p>Auren actively monitors infringement and will pursue civil and criminal remedies, including injunctive relief and damages, against unauthorized use.</p>

      <h2>8. Reporting Infringement</h2>
      <p>legal@aurensupplies.co.za</p>
    </LegalPage>
  );
}
