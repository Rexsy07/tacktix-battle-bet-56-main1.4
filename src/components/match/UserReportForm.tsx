
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserReportFormProps {
  matchId: string;
  reportedUserId: string;
  reportedUsername: string;
  currentUserId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserReportForm = ({
  matchId,
  reportedUserId,
  reportedUsername,
  currentUserId,
  onSuccess,
  onCancel
}: UserReportFormProps) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reasonOptions = [
    { value: "cheating", label: "Cheating" },
    { value: "toxic_behavior", label: "Toxic Behavior" },
    { value: "poor_sportsmanship", label: "Poor Sportsmanship" },
    { value: "no_show", label: "No Show" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and provide a description",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert directly into disputes table (which exists in the database)
      const { error } = await supabase
        .from("disputes")
        .insert({
          match_id: matchId,
          reported_by: currentUserId,
          reason: reason,
          description: description.trim(),
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted and will be reviewed by our moderation team",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Report Player</h3>
        <p className="text-sm text-gray-400">Reporting: {reportedUsername}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Report</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasonOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Please provide details about the incident..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="bg-tacktix-dark-deeper border-tacktix-dark-light"
        />
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
        <p className="text-sm text-yellow-600">
          <strong>Important:</strong> False reports may result in penalties to your account. 
          Please only report genuine violations of our community guidelines.
        </p>
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
          disabled={isSubmitting || !reason || !description.trim()}
          variant="destructive"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserReportForm;
