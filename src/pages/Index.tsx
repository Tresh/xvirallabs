import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
