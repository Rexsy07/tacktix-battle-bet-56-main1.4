
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateDisputeStatus } from "@/utils/moderator-utils";

interface Dispute {
  id: string;
  match_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter?: {
    username: string;
  };
}

const DisputeList = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          reporter:profiles!disputes_reported_by_fkey(username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error: any) {
      console.error("Error fetching disputes:", error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (disputeId: string, newStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const result = await updateDisputeStatus(disputeId, newStatus, undefined, undefined, session.user.id);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `Dispute ${newStatus} successfully`,
      });
      fetchDisputes();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update dispute",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Disputes ({disputes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disputes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No disputes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium capitalize">{dispute.reason.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-400">
                      Reported by: {dispute.reporter?.username || "Unknown"}
                    </p>
                  </div>
                  <Badge 
                    variant={dispute.status === 'open' ? 'destructive' : dispute.status === 'resolved' ? 'default' : 'secondary'}
                  >
                    {dispute.status}
                  </Badge>
                </div>
                
                {dispute.description && (
                  <p className="text-sm mb-3 text-gray-300">{dispute.description}</p>
                )}
                
                <div className="flex gap-2">
                  {dispute.status === 'open' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(dispute.id, 'investigating')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(dispute.id, 'resolved')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(dispute.id, 'dismissed')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeList;
