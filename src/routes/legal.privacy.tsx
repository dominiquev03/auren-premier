import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy — Auren Plumbing Supplies" }, { name: "description", content: "How Auren Plumbing Supplies collects, uses and safeguards customer information." }] }),
});

function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="Effective 1 January 2026">
      <h2>1. Information We Collect</h2>
      <p>We collect trading details (company name, VAT, contact), platform activity (orders, quotations, statements), uploaded media (site photos, voice notes, proof of payment), and device/usage data.</p>

      <h2>2. How We Use It</h2>
      <p>To operate your trade account, process quotations and orders, arrange deliveries, manage credit and loyalty rewards, prevent fraud, and improve the AurenFlow™ platform.</p>

      <h2>3. POPIA Compliance</h2>
      <p>We process personal information in accordance with the Protection of Personal Information Act (POPIA), 2013. You may request access, correction, or deletion of your data at any time.</p>

      <h2>4. Sharing</h2>
      <p>We share data only with: logistics partners (for delivery), payment processors, accounting providers, and law enforcement where legally required. We never sell customer data.</p>

      <h2>5. Security</h2>
      <p>Data is encrypted in transit and at rest. Administrative access is role-based and audit-logged. Customer accounts cannot edit backend systems, branding, pricing, or business records.</p>

      <h2>6. Retention</h2>
      <p>We retain transactional records for the period required by the Tax Administration Act (minimum 5 years). Marketing preferences may be revoked at any time.</p>

      <h2>7. Cookies</h2>
      <p>We use essential cookies for authentication and session continuity. Analytics cookies are anonymised.</p>

      <h2>8. Contact</h2>
      <p>Information Officer · privacy@aurensupplies.co.za</p>
    </LegalPage>
  );
}
