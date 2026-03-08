import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModesSection } from "@/components/ModesSection";
import { LiveViralTweets } from "@/components/LiveViralTweets";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <ModesSection />
        <LiveViralTweets />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
