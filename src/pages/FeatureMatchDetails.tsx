import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, User, Clock, Map, X, CheckCircle, ShieldAlert } from "lucide-react";
import { getUserBalance, deductFromBalance } from "@/utils/wallet-utils";

// Function to format time remaining
const formatTimeRemaining = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 60);
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
};

const FeatureMatchDetails = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserBalance, setCurrentUserBalance] = useState<number>(0);
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        console.log("Fetching match details for ID:", matchId);
        
        // First get the match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .single();
        
        if (matchError) {
          console.error("Match fetch error:", matchError);
          throw matchError;
        }
        
        console.log("Match data retrieved:", matchData);
        setMatch(matchData);
        
        // Get host profile - use created_by as fallback for host_id
        const hostId = (matchData as any).host_id || matchData.created_by;
        console.log("Fetching host profile for ID:", hostId);
        
        const { data: hostData, error: hostError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", hostId)
          .single();
        
        if (hostError) {
          console.error("Host profile fetch error:", hostError);
          throw hostError;
        }
        
        console.log("Host profile retrieved:", hostData);
        setHostProfile(hostData);
        
        // Get opponent profile if exists
        const opponentId = (matchData as any).opponent_id;
        if (opponentId) {
          console.log("Fetching opponent profile for ID:", opponentId);
          const { data: opponentData, error: opponentError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", opponentId)
            .single();
          
          if (!opponentError) {
            console.log("Opponent profile retrieved:", opponentData);
            setOpponentProfile(opponentData);
          } else {
            console.error("Opponent profile fetch error:", opponentError);
          }
        }
        
        // Get current user's session and balance using wallet utils
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Current user found:", session.user.id);
          setCurrentUser(session.user);
          
          // Use wallet utils to get balance
          const balance = await getUserBalance(session.user.id);
          console.log("User balance retrieved:", balance);
          setCurrentUserBalance(balance);
        } else {
          console.log("No current user session found");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching match details:", error);
        toast({
          title: "Error",
          description: "Failed to load match details. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId, toast]);

  // Add real-time subscription for match updates
  useEffect(() => {
    if (!matchId) return;

    console.log("Setting up real-time subscription for match:", matchId);
    
    const matchSubscription = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matches',
        filter: `id=eq.${matchId}` 
      }, async (payload) => {
        console.log("Real-time match update received:", payload);
        
        // Update match data immediately
        const updatedMatch = payload.new;
        setMatch(updatedMatch);
        
        // If opponent joined, fetch their profile
        if (updatedMatch.opponent_id && (!opponentProfile || opponentProfile.id !== updatedMatch.opponent_id)) {
          console.log("Opponent joined, fetching profile:", updatedMatch.opponent_id);
          
          try {
            const { data: opponentData, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", updatedMatch.opponent_id)
              .single();
            
            if (!error && opponentData) {
              console.log("Opponent profile loaded:", opponentData);
              setOpponentProfile(opponentData);
              
              toast({
                title: "Opponent Joined!",
                description: `${opponentData.username} has joined the match`,
              });
            }
          } catch (error) {
            console.error("Error fetching opponent profile:", error);
          }
        }
        
        // Handle status changes
        if (updatedMatch.status !== match?.status) {
          console.log("Match status changed:", updatedMatch.status);
          
          if (updatedMatch.status === 'active') {
            toast({
              title: "Match Started!",
              description: "The match is now active",
            });
          }
        }
      })
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(matchSubscription);
    };
  }, [matchId, match?.status, opponentProfile, toast]);
  
  const handleJoinMatch = async () => {
    try {
      setIsJoining(true);
      console.log("=== STARTING JOIN MATCH PROCESS (FeatureMatchDetails) ===");
      
      // Check user is logged in
      if (!currentUser) {
        console.error("❌ No current user found");
        toast({
          title: "Authentication Required",
          description: "Please sign in to join this match",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      const userId = currentUser.id;
      const betAmount = (match as any).bet_amount || match.entry_fee;
      
      console.log("📋 Join attempt details:");
      console.log("  - User ID:", userId);
      console.log("  - Bet amount:", betAmount);
      console.log("  - User balance:", currentUserBalance);
      console.log("  - Match status:", match.status);
      console.log("  - Current opponent_id:", (match as any).opponent_id);
      console.log("  - Match ID:", matchId);
      
      // Check user has enough balance
      if (currentUserBalance < betAmount) {
        console.error("❌ Insufficient balance");
        toast({
          title: "Insufficient Funds",
          description: "Please add funds to your wallet to join this match",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      // Check user is not the host
      const hostId = (match as any).host_id || match.created_by;
      if (userId === hostId) {
        console.error("❌ User is the host");
        toast({
          title: "Cannot Join Own Match",
          description: "You cannot join a match you created",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      console.log("✅ Basic validation checks passed");

      // Check current match state in database before attempting update
      console.log("🔍 Checking current match state in database...");
      const { data: currentMatchState, error: fetchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching current match state:", fetchError);
        throw new Error(`Failed to verify match state: ${fetchError.message}`);
      }

      console.log("📊 Current match state in database:", currentMatchState);

      if (currentMatchState.opponent_id) {
        console.log("❌ Match already has an opponent");
        toast({
          title: "Match Already Taken",
          description: "Someone else joined this match while you were trying to join",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }

      if (!['pending', 'open'].includes(currentMatchState.status)) {
        console.log("❌ Match not available. Status:", currentMatchState.status);
        toast({
          title: "Match Unavailable",
          description: "This match is no longer available to join",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }

      console.log("✅ All validation checks passed");

      console.log("🚀 Attempting to update match with opponent...");
      
      const updateData = {
        opponent_id: userId,
        status: "active",
        current_players: 2,
        start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("📝 Update data:", updateData);

      // Update the match with the opponent - remove .single() to avoid JSON object error
      const { data: updatedMatches, error: matchError } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchId)
        .eq("status", "pending")
        .is("opponent_id", null)
        .select();
      
      console.log("🔄 Database update response:");
      console.log("  - Updated matches data:", updatedMatches);
      console.log("  - Error:", matchError);

      if (matchError) {
        console.error("❌ Match update failed:", matchError);
        throw new Error(`Failed to join match: ${matchError.message} (Code: ${matchError.code})`);
      }

      if (!updatedMatches || updatedMatches.length === 0) {
        console.error("❌ No match was updated - this indicates the match was already taken or doesn't exist");
        toast({
          title: "Match Already Taken",
          description: "Someone else joined this match while you were trying to join",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }

      if (updatedMatches.length > 1) {
        console.error("❌ Multiple matches were updated - this should not happen");
        throw new Error("Multiple matches were updated unexpectedly");
      }

      const updatedMatch = updatedMatches[0];
      console.log("✅ Match updated successfully:", updatedMatch);

      // Deduct bet amount from user's balance using wallet utils
      console.log("💰 Deducting balance...");
      const { success: deductSuccess, error: deductError } = await deductFromBalance(
        userId,
        betAmount
      );
      
      if (!deductSuccess) {
        console.error("❌ Balance deduction failed:", deductError);
        // Try to rollback the match update
        console.log("🔄 Attempting to rollback match update...");
        await supabase
          .from("matches")
          .update({
            opponent_id: null,
            status: 'pending',
            current_players: 1,
            start_time: null
          })
          .eq("id", matchId);
        
        throw new Error(deductError || "Failed to deduct bet amount");
      }
      
      console.log("✅ Balance deducted successfully");
      
      // Create transaction record for bet
      console.log("📝 Creating transaction record...");
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: betAmount,
          type: "bet",
          status: "completed",
          description: `Bet placed on match ${matchId}`,
          match_id: matchId
        });
      
      if (transactionError) {
        console.error("⚠️ Transaction error (non-critical):", transactionError);
        // Don't throw here, just log - the match join was successful
      } else {
        console.log("✅ Transaction created successfully");
      }
      
      // Update balance
      const newBalance = await getUserBalance(userId);
      setCurrentUserBalance(newBalance);
      
      console.log("🎉 JOIN MATCH PROCESS COMPLETED SUCCESSFULLY");
      toast({
        title: "Match Joined!",
        description: "You have successfully joined this match. Good luck!",
      });
    } catch (error: any) {
      console.error("💥 CRITICAL ERROR in join process:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast({
        title: "Error",
        description: `Failed to join match: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-tacktix-blue" />
            <span className="ml-2 text-lg">Loading match details...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!match) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
            <p className="text-gray-400 mb-6">The match you're looking for doesn't exist or has been removed.</p>
            <Button variant="gradient" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Determine match status display
  const getStatusDisplay = () => {
    switch (match.status) {
      case "pending":
      case "open":
        return (
          <div className="bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
            Waiting for opponent
          </div>
        );
      case "active":
        return (
          <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            In Progress
          </div>
        );
      case "completed":
        return (
          <div className="bg-tacktix-blue/20 text-tacktix-blue px-3 py-1 rounded-full text-sm font-medium">
            Completed
          </div>
        );
      case "disputed":
        return (
          <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm font-medium">
            Disputed
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-gray-600/20 text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
            Cancelled
          </div>
        );
      default:
        return null;
    }
  };
  
  const betAmount = (match as any).bet_amount || match.entry_fee;
  const mapName = (match as any).map_name || "Unknown Map";
  const canJoin = ['pending', 'open'].includes(match.status) && !(match as any).opponent_id && currentUser;
  const isUserHost = currentUser && ((match as any).host_id === currentUser.id || match.created_by === currentUser.id);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="glass-card rounded-xl p-6 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Match Details</h1>
            {getStatusDisplay()}
          </div>
          
          {/* Match Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Game Mode</h3>
                <div className="flex items-center">
                  <Trophy className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">{match.game_mode}</span>
                </div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Map</h3>
                <div className="flex items-center">
                  <Map className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">{mapName}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Bet Amount</h3>
                <div className="text-tacktix-blue font-bold text-xl">₦{betAmount.toFixed(2)}</div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Potential Winnings</h3>
                <div className="text-green-500 font-bold text-xl">₦{(betAmount * 2).toFixed(2)}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Entry Fee</h3>
                <div className="font-mono bg-tacktix-dark p-2 rounded border border-tacktix-blue/30 text-white">
                  ₦{match.entry_fee.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Created On</h3>
                <div className="flex items-center">
                  <Clock className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">
                    {new Date(match.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Players */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Players</h2>
            
            <div className="bg-tacktix-dark-light rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Host Player */}
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-tacktix-dark">
                  <div className="h-20 w-20 rounded-full bg-tacktix-blue/20 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-tacktix-blue" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{hostProfile?.username || "Unknown"}</h3>
                  <p className="text-gray-400 text-sm mb-4">Host Player</p>
                  {match.winner_id === hostProfile?.id && (
                    <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      Winner
                    </div>
                  )}
                </div>
                
                {/* Opponent Player or Join Button */}
                {opponentProfile ? (
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-tacktix-dark">
                    <div className="h-20 w-20 rounded-full bg-tacktix-blue/20 flex items-center justify-center mb-4">
                      <User className="h-10 w-10 text-tacktix-blue" />
                    </div>
                    <h3 className="text-white font-bold text-lg">{opponentProfile.username}</h3>
                    <p className="text-gray-400 text-sm mb-4">Challenger</p>
                    {match.winner_id === opponentProfile.id && (
                      <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                        Winner
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-tacktix-dark border-2 border-dashed border-gray-700">
                    {canJoin && !isUserHost ? (
                      <>
                        <p className="text-gray-400 mb-4">This match is waiting for an opponent to join</p>
                        <Button 
                          variant="gradient" 
                          onClick={handleJoinMatch} 
                          disabled={isJoining}
                          className="w-full max-w-xs"
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            "Join This Match"
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Balance: ₦{currentUserBalance.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <div className="text-center">
                        <X className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400">
                          {isUserHost ? "You are the host of this match" : 
                           !currentUser ? "Please sign in to join" :
                           "No opponent joined this match"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Match Status & Actions */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold mb-2">Match Status</h2>
                <div className="flex items-center">
                  {match.status === "completed" ? (
                    <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                  ) : match.status === "disputed" ? (
                    <ShieldAlert className="text-red-500 mr-2 h-5 w-5" />
                  ) : (
                    <Clock className="text-tacktix-blue mr-2 h-5 w-5" />
                  )}
                  <span className="capitalize">{match.status.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
                
                {match.status === "active" && currentUser && (match.host_id === currentUser.id || match.opponent_id === currentUser.id) && (
                  <Button 
                    variant="gradient"
                    onClick={() => navigate(`/submit-result/${match.id}`)}
                  >
                    Submit Result
                  </Button>
                )}
                
                {match.status === "disputed" && (
                  <Button variant="gradient" animation="pulseglow">
                    View Dispute
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeatureMatchDetails;
