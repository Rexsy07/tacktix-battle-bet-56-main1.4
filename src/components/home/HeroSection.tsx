
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tacktix-blue rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tacktix-red rounded-full filter blur-[150px] opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 animate-float">
            <div className="bg-tacktix-blue/10 backdrop-blur-sm border border-tacktix-blue/20 rounded-full px-4 py-1 text-sm text-tacktix-blue flex items-center">
              <span className="bg-tacktix-blue text-white text-xs px-2 py-0.5 rounded-full mr-2">NEW</span>
              <span>Launching soon - Join the waitlist today!</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-gradient">Elevate</span> Your CoD Mobile <span className="text-gradient">Skills & Earnings</span>
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            TacktixEdge lets you compete in high-stakes Call of Duty Mobile matches, 
            bet on your gameplay, and earn real money based on your skills.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link to={user ? "/matchmaking" : "/sign-up"}>
              <Button variant="gradient" animation="pulseglow" size="xl" className="font-semibold">
                {user ? "Find Matches" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="xl" className="font-semibold">
                How It Works
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              {
                icon: <Zap className="h-6 w-6 text-tacktix-blue" />,
                title: "Fast Matchmaking",
                description: "Find opponents in seconds and start competing right away."
              },
              {
                icon: <DollarSign className="h-6 w-6 text-tacktix-blue" />,
                title: "Secure Payments",
                description: "Deposit, withdraw, and manage your earnings with ease."
              },
              {
                icon: <Shield className="h-6 w-6 text-tacktix-blue" />,
                title: "Fair Gameplay",
                description: "Our verification system ensures all matches are legitimate."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="glass-card rounded-lg p-6 text-center hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
              >
                <div className="bg-tacktix-dark-light w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
