import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserActionsProps {
  userId: string;
  username: string;
  currentStatus: string;
  onActionComplete: () => void;
}

const UserActions = ({ userId, username, currentStatus, onActionComplete }: UserActionsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getAvailableActions = () => {
    switch (currentStatus) {
      case "active":
        return ["warn", "suspend", "ban"];
      case "warned":
        return ["remove_warning", "suspend", "ban"];
      case "suspended":
        return ["reinstate", "ban"];
      case "banned":
        return ["unban"];
      default:
        return ["warn", "suspend", "ban"];
    }
  };
  
  const handleOpenDialog = (actionType: string) => {
    setAction(actionType);
    setNotes("");
    setIsDialogOpen(true);
  };
  
  const handleSubmitAction = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in as a moderator");
      }
      
      // Determine new status
      let newStatus;
      switch (action) {
        case "warn":
          newStatus = "warned";
          break;
        case "suspend":
          newStatus = "suspended";
          break;
        case "ban":
          newStatus = "banned";
          break;
        case "remove_warning":
        case "reinstate":
        case "unban":
          newStatus = "active";
          break;
        default:
          newStatus = currentStatus;
      }
      
      // Create a dispute to record this action instead of using reports/moderator_actions
      const { data: disputeData, error: disputeError } = await supabase
        .from("disputes")
        .insert({
          match_id: "00000000-0000-0000-0000-000000000000", // Placeholder for non-match disputes
          reported_by: session.user.id,
          reason: `Administrative action: ${action}`,
          status: "resolved",
          resolution: notes,
          admin_notes: JSON.stringify({
            action_type: action,
            target_user_id: userId,
            moderator_id: session.user.id,
            details: notes
          })
        })
        .select()
        .single();
      
      if (disputeError) throw disputeError;
      
      toast({
        title: "Action Taken",
        description: `Successfully ${action.replace('_', ' ')}ed user ${username}`,
        variant: "default",
      });
      
      // Close dialog and refresh
      setIsDialogOpen(false);
      onActionComplete();
      
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform action",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getActionButton = () => {
    switch (currentStatus) {
      case "active":
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleOpenDialog("warn")}
          >
            Warn
          </Button>
        );
      case "warned":
        return (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleOpenDialog("suspend")}
          >
            Suspend
          </Button>
        );
      case "suspended":
        return (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleOpenDialog("ban")}
          >
            Ban
          </Button>
        );
      case "banned":
        return (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => handleOpenDialog("unban")}
          >
            Unban
          </Button>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleOpenDialog("warn")}
          >
            Warn
          </Button>
        );
    }
  };
  
  const getActionTitle = () => {
    switch (action) {
      case "warn":
        return "Issue Warning";
      case "suspend":
        return "Suspend User";
      case "ban":
        return "Ban User";
      case "remove_warning":
        return "Remove Warning";
      case "reinstate":
        return "Reinstate User";
      case "unban":
        return "Unban User";
      default:
        return "Take Action";
    }
  };
  
  const getActionDescription = () => {
    switch (action) {
      case "warn":
        return `You are about to issue a warning to ${username}. This will be recorded in their profile.`;
      case "suspend":
        return `You are about to suspend ${username}. They will not be able to participate in matches during suspension.`;
      case "ban":
        return `You are about to ban ${username}. This is a permanent action and will prevent them from using the platform.`;
      case "remove_warning":
        return `You are about to remove the warning from ${username}'s profile.`;
      case "reinstate":
        return `You are about to reinstate ${username}'s account. They will regain full access to the platform.`;
      case "unban":
        return `You are about to unban ${username}'s account. They will regain full access to the platform.`;
      default:
        return `You are about to take action on ${username}'s account.`;
    }
  };
  
  return (
    <>
      {getActionButton()}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-status">Current Status</Label>
              <div className="flex items-center gap-2">
                {currentStatus === "active" && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                )}
                {currentStatus === "warned" && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Warned
                  </Badge>
                )}
                {currentStatus === "suspended" && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    Suspended
                  </Badge>
                )}
                {currentStatus === "banned" && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Banned
                  </Badge>
                )}
              </div>
            </div>
            
            {action === "suspend" && (
              <div className="space-y-2">
                <Label htmlFor="suspension-duration">Suspension Duration</Label>
                <Select defaultValue="7">
                  <SelectTrigger id="suspension-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="action-notes">Notes <span className="text-gray-400">(Required)</span></Label>
              <Textarea 
                id="action-notes"
                placeholder="Explain the reason for this action..."
                className="min-h-24"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                These notes will be stored for administrative purposes.
              </p>
            </div>
            
            {(action === "ban" || action === "suspend") && (
              <div className="p-3 bg-tacktix-dark-light rounded-md flex items-start">
                <AlertCircle className="text-yellow-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  This action will {action === "ban" ? "permanently prevent" : "temporarily restrict"} the user from accessing the platform. Make sure you have reviewed all evidence before proceeding.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button 
              variant={action === "ban" ? "destructive" : "default"}
              onClick={handleSubmitAction}
              disabled={isSubmitting || !notes}
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserActions;
