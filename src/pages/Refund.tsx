import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Refund = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: May 2, 2026</p>

          <div className="space-y-8 text-foreground/80 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">30-Day Money-Back Guarantee</h2>
              <p>We offer a <strong>30-day money-back guarantee</strong> on all paid subscriptions to XViralLabs. If you are not satisfied with your purchase, you may request a full refund within <strong>30 days</strong> of your initial order date.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">How to Request a Refund</h2>
              <p>Refunds are processed by our payment provider, <strong>Paddle</strong>, who acts as the Merchant of Record for all XViralLabs orders.</p>
              <p className="mt-3">To request a refund:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary underline">paddle.net</a> and look up your order using the email you used to purchase.</li>
                <li>Or contact us at <a href="mailto:support@xvirallabs.com" className="text-primary underline">support@xvirallabs.com</a> and we will help process your refund through Paddle.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Subscription Cancellations</h2>
              <p>You may cancel your subscription at any time from your account settings or via paddle.net. Cancellations take effect at the end of your current billing period; you retain access to paid features until then.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Processing Time</h2>
              <p>Approved refunds are typically processed by Paddle within 5–10 business days, depending on your bank or payment method.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
              <p>For refund questions, contact support@xvirallabs.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Refund;