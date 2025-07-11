
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Tournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningTournament, setJoiningTournament] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          participants:tournament_participants(count)
        `)
        .in("status", ["upcoming", "registration_open"])
        .order("start_date", { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournament) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join tournaments",
        variant: "destructive"
      });
      return;
    }

    setJoiningTournament(tournament.id);
    try {
      // Check if user is already registered
      const { data: existingParticipant } = await supabase
        .from("tournament_participants")
        .select("*")
        .eq("tournament_id", tournament.id)
        .eq("user_id", user.id)
        .single();

      if (existingParticipant) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this tournament",
          variant: "destructive"
        });
        return;
      }

      // Check if tournament is full
      if (tournament.current_participants >= tournament.max_participants) {
        toast({
          title: "Tournament Full",
          description: "This tournament has reached maximum capacity",
          variant: "destructive"
        });
        return;
      }

      // Register for tournament
      const { error } = await supabase
        .from("tournament_participants")
        .insert({
          tournament_id: tournament.id,
          user_id: user.id
        });

      if (error) throw error;

      // Update tournament participant count
      await supabase
        .from("tournaments")
        .update({
          current_participants: tournament.current_participants + 1
        })
        .eq("id", tournament.id);

      toast({
        title: "Success!",
        description: "You have successfully registered for the tournament"
      });

      fetchTournaments();
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast({
        title: "Error",
        description: "Failed to join tournament",
        variant: "destructive"
      });
    } finally {
      setJoiningTournament(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-500';
      case 'registration_open':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-orange-500/10 text-orange-500';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Tournaments</h1>
          <p className="text-gray-400">Compete in organized tournaments for bigger prizes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <div>
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournament.description && (
                  <p className="text-gray-300 text-sm">{tournament.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>{tournament.game_mode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{tournament.current_participants}/{tournament.max_participants} Players</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {tournament.entry_fee > 0 
                          ? `₦${tournament.entry_fee.toLocaleString()} Entry`
                          : "Free Entry"
                        }
                      </span>
                    </div>
                  </div>

                  {tournament.prize_pool > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">
                          ₦{tournament.prize_pool.toLocaleString()} Prize Pool
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(tournament.start_date)}</span>
                  </div>

                  {tournament.end_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {formatDate(tournament.end_date)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => joinTournament(tournament)}
                    disabled={
                      joiningTournament === tournament.id ||
                      tournament.current_participants >= tournament.max_participants ||
                      tournament.status !== 'registration_open'
                    }
                    className="w-full"
                    variant={tournament.status === 'registration_open' ? "gradient" : "outline"}
                  >
                    {joiningTournament === tournament.id ? "Joining..." :
                     tournament.current_participants >= tournament.max_participants ? "Tournament Full" :
                     tournament.status === 'registration_open' ? "Join Tournament" : "Registration Closed"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {tournaments.length === 0 && (
            <div className="col-span-full">
              <Card className="glass-card p-8 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <Trophy size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Active Tournaments</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    There are no tournaments available at the moment. Check back later for upcoming tournaments!
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tournaments;
