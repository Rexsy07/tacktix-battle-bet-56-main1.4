
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PostMatchActions from "@/components/match/PostMatchActions";
import { Loader2 } from "lucide-react";

interface Match {
  id: string;
  title: string;
  host_id: string;
  opponent_id: string | null;
  status: string;
  created_by: string;
}

const SubmitResult = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchAndUserData();
  }, [matchId]);

  const fetchMatchAndUserData = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit results",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }
      setCurrentUser(session.user);

      // Get match details
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Get host profile
      const hostId = matchData.host_id || matchData.created_by;
      const { data: hostData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", hostId)
        .single();
      setHostProfile(hostData);

      // Get opponent profile if exists
      if (matchData.opponent_id) {
        const { data: opponentData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", matchData.opponent_id)
          .single();
        setOpponentProfile(opponentData);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultSubmitted = () => {
    toast({
      title: "Result Submitted",
      description: "Your match result has been submitted successfully",
    });
    navigate(`/featured-match/${matchId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-tacktix-blue" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const opponentUser = currentUser?.id === match.host_id ? opponentProfile : hostProfile;
  const opponentId = currentUser?.id === match.host_id ? match.opponent_id : match.host_id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-4">Submit Match Result</h1>
          <p className="text-gray-400">Match: {match.title}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-tacktix-dark-light rounded">
                <h3 className="font-bold">{hostProfile?.username || "Host"}</h3>
                <p className="text-sm text-gray-400">Host Player</p>
              </div>
              <div className="text-center p-4 bg-tacktix-dark-light rounded">
                <h3 className="font-bold">{opponentProfile?.username || "Opponent"}</h3>
                <p className="text-sm text-gray-400">Opponent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {match.opponent_id && (
          <PostMatchActions
            matchId={match.id}
            currentUserId={currentUser?.id}
            opponentId={opponentId}
            opponentUsername={opponentUser?.username || "Unknown"}
            onResultSubmitted={handleResultSubmitted}
          />
        )}
      </div>
    </Layout>
  );
};

export default SubmitResult;
