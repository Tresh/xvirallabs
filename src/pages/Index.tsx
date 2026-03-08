import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ViralProofs } from "@/components/ViralProofs";
import { QuickAnalyze } from "@/components/QuickAnalyze";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ViralProofs />
        <QuickAnalyze />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
