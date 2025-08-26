import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AgentsDirectory from "@/components/AgentsDirectory";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AgentsDirectory />
      <Footer />
    </div>
  );
};

export default Index;
