
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerRatingProps {
  matchId: string;
  playerId: string;
  playerName: string;
  currentUserId: string;
}

const PlayerRating = ({ matchId, playerId, playerName, currentUserId }: PlayerRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingRating();
  }, [matchId, playerId, currentUserId]);

  const fetchExistingRating = async () => {
    try {
      const { data, error } = await supabase
        .from("player_ratings")
        .select("*")
        .eq("match_id", matchId)
        .eq("rated_id", playerId)
        .eq("rater_id", currentUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingRating(data);
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error: any) {
      console.error("Error fetching existing rating:", error);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        match_id: matchId,
        rated_id: playerId,
        rater_id: currentUserId,
        rating,
        comment: comment.trim() || null,
      };

      let result;
      if (existingRating) {
        // Update existing rating
        result = await supabase
          .from("player_ratings")
          .update(ratingData)
          .eq("id", existingRating.id);
      } else {
        // Create new rating
        result = await supabase
          .from("player_ratings")
          .insert(ratingData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Rating Submitted",
        description: `You've successfully rated ${playerName}.`,
        variant: "default",
      });

      // Refresh the rating data
      await fetchExistingRating();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate {playerName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-colors"
            >
              <Star
                size={24}
                className={`${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 && `${rating}/5`}
          </span>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Comment (optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Share your thoughts about this player's performance..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmitRating}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
        </Button>

        {existingRating && (
          <p className="text-xs text-gray-500 text-center">
            You previously rated this player {existingRating.rating}/5
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerRating;
