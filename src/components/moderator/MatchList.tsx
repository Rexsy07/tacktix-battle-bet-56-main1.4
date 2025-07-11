
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GamepadIcon, Search, Users, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Match {
  id: string;
  title: string;
  game_mode: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  created_at: string;
  creator?: {
    username: string;
  };
  winner?: {
    username: string;
  };
}

const MatchList = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          creator:profiles!matches_created_by_fkey(username),
          winner:profiles!matches_winner_id_fkey(username)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.game_mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/10 text-green-500';
      case 'active': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-gray-500/10 text-gray-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GamepadIcon className="h-5 w-5 text-green-500" />
          Match Oversight ({matches.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search matches..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <GamepadIcon className="h-12 w-12 mx-auto mb-4" />
            <p>No matches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{match.title}</h4>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{match.game_mode}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-400">Creator</span>
                        <span className="text-white">{match.creator?.username || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Players</span>
                        <div className="flex items-center gap-1 text-white">
                          <Users className="h-3 w-3" />
                          {match.current_players || 0}/{match.max_players}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400">Entry Fee</span>
                        <div className="flex items-center gap-1 text-white">
                          <DollarSign className="h-3 w-3" />
                          {match.entry_fee}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400">Prize Pool</span>
                        <div className="flex items-center gap-1 text-white">
                          <DollarSign className="h-3 w-3" />
                          {match.prize_pool}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400">Winner</span>
                        <span className="text-white">{match.winner?.username || "TBD"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(match.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchList;
