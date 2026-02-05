import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ModesSection } from "@/components/ModesSection";
import { AnalyzeSection } from "@/components/AnalyzeSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ModesSection />
        <AnalyzeSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
