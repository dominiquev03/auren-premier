import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms of Service — Auren Plumbing Supplies" }, { name: "description", content: "Terms of Service governing use of the Auren Plumbing Supplies customer platform." }] }),
});

function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="Effective 1 January 2026">
      <h2>1. Acceptance</h2>
      <p>By accessing the Auren Plumbing Supplies™ customer portal, powered by AurenFlow™, you agree to these Terms of Service. These terms form a binding agreement between you and Auren Plumbing Supplies (Pty) Ltd ("Auren", "we", "us").</p>

      <h2>2. Account Eligibility</h2>
      <p>Accounts are reserved for plumbing contractors, trade professionals, and approved commercial customers operating in South Africa. Auren reserves the right to verify, suspend, or terminate any account at its sole discretion.</p>

      <h2>3. Pricing &amp; Orders</h2>
      <p>All prices are quoted in South African Rand (ZAR) and include VAT unless otherwise stated. Quotations are valid for 7 calendar days. Orders are only binding once payment is received and confirmed by Auren.</p>

      <h2>4. Delivery</h2>
      <p>Delivery timelines are estimates. Title and risk pass to the customer upon delivery or collection. Customers must inspect goods on receipt and report discrepancies within 48 hours.</p>

      <h2>5. Returns</h2>
      <p>Special-order, cut-to-length, and clearance items are non-returnable. Standard stock may be returned within 14 days, unused and in original packaging, subject to a 15% handling fee.</p>

      <h2>6. Acceptable Use</h2>
      <p>You may not use the platform to: (a) scrape, reverse engineer, or replicate the system; (b) attempt unauthorized access; (c) misrepresent your identity or trade credentials; (d) resell access to your account.</p>

      <h2>7. Limitation of Liability</h2>
      <p>Auren's liability is limited to the value of the goods supplied. We are not liable for indirect, consequential, or site-related losses.</p>

      <h2>8. Governing Law</h2>
      <p>These terms are governed by the laws of the Republic of South Africa. Jurisdiction lies with the courts of Gauteng.</p>

      <h2>9. Contact</h2>
      <p>trade@aurensupplies.co.za · +27 11 000 0000</p>
    </LegalPage>
  );
}
