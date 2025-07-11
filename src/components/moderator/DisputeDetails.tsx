
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, User, MessageSquare, Calendar, Clock, AlertCircle, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DisputeDetailsProps {
  disputeId: string;
  onClose: () => void;
  onResolved: () => void;
}

const DisputeDetails = ({ disputeId, onClose, onResolved }: DisputeDetailsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dispute, setDispute] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [reporter, setReporter] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [resolution, setResolution] = useState("");
  const [resolutionAction, setResolutionAction] = useState("dismiss");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  
  useEffect(() => {
    fetchDisputeDetails();
  }, [disputeId]);
  
  const fetchDisputeDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch dispute
      const { data: disputeData, error: disputeError } = await supabase
        .from("disputes")
        .select("*")
        .eq("id", disputeId)
        .single();
      
      if (disputeError) throw disputeError;
      
      setDispute(disputeData);
      
      // Fetch match details
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", disputeData.match_id)
        .single();
      
      if (matchError) throw matchError;
      
      setMatch(matchData);
      
      // Fetch reporter
      const { data: reporterData, error: reporterError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", disputeData.reported_by)
        .single();
      
      if (reporterError) throw reporterError;
      
      setReporter(reporterData);
      
      // Determine opponent - need to handle the fact that host_id might not be in types
      const hostId = (matchData as any).host_id || matchData.created_by;
      const opponentId = reporterData.id === hostId 
        ? (matchData as any).opponent_id 
        : hostId;
      
      if (opponentId) {
        const { data: opponentData, error: opponentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", opponentId)
          .single();
        
        if (!opponentError) {
          setOpponent(opponentData);
        }
      }
      
      // Fetch evidence
      const { data: evidenceData, error: evidenceError } = await supabase
        .from("match_evidence")
        .select("*")
        .eq("match_id", disputeData.match_id);
      
      if (evidenceError) throw evidenceError;
      
      setEvidence(evidenceData || []);
      
      // Set admin notes if they exist
      setAdminNotes("");
      
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      toast({
        title: "Error",
        description: "Failed to load dispute details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResolveDispute = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in as a moderator");
      }
      
      // Update dispute using any type to bypass TypeScript issues
      const { error: updateError } = await supabase
        .from("disputes")
        .update({
          status: "resolved",
          resolution: resolution,
          resolved_by: session.user.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", disputeId);
      
      if (updateError) throw updateError;
      
      // If assigning win to a player
      if (resolutionAction === "assign_win_reporter" || resolutionAction === "assign_win_opponent") {
        const winnerId = resolutionAction === "assign_win_reporter" 
          ? reporter.id 
          : opponent?.id;
        
        if (winnerId) {
          // Update match winner
          const { error: matchUpdateError } = await supabase
            .from("matches")
            .update({
              winner_id: winnerId,
              status: "completed"
            } as any)
            .eq("id", match.id);
          
          if (matchUpdateError) throw matchUpdateError;
        }
      }
      
      toast({
        title: "Dispute Resolved",
        description: "The dispute has been successfully resolved",
        variant: "default",
      });
      
      onResolved();
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve dispute",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const viewEvidence = (evidence: any) => {
    setSelectedEvidence(evidence);
    setIsEvidenceDialogOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 animate-spin mb-4 mx-auto" />
          <CardTitle>Loading Dispute Details</CardTitle>
        </div>
      </Card>
    );
  }
  
  if (!dispute || !match) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4 mx-auto" />
          <CardTitle>Dispute Not Found</CardTitle>
          <CardDescription className="mt-2">The dispute could not be loaded</CardDescription>
          <Button variant="outline" className="mt-4" onClick={onClose}>Close</Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              Dispute #{dispute.id.slice(0, 8)}
            </CardTitle>
            <CardDescription>
              {formatDate(dispute.created_at)}
            </CardDescription>
          </div>
          
          <Badge variant={
            dispute.status === "pending" ? "outline" :
            dispute.status === "reviewing" ? "secondary" :
            "default"
          } className="text-xs py-1">
            {dispute.status === "pending" && "Pending Review"}
            {dispute.status === "reviewing" && "Under Review"}
            {dispute.status === "resolved" && "Resolved"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-tacktix-dark-light p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User size={16} />
                  Disputing User
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={reporter?.avatar_url} />
                    <AvatarFallback>{reporter?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{reporter?.username}</p>
                    <p className="text-xs text-gray-400">ID: {reporter?.id.slice(0, 8)}</p>
                  </div>
                </div>
                
                {opponent && (
                  <>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User size={16} />
                      Reported User
                    </h4>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={opponent?.avatar_url} />
                        <AvatarFallback>{opponent?.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{opponent?.username}</p>
                        <p className="text-xs text-gray-400">ID: {opponent?.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-tacktix-dark-light p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Match Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Match ID:</span>
                    <span>{match.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Game Mode:</span>
                    <span>{match.game_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span className="text-tacktix-blue">₦{match.entry_fee?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Match Status:</span>
                    <Badge variant={match.status === "completed" ? "default" : "outline"} className="text-xs">
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-tacktix-dark-light p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Dispute Reason
              </h4>
              <div className="p-3 bg-tacktix-dark-deeper rounded-md whitespace-pre-wrap">
                {dispute.reason}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="evidence" className="space-y-4">
            {evidence.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidence.map((item) => (
                  <div key={item.id} className="bg-tacktix-dark-light p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText size={16} />
                        {item.evidence_type === "pre_match" ? "Pre-Match Evidence" : "Post-Match Evidence"}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(item.created_at).split(',')[0]}
                      </Badge>
                    </div>
                    
                    <div className="border border-white/10 rounded-md p-3 mb-3 h-40 bg-tacktix-dark-deeper flex items-center justify-center">
                      {item.evidence_url ? (
                        <img 
                          src={item.evidence_url}
                          alt="Evidence"
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      ) : (
                        <p className="text-gray-400 text-sm">No evidence image</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => viewEvidence(item)}>
                        <Eye size={14} className="mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-tacktix-dark-light p-8 rounded-lg text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-3 mx-auto" />
                <h4 className="font-medium mb-2">No Evidence Submitted</h4>
                <p className="text-gray-400 text-sm">
                  No evidence has been submitted for this match
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resolution" className="space-y-4">
            <div className="bg-tacktix-dark-light p-4 rounded-lg">
              <h4 className="font-medium mb-3">Resolution Decision</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution-action">Action</Label>
                  <Select 
                    value={resolutionAction} 
                    onValueChange={setResolutionAction}
                    disabled={dispute.status === "resolved"}
                  >
                    <SelectTrigger id="resolution-action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dismiss">Dismiss Dispute</SelectItem>
                      <SelectItem value="assign_win_reporter">Assign Win to Reporter ({reporter?.username})</SelectItem>
                      {opponent && (
                        <SelectItem value="assign_win_opponent">Assign Win to Opponent ({opponent?.username})</SelectItem>
                      )}
                      <SelectItem value="refund">Refund Both Players</SelectItem>
                      <SelectItem value="warn">Issue Warning</SelectItem>
                      <SelectItem value="suspend">Suspend Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resolution-notes">Resolution Notes</Label>
                  <Textarea 
                    id="resolution-notes"
                    placeholder="Explain your decision..."
                    className="min-h-24"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    disabled={dispute.status === "resolved"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Internal Notes (Only visible to moderators)</Label>
                  <Textarea 
                    id="admin-notes"
                    placeholder="Add notes for other moderators..."
                    className="min-h-24"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {dispute.status === "resolved" && dispute.resolution && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-500">Dispute Resolved</h4>
                    <p className="text-sm mt-1">{dispute.resolution}</p>
                    <p className="text-xs text-gray-400 mt-2">Resolved on {formatDate(dispute.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/5 pt-4">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        
        {dispute.status !== "resolved" && (
          <Button 
            variant="gradient" 
            onClick={handleResolveDispute}
            disabled={isSubmitting || !resolution}
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve Dispute
              </>
            )}
          </Button>
        )}
      </CardFooter>
      
      <Dialog open={isEvidenceDialogOpen} onOpenChange={setIsEvidenceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvidence?.evidence_type === "pre_match" ? "Pre-Match Evidence" : "Post-Match Evidence"}
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedEvidence && formatDate(selectedEvidence.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-2 bg-tacktix-dark-deeper rounded-md">
            {selectedEvidence?.evidence_url ? (
              <img 
                src={selectedEvidence.evidence_url}
                alt="Evidence"
                className="max-h-[400px] max-w-full object-contain rounded"
              />
            ) : (
              <p className="text-gray-400 py-8">No evidence image available</p>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DisputeDetails;
