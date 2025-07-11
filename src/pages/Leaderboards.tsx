
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Target, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardPlayer {
  id: string;
  username: string;
  avatar_url: string;
  wins: number;
  total_matches: number;
  total_earnings: number;
  rating: number;
  win_rate: number;
}

const Leaderboards = () => {
  const [topEarners, setTopEarners] = useState<LeaderboardPlayer[]>([]);
  const [topWinners, setTopWinners] = useState<LeaderboardPlayer[]>([]);
  const [topRated, setTopRated] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch all profiles with earnings calculation
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .gt("total_matches", 0)
        .order("total_earnings", { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      // Calculate real earnings from transactions for each user
      const playersWithEarnings = await Promise.all(
        profiles?.map(async (profile) => {
          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", profile.id)
            .eq("status", "completed");

          let realEarnings = 0;
          transactions?.forEach(tx => {
            if (tx.type === 'win') {
              realEarnings += tx.amount;
            }
          });

          return {
            ...profile,
            total_earnings: realEarnings,
            win_rate: profile.total_matches > 0 ? (profile.wins / profile.total_matches) * 100 : 0
          };
        }) || []
      );

      // Sort by actual earnings
      const topEarnersList = [...playersWithEarnings]
        .sort((a, b) => b.total_earnings - a.total_earnings)
        .slice(0, 10);
      setTopEarners(topEarnersList);

      // Top winners (sort by wins)
      const topWinnersList = [...playersWithEarnings]
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);
      setTopWinners(topWinnersList);

      // Top rated (sort by rating)
      const topRatedList = [...playersWithEarnings]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);
      setTopRated(topRatedList);

    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 2:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
      case 3:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const LeaderboardTable = ({ players, type }: { players: LeaderboardPlayer[], type: 'earnings' | 'wins' | 'rating' }) => {
    const getValue = (player: LeaderboardPlayer) => {
      switch (type) {
        case 'earnings':
          return `₦${player.total_earnings.toLocaleString()}`;
        case 'wins':
          return `${player.wins} wins`;
        case 'rating':
          return `${player.rating} pts`;
        default:
          return '';
      }
    };

    const getSecondaryValue = (player: LeaderboardPlayer) => {
      switch (type) {
        case 'earnings':
          return `${player.total_matches} matches • ${player.win_rate.toFixed(1)}% win rate`;
        case 'wins':
          return `${player.total_matches} matches • ₦${player.total_earnings.toLocaleString()}`;
        case 'rating':
          return `${player.wins} wins • ${player.win_rate.toFixed(1)}% win rate`;
        default:
          return '';
      }
    };

    return (
      <div className="space-y-4">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              {getRankIcon(index + 1)}
              <Badge variant="outline" className={getRankBadgeColor(index + 1)}>
                #{index + 1}
              </Badge>
            </div>
            
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatar_url} />
              <AvatarFallback>{player.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{player.username}</h3>
                {index < 3 && (
                  <Badge variant="outline" className={getRankBadgeColor(index + 1)}>
                    Top {index + 1}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">{getSecondaryValue(player)}</p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-tacktix-blue">{getValue(player)}</p>
            </div>
          </div>
        ))}
      </div>
    );
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
        <div>
          <h1 className="text-2xl font-bold">Leaderboards</h1>
          <p className="text-gray-400">See where you rank among the best players</p>
        </div>

        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="earnings">Top Earners</TabsTrigger>
            <TabsTrigger value="wins">Most Wins</TabsTrigger>
            <TabsTrigger value="rating">Highest Rated</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Earners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable players={topEarners} type="earnings" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Most Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable players={topWinners} type="wins" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rating">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Highest Rated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable players={topRated} type="rating" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Leaderboards;
