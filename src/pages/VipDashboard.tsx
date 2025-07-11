
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Trophy, TrendingUp, Users, Star, Flame, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface HighStakeMatch {
  id: string;
  title: string;
  game_mode: string;
  map_name: string;
  bet_amount: number;
  status: string;
  participants: {
    host: any[];
    opponent: any[];
  };
  created_at: string;
  current_players: number;
  max_players: number;
  is_vip_match: boolean;
}

interface VIPPlayer {
  id: string;
  username: string;
  avatar_url: string;
  total_earnings: number;
  wins: number;
  total_matches: number;
  is_vip: boolean;
}

interface UserStats {
  total_vip_matches: number;
  vip_wins: number;
  vip_earnings: number;
  vip_win_rate: number;
}

const VipDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [highStakeMatches, setHighStakeMatches] = useState<HighStakeMatch[]>([]);
  const [vipPlayers, setVipPlayers] = useState<VIPPlayer[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_vip_matches: 0,
    vip_wins: 0,
    vip_earnings: 0,
    vip_win_rate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "VIP Access Required",
        description: "Please sign in to access VIP features",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }

    setCurrentUser(session.user);
    await Promise.all([
      fetchHighStakeMatches(),
      fetchVIPPlayers(),
      fetchUserVIPStats(session.user.id)
    ]);
  };

  const fetchHighStakeMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          title,
          game_mode,
          map_name,
          bet_amount,
          status,
          created_at,
          current_players,
          max_players,
          is_vip_match,
          host:host_id(username, avatar_url),
          opponent:opponent_id(username, avatar_url)
        `)
        .eq("is_vip_match", true)
        .gte("bet_amount", 10000)
        .order("bet_amount", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedMatches = data?.map(match => ({
        ...match,
        participants: {
          host: match.host ? [match.host] : [],
          opponent: match.opponent ? [match.opponent] : []
        }
      })) || [];

      setHighStakeMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching high stake matches:", error);
    }
  };

  const fetchVIPPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_vip", true)
        .order("total_earnings", { ascending: false })
        .limit(10);

      if (error) throw error;
      setVipPlayers(data || []);
    } catch (error) {
      console.error("Error fetching VIP players:", error);
    }
  };

  const fetchUserVIPStats = async (userId: string) => {
    try {
      const { data: vipMatches, error } = await supabase
        .from("matches")
        .select("*")
        .eq("is_vip_match", true)
        .or(`host_id.eq.${userId},opponent_id.eq.${userId}`);

      if (error) throw error;

      const totalVIPMatches = vipMatches?.length || 0;
      const vipWins = vipMatches?.filter(m => m.winner_id === userId).length || 0;
      
      const { data: vipTransactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "win")
        .eq("status", "completed");

      const vipEarnings = vipTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const vipWinRate = totalVIPMatches > 0 ? (vipWins / totalVIPMatches) * 100 : 0;

      setUserStats({
        total_vip_matches: totalVIPMatches,
        vip_wins: vipWins,
        vip_earnings: vipEarnings,
        vip_win_rate: vipWinRate
      });
    } catch (error) {
      console.error("Error fetching user VIP stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createVIPMatch = () => {
    navigate("/matchmaking?tab=create&vip=true");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Crown className="h-7 w-7 text-yellow-500 mr-2" />
              VIP Dashboard
            </h1>
            <p className="text-gray-400">Exclusive high-stakes gaming for VIP members</p>
          </div>
          <Button variant="gradient" onClick={createVIPMatch}>
            <Plus className="h-4 w-4 mr-2" />
            Create VIP Match
          </Button>
        </div>

        {/* VIP Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">VIP Matches</p>
                  <p className="text-2xl font-bold">{userStats.total_vip_matches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">VIP Wins</p>
                  <p className="text-2xl font-bold">{userStats.vip_wins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">VIP Earnings</p>
                  <p className="text-2xl font-bold">₦{userStats.vip_earnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Flame className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold">{userStats.vip_win_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Stake Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-500" />
              High Stake Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highStakeMatches.length > 0 ? (
              <div className="space-y-4">
                {highStakeMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{match.title}</h3>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                          VIP
                        </Badge>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          ₦{Number(match.bet_amount).toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{match.game_mode}</span>
                        <span>Map: {match.map_name}</span>
                        <span>{match.current_players}/{match.max_players} players</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/match/${match.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No VIP Matches Available</h3>
                <p className="text-gray-400 mb-4">Be the first to create a high-stakes VIP match!</p>
                <Button onClick={createVIPMatch}>
                  Create VIP Match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VIP Players */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top VIP Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vipPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-yellow-500">#{index + 1}</span>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback>{player.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{player.username}</h3>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        VIP
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {player.wins} wins • {player.total_matches} matches • ₦{Number(player.total_earnings).toLocaleString()} earned
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-tacktix-blue">₦{Number(player.total_earnings).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VipDashboard;
