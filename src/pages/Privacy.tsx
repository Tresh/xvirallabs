import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Privacy Notice</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: May 2, 2026</p>

          <div className="space-y-8 text-foreground/80 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Who We Are</h2>
              <p>XViralLabs is operated by <strong>Tomiwa Sanni</strong> ("we", "us", "our"). We act as the data controller for personal data processed through the Service. Contact: support@xvirallabs.com.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Data We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account data:</strong> name, email, login credentials, authentication identifiers (e.g. Google OAuth ID).</li>
                <li><strong>Profile & content data:</strong> niches, brand voice, pillars, generated posts, saved patterns, analyses, and ideas.</li>
                <li><strong>Usage & telemetry:</strong> feature interactions, daily usage counts, device/browser info, IP address, log data.</li>
                <li><strong>Support data:</strong> messages and attachments you send to us.</li>
                <li><strong>Billing data:</strong> handled by Paddle (our Merchant of Record). We receive limited information such as subscription status, plan, and country.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Why We Process It (Purposes & Legal Basis)</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide the Service</strong> (contract): account creation, generating analyses, storing your content.</li>
                <li><strong>Security & fraud prevention</strong> (legitimate interest): abuse detection, rate limiting, audit logs.</li>
                <li><strong>Service improvement</strong> (legitimate interest): aggregated analytics to improve features.</li>
                <li><strong>Customer support</strong> (contract / legitimate interest): responding to your requests.</li>
                <li><strong>Legal compliance</strong> (legal obligation): tax, accounting, responding to lawful requests.</li>
                <li><strong>Marketing emails</strong> (consent, where required): only if you opt in.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Who We Share Data With</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Paddle.com Market Limited</strong> — our Merchant of Record. Paddle processes payments, manages subscriptions, handles tax compliance, and issues invoices and refunds. See Paddle's privacy policy at paddle.com/legal/privacy.</li>
                <li><strong>Infrastructure providers</strong> — hosting, database, and authentication (Supabase), AI inference providers used to power analyses.</li>
                <li><strong>Professional advisers</strong> — legal, accounting, and tax advisers when needed.</li>
                <li><strong>Authorities</strong> — when required by law, court order, or to protect rights and safety.</li>
              </ul>
              <p className="mt-3">We do not sell your personal data.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. International Transfers</h2>
              <p>Your data may be processed outside your country, including in the United States and the European Union. Where required, we rely on appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
              <p>We retain account and content data for as long as your account is active. After account deletion we delete or anonymise personal data within a reasonable period, except where retention is required for legal, tax, or security reasons (typically up to 7 years for billing records held by Paddle).</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or export your personal data, to object to processing, and to withdraw consent. EEA/UK users may also lodge a complaint with their local supervisory authority. To exercise these rights, email support@xvirallabs.com. We respond within one month.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Security</h2>
              <p>We use appropriate technical and organisational measures including encryption in transit, access controls, and Row-Level Security on databases. No system is perfectly secure; we encourage strong, unique passwords.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Cookies</h2>
              <p>We use essential cookies and local storage required to keep you logged in and to remember your preferences. We do not use advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes</h2>
              <p>We may update this notice. Material changes will be communicated via the Service or by email.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
              <p>Questions about this notice? Email support@xvirallabs.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;