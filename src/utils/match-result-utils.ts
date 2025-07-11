
import { supabase } from "@/integrations/supabase/client";

export const uploadMatchEvidence = async (
  matchId: string,
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> => {
  try {
    const urls: string[] = [];
    
    // Check if we have a storage bucket for match evidence
    const { data: buckets } = await supabase.storage.listBuckets();
    const evidenceBucket = buckets?.find(bucket => bucket.name === 'match-evidence');
    
    if (!evidenceBucket) {
      // If no storage bucket exists, we'll store the files as base64 data URLs
      // This is a fallback solution for when storage isn't configured
      console.log("No storage bucket found, using data URLs as fallback");
      for (const file of files) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      }
      return { urls };
    }
    
    // Upload files to Supabase Storage
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${matchId}/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('match-evidence')
        .upload(fileName, file);
      
      if (error) {
        console.error('Storage upload error:', error);
        // Fall back to data URL if storage fails
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      } else {
        // Get the public URL for the uploaded file
        const { data: publicUrl } = supabase.storage
          .from('match-evidence')
          .getPublicUrl(fileName);
        
        urls.push(publicUrl.publicUrl);
      }
    }
    
    return { urls };
  } catch (error: any) {
    console.error("Error uploading evidence:", error);
    return { urls: [], error: error.message };
  }
};

export const submitMatchResult = async (
  matchId: string,
  submittedBy: string,
  resultType: "win" | "loss" | "draw" | "dispute",
  winnerId: string | null,
  proofUrls: string[],
  notes: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("match_result_submissions")
      .insert({
        match_id: matchId,
        submitted_by: submittedBy,
        result_type: resultType,
        winner_id: winnerId,
        proof_urls: proofUrls,
        notes: notes || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting match result:", error);
    return { success: false, error: error.message };
  }
};

export const getMatchResult = async (matchId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("match_result_submissions")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching match result:", error);
    return { success: false, error: error.message };
  }
};

export interface MatchResultSubmission {
  id: string;
  match_id: string;
  submitted_by: string;
  result_type: "win" | "loss" | "draw" | "dispute";
  winner_id?: string;
  notes?: string;
  proof_urls?: string[];
  created_at: string;
}

export const getMatchResultSubmissions = async (): Promise<{
  data: MatchResultSubmission[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("match_result_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data: data as MatchResultSubmission[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
