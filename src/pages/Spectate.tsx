
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Clock, Trophy, Map, Eye, MessagesSquare, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Spectate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<any>(null);
  const [spectators, setSpectators] = useState(0);
  
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            host:host_id(username, avatar_url),
            opponent:opponent_id(username, avatar_url)
          `)
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Match not found",
            description: "The match you're trying to spectate doesn't exist",
            variant: "destructive",
          });
          navigate("/matchmaking");
          return;
        }
        
        if (data.status !== "in-progress") {
          toast({
            title: "Match not live",
            description: "This match is not currently in progress",
            variant: "destructive",
          });
          navigate(`/match/${id}`);
          return;
        }
        
        setMatch(data);
        
        // Simulate random number of spectators
        setSpectators(Math.floor(Math.random() * 20) + 5);
      } catch (error: any) {
        console.error("Error fetching match:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load match details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatch();
    
    // Set up real-time subscription for match updates
    const matchSubscription = supabase
      .channel('public:matches')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matches',
        filter: `id=eq.${id}` 
      }, (payload) => {
        setMatch((currentMatch: any) => ({ ...currentMatch, ...payload.new }));
        
        // If match status changes to completed, show toast and redirect
        if (payload.new.status === 'completed') {
          toast({
            title: "Match Ended",
            description: "The match has been completed. Redirecting to results...",
          });
          
          setTimeout(() => {
            navigate(`/match/${id}`);
          }, 3000);
        }
      })
      .subscribe();
      
    // Clean up the subscription
    return () => {
      supabase.removeChannel(matchSubscription);
    };
  }, [id, navigate, toast]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Live Match</h1>
              <p className="text-gray-400">You are spectating a live match</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center bg-tacktix-red/10 text-tacktix-red animate-pulse">
                <span className="h-2 w-2 bg-tacktix-red rounded-full mr-2"></span>
                LIVE
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 bg-tacktix-blue/10">
                <Eye size={12} className="mr-1" />
                <span>{spectators} watching</span>
              </Badge>
            </div>
          </div>
        </div>
        
        {match && (
          <>
            <Card className="glass-card mb-6">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center">
                      {match.game_mode}
                      <Badge variant="outline" className="ml-3 bg-tacktix-blue/10">
                        ₦{Number(match.bet_amount).toLocaleString()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Map: {match.map_name}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <Share2 size={14} className="mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <MessagesSquare size={14} className="mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-center py-4 space-y-6 md:space-y-0 md:space-x-10">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={match.host?.avatar_url} />
                      <AvatarFallback className="bg-tacktix-blue text-white text-xl">
                        {match.host?.username?.charAt(0).toUpperCase() || "H"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold mt-3">{match.host?.username}</h3>
                    <Badge className="mt-1">Host</Badge>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold tacktix-gradient bg-clip-text text-transparent mb-2">VS</div>
                    <Badge variant="outline" className="bg-tacktix-blue/10">
                      ₦{(Number(match.bet_amount) * 2).toLocaleString()} Prize
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={match.opponent?.avatar_url} />
                      <AvatarFallback className="bg-tacktix-red text-white text-xl">
                        {match.opponent?.username?.charAt(0).toUpperCase() || "O"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold mt-3">{match.opponent?.username}</h3>
                    <Badge variant="secondary" className="mt-1">Opponent</Badge>
                  </div>
                </div>
                
                <div className="mt-6 bg-tacktix-dark-light rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle size={20} className="text-tacktix-blue mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">
                        This match is currently in progress. Players are competing and results will be available once the match is completed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="glass-card rounded-lg p-6 flex flex-col items-center justify-center text-center mb-8">
              <div className="text-xl font-bold mb-4">Live Match View</div>
              <div className="w-full aspect-video bg-tacktix-dark-deeper flex items-center justify-center rounded-lg border border-tacktix-blue/20 mb-4">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4 text-tacktix-blue opacity-50" />
                  <p className="text-gray-400">Live feed not available</p>
                  <p className="text-sm text-gray-500">Players may choose to stream their gameplay</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-2xl">
                Note: Spectating is allowed but not all matches have live feeds. You'll be notified when the match ends and results are available.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="mr-4"
                onClick={() => navigate("/matchmaking")}
              >
                Back to Matchmaking
              </Button>
              <Button 
                variant="gradient"
                onClick={() => navigate(`/match/${id}`)}
              >
                View Match Details
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Spectate;
