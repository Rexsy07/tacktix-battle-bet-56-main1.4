
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { processMatchPayout } from "@/utils/wallet-utils";

interface ResultSubmission {
  id: string;
  match_id: string;
  submitted_by: string;
  result_type: string;
  winner_id: string | null;
  notes: string | null;
  proof_urls: string[] | null;
  created_at: string;
  match: {
    title: string;
    game_mode: string;
    prize_pool: number;
  } | null;
  submitter: {
    username: string;
  } | null;
  winner: {
    username: string;
  } | null;
}

const ResultReviewList = () => {
  const [submissions, setSubmissions] = useState<ResultSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      console.log("Fetching match result submissions...");
      
      // First get the submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("match_result_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (submissionsError) {
        console.error("Supabase error:", submissionsError);
        throw submissionsError;
      }

      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        return;
      }

      console.log("Fetched submissions:", submissionsData);

      // Get match details
      const matchIds = [...new Set(submissionsData.map(s => s.match_id))];
      const { data: matchesData } = await supabase
        .from("matches")
        .select("id, title, game_mode, prize_pool")
        .in("id", matchIds);

      // Get submitter profiles
      const submitterIds = [...new Set(submissionsData.map(s => s.submitted_by))];
      const { data: submittersData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", submitterIds);

      // Get winner profiles
      const winnerIds = [...new Set(submissionsData.filter(s => s.winner_id).map(s => s.winner_id))];
      const { data: winnersData } = winnerIds.length > 0 ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", winnerIds) : { data: [] };

      // Transform the data to match expected structure
      const transformedData: ResultSubmission[] = submissionsData.map(submission => {
        const match = matchesData?.find(m => m.id === submission.match_id) || null;
        const submitter = submittersData?.find(p => p.id === submission.submitted_by) || null;
        const winner = submission.winner_id ? winnersData?.find(p => p.id === submission.winner_id) || null : null;

        return {
          ...submission,
          match: match ? { 
            title: match.title, 
            game_mode: match.game_mode,
            prize_pool: match.prize_pool || 0
          } : null,
          submitter: submitter ? { username: submitter.username } : null,
          winner: winner ? { username: winner.username } : null
        };
      });

      setSubmissions(transformedData);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch result submissions",
        variant: "destructive"
      });
      // Set empty array on error to prevent iteration issues
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResult = async (submission: ResultSubmission) => {
    try {
      // Update match with winner and completed status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          winner_id: submission.winner_id,
          status: "completed",
          end_time: new Date().toISOString()
        })
        .eq("id", submission.match_id);

      if (matchError) throw matchError;

      // Process payout with platform fee if there's a winner and prize pool
      if (submission.winner_id && submission.match?.prize_pool && submission.match.prize_pool > 0) {
        const { success: payoutSuccess, error: payoutError } = await processMatchPayout(
          submission.winner_id,
          submission.match_id,
          submission.match.prize_pool
        );

        if (!payoutSuccess) {
          throw new Error(payoutError || "Failed to process match payout");
        }
      }

      // Remove the submission after approval
      const { error: deleteError } = await supabase
        .from("match_result_submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Result Approved",
        description: `Match result approved. Winner declared and prize awarded (₦${((submission.match?.prize_pool || 0) * 0.9).toLocaleString()})`,
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error("Error approving result:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve result",
        variant: "destructive"
      });
    }
  };

  const handleRejectResult = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("match_result_submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Result Rejected",
        description: "Match result has been rejected",
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error("Error rejecting result:", error);
      toast({
        title: "Error",
        description: "Failed to reject result",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Match Result Reviews</h2>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
          {submissions.length} Pending
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending result submissions to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {submission.match?.title || "Unknown Match"}
                  </CardTitle>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Game Mode</p>
                    <p className="font-medium">{submission.match?.game_mode || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prize Pool</p>
                    <p className="font-medium">₦{(submission.match?.prize_pool || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Submitted By</p>
                    <p className="font-medium">{submission.submitter?.username || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Result Type</p>
                    <p className="font-medium capitalize">{submission.result_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Declared Winner</p>
                    <p className="font-medium">{submission.winner?.username || "None"}</p>
                  </div>
                </div>

                {submission.notes && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Notes</p>
                    <p className="text-sm bg-gray-800 p-3 rounded">{submission.notes}</p>
                  </div>
                )}

                {submission.proof_urls && submission.proof_urls.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Evidence ({submission.proof_urls.length} files)</p>
                    <div className="flex gap-2">
                      {submission.proof_urls.map((url, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectResult(submission.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveResult(submission)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Award Prize
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultReviewList;
