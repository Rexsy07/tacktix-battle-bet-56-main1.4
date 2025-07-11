
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Target, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface UserStats {
  matches_played: number;
  matches_won: number;
  win_rate: number;
  total_earnings: number;
}

interface Match {
  id: string;
  title: string;
  game_mode: string;
  bet_amount: number;
  prize_pool: number;
  status: string;
  created_at: string;
  winner_id: string | null;
  host_id: string | null;
  opponent_id: string | null;
}

const History = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    matches_played: 0,
    matches_won: 0,
    win_rate: 0,
    total_earnings: 0
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your history",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }

    setCurrentUserId(session.user.id);
    await Promise.all([
      fetchUserMatches(session.user.id),
      fetchUserEarnings(session.user.id)
    ]);
  };

  const fetchUserMatches = async (userId: string) => {
    try {
      // Get matches where user is either host or opponent
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (matchError) throw matchError;

      if (matchData) {
        setMatches(matchData);
        
        // Calculate stats from actual matches
        const totalMatches = matchData.length;
        const completedMatches = matchData.filter(m => m.status === 'completed');
        const wins = completedMatches.filter(m => m.winner_id === userId).length;
        const winRate = completedMatches.length > 0 ? (wins / completedMatches.length) * 100 : 0;

        setUserStats(prev => ({
          ...prev,
          matches_played: totalMatches,
          matches_won: wins,
          win_rate: winRate
        }));
      }
    } catch (error) {
      console.error("Error fetching user matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch match history",
        variant: "destructive",
      });
    }
  };

  const fetchUserEarnings = async (userId: string) => {
    try {
      // Get total earnings from transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", userId)
        .eq("status", "completed");

      if (error) throw error;

      let totalEarnings = 0;
      transactions?.forEach(tx => {
        if (tx.type === 'win') {
          totalEarnings += tx.amount;
        } else if (tx.type === 'deposit') {
          // Don't count deposits as earnings
        }
      });

      setUserStats(prev => ({
        ...prev,
        total_earnings: totalEarnings
      }));
    } catch (error) {
      console.error("Error fetching user earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'active':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getMatchResult = (match: Match) => {
    if (match.status !== 'completed') return null;
    if (match.winner_id === currentUserId) return 'Won';
    return 'Lost';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Match History</h1>
          <p className="text-gray-400">Track your gaming performance and earnings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Matches Played</p>
                  <p className="text-2xl font-bold">{userStats.matches_played}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Matches Won</p>
                  <p className="text-2xl font-bold">{userStats.matches_won}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold">{userStats.win_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold">₦{userStats.total_earnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{match.title}</h3>
                        <Badge variant="outline" className={getMatchStatusColor(match.status)}>
                          {match.status}
                        </Badge>
                        {getMatchResult(match) && (
                          <Badge variant={getMatchResult(match) === 'Won' ? 'default' : 'secondary'}>
                            {getMatchResult(match)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{match.game_mode}</span>
                        <span>Bet: ₦{match.bet_amount.toLocaleString()}</span>
                        <span>Prize: ₦{match.prize_pool.toLocaleString()}</span>
                        <span>{formatDate(match.created_at)}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/match-details/${match.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Matches Yet</h3>
                <p className="text-gray-400 mb-4">Start playing to build your match history!</p>
                <Button onClick={() => navigate("/matchmaking")}>
                  Find a Match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
