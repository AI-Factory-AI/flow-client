import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-ens-agents.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="ENS AI Agents Hub Background"
          className="w-full h-full object-cover blur-[1px]"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
             {/* Floating elements */}
       <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
         <Globe className="w-6 h-6 text-white opacity-60" />
       </div>
       <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
         <Zap className="w-5 h-5 text-white opacity-60" />
       </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
                                                           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-2xl font-mono tracking-wider">
                 Welcome to{" "}
                 <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent ">
                   Flow
                 </span>
               </h1>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto  font-medium">
                 Your decentralized AI agents powered by Flow. Create, manage, and coordinate with AI assistants for the future of web3.
               </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Activate My Agent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="ai" size="lg" className="text-lg px-8 py-4">
                Explore Agents
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-white/80">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$2.4M</div>
                <div className="text-sm text-white/80">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-sm text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;