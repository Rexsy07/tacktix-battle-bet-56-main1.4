
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trophy, XCircle, Swords, Flag, Upload, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { uploadMatchEvidence, submitMatchResult } from "@/utils/match-results-utils";
import { supabase } from "@/integrations/supabase/client";

interface MatchResultFormProps {
  matchId: string;
  currentUserId: string;
  hostId: string;
  opponentId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MatchResultForm = ({
  matchId,
  currentUserId,
  hostId,
  opponentId,
  onSuccess,
  onCancel
}: MatchResultFormProps) => {
  const [resultType, setResultType] = useState<"win" | "loss" | "draw" | "dispute">("win");
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [proofNotes, setProofNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProofImages([...proofImages, ...filesArray]);
    }
  };
  
  const removeProofImage = (index: number) => {
    setProofImages(proofImages.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (proofImages.length === 0) {
      toast({
        title: "Proof Required",
        description: "Please upload at least one screenshot as proof",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload proof images
      const { urls, error: uploadError } = await uploadMatchEvidence(
        matchId,
        currentUserId,
        proofImages
      );
      
      if (uploadError) throw new Error(uploadError);
      
      // Determine winner based on result type
      let winnerId = null;
      if (resultType === "win") {
        winnerId = currentUserId;
      } else if (resultType === "loss") {
        winnerId = currentUserId === hostId ? opponentId : hostId;
      }
      
      // Create match result
      const { success, error } = await submitMatchResult(
        matchId,
        currentUserId,
        resultType,
        winnerId,
        urls,
        proofNotes
      );
      
      if (!success) throw new Error(error);
      
      // Update match status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          status: resultType === "dispute" ? "disputed" : "completed",
          ...(winnerId && { winner_id: winnerId })
        })
        .eq("id", matchId);
        
      if (matchError) throw matchError;
      
      toast({
        title: "Result Submitted",
        description: "Your match result has been submitted successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit result",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Match Result</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={resultType === "win" ? "default" : "outline"}
            onClick={() => setResultType("win")}
            className="w-full"
          >
            <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
            I Won
          </Button>
          <Button
            type="button"
            variant={resultType === "loss" ? "default" : "outline"}
            onClick={() => setResultType("loss")}
            className="w-full"
          >
            <XCircle className="mr-2 h-4 w-4" />
            I Lost
          </Button>
          <Button
            type="button"
            variant={resultType === "draw" ? "default" : "outline"}
            onClick={() => setResultType("draw")}
            className="w-full"
          >
            <Swords className="mr-2 h-4 w-4" />
            Draw
          </Button>
          <Button
            type="button"
            variant={resultType === "dispute" ? "destructive" : "outline"}
            onClick={() => setResultType("dispute")}
            className="w-full"
          >
            <Flag className="mr-2 h-4 w-4" />
            Dispute
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="screenshot-upload">Upload Screenshots</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            <Upload className="mr-1 h-3 w-3" />
            Add Images
          </Button>
        </div>
        
        <input
          type="file"
          id="screenshot-upload"
          className="hidden"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {proofImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {proofImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Proof ${index + 1}`}
                  className="h-20 w-full object-cover rounded border border-gray-700"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeProofImage(index)}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center cursor-pointer hover:bg-tacktix-dark-light/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, or JPEG (Max 5MB each)
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="proof-notes">Additional Notes</Label>
        <Textarea
          id="proof-notes"
          placeholder="Add any additional information about the match..."
          value={proofNotes}
          onChange={(e) => setProofNotes(e.target.value)}
          className="bg-tacktix-dark-deeper border-tacktix-dark-light"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || proofImages.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Result"
          )}
        </Button>
      </div>
    </div>
  );
};

export default MatchResultForm;
