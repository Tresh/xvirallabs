import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModesSection } from "@/components/ModesSection";
import { LiveViralTweets } from "@/components/LiveViralTweets";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">Platform</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Features</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to reverse-engineer virality and create content that spreads.
            </p>
          </div>
        </section>
        <ModesSection />
        <LiveViralTweets />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
