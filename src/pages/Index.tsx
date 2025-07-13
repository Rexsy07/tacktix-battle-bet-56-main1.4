
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedMatches from "@/components/home/FeaturedMatches";
import GameModes from "@/components/home/GameModes";
import LiveMatches from "@/components/home/LiveMatches";
import Leaderboard from "@/components/home/Leaderboard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFeaturedMatches, getLiveMatches, getLeaderboardData, getGameModes } from "@/utils/home-utils";

const Index = () => {
  const { user } = useAuth();
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [gameModes, setGameModes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured matches
        const featuredResult = await getFeaturedMatches();
        if (featuredResult.success) {
          setFeaturedMatches(featuredResult.data);
        }
        
        // Fetch live matches
        const liveResult = await getLiveMatches();
        if (liveResult.success) {
          setLiveMatches(liveResult.data);
        }
        
        // Fetch leaderboard data
        const leaderboardResult = await getLeaderboardData();
        if (leaderboardResult.success) {
          setLeaderboardData(leaderboardResult.data);
        }
        
        // Fetch game modes
        const modesResult = await getGameModes();
        if (modesResult.success) {
          setGameModes(modesResult.data);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
    
    // Only set up refresh interval if user is authenticated and on desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const shouldRefresh = user && !isMobile;
    
    let interval: NodeJS.Timeout | null = null;
    if (shouldRefresh) {
      interval = setInterval(fetchHomeData, 60000); // Refresh every minute instead of 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user]);

  return (
    <Layout fullWidth>
      <HeroSection />
      <LiveMatches matches={liveMatches} isLoading={loading} />
      <FeaturedMatches matches={featuredMatches} isLoading={loading} />
      <GameModes modes={gameModes} isLoading={loading} />
      <Leaderboard leaderboardData={leaderboardData} isLoading={loading} />
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-tacktix-blue rounded-full filter blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tacktix-red rounded-full filter blur-[150px] opacity-10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-xl p-8 lg:p-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Test Your Skills?</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of Call of Duty Mobile players competing and earning real money on TacktixEdge.
            </p>
            <Link to={user ? "/matchmaking" : "/sign-up"}>
              <Button variant="gradient" animation="pulseglow" size="lg" className="font-semibold">
                {user ? "Find Matches" : "Get Started Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
