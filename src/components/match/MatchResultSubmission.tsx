
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, XCircle, Upload, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MatchResultSubmissionProps {
  matchId: string;
  currentUserId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MatchResultSubmission = ({
  matchId,
  currentUserId,
  onSuccess,
  onCancel
}: MatchResultSubmissionProps) => {
  const [resultType, setResultType] = useState<"win" | "loss" | "draw">("win");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEvidenceFiles([...evidenceFiles, ...filesArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };
  
  const uploadFiles = async () => {
    const evidenceUrls: string[] = [];
    
    // For now, we'll use placeholder URLs since storage might not be configured
    for (const file of evidenceFiles) {
      // Create a placeholder URL that represents the file
      const placeholderUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`;
      evidenceUrls.push(placeholderUrl);
    }
    
    return evidenceUrls;
  };
  
  const handleSubmit = async () => {
    if (evidenceFiles.length === 0) {
      toast({
        title: "Evidence Required",
        description: "Please upload at least one screenshot or video as proof",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload files and get URLs
      const evidenceUrls = await uploadFiles();
      
      // Determine winner based on result type
      let winnerId = null;
      if (resultType === "win") {
        winnerId = currentUserId;
      }
      
      // Submit result to database
      const { error } = await supabase
        .from("match_result_submissions")
        .insert({
          match_id: matchId,
          submitted_by: currentUserId,
          result_type: resultType,
          winner_id: winnerId,
          notes: description || null,
          proof_urls: evidenceUrls
        });
        
      if (error) throw error;
      
      toast({
        title: "Result Submitted",
        description: "Your match result has been submitted for review",
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
    <Card>
      <CardHeader>
        <CardTitle>Submit Match Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Match Result</Label>
          <div className="grid grid-cols-3 gap-2">
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
              Draw
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="evidence-upload">Upload Evidence</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm"
            >
              <Upload className="mr-1 h-3 w-3" />
              Add Files
            </Button>
          </div>
          
          <input
            type="file"
            id="evidence-upload"
            className="hidden"
            accept="image/*,video/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {evidenceFiles.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {evidenceFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="h-20 w-full bg-tacktix-dark-light rounded border border-tacktix-dark flex items-center justify-center">
                    <span className="text-xs text-white text-center p-2">
                      {file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
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
                Click to upload screenshots or videos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, MP4, or MOV (Max 10MB each)
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what happened in the match..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-tacktix-dark-deeper border-tacktix-dark-light"
          />
        </div>

        <div className="flex items-start space-x-2 text-sm text-blue-600 bg-blue-500/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Review Process</p>
            <p className="text-gray-400">Your submission will be reviewed by our team within 24 hours</p>
          </div>
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
            disabled={isSubmitting || evidenceFiles.length === 0}
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
      </CardContent>
    </Card>
  );
};

export default MatchResultSubmission;
