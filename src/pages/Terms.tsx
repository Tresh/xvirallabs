import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: March 8, 2026</p>

          <div className="space-y-8 text-foreground/80 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Viral Labs ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>Viral Labs provides AI-powered tweet analysis, content generation, and virality tools. The Service is provided "as is" and may be updated, modified, or discontinued at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. You are responsible for all activities under your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
              <p>You agree not to use the Service to generate harmful, misleading, or illegal content. You may not attempt to reverse-engineer, copy, or redistribute the Service's AI models or proprietary technology.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Intellectual Property</h2>
              <p>Content you create using the Service belongs to you. However, the Service, its design, features, and underlying technology remain the intellectual property of Viral Labs.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Usage Limits & Billing</h2>
              <p>Free accounts are subject to daily analysis limits. Paid plans offer expanded or unlimited usage. Subscription fees are non-refundable unless otherwise stated.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Privacy</h2>
              <p>We collect and process data as described in our Privacy Policy. By using the Service, you consent to such processing. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
              <p>Viral Labs shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. The Service does not guarantee specific results or viral outcomes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
              <p>We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time through your account settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to Terms</h2>
              <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
              <p>For questions about these Terms, please contact us at support@virallabs.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
