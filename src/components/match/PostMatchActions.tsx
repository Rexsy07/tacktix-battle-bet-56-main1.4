
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Flag, Star, Upload } from "lucide-react";
import MatchResultSubmission from "./MatchResultSubmission";
import UserReportForm from "./UserReportForm";
import PlayerRatingForm from "./PlayerRatingForm";

interface PostMatchActionsProps {
  matchId: string;
  currentUserId: string;
  opponentId: string;
  opponentUsername: string;
  onResultSubmitted: () => void;
}

const PostMatchActions = ({
  matchId,
  currentUserId,
  opponentId,
  opponentUsername,
  onResultSubmitted
}: PostMatchActionsProps) => {
  const [activeDialog, setActiveDialog] = useState<"result" | "report" | "rating" | null>(null);

  const handleSuccess = () => {
    setActiveDialog(null);
    if (activeDialog === "result") {
      onResultSubmitted();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Post-Match Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => setActiveDialog("result")}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Submit Result
        </Button>
        
        <Button
          onClick={() => setActiveDialog("rating")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Rate Player
        </Button>
        
        <Button
          onClick={() => setActiveDialog("report")}
          variant="outline"
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Flag className="h-4 w-4" />
          Report Player
        </Button>
      </div>

      {/* Result Submission Dialog */}
      <Dialog open={activeDialog === "result"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Match Result</DialogTitle>
          </DialogHeader>
          <MatchResultSubmission
            matchId={matchId}
            currentUserId={currentUserId}
            onSuccess={handleSuccess}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Player Rating Dialog */}
      <Dialog open={activeDialog === "rating"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Player</DialogTitle>
          </DialogHeader>
          <PlayerRatingForm
            matchId={matchId}
            ratedUserId={opponentId}
            ratedUsername={opponentUsername}
            currentUserId={currentUserId}
            onSuccess={handleSuccess}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Report User Dialog */}
      <Dialog open={activeDialog === "report"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Player</DialogTitle>
          </DialogHeader>
          <UserReportForm
            matchId={matchId}
            reportedUserId={opponentId}
            reportedUsername={opponentUsername}
            currentUserId={currentUserId}
            onSuccess={handleSuccess}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostMatchActions;
