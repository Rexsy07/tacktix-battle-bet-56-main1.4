
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, MessageSquare, User, Loader2, Info, Eye, Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getMatchResult } from "@/utils/match-results-utils";
import { supabase } from "@/integrations/supabase/client";

interface MatchResultDisplayProps {
  matchId: string;
  hostId: string;
  opponentId: string | null;
}

const MatchResultDisplay = ({ matchId, hostId, opponentId }: MatchResultDisplayProps) => {
  const [result, setResult] = useState<any>(null);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch match result
        const { success, data } = await getMatchResult(matchId);
        
        if (success && data) {
          setResult(data);
        }
        
        // Fetch host profile
        if (hostId) {
          const { data: hostData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", hostId)
            .single();
          
          if (hostData) setHostProfile(hostData);
        }
        
        // Fetch opponent profile
        if (opponentId) {
          const { data: opponentData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", opponentId)
            .single();
          
          if (opponentData) setOpponentProfile(opponentData);
        }
      } catch (error) {
        console.error("Error fetching match result data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [matchId, hostId, opponentId]);

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.webm');
  };

  const isDataUrl = (url: string) => {
    return url.startsWith('data:');
  };

  const renderEvidence = (url: string, index: number) => {
    if (isDataUrl(url)) {
      // Handle base64 data URLs
      if (url.startsWith('data:image')) {
        return (
          <img 
            key={index}
            src={url} 
            alt={`Match evidence ${index + 1}`} 
            className="rounded border border-gray-700 w-full object-cover h-32 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.open(url, '_blank')}
          />
        );
      } else if (url.startsWith('data:video')) {
        return (
          <div key={index} className="relative">
            <video 
              src={url}
              className="rounded border border-gray-700 w-full object-cover h-32"
              controls
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="h-8 w-8 text-white opacity-70" />
            </div>
          </div>
        );
      }
    } else if (isVideoFile(url)) {
      // Handle video files from storage
      return (
        <div key={index} className="relative">
          <video 
            src={url}
            className="rounded border border-gray-700 w-full object-cover h-32"
            controls
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="h-8 w-8 text-white opacity-70" />
          </div>
        </div>
      );
    } else {
      // Handle image files from storage or other URLs
      return (
        <img 
          key={index}
          src={url} 
          alt={`Match evidence ${index + 1}`} 
          className="rounded border border-gray-700 w-full object-cover h-32 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => window.open(url, '_blank')}
          onError={(e) => {
            // Fallback for broken images
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300.png?text=Evidence+Unavailable';
          }}
        />
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (!result) {
    return (
      <div className="text-center py-8">
        <Info className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
        <h3 className="text-xl font-medium">No Results Available</h3>
        <p className="text-gray-400 mt-1">
          No match results have been submitted yet.
        </p>
      </div>
    );
  }
  
  const getProfileById = (id: string) => {
    if (hostProfile && hostProfile.id === id) return hostProfile;
    if (opponentProfile && opponentProfile.id === id) return opponentProfile;
    return null;
  };
  
  const submitterProfile = getProfileById(result.submitted_by);
  const winnerProfile = result.winner_id ? getProfileById(result.winner_id) : null;
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-tacktix-dark-light">
        <h3 className="text-lg font-medium mb-4">
          Match Result: {result.result_type.charAt(0).toUpperCase() + result.result_type.slice(1)}
        </h3>
        
        {winnerProfile && (
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium">
              Winner: {winnerProfile.username}
            </span>
          </div>
        )}
        
        {result.notes && (
          <div className="mt-2 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Notes:</h4>
            <p className="text-sm bg-tacktix-dark p-3 rounded">{result.notes}</p>
          </div>
        )}
        
        {result.proof_urls && result.proof_urls.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Evidence:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.proof_urls.map((url: string, index: number) => renderEvidence(url, index))}
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          Submitted by {submitterProfile?.username || "Unknown"} on {new Date(result.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MatchResultDisplay;
