
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileInput } from "@/components/ui/file-input";
import { CheckCircle, Upload, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Add the prop types to match what's being passed in MatchDetails.tsx
interface MatchEvidenceProps {
  matchId: string;
  currentUserId?: string; // Make this optional since it might not always be passed
  matchStatus?: string; // Make this optional
}

// Update the component to handle the optional props
const MatchEvidence = ({ matchId, currentUserId, matchStatus }: MatchEvidenceProps) => {
  const { toast } = useToast();
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleFileChange = (file: File | null) => {
    setEvidenceFile(file);
  };
  
  const handleUpload = async () => {
    if (!evidenceFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be signed in to upload evidence");
      }
      
      // Upload file to Supabase storage
      const filePath = `match_evidence/${matchId}/${session.user.id}/${evidenceFile.name}`;
      const { data, error } = await supabase.storage
        .from('match-evidence')
        .upload(filePath, evidenceFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL of the uploaded file
      const publicURL = supabase.storage
        .from('match-evidence')
        .getPublicUrl(filePath).data.publicUrl;
      
      // Save evidence URL to database
      const { error: dbError } = await supabase
        .from("match_evidence")
        .insert({
          match_id: matchId,
          submitted_by: session.user.id,
          evidence_url: publicURL,
          evidence_type: "post_match" // Assuming post-match evidence
        });
      
      if (dbError) throw dbError;
      
      setUploadSuccess(true);
      toast({
        title: "Upload Successful",
        description: "Evidence has been uploaded successfully",
      });
      
      // Reset state after successful upload
      setTimeout(() => {
        setEvidenceFile(null);
        setUploadSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error("Error uploading evidence:", error);
      setUploadError(error.message || "Failed to upload evidence");
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload evidence",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const canUploadEvidence = matchStatus === "active" || matchStatus === "completed";
  
  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>Upload Match Evidence</CardTitle>
        <CardDescription>
          {canUploadEvidence ? (
            "Submit screenshots or videos to support your match result"
          ) : (
            "Evidence upload is only available during or after the match"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canUploadEvidence ? (
          <>
            <FileInput 
              file={evidenceFile}
              onFileChange={handleFileChange}
              disabled={uploading || uploadSuccess}
            />
            
            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={uploading || uploadSuccess || !evidenceFile}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Evidence
                </>
              )}
            </Button>
            
            {uploadError && (
              <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {uploadError}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-400">
            Evidence upload is only available when the match is in progress or completed.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEvidence;
